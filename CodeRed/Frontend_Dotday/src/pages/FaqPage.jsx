import React, { useState } from 'react'
import Sidebar from '../components/sidebar'
import { 
    HelpCircle, 
    ChevronDown, 
    ChevronUp, 
    Calendar,
    BarChart3,
    BookOpen,
    Heart,
    Bell,
    Settings,
    User,
    Shield,
    Zap,
    Target,
    Lightbulb,
    MessageCircle,
    Star
} from 'lucide-react'

const FaqPage = () => {
    const [openItems, setOpenItems] = useState(new Set())

    const toggleItem = (index) => {
        const newOpenItems = new Set(openItems)
        if (newOpenItems.has(index)) {
            newOpenItems.delete(index)
        } else {
            newOpenItems.add(index)
        }
        setOpenItems(newOpenItems)
    }

    const faqCategories = [
        {
            title: "Getting Started",
            icon: Star,
            color: "bg-purple-100 text-purple-600",
            items: [
                {
                    question: "How do I get started with DotDay?",
                    answer: "Getting started is easy! Simply sign in with your Google account, complete the onboarding process to set up your cycle information, and you'll be ready to start tracking your periods and wellness data."
                },
                {
                    question: "What information do I need to provide during onboarding?",
                    answer: "During onboarding, we'll ask for your last period date, average cycle length, and period duration. This helps us provide accurate predictions and insights for your unique cycle."
                },
                {
                    question: "Can I change my cycle information later?",
                    answer: "Yes! You can update your cycle information anytime through the Settings page. The app will automatically adjust predictions based on your new data."
                },
                {
                    question: "Is my data secure and private?",
                    answer: "Absolutely! Your data is stored securely in Firebase with encryption. We never share your personal information with third parties, and you have complete control over your data."
                }
            ]
        },
        {
            title: "Period Tracking",
            icon: Calendar,
            color: "bg-pink-100 text-pink-600",
            items: [
                {
                    question: "How do I mark my period days?",
                    answer: "On the Calendar page, simply click on any date to mark it as a period day. You'll then be prompted to track additional information like flow intensity, symptoms, mood, and energy levels."
                },
                {
                    question: "What is flow intensity tracking?",
                    answer: "Flow intensity helps you track how heavy your bleeding is each day. You can select Light, Medium, or Heavy to better understand your period patterns."
                },
                {
                    question: "Can I track symptoms during my period?",
                    answer: "Yes! When marking a period day, you can track symptoms like cramps, bloating, fatigue, mood swings, and more. This helps identify patterns in your cycle."
                },
                {
                    question: "How accurate are the period predictions?",
                    answer: "Predictions become more accurate as you log more period data. The app uses your historical data and cycle patterns to predict future periods. The more data you provide, the better the predictions become."
                }
            ]
        },
        {
            title: "Dashboard & Insights",
            icon: BarChart3,
            color: "bg-blue-100 text-blue-600",
            items: [
                {
                    question: "What information does the dashboard show?",
                    answer: "The dashboard displays your next period prediction, cycle length, period duration, and today's tracking data including mood, energy level, and overall wellness."
                },
                {
                    question: "How do I view my cycle insights?",
                    answer: "Visit the Insights page to see detailed analytics including cycle length trends, period duration patterns, tracking consistency, and symptom frequency. These insights help you understand your body better."
                },
                {
                    question: "What are the different tracking metrics?",
                    answer: "You can track flow intensity (light/medium/heavy), symptoms (cramps, bloating, etc.), mood (happy/good/okay/sad/terrible), energy level (very high to very low), and overall wellness (excellent to very poor)."
                },
                {
                    question: "How often should I check my insights?",
                    answer: "We recommend checking your insights monthly to see patterns and trends. The more data you log, the more meaningful your insights will become."
                }
            ]
        },
        {
            title: "My Diary",
            icon: BookOpen,
            color: "bg-green-100 text-green-600",
            items: [
                {
                    question: "What is the My Diary feature?",
                    answer: "My Diary is a personal journal where you can write about your feelings, thoughts, and daily experiences. It provides personalized motivational messages based on your mood."
                },
                {
                    question: "How do I write a diary entry?",
                    answer: "Click 'Write Today' on the My Diary page, select how you're feeling, and write your thoughts. Each entry gets a personalized motivational message based on your mood."
                },
                {
                    question: "Can I edit or delete diary entries?",
                    answer: "Yes! You can edit any diary entry by clicking the edit icon, or delete entries using the trash icon. All changes are automatically saved to your account."
                },
                {
                    question: "Are my diary entries private?",
                    answer: "Yes, your diary entries are completely private and only visible to you. They're stored securely in your personal account."
                }
            ]
        },
        {
            title: "Partner Connection",
            icon: Heart,
            color: "bg-red-100 text-red-600",
            items: [
                {
                    question: "How does partner connection work?",
                    answer: "Partner connection allows you to share your cycle information with a trusted partner. You can send connection requests and manage your connection status in the Settings page."
                },
                {
                    question: "What information is shared with my partner?",
                    answer: "You control what information is shared. You can choose to share period predictions, cycle insights, or wellness updates. Your partner will only see what you allow them to see."
                },
                {
                    question: "How do I connect with my partner?",
                    answer: "Go to Settings > Partner Connection, enter your partner's email address, and send a connection request. Your partner will need to accept the request to establish the connection."
                },
                {
                    question: "Can I disconnect from my partner?",
                    answer: "Yes, you can disconnect from your partner at any time through the Settings page. This will immediately stop sharing information with them."
                }
            ]
        },
        {
            title: "Notifications & Settings",
            icon: Bell,
            color: "bg-yellow-100 text-yellow-600",
            items: [
                {
                    question: "What types of notifications can I receive?",
                    answer: "You can receive period reminders, cycle insights, wellness tips, and partner updates. You can customize these in the Settings page under Notifications."
                },
                {
                    question: "How do I change my notification settings?",
                    answer: "Go to Settings > Notifications and toggle the switches for the types of notifications you want to receive. Changes are saved automatically."
                },
                {
                    question: "Can I change my profile information?",
                    answer: "Yes! In Settings > Profile Information, you can update your display name and email address. Changes are saved to both your account and the app."
                },
                {
                    question: "How do I delete my account?",
                    answer: "In Settings > Account Actions, click 'Delete Account'. You'll be asked to confirm this action as it permanently removes all your data and cannot be undone."
                }
            ]
        },
        {
            title: "Troubleshooting",
            icon: Shield,
            color: "bg-indigo-100 text-indigo-600",
            items: [
                {
                    question: "What if my period predictions are inaccurate?",
                    answer: "Predictions improve with more data. If predictions seem off, try logging more period dates and updating your cycle information in Settings. The app learns from your patterns."
                },
                {
                    question: "I forgot to log a period day, can I add it later?",
                    answer: "Yes! You can log period days for any past date on the Calendar page. Simply click on the date and mark it as a period day with the appropriate tracking information."
                },
                {
                    question: "How do I reset my cycle data?",
                    answer: "You can update your cycle information anytime in Settings. If you want to start fresh, you can clear your data and redo the onboarding process."
                },
                {
                    question: "What if I have irregular periods?",
                    answer: "The app works well with irregular periods too! Just log your periods as they occur, and the app will adapt to your unique cycle patterns over time."
                }
            ]
        }
    ]

    return (
        <div className="flex h-screen w-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <HelpCircle className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                Frequently Asked Questions
                            </h1>
                            <p className="text-gray-600">Find answers to common questions about DotDay</p>
                        </div>
                    </div>

                    {/* Quick Navigation */}
                    <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            {faqCategories.map((category, index) => {
                                const Icon = category.icon
                                return (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            const element = document.getElementById(`category-${index}`)
                                            if (element) {
                                                element.scrollIntoView({ behavior: 'smooth' })
                                            }
                                        }}
                                        className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                                    >
                                        <div className={`p-2 rounded-lg ${category.color}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <span className="text-xs font-medium text-gray-700 text-center">
                                            {category.title}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* FAQ Categories */}
                    <div className="space-y-6">
                        {faqCategories.map((category, categoryIndex) => {
                            const Icon = category.icon
                            return (
                                <div key={categoryIndex} id={`category-${categoryIndex}`} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className={`p-2 rounded-lg ${category.color}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <h2 className="text-lg font-semibold text-gray-900">{category.title}</h2>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {category.items.map((item, itemIndex) => {
                                            const isOpen = openItems.has(`${categoryIndex}-${itemIndex}`)
                                            return (
                                                <div key={itemIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                                                    <button
                                                        onClick={() => toggleItem(`${categoryIndex}-${itemIndex}`)}
                                                        className="w-full px-4 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                                    >
                                                        <span className="font-medium text-gray-900 pr-4">
                                                            {item.question}
                                                        </span>
                                                        {isOpen ? (
                                                            <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                                                        ) : (
                                                            <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                                                        )}
                                                    </button>
                                                    
                                                    {isOpen && (
                                                        <div className="px-4 pb-4">
                                                            <p className="text-gray-700 leading-relaxed">
                                                                {item.answer}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Contact Support */}
                    <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <MessageCircle className="h-5 w-5 text-purple-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">Still Need Help?</h2>
                        </div>
                        <p className="text-gray-700 mb-4">
                            Can't find the answer you're looking for? We're here to help!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                <MessageCircle className="h-4 w-4" />
                                Contact Support
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                                <Lightbulb className="h-4 w-4" />
                                View Tutorials
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default FaqPage
