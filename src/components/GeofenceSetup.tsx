// components/GeofenceSetup.tsx - Fixed TypeScript Issues
'use client'

import { useState, useEffect } from 'react'
import { MapPin, Shield, ShieldCheck, ShieldX, Smartphone, Home, Building2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { AlertCircle, CheckCircle } from 'lucide-react'

// Fixed: Consistent GeofenceData interface with required _id for existing geofences
interface GeofenceData {
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
  alertsEnabled: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Separate interface for creating new geofences
interface NewGeofenceData {
  name: string;
  centerLatitude: number;
  centerLongitude: number;
  radius: number;
  geofenceType: 'indoor' | 'outdoor';
  deviceId: string;
  dogId: string;
  alertsEnabled: boolean;
  description?: string;
}

interface TrackingData {
  latitude: number;
  longitude: number;
  gpsValid: boolean;
}

interface GeofenceSetupProps {
  dogId: string;
  dogName: string;
  deviceId: string;
  trackingData?: TrackingData;
  onGeofenceCreated: (geofence: GeofenceData) => void;
  onGeofenceUpdated: (geofence: GeofenceData) => void;
  onGeofenceDeleted: (geofenceId: string) => void;
}

export default function GeofenceSetup({
  dogId,
  dogName,
  deviceId,
  trackingData,
  onGeofenceCreated,
  onGeofenceUpdated,
  onGeofenceDeleted
}: GeofenceSetupProps) {
  const [existingGeofence, setExistingGeofence] = useState<GeofenceData | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    geofenceType: 'outdoor' as 'indoor' | 'outdoor',
    radius: 18, // Fixed 18m (60ft) radius
    alertsEnabled: true,
    description: ''
  })

  useEffect(() => {
    fetchExistingGeofence()
  }, [deviceId])

  const fetchExistingGeofence = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/geofences?deviceId=${deviceId}`)
      if (response.ok) {
        const geofences: GeofenceData[] = await response.json()
        if (geofences.length > 0) {
          const geofence = geofences[0]
          setExistingGeofence(geofence)
          setFormData({
            name: geofence.name,
            geofenceType: geofence.geofenceType,
            radius: geofence.radius,
            alertsEnabled: geofence.alertsEnabled,
            description: geofence.description || ''
          })
        }
      }
    } catch (error) {
      console.error('Error fetching geofence:', error)
      setError('Failed to load geofence data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateGeofence = async () => {
    if (!trackingData?.gpsValid) {
      setError('Cannot create geofence: GPS signal is required')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const payload: NewGeofenceData = {
        name: formData.name || `${dogName}'s Safe Zone`,
        centerLatitude: trackingData.latitude,
        centerLongitude: trackingData.longitude,
        radius: formData.radius,
        geofenceType: formData.geofenceType,
        deviceId,
        dogId,
        alertsEnabled: formData.alertsEnabled,
        description: formData.description
      }

      const response = await fetch('/api/geofences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create geofence')
      }

      const newGeofence: GeofenceData = await response.json()
      setExistingGeofence(newGeofence)
      setIsCreating(false)
      onGeofenceCreated(newGeofence)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateGeofence = async () => {
    if (!existingGeofence) return

    setIsSaving(true)
    setError(null)

    try {
      const payload = {
        name: formData.name,
        radius: formData.radius,
        geofenceType: formData.geofenceType,
        alertsEnabled: formData.alertsEnabled,
        description: formData.description
      }

      const response = await fetch(`/api/geofences/${existingGeofence._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update geofence')
      }

      const updatedGeofence: GeofenceData = await response.json()
      setExistingGeofence(updatedGeofence)
      setIsEditing(false)
      onGeofenceUpdated(updatedGeofence)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteGeofence = async () => {
    if (!existingGeofence || !confirm('Are you sure you want to delete this geofence?')) return

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/geofences/${existingGeofence._id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete geofence')
      }

      onGeofenceDeleted(existingGeofence._id)
      setExistingGeofence(null)
      setIsEditing(false)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleGeofenceStatus = async () => {
    if (!existingGeofence) return

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/geofences/${existingGeofence._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !existingGeofence.isActive })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to toggle geofence')
      }

      const updatedGeofence: GeofenceData = await response.json()
      setExistingGeofence(updatedGeofence)
      onGeofenceUpdated(updatedGeofence)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Shield className="w-8 h-8 mx-auto mb-2 animate-pulse" />
            <div>Loading geofence settings...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Safe Zone (Geofence)</span>
          {existingGeofence && (
            <Badge variant={existingGeofence.isActive ? "default" : "secondary"}>
              {existingGeofence.isActive ? 'Active' : 'Inactive'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        )}

        {!existingGeofence && !isCreating && (
          <div className="text-center py-6">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="font-medium mb-2">No Safe Zone Set</h3>
            <p className="text-gray-600 text-sm mb-4">
              Create a safe zone to get alerts when {dogName} goes beyond the set boundary.
            </p>
            <Button 
              onClick={() => setIsCreating(true)}
              disabled={!trackingData?.gpsValid}
              className="flex items-center space-x-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Create Safe Zone</span>
            </Button>
            {!trackingData?.gpsValid && (
              <p className="text-yellow-600 text-xs mt-2">
                GPS signal required to create geofence
              </p>
            )}
          </div>
        )}

        {existingGeofence && !isEditing && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {existingGeofence.geofenceType === 'indoor' ? (
                  <Home className="w-4 h-4 text-blue-600" />
                ) : (
                  <Building2 className="w-4 h-4 text-green-600" />
                )}
                <span className="font-medium">{existingGeofence.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  disabled={isSaving}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  variant={existingGeofence.isActive ? "destructive" : "default"}
                  size="sm"
                  onClick={toggleGeofenceStatus}
                  disabled={isSaving}
                >
                  {existingGeofence.isActive ? (
                    <ShieldX className="w-4 h-4" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Type:</span>
                <div className="font-medium capitalize">{existingGeofence.geofenceType}</div>
              </div>
              <div>
                <span className="text-gray-600">Radius:</span>
                <div className="font-medium">{existingGeofence.radius}m</div>
              </div>
              <div>
                <span className="text-gray-600">Alerts:</span>
                <div className="font-medium">
                  {existingGeofence.alertsEnabled ? (
                    <span className="text-green-600">Enabled</span>
                  ) : (
                    <span className="text-gray-500">Disabled</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <div className="font-medium text-xs">
                  {new Date(existingGeofence.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {existingGeofence.description && (
              <div className="text-sm">
                <span className="text-gray-600">Description:</span>
                <div className="mt-1 text-gray-800">{existingGeofence.description}</div>
              </div>
            )}

            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span className="text-blue-800 text-sm">
                Safe zone is {existingGeofence.isActive ? 'actively monitoring' : 'paused'}
              </span>
            </div>
          </div>
        )}

        {(isCreating || isEditing) && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Safe Zone Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={`${dogName}'s Safe Zone`}
                disabled={isSaving}
              />
            </div>

            <div>
              <Label htmlFor="type">Environment Type</Label>
              <Select
                value={formData.geofenceType}
                onValueChange={(value: 'indoor' | 'outdoor') => 
                  setFormData(prev => ({ ...prev, geofenceType: value }))
                }
                disabled={isSaving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indoor">
                    <div className="flex items-center space-x-2">
                      <Home className="w-4 h-4" />
                      <span>Indoor (18m/60ft)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="outdoor">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4" />
                      <span>Outdoor (18m/60ft)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="radius">Radius (meters)</Label>
              <Input
                id="radius"
                type="number"
                value={formData.radius}
                onChange={(e) => setFormData(prev => ({ ...prev, radius: parseInt(e.target.value) || 0 }))}
                min={1}
                max={18}
                disabled={isSaving}
              />
              <p className="text-xs text-gray-500 mt-1">
                Fixed radius: 60ft (18m) for optimal range
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="alerts"
                checked={formData.alertsEnabled}
                onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, alertsEnabled: checked }))}
                disabled={isSaving}
              />
              <Label htmlFor="alerts">Enable alerts when {dogName} leaves the safe zone</Label>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Home backyard safe area"
                rows={2}
                disabled={isSaving}
              />
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false)
                  setIsEditing(false)
                  setError(null)
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              {isCreating && (
                <Button
                  onClick={handleCreateGeofence}
                  disabled={isSaving || !trackingData?.gpsValid}
                  className="flex items-center space-x-2"
                >
                  {isSaving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                  <span>{isSaving ? 'Creating...' : 'Create Safe Zone'}</span>
                </Button>
              )}
              {isEditing && (
                <>
                  <Button
                    onClick={handleUpdateGeofence}
                    disabled={isSaving}
                    className="flex items-center space-x-2"
                  >
                    {isSaving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteGeofence}
                    disabled={isSaving}
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}