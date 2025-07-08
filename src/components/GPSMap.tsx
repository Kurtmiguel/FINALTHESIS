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

interface GPSMapProps {
  trackingData?: TrackingData
  height?: string
}

export default function GPSMap({ trackingData, height = '400px' }: GPSMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient || !trackingData?.gpsValid) {
    return (
      <div 
        className="bg-gray-100 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-gray-500 text-lg">
            {!trackingData?.gpsValid ? 'No GPS Signal' : 'Loading Map...'}
          </div>
          <div className="text-gray-400 text-sm mt-2">
            {!trackingData?.gpsValid 
              ? 'Waiting for GPS coordinates...' 
              : 'Map will appear once GPS signal is acquired'
            }
          </div>
        </div>
      </div>
    )
  }

  const position: [number, number] = [trackingData.latitude, trackingData.longitude]

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden">
      {/* @ts-ignore - Dynamic import typing issue */}
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
      >
        {/* @ts-ignore - Dynamic import typing issue */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* @ts-ignore - Dynamic import typing issue */}
        <Marker position={position}>
          {/* @ts-ignore - Dynamic import typing issue */}
          <Popup>
            <div className="text-center">
              <strong>🐕 Dog Location</strong>
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
      </MapContainer>
    </div>
  )
}