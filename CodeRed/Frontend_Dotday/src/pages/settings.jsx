import React, { useState, useEffect } from 'react'
import { getAuth, updateProfile, deleteUser, signOut } from 'firebase/auth'
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import db from '../firebase/firestore'

import Sidebar from '../components/sidebar'
import { 
    User, 
    Bell, 
    Mail, 
    Heart, 
    Trash2, 
    Save, 
    Edit, 
    X, 
    Check,
    AlertTriangle,
    Shield,
    LogOut,
    Settings as SettingsIcon,
    UserCheck,
    UserX
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Settings = () => {
    const { user, loading } = useAuth();

    const [profileForm, setProfileForm] = useState({ displayName: '', email: '' })
    const [notificationSettings, setNotificationSettings] = useState({ periodReminders: true, cycleInsights: true, wellnessTips: true, partnerUpdates: true })
    const [partnerConnection, setPartnerConnection] = useState({ partnerEmail: '', connectionStatus: 'disconnected', partnerName: '' })
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showPartnerModal, setShowPartnerModal] = useState(false)
    // If you want a loading spinner for Firestore data, use this:
    // const [dataLoading, setDataLoading] = useState(true)

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // setDataLoading(true) // Uncomment if you want a separate spinner
                const auth = getAuth()
                const currentUser = auth.currentUser

                if (!currentUser) {
                    setError('No user signed in')
                    // setDataLoading(false)
                    return
                }


                setProfileForm({
                    displayName: currentUser.displayName || '',
                    email: currentUser.email || ''
                })

                // Fetch user settings from Firestore
                const userDocRef = doc(db, 'users', currentUser.uid)
                const userSnap = await getDoc(userDocRef)

                if (userSnap.exists()) {
                    const data = userSnap.data()
                    
                    // Load notification settings
                    if (data.notificationSettings) {
                        setNotificationSettings(data.notificationSettings)
                    }
                    
                    // Load partner connection data
                    if (data.partnerConnection) {
                        setPartnerConnection(data.partnerConnection)
                    } else if (data.normalMode?.onboarding?.partnerEmail) {
                        // If partner connection is in onboarding data, use that
                        setPartnerConnection({
                            partnerEmail: data.normalMode.onboarding.partnerEmail,
                            connectionStatus: 'connected',
                            partnerName: 'Partner'
                        })
                    }
                }
            } catch (err) {
                console.error('Error fetching user data:', err)
                setError('Failed to load user data')
            } finally {
                // setDataLoading(false)
            }
        }
        fetchUserData()
    }, [])

    if (loading) {
        return <div>Loading...</div>;
    }
    if (!user) {
        return (
            <div className="flex h-screen w-screen bg-gray-50">
                <main className="flex-1 p-8 transition-all duration-300">
                    <div className="max-w-4xl">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h2 className="text-red-800 font-semibold">Error Loading Settings</h2>
                            <p className="text-red-600">No user signed in</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const updateUserProfile = async () => {
        try {
            const auth = getAuth()
            const currentUser = auth.currentUser

            if (!currentUser) {
                alert('No user signed in')
                return
            }

            // Update Firebase Auth profile
            await updateProfile(currentUser, {
                displayName: profileForm.displayName
            })

            // Update Firestore user data
            const userDocRef = doc(db, 'users', currentUser.uid)
            await updateDoc(userDocRef, {
                displayName: profileForm.displayName,
                email: profileForm.email,
                updatedAt: new Date()
            })

            setSuccess('Profile updated successfully!')
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            console.error('Error updating profile:', err)
            setError('Failed to update profile')
            setTimeout(() => setError(null), 3000)
        }
    }

    const updateNotificationSettings = async () => {
        try {
            const auth = getAuth()
            const currentUser = auth.currentUser

            if (!currentUser) {
                alert('No user signed in')
                return
            }

            const userDocRef = doc(db, 'users', currentUser.uid)
            await updateDoc(userDocRef, {
                notificationSettings: notificationSettings,
                updatedAt: new Date()
            })

            setSuccess('Notification settings updated!')
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            console.error('Error updating notification settings:', err)
            setError('Failed to update notification settings')
            setTimeout(() => setError(null), 3000)
        }
    }

    const connectPartner = async () => {
        try {
            const auth = getAuth()
            const currentUser = auth.currentUser

            if (!currentUser) {
                alert('No user signed in')
                return
            }

            if (!partnerConnection.partnerEmail) {
                alert('Please enter partner email')
                return
            }

            const userDocRef = doc(db, 'users', currentUser.uid)
            
            // Automatically connect partner and send welcome email
            const updatedPartnerConnection = {
                partnerEmail: partnerConnection.partnerEmail,
                connectionStatus: 'connected',
                partnerName: 'Partner',
                connectedAt: new Date().toISOString()
            }

            await updateDoc(userDocRef, {
                partnerConnection: updatedPartnerConnection,
                updatedAt: new Date()
            })

            setPartnerConnection(updatedPartnerConnection)

            setSuccess('Partner connected successfully!')

            setTimeout(() => setSuccess(null), 3000)
            setShowPartnerModal(false)
        } catch (err) {
            console.error('Error connecting partner:', err)
            setError('Failed to connect partner')
            setTimeout(() => setError(null), 3000)
        }
    }

    const disconnectPartner = async () => {
        try {
            const auth = getAuth()
            const currentUser = auth.currentUser

            if (!currentUser) {
                alert('No user signed in')
                return
            }

            const userDocRef = doc(db, 'users', currentUser.uid)
            await updateDoc(userDocRef, {
                partnerConnection: {
                    partnerEmail: '',
                    connectionStatus: 'disconnected',
                    partnerName: '',
                    disconnectedAt: new Date()
                },
                updatedAt: new Date()
            })

            setPartnerConnection({
                partnerEmail: '',
                connectionStatus: 'disconnected',
                partnerName: ''
            })

            setSuccess('Partner disconnected successfully!')
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            console.error('Error disconnecting partner:', err)
            setError('Failed to disconnect partner')
            setTimeout(() => setError(null), 3000)
        }
    }

    const deleteUserAccount = async () => {
        try {
            const auth = getAuth()
            const currentUser = auth.currentUser

            if (!currentUser) {
                alert('No user signed in')
                return
            }

            // Delete user data from Firestore
            const userDocRef = doc(db, 'users', currentUser.uid)
            await deleteDoc(userDocRef)

            // Delete user account from Firebase Auth
            await deleteUser(currentUser)

            setSuccess('Account deleted successfully!')
            setTimeout(() => {
                window.location.href = '/'
            }, 2000)
        } catch (err) {
            console.error('Error deleting account:', err)
            setError('Failed to delete account. Please try again.')
            setTimeout(() => setError(null), 3000)
        }
    }

    const handleSignOut = async () => {
        try {
            const auth = getAuth()
            await signOut(auth)
            window.location.href = '/'
        } catch (err) {
            console.error('Error signing out:', err)
            setError('Failed to sign out')
            setTimeout(() => setError(null), 3000)
        }
    }

    const getConnectionStatusColor = (status) => {
        switch (status) {
            case 'connected': return 'bg-green-100 text-green-800'
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'disconnected': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getConnectionStatusIcon = (status) => {
        switch (status) {
            case 'connected': return <UserCheck className="h-4 w-4" />
            case 'pending': return <AlertTriangle className="h-4 w-4" />
            case 'disconnected': return <UserX className="h-4 w-4" />
            default: return <UserX className="h-4 w-4" />
        }
    }

    return (
        <div className="flex h-screen w-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <SettingsIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                Settings
                            </h1>
                            <p className="text-gray-600">Manage your account and preferences</p>
                        </div>
                    </div>

                    {/* Success/Error Messages */}
                    {success && (
                        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2">
                                <Check className="h-5 w-5 text-green-600" />
                                <p className="text-green-800">{success}</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                <p className="text-red-800">{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Profile Settings */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Display Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileForm.displayName}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, displayName: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="Enter your email"
                                    />
                                </div>
                                
                                <button
                                    onClick={updateUserProfile}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    <Save className="h-4 w-4" />
                                    Save Changes
                                </button>
                            </div>
                        </div>

                        {/* Notification Settings */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <Bell className="h-5 w-5 text-yellow-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Period Reminders</p>
                                        <p className="text-sm text-gray-600">Get notified about upcoming periods</p>
                                    </div>
                                    <button
                                        onClick={() => setNotificationSettings(prev => ({ ...prev, periodReminders: !prev.periodReminders }))}
                                        className={`w-12 h-6 rounded-full transition-colors ${
                                            notificationSettings.periodReminders ? 'bg-purple-600' : 'bg-gray-300'
                                        }`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                            notificationSettings.periodReminders ? 'translate-x-6' : 'translate-x-1'
                                        }`}></div>
                                    </button>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Cycle Insights</p>
                                        <p className="text-sm text-gray-600">Receive personalized cycle insights</p>
                                    </div>
                                    <button
                                        onClick={() => setNotificationSettings(prev => ({ ...prev, cycleInsights: !prev.cycleInsights }))}
                                        className={`w-12 h-6 rounded-full transition-colors ${
                                            notificationSettings.cycleInsights ? 'bg-purple-600' : 'bg-gray-300'
                                        }`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                            notificationSettings.cycleInsights ? 'translate-x-6' : 'translate-x-1'
                                        }`}></div>
                                    </button>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Wellness Tips</p>
                                        <p className="text-sm text-gray-600">Get daily wellness and self-care tips</p>
                                    </div>
                                    <button
                                        onClick={() => setNotificationSettings(prev => ({ ...prev, wellnessTips: !prev.wellnessTips }))}
                                        className={`w-12 h-6 rounded-full transition-colors ${
                                            notificationSettings.wellnessTips ? 'bg-purple-600' : 'bg-gray-300'
                                        }`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                            notificationSettings.wellnessTips ? 'translate-x-6' : 'translate-x-1'
                                        }`}></div>
                                    </button>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Partner Updates</p>
                                        <p className="text-sm text-gray-600">Share updates with your partner</p>
                                    </div>
                                    <button
                                        onClick={() => setNotificationSettings(prev => ({ ...prev, partnerUpdates: !prev.partnerUpdates }))}
                                        className={`w-12 h-6 rounded-full transition-colors ${
                                            notificationSettings.partnerUpdates ? 'bg-purple-600' : 'bg-gray-300'
                                        }`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                            notificationSettings.partnerUpdates ? 'translate-x-6' : 'translate-x-1'
                                        }`}></div>
                                    </button>
                                </div>
                                
                                <button
                                    onClick={updateNotificationSettings}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    <Save className="h-4 w-4" />
                                    Save Notifications
                                </button>
                            </div>
                        </div>

                        {/* Partner Connection */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-pink-100 rounded-lg">
                                    <Heart className="h-5 w-5 text-pink-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Partner Connection</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        {getConnectionStatusIcon(partnerConnection.connectionStatus)}
                                        <div>
                                            <p className="font-medium text-gray-900">Connection Status</p>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConnectionStatusColor(partnerConnection.connectionStatus)}`}>
                                                {partnerConnection.connectionStatus.charAt(0).toUpperCase() + partnerConnection.connectionStatus.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {partnerConnection.connectionStatus === 'connected' && (
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <p className="text-sm text-green-800">
                                            <strong>Connected with:</strong> {partnerConnection.partnerName || partnerConnection.partnerEmail}
                                        </p>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    {partnerConnection.connectionStatus === 'disconnected' && (
                                        <button
                                            onClick={() => setShowPartnerModal(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                                        >
                                            <Mail className="h-4 w-4" />
                                            Connect Partner
                                        </button>
                                    )}
                                    {partnerConnection.connectionStatus === 'connected' && (
                                        <button
                                            onClick={disconnectPartner}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                            Disconnect
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Account Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <Shield className="h-5 w-5 text-red-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Account Actions</h2>
                            </div>
                            
                            <div className="space-y-4">
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-2 w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </button>
                                
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="flex items-center gap-2 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Partner Connection Modal */}
            {showPartnerModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Connect Partner</h3>
                            <button
                                onClick={() => setShowPartnerModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 mb-4">
                                Add your partner's email to automatically send them period notifications and updates.
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Partner Email
                                </label>
                                <input
                                    type="email"
                                    value={partnerConnection.partnerEmail}
                                    onChange={(e) => setPartnerConnection(prev => ({ ...prev, partnerEmail: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Enter partner's email address"
                                />
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={connectPartner}
                                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    Connect Partner
                                </button>
                                <button
                                    onClick={() => setShowPartnerModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Account Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
                        </div>
                        
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
                        </p>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={deleteUserAccount}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete Account
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Settings
