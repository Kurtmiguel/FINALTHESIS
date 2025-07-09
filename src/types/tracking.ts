// types/tracking.ts - Enhanced with History Types
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

// New types for history functionality
export interface HistoricalPoint {
  latitude: number
  longitude: number
  timestamp: string
  createdAt: string
  battery: number
}

export interface HistoryResponse {
  success: boolean
  deviceId: string
  totalPoints: number
  dateRange: {
    start: string | null
    end: string | null
  }
  data: HistoricalPoint[]
  groupedByDate: { [date: string]: HistoricalPoint[] }
  summary: {
    firstPoint: HistoricalPoint | null
    lastPoint: HistoricalPoint | null
    datesWithData: string[]
  }
}

export interface TimeRange {
  label: string
  value: string
  startDate: Date
  endDate: Date
}

export interface GPSCoordinate {
  latitude: number
  longitude: number
  timestamp: string
  battery?: number
}

export interface PathSegment {
  date: string
  coordinates: GPSCoordinate[]
  color: string
  totalPoints: number
  startTime: string
  endTime: string
}

// Enhanced device status for history view
export interface HistoricalDeviceStatus extends DeviceStatus {
  totalDistance?: number // in meters
  averageBatteryLevel?: number
  mostActiveHour?: string
  trackingDuration?: number // in minutes
}