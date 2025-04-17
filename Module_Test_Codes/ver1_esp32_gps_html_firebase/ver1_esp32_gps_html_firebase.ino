#include <Arduino.h>
#include <HardwareSerial.h>
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <TinyGPS++.h>

#define RXPin 14  // Verify this pin number for your GPS NEO6M STM32 board connection
#define TXPin 12  // Verify this pin number for your GPS NEO6M STM32 board connection

const char* ssid = "GlobeAtHome_630CA_2.4";
const char* password = "kEUJ7sGs";
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
         "  storageBucket: \"bcms-3f035.firebasestorage.app\","
         "  messagingSenderId: \"514152236762\","
         "  appId: \"1:514152236762:web:ad171aa924a293c7b5c7e3\""
         "};"
         "const app = initializeApp(firebaseConfig);"
         "const db = getFirestore(app);"
         "const dogsCollection = collection(db, \"dogs-tracker\");"
         "function updateGPS(lat, lng) {"
         "  document.getElementById(\"gps-data\").textContent = `Latitude: ${lat}, Longitude: ${lng}`;"
         "  addDoc(dogsCollection, {"
         "    device_id: \"sample\","
         "    latitude: lat,"
         "    longitude: lng,"
         "    timestamp: new Date().toISOString()"
         "  });"
         "} "
         "setInterval(() => {"
         "  fetch(\"/gps\").then(response => response.json()).then(data => {"
         "    updateGPS(data.lat, data.lng);"
         "  });"
         "}, 2000);"
         "</script>"
         "</body>"
         "</html>";
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  GPSSerial.begin(9600, SERIAL_8N1, RXPin, TXPin);  

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

  // Route to get GPS data in JSON format
  server.on("/gps", HTTP_GET, [](AsyncWebServerRequest *request){
    String json = "{";
    if (gps.location.isValid()) {
      json += "\"lat\": " + String(gps.location.lat(), 6) + ", ";
      json += "\"lng\": " + String(gps.location.lng(), 6);
    }
    json += "}";
    request->send(200, "application/json", json);
  });

  server.begin();
  Serial.println("HTTP server started.");
}

void loop() {
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
  delay(1000); 
}
