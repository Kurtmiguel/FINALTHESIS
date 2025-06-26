'use client'

import { Battery, BatteryLow, Zap } from 'lucide-react'

interface BatteryStatusProps {
  level: number
  className?: string
}

export default function BatteryStatus({ level, className = '' }: BatteryStatusProps) {
  const getBatteryColor = (level: number) => {
    if (level > 50) return 'bg-green-500'
    if (level > 20) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getBatteryIcon = (level: number) => {
    if (level > 20) return <Battery className="w-5 h-5" />
    return <BatteryLow className="w-5 h-5 text-red-500" />
  }

  const getBatteryText = (level: number) => {
    if (level > 80) return 'Excellent'
    if (level > 50) return 'Good'
    if (level > 20) return 'Low'
    return 'Critical'
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {getBatteryIcon(level)}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Battery</span>
          <div className="text-right">
            <span className="text-sm text-gray-600">{level}%</span>
            <div className="text-xs text-gray-400">{getBatteryText(level)}</div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${getBatteryColor(level)}`}
            style={{ width: `${Math.max(level, 0)}%` }}
          />
        </div>
        {level < 20 && (
          <div className="text-xs text-red-500 mt-1 flex items-center">
            <Zap className="w-3 h-3 mr-1" />
            Low battery - Please charge soon
          </div>
        )}
      </div>
    </div>
  )
}