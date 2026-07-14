import React, { useState, useEffect } from 'react'
import { getAuth } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import db from '../firebase/firestore'
import Sidebar from '../components/sidebar'
import { 
    Calendar, 
    TrendingUp, 
    Activity, 
    Heart, 
    Zap, 
    Smile, 
    Frown, 
    Clock,
    Target,
    BarChart3,
    PieChart as PieChartIcon,
    LineChart as LineChartIcon,
    Calendar as CalendarIcon,
    Droplets,
    AlertCircle,
    CheckCircle,
    Info
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts'

// Professional Recharts component for cycle length trends
const CycleLengthChart = ({ periodDates, currentMode }) => {
    // Filter out invalid or obviously wrong dates (e.g., before 2010)
    const validDates = periodDates.filter(date => date instanceof Date && !isNaN(date) && date.getFullYear() > 2010);
    if (validDates.length < 2) return null;

    const sortedDates = [...validDates].sort((a, b) => a - b)
    const cycleData = []

    for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i-1])
        const currDate = new Date(sortedDates[i])
        
        prevDate.setHours(0, 0, 0, 0)
        currDate.setHours(0, 0, 0, 0)
        
        const daysDiff = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24))
        
        const minCycleLength = currentMode === "normal" ? 21 : 60
        const maxCycleLength = currentMode === "normal" ? 45 : 120
        
        if (daysDiff >= minCycleLength && daysDiff <= maxCycleLength) {
            cycleData.push({
                cycle: `Cycle ${cycleData.length + 1}`,
                length: daysDiff,
                date: currDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            })
        }
    }

    if (cycleData.length === 0) return null

    const average = Math.round(cycleData.reduce((sum, item) => sum + item.length, 0) / cycleData.length)
    const maxValue = Math.max(...cycleData.map(item => item.length))
    const minValue = Math.min(...cycleData.map(item => item.length))
    const range = maxValue - minValue

    // Add average line data
    const chartData = cycleData.map(item => ({
        ...item,
        average: average,
        isAboveAverage: item.length > average,
        isBelowAverage: item.length < average
    }))

    const COLORS = {
        above: '#ef4444',
        below: '#10b981', 
        average: '#3b82f6'
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Cycle Length Trends</h3>
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                    <div className="text-sm text-gray-600">Average</div>
                    <div className="text-lg font-bold text-blue-600">{average} days</div>
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-600">Range</div>
                    <div className="text-lg font-bold text-green-600">{range} days</div>
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-600">Total Cycles</div>
                    <div className="text-lg font-bold text-purple-600">{cycleData.length}</div>
                </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="cycle" 
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis 
                            tick={{ fontSize: 12 }}
                            label={{ value: 'Days', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload
                                    return (
                                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                            <p className="font-semibold">{label}</p>
                                            <p className="text-sm text-gray-600">
                                                Length: <span className="font-semibold">{data.length} days</span>
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Average: <span className="font-semibold">{data.average} days</span>
                                            </p>
                                            <p className={`text-sm font-semibold ${
                                                data.isAboveAverage ? 'text-red-600' : 
                                                data.isBelowAverage ? 'text-green-600' : 
                                                'text-blue-600'
                                            }`}>
                                                {data.isAboveAverage ? '↑ Above Average' : 
                                                 data.isBelowAverage ? '↓ Below Average' : 
                                                 '= Average'}
                                            </p>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Bar 
                            dataKey="length" 
                            radius={[4, 4, 0, 0]}
                        >
                            {chartData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={
                                        entry.isAboveAverage ? COLORS.above :
                                        entry.isBelowAverage ? COLORS.below :
                                        COLORS.average
                                    } 
                                />
                            ))}
                        </Bar>
                        {/* Average line */}
                        <Line 
                            type="monotone" 
                            dataKey="average" 
                            stroke="#6b7280" 
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            dot={false}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.below }}></div>
                    <span>Below Average</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.average }}></div>
                    <span>Average</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.above }}></div>
                    <span>Above Average</span>
                </div>
            </div>
        </div>
    )
}

