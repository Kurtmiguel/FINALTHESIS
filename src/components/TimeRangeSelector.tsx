// components/TimeRangeSelector.tsx
'use client'

import { useState } from 'react'
import { Calendar, Clock, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TimeRangeSelectorProps {
  onTimeRangeChange: (startDate: string, endDate: string) => void
  isLoading?: boolean
  totalPoints?: number
  selectedRange?: string
}

interface QuickRange {
  label: string
  value: string
  getRange: () => { start: Date; end: Date }
}

const quickRanges: QuickRange[] = [
  {
    label: 'Last Hour',
    value: 'last_hour',
    getRange: () => {
      const end = new Date()
      const start = new Date(end.getTime() - 60 * 60 * 1000) // 1 hour ago
      return { start, end }
    }
  },
  {
    label: 'Today',
    value: 'today',
    getRange: () => {
      const end = new Date()
      const start = new Date(end)
      start.setHours(0, 0, 0, 0) // Start of today
      return { start, end }
    }
  },
  {
    label: 'Yesterday',
    value: 'yesterday',
    getRange: () => {
      const end = new Date()
      end.setDate(end.getDate() - 1)
      end.setHours(23, 59, 59, 999) // End of yesterday
      
      const start = new Date(end)
      start.setHours(0, 0, 0, 0) // Start of yesterday
      return { start, end }
    }
  },
  {
    label: 'Last 3 Days',
    value: 'last_3_days',
    getRange: () => {
      const end = new Date()
      const start = new Date(end.getTime() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      return { start, end }
    }
  },
  {
    label: 'Last Week',
    value: 'last_week',
    getRange: () => {
      const end = new Date()
      const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      return { start, end }
    }
  },
  {
    label: 'Last Month',
    value: 'last_month',
    getRange: () => {
      const end = new Date()
      const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      return { start, end }
    }
  }
]

export default function TimeRangeSelector({ 
  onTimeRangeChange, 
  isLoading = false,
  totalPoints = 0,
  selectedRange = 'today'
}: TimeRangeSelectorProps) {
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [activeRange, setActiveRange] = useState(selectedRange)

  const handleQuickRangeSelect = (range: QuickRange) => {
    const { start, end } = range.getRange()
    setActiveRange(range.value)
    setShowCustom(false)
    
    console.log('📅 [DEBUG] Quick range selected:', {
      label: range.label,
      start: start.toISOString(),
      end: end.toISOString()
    })
    
    onTimeRangeChange(start.toISOString(), end.toISOString())
  }

  const handleCustomRangeApply = () => {
    if (!customStartDate || !customEndDate) {
      alert('Please select both start and end dates')
      return
    }

    const start = new Date(customStartDate)
    const end = new Date(customEndDate)
    
    if (start > end) {
      alert('Start date must be before end date')
      return
    }

    // Set end time to end of day
    end.setHours(23, 59, 59, 999)
    
    setActiveRange('custom')
    
    console.log('📅 [DEBUG] Custom range applied:', {
      start: start.toISOString(),
      end: end.toISOString()
    })
    
    onTimeRangeChange(start.toISOString(), end.toISOString())
  }

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const getCurrentRangeLabel = () => {
    const range = quickRanges.find(r => r.value === activeRange)
    return range?.label || 'Custom Range'
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Time Range</h3>
            </div>
            {totalPoints > 0 && (
              <Badge variant="secondary">
                {totalPoints} GPS points
              </Badge>
            )}
          </div>

          {/* Current Selection Display */}
          <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              {getCurrentRangeLabel()}
            </span>
            {isLoading && (
              <div className="ml-auto">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {/* Quick Range Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {quickRanges.map((range) => (
              <Button
                key={range.value}
                variant={activeRange === range.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickRangeSelect(range)}
                disabled={isLoading}
                className="text-xs"
              >
                {range.label}
              </Button>
            ))}
          </div>

          {/* Custom Range Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustom(!showCustom)}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Custom Date Range</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showCustom ? 'rotate-180' : ''}`} />
          </Button>

          {/* Custom Range Inputs */}
          {showCustom && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    max={formatDateForInput(new Date())}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    max={formatDateForInput(new Date())}
                    min={customStartDate}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <Button
                onClick={handleCustomRangeApply}
                disabled={!customStartDate || !customEndDate || isLoading}
                size="sm"
                className="w-full"
              >
                Apply Custom Range
              </Button>
            </div>
          )}

          {/* Legend */}
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Start of day</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>End of day</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>GPS tracking points</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}