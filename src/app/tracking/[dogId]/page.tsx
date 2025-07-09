// app/tracking/[dogId]/page.tsx - Enhanced with History Feature
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { TrackingData } from '@/types/tracking'
import GPSMapWithHistory from '@/components/GPSMapWithHistory'
import BatteryStatus from '@/components/BatteryStatus'
import DeviceStatus from '@/components/DeviceStatus'
import TimeRangeSelector from '@/components/TimeRangeSelector'
import { RefreshCw, AlertTriangle, ArrowLeft, Dog, Bug, History, Radio, BarChart3, MapPin, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

interface HistoricalPoint {
  latitude: number
  longitude: number
  timestamp: string
  createdAt: string
  battery: number
}

interface HistoryResponse {
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

export default function DogTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  
  // Live tracking state
  const [trackingData, setTrackingData] = useState<TrackingData | undefined>(undefined)
  const [dogInfo, setDogInfo] = useState<DogInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [showDebug, setShowDebug] = useState(false)
  
  // History state
  const [activeTab, setActiveTab] = useState<'live' | 'history'>('live')
  const [historicalData, setHistoricalData] = useState<HistoricalPoint[]>([])
  const [historyResponse, setHistoryResponse] = useState<HistoryResponse | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState('today')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && params.dogId) {
      fetchDogInfo()
    }
  }, [status, params.dogId, router])

  useEffect(() => {
    if (dogInfo?.deviceInfo?.deviceId && activeTab === 'live') {
      console.log('🔍 [DEBUG] Starting live tracking for device:', dogInfo.deviceInfo.deviceId)
      fetchLatestTrackingData()
      
      // Set up polling every 5 seconds for live data
      const interval = setInterval(fetchLatestTrackingData, 5000)
      return () => clearInterval(interval)
    }
  }, [dogInfo, activeTab])

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
      
      console.log('🔍 [DEBUG] Fetching live tracking data from:', apiUrl)
      
      const response = await fetch(apiUrl)
      const result = await response.json()

      console.log('📡 [DEBUG] Live API Response:', result)
      setDebugInfo(result.debug || null)

      if (result.success && result.data) {
        console.log('✅ [DEBUG] Live tracking data received:', result.data)
        setTrackingData(result.data)
        setLastUpdate(new Date())
        setError(null)
      } else {
        console.log('⚠️ [DEBUG] No live tracking data in response')
        setError('No tracking data available for this device')
        setTrackingData(undefined)
      }
    } catch (err) {
      console.error('❌ [DEBUG] Error fetching live tracking data:', err)
      setError('Failed to fetch tracking data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchHistoricalData = async (startDate: string, endDate: string) => {
    if (!dogInfo?.deviceInfo?.deviceId) {
      console.log('⚠️ [DEBUG] No device ID available for history')
      return
    }

    setIsLoadingHistory(true)
    setHistoryError(null)

    try {
      const deviceId = dogInfo.deviceInfo.deviceId
      const apiUrl = `/api/tracking-data/history?deviceId=${deviceId}&startDate=${startDate}&endDate=${endDate}&limit=1000`
      
      console.log('🔍 [DEBUG] Fetching historical data from:', apiUrl)
      console.log('📅 [DEBUG] Date range:', { startDate, endDate })
      
      const response = await fetch(apiUrl)
      const result: HistoryResponse = await response.json()

      console.log('📊 [DEBUG] History API Response:', result)

      if (result.success) {
        console.log('✅ [DEBUG] Historical data received:', result.totalPoints, 'points')
        setHistoricalData(result.data)
        setHistoryResponse(result)
        setHistoryError(null)
      } else {
        console.log('⚠️ [DEBUG] No historical data in response')
        setHistoryError('No historical data found for the selected time period')
        setHistoricalData([])
        setHistoryResponse(null)
      }
    } catch (err) {
      console.error('❌ [DEBUG] Error fetching historical data:', err)
      setHistoryError('Failed to fetch historical data')
      setHistoricalData([])
      setHistoryResponse(null)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleTimeRangeChange = (startDate: string, endDate: string) => {
    console.log('📅 [DEBUG] Time range changed:', { startDate, endDate })
    fetchHistoricalData(startDate, endDate)
  }

  const handleTabChange = (tab: 'live' | 'history') => {
    console.log('🔄 [DEBUG] Switching to tab:', tab)
    setActiveTab(tab)
    
    if (tab === 'history' && dogInfo?.deviceInfo?.deviceId) {
      // Load today's data by default when switching to history
      const today = new Date()
      const startOfDay = new Date(today)
      startOfDay.setHours(0, 0, 0, 0)
      
      fetchHistoricalData(startOfDay.toISOString(), today.toISOString())
    }
  }

  const handleRefresh = () => {
    setIsLoading(true)
    if (activeTab === 'live') {
      if (dogInfo?.deviceInfo?.deviceId) {
        fetchLatestTrackingData()
      } else {
        fetchDogInfo()
      }
    } else {
      // Refresh history data with current time range
      if (historyResponse) {
        const { start, end } = historyResponse.dateRange
        if (start && end) {
          fetchHistoricalData(start, end)
        }
      }
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
      <div className="max-w-7xl mx-auto">
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
                    {dogInfo?.name || 'Dog'} - GPS Tracking
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
              <Badge 
                variant={activeTab === 'live' ? 'default' : 'secondary'} 
                className={activeTab === 'live' ? 'bg-green-600' : ''}
              >
                {activeTab === 'live' ? (
                  <>
                    <Radio className="w-3 h-3 mr-1" />
                    Live Tracking
                  </>
                ) : (
                  <>
                    <History className="w-3 h-3 mr-1" />
                    History View
                  </>
                )}
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
                disabled={isLoading || isLoadingHistory}
                size="sm"
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${(isLoading || isLoadingHistory) ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
          
          {lastUpdate && activeTab === 'live' && (
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
              <div><strong>Active Tab:</strong> {activeTab}</div>
              <div><strong>Has Live Data:</strong> {trackingData ? 'YES' : 'NO'}</div>
              <div><strong>Has History Data:</strong> {historicalData.length > 0 ? `YES (${historicalData.length} points)` : 'NO'}</div>
              {trackingData && (
                <div><strong>GPS Valid:</strong> {trackingData?.gpsValid ? 'YES' : 'NO'}</div>
              )}
              {debugInfo && (
                <div>
                  <strong>API Debug:</strong>
                  <pre className="mt-2 bg-gray-800 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {error && activeTab === 'live' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">Error</span>
            </div>
            <div className="text-red-700 mt-1">{error}</div>
          </div>
        )}

        {historyError && activeTab === 'history' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">History Error</span>
            </div>
            <div className="text-red-700 mt-1">{historyError}</div>
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

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as 'live' | 'history')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="live" className="flex items-center space-x-2">
              <Radio className="w-4 h-4" />
              <span>Live Tracking</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span>History</span>
            </TabsTrigger>
          </TabsList>

          {/* Live Tracking Tab */}
          <TabsContent value="live" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Live Map */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Radio className="w-5 h-5 mr-2 text-green-600" />
                      {dogInfo?.name}'s Live Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GPSMapWithHistory 
                      trackingData={trackingData} 
                      height="500px" 
                      showHistory={false}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Live Status Panel */}
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
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* History Map */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <History className="w-5 h-5 mr-2 text-blue-600" />
                      {dogInfo?.name}'s Movement History
                      {isLoadingHistory && (
                        <RefreshCw className="w-4 h-4 ml-2 animate-spin text-blue-600" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GPSMapWithHistory 
                      historicalData={historicalData}
                      groupedByDate={historyResponse?.groupedByDate}
                      height="500px" 
                      showHistory={true}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* History Controls Panel */}
              <div className="space-y-6">
                {/* Time Range Selector */}
                <TimeRangeSelector
                  onTimeRangeChange={handleTimeRangeChange}
                  isLoading={isLoadingHistory}
                  totalPoints={historyResponse?.totalPoints || 0}
                  selectedRange={selectedTimeRange}
                />

                {/* History Statistics */}
                {historyResponse && historyResponse.totalPoints > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2" />
                        Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Points:</span>
                          <span className="font-medium">{historyResponse.totalPoints}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Days with Data:</span>
                          <span className="font-medium">{historyResponse.summary.datesWithData.length}</span>
                        </div>
                        {historyResponse.summary.firstPoint && (
                          <div className="text-sm">
                            <div className="text-gray-600 mb-1">First Point:</div>
                            <div className="text-xs text-gray-500">
                              {new Date(historyResponse.summary.firstPoint.createdAt).toLocaleString()}
                            </div>
                          </div>
                        )}
                        {historyResponse.summary.lastPoint && (
                          <div className="text-sm">
                            <div className="text-gray-600 mb-1">Last Point:</div>
                            <div className="text-xs text-gray-500">
                              {new Date(historyResponse.summary.lastPoint.createdAt).toLocaleString()}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Daily Breakdown */}
                {historyResponse?.groupedByDate && Object.keys(historyResponse.groupedByDate).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        Daily Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {Object.entries(historyResponse.groupedByDate).map(([date, points], index) => (
                          <div key={date} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ 
                                  backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'][index % 8]
                                }}
                              ></div>
                              <span className="text-sm">
                                {new Date(date).toLocaleDateString()}
                              </span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {points.length} points
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}