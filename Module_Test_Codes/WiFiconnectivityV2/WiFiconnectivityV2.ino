#include <WiFi.h>
#include <WebServer.h>
#include <EEPROM.h>
#include <DNSServer.h>

// Access Point settings
const char* ap_ssid = "ESP32_Setup";  // Name of the ESP32 Access Point
const char* ap_password = "setuppass"; // Password for the Access Point

// EEPROM settings for storing WiFi credentials
#define EEPROM_SIZE 512             // Size of EEPROM to use
#define SSID_ADDR 0                 // Starting address for SSID storage
#define PASS_ADDR 64                // Starting address for password storage
#define WIFI_CONFIG_FLAG_ADDR 128   // Address for the config flag

// Web server and DNS server initialization
WebServer server(80);               // Web server on port 80
DNSServer dnsServer;                // DNS server for captive portal

// WiFi variables
char ssid[64] = "";                 // Buffer to store SSID
char password[64] = "";             // Buffer to store password
int numNetworks = 0;                // Number of networks found during scan
String networks[50];                // Array to store network names
int networkRSSI[50];                // Array to store signal strengths
int networkEnc[50];                 // Array to store encryption types
String ipAddress = "";              // Store the assigned IP address

// Reset button pin
const int RESET_BUTTON_PIN = 0;  // GPIO0 button on most ESP32 dev boards (change as needed)
bool lastButtonState = HIGH;     // Last read button state (assuming pull-up)
unsigned long lastDebounceTime = 0;  // Last time the button state changed
unsigned long debounceDelay = 50;    // Debounce time in milliseconds

void setup() {
  Serial.begin(115200);             // Initialize serial communication
  delay(500);                       // Short delay for serial to initialize
  
  Serial.println("\n\nESP32 WiFi Manager Starting...");
  
  // Initialize reset button pin
  pinMode(RESET_BUTTON_PIN, INPUT_PULLUP);
  
  // Initialize EEPROM for storing WiFi credentials
  EEPROM.begin(EEPROM_SIZE);
  
  // Check if WiFi is configured and try to connect
  if (checkSavedWiFi()) {
    // Connected successfully to saved network
    setupConnectedServer();
    return;
  }
  
  // If we reach here, need to set up AP mode for configuration
  setupAccessPoint();
}

void loop() {
  // Check reset button
  checkResetButton();
  
  // Handle DNS and web server when in AP mode
  if (WiFi.getMode() == WIFI_AP || WiFi.getMode() == WIFI_AP_STA) {
    dnsServer.processNextRequest();
    server.handleClient();
  } else if (WiFi.status() == WL_CONNECTED) {
    // Handle web server in connected mode
    server.handleClient();
  }
  
  // Your main application code would go here
  delay(10); // Small delay to prevent watchdog resets
}

// Check if the reset button is pressed
void checkResetButton() {
  // Read the current state of the button
  bool reading = digitalRead(RESET_BUTTON_PIN);
  
  // Debounce the button
  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }
  
  // If the button state is stable and enough time has passed for debounce
  if ((millis() - lastDebounceTime) > debounceDelay) {
    // If the button is pressed (LOW due to pull-up resistor)
    if (reading == LOW) {
      // Reset WiFi settings
      Serial.println("Reset button pressed - clearing WiFi settings");
      EEPROM.write(WIFI_CONFIG_FLAG_ADDR, 0);
      EEPROM.commit();
      
      // Flash LED if available or use Serial for feedback
      Serial.println("WiFi settings cleared. Restarting device...");
      
      // Small delay to ensure EEPROM is written and message is sent
      delay(1000);
      
      // Restart the ESP32
      ESP.restart();
    }
  }
  
  // Update the button state
  lastButtonState = reading;
}

// Function to check and connect to saved WiFi
bool checkSavedWiFi() {
  if (EEPROM.read(WIFI_CONFIG_FLAG_ADDR) == 1) {
    Serial.println("Found saved WiFi credentials, attempting to connect...");
    
    // Read saved credentials from EEPROM
    for (int i = 0; i < 64; i++) {
      ssid[i] = EEPROM.read(SSID_ADDR + i);
      password[i] = EEPROM.read(PASS_ADDR + i);
    }
    
    Serial.print("Connecting to: ");
    Serial.println(ssid);
    
    // Try to connect with the saved credentials
    WiFi.mode(WIFI_STA);
    
    // Connect using DHCP (automatic IP assignment)
    WiFi.begin(ssid, password);
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
      delay(500);
      Serial.print(".");
      attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\nConnected successfully!");
      ipAddress = WiFi.localIP().toString();
      Serial.print("IP address: ");
      Serial.println(ipAddress);
      return true;
    } else {
      Serial.println("\nFailed to connect with saved credentials");
      return false;
    }
  }
  return false;
}

