#include <Arduino.h>
#include <HardwareSerial.h>
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <TinyGPS++.h>

// GPS Pin Configuration
#define RXPin 14  // Verify this pin number for your GPS NEO6M STM32 board connection
#define TXPin 12  // Verify this pin number for your GPS NEO6M STM32 board connection

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

// WiFi Configuration
const char* ssid = "GlobeAtHome_630CA_2.4";
const char* password = "kEUJ7sGs";

// Setup Hardware Serial for GPS
HardwareSerial GPSSerial(2);  //TX=GPIO12, RX=GPIO14
TinyGPSPlus gps;
AsyncWebServer server(80);

// HTML template to display the GPS data and Firebase integration
String getHTML() {
  return "<!DOCTYPE html>"
         "<html lang=\"en\">"
         "<head>"
         "<meta charset=\"UTF-8\">"
         "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"
         "<title>GPS Tracker</title>"
         "<link href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css\" rel=\"stylesheet\">"
         "</head>"
         "<body>"
         "<div class=\"container\">"
         "<h1>GPS Tracker</h1>"
         "<p id=\"gps-data\">Loading GPS Data...</p>"
         "<p id=\"battery-level\">Loading Battery Level...</p>"
         "</div>"
         "<script src=\"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js\"></script>"
         "<script src=\"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js\"></script>"
         "<script type=\"module\">"
         "import { initializeApp } from \"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js\";"
         "import { getFirestore, collection, addDoc } from \"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js\";"
         "const firebaseConfig = {"
         "  apiKey: \"AIzaSyCcwfVWOsPELOyYduYiZ58C7bSULg3T768\","
         "  authDomain: \"bcms-3f035.firebaseapp.com\","
         "  projectId: \"bcms-3f035\","
         "  storageBucket: \"bcms-3f035.firebaseapp.com\","
         "  messagingSenderId: \"514152236762\","
         "  appId: \"1:514152236762:web:ad171aa924a293c7b5c7e3\""
         "};"
         "const app = initializeApp(firebaseConfig);"
         "const db = getFirestore(app);"
         "const dogsCollection = collection(db, \"dogs-tracker\");"
         "function updateData(lat, lng, batteryLevel) {"
         "  document.getElementById(\"gps-data\").textContent = `Latitude: ${lat}, Longitude: ${lng}`;"
         "  document.getElementById(\"battery-level\").textContent = `Battery: ${batteryLevel}%`;"
         "  addDoc(dogsCollection, {"
         "    device_id: \"sample\","
         "    latitude: lat,"
         "    longitude: lng,"
         "    battery: batteryLevel,"
         "    timestamp: new Date().toISOString()"
         "  });"
         "} "
         "setInterval(() => {"
         "  fetch(\"/data\").then(response => response.json()).then(data => {"
         "    updateData(data.lat, data.lng, data.battery);"
         "  });"
         "}, 2000);"
         "</script>"
         "</body>"
         "</html>";
}

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
  
  // Print results
  Serial.print("Raw Voltage: ");
  Serial.print(rawVoltage, 2);
  Serial.print("V, Smoothed Voltage: ");
  Serial.print(smoothVoltage, 2);
  Serial.print("V, Battery: ");
  Serial.print(batteryPercentage);
  Serial.println("%");
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Initialize battery monitoring
  analogReadResolution(12);
  pinMode(BATTERY_PIN, INPUT);
  
  // Initialize the readings array for battery smoothing
  for (int i = 0; i < NUM_READINGS; i++) {
    readings[i] = 0;
  }
  
  // Initialize GPS
  GPSSerial.begin(9600, SERIAL_8N1, RXPin, TXPin);  

  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("WiFi connected.");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // Serve the HTML page to the client
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    String html = getHTML();  // Get HTML dynamically
    request->send(200, "text/html", html);
  });

  // Route to get all data (GPS + battery) in JSON format
  server.on("/data", HTTP_GET, [](AsyncWebServerRequest *request){
    String json = "{";
    if (gps.location.isValid()) {
      json += "\"lat\": " + String(gps.location.lat(), 6) + ", ";
      json += "\"lng\": " + String(gps.location.lng(), 6) + ", ";
    } else {
      json += "\"lat\": 0, ";
      json += "\"lng\": 0, ";
    }
    json += "\"battery\": " + String(batteryPercentage, 1);
    json += "}";
    request->send(200, "application/json", json);
  });

  // Still keep the old GPS endpoint for compatibility
  server.on("/gps", HTTP_GET, [](AsyncWebServerRequest *request){
    String json = "{";
    if (gps.location.isValid()) {
      json += "\"lat\": " + String(gps.location.lat(), 6) + ", ";
      json += "\"lng\": " + String(gps.location.lng(), 6);
    } else {
      json += "\"lat\": 0, ";
      json += "\"lng\": 0";
    }
    json += "}";
    request->send(200, "application/json", json);
  });

  server.begin();
  Serial.println("HTTP server started.");
  Serial.println("GPS and Battery Monitoring active.");
}

void loop() {
  // Read GPS data
  while (GPSSerial.available() > 0) {
    if (gps.encode(GPSSerial.read())) {
      if (gps.location.isValid()) {
        Serial.print("Latitude: ");
        Serial.print(gps.location.lat(), 6);
        Serial.print(" | Longitude: ");
        Serial.println(gps.location.lng(), 6);
      } else {
        Serial.println("GPS location not valid.");
      }
    }
  }
  
  // Update battery level
  updateBatteryLevel();
  
  delay(1000);
}