// Professional Recharts component for period duration patterns
const PeriodDurationChart = ({ periodDates }) => {
    // Filter out invalid or obviously wrong dates (e.g., before 2010)
    const validDates = periodDates.filter(date => date instanceof Date && !isNaN(date) && date.getFullYear() > 2010);
    if (validDates.length === 0) return null;

    const sortedDates = [...validDates].sort((a, b) => a - b)
    const periodData = []

    for (let i = 0; i < sortedDates.length; i++) {
        const startDate = new Date(sortedDates[i])
        startDate.setHours(0, 0, 0, 0)
        
        let consecutiveDays = 1
        for (let j = i + 1; j < sortedDates.length; j++) {
            const nextDate = new Date(sortedDates[j])
            nextDate.setHours(0, 0, 0, 0)
            
            const daysDiff = Math.round((nextDate - startDate) / (1000 * 60 * 60 * 24))
            if (daysDiff === consecutiveDays) {
                consecutiveDays++
            } else {
                break
            }
        }
        
        if (consecutiveDays >= 1 && consecutiveDays <= 10) {
            periodData.push({
                period: `Period ${periodData.length + 1}`,
                duration: consecutiveDays,
                date: startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            })
        }
    }

    if (periodData.length === 0) return null

    const average = Math.round(periodData.reduce((sum, item) => sum + item.duration, 0) / periodData.length)
    const maxValue = Math.max(...periodData.map(item => item.duration))
    const minValue = Math.min(...periodData.map(item => item.duration))
    const range = maxValue - minValue

    // Add average line data
    const chartData = periodData.map(item => ({
        ...item,
        average: average,
        isAboveAverage: item.duration > average,
        isBelowAverage: item.duration < average
    }))

    const COLORS = {
        above: '#ef4444',
        below: '#10b981', 
        average: '#8b5cf6'
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Period Duration Patterns</h3>
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                    <div className="text-sm text-gray-600">Average</div>
                    <div className="text-lg font-bold text-purple-600">{average} days</div>
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-600">Range</div>
                    <div className="text-lg font-bold text-green-600">{range} days</div>
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-600">Total Periods</div>
                    <div className="text-lg font-bold text-blue-600">{periodData.length}</div>
                </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="period" 
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis 
                            tick={{ fontSize: 12 }}
                            label={{ value: 'Days', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload
                                    return (
                                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                            <p className="font-semibold">{label}</p>
                                            <p className="text-sm text-gray-600">
                                                Duration: <span className="font-semibold">{data.duration} days</span>
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Average: <span className="font-semibold">{data.average} days</span>
                                            </p>
                                            <p className={`text-sm font-semibold ${
                                                data.isAboveAverage ? 'text-red-600' : 
                                                data.isBelowAverage ? 'text-green-600' : 
                                                'text-purple-600'
                                            }`}>
                                                {data.isAboveAverage ? '↑ Longer' : 
                                                 data.isBelowAverage ? '↓ Shorter' : 
                                                 '= Average'}
                                            </p>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Bar 
                            dataKey="duration" 
                            radius={[4, 4, 0, 0]}
                        >
                            {chartData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={
                                        entry.isAboveAverage ? COLORS.above :
                                        entry.isBelowAverage ? COLORS.below :
                                        COLORS.average
                                    } 
                                />
                            ))}
                        </Bar>
                        {/* Average line */}
                        <Line 
                            type="monotone" 
                            dataKey="average" 
                            stroke="#6b7280" 
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            dot={false}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.below }}></div>
                    <span>Shorter</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.average }}></div>
                    <span>Average</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.above }}></div>
                    <span>Longer</span>
                </div>
            </div>
        </div>
    )
}