// Setup web server when connected to WiFi
void setupConnectedServer() {
  // Set up a simple web server to show connected status
  server.on("/", HTTP_GET, handleConnectedRoot);
  server.on("/reset", HTTP_GET, handleReset);
  server.begin();
  Serial.println("Connected mode server started");
  
  // Print IP address info to serial for reference
  Serial.println("\n==================================");
  Serial.println("ESP32 is connected to WiFi network");
  Serial.print("Network: ");
  Serial.println(ssid);
  Serial.print("IP Address: ");
  Serial.println(ipAddress);
  Serial.println("To check your device status, open a browser and go to:");
  Serial.print("http://");
  Serial.println(ipAddress);
  Serial.println("==================================\n");
  Serial.println("Press the reset button to clear WiFi settings");
}

// Handler for root page when connected to WiFi
void handleConnectedRoot() {
  String html = "<!DOCTYPE html><html>"
                "<head><meta name='viewport' content='width=device-width, initial-scale=1.0'>"
                "<meta charset='UTF-8'>"
                "<title>ESP32 Status</title>"
                "<style>"
                "body{font-family:Arial,sans-serif;margin:0;padding:20px;text-align:center;background:#f7f7f7;}"
                ".container{max-width:400px;margin:0 auto;background:white;border-radius:10px;padding:20px;box-shadow:0 2px 10px rgba(0,0,0,0.1);}"
                "h1{color:#333;}"
                ".status{color:#4CAF50;font-weight:bold;font-size:18px;margin:20px 0;}"
                ".network-info{background:#f1f8e9;border-radius:5px;padding:15px;margin:15px 0;text-align:left;}"
                ".change-btn{background:#1e88e5;color:white;border:none;padding:12px 20px;border-radius:4px;cursor:pointer;font-size:16px;margin-top:20px;}"
                ".change-btn:hover{background:#1976d2;}"
                ".note{background:#fff3e0;border-left:4px solid #ff9800;padding:10px;margin:15px 0;text-align:left;font-size:14px;}"
                "</style></head>"
                "<body><div class='container'>"
                "<h1>ESP32 Status</h1>"
                "<p class='status'>&#x2705; Connected to WiFi</p>"
                
                "<div class='network-info'>"
                "<p><strong>Network:</strong> " + String(ssid) + "</p>"
                "<p><strong>IP Address:</strong> " + ipAddress + "</p>"
                "<p><strong>IP Configuration:</strong> DHCP (Automatic)</p>"
                "</div>"
                
                "<div class='note'>"
                "<p><strong>Hardware Reset:</strong> Press the physical button on your ESP32 to reset WiFi settings.</p>"
                "</div>"
                
                "<a href='/reset'><button class='change-btn'>Change WiFi Network</button></a>"
                
                "</div></body></html>";
  server.send(200, "text/html", html);
}

// Setup Access Point mode for initial configuration
void setupAccessPoint() {
  Serial.println("Setting up Access Point...");
  
  WiFi.disconnect(true); // Disconnect from any previous connections
  delay(500);
  
  // Set up AP mode first for the captive portal
  WiFi.mode(WIFI_AP);
  WiFi.softAP(ap_ssid, ap_password);
  
  IPAddress apIP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(apIP);
  
  // Setup DNS server for captive portal - redirects all domains to our IP
  dnsServer.start(53, "*", apIP);
  
  // Setup web server routes
  server.on("/", HTTP_GET, handleRoot);
  server.on("/scan", HTTP_GET, handleScan);
  server.on("/save", HTTP_POST, handleSave);
  server.onNotFound(handleRoot); // Catch-all for captive portal
  
  server.begin();
  Serial.println("HTTP server started");
  
  // Now switch to AP+STA mode for scanning
  WiFi.mode(WIFI_AP_STA);
  
  // Print connection instructions to serial
  Serial.println("\n==================================");
  Serial.println("ESP32 WiFi Setup Mode");
  Serial.print("1. Connect to WiFi network: ");
  Serial.println(ap_ssid);
  Serial.print("2. Password: ");
  Serial.println(ap_password);
  Serial.println("3. Open a browser and navigate to:");
  Serial.print("   http://");
  Serial.println(apIP);
  Serial.println("4. Or use any of these addresses:");
  Serial.println("   http://esp32.setup");
  Serial.println("   http://192.168.4.1");
  Serial.println("==================================\n");
  
  // Do initial scan for WiFi networks
  scanNetworks();
}

