// app/types/geofencing.ts
export interface GeofenceData {
  _id: string
  name: string
  centerLatitude: number
  centerLongitude: number
  radius: number
  geofenceType: 'indoor' | 'outdoor'
  isActive: boolean
  deviceId: string
  dogId: string
  dogName?: string
  dogBreed?: string
  owner: string
  alertsEnabled: boolean
  description?: string
  createdAt: string
  updatedAt: string
}

export interface AlertData {
  _id: string
  alertType: 'geofence_exit' | 'geofence_entry' | 'battery_low' | 'device_offline'
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  isRead: boolean
  deviceId: string
  dogId: string
  dogName?: string
  dogBreed?: string
  dogImageUrl?: string
  geofenceId?: string
  geofenceName?: string
  geofenceType?: string
  owner: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  metadata?: {
    batteryLevel?: number
    distance?: number
    previousStatus?: string
    duration?: number
  }
  createdAt: string
  readAt?: string
  resolvedAt?: string
  isResolved: boolean
}

export interface GeofenceViolation {
  deviceId: string
  dogId: string
  geofenceId: string
  violationType: 'exit' | 'entry'
  coordinates: {
    latitude: number
    longitude: number
  }
  distance: number // distance from geofence center
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  alertCreated: boolean
}

export interface GeofenceStatus {
  geofenceId: string
  name: string
  isActive: boolean
  dogInside: boolean
  lastChecked: string
  violations: number
  alertsEnabled: boolean
  centerCoordinates: {
    latitude: number
    longitude: number
  }
  radius: number
  geofenceType: 'indoor' | 'outdoor'
}

export interface NotificationPreferences {
  geofenceAlerts: boolean
  batteryAlerts: boolean
  deviceOfflineAlerts: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
}

export interface AlertsResponse {
  alerts: AlertData[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    unreadCount: number
    hasMore: boolean
  }
}

export interface GeofencesResponse {
  geofences: GeofenceData[]
  pagination?: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasMore: boolean
  }
}

// Form data types
export interface CreateGeofenceRequest {
  name: string
  centerLatitude: number
  centerLongitude: number
  radius: number
  geofenceType: 'indoor' | 'outdoor'
  deviceId: string
  dogId: string
  alertsEnabled?: boolean
  description?: string
}

export interface UpdateGeofenceRequest {
  name?: string
  radius?: number
  geofenceType?: 'indoor' | 'outdoor'
  isActive?: boolean
  alertsEnabled?: boolean
  description?: string
}

export interface UpdateAlertRequest {
  isRead?: boolean
  isResolved?: boolean
}

export interface BulkUpdateAlertsRequest {
  alertIds: string[]
  markAsRead?: boolean
  markAsResolved?: boolean
}

// Geofence calculation utilities
export interface GPSCoordinates {
  latitude: number
  longitude: number
}

export interface DistanceCalculationResult {
  distance: number // in meters
  isWithinRadius: boolean
  bearingFromCenter: number // in degrees
}

export interface GeofenceCheckResult {
  deviceId: string
  geofenceId: string
  isInside: boolean
  distance: number
  previousState?: boolean
  stateChanged: boolean
  violation?: GeofenceViolation
}

// Real-time monitoring types
export interface GeofenceMonitoringConfig {
  checkInterval: number // milliseconds
  alertCooldown: number // milliseconds
  maxViolationsPerHour: number
  enableSmsAlerts: boolean
  enableEmailAlerts: boolean
  enablePushNotifications: boolean
}

export interface GeofenceEvent {
  eventId: string
  eventType: 'entry' | 'exit' | 'violation' | 'return'
  deviceId: string
  dogId: string
  geofenceId: string
  timestamp: string
  coordinates: GPSCoordinates
  metadata: {
    distance: number
    duration?: number
    previousCoordinates?: GPSCoordinates
    alertSent: boolean
  }
}

// Statistics and analytics types
export interface GeofenceAnalytics {
  geofenceId: string
  totalViolations: number
  averageTimeOutside: number // minutes
  longestTimeOutside: number // minutes
  mostCommonExitTime: string // hour of day
  violationsByDay: { [date: string]: number }
  violationsByHour: { [hour: string]: number }
  batteryCorrelation: {
    lowBatteryViolations: number
    averageBatteryAtViolation: number
  }
}

export interface DogActivitySummary {
  dogId: string
  dogName: string
  totalTimeTracked: number // minutes
  timeInsideGeofence: number // minutes
  timeOutsideGeofence: number // minutes
  violationsCount: number
  averageBatteryLevel: number
  mostActiveHours: string[]
  safeZoneCompliance: number // percentage
}

// WebSocket types for real-time updates
export interface RealtimeGeofenceUpdate {
  type: 'geofence_status' | 'new_alert' | 'violation_resolved' | 'battery_update'
  dogId: string
  deviceId: string
  data: any
  timestamp: string
}