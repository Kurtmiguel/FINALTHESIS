// app/types/geofencing.ts - Unified Types for Consistency
import { Types } from 'mongoose'

// Base interfaces for data consistency
export interface GeofenceData {
  _id: string;
  name: string;
  centerLatitude: number;
  centerLongitude: number;
  radius: number;
  geofenceType: 'indoor' | 'outdoor';
  isActive: boolean;
  deviceId: string;
  dogId: string;
  dogName: string;
  dogBreed?: string;
  owner: string;
  alertsEnabled: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlertData {
  _id: string;
  alertType: 'geofence_exit' | 'geofence_entry' | 'battery_low' | 'device_offline';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  deviceId: string;
  dogId: string;
  dogName: string;
  dogBreed: string;
  dogImageUrl?: string;
  geofenceId?: string;
  geofenceName?: string;
  geofenceType?: string;
  owner: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  metadata?: {
    batteryLevel?: number;
    distance?: number;
    previousStatus?: string;
    duration?: number;
  };
  createdAt: string;
  readAt?: string;
  resolvedAt?: string;
  isResolved: boolean;
}

// Database interfaces (for internal use)
export interface IGeofenceDatabase {
  _id: Types.ObjectId;
  name: string;
  centerLatitude: number;
  centerLongitude: number;
  radius: number;
  geofenceType: 'indoor' | 'outdoor';
  isActive: boolean;
  deviceId: string;
  dogId: Types.ObjectId;
  owner: Types.ObjectId;
  alertsEnabled: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAlertDatabase {
  _id: Types.ObjectId;
  alertType: 'geofence_exit' | 'geofence_entry' | 'battery_low' | 'device_offline';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  deviceId: string;
  dogId: Types.ObjectId;
  geofenceId?: Types.ObjectId;
  owner: Types.ObjectId;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  metadata?: {
    batteryLevel?: number;
    distance?: number;
    previousStatus?: string;
    duration?: number;
  };
  createdAt: Date;
  readAt?: Date;
  resolvedAt?: Date;
  isResolved: boolean;
}

// API Request/Response types
export interface CreateGeofenceRequest {
  name: string;
  centerLatitude: number;
  centerLongitude: number;
  radius: number;
  geofenceType: 'indoor' | 'outdoor';
  deviceId: string;
  dogId: string;
  alertsEnabled?: boolean;
  description?: string;
}

export interface UpdateGeofenceRequest {
  name?: string;
  radius?: number;
  geofenceType?: 'indoor' | 'outdoor';
  isActive?: boolean;
  alertsEnabled?: boolean;
  description?: string;
}

export interface UpdateAlertRequest {
  isRead?: boolean;
  isResolved?: boolean;
}

export interface BulkUpdateAlertsRequest {
  alertIds: string[];
  markAsRead?: boolean;
  markAsResolved?: boolean;
}

export interface AlertsResponse {
  alerts: AlertData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    unreadCount: number;
    hasMore: boolean;
  };
}

export interface GeofencesResponse {
  geofences: GeofenceData[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasMore: boolean;
  };
}

// Component Props Types
export interface GeofenceSetupProps {
  dogId: string;
  dogName: string;
  deviceId: string;
  trackingData?: {
    latitude: number;
    longitude: number;
    gpsValid: boolean;
  };
  onGeofenceCreated: (geofence: GeofenceData) => void;
  onGeofenceUpdated: (geofence: GeofenceData) => void;
  onGeofenceDeleted: (geofenceId: string) => void;
}

export interface NotificationCenterProps {
  dogId?: string;
  deviceId?: string;
  refreshInterval?: number;
}

export interface GPSMapWithGeofenceProps {
  trackingData?: {
    latitude: number;
    longitude: number;
    gpsValid: boolean;
    battery: number;
    timestamp: string;
  };
  historicalData?: Array<{
    latitude: number;
    longitude: number;
    timestamp: string;
    createdAt: string;
    battery: number;
  }>;
  geofences?: GeofenceData[];
  height?: string;
  showHistory?: boolean;
  groupedByDate?: { [date: string]: any[] };
  dogName?: string;
}

// Utility types
export interface GPSCoordinates {
  latitude: number;
  longitude: number;
}

export interface DistanceCalculationResult {
  distance: number; // in meters
  isWithinRadius: boolean;
  bearingFromCenter: number; // in degrees
}

export interface GeofenceCheckResult {
  deviceId: string;
  geofenceId: string;
  isInside: boolean;
  distance: number;
  previousState?: boolean;
  stateChanged: boolean;
  violation?: GeofenceViolation;
}

export interface GeofenceViolation {
  deviceId: string;
  dogId: string;
  geofenceId: string;
  violationType: 'exit' | 'entry';
  coordinates: GPSCoordinates;
  distance: number;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  alertCreated: boolean;
}

// Constants
export const GEOFENCE_DEFAULTS = {
  MAX_RADIUS: 18, // meters (60ft)
  DEFAULT_RADIUS: 18, // meters (60ft)
  CHECK_INTERVAL: 5000, // milliseconds
  ALERT_COOLDOWN: 300000, // milliseconds (5 minutes)
  MAX_VIOLATIONS_PER_HOUR: 10
} as const;

export const ALERT_SEVERITIES = {
  LOW: 'low',
  MEDIUM: 'medium', 
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

export const ALERT_TYPES = {
  GEOFENCE_EXIT: 'geofence_exit',
  GEOFENCE_ENTRY: 'geofence_entry',
  BATTERY_LOW: 'battery_low',
  DEVICE_OFFLINE: 'device_offline'
} as const;