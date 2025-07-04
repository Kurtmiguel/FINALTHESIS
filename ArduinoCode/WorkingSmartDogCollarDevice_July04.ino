#include <Arduino.h>
#include <HardwareSerial.h>
#include <WiFi.h>
#include <WebServer.h>
#include <TinyGPS++.h>
#include <ArduinoJson.h>
#include <SPIFFS.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <time.h>
#include <esp_wifi.h>

// GPS Pin Configuration
#define RXPin 14  // GPS TX pin
#define TXPin 12  // GPS RX pin

// Battery Monitoring Configuration
#define BATTERY_PIN 35  // GPIO 35 (Analog ADC1_CH7)
const float REFERENCE_VOLTAGE = 3.3;
const float ADC_RESOLUTION = 4095.0;
const float BATTERY_MAX_VOLTAGE = 4.2;  // Maximum voltage of LiPo battery
const float BATTERY_MIN_VOLTAGE = 3.0;  // Minimum safe voltage of LiPo battery
const float RESISTOR_RATIO = 3.2;  // Adjust based on your voltage divider (R1+R2)/R2

// Smoothing parameters for battery readings
const int NUM_READINGS = 10;
float readings[NUM_READINGS];
int readIndex = 0;
float total = 0;
float batteryPercentage = 0;

// WiFi Configuration - UPDATE THESE WITH YOUR NETWORK
const char* ssid = "DITO_60983_2.4_2";
const char* password = "MiguelArcAngel17";
const unsigned long WIFI_TIMEOUT_MS = 20000; // 20 seconds timeout for WiFi connection
const unsigned long WIFI_CHECK_INTERVAL = 10000; // Check WiFi every 10 seconds
unsigned long lastWiFiCheckTime = 0;
const int MAX_WIFI_RECONNECT_ATTEMPTS = 5; // Maximum reconnection attempts before reset
bool wifiFirstConnect = true;

// WiFi connection status
bool isWiFiConnected = false;
int wifiReconnectAttempts = 0;
unsigned long wifiReconnectStart = 0;

// API Configuration - UPDATED FOR MAIN SYSTEM INTEGRATION
const char* API_HOST = "192.168.8.100"; // Your main system IP address
const int API_PORT = 3000;
const char* API_ENDPOINT = "/api/gps-tracker";
const char* HEALTH_ENDPOINT = "/api/health";
const char* API_KEY = "gps_secure_key_2024_xyz123"; // Must match main system .env.local
const char* DEVICE_ID = "dog-collar-001"; // IMPORTANT: Register this ID in main system first!

// API connection status
bool apiConnected = true;
int apiRetryCount = 0;
const int MAX_API_RETRY = 3;
const long apiUpdateInterval = 5000; // Send data every 5 seconds
const long apiKeepAliveInterval = 30000; // Send a keepalive ping every 30 seconds
unsigned long lastApiKeepAlive = 0;
unsigned long lastApiUpdate = 0;

// Setup Hardware Serial for GPS
HardwareSerial GPSSerial(2);  //TX=GPIO12, RX=GPIO14
TinyGPSPlus gps;
WebServer server(80);

// Variables to store GPS data
float latitude = 0;
float longitude = 0;
bool gpsValid = false;

// Time variables for data updates
unsigned long lastGpsUpdate = 0;
unsigned long lastBatteryUpdate = 0;
const long gpsUpdateInterval = 2000;  // 2 seconds
const long batteryUpdateInterval = 10000; // 10 seconds

// Semaphore for HTTP client synchronization
SemaphoreHandle_t httpSemaphore = NULL;

// WiFi event handler task
TaskHandle_t wifiMonitorTaskHandle = NULL;
// API monitor task
TaskHandle_t apiMonitorTaskHandle = NULL;

// Function prototypes
void setupWiFi();
void reconnectWiFi();
void checkWiFiStatus();
void WiFiEvent(arduino_event_id_t event);
void wifiMonitorTask(void * parameter);
void apiMonitorTask(void * parameter);
bool sendToAPI(bool forceUpdate = false);
bool keepAliveAPI();

// Battery monitoring functions
float getBatteryVoltage() {
  // Read the analog value
  int adcValue = analogRead(BATTERY_PIN);
  
  // Calculate the actual voltage at the pin
  float pinVoltage = (adcValue / ADC_RESOLUTION) * REFERENCE_VOLTAGE;
  
  // Calculate the battery voltage using the voltage divider ratio
  float batteryVoltage = pinVoltage * RESISTOR_RATIO;
  
  return batteryVoltage;
}