// Professional Recharts component for tracking consistency over time
const TrackingConsistencyChart = ({ trackingData }) => {
    // Filter out invalid or obviously wrong dates (e.g., before 2010)
    const validDateKeys = Object.keys(trackingData).filter(dateStr => {
        const date = new Date(dateStr);
        return date instanceof Date && !isNaN(date) && date.getFullYear() > 2010;
    });
    if (validDateKeys.length === 0) return null;

    const sortedDates = validDateKeys.sort();
    const consistencyData = [];

    // Group by month for better visualization
    const monthlyData = {};
    sortedDates.forEach(dateStr => {
        const date = new Date(dateStr);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { total: 0, complete: 0 };
        }
        monthlyData[monthKey].total++;
        const dayData = trackingData[dateStr];
        if (dayData && dayData.flowIntensity && dayData.moodScore && dayData.energyLevel && dayData.wellnessScore) {
            monthlyData[monthKey].complete++;
        }
    });

    Object.entries(monthlyData).forEach(([monthKey, data]) => {
        const monthName = new Date(monthKey + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const consistency = Math.round((data.complete / data.total) * 100);
        consistencyData.push({
            month: monthName,
            consistency: consistency,
            total: data.total,
            complete: data.complete
        });
    });

    if (consistencyData.length === 0) return null;

    const overallAverage = Math.round(consistencyData.reduce((sum, item) => sum + item.consistency, 0) / consistencyData.length)
    const bestMonth = Math.max(...consistencyData.map(item => item.consistency))
    const worstMonth = Math.min(...consistencyData.map(item => item.consistency))

    // Add average line data
    const chartData = consistencyData.map(item => ({
        ...item,
        average: overallAverage,
        isAboveAverage: item.consistency > overallAverage,
        isBelowAverage: item.consistency < overallAverage
    }))

    const COLORS = {
        excellent: '#10b981',
        good: '#f59e0b',
        poor: '#ef4444'
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Tracking Consistency Over Time</h3>
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                    <div className="text-sm text-gray-600">Overall</div>
                    <div className="text-lg font-bold text-green-600">{overallAverage}%</div>
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-600">Best Month</div>
                    <div className="text-lg font-bold text-blue-600">{bestMonth}%</div>
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-600">Worst Month</div>
                    <div className="text-lg font-bold text-red-600">{worstMonth}%</div>
                </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="month" 
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis 
                            tick={{ fontSize: 12 }}
                            label={{ value: 'Consistency %', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload
                                    return (
                                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                            <p className="font-semibold">{label}</p>
                                            <p className="text-sm text-gray-600">
                                                Consistency: <span className="font-semibold">{data.consistency}%</span>
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Complete: <span className="font-semibold">{data.complete}/{data.total}</span>
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Average: <span className="font-semibold">{data.average}%</span>
                                            </p>
                                            <p className={`text-sm font-semibold ${
                                                data.isAboveAverage ? 'text-green-600' : 
                                                data.isBelowAverage ? 'text-red-600' : 
                                                'text-gray-600'
                                            }`}>
                                                {data.isAboveAverage ? '↑ Above Average' : 
                                                 data.isBelowAverage ? '↓ Below Average' : 
                                                 '= Average'}
                                            </p>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Bar 
                            dataKey="consistency" 
                            radius={[4, 4, 0, 0]}
                        >
                            {chartData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={
                                        entry.consistency >= 80 ? COLORS.excellent :
                                        entry.consistency >= 60 ? COLORS.good :
                                        COLORS.poor
                                    } 
                                />
                            ))}
                        </Bar>
                        {/* Average line */}
                        <Line 
                            type="monotone" 
                            dataKey="average" 
                            stroke="#6b7280" 
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            dot={false}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.excellent }}></div>
                    <span>Excellent (80%+)</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.good }}></div>
                    <span>Good (60-79%)</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.poor }}></div>
                    <span>Needs Improvement (&lt;60%)</span>
                </div>
            </div>
        </div>
    );
}