// Function to scan for available WiFi networks
void scanNetworks() {
  Serial.println("Starting WiFi scan...");
  
  // Clear old scan data
  numNetworks = 0;
  
  // Important: disconnect from any previous connections for better scan results
  WiFi.disconnect(true);
  delay(100);
  
  // Set to STA mode temporarily for scanning
  WiFi.mode(WIFI_STA);
  delay(100);
  
  // Perform scan
  numNetworks = WiFi.scanNetworks();
  Serial.print("Scan completed. Found ");
  Serial.print(numNetworks);
  Serial.println(" networks");
  
  // Store scan results
  if (numNetworks > 0) {
    int actualNetworks = 0;
    for (int i = 0; i < numNetworks && i < 50; i++) {
      // Only include networks with an SSID
      if (WiFi.SSID(i).length() > 0) {
        networks[actualNetworks] = WiFi.SSID(i);
        networkRSSI[actualNetworks] = WiFi.RSSI(i);
        networkEnc[actualNetworks] = WiFi.encryptionType(i);
        
        Serial.print(actualNetworks + 1);
        Serial.print(": ");
        Serial.print(networks[actualNetworks]);
        Serial.print(" (");
        Serial.print(networkRSSI[actualNetworks]);
        Serial.print(" dBm) ");
        Serial.println((networkEnc[actualNetworks] == WIFI_AUTH_OPEN) ? "(Open)" : "");
        
        actualNetworks++;
      }
    }
    numNetworks = actualNetworks;
  }
  
  // Set back to AP+STA mode for the portal
  WiFi.mode(WIFI_AP_STA);
  
  // Make sure AP is still running
  if (WiFi.softAPgetStationNum() == 0) {
    WiFi.softAP(ap_ssid, ap_password);
  }
}

// Handler for the root page in setup mode
void handleRoot() {
  String html = "<!DOCTYPE html><html>"
                "<head><meta name='viewport' content='width=device-width, initial-scale=1.0'>"
                "<meta charset='UTF-8'>"
                "<title>ESP32 WiFi Setup</title>"
                "<style>"
                "body{font-family:Arial,sans-serif;margin:0;padding:20px;text-align:center;background:#f7f7f7;}"
                ".container{max-width:400px;margin:0 auto;background:white;border-radius:10px;padding:20px;box-shadow:0 2px 10px rgba(0,0,0,0.1);}"
                "h1{color:#333;}"
                "select,input{margin:10px 0;padding:10px;width:100%;box-sizing:border-box;border:1px solid #ddd;border-radius:4px;}"
                "input[type=submit]{background:#1e88e5;color:white;border:none;cursor:pointer;font-weight:bold;}"
                "input[type=submit]:hover{background:#1976d2;}"
                ".network-item{text-align:left;padding:5px;}"
                ".signal{display:inline-block;margin-left:5px;}"
                "a{color:#1e88e5;text-decoration:none;}"
                "a:hover{text-decoration:underline;}"
                ".refresh{margin:15px 0;display:block;}"
                ".note{background:#f8f9fa;border-left:4px solid #4CAF50;padding:10px;margin:15px 0;text-align:left;font-size:14px;}"
                ".hardware-note{background:#fff3e0;border-left:4px solid #ff9800;padding:10px;margin:15px 0;text-align:left;font-size:14px;}"
                "</style></head>"
                "<body><div class='container'><h1>ESP32 WiFi Setup</h1>";
  
  // Note about DHCP and reset button
  html += "<div class='note'>"
          "<p><strong>Note:</strong> This device will use DHCP to automatically obtain an IP address from your network.</p>"
          "</div>"
          "<div class='hardware-note'>"
          "<p><strong>Reset Button:</strong> You can press the physical button on your ESP32 at any time to clear WiFi settings.</p>"
          "</div>";
  
  // If no networks found, show manual entry form with scan button
  if (numNetworks == 0) {
    html += "<p>No WiFi networks found</p>"
            "<p><a href='/scan' class='refresh'>Scan for networks</a></p>"
            "<form action='/save' method='POST'>"
            "<p><input type='text' name='ssid' placeholder='WiFi Name (SSID)' required></p>"
            "<p><input type='password' name='password' placeholder='WiFi Password'></p>"
            "<p><input type='submit' value='Connect'></p>"
            "</form>";
  } else {
    // Show dropdown with found networks
    html += "<form action='/save' method='POST'>"
            "<p><select name='ssid' required>";
    
    // Add networks to dropdown with signal strength and encryption indicators
    for (int i = 0; i < numNetworks; i++) {
      // Use emoji for encryption type via HTML entities
      String encType;
      if (networkEnc[i] == WIFI_AUTH_OPEN) {
        encType = " &#x1F513;"; // Open network (🔓)
      } else {
        encType = " &#x1F512;"; // Secured network (🔒)
      }
      
      // Use emoji for signal strength via HTML entities
      String strength = " ";
      int rssi = networkRSSI[i];
      
      if (rssi > -50) {
        strength += "&#x1F4F6;"; // Excellent signal (📶)
      } else if (rssi > -65) {
        strength += "&#x1F4F6;"; // Good signal (📶)
      } else if (rssi > -75) {
        strength += "&#x1F4E1;"; // Fair signal (📡)
      } else {
        strength += "&#x1F4E1;"; // Poor signal (📡)
      }
      
      html += "<option value='" + networks[i] + "'>" + networks[i] + strength + encType + "</option>";
    }
    
    html += "</select></p>"
            "<p><input type='password' name='password' placeholder='WiFi Password'></p>"
            "<p><input type='submit' value='Connect'></p>"
            "</form>"
            "<p><a href='/scan' class='refresh'>Refresh network list</a></p>";
  }
  
  html += "</div></body></html>";
  server.send(200, "text/html", html);
}