int getBatteryPercentage(float voltage) {
  // Calculate percentage based on the battery voltage range
  float percentage = ((voltage - BATTERY_MIN_VOLTAGE) / (BATTERY_MAX_VOLTAGE - BATTERY_MIN_VOLTAGE)) * 100.0;
  
  // Constrain percentage between 0 and 100
  if (percentage > 100) {
    percentage = 100;
  } else if (percentage < 0) {
    percentage = 0;
  }
  
  return round(percentage);
}

float smoothVoltageReading(float newReading) {
  // Subtract the last reading
  total = total - readings[readIndex];
  // Add the new reading
  readings[readIndex] = newReading;
  total = total + readings[readIndex];
  // Advance to the next position in the array
  readIndex = (readIndex + 1) % NUM_READINGS;
  
  // Calculate the average
  return total / NUM_READINGS;
}

void updateBatteryLevel() {
  // Get raw battery voltage
  float rawVoltage = getBatteryVoltage();
  
  // Apply smoothing
  float smoothVoltage = smoothVoltageReading(rawVoltage);
  
  // Calculate battery percentage
  batteryPercentage = getBatteryPercentage(smoothVoltage);
  
  // Print results (less frequent logging to reduce serial output)
  if (millis() - lastBatteryUpdate >= batteryUpdateInterval) {
    Serial.print("🔋 Battery - Raw: ");
    Serial.print(rawVoltage, 2);
    Serial.print("V, Smooth: ");
    Serial.print(smoothVoltage, 2);
    Serial.print("V, Level: ");
    Serial.print(batteryPercentage);
    Serial.println("%");
    
    lastBatteryUpdate = millis();
  }
}

// Get current ISO8601 timestamp
String getISOTimeStamp() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("⚠️ Failed to obtain time, using current millis");
    // Fallback to a basic timestamp if NTP fails
    unsigned long currentTime = millis();
    return "2024-01-01T" + String(currentTime / 3600000) + ":" + String((currentTime / 60000) % 60) + ":" + String((currentTime / 1000) % 60) + "Z";
  }
  
  char timeStringBuff[30];
  strftime(timeStringBuff, sizeof(timeStringBuff), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  return String(timeStringBuff);
}

// KeepAlive ping to API to check connection
bool keepAliveAPI() {
  if (!isWiFiConnected) {
    Serial.println("📶 WiFi not connected, skipping API keepalive");
    return false;
  }

  if (xSemaphoreTake(httpSemaphore, (TickType_t)1000) == pdTRUE) {
    HTTPClient http;
    WiFiClient client;
    
    // Create health check URL
    String healthURL = "http://" + String(API_HOST) + ":" + String(API_PORT) + String(HEALTH_ENDPOINT);
    
    Serial.println("💓 Sending keepalive ping to Main System: " + healthURL);
    
    // Begin HTTP connection with timeout
    http.begin(client, healthURL);
    http.setTimeout(5000); // 5 second timeout for keepalive
    
    // Send a GET request (lightweight)
    int httpResponseCode = http.GET();
    
    // Check for successful response
    bool success = (httpResponseCode >= 200 && httpResponseCode < 300);
    
    if (success) {
      String response = http.getString();
      Serial.println("✅ Main System keepalive successful - Response: " + response);
      apiConnected = true;
      apiRetryCount = 0;
    } else {
      Serial.print("❌ Main System keepalive failed. Response code: ");
      Serial.println(httpResponseCode);
      if (httpResponseCode == -1) {
        Serial.println("   Connection timeout - Check if Main System is running");
      } else if (httpResponseCode == 404) {
        Serial.println("   Endpoint not found - Check API_HOST and port");
      }
      apiConnected = false;
      apiRetryCount++;
    }
    
    // Free resources
    http.end();
    
    xSemaphoreGive(httpSemaphore);
    return success;
  } else {
    Serial.println("⚠️ Failed to get HTTP semaphore for keepalive");
    return false;
  }
}

