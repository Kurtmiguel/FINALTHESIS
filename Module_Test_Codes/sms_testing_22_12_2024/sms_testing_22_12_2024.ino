#define rxPin 18 //GSM Module RX pin to ESP32 Pin 15
#define txPin 5 //GSM Module TX pin to ESP32 Pin 2
#define BAUD_RATE 115200 
HardwareSerial SIM7600(1); // Define the serial port for SIM7600 module

void setup() {
  Serial.begin(115200);
  Serial.println("esp32 serial initialize");
  SIM7600.begin(BAUD_RATE, SERIAL_8N1, rxPin, txPin);
  Serial.println("SIM7600 serial initialize");
  delay(1000);  // Allow some time for the SIM7600 to initialize
  SendMessage();
}

void loop() {
  
}
rpr
void sendATCommand(const char* command) {
  Serial.print("Sending AT Command: ");
  Serial.println(command);
}

void SendMessage(){
  Serial.println("Setting the GSM in text mode");
  SIM7600.println("AT+CMGF=1\r");
  delay(2000);
  Serial.println("Sending SMS to the desired phone number!");
  SIM7600.println("AT+CMGS=\"+639454894821\"\r");
  // Replace x with mobile number
  delay(2000);

  SIM7600.println("Testing");    // SMS Textrp
  delay(200);
  SIM7600.println((char)26);               // ASCII code of CTRL+Z
  delay(2000);
}p