// Professional Recharts component for symptom frequency with color management
const SymptomFrequencyChart = ({ trackingData }) => {
    // Filter out invalid or obviously wrong dates (e.g., before 2010)
    const validDateKeys = Object.keys(trackingData).filter(dateStr => {
        const date = new Date(dateStr);
        return date instanceof Date && !isNaN(date) && date.getFullYear() > 2010;
    });
    const symptomFrequency = {}
    
    validDateKeys.forEach(dateStr => {
        const dayData = trackingData[dateStr];
        if (!dayData || typeof dayData !== 'object') return
        
        if (dayData.symptoms && Array.isArray(dayData.symptoms)) {
            dayData.symptoms.forEach(symptom => {
                if (symptom) {
                    symptomFrequency[symptom] = (symptomFrequency[symptom] || 0) + 1
                }
            })
        }
    })

    const topSymptoms = Object.entries(symptomFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([symptom, count]) => ({ 
            symptom: symptom.replace('_', ' '), 
            count,
            frequency: count
        }))

    if (topSymptoms.length === 0) return null

    const maxCount = Math.max(...topSymptoms.map(s => s.count))
    const totalSymptoms = topSymptoms.reduce((sum, item) => sum + item.count, 0)

    // Color palette for symptoms - using shadcn-inspired colors
    const SYMPTOM_COLORS = [
        '#f97316', // orange-500
        '#ef4444', // red-500
        '#8b5cf6', // purple-500
        '#06b6d4', // cyan-500
        '#10b981', // emerald-500
        '#f59e0b', // amber-500
        '#ec4899', // pink-500
        '#6366f1', // indigo-500
        '#84cc16', // lime-500
        '#f43f5e'  // rose-500
    ]

    // Add color and percentage data
    const chartData = topSymptoms.map((item, index) => ({
        ...item,
        color: SYMPTOM_COLORS[index % SYMPTOM_COLORS.length],
        percentage: Math.round((item.count / totalSymptoms) * 100),
        isMostFrequent: item.count === maxCount
    }))

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Symptom Frequency</h3>
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                    <div className="text-sm text-gray-600">Total Symptoms</div>
                    <div className="text-lg font-bold text-orange-600">{totalSymptoms}</div>
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-600">Most Frequent</div>
                    <div className="text-lg font-bold text-red-600">{maxCount}x</div>
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-600">Unique Symptoms</div>
                    <div className="text-lg font-bold text-purple-600">{topSymptoms.length}</div>
                </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="symptom" 
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis 
                            tick={{ fontSize: 12 }}
                            label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload
                                    return (
                                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                            <p className="font-semibold capitalize">{label}</p>
                                            <p className="text-sm text-gray-600">
                                                Frequency: <span className="font-semibold">{data.count}x</span>
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Percentage: <span className="font-semibold">{data.percentage}%</span>
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Total Symptoms: <span className="font-semibold">{totalSymptoms}</span>
                                            </p>
                                            {data.isMostFrequent && (
                                                <p className="text-sm font-semibold text-orange-600">
                                                    🏆 Most Frequent Symptom
                                                </p>
                                            )}
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Bar 
                            dataKey="count" 
                            radius={[4, 4, 0, 0]}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            {/* Legend with colors */}
            <div className="mt-4">
                <div className="text-sm font-semibold text-gray-700 mb-2 text-center">Symptom Types</div>
                <div className="flex flex-wrap justify-center gap-3 text-xs">
                    {chartData.map((item) => (
                        <div key={item.symptom} className="flex items-center gap-1">
                            <div 
                                className="w-3 h-3 rounded" 
                                style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="capitalize">{item.symptom}</span>
                            {item.isMostFrequent && (
                                <span className="text-orange-600 font-semibold">🏆</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

const Insights = () => {
    const { user } = useAuth();
    const [periodDates, setPeriodDates] = useState([])
    const [trackingData, setTrackingData] = useState({})
    const [currentMode, setCurrentMode] = useState("normal")
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const auth = getAuth()
                const user = auth.currentUser

                if (!user) {
                    setError('No user signed in')
                    setLoading(false)
                    return
                }

                const userDocRef = doc(db, 'users', user.uid)
                const userSnap = await getDoc(userDocRef)

                if (userSnap.exists()) {
                    const data = userSnap.data()
                    
                    // Auto-detect which mode to use based on available data
                    const normalModeData = data.normalMode || {}
                    const tricyclingModeData = data.tricyclingMode || {}
                    
                    const normalHasData = normalModeData.onboarding || (normalModeData.periodDates && normalModeData.periodDates.length > 0)
                    const tricyclingHasData = tricyclingModeData.onboarding || (tricyclingModeData.periodDates && tricyclingModeData.periodDates.length > 0)
                    
                    let selectedMode = "normal"
                    let modeData = normalModeData
                    
                    if (tricyclingHasData && !normalHasData) {
                        selectedMode = "tricycling"
                        modeData = tricyclingModeData
                    } else if (normalHasData) {
                        selectedMode = "normal"
                        modeData = normalModeData
                    }
                    
                    setCurrentMode(selectedMode)
                    
                    if (modeData.periodDates) {
                        const dates = modeData.periodDates.map(dateStr => new Date(dateStr)).filter(date => date instanceof Date && !isNaN(date) && date.getFullYear() > 2010);
                        setPeriodDates(dates)
                    } else {
                        setPeriodDates([])
                    }

                    if (modeData.trackingData) {
                        setTrackingData(modeData.trackingData)
                    } else {
                        setTrackingData({})
                    }
                } else {
                    setPeriodDates([])
                    setTrackingData({})
                }
            } catch (err) {
                console.error('Error fetching user data:', err)
                setError('Failed to load user data')
            } finally {
                setLoading(false)
            }
        }

        fetchUserData()
    }, [])

    // FIX: Check loading first, then user
    if (loading) {
        return (
            <div className="flex h-screen w-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 p-8 transition-all duration-300">
                    <div className="max-w-4xl">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
                            <div className="h-4 bg-gray-200 rounded mb-8 w-1/2"></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        )
    }
    if (!user) {
        return (
            <div className="flex h-screen w-screen bg-gray-50">
                <main className="flex-1 p-8 transition-all duration-300">
                    <div className="max-w-4xl">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h2 className="text-red-800 font-semibold">Error Loading Insights</h2>
                            <p className="text-red-600">No user signed in</p>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    // Calculate insights from the data
    const calculateInsights = () => {
        if (periodDates.length === 0) {
            return {
                hasData: false,
                message: "Start tracking your periods to see insights!"
            }
        }

        const sortedDates = [...periodDates].sort((a, b) => a - b)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Cycle Analysis
        let cycleLengths = []
        let totalCycleDays = 0
        let cycleCount = 0

        for (let i = 1; i < sortedDates.length; i++) {
            const prevDate = new Date(sortedDates[i-1])
            const currDate = new Date(sortedDates[i])
            
            prevDate.setHours(0, 0, 0, 0)
            currDate.setHours(0, 0, 0, 0)
            
            const daysDiff = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24))
            
            const minCycleLength = currentMode === "normal" ? 21 : 60
            const maxCycleLength = currentMode === "normal" ? 45 : 120
            
            if (daysDiff >= minCycleLength && daysDiff <= maxCycleLength) {
                cycleLengths.push(daysDiff)
                totalCycleDays += daysDiff
                cycleCount++
            }
        }

        const averageCycleLength = cycleCount > 0 ? Math.round(totalCycleDays / cycleCount) : null
        const cycleRegularity = cycleLengths.length > 1 ? 
            Math.round((1 - (Math.max(...cycleLengths) - Math.min(...cycleLengths)) / averageCycleLength) * 100) : 100

        // Period Duration Analysis
        let periodDurations = []
        let totalPeriodDays = 0
        let periodCount = 0

        for (let i = 0; i < sortedDates.length; i++) {
            const startDate = new Date(sortedDates[i])
            startDate.setHours(0, 0, 0, 0)
            
            let consecutiveDays = 1
            for (let j = i + 1; j < sortedDates.length; j++) {
                const nextDate = new Date(sortedDates[j])
                nextDate.setHours(0, 0, 0, 0)
                
                const daysDiff = Math.round((nextDate - startDate) / (1000 * 60 * 60 * 24))
                if (daysDiff === consecutiveDays) {
                    consecutiveDays++
                } else {
                    break
                }
            }
            
            if (consecutiveDays >= 1 && consecutiveDays <= 10) {
                periodDurations.push(consecutiveDays)
                totalPeriodDays += consecutiveDays
                periodCount++
            }
        }

        const averagePeriodDuration = periodCount > 0 ? Math.round(totalPeriodDays / periodCount) : null

        // Symptom Analysis
        const symptomFrequency = {}
        const moodFrequency = {}
        const energyFrequency = {}
        const wellnessFrequency = {}
        const flowIntensityFrequency = {}

        Object.values(trackingData).forEach(dayData => {
            // Skip if dayData is null or undefined
            if (!dayData || typeof dayData !== 'object') {
                return
            }
            
            if (dayData.symptoms && Array.isArray(dayData.symptoms)) {
                dayData.symptoms.forEach(symptom => {
                    if (symptom) {
                        symptomFrequency[symptom] = (symptomFrequency[symptom] || 0) + 1
                    }
                })
            }
            if (dayData.moodScore && dayData.moodScore !== null && dayData.moodScore !== undefined) {
                moodFrequency[dayData.moodScore] = (moodFrequency[dayData.moodScore] || 0) + 1
            }
            if (dayData.energyLevel && dayData.energyLevel !== null && dayData.energyLevel !== undefined) {
                energyFrequency[dayData.energyLevel] = (energyFrequency[dayData.energyLevel] || 0) + 1
            }
            if (dayData.wellnessScore && dayData.wellnessScore !== null && dayData.wellnessScore !== undefined) {
                wellnessFrequency[dayData.wellnessScore] = (wellnessFrequency[dayData.wellnessScore] || 0) + 1
            }
            if (dayData.flowIntensity && dayData.flowIntensity !== null && dayData.flowIntensity !== undefined) {
                flowIntensityFrequency[dayData.flowIntensity] = (flowIntensityFrequency[dayData.flowIntensity] || 0) + 1
            }
        })

        // Most common symptoms
        const topSymptoms = Object.entries(symptomFrequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([symptom, count]) => ({ symptom, count }))

        // Most common mood
        const mostCommonMood = Object.entries(moodFrequency)
            .sort(([,a], [,b]) => b - a)[0]

        // Most common energy level
        const mostCommonEnergy = Object.entries(energyFrequency)
            .sort(([,a], [,b]) => b - a)[0]

        // Most common wellness score
        const mostCommonWellness = Object.entries(wellnessFrequency)
            .sort(([,a], [,b]) => b - a)[0]

        // Most common flow intensity
        const mostCommonFlow = Object.entries(flowIntensityFrequency)
            .sort(([,a], [,b]) => b - a)[0]

        // Tracking consistency
        const totalTrackedDays = Object.keys(trackingData).length
        const daysWithCompleteData = Object.values(trackingData).filter(dayData => 
            dayData && 
            typeof dayData === 'object' &&
            dayData.flowIntensity && 
            dayData.moodScore && 
            dayData.energyLevel && 
            dayData.wellnessScore
        ).length

        const trackingConsistency = totalTrackedDays > 0 ? Math.round((daysWithCompleteData / totalTrackedDays) * 100) : 0

        return {
            hasData: true,
            averageCycleLength,
            cycleRegularity,
            averagePeriodDuration,
            totalPeriods: sortedDates.length,
            topSymptoms,
            mostCommonMood: mostCommonMood ? { mood: mostCommonMood[0], count: mostCommonMood[1] } : null,
            mostCommonEnergy: mostCommonEnergy ? { energy: mostCommonEnergy[0], count: mostCommonEnergy[1] } : null,
            mostCommonWellness: mostCommonWellness ? { wellness: mostCommonWellness[0], count: mostCommonWellness[1] } : null,
            mostCommonFlow: mostCommonFlow ? { flow: mostCommonFlow[0], count: mostCommonFlow[1] } : null,
            trackingConsistency,
            totalTrackedDays,
            daysWithCompleteData
        }
    }

    const insights = calculateInsights()

    // Only show 'No Data Available Yet' if loading is false and periodDates is empty
    if (!loading && periodDates.length === 0) {
        return (
            <div className="flex h-screen w-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 overflow-x-hidden">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                            Your Period Insights 📊
                        </h1>
                        <p className="text-gray-600 mb-6 sm:mb-8">
                            Understanding your patterns and trends
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                            <div className="text-blue-500 mb-4">
                                {/* Chart icon */}
                                <svg width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="24" fill="#E0E7FF"/><path d="M16 32V24M24 32V16M32 32V28" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                No Data Available Yet
                            </h3>
                            <p className="text-blue-700 mb-4">
                                Start tracking your periods to see insights!
                            </p>
                            <p className="text-sm text-blue-600">
                                Start tracking your periods in the calendar to see personalized insights!
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="flex h-screen w-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 overflow-x-hidden">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                        Your Period Insights 📊
                    </h1>
                    <p className="text-gray-600 mb-6 sm:mb-8">
                        Understanding your patterns and trends
                    </p>

                    {!insights.hasData ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                            <div className="text-blue-500 mb-4">
                                <BarChart3 className="h-12 w-12 mx-auto" />
                            </div>
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                No Data Available Yet
                            </h3>
                            <p className="text-blue-700 mb-4">
                                {insights.message}
                            </p>
                            <p className="text-sm text-blue-600">
                                Start tracking your periods in the calendar to see personalized insights!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6 sm:space-y-8">
                            {/* Charts Section */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900">📈 Your Data Visualizations</h2>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <CycleLengthChart periodDates={periodDates} currentMode={currentMode} />
                                    <PeriodDurationChart periodDates={periodDates} />
                                </div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <TrackingConsistencyChart trackingData={trackingData} />
                                    <SymptomFrequencyChart trackingData={trackingData} />
                                </div>
                            </div>

                            {/* Cycle Analysis */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-pink-100 rounded-lg">
                                            <Calendar className="h-5 w-5 text-pink-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Cycle Length</h3>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 mb-2">
                                        {insights.averageCycleLength} days
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Average cycle length from {insights.totalPeriods} periods
                                    </p>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <TrendingUp className="h-5 w-5 text-green-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Cycle Regularity</h3>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 mb-2">
                                        {insights.cycleRegularity}%
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {insights.cycleRegularity >= 80 ? "Very regular" : 
                                         insights.cycleRegularity >= 60 ? "Moderately regular" : "Irregular"} cycles
                                    </p>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Droplets className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Period Duration</h3>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 mb-2">
                                        {insights.averagePeriodDuration} days
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Average period length
                                    </p>
                                </div>
                            </div>

                            {/* Tracking Insights */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <CheckCircle className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Tracking Consistency</h3>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 mb-2">
                                        {insights.trackingConsistency}%
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Complete data tracking rate
                                    </p>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-orange-100 rounded-lg">
                                            <Activity className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Most Common Flow</h3>
                                    </div>
                                    <div className="text-xl font-bold text-gray-900 mb-2 capitalize">
                                        {insights.mostCommonFlow ? insights.mostCommonFlow.flow : "No data"}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {insights.mostCommonFlow ? `${insights.mostCommonFlow.count} times tracked` : "Start tracking flow intensity"}
                                    </p>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-yellow-100 rounded-lg">
                                            <Smile className="h-5 w-5 text-yellow-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Most Common Mood</h3>
                                    </div>
                                    <div className="text-xl font-bold text-gray-900 mb-2 capitalize">
                                        {insights.mostCommonMood ? insights.mostCommonMood.mood : "No data"}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {insights.mostCommonMood ? `${insights.mostCommonMood.count} times tracked` : "Start tracking your mood"}
                                    </p>
                                </div>
                            </div>

                            {/* Energy & Wellness */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <Zap className="h-5 w-5 text-green-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Most Common Energy Level</h3>
                                    </div>
                                    <div className="text-xl font-bold text-gray-900 mb-2 capitalize">
                                        {insights.mostCommonEnergy ? insights.mostCommonEnergy.energy.replace('_', ' ') : "No data"}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {insights.mostCommonEnergy ? `${insights.mostCommonEnergy.count} times tracked` : "Start tracking your energy"}
                                    </p>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <Heart className="h-5 w-5 text-red-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Most Common Wellness</h3>
                                    </div>
                                    <div className="text-xl font-bold text-gray-900 mb-2 capitalize">
                                        {insights.mostCommonWellness ? insights.mostCommonWellness.wellness.replace('_', ' ') : "No data"}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {insights.mostCommonWellness ? `${insights.mostCommonWellness.count} times tracked` : "Start tracking your wellness"}
                                    </p>
                                </div>
                            </div>

                            {/* Top Symptoms */}
                            {insights.topSymptoms.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <AlertCircle className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Most Common Symptoms</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {insights.topSymptoms.map((symptom, index) => (
                                            <div key={symptom.symptom} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">
                                                        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                                                    </span>
                                                    <span className="font-medium text-gray-900 capitalize">
                                                        {symptom.symptom.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-gray-600">
                                                    {symptom.count} times
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recommendations */}
                            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200 p-4 sm:p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-pink-100 rounded-lg">
                                        <Info className="h-5 w-5 text-pink-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Personalized Recommendations</h3>
                                </div>
                                <div className="space-y-3">
                                    {insights.trackingConsistency < 50 && (
                                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-gray-900">Improve Tracking Consistency</p>
                                                <p className="text-sm text-gray-600">Try to complete all tracking steps when marking periods for better insights.</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {insights.cycleRegularity < 70 && (
                                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                                            <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-gray-900">Irregular Cycles Detected</p>
                                                <p className="text-sm text-gray-600">Consider tracking more consistently to better understand your cycle patterns.</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {insights.topSymptoms.length > 0 && insights.topSymptoms[0].count > 3 && (
                                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                                            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-gray-900">Frequent Symptoms</p>
                                                <p className="text-sm text-gray-600">Consider discussing persistent symptoms with your healthcare provider.</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {insights.totalPeriods >= 3 && (
                                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-gray-900">Great Progress!</p>
                                                <p className="text-sm text-gray-600">You've tracked {insights.totalPeriods} periods. Keep up the good work!</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default Insights