// Function to send data to Main System API - ENHANCED FOR MAIN SYSTEM INTEGRATION
bool sendToAPI(bool forceUpdate) {
  // If no WiFi connection, return immediately
  if (!isWiFiConnected) {
    Serial.println("📶 WiFi not connected, skipping API update");
    return false;
  }

  if (xSemaphoreTake(httpSemaphore, (TickType_t)5000) == pdTRUE) {
    // Create an HTTP client
    HTTPClient http;
    WiFiClient client;
    
    // Format the timestamp
    String timestamp = getISOTimeStamp();
    
    // Prepare the JSON payload - EXACTLY matching Main System API expectations
    DynamicJsonDocument doc(1024); // Increased size for safety
    doc["deviceId"] = DEVICE_ID;
    doc["latitude"] = latitude;
    doc["longitude"] = longitude;
    doc["gpsValid"] = gpsValid;
    doc["battery"] = (int)batteryPercentage; // Ensure integer
    doc["timestamp"] = timestamp;
    doc["uptime"] = (int)(millis() / 1000); // Uptime in seconds
    doc["wifiRSSI"] = WiFi.RSSI(); // WiFi signal strength
    
    String jsonPayload;
    serializeJson(doc, jsonPayload);
    
    // Create the API URL
    String apiURL = "http://" + String(API_HOST) + ":" + String(API_PORT) + String(API_ENDPOINT);
    
    Serial.println("📤 Sending GPS data to Main System (MongoDB)");
    Serial.println("🌐 URL: " + apiURL);
    Serial.println("📋 Payload: " + jsonPayload);
    
    // Begin HTTP connection with timeout
    http.begin(client, apiURL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-API-Key", API_KEY); // Security header
    http.setTimeout(10000); // 10 second timeout
    
    // Send the request
    int httpResponseCode = http.POST(jsonPayload);
    
    Serial.print("📊 HTTP Response code: ");
    Serial.println(httpResponseCode);
    
    // Enhanced response handling for Main System integration
    if (httpResponseCode >= 200 && httpResponseCode < 300) {
      String response = http.getString();
      Serial.println("✅ Main System update successful! Response: " + response);
      apiConnected = true;
      apiRetryCount = 0;
      lastApiUpdate = millis();
    } else {
      String errorResponse = http.getString();
      Serial.print("❌ Main System update failed. Code: ");
      Serial.print(httpResponseCode);
      Serial.println(", Response: " + errorResponse);
      
      // Detailed error diagnostics for Main System
      if (httpResponseCode == -1) {
        Serial.println("   🔍 Diagnosis: Connection timeout");
        Serial.println("   💡 Check: Is Main System running on " + String(API_HOST) + ":" + String(API_PORT) + "?");
      } else if (httpResponseCode == 401) {
        Serial.println("   🔍 Diagnosis: Authentication failed");
        Serial.println("   💡 Check: API_KEY mismatch between Arduino and Main System .env.local");
      } else if (httpResponseCode == 404) {
        Serial.println("   🔍 Diagnosis: Device not found or inactive");
        Serial.println("   💡 Check: Register device '" + String(DEVICE_ID) + "' in Main System first!");
        Serial.println("   📱 Go to Main System dashboard and create device with this ID");
      } else if (httpResponseCode == 500) {
        Serial.println("   🔍 Diagnosis: Server error");
        Serial.println("   💡 Check: Main System console for error details");
      }
      
      apiConnected = false;
      apiRetryCount++;
    }
    
    // Free resources
    http.end();
    
    xSemaphoreGive(httpSemaphore);
    return (httpResponseCode >= 200 && httpResponseCode < 300);
  } else {
    Serial.println("⚠️ Failed to get HTTP semaphore");
    return false;
  }
}

// HTML content for ESP32 web interface - UPDATED FOR MAIN SYSTEM INTEGRATION
const char HTML_CONTENT[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🐕 Smart Dog Collar - Main System</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; }
    .card { background-color: #ffffff; border-radius: 10px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    h1 { color: #1f2937; text-align: center; margin-bottom: 10px; }
    .subtitle { text-align: center; color: #6b7280; margin-bottom: 30px; }
    .data-item { margin: 15px 0; display: flex; justify-content: space-between; align-items: center; }
    .label { font-weight: bold; color: #4b5563; }
    .value { color: #1f2937; font-size: 1.1em; }
    .battery { height: 25px; background-color: #e5e7eb; border-radius: 12px; margin-top: 8px; position: relative; overflow: hidden; }
    .battery-level { height: 25px; background-color: #10b981; border-radius: 12px; width: 0%; transition: width 0.5s ease; }
    .status { padding: 15px; border-radius: 8px; background-color: #f3f4f6; margin-top: 15px; text-align: center; }
    .warning { color: #ef4444; }
    .success { color: #10b981; }
    .info { color: #3b82f6; }
    #refresh-button { 
      background-color: #3b82f6; 
      color: white; 
      border: none; 
      padding: 12px 24px; 
      border-radius: 8px; 
      cursor: pointer; 
      font-size: 16px;
      width: 100%;
      margin-top: 20px;
      transition: background-color 0.3s;
    }
    #refresh-button:hover { background-color: #2563eb; }
    .status-indicator {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 8px;
    }
    .status-connected { background-color: #10b981; }
    .status-disconnected { background-color: #ef4444; }
    .main-system-info {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .device-info {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🐕 Smart Dog Collar</h1>
    <div class="subtitle">Connected to Barangay Canine Management System</div>
    
    <div class="main-system-info">
      <h3 style="margin: 0 0 10px 0;">🏠 Main System Integration</h3>
      <p style="margin: 0;">This collar is connected to your Barangay Canine Management System with full user authentication and device management.</p>
    </div>
    
    <div class="device-info">
      <h3 style="margin: 0 0 10px 0;">📱 Device Registration Required</h3>
      <p style="margin: 0 0 5px 0;"><strong>Device ID:</strong> dog-collar-001</p>
      <p style="margin: 0; font-size: 0.9em;">⚠️ Make sure this device is registered in your Main System dashboard first!</p>
    </div>
    
    <div class="card">
      <h2 style="margin-top: 0;">🔋 Battery Status</h2>
      <div class="data-item">
        <span class="label">Battery Level:</span>
        <span class="value" id="battery-value">Loading...</span>
      </div>
      <div class="battery">
        <div class="battery-level" id="battery-level"></div>
      </div>
    </div>
    
    <div class="card">
      <h2 style="margin-top: 0;">🛰️ GPS Information</h2>
      <div class="data-item">
        <span class="label">GPS Status:</span>
        <span class="value" id="gps-status">Checking...</span>
      </div>
      <div class="data-item">
        <span class="label">Latitude:</span>
        <span class="value" id="latitude">--</span>
      </div>
      <div class="data-item">
        <span class="label">Longitude:</span>
        <span class="value" id="longitude">--</span>
      </div>
      <div class="status info">
        <p>📍 View live tracking in your Main System dashboard after logging in</p>
        <p><strong>Dashboard URL:</strong> http://)" + String(API_HOST) + R"(:3000/dashboard/monitoring</p>
      </div>
    </div>
    
    <div class="card">
      <h2 style="margin-top: 0;">🌐 Connection Status</h2>
      <div class="data-item">
        <span class="label">WiFi:</span>
        <span class="value">
          <span class="status-indicator" id="wifi-indicator"></span>
          <span id="wifi-status">Unknown</span>
        </span>
      </div>
      <div class="data-item">
        <span class="label">Main System API:</span>
        <span class="value">
          <span class="status-indicator" id="api-indicator"></span>
          <span id="api-status">Unknown</span>
        </span>
      </div>
      <div class="data-item">
        <span class="label">Database Sync:</span>
        <span class="value" id="last-api">Never</span>
      </div>
    </div>
    
    <button id="refresh-button" onclick="refreshData()">🔄 Refresh Data</button>
    <p style="text-align: center; color: #6b7280; margin-top: 20px;">
      <small>Auto-refresh every 5 seconds | Device ID: )" + String(DEVICE_ID) + R"(</small>
    </p>
  </div>

  <script>
    const fetchInterval = 5000;
    
    function updateDisplay(data) {
      // Update battery display
      document.getElementById('battery-value').textContent = data.battery + '%';
      document.getElementById('battery-level').style.width = data.battery + '%';
      
      // Change battery color based on level
      const batteryLevelElement = document.getElementById('battery-level');
      if (data.battery < 20) {
        batteryLevelElement.style.backgroundColor = '#ef4444';
      } else if (data.battery < 50) {
        batteryLevelElement.style.backgroundColor = '#f59e0b';
      } else {
        batteryLevelElement.style.backgroundColor = '#10b981';
      }
      
      // Update GPS status
      const gpsStatusElement = document.getElementById('gps-status');
      if (data.gpsValid) {
        gpsStatusElement.textContent = '✅ Valid GPS Signal';
        gpsStatusElement.className = 'success';
        document.getElementById('latitude').textContent = data.lat.toFixed(6);
        document.getElementById('longitude').textContent = data.lng.toFixed(6);
      } else {
        gpsStatusElement.textContent = '❌ No GPS Signal';
        gpsStatusElement.className = 'warning';
        document.getElementById('latitude').textContent = '--';
        document.getElementById('longitude').textContent = '--';
      }
      
      // Update WiFi status
      const wifiIndicator = document.getElementById('wifi-indicator');
      const wifiStatus = document.getElementById('wifi-status');
      if (data.wifiConnected) {
        wifiStatus.textContent = '✅ Connected (' + data.wifiRSSI + ' dBm)';
        wifiIndicator.className = 'status-indicator status-connected';
      } else {
        wifiStatus.textContent = '❌ Disconnected';
        wifiIndicator.className = 'status-indicator status-disconnected';
      }
      
      // Update API status
      const apiIndicator = document.getElementById('api-indicator');
      const apiStatus = document.getElementById('api-status');
      if (data.apiConnected) {
        apiStatus.textContent = '✅ Connected to Main System';
        apiIndicator.className = 'status-indicator status-connected';
      } else {
        apiStatus.textContent = '❌ Disconnected from Main System';
        apiIndicator.className = 'status-indicator status-disconnected';
      }
      
      if (data.lastApiUpdate && data.lastApiUpdate !== 'Never') {
        const date = new Date();
        document.getElementById('last-api').textContent = '✅ ' + date.toLocaleTimeString();
      } else {
        document.getElementById('last-api').textContent = '❌ Never synced';
      }
    }
    
    function fetchData() {
      fetch('/data')
        .then(response => response.json())
        .then(data => {
          updateDisplay(data);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    }
    
    function refreshData() {
      document.getElementById('refresh-button').textContent = '🔄 Refreshing...';
      fetchData();
      setTimeout(() => {
        document.getElementById('refresh-button').textContent = '🔄 Refresh Data';
      }, 1000);
    }
    
    // Initial fetch
    fetchData();
    
    // Set up automatic refresh
    setInterval(fetchData, fetchInterval);
  </script>
</body>
</html>
)rawliteral";

// Handle root path - serve the HTML page
void handleRoot() {
  server.send(200, "text/html", HTML_CONTENT);
}

// Handle data request - return GPS and battery info as JSON
void handleData() {
  char jsonResponse[512];
  DynamicJsonDocument doc(512);
  
  doc["lat"] = latitude;
  doc["lng"] = longitude;
  doc["gpsValid"] = gpsValid;
  doc["battery"] = batteryPercentage;
  doc["wifiConnected"] = isWiFiConnected;
  doc["wifiRSSI"] = WiFi.RSSI();
  doc["apiConnected"] = apiConnected;
  doc["lastApiUpdate"] = lastApiUpdate > 0 ? "Connected" : "Never";
  
  serializeJson(doc, jsonResponse, sizeof(jsonResponse));
  server.send(200, "application/json", jsonResponse);
}

// Update GPS data
void updateGPS() {
  unsigned long gpsStartTime = millis();
  
  // Process all available GPS data
  while (GPSSerial.available() > 0 && (millis() - gpsStartTime < 100)) {
    if (gps.encode(GPSSerial.read())) {
      if (gps.location.isValid()) {
        latitude = gps.location.lat();
        longitude = gps.location.lng();
        gpsValid = true;
        
        // Print GPS data (less frequent to reduce serial output load)
        if (millis() - lastGpsUpdate >= gpsUpdateInterval) {
          Serial.print("🛰️ GPS - Lat: ");
          Serial.print(latitude, 6);
          Serial.print(", Lng: ");
          Serial.print(longitude, 6);
          Serial.print(" (Valid: ");
          Serial.print(gpsValid ? "YES" : "NO");
          Serial.println(")");
          
          lastGpsUpdate = millis();
        }
      } else {
        if (millis() - lastGpsUpdate >= gpsUpdateInterval) {
          Serial.println("🛰️ GPS location not valid - waiting for signal...");
          gpsValid = false;
          lastGpsUpdate = millis();
        }
      }
    }
  }
  
  // If no GPS data received for a while, mark as invalid
  if (millis() - lastGpsUpdate > 30000) { // 30 seconds without GPS
    gpsValid = false;
  }
}

// API monitoring task - ENHANCED FOR MAIN SYSTEM
void apiMonitorTask(void* parameter) {
  while(true) {
    if (isWiFiConnected) {
      // Check if it's time for a full update
      if (millis() - lastApiUpdate >= apiUpdateInterval) {
        // Always send data, even if GPS is invalid (for debugging)
        bool success = sendToAPI(true);
        if (!success) {
          Serial.println("🔄 Retrying Main System connection in next cycle...");
        }
      } 
      // Check if it's time for a keepalive
      else if (millis() - lastApiKeepAlive >= apiKeepAliveInterval) {
        keepAliveAPI();
        lastApiKeepAlive = millis();
      }

      // If API connection is lost, attempt more aggressive reconnection
      if (!apiConnected && apiRetryCount < MAX_API_RETRY) {
        Serial.println("🔄 Main System connection lost, attempting immediate reconnection");
        sendToAPI(true);
      }
    } else {
      Serial.println("📶 Waiting for WiFi connection to send data to Main System...");
    }
    
    // Give other tasks a chance to run
    delay(1000);
  }
}

// WiFi event handler - critical for proper WiFi event handling
void WiFiEvent(arduino_event_id_t event) {
  Serial.printf("[WiFi-event] event: %d\n", event);
  
  switch (event) {
    case ARDUINO_EVENT_WIFI_READY:
      Serial.println("📶 WiFi interface ready");
      break;
    case ARDUINO_EVENT_WIFI_STA_START:
      Serial.println("📶 WiFi client started");
      break;
    case ARDUINO_EVENT_WIFI_STA_CONNECTED:
      Serial.println("📶 Connected to access point");
      break;
    case ARDUINO_EVENT_WIFI_STA_GOT_IP:
      Serial.println("✅ WiFi connected! IP address: ");
      Serial.println(WiFi.localIP());
      Serial.println("🌐 Main System API target: http://" + String(API_HOST) + ":" + String(API_PORT));
      isWiFiConnected = true;
      wifiReconnectAttempts = 0;
      
      // Initialize time with NTP after getting IP
      configTime(0, 0, "pool.ntp.org");
      Serial.println("⏰ Syncing time with NTP...");
      
      // Try to send data to API immediately after getting IP
      delay(2000); // Wait for NTP sync
      Serial.println("📤 Attempting initial Main System connection...");
      sendToAPI(true);
      break;
    case ARDUINO_EVENT_WIFI_STA_DISCONNECTED:
      Serial.println("❌ Disconnected from WiFi access point");
      isWiFiConnected = false;
      apiConnected = false;
      break;
    default:
      break;
  }
}

// Monitor task to handle WiFi connection
void wifiMonitorTask(void * parameter) {
  while(true) {
    if (WiFi.status() != WL_CONNECTED) {
      if (isWiFiConnected) {
        Serial.println("❌ WiFi connection lost!");
        isWiFiConnected = false;
        apiConnected = false;
      }
      
      if (millis() - wifiReconnectStart > WIFI_CHECK_INTERVAL) {
        wifiReconnectStart = millis();
        reconnectWiFi();
      }
    } else {
      if (!isWiFiConnected) {
        Serial.println("✅ WiFi connection restored!");
        isWiFiConnected = true;
        wifiReconnectAttempts = 0;
        
        // Try to reconnect to API immediately
        delay(1000);
        sendToAPI(true);
      }
    }
    
    // WiFi keepalive
    if (isWiFiConnected && millis() - lastWiFiCheckTime > WIFI_CHECK_INTERVAL) {
      lastWiFiCheckTime = millis();
      
      // Ping gateway to keep connection alive
      IPAddress gateway = WiFi.gatewayIP();
      if (gateway) {
        WiFiClient client;
        client.connect(gateway, 80);
        delay(10);
        client.stop();
      }
    }
    
    delay(1000);
  }
}

// Function to reconnect to WiFi
void reconnectWiFi() {
  wifiReconnectAttempts++;
  
  Serial.print("🔄 Reconnecting to WiFi (attempt ");
  Serial.print(wifiReconnectAttempts);
  Serial.print("/");
  Serial.print(MAX_WIFI_RECONNECT_ATTEMPTS);
  Serial.println(")");
  
  WiFi.disconnect(true);
  delay(1000);
  
  WiFi.begin(ssid, password);
  
  unsigned long startAttemptTime = millis();
  while (WiFi.status() != WL_CONNECTED && 
         millis() - startAttemptTime < WIFI_TIMEOUT_MS) {
    delay(500);
    Serial.print(".");
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi reconnected successfully!");
    Serial.print("📍 IP Address: ");
    Serial.println(WiFi.localIP());
    isWiFiConnected = true;
    wifiReconnectAttempts = 0;
  } else {
    Serial.println("\n❌ Failed to reconnect to WiFi!");
    
    if (wifiReconnectAttempts >= MAX_WIFI_RECONNECT_ATTEMPTS) {
      Serial.println("🔄 Maximum reconnection attempts reached. Restarting ESP32...");
      delay(1000);
      ESP.restart();
    }
  }
}

// Setup WiFi with better parameters for stability
void setupWiFi() {
  WiFi.onEvent(WiFiEvent);
  esp_wifi_set_ps(WIFI_PS_NONE);
  WiFi.mode(WIFI_STA);
  WiFi.setTxPower(WIFI_POWER_19_5dBm);
  
  Serial.println("📶 Connecting to WiFi: " + String(ssid));
  WiFi.begin(ssid, password);
  
  unsigned long startAttemptTime = millis();
  
  while (WiFi.status() != WL_CONNECTED && 
         millis() - startAttemptTime < WIFI_TIMEOUT_MS) {
    delay(500);
    Serial.print(".");
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi connected successfully!");
    Serial.print("📍 Local IP: ");
    Serial.println(WiFi.localIP());
    Serial.println("🌐 Target Main System: http://" + String(API_HOST) + ":" + String(API_PORT));
    Serial.println("🔑 API Key: " + String(API_KEY));
    Serial.println("📱 Device ID: " + String(DEVICE_ID) + " (MUST be registered in Main System!)");
    isWiFiConnected = true;
  } else {
    Serial.println("\n❌ Failed to connect to WiFi during setup!");
    isWiFiConnected = false;
  }
  
  // Create monitoring tasks
  xTaskCreate(wifiMonitorTask, "WiFiMonitor", 4096, NULL, 1, &wifiMonitorTaskHandle);
  xTaskCreate(apiMonitorTask, "APIMonitor", 4096, NULL, 1, &apiMonitorTaskHandle);
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n🚀 Smart Dog Collar GPS Tracker Starting...");
  Serial.println("🏠 Target: Barangay Canine Management System");
  Serial.println("📱 Device ID: " + String(DEVICE_ID));
  Serial.println("⚠️  IMPORTANT: Register this device in Main System first!");
  Serial.println("===========================================");

  // Create semaphore for HTTP client synchronization
  httpSemaphore = xSemaphoreCreateMutex();

  // Initialize battery monitoring
  analogReadResolution(12);
  pinMode(BATTERY_PIN, INPUT);
  
  // Initialize the readings array for battery smoothing
  for (int i = 0; i < NUM_READINGS; i++) {
    readings[i] = 0;
  }
  
  // Initialize GPS
  Serial.println("🛰️ Starting GPS module...");
  GPSSerial.begin(9600, SERIAL_8N1, RXPin, TXPin);
  Serial.println("✅ GPS module initialized on pins RX:" + String(RXPin) + " TX:" + String(TXPin));
  
  // Start SPIFFS
  if(!SPIFFS.begin(true)){
    Serial.println("❌ Error mounting SPIFFS");
  } else {
    Serial.println("✅ SPIFFS mounted successfully");
  }

  // Initialize WiFi
  setupWiFi();

  // Define server routes
  server.on("/", handleRoot);
  server.on("/data", handleData);
  
  // Start the web server
  server.begin();
  Serial.println("🌐 HTTP server started on: http://" + WiFi.localIP().toString());
  Serial.println("===========================================");
  Serial.println("✅ Initialization complete!");
  Serial.println("📱 ESP32 Interface: http://" + WiFi.localIP().toString());
  Serial.println("💻 Main System Dashboard: http://" + String(API_HOST) + ":3000");
  Serial.println("🔄 Data will be sent to Main System every 5 seconds");
  Serial.println("📋 Registration: Create device '" + String(DEVICE_ID) + "' in Main System");
  Serial.println("===========================================");
  
  // Initial API connection attempt
  if (isWiFiConnected) {
    delay(2000); // Wait for everything to settle
    Serial.println("📤 Sending initial GPS data to Main System...");
    sendToAPI(true);
  }
}

void loop() {
  // Handle client requests
  server.handleClient();
  
  // Update GPS data
  updateGPS();
  
  // Update battery level
  updateBatteryLevel();
  
  // Small delay to prevent watchdog timeout
  delay(10);
}