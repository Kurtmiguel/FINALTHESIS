'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { TrackingData } from '@/types/tracking'
import GPSMap from '@/components/GPSMap'
import BatteryStatus from '@/components/BatteryStatus'
import DeviceStatus from '@/components/DeviceStatus'
import { RefreshCw, AlertTriangle, ArrowLeft, Dog } from 'lucide-react'
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && params.dogId) {
      fetchDogInfo()
    }
  }, [status, params.dogId, router])

  useEffect(() => {
    if (dogInfo?.deviceInfo?.deviceId) {
      fetchLatestTrackingData()
      
      // Set up polling every 5 seconds
      const interval = setInterval(fetchLatestTrackingData, 5000)
      return () => clearInterval(interval)
    }
  }, [dogInfo])

  const fetchDogInfo = async () => {
    try {
      const response = await fetch(`/api/dogs/${params.dogId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch dog information')
      }
      
      const dog = await response.json()
      setDogInfo(dog)
      setError(null)
    } catch (err) {
      setError('Failed to load dog information')
      console.error('Error fetching dog info:', err)
    }
  }

  const fetchLatestTrackingData = async () => {
    if (!dogInfo?.deviceInfo?.deviceId) return

    try {
      const response = await fetch(`/api/tracking-data?latest=true&deviceId=${dogInfo.deviceInfo.deviceId}`)
      const result = await response.json()

      if (result.success && result.data) {
        setTrackingData(result.data)
        setLastUpdate(new Date())
        setError(null)
      } else {
        setError('No tracking data available for this device')
      }
    } catch (err) {
      setError('Failed to fetch tracking data')
      console.error('Error fetching tracking data:', err)
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
                <DeviceStatus trackingData={trackingData} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}