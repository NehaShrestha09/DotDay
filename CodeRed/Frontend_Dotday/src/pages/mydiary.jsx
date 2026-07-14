import React, { useState, useEffect } from 'react'
import { getAuth } from 'firebase/auth'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import db from '../firebase/firestore'
import Sidebar from '../components/sidebar'
import { 
    BookOpen, 
    Plus, 
    Edit, 
    Trash2, 
    Heart, 
    Lightbulb, 
    Smile,
    Frown,
    MessageCircle,
    Star,
    Calendar,
    Clock
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// Simple motivational message generator
const MotivationalMessage = ({ feeling }) => {
    const [message, setMessage] = useState('')

    useEffect(() => {
        generateMessage()
    }, [feeling])

    const generateMessage = () => {
        const messages = {
            happy: [
                "Your joy is contagious! Keep spreading that beautiful energy to everyone around you. 🌟",
                "You're radiating positivity today! The world needs more people like you. ✨",
                "Your happiness is a superpower. Use it to inspire and uplift others! 💫",
                "What a wonderful day to be alive! Your positive spirit is truly inspiring. 🌸",
                "You're doing amazing! Your happiness is a gift to the world. 🎁"
            ],
            good: [
                "You're in a great place today! Keep that positive momentum going. 🚀",
                "Your good mood is the perfect foundation for an amazing day ahead! 🌅",
                "You've got this! Your positive energy will carry you through anything. 💪",
                "Today is your day! Your good vibes are unstoppable. ⭐",
                "You're creating beautiful moments with your positive attitude! 🌈"
            ],
            okay: [
                "It's okay to have balanced days. Sometimes the best days are the quiet, steady ones. 🌤️",
                "You're doing great! Every day doesn't have to be extraordinary to be meaningful. 🌱",
                "Stability is valuable. You're building a strong foundation for your life. 🏗️",
                "You're exactly where you need to be right now. Trust the process. 🌿",
                "Sometimes the most peaceful days are the most productive ones. 🕊️"
            ],
            sad: [
                "It's okay to have difficult days. You're allowed to feel what you feel. 🤗",
                "Remember that this feeling is temporary. Tomorrow is a new day with new possibilities. 🌅",
                "Be gentle with yourself today. You're doing the best you can. 💝",
                "You're not alone in feeling this way. It's okay to ask for support. 🤝",
                "Your feelings are valid. Take time to care for yourself today. 🫂"
            ],
            terrible: [
                "I'm so sorry you're having such a hard time. You don't have to go through this alone. 🫂",
                "It's okay to not be okay. You're allowed to take time to heal. 💙",
                "Remember that this pain is temporary. You're stronger than you think. 💪",
                "You're not alone in this darkness. There are people who care about you. 🌟",
                "Be kind to yourself today. You deserve compassion and understanding. 💝"
            ]
        }

        if (feeling && messages[feeling]) {
            const randomMessage = messages[feeling][Math.floor(Math.random() * messages[feeling].length)]
            setMessage(randomMessage)
        } else {
            const generalMessages = [
                "You're doing great! Every day is a new opportunity to grow and learn. 🌱",
                "Your feelings matter. Take time to acknowledge and honor them. 💝",
                "You're stronger than you know. Keep going, one step at a time. 🚶‍♀️",
                "Today is a gift. Make the most of it, whatever that looks like for you. 🎁",
                "You're exactly where you need to be on your journey. Trust yourself. 🌟"
            ]
            setMessage(generalMessages[Math.floor(Math.random() * generalMessages.length)])
        }
    }

    return (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Today's Message</h3>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-100">
                <p className="text-gray-800 leading-relaxed text-lg">{message}</p>
                <div className="mt-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">Personalized for you</span>
                </div>
            </div>
        </div>
    )
}

// Simple feeling selector
const FeelingSelector = ({ selectedFeeling, onFeelingChange }) => {
    const feelings = [
        { id: 'happy', label: 'Happy', icon: Smile, color: 'bg-yellow-100 text-yellow-600', emoji: '😊' },
        { id: 'good', label: 'Good', icon: Smile, color: 'bg-green-100 text-green-600', emoji: '🙂' },
        { id: 'okay', label: 'Okay', icon: MessageCircle, color: 'bg-gray-100 text-gray-600', emoji: '😐' },
        { id: 'sad', label: 'Sad', icon: Frown, color: 'bg-blue-100 text-blue-600', emoji: '😔' },
        { id: 'terrible', label: 'Terrible', icon: Frown, color: 'bg-red-100 text-red-600', emoji: '😢' }
    ]

    return (
        <div className="grid grid-cols-5 gap-3">
            {feelings.map((feeling) => {
                const Icon = feeling.icon
                return (
                    <button
                        key={feeling.id}
                        onClick={() => onFeelingChange(feeling.id)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                            selectedFeeling === feeling.id
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                        }`}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-2xl">{feeling.emoji}</div>
                            <span className="text-sm font-medium text-gray-700">{feeling.label}</span>
                        </div>
                    </button>
                )
            })}
        </div>
    )
}

const MyDiary = () => {
    const { user, loading } = useAuth();
    const [diaryEntries, setDiaryEntries] = useState([])
    const [error, setError] = useState(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingEntry, setEditingEntry] = useState(null)
    
    // Simplified form state
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        feeling: '',
        thoughts: ''
    })

    useEffect(() => {
        fetchDiaryEntries()
    }, [])

    const fetchDiaryEntries = async () => {
        try {
            setLoading(true)
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
                const diaryData = data.diaryEntries || []
                setDiaryEntries(diaryData.sort((a, b) => new Date(b.date) - new Date(a.date)))
            }
        } catch (err) {
            console.error('Error fetching diary entries:', err)
            setError('Failed to load diary entries')
        } finally {
            setLoading(false)
        }
    }

    const saveDiaryEntry = async (entryData) => {
        try {
            const auth = getAuth()
            const user = auth.currentUser

            if (!user) {
                alert('You must be signed in to save diary entries')
                return
            }

            const userDocRef = doc(db, 'users', user.uid)
            
            const entryToSave = {
                ...entryData,
                id: editingEntry ? editingEntry.id : Date.now().toString(),
                createdAt: editingEntry ? editingEntry.createdAt : serverTimestamp(),
                updatedAt: serverTimestamp()
            }

            const updatedEntries = editingEntry 
                ? diaryEntries.map(entry => entry.id === editingEntry.id ? entryToSave : entry)
                : [...diaryEntries, entryToSave]

            await updateDoc(userDocRef, {
                diaryEntries: updatedEntries
            })

            setDiaryEntries(updatedEntries.sort((a, b) => new Date(b.date) - new Date(a.date)))
            setShowAddForm(false)
            setEditingEntry(null)
            resetForm()
        } catch (err) {
            console.error('Error saving diary entry:', err)
            alert('Failed to save diary entry')
        }
    }

    const deleteDiaryEntry = async (entryId) => {
        if (!confirm('Are you sure you want to delete this diary entry?')) return

        try {
            const auth = getAuth()
            const user = auth.currentUser

            if (!user) {
                alert('You must be signed in to delete diary entries')
                return
            }

            const userDocRef = doc(db, 'users', user.uid)
            const updatedEntries = diaryEntries.filter(entry => entry.id !== entryId)

            await updateDoc(userDocRef, {
                diaryEntries: updatedEntries
            })

            setDiaryEntries(updatedEntries)
        } catch (err) {
            console.error('Error deleting diary entry:', err)
            alert('Failed to delete diary entry')
        }
    }

    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            feeling: '',
            thoughts: ''
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!formData.feeling || !formData.thoughts.trim()) {
            alert('Please select how you feel and write your thoughts')
            return
        }
        saveDiaryEntry(formData)
    }

    const handleEdit = (entry) => {
        setEditingEntry(entry)
        setFormData({
            date: entry.date,
            feeling: entry.feeling,
            thoughts: entry.thoughts
        })
        setShowAddForm(true)
    }

    const getTodayEntry = () => {
        const today = new Date().toISOString().split('T')[0]
        return diaryEntries.find(entry => entry.date === today)
    }

    const todayEntry = getTodayEntry()

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
                            <h2 className="text-red-800 font-semibold">Error Loading My Diary</h2>
                            <p className="text-red-600">No user signed in</p>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="flex h-screen w-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                My Diary 📖
                            </h1>
                            <p className="text-gray-600">
                                Write about your feelings and get personalized messages
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Write Today
                        </button>
                    </div>

                    {/* Today's Motivational Message */}
                    {todayEntry && (
                        <div className="mb-6">
                            <MotivationalMessage feeling={todayEntry.feeling} />
                        </div>
                    )}

                    {/* Add/Edit Form */}
                    {showAddForm && (
                        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                {editingEntry ? 'Edit Diary Entry' : 'How are you feeling today?'}
                            </h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        required
                                    />
                                </div>

                                {/* Feeling */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        How are you feeling today?
                                    </label>
                                    <FeelingSelector 
                                        selectedFeeling={formData.feeling}
                                        onFeelingChange={(feeling) => setFormData(prev => ({ ...prev, feeling }))}
                                    />
                                </div>

                                {/* Thoughts */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        What's on your mind?
                                    </label>
                                    <textarea
                                        value={formData.thoughts}
                                        onChange={(e) => setFormData(prev => ({ ...prev, thoughts: e.target.value }))}
                                        rows={6}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="Write about your day, your thoughts, your dreams, or anything that's on your mind..."
                                        required
                                    />
                                </div>

                                {/* Form Actions */}
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        {editingEntry ? 'Update Entry' : 'Save Entry'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddForm(false)
                                            setEditingEntry(null)
                                            resetForm()
                                        }}
                                        className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Diary Entries */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900">Your Diary Entries</h2>
                        
                        {diaryEntries.length === 0 ? (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                                <BookOpen className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                    Start Your Diary Journey
                                </h3>
                                <p className="text-blue-700 mb-4">
                                    Begin by writing your first diary entry to capture your thoughts and feelings.
                                </p>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Write Your First Entry
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {diaryEntries.map((entry) => (
                                    <div key={entry.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {new Date(entry.date).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                        entry.feeling === 'happy' ? 'bg-yellow-100 text-yellow-800' :
                                                        entry.feeling === 'good' ? 'bg-green-100 text-green-800' :
                                                        entry.feeling === 'okay' ? 'bg-gray-100 text-gray-800' :
                                                        entry.feeling === 'sad' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {entry.feeling.charAt(0).toUpperCase() + entry.feeling.slice(1)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(entry)}
                                                    className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteDiaryEntry(entry.id)}
                                                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Thoughts */}
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Your Thoughts:</h4>
                                            <p className="text-gray-800 leading-relaxed">{entry.thoughts}</p>
                                        </div>

                                        {/* Motivational Message */}
                                        <div className="pt-4 border-t border-gray-100">
                                            <MotivationalMessage feeling={entry.feeling} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default MyDiary
