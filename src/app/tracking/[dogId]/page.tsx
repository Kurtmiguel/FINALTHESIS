'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { TrackingData } from '@/types/tracking'
import GPSMap from '@/components/GPSMap'
import BatteryStatus from '@/components/BatteryStatus'
import DeviceStatus from '@/components/DeviceStatus'
import { RefreshCw, AlertTriangle, ArrowLeft, Dog, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface DogInfo {
  _id: string;
  name: string;
  breed: string;
  age: number;
  imageUrl?: string;
  deviceInfo?: {
    deviceId: string;
    name: string;
  };
}

export default function DogTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  
  const [trackingData, setTrackingData] = useState<TrackingData | undefined>(undefined)
  const [dogInfo, setDogInfo] = useState<DogInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && params.dogId) {
      fetchDogInfo()
    }
  }, [status, params.dogId, router])

  useEffect(() => {
    if (dogInfo?.deviceInfo?.deviceId) {
      console.log('🔍 [DEBUG] Starting tracking data fetch for device:', dogInfo.deviceInfo.deviceId)
      fetchLatestTrackingData()
      
      // Set up polling every 5 seconds
      const interval = setInterval(fetchLatestTrackingData, 5000)
      return () => clearInterval(interval)
    }
  }, [dogInfo])

  const fetchDogInfo = async () => {
    try {
      console.log('🔍 [DEBUG] Fetching dog info for ID:', params.dogId)
      const response = await fetch(`/api/dogs/${params.dogId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch dog information')
      }
      
      const dog = await response.json()
      console.log('🐕 [DEBUG] Dog info received:', dog)
      setDogInfo(dog)
      setError(null)
    } catch (err) {
      console.error('❌ [DEBUG] Error fetching dog info:', err)
      setError('Failed to load dog information')
    }
  }

  const fetchLatestTrackingData = async () => {
    if (!dogInfo?.deviceInfo?.deviceId) {
      console.log('⚠️ [DEBUG] No device ID available')
      return
    }

    try {
      const deviceId = dogInfo.deviceInfo.deviceId
      const apiUrl = `/api/tracking-data?latest=true&deviceId=${deviceId}`
      
      console.log('🔍 [DEBUG] Fetching tracking data from:', apiUrl)
      console.log('📱 [DEBUG] Device ID:', deviceId)
      
      const response = await fetch(apiUrl)
      const result = await response.json()

      console.log('📡 [DEBUG] API Response:', result)
      setDebugInfo(result.debug || null)

      if (result.success && result.data) {
        console.log('✅ [DEBUG] Tracking data received:', result.data)
        setTrackingData(result.data)
        setLastUpdate(new Date())
        setError(null)
      } else {
        console.log('⚠️ [DEBUG] No tracking data in response')
        setError('No tracking data available for this device')
        setTrackingData(undefined)
      }
    } catch (err) {
      console.error('❌ [DEBUG] Error fetching tracking data:', err)
      setError('Failed to fetch tracking data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    setIsLoading(true)
    if (dogInfo?.deviceInfo?.deviceId) {
      fetchLatestTrackingData()
    } else {
      fetchDogInfo()
    }
  }

  const handleBackToDashboard = () => {
    router.push('/dashboard/monitoring')
  }

  const toggleDebug = () => {
    setShowDebug(!showDebug)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <div className="text-lg font-medium">Loading...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (!dogInfo && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-lg font-medium">Dog not found</div>
          <Button onClick={handleBackToDashboard} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Dog Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleBackToDashboard}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <div className="flex items-center space-x-3">
                {dogInfo?.imageUrl && (
                  <img 
                    src={dogInfo.imageUrl} 
                    alt={`${dogInfo.name}'s picture`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Dog className="w-6 h-6 mr-2" />
                    {dogInfo?.name || 'Dog'} - Live Tracking
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {dogInfo?.breed} • {dogInfo?.age} years old
                    {dogInfo?.deviceInfo && (
                      <span className="ml-2">
                        • Device: {dogInfo.deviceInfo.deviceId}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant="default" className="bg-green-600">
                Live Tracking
              </Badge>
              <Button
                onClick={toggleDebug}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Bug className="w-4 h-4" />
                <span>Debug</span>
              </Button>
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                size="sm"
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
          
          {lastUpdate && (
            <div className="mt-4 text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Debug Panel */}
        {showDebug && (
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 mb-6 font-mono text-sm">
            <h3 className="text-white font-bold mb-3">🔍 Debug Information</h3>
            <div className="space-y-2">
              <div><strong>Dog ID:</strong> {params.dogId}</div>
              <div><strong>Device ID:</strong> {dogInfo?.deviceInfo?.deviceId || 'Not assigned'}</div>
              <div><strong>Has Tracking Data:</strong> {trackingData ? 'YES' : 'NO'}</div>
              <div><strong>GPS Valid:</strong> {trackingData?.gpsValid ? 'YES' : 'NO'}</div>
              {debugInfo && (
                <div>
                  <strong>API Debug:</strong>
                  <pre className="mt-2 bg-gray-800 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              )}
              {trackingData && (
                <div>
                  <strong>Tracking Data:</strong>
                  <pre className="mt-2 bg-gray-800 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(trackingData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">Error</span>
            </div>
            <div className="text-red-700 mt-1">{error}</div>
          </div>
        )}

        {!dogInfo?.deviceInfo && !isLoading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-800 font-medium">No Device Registered</span>
            </div>
            <div className="text-yellow-700 mt-1">
              This dog doesn't have a smart collar registered. Please edit the dog profile to add a device.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Dog className="w-5 h-5 mr-2" />
                  {dogInfo?.name}'s Live Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GPSMap trackingData={trackingData} height="500px" />
              </CardContent>
            </Card>
          </div>

          {/* Status Panel */}
          <div className="space-y-6">
            {/* Battery Status */}
            <Card>
              <CardHeader>
                <CardTitle>Battery Status</CardTitle>
              </CardHeader>
              <CardContent>
                <BatteryStatus level={trackingData?.battery || 0} />
              </CardContent>
            </Card>

            {/* Device Status */}
            <Card>
              <CardHeader>
                <CardTitle>Device Status</CardTitle>
              </CardHeader>
              <CardContent>
                <DeviceStatus 
                  trackingData={trackingData} 
                  deviceInfo={dogInfo?.deviceInfo}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}