// components/GPSMapWithGeofence.tsx
'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { TrackingData } from '@/types/tracking'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)
const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
)
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
)
const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
)

interface GeofenceData {
  _id: string
  name: string
  centerLatitude: number
  centerLongitude: number
  radius: number
  geofenceType: 'indoor' | 'outdoor'
  isActive: boolean
  dogName: string
}

interface HistoricalPoint {
  latitude: number
  longitude: number
  timestamp: string
  createdAt: string
  battery: number
}

interface GPSMapWithGeofenceProps {
  trackingData?: TrackingData
  historicalData?: HistoricalPoint[]
  geofences?: GeofenceData[]
  height?: string
  showHistory?: boolean
  groupedByDate?: { [date: string]: HistoricalPoint[] }
  dogName?: string
}

// Color palette for different days
const dayColors = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#84cc16', // Lime
]

// Utility function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

export default function GPSMapWithGeofence({ 
  trackingData, 
  historicalData, 
  geofences = [],
  height = '400px',
  showHistory = false,
  groupedByDate,
  dogName = 'Dog'
}: GPSMapWithGeofenceProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div 
        className="bg-gray-100 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-gray-500 text-lg">Loading Map...</div>
        </div>
      </div>
    )
  }

  // Determine map center and data to display
  let center: [number, number] = [14.5995, 120.9842] // Default to Manila, Philippines
  let hasValidData = false

  // Use geofence center if available and no GPS data
  if (geofences.length > 0 && geofences[0].isActive) {
    center = [geofences[0].centerLatitude, geofences[0].centerLongitude]
    hasValidData = true
  }

  if (showHistory && historicalData && historicalData.length > 0) {
    // Use the latest historical point as center
    const latestPoint = historicalData[historicalData.length - 1]
    center = [latestPoint.latitude, latestPoint.longitude]
    hasValidData = true
  } else if (trackingData?.gpsValid) {
    // Use live tracking data as center
    center = [trackingData.latitude, trackingData.longitude]
    hasValidData = true
  }

  if (!hasValidData && geofences.length === 0) {
    return (
      <div 
        className="bg-gray-100 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-gray-500 text-lg">
            {showHistory ? 'No Historical GPS Data' : 'No GPS Signal'}
          </div>
          <div className="text-gray-400 text-sm mt-2">
            {showHistory 
              ? 'No valid coordinates found for the selected time period'
              : 'Waiting for GPS coordinates...'
            }
          </div>
        </div>
      </div>
    )
  }

  // Check if current position is outside geofence
  const isOutsideGeofence = trackingData?.gpsValid && geofences.length > 0 && geofences[0].isActive ? 
    calculateDistance(
      trackingData.latitude,
      trackingData.longitude,
      geofences[0].centerLatitude,
      geofences[0].centerLongitude
    ) > geofences[0].radius : false

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden relative">
      {/* Geofence Status Indicator */}
      {geofences.length > 0 && trackingData?.gpsValid && (
        <div className="absolute top-4 left-4 z-[1000]">
          <div className={`px-3 py-2 rounded-lg shadow-lg text-sm font-medium ${
            isOutsideGeofence 
              ? 'bg-red-100 text-red-800 border border-red-200' 
              : 'bg-green-100 text-green-800 border border-green-200'
          }`}>
            {isOutsideGeofence ? (
              <span>🚨 {dogName} is outside safe zone</span>
            ) : (
              <span>✅ {dogName} is in safe zone</span>
            )}
          </div>
        </div>
      )}

      {/* @ts-ignore - Dynamic import typing issue */}
      <MapContainer
        center={center}
        zoom={showHistory ? 13 : 16}
        style={{ height: '100%', width: '100%' }}
      >
        {/* @ts-ignore - Dynamic import typing issue */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render Geofences */}
        {geofences.map((geofence, index) => (
          <div key={geofence._id}>
            {/* Geofence Circle */}
            {/* @ts-ignore - Dynamic import typing issue */}
            <Circle
              center={[geofence.centerLatitude, geofence.centerLongitude]}
              radius={geofence.radius}
              pathOptions={{
                color: geofence.isActive ? '#3b82f6' : '#6b7280',
                fillColor: geofence.isActive ? '#3b82f6' : '#6b7280',
                fillOpacity: 0.1,
                weight: 2,
                opacity: geofence.isActive ? 0.7 : 0.4,
                dashArray: geofence.isActive ? undefined : '10,10'
              }}
            >
              {/* @ts-ignore - Dynamic import typing issue */}
              <Popup>
                <div className="text-center">
                  <strong>🛡️ {geofence.name}</strong>
                  <br />
                  <span className={geofence.isActive ? 'text-green-600' : 'text-gray-600'}>
                    {geofence.isActive ? '● ACTIVE' : '○ INACTIVE'}
                  </span>
                  <br />
                  Type: {geofence.geofenceType}
                  <br />
                  Radius: {geofence.radius}m
                  <br />
                  Dog: {geofence.dogName}
                </div>
              </Popup>
            </Circle>

            {/* Geofence Center Marker */}
            {/* @ts-ignore - Dynamic import typing issue */}
            <CircleMarker
              center={[geofence.centerLatitude, geofence.centerLongitude]}
              radius={6}
              pathOptions={{
                color: '#ffffff',
                fillColor: geofence.isActive ? '#3b82f6' : '#6b7280',
                fillOpacity: 1,
                weight: 2
              }}
            >
              {/* @ts-ignore - Dynamic import typing issue */}
              <Popup>
                <div className="text-center">
                  <strong>📍 Safe Zone Center</strong>
                  <br />
                  {geofence.name}
                </div>
              </Popup>
            </CircleMarker>
          </div>
        ))}

        {/* Show live tracking marker if not in history mode */}
        {!showHistory && trackingData?.gpsValid && (
          /* @ts-ignore - Dynamic import typing issue */
          <Marker position={[trackingData.latitude, trackingData.longitude]}>
            {/* @ts-ignore - Dynamic import typing issue */}
            <Popup>
              <div className="text-center">
                <strong>🐕 {dogName}'s Current Location</strong>
                <br />
                <span className={`font-semibold ${isOutsideGeofence ? 'text-red-600' : 'text-green-600'}`}>
                  {isOutsideGeofence ? '🚨 OUTSIDE SAFE ZONE' : '✅ IN SAFE ZONE'}
                </span>
                <br />
                Lat: {trackingData.latitude.toFixed(6)}
                <br />
                Lng: {trackingData.longitude.toFixed(6)}
                <br />
                Battery: {trackingData.battery}%
                <br />
                Last Update: {new Date(trackingData.timestamp).toLocaleTimeString()}
                {geofences.length > 0 && geofences[0].isActive && (
                  <>
                    <br />
                    Distance from center: {calculateDistance(
                      trackingData.latitude,
                      trackingData.longitude,
                      geofences[0].centerLatitude,
                      geofences[0].centerLongitude
                    ).toFixed(0)}m
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Show historical data if in history mode */}
        {showHistory && groupedByDate && Object.entries(groupedByDate).map(([date, points], dayIndex) => {
          const color = dayColors[dayIndex % dayColors.length]
          const pathCoordinates: [number, number][] = points.map(point => [point.latitude, point.longitude])
          
          return (
            <div key={date}>
              {/* Path line for this day */}
              {pathCoordinates.length > 1 && (
                /* @ts-ignore - Dynamic import typing issue */
                <Polyline
                  positions={pathCoordinates}
                  color={color}
                  weight={3}
                  opacity={0.7}
                />
              )}
              
              {/* Markers for each point */}
              {points.map((point, index) => {
                // Check if this historical point was outside geofence
                let wasOutsideGeofence = false
                if (geofences.length > 0) {
                  const distance = calculateDistance(
                    point.latitude,
                    point.longitude,
                    geofences[0].centerLatitude,
                    geofences[0].centerLongitude
                  )
                  wasOutsideGeofence = distance > geofences[0].radius
                }

                return (
                  /* @ts-ignore - Dynamic import typing issue */
                  <CircleMarker
                    key={`${date}-${index}`}
                    center={[point.latitude, point.longitude]}
                    radius={5}
                    fillColor={wasOutsideGeofence ? '#ef4444' : color}
                    color="white"
                    weight={2}
                    opacity={1}
                    fillOpacity={0.8}
                  >
                    {/* @ts-ignore - Dynamic import typing issue */}
                    <Popup>
                      <div className="text-center">
                        <strong>📍 Historical Location</strong>
                        <br />
                        <span style={{ color }} className="font-semibold">
                          {new Date(date).toLocaleDateString()}
                        </span>
                        <br />
                        {wasOutsideGeofence && (
                          <>
                            <span className="text-red-600 font-semibold">
                              🚨 WAS OUTSIDE SAFE ZONE
                            </span>
                            <br />
                          </>
                        )}
                        Time: {new Date(point.createdAt).toLocaleTimeString()}
                        <br />
                        Lat: {point.latitude.toFixed(6)}
                        <br />
                        Lng: {point.longitude.toFixed(6)}
                        <br />
                        Battery: {point.battery}%
                        <br />
                        <small className="text-gray-500">
                          Point {index + 1} of {points.length}
                        </small>
                        {geofences.length > 0 && (
                          <>
                            <br />
                            Distance from safe zone: {calculateDistance(
                              point.latitude,
                              point.longitude,
                              geofences[0].centerLatitude,
                              geofences[0].centerLongitude
                            ).toFixed(0)}m
                          </>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                )
              })}

              {/* Start marker for each day */}
              {points.length > 0 && (
                /* @ts-ignore - Dynamic import typing issue */
                <CircleMarker
                  center={[points[0].latitude, points[0].longitude]}
                  radius={8}
                  fillColor="green"
                  color="white"
                  weight={3}
                  opacity={1}
                  fillOpacity={1}
                >
                  {/* @ts-ignore - Dynamic import typing issue */}
                  <Popup>
                    <div className="text-center">
                      <strong>🟢 Start of Day</strong>
                      <br />
                      <span style={{ color }} className="font-semibold">
                        {new Date(date).toLocaleDateString()}
                      </span>
                      <br />
                      First location: {new Date(points[0].createdAt).toLocaleTimeString()}
                    </div>
                  </Popup>
                </CircleMarker>
              )}

              {/* End marker for each day */}
              {points.length > 1 && (
                /* @ts-ignore - Dynamic import typing issue */
                <CircleMarker
                  center={[points[points.length - 1].latitude, points[points.length - 1].longitude]}
                  radius={8}
                  fillColor="red"
                  color="white"
                  weight={3}
                  opacity={1}
                  fillOpacity={1}
                >
                  {/* @ts-ignore - Dynamic import typing issue */}
                  <Popup>
                    <div className="text-center">
                      <strong>🔴 End of Day</strong>
                      <br />
                      <span style={{ color }} className="font-semibold">
                        {new Date(date).toLocaleDateString()}
                      </span>
                      <br />
                      Last location: {new Date(points[points.length - 1].createdAt).toLocaleTimeString()}
                    </div>
                  </Popup>
                </CircleMarker>
              )}
            </div>
          )
        })}

        {/* Show simple historical markers if no grouping available */}
        {showHistory && !groupedByDate && historicalData && historicalData.map((point, index) => {
          // Check if this historical point was outside geofence
          let wasOutsideGeofence = false
          if (geofences.length > 0) {
            const distance = calculateDistance(
              point.latitude,
              point.longitude,
              geofences[0].centerLatitude,
              geofences[0].centerLongitude
            )
            wasOutsideGeofence = distance > geofences[0].radius
          }

          return (
            /* @ts-ignore - Dynamic import typing issue */
            <CircleMarker
              key={index}
              center={[point.latitude, point.longitude]}
              radius={4}
              fillColor={wasOutsideGeofence ? '#ef4444' : '#3b82f6'}
              color="white"
              weight={2}
              opacity={1}
              fillOpacity={0.8}
            >
              {/* @ts-ignore - Dynamic import typing issue */}
              <Popup>
                <div className="text-center">
                  <strong>📍 Historical Point {index + 1}</strong>
                  <br />
                  {wasOutsideGeofence && (
                    <>
                      <span className="text-red-600 font-semibold">
                        🚨 WAS OUTSIDE SAFE ZONE
                      </span>
                      <br />
                    </>
                  )}
                  Time: {new Date(point.createdAt).toLocaleTimeString()}
                  <br />
                  Date: {new Date(point.createdAt).toLocaleDateString()}
                  <br />
                  Lat: {point.latitude.toFixed(6)}
                  <br />
                  Lng: {point.longitude.toFixed(6)}
                  <br />
                  Battery: {point.battery}%
                  {geofences.length > 0 && (
                    <>
                      <br />
                      Distance from safe zone: {calculateDistance(
                        point.latitude,
                        point.longitude,
                        geofences[0].centerLatitude,
                        geofences[0].centerLongitude
                      ).toFixed(0)}m
                    </>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}