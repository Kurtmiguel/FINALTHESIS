// components/NotificationCenter.tsx
'use client'

import { useState, useEffect } from 'react'
import { Bell, BellRing, AlertTriangle, CheckCircle, Shield, Battery, WifiOff, X, Eye, MoreVertical, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'

interface AlertData {
  _id: string
  alertType: 'geofence_exit' | 'geofence_entry' | 'battery_low' | 'device_offline'
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  isRead: boolean
  deviceId: string
  dogId: string
  dogName: string
  dogBreed: string
  dogImageUrl?: string
  geofenceId?: string
  geofenceName?: string
  geofenceType?: string
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

interface NotificationCenterProps {
  dogId?: string
  deviceId?: string
  refreshInterval?: number
}

export default function NotificationCenter({ 
  dogId, 
  deviceId, 
  refreshInterval = 30000 
}: NotificationCenterProps) {
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  useEffect(() => {
    fetchAlerts()
    
    // Set up automatic refresh
    const interval = setInterval(fetchAlerts, refreshInterval)
    return () => clearInterval(interval)
  }, [dogId, deviceId, refreshInterval])

  const fetchAlerts = async () => {
    try {
      setIsLoading(true)
      
      const params = new URLSearchParams({
        limit: '20',
        ...(dogId && { dogId }),
        ...(deviceId && { deviceId })
      })
      
      const response = await fetch(`/api/alerts?${params}`)
      if (!response.ok) throw new Error('Failed to fetch alerts')
      
      const data = await response.json()
      setAlerts(data.alerts)
      setUnreadCount(data.pagination.unreadCount)
      setLastFetch(new Date())
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true })
      })
      
      if (response.ok) {
        setAlerts(prev => prev.map(alert => 
          alert._id === alertId ? { ...alert, isRead: true, readAt: new Date().toISOString() } : alert
        ))
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking alert as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadAlertIds = alerts.filter(alert => !alert.isRead).map(alert => alert._id)
      
      const response = await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertIds: unreadAlertIds, markAsRead: true })
      })
      
      if (response.ok) {
        setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true, readAt: new Date().toISOString() })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all alerts as read:', error)
    }
  }

  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isResolved: true })
      })
      
      if (response.ok) {
        setAlerts(prev => prev.map(alert => 
          alert._id === alertId ? { 
            ...alert, 
            isResolved: true, 
            isRead: true,
            resolvedAt: new Date().toISOString() 
          } : alert
        ))
        if (!alerts.find(a => a._id === alertId)?.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Error resolving alert:', error)
    }
  }

  const deleteAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        const deletedAlert = alerts.find(a => a._id === alertId)
        setAlerts(prev => prev.filter(alert => alert._id !== alertId))
        if (deletedAlert && !deletedAlert.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Error deleting alert:', error)
    }
  }

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'geofence_exit':
        return <Shield className="w-4 h-4 text-red-600" />
      case 'geofence_entry':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'battery_low':
        return <Battery className="w-4 h-4 text-yellow-600" />
      case 'device_offline':
        return <WifiOff className="w-4 h-4 text-gray-600" />
      default:
        return <AlertTriangle className="w-4 h-4 text-blue-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="w-4 h-4" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="destructive">{unreadCount}</Badge>
                )}
              </CardTitle>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    <Eye className="w-4 h-4 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {lastFetch && (
              <p className="text-xs text-gray-500">
                Last updated: {formatDistanceToNow(lastFetch, { addSuffix: true })}
              </p>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {isLoading && alerts.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400 animate-pulse" />
                    <div className="text-gray-500">Loading notifications...</div>
                  </div>
                </div>
              ) : alerts.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <div className="text-gray-500">No notifications</div>
                    <div className="text-xs text-gray-400 mt-1">All clear!</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-0">
                  {alerts.map((alert) => (
                    <div
                      key={alert._id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        !alert.isRead ? 'bg-blue-50' : ''
                      } ${alert.isResolved ? 'opacity-75' : ''}`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Alert Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {getAlertIcon(alert.alertType)}
                        </div>
                        
                        {/* Alert Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`text-sm font-medium ${!alert.isRead ? 'font-semibold' : ''}`}>
                                {alert.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {alert.message}
                              </p>
                              
                              {/* Alert Metadata */}
                              <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                                <span>{alert.dogName}</span>
                                <span>•</span>
                                <span>{formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}</span>
                                {alert.coordinates && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center">
                                      <MapPin className="w-3 h-3 mr-1" />
                                      GPS
                                    </span>
                                  </>
                                )}
                              </div>
                              
                              {/* Severity Badge */}
                              <div className="mt-2">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getSeverityColor(alert.severity)}`}
                                >
                                  {alert.severity.toUpperCase()}
                                </Badge>
                                {alert.isResolved && (
                                  <Badge variant="outline" className="ml-2 text-xs bg-green-100 text-green-800">
                                    RESOLVED
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            {/* Action Menu */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {!alert.isRead && (
                                  <DropdownMenuItem onClick={() => markAsRead(alert._id)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Mark as read
                                  </DropdownMenuItem>
                                )}
                                {!alert.isResolved && alert.alertType === 'geofence_exit' && (
                                  <DropdownMenuItem onClick={() => resolveAlert(alert._id)}>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Mark as resolved
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  onClick={() => deleteAlert(alert._id)}
                                  className="text-red-600"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            {alerts.length > 0 && (
              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <Button variant="ghost" size="sm" onClick={fetchAlerts} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
                  ) : (
                    <Bell className="w-4 h-4 mr-2" />
                  )}
                  {isLoading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}