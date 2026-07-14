import React, { useState, useEffect } from 'react'
import { getAuth } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import db from '../firebase/firestore'
import { sendPeriodStartedNotification, checkAndSendPeriodAlert } from '../services/emailService'
import Sidebar from '../components/sidebar'

const EmailTest = () => {
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [testResult, setTestResult] = useState(null)

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const auth = getAuth()
                const user = auth.currentUser

                if (!user) {
                    setTestResult('No user signed in')
                    setLoading(false)
                    return
                }

                const userDocRef = doc(db, 'users', user.uid)
                const userSnap = await getDoc(userDocRef)

                if (userSnap.exists()) {
                    setUserData(userSnap.data())
                } else {
                    setTestResult('No user data found')
                }
            } catch (error) {
                console.error('Error fetching user data:', error)
                setTestResult('Error fetching user data')
            } finally {
                setLoading(false)
            }
        }

        fetchUserData()
    }, [])

    const testPeriodStartedEmail = async () => {
        if (!userData) {
            setTestResult('No user data available')
            return
        }

        try {
            setTestResult('Sending period started email...')
            const result = await sendPeriodStartedNotification(userData)
            setTestResult(result.success ? 
                `✅ Period started email sent successfully! ${result.message}` : 
                `❌ Failed to send period started email: ${result.message}`)
        } catch (error) {
            console.error('Error testing period started email:', error)
            setTestResult(`❌ Error: ${error.message}`)
        }
    }

    const testPeriodAlertEmail = async () => {
        if (!userData) {
            setTestResult('No user data available')
            return
        }

        try {
            setTestResult('Checking for period alerts...')
            const result = await checkAndSendPeriodAlert(userData)
            setTestResult(result.success ? 
                `✅ Period alert email sent successfully! ${result.message}` : 
                `ℹ️ Period alert check completed: ${result.message}`)
        } catch (error) {
            console.error('Error testing period alert email:', error)
            setTestResult(`❌ Error: ${error.message}`)
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen w-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                        <span className="ml-3 text-gray-600">Loading...</span>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="flex h-screen w-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Email Testing</h1>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Partner Connection Status</h2>
                        {userData?.partnerConnection ? (
                            <div className="space-y-2">
                                <p><strong>Partner Email:</strong> {userData.partnerConnection.partnerEmail}</p>
                                <p><strong>Status:</strong> {userData.partnerConnection.connectionStatus}</p>
                                <p><strong>Partner Updates Enabled:</strong> {userData.notificationSettings?.partnerUpdates ? 'Yes' : 'No'}</p>
                            </div>
                        ) : (
                            <p className="text-gray-600">No partner connected</p>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Email Functions</h2>
                        <div className="space-y-4">
                            <div>
                                <button
                                    onClick={testPeriodStartedEmail}
                                    className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium"
                                >
                                    Test Period Started Email
                                </button>
                                <p className="text-sm text-gray-600 mt-1">
                                    Sends immediate notification when period is logged
                                </p>
                            </div>
                            
                            <div>
                                <button
                                    onClick={testPeriodAlertEmail}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
                                >
                                    Test 3-Day Period Alert
                                </button>
                                <p className="text-sm text-gray-600 mt-1">
                                    Checks if period is within 3 days and sends alert email
                                </p>
                            </div>
                        </div>
                    </div>

                    {testResult && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Result</h3>
                            <p className="text-gray-700 whitespace-pre-wrap">{testResult}</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default EmailTest 