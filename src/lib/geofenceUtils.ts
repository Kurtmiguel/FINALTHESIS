// app/lib/geofenceUtils.ts
import { GPSCoordinates, DistanceCalculationResult, GeofenceCheckResult } from '@/types/geofencing'

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param coord1 First GPS coordinate
 * @param coord2 Second GPS coordinate
 * @returns Distance in meters
 */
export function calculateDistance(coord1: GPSCoordinates, coord2: GPSCoordinates): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = coord1.latitude * Math.PI / 180;
  const φ2 = coord2.latitude * Math.PI / 180;
  const Δφ = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const Δλ = (coord2.longitude - coord1.longitude) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

/**
 * Calculate bearing from one coordinate to another
 * @param coord1 Starting coordinate
 * @param coord2 Ending coordinate
 * @returns Bearing in degrees (0-360)
 */
export function calculateBearing(coord1: GPSCoordinates, coord2: GPSCoordinates): number {
  const φ1 = coord1.latitude * Math.PI / 180;
  const φ2 = coord2.latitude * Math.PI / 180;
  const Δλ = (coord2.longitude - coord1.longitude) * Math.PI / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  
  return (θ * 180 / Math.PI + 360) % 360; // Convert to degrees and normalize
}

/**
 * Check if a coordinate is within a geofence radius
 * @param deviceCoord Device GPS coordinate
 * @param geofenceCenter Geofence center coordinate
 * @param radius Geofence radius in meters
 * @returns Distance calculation result
 */
export function checkGeofenceBoundary(
  deviceCoord: GPSCoordinates, 
  geofenceCenter: GPSCoordinates, 
  radius: number
): DistanceCalculationResult {
  const distance = calculateDistance(deviceCoord, geofenceCenter);
  const isWithinRadius = distance <= radius;
  const bearingFromCenter = calculateBearing(geofenceCenter, deviceCoord);

  return {
    distance,
    isWithinRadius,
    bearingFromCenter
  };
}

/**
 * Validate GPS coordinates
 * @param coord GPS coordinate to validate
 * @returns True if valid, false otherwise
 */
export function isValidGPSCoordinate(coord: GPSCoordinates): boolean {
  return (
    coord.latitude >= -90 && 
    coord.latitude <= 90 &&
    coord.longitude >= -180 && 
    coord.longitude <= 180 &&
    coord.latitude !== 0 &&
    coord.longitude !== 0
  );
}

/**
 * Get default radius based on geofence type
 * @param geofenceType Type of geofence (indoor/outdoor)
 * @returns Default radius in meters
 */
export function getDefaultRadius(geofenceType: 'indoor' | 'outdoor'): number {
  return geofenceType === 'indoor' ? 45 : 90; // WiFi range standards
}

/**
 * Get maximum allowed radius based on geofence type
 * @param geofenceType Type of geofence (indoor/outdoor)
 * @returns Maximum radius in meters
 */
export function getMaxRadius(geofenceType: 'indoor' | 'outdoor'): number {
  return geofenceType === 'indoor' ? 45 : 90; // WiFi range standards
}

/**
 * Format distance for display
 * @param distance Distance in meters
 * @returns Formatted distance string
 */
export function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  } else {
    return `${(distance / 1000).toFixed(1)}km`;
  }
}

/**
 * Calculate geofence compliance percentage
 * @param timeInside Time spent inside geofence in minutes
 * @param totalTime Total tracking time in minutes
 * @returns Compliance percentage (0-100)
 */
export function calculateCompliance(timeInside: number, totalTime: number): number {
  if (totalTime === 0) return 100;
  return Math.round((timeInside / totalTime) * 100);
}

/**
 * Determine alert severity based on distance and time outside
 * @param distanceOutside Distance outside geofence in meters
 * @param timeOutside Time outside geofence in minutes
 * @returns Alert severity level
 */
export function determineAlertSeverity(
  distanceOutside: number, 
  timeOutside: number
): 'low' | 'medium' | 'high' | 'critical' {
  // Critical: Very far (>500m) or very long time (>60 min)
  if (distanceOutside > 500 || timeOutside > 60) {
    return 'critical';
  }
  
  // High: Far (>200m) or long time (>30 min)
  if (distanceOutside > 200 || timeOutside > 30) {
    return 'high';
  }
  
  // Medium: Moderate distance (>100m) or moderate time (>15 min)
  if (distanceOutside > 100 || timeOutside > 15) {
    return 'medium';
  }
  
  // Low: Just outside boundary
  return 'low';
}