// Handler for the scan button
void handleScan() {
  // Send a simple page indicating scan in progress
  server.send(200, "text/html", 
    "<!DOCTYPE html><html><head><meta charset='UTF-8'><meta http-equiv='refresh' content='3;url=/'>"
    "<style>body{font-family:Arial,sans-serif;text-align:center;margin-top:50px;}</style></head>"
    "<body><h3>Scanning for networks... &#x1F50D;</h3><p>Please wait, you'll be redirected automatically.</p></body></html>");
  
  // Perform the scan after sending the response
  scanNetworks();
}

// Handler for the save form - connects to the selected WiFi
void handleSave() {
  if (server.hasArg("ssid")) {
    // Get form data
    server.arg("ssid").toCharArray(ssid, 64);
    server.arg("password").toCharArray(password, 64);
    
    // Show connecting page with loading spinner
    String response = "<!DOCTYPE html><html>"
                      "<head><meta name='viewport' content='width=device-width, initial-scale=1.0'>"
                      "<meta charset='UTF-8'>"
                      "<title>ESP32 WiFi Setup</title>"
                      "<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;text-align:center;background:#f7f7f7;}"
                      ".container{max-width:400px;margin:0 auto;background:white;border-radius:10px;padding:20px;box-shadow:0 2px 10px rgba(0,0,0,0.1);}"
                      ".loader{border:5px solid #f3f3f3;border-top:5px solid #3498db;border-radius:50%;width:40px;height:40px;animation:spin 2s linear infinite;margin:20px auto;}"
                      "@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}"
                      "h1{color:#333;}</style></head>"
                      "<body><div class='container'><h1>Connecting to WiFi</h1>"
                      "<p>Attempting to connect to: <strong>" + String(ssid) + "</strong></p>"
                      "<p>Using DHCP for automatic IP assignment</p>"
                      "<div class='loader'></div>"
                      "<p>Please wait...</p>"
                      "</div></body></html>";
    server.send(200, "text/html", response);
    
    // Save credentials to EEPROM for future use
    for (int i = 0; i < 64; i++) {
      EEPROM.write(SSID_ADDR + i, ssid[i]);
      EEPROM.write(PASS_ADDR + i, password[i]);
    }
    EEPROM.write(WIFI_CONFIG_FLAG_ADDR, 1);
    EEPROM.commit();
    
    Serial.print("Attempting to connect to: ");
    Serial.println(ssid);
    
    // Try to connect to the network
    WiFi.mode(WIFI_STA);
    
    // Connect with DHCP (automatic IP assignment)
    WiFi.begin(ssid, password);
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
      delay(500);
      Serial.print(".");
      attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
      // Connected successfully
      Serial.println("\nConnected successfully!");
      ipAddress = WiFi.localIP().toString();
      Serial.print("IP address: ");
      Serial.println(ipAddress);
      
      // Send success response with redirect to status page
      String successResponse = "<!DOCTYPE html><html>"
                      "<head><meta name='viewport' content='width=device-width, initial-scale=1.0'>"
                      "<meta charset='UTF-8'>"
                      "<meta http-equiv='refresh' content='5;url=/'>"
                      "<title>ESP32 Connection Success</title>"
                      "<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;text-align:center;background:#f7f7f7;}"
                      ".container{max-width:400px;margin:0 auto;background:white;border-radius:10px;padding:20px;box-shadow:0 2px 10px rgba(0,0,0,0.1);}"
                      "h1{color:#4CAF50;}"
                      ".ip-box{background:#f1f8e9;border:1px solid #dcedc8;padding:15px;border-radius:5px;margin:20px 0;font-size:1.2em;}"
                      "</style></head>"
                      "<body><div class='container'><h1>&#x2705; Connected Successfully!</h1>"
                      "<p>ESP32 has connected to <strong>" + String(ssid) + "</strong></p>"
                      "<div class='ip-box'>"
                      "<p>Device IP Address:</p>"
                      "<p><strong>" + ipAddress + "</strong></p>"
                      "<p>Just type this in your browser to access your device</p>"
                      "</div>"
                      "<p>Redirecting to status page...</p>"
                      "</div></body></html>";
      
      WiFi.softAPdisconnect(true); // Turn off AP mode
      
      // Setup connected mode server
      server.on("/", HTTP_GET, handleConnectedRoot);
      server.on("/reset", HTTP_GET, handleReset);
      server.send(200, "text/html", successResponse);
      
    } else {
      // Failed to connect
      Serial.println("\nFailed to connect. Restarting AP mode...");
      
      // Send failure response
      String failureResponse = "<!DOCTYPE html><html>"
                      "<head><meta name='viewport' content='width=device-width, initial-scale=1.0'>"
                      "<meta charset='UTF-8'>"
                      "<title>ESP32 Connection Failed</title>"
                      "<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;text-align:center;background:#f7f7f7;}"
                      ".container{max-width:400px;margin:0 auto;background:white;border-radius:10px;padding:20px;box-shadow:0 2px 10px rgba(0,0,0,0.1);}"
                      "h1{color:#f44336;}"
                      ".btn{background:#1e88e5;color:white;border:none;padding:10px 15px;border-radius:4px;text-decoration:none;display:inline-block;margin-top:15px;}</style></head>"
                      "<body><div class='container'><h1>&#x274C; Connection Failed</h1>"
                      "<p>Could not connect to: <strong>" + String(ssid) + "</strong></p>"
                      "<p>Please check your WiFi password and try again</p>"
                      "<a href='/' class='btn'>Try Again</a>"
                      "</div></body></html>";
      
      server.send(200, "text/html", failureResponse);
      setupAccessPoint();
    }
  } else {
    server.sendHeader("Location", "/", true);
    server.send(302, "text/plain", "");
  }
}

