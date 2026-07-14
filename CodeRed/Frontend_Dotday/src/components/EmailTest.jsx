import React, { useState } from 'react'
import { sendPeriodAlertEmail, sendPeriodStartedEmail } from '../services/emailService'
import { Button } from './ui/button'
import { Mail, AlertCircle, CheckCircle } from 'lucide-react'

const EmailTest = () => {
  const [testResult, setTestResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const testPeriodAlert = async () => {
    setLoading(true)
    setTestResult(null)
    
    try {
      const result = await sendPeriodAlertEmail(
        'test@example.com', // Replace with actual partner email
        'Test Partner',
        'Test User',
        3
      )
      
      setTestResult({
        success: result.success,
        message: result.message
      })
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error: ${error.message}`
      })
    } finally {
      setLoading(false)
    }
  }

  const testPeriodStarted = async () => {
    setLoading(true)
    setTestResult(null)
    
    try {
      const result = await sendPeriodStartedEmail(
        'test@example.com', // Replace with actual partner email
        'Test Partner',
        'Test User'
      )
      
      setTestResult({
        success: result.success,
        message: result.message
      })
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error: ${error.message}`
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Mail className="h-5 w-5 text-blue-600" />
        Email Notification Test
      </h3>
      
      <div className="space-y-4">
        <div className="flex gap-3">
          <Button 
            onClick={testPeriodAlert}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4" />
            Test Period Alert
          </Button>
          
          <Button 
            onClick={testPeriodStarted}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Test Period Started
          </Button>
        </div>
        
        {loading && (
          <div className="text-blue-600 text-sm">
            Sending test email...
          </div>
        )}
        
        {testResult && (
          <div className={`p-3 rounded-lg text-sm ${
            testResult.success 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span>{testResult.message}</span>
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-600 mt-4">
          <p><strong>Note:</strong> Make sure you've set up EmailJS with your credentials in <code>src/services/emailService.js</code></p>
          <p>Replace 'test@example.com' with an actual email address to test.</p>
        </div>
      </div>
    </div>
  )
}

export default EmailTest 