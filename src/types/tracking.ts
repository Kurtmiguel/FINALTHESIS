export interface TrackingData {
  _id?: string
  deviceId: string
  latitude: number
  longitude: number
  gpsValid: boolean
  battery: number
  timestamp: string
  uptime: number
  wifiRSSI: number
  createdAt: string
}

export interface DeviceStatus {
  online: boolean
  lastSeen: string
  battery: number
  gpsValid: boolean
  wifiStrength: number
}