/**
 * Generate geofence boundary points for map visualization
 * @param center Geofence center coordinate
 * @param radius Radius in meters
 * @param segments Number of segments for the circle (default 64)
 * @returns Array of GPS coordinates forming a circle
 */
export function generateGeofenceBoundary(
  center: GPSCoordinates, 
  radius: number, 
  segments: number = 64
): GPSCoordinates[] {
  const points: GPSCoordinates[] = [];
  const R = 6371000; // Earth's radius in meters
  
  for (let i = 0; i < segments; i++) {
    const angle = (i * 360 / segments) * Math.PI / 180;
    
    // Calculate new latitude
    const newLat = Math.asin(
      Math.sin(center.latitude * Math.PI / 180) * Math.cos(radius / R) +
      Math.cos(center.latitude * Math.PI / 180) * Math.sin(radius / R) * Math.cos(angle)
    ) * 180 / Math.PI;
    
    // Calculate new longitude
    const newLng = center.longitude + Math.atan2(
      Math.sin(angle) * Math.sin(radius / R) * Math.cos(center.latitude * Math.PI / 180),
      Math.cos(radius / R) - Math.sin(center.latitude * Math.PI / 180) * Math.sin(newLat * Math.PI / 180)
    ) * 180 / Math.PI;
    
    points.push({
      latitude: newLat,
      longitude: newLng
    });
  }
  
  return points;
}

/**
 * Check if device has recently entered or exited geofence
 * @param currentCoord Current device coordinate
 * @param previousCoord Previous device coordinate
 * @param geofenceCenter Geofence center coordinate
 * @param radius Geofence radius in meters
 * @returns Geofence check result
 */
export function checkGeofenceTransition(
  currentCoord: GPSCoordinates,
  previousCoord: GPSCoordinates | null,
  geofenceCenter: GPSCoordinates,
  radius: number,
  deviceId: string,
  geofenceId: string
): GeofenceCheckResult {
  const currentCheck = checkGeofenceBoundary(currentCoord, geofenceCenter, radius);
  const currentlyInside = currentCheck.isWithinRadius;
  
  let previouslyInside: boolean | undefined;
  let stateChanged = false;
  
  if (previousCoord) {
    const previousCheck = checkGeofenceBoundary(previousCoord, geofenceCenter, radius);
    previouslyInside = previousCheck.isWithinRadius;
    stateChanged = currentlyInside !== previouslyInside;
  }
  
  return {
    deviceId,
    geofenceId,
    isInside: currentlyInside,
    distance: currentCheck.distance,
    previousState: previouslyInside,
    stateChanged
  };
}

/**
 * Validate geofence configuration
 * @param center Geofence center coordinate
 * @param radius Radius in meters
 * @param geofenceType Type of geofence
 * @returns Validation result with errors if any
 */
export function validateGeofenceConfig(
  center: GPSCoordinates,
  radius: number,
  geofenceType: 'indoor' | 'outdoor'
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!isValidGPSCoordinate(center)) {
    errors.push('Invalid GPS coordinates provided');
  }
  
  if (radius <= 0) {
    errors.push('Radius must be greater than 0');
  }
  
  const maxRadius = getMaxRadius(geofenceType);
  if (radius > maxRadius) {
    errors.push(`Radius cannot exceed ${maxRadius}m for ${geofenceType} geofences`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calculate estimated time to reach geofence boundary
 * @param currentCoord Current device coordinate
 * @param geofenceCenter Geofence center coordinate
 * @param radius Geofence radius in meters
 * @param averageSpeed Average movement speed in m/s (default 1.4 m/s walking speed)
 * @returns Estimated time in minutes, or null if already outside
 */
export function estimateTimeToGeofenceBoundary(
  currentCoord: GPSCoordinates,
  geofenceCenter: GPSCoordinates,
  radius: number,
  averageSpeed: number = 1.4 // walking speed in m/s
): number | null {
  const currentDistance = calculateDistance(currentCoord, geofenceCenter);
  
  if (currentDistance >= radius) {
    return null; // Already outside
  }
  
  const distanceToTravel = radius - currentDistance;
  const timeInSeconds = distanceToTravel / averageSpeed;
  
  return Math.round(timeInSeconds / 60); // Convert to minutes
}