import React, { useState, useEffect } from 'react'
import { getAuth } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import db from '../firebase/firestore'
import Sidebar from '../components/sidebar'
import StatCard from '../components/StatCard'
import { checkAndSendPeriodAlert } from '../services/emailService'

const Dashboard = () => {
  const [userData, setUserData] = useState(null)
  const [periodDates, setPeriodDates] = useState([])
  const [onboardingData, setOnboardingData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentMode, setCurrentMode] = useState("normal") // Will be auto-detected
  const [trackingData, setTrackingData] = useState({}) // New state for tracking data

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const auth = getAuth()
        const user = auth.currentUser

        if (!user) {
          setError('No user signed in')
          setLoading(false)
          return
        }

        // Fetch user data from Firestore
        const userDocRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userDocRef)

        if (userSnap.exists()) {
          const data = userSnap.data()
          setUserData({
            username: data.username || user.displayName || 'User',
            email: data.email || user.email,
            createdAt: data.createdAt
          })
          
          // Auto-detect which mode to use based on available data
          const normalModeData = data.normalMode || {}
          const tricyclingModeData = data.tricyclingMode || {}
          
          console.log('Raw Firebase data:', data)
          console.log('Normal mode data:', normalModeData)
          console.log('Tricycling mode data:', tricyclingModeData)
          
          // Determine which mode has more complete data
          const normalHasData = normalModeData.onboarding || (normalModeData.periodDates && normalModeData.periodDates.length > 0)
          const tricyclingHasData = tricyclingModeData.onboarding || (tricyclingModeData.periodDates && tricyclingModeData.periodDates.length > 0)
          
          console.log('Data availability:', {
            normalHasData,
            tricyclingHasData,
            normalOnboarding: !!normalModeData.onboarding,
            tricyclingOnboarding: !!tricyclingModeData.onboarding,
            normalPeriodDates: normalModeData.periodDates?.length || 0,
            tricyclingPeriodDates: tricyclingModeData.periodDates?.length || 0
          })
          
          let selectedMode = "normal" // Default
          let modeData = normalModeData
          
          // Check if user has a saved mode preference
          const savedMode = data.selectedMode
          console.log('Saved mode preference:', savedMode)
          
          if (savedMode && savedMode === "tricycling" && tricyclingHasData) {
            // If user prefers tricycling and has tricycling data, use tricycling
            selectedMode = "tricycling"
            modeData = tricyclingModeData
          } else if (savedMode && savedMode === "normal" && normalHasData) {
            // If user prefers normal and has normal data, use normal
            selectedMode = "normal"
            modeData = normalModeData
          } else if (tricyclingHasData && !normalHasData) {
            // If only tricycling has data, use tricycling
            selectedMode = "tricycling"
            modeData = tricyclingModeData
          } else if (normalHasData) {
            // If normal has data (regardless of tricycling), use normal
            selectedMode = "normal"
            modeData = normalModeData
          }
          
          console.log('Selected mode:', selectedMode)
          console.log('Mode data being used:', modeData)
          
          setCurrentMode(selectedMode)
          setOnboardingData(modeData.onboarding || null)
          
          // Load period dates from Firebase
          if (modeData.periodDates && modeData.periodDates.length > 0) {
            const dates = modeData.periodDates.map(dateStr => new Date(dateStr))
            setPeriodDates(dates)
            console.log('Loaded period dates:', dates.map(d => d.toLocaleDateString()))
          } else {
            // If no period dates in Firebase, check if we have onboarding data with lastPeriodDate
            if (modeData.onboarding && modeData.onboarding.lastPeriodDate) {
              const onboardingDate = new Date(modeData.onboarding.lastPeriodDate)
              setPeriodDates([onboardingDate])
              console.log('Using onboarding last period date as logged period:', onboardingDate.toLocaleDateString())
            } else {
              setPeriodDates([])
              console.log('No period dates found in Firebase or onboarding')
            }
          }

          // Load tracking data for the current mode
          if (modeData.trackingData) {
            setTrackingData(modeData.trackingData)
            console.log('Loaded tracking data:', modeData.trackingData)
          } else {
            setTrackingData({})
            console.log('No tracking data found')
          }

          // Check for period alerts and send email to partner if needed
          try {
            const alertResult = await checkAndSendPeriodAlert(data)
            if (alertResult.success) {
              console.log('Period alert email sent to partner:', alertResult.message)
            } else {
              console.log('Period alert check completed:', alertResult.message)
            }
          } catch (alertError) {
            console.error('Error checking period alerts:', alertError)
          }

        } else {
          setUserData({
            username: user.displayName || 'User',
            email: user.email,
            createdAt: null
          })
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



  // Calculate dashboard stats from period data and onboarding data
  const calculateStats = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0] // Format: YYYY-MM-DD

    // Debug: Log the data being used
    console.log('Dashboard Debug:', {
      currentMode,
      onboardingData,
      periodDates: periodDates.map(d => d.toLocaleDateString()),
      periodDatesLength: periodDates.length
    })

    // Get today's tracking data
    const todayTrackingData = trackingData[todayStr] || {}
    console.log('Today\'s tracking data:', todayTrackingData)

    // Use onboarding data as primary source for new users
    const onboardingCycleLength = onboardingData?.cycleLength ? parseInt(onboardingData.cycleLength) : (currentMode === "normal" ? 28 : 84)
    const onboardingPeriodDuration = onboardingData?.periodDuration ? parseInt(onboardingData.periodDuration) : (currentMode === "normal" ? 5 : 3)
    const onboardingLastPeriodDate = onboardingData?.lastPeriodDate ? new Date(onboardingData.lastPeriodDate) : null

    console.log('Onboarding Data Debug:', {
      currentMode,
      onboardingCycleLength,
      onboardingPeriodDuration,
      onboardingLastPeriodDate: onboardingLastPeriodDate?.toLocaleDateString()
    })

    // For new users with no logged periods, use onboarding data
    if (periodDates.length === 0) {
      let nextPeriod = 'No data'
      let lastPeriod = 'No data'
      
      if (onboardingLastPeriodDate && onboardingCycleLength) {
        const nextPeriodDate = new Date(onboardingLastPeriodDate)
        nextPeriodDate.setDate(nextPeriodDate.getDate() + onboardingCycleLength)
        const daysUntilNext = Math.round((nextPeriodDate - today) / (1000 * 60 * 60 * 24))
        
        if (daysUntilNext > 0) {
          nextPeriod = `${daysUntilNext} days`
        } else if (daysUntilNext === 0) {
          nextPeriod = 'Due today'
        } else {
          nextPeriod = 'Overdue'
        }

        const daysSinceLast = Math.round((today - onboardingLastPeriodDate) / (1000 * 60 * 60 * 24))
        if (daysSinceLast >= 0) {
          lastPeriod = `${daysSinceLast} days ago`
        }
      }

      console.log('No logged periods - using onboarding data:', {
        nextPeriod,
        lastPeriod,
        cycleLength: `${onboardingCycleLength} Days`,
        periodDuration: `${onboardingPeriodDuration} days`
      })

      return {
        nextPeriod,
        cycleLength: `${onboardingCycleLength} Days`,
        moodToday: todayTrackingData.moodScore || 'Track your mood',
        energyLevel: todayTrackingData.energyLevel || 'Track your energy',
        wellnessScore: todayTrackingData.wellnessScore || 'Track your wellness',
        lastPeriod,
        periodDuration: `${onboardingPeriodDuration} days`,
        lastPeriodDate: onboardingLastPeriodDate ? onboardingLastPeriodDate.toLocaleDateString() : 'Not specified'
      }
    }

    // For users with logged periods, use logged data but fallback to onboarding
    const sortedDates = [...periodDates].sort((a, b) => a - b)
    const lastPeriodDate = sortedDates[sortedDates.length - 1]
    
    console.log('Logged periods data:', {
      sortedDates: sortedDates.map(d => d.toLocaleDateString()),
      lastPeriodDate: lastPeriodDate?.toLocaleDateString(),
      totalPeriods: sortedDates.length
    })
    
    // Calculate average cycle length from logged data, fallback to onboarding
    let calculatedCycleLength = onboardingCycleLength
    if (sortedDates.length >= 2) {
      let totalDays = 0
      let cycleCount = 0
      
      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i-1])
        const currDate = new Date(sortedDates[i])
        
        prevDate.setHours(0, 0, 0, 0)
        currDate.setHours(0, 0, 0, 0)
        
        const daysDiff = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24))
        
        console.log(`Cycle ${i}: ${prevDate.toLocaleDateString()} to ${currDate.toLocaleDateString()} = ${daysDiff} days`)
        
        // Mode-specific cycle length validation
        const minCycleLength = currentMode === "normal" ? 21 : 60 // Tricycling cycles are longer
        const maxCycleLength = currentMode === "normal" ? 45 : 120 // Tricycling cycles can be 84+ days
        
        if (daysDiff >= minCycleLength && daysDiff <= maxCycleLength) {
          totalDays += daysDiff
          cycleCount++
        }
      }
      
      if (cycleCount > 0) {
        calculatedCycleLength = Math.round(totalDays / cycleCount)
        console.log(`Calculated cycle length: ${totalDays} total days / ${cycleCount} cycles = ${calculatedCycleLength} days`)
      }
    }

    // Calculate next period using calculated cycle length
    let nextPeriod = 'N/A'
    if (lastPeriodDate && calculatedCycleLength) {
      const lastPeriod = new Date(lastPeriodDate)
      lastPeriod.setHours(0, 0, 0, 0)
      
      const nextPeriodDate = new Date(lastPeriod)
      nextPeriodDate.setDate(nextPeriodDate.getDate() + calculatedCycleLength)
      
      const daysUntilNext = Math.round((nextPeriodDate - today) / (1000 * 60 * 60 * 24))
      
      console.log('Next period calculation:', {
        lastPeriod: lastPeriod.toLocaleDateString(),
        calculatedCycleLength,
        nextPeriodDate: nextPeriodDate.toLocaleDateString(),
        daysUntilNext
      })
      
      if (daysUntilNext > 0) {
        nextPeriod = `${daysUntilNext} days`
      } else if (daysUntilNext === 0) {
        nextPeriod = 'Due today'
      } else {
        nextPeriod = 'Overdue'
      }
    }

    // Calculate days since last period
    let lastPeriod = 'N/A'
    if (lastPeriodDate) {
      const lastPeriodDateClean = new Date(lastPeriodDate)
      lastPeriodDateClean.setHours(0, 0, 0, 0)
      
      const daysSinceLast = Math.round((today - lastPeriodDateClean) / (1000 * 60 * 60 * 24))
      if (daysSinceLast >= 0) {
        lastPeriod = `${daysSinceLast} days ago`
      }
    }

    // Calculate period duration from logged data or use onboarding data
    let periodDuration = onboardingPeriodDuration
    if (periodDates.length > 0) {
      // Count consecutive days for the most recent period
      const recentDates = sortedDates.filter(date => {
        const daysDiff = Math.round((date - lastPeriodDate) / (1000 * 60 * 60 * 24))
        const maxPeriodDuration = currentMode === "normal" ? 10 : 7 // Tricycling periods are shorter
        return daysDiff >= 0 && daysDiff <= maxPeriodDuration
      })
      if (recentDates.length > 1) {
        periodDuration = recentDates.length
      }
    }

    const result = {
      nextPeriod,
      cycleLength: `${calculatedCycleLength} Days`,
      moodToday: todayTrackingData.moodScore || 'Track your mood',
      energyLevel: todayTrackingData.energyLevel || 'Track your energy',
      wellnessScore: todayTrackingData.wellnessScore || 'Track your wellness',
      lastPeriod,
      periodDuration: `${periodDuration} days`,
      lastPeriodDate: lastPeriodDate ? lastPeriodDate.toLocaleDateString() : 'Not logged'
    }

    console.log('Final dashboard stats:', result)
    return result
  }

  const stats = calculateStats()

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
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-8 transition-all duration-300">
          <div className="max-w-4xl">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h2 className="text-red-800 font-semibold">Error Loading Dashboard</h2>
              <p className="text-red-600">{error}</p>
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
            Welcome, {userData?.username || 'User'}! 🌸
          </h1>
          <p className="text-gray-600 mb-6 sm:mb-8">Here's your wellness overview for today</p>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <StatCard 
              title="Next Period" 
              value={stats.nextPeriod} 
              emoji="⚡" 
              subtitle="Based on your cycle data" 
            />
            <StatCard 
              title="Cycle Length" 
              value={stats.cycleLength} 
              emoji="🕓" 
              subtitle="Your average cycle" 
            />
            <StatCard 
              title="Period Duration" 
              value={stats.periodDuration} 
              emoji="📅" 
              subtitle="Your period length" 
            />
            <StatCard 
              title="Energy Level" 
              value={stats.energyLevel || "Track your energy"} 
              emoji="⚡" 
              subtitle="How energetic you feel" 
            />
            <StatCard 
              title="Overall Wellness" 
              value={stats.wellnessScore || "Track your wellness"} 
              emoji="💖" 
              subtitle="Your overall health" 
            />
            <StatCard 
              title="Mood Today" 
              value={stats.moodToday} 
              emoji="😊" 
              subtitle="How you're feeling" 
            />
          </div>

          {/* Today's Tracking Data */}
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Tracking Data</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <p className="text-sm text-gray-600">Flow Intensity:</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {trackingData[new Date().toISOString().split('T')[0]]?.flowIntensity || 'Not tracked'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mood Score:</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {trackingData[new Date().toISOString().split('T')[0]]?.moodScore || 'Not tracked'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Energy Level:</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {trackingData[new Date().toISOString().split('T')[0]]?.energyLevel || 'Not tracked'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Wellness Score:</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {trackingData[new Date().toISOString().split('T')[0]]?.wellnessScore || 'Not tracked'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Symptoms:</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {trackingData[new Date().toISOString().split('T')[0]]?.symptoms?.length || 0} tracked
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tracking Date:</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            
          </div>

          {/* Profile Information */}
          {onboardingData && (
            <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <p className="text-sm text-gray-600">Last Period Date:</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">
                    {onboardingData.lastPeriodDate ? 
                      new Date(onboardingData.lastPeriodDate).toLocaleDateString() : 
                      'Not specified'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Profile Cycle Length:</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">
                    {onboardingData.cycleLength ? `${onboardingData.cycleLength} days` : 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Profile Period Duration:</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">
                    {onboardingData.periodDuration ? `${onboardingData.periodDuration} days` : 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Period Data Summary */}
          {periodDates.length > 0 && (
            <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Period History</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total periods logged:</p>
                  <p className="text-xl sm:text-2xl font-bold text-pink-600">{periodDates.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Most recent period:</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">
                    {periodDates.length > 0 ? 
                      new Date(Math.max(...periodDates)).toLocaleDateString() : 
                      'No data'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Days since last period:</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">{stats.lastPeriod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Next period prediction:</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">{stats.nextPeriod}</p>
                </div>
              </div>
              

            </div>
          )}

          {/* New User Message */}
          {periodDates.length === 0 && onboardingData && (
            <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Welcome! Your Dashboard is Ready</h3>
              <p className="text-green-700 mb-4">
                Your dashboard is showing predictions based on the information you provided during onboarding.
              </p>
              <div className="bg-white p-3 sm:p-4 rounded-lg">
                <p className="text-sm text-green-800 mb-2"><strong>Your Profile Data:</strong></p>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Last Period: {onboardingData.lastPeriodDate ? new Date(onboardingData.lastPeriodDate).toLocaleDateString() : 'Not specified'}</li>
                  <li>• Cycle Length: {onboardingData.cycleLength || 'Not specified'} days</li>
                  <li>• Period Duration: {onboardingData.periodDuration || 'Not specified'} days</li>
                </ul>
              </div>
              <p className="text-sm text-green-600 mt-4">
                Start logging your periods in the calendar to get even more accurate predictions!
              </p>
            </div>
          )}

          {/* No Data Message */}
          {periodDates.length === 0 && !onboardingData && (
            <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Start Tracking Your Period</h3>
              <p className="text-blue-700 mb-4">
                Log your periods in the calendar to get personalized insights and predictions.
              </p>
              <p className="text-sm text-blue-600">
                Go to the Calendar page to mark your period days and start building your cycle data.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard

// import React from 'react'
// import Sidebar from '../components/sidebar'
// import StatCard from '../components/StatCard'

// const dashboard = () => {
//   return (
//      <div  className="flex h-screen w-screen bg-gray-50">
//       <Sidebar />
//       <main  className="flex-1 p-8 transition-all duration-300">
//         <div className="max-w-7xl mx-auto">
//           <h1 className="text-3xl font-bold text-gray-900 mb-4">Good Morning, Neha! 🌸</h1>
//           <p className="text-gray-600 mb-8">Here's your wellness overview for today</p>

//           {/* Stat Cards */}
//           {/* statcard vanne component banayera title, value, emoji, subtitle props pass garera statcard component use gareko */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             <StatCard title="Next Period" value="16 days" emoji="⚡" subtitle="Expected on March 15" />
//             <StatCard title="Cycle Length" value="28 Days" emoji="🕓" subtitle="Average this year" />
//             <StatCard title="MOOD TODAY" value="Great" emoji="☀️" subtitle="4.2/5 average" />
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }

// export default dashboard