// Handler for the reset button - clears saved WiFi settings
void handleReset() {
  String html = "<!DOCTYPE html><html>"
                "<head><meta name='viewport' content='width=device-width, initial-scale=1.0'>"
                "<meta charset='UTF-8'>"
                "<meta http-equiv='refresh' content='5;url=/'>"
                "<title>ESP32 Reset WiFi</title>"
                "<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;text-align:center;background:#f7f7f7;}"
                ".container{max-width:400px;margin:0 auto;background:white;border-radius:10px;padding:20px;box-shadow:0 2px 10px rgba(0,0,0,0.1);}"
                "h1{color:#f44336;}</style></head>"
                "<body><div class='container'>"
                "<h1>WiFi Settings Reset &#x1F504;</h1>"
                "<p>Your ESP32 WiFi settings have been reset.</p>"
                "<p>The device will restart in setup mode.</p>"
                "<p>Please reconnect to the 'ESP32_Setup' WiFi network.</p>"
                "</div></body></html>";
  server.send(200, "text/html", html);
  
  // Clear WiFi config flag in EEPROM
  EEPROM.write(WIFI_CONFIG_FLAG_ADDR, 0);
  EEPROM.commit();
  
  delay(1000);
  
  // Restart the device to apply changes
  ESP.restart();
}