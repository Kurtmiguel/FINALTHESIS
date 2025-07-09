// components/GPSMapWithHistory.tsx
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
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
)
const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
)

interface HistoricalPoint {
  latitude: number
  longitude: number
  timestamp: string
  createdAt: string
  battery: number
}

interface GPSMapWithHistoryProps {
  trackingData?: TrackingData
  historicalData?: HistoricalPoint[]
  height?: string
  showHistory?: boolean
  groupedByDate?: { [date: string]: HistoricalPoint[] }
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

export default function GPSMapWithHistory({ 
  trackingData, 
  historicalData, 
  height = '400px',
  showHistory = false,
  groupedByDate
}: GPSMapWithHistoryProps) {
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

  if (!hasValidData) {
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

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden">
      {/* @ts-ignore - Dynamic import typing issue */}
      <MapContainer
        center={center}
        zoom={showHistory ? 13 : 15}
        style={{ height: '100%', width: '100%' }}
      >
        {/* @ts-ignore - Dynamic import typing issue */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Show live tracking marker if not in history mode */}
        {!showHistory && trackingData?.gpsValid && (
          /* @ts-ignore - Dynamic import typing issue */
          <Marker position={[trackingData.latitude, trackingData.longitude]}>
            {/* @ts-ignore - Dynamic import typing issue */}
            <Popup>
              <div className="text-center">
                <strong>🐕 Current Location</strong>
                <br />
                <span className="text-green-600 font-semibold">● LIVE</span>
                <br />
                Lat: {trackingData.latitude.toFixed(6)}
                <br />
                Lng: {trackingData.longitude.toFixed(6)}
                <br />
                Battery: {trackingData.battery}%
                <br />
                Last Update: {new Date(trackingData.timestamp).toLocaleTimeString()}
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
              {points.map((point, index) => (
                /* @ts-ignore - Dynamic import typing issue */
                <CircleMarker
                  key={`${date}-${index}`}
                  center={[point.latitude, point.longitude]}
                  radius={5}
                  fillColor={color}
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
                    </div>
                  </Popup>
                </CircleMarker>
              ))}

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
        {showHistory && !groupedByDate && historicalData && historicalData.map((point, index) => (
          /* @ts-ignore - Dynamic import typing issue */
          <CircleMarker
            key={index}
            center={[point.latitude, point.longitude]}
            radius={4}
            fillColor="#3b82f6"
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
                Time: {new Date(point.createdAt).toLocaleTimeString()}
                <br />
                Date: {new Date(point.createdAt).toLocaleDateString()}
                <br />
                Lat: {point.latitude.toFixed(6)}
                <br />
                Lng: {point.longitude.toFixed(6)}
                <br />
                Battery: {point.battery}%
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}