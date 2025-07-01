'use client'

import { Signal, Wifi, MapPin, Clock, Smartphone } from 'lucide-react'
import { TrackingData } from '@/types/tracking'
import { formatDistanceToNow } from 'date-fns'

interface DeviceStatusProps {
  trackingData?: TrackingData
  deviceInfo?: {
    deviceId: string
    name: string
    isActive?: boolean
    lastSeen?: string
    batteryLevel?: number
  }
}

export default function DeviceStatus({ trackingData, deviceInfo }: DeviceStatusProps) {
  if (!trackingData && !deviceInfo) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="text-center text-gray-500">
          <Signal className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <div>No device data available</div>
          <div className="text-sm mt-1">Waiting for GPS collar connection...</div>
        </div>
      </div>
    )
  }

  const getSignalStrength = (rssi: number) => {
    if (rssi > -50) return { level: 'Excellent', color: 'text-green-600' }
    if (rssi > -60) return { level: 'Good', color: 'text-green-500' }
    if (rssi > -70) return { level: 'Fair', color: 'text-yellow-500' }
    return { level: 'Poor', color: 'text-red-500' }
  }

  const signalInfo = trackingData ? getSignalStrength(trackingData.wifiRSSI) : null

  return (
    <div className="space-y-4">
      {/* Device Info Section */}
      {deviceInfo && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="font-medium mb-2 flex items-center">
            <Smartphone className="w-4 h-4 mr-2 text-blue-600" />
            Device Information
          </div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Name:</span>
              <span className="font-medium">{deviceInfo.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Device ID:</span>
              <span className="font-mono text-xs">{deviceInfo.deviceId}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={`px-2 py-1 rounded text-xs ${
                deviceInfo.isActive !== false 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {deviceInfo.isActive !== false ? '✅ Active' : '❌ Inactive'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* GPS Status */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <MapPin className={`w-5 h-5 ${trackingData?.gpsValid ? 'text-green-600' : 'text-red-500'}`} />
          <span className="font-medium">GPS Signal</span>
        </div>
        <span className={`px-2 py-1 rounded text-sm ${
          trackingData?.gpsValid 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {trackingData?.gpsValid ? '✅ Active' : '❌ No Signal'}
        </span>
      </div>

      {/* WiFi Status */}
      {trackingData && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Wifi className="w-5 h-5 text-blue-600" />
            <span className="font-medium">WiFi Signal</span>
          </div>
          <div className="text-right">
            <div className={`font-medium ${signalInfo?.color}`}>
              {signalInfo?.level}
            </div>
            <div className="text-xs text-gray-500">
              {trackingData.wifiRSSI} dBm
            </div>
          </div>
        </div>
      )}

      {/* Last Update */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-gray-600" />
          <span className="font-medium">Last Update</span>
        </div>
        <div className="text-right">
          <div className="text-sm">
            {trackingData ? (
              formatDistanceToNow(new Date(trackingData.createdAt), { addSuffix: true })
            ) : deviceInfo?.lastSeen ? (
              formatDistanceToNow(new Date(deviceInfo.lastSeen), { addSuffix: true })
            ) : (
              'Never'
            )}
          </div>
          <div className="text-xs text-gray-500">
            {trackingData && new Date(trackingData.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Coordinates */}
      {trackingData?.gpsValid && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="font-medium mb-2 flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Current Coordinates
          </div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Latitude:</span>
              <span className="font-mono">{trackingData.latitude.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span>Longitude:</span>
              <span className="font-mono">{trackingData.longitude.toFixed(6)}</span>
            </div>
          </div>
        </div>
      )}

      {/* System Info */}
      {trackingData && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="font-medium mb-2">🔧 System Info</div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Device ID:</span>
              <span className="font-mono text-xs">{trackingData.deviceId}</span>
            </div>
            <div className="flex justify-between">
              <span>Uptime:</span>
              <span>{Math.floor(trackingData.uptime / 3600)}h {Math.floor((trackingData.uptime % 3600) / 60)}m</span>
            </div>
            <div className="flex justify-between">
              <span>Data Points:</span>
              <span>Live streaming</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}