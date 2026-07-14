import Sidebar from '../components/sidebar'


import * as React from "react"
import { format, isSameDay, addMonths, addDays, differenceInDays, isValid } from "date-fns"
import {
    Heart,
    Droplets,
    Smile,
    Frown,
    Meh,
    PlusCircle,
    Target,
    Activity,
    Clock,
    Sun,
    Zap,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "../components/ui/button" // Only Button is imported from shadcn/ui
import { getAuth } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import db from '../firebase/firestore'
import { sendPeriodStartedNotification, checkAndSendPeriodAlert } from "../services/emailService"

// Helper function to get mood icon
const getMoodIcon = (mood) => {
    switch (mood) {
        case "happy":
            return <Smile className="h-4 w-4 text-green-500" />
        case "sad":
            return <Frown className="h-4 w-4 text-red-500" />
        case "neutral":
            return <Meh className="h-4 w-4 text-yellow-500" />
        default:
            return null
    }
}

// Mode Toggle Component
function ModeToggle({ mode, onModeChange }) {
    const normalColor = "#FF4D8F"
    const tricyclingColor = "#3B82F6"
    return (
        <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
            <div className="flex items-center gap-2">
                <Button
                    onClick={() => onModeChange("normal")}
                    className={cn(
                        "px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2",
                        mode === "normal"
                            ? "text-white shadow-lg transform scale-105"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 bg-white",
                    )}
                    style={mode === "normal" ? { backgroundColor: normalColor } : {}}
                >
                    <Droplets className="h-4 w-4" />
                    Normal Mode
                    {mode === "normal" && <div className="w-2 h-2 bg-white rounded-full" />}
                </Button>
                <Button
                    onClick={() => onModeChange("tricycling")}
                    className={cn(
                        "px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2",
                        mode === "tricycling"
                            ? "text-white shadow-lg transform scale-105"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 bg-white",
                    )}
                    style={mode === "tricycling" ? { backgroundColor: tricyclingColor } : {}}
                >
                    <Target className="h-4 w-4" />
                    Tricycling Mode
                    {mode === "tricycling" && <div className="w-2 h-2 bg-white rounded-full" />}
                </Button>
            </div>
        </div>
    )
}

// Legend Component
function Legend({ mode }) {
    const primaryColor = mode === "normal" ? "#FF4D8F" : "#3B82F6"
    const lightColor = mode === "normal" ? "#FF4D8F20" : "#3B82F620"

    const normalModeItems = [
        { label: "Period Day", color: primaryColor, textColor: "white", type: "solid" },
        { label: "Ovulation Day", color: "#10B981", textColor: "white", type: "solid" },
        { label: "Fertile Window", color: lightColor, textColor: primaryColor, type: "solid" },
        { label: "Predicted Period", color: "#F3F4F6", textColor: primaryColor, type: "dashed" },
        {
            label: "Symptoms",
            indicator: (
                <div className="flex gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-red-500" />
                    <div className="w-3.5 h-3.5 rounded-full bg-yellow-500" />
                    <div className="w-3.5 h-3.5 rounded-full bg-purple-500" />
                </div>
            ),
        },
        {
            label: "Mood",
            indicator: (
                <div className="flex gap-1.5">
                    <Smile className="h-5 w-5 text-green-500" />
                    <Meh className="h-5 w-5 text-yellow-500" />
                    <Frown className="h-5 w-5 text-red-500" />
                </div>
            ),
        },
    ]

    const tricyclingModeItems = [
        { label: "Period Day", color: primaryColor, textColor: "white", type: "solid" },
        { label: "Predicted Period", color: "#F3F4F6", textColor: primaryColor, type: "dashed" },
        {
            label: "Symptoms",
            indicator: (
                <div className="flex gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-red-500" />
                    <div className="w-3.5 h-3.5 rounded-full bg-yellow-500" />
                    <div className="w-3.5 h-3.5 rounded-full bg-purple-500" />
                </div>
            ),
        },
        {
            label: "Mood",
            indicator: (
                <div className="flex gap-1.5">
                    <Smile className="h-5 w-5 text-green-500" />
                    <Meh className="h-5 w-5 text-yellow-500" />
                    <Frown className="h-5 w-5 text-red-500" />
                </div>
            ),
        },
    ]

    const legendItems = mode === "normal" ? normalModeItems : tricyclingModeItems

    return (
        <div className="mt-6 p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-lg">
            <h4 className="text-lg md:text-xl lg:text-2xl font-bold mb-4 md:mb-6 text-gray-800 flex items-center gap-2">
                <Target className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
                Legend
            </h4>
            <div className="flex flex-col gap-4 md:gap-6 text-sm md:text-base">
                {legendItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-xl hover:bg-white/50 transition-all duration-200">
                        {item.indicator ? (
                            item.indicator
                        ) : (
                            <div
                                className={cn(
                                    "h-5 w-5 md:h-6 md:w-6 rounded-xl flex items-center justify-center shadow-sm",
                                    item.type === "dashed" && "border-2 border-dashed",
                                )}
                                style={{
                                    backgroundColor: item.color,
                                    color: item.textColor,
                                    borderColor: item.type === "dashed" ? primaryColor : item.color,
                                }}
                            />
                        )}
                        <span className="font-medium text-gray-700 text-xs md:text-sm lg:text-base">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Cycle Info Component
function CycleInfo({ mode, cycleInfo }) {
    const primaryColor = mode === "normal" ? "#FF4D8F" : "#3B82F6"

    const info =
        mode === "normal"
            ? {
                description: "Regular menstrual cycle with natural hormone fluctuations",
                features: ["Natural ovulation", "Fertile windows", "28-day cycles", "Hormone variations"],
            }
            : {
                description: "Extended cycle with continuous hormone therapy",
                features: ["Suppressed ovulation", "Fewer periods", "84-day cycles", "Stable hormones"],
            }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 h-full">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                <Clock className={`h-4 w-4 md:h-5 md:w-5 ${mode === "normal" ? "text-pink-500" : "text-blue-500"}`} />
                Cycle Information
            </h3>
            <div className="space-y-4 md:space-y-6">
                {/* Mode Description */}
                <div
                    className={cn(
                        "p-3 md:p-4 rounded-xl",
                        mode === "normal" ? "bg-pink-50 border border-pink-200" : "bg-blue-50 border border-blue-200",
                    )}
                >
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">{mode === "normal" ? "Normal Mode" : "Tricycling Mode"}</h4>
                    <p className="text-xs md:text-sm text-gray-600">{info.description}</p>
                </div>
                {/* Current Stats */}
                <div className="space-y-3 md:space-y-4">
                    <div className="flex justify-between items-center p-2 md:p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600 font-medium text-xs md:text-sm">Current Phase:</span>
                        <span className="font-bold text-xs md:text-sm" style={{ color: primaryColor }}>
                            {cycleInfo.currentPhase || "N/A"}
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-2 md:p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600 font-medium text-xs md:text-sm">Day of Cycle:</span>
                        <span className="font-bold text-gray-900 text-xs md:text-sm">{cycleInfo.dayOfCycle || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 md:p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600 font-medium text-xs md:text-sm">Cycle Length:</span>
                        <span className="font-bold text-gray-900 text-xs md:text-sm">
                            {cycleInfo.cycleLength ? `${cycleInfo.cycleLength} days` : "N/A"}
                        </span>
                    </div>
                    {mode === "normal" && (
                        <>
                            <div className="flex justify-between items-center p-2 md:p-3 bg-gray-50 rounded-xl">
                                <span className="text-gray-600 font-medium text-xs md:text-sm">Ovulation Day:</span>
                                <span className="font-bold text-gray-900 text-xs md:text-sm">
                                    {cycleInfo.ovulationDay && isValid(cycleInfo.ovulationDay) ? format(cycleInfo.ovulationDay, "MMM dd, yyyy") : "N/A"}
                        </span>
                    </div>
                            <div className="flex justify-between items-center p-2 md:p-3 bg-gray-50 rounded-xl">
                                <span className="text-gray-600 font-medium text-xs md:text-sm">Fertile Window:</span>
                                <span className="font-bold text-gray-900 text-xs md:text-sm">
                                    {cycleInfo.fertileDays && cycleInfo.fertileDays.length > 0 && isValid(cycleInfo.fertileDays[0]) && isValid(cycleInfo.fertileDays[cycleInfo.fertileDays.length - 1])
                                        ? `${format(cycleInfo.fertileDays[0], "MMM dd")} - ${format(cycleInfo.fertileDays[cycleInfo.fertileDays.length - 1], "MMM dd")}`
                                        : "N/A"}
                                </span>
                            </div>
                        </>
                    )}
                    <div className="flex justify-between items-center p-2 md:p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600 font-medium text-xs md:text-sm">Next Period:</span>
                        <span className="font-bold text-gray-900 text-xs md:text-sm">
                            {cycleInfo.nextPeriod && isValid(cycleInfo.nextPeriod) ? format(cycleInfo.nextPeriod, "MMM dd, yyyy") : "N/A"}
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-2 md:p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600 font-medium text-xs md:text-sm">Last Period:</span>
                        <span className="font-bold text-gray-900 text-xs md:text-sm">
                            {cycleInfo.lastPeriod && isValid(cycleInfo.lastPeriod) ? format(cycleInfo.lastPeriod, "MMM dd, yyyy") : "N/A"}
                        </span>
                    </div>
                </div>
                {/* Progress bar (will show 0% or N/A without data) */}
                {cycleInfo.dayOfCycle && cycleInfo.cycleLength && (
                    <div className="mt-4 md:mt-6">
                        <div className="flex justify-between text-xs md:text-sm font-medium text-gray-600 mb-2 md:mb-3">
                            <span>Cycle Progress</span>
                            <span>{Math.round((cycleInfo.dayOfCycle / cycleInfo.cycleLength) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 md:h-3 shadow-inner">
                            <div
                                className="h-2 md:h-3 rounded-full transition-all duration-500 shadow-sm"
                                style={{
                                    backgroundColor: primaryColor,
                                    width: `${(cycleInfo.dayOfCycle / cycleInfo.cycleLength) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// Tracking Info Component with real data
function TrackingInfo({ mode, trackingData }) {
    const today = format(new Date(), "yyyy-MM-dd")
    const todayData = trackingData[today] || {}
    
    const trackingItems = [
        { 
            icon: Droplets, 
            label: "Flow Intensity", 
            value: todayData.flowIntensity || "Not tracked", 
            color: "#FF4D8F",
            hasData: !!todayData.flowIntensity
        },
        { 
            icon: Sun, 
            label: "Mood Score", 
            value: todayData.moodScore || "Not tracked", 
            color: "#F59E0B",
            hasData: !!todayData.moodScore
        },
        { 
            icon: Zap, 
            label: "Energy Level", 
            value: todayData.energyLevel || "Not tracked", 
            color: "#10B981",
            hasData: !!todayData.energyLevel
        },
        { 
            icon: Activity, 
            label: "Symptoms", 
            value: todayData.symptoms ? `${todayData.symptoms.length} tracked` : "0 tracked", 
            color: "#8B5CF6",
            hasData: todayData.symptoms && todayData.symptoms.length > 0
        },
        { 
            icon: Heart, 
            label: "Overall Wellness", 
            value: todayData.wellnessScore || "Not tracked", 
            color: "#EF4444",
            hasData: !!todayData.wellnessScore
        },
    ]
    
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 h-full">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                <Target className={`h-4 w-4 md:h-5 md:w-5 ${mode === "normal" ? "text-pink-500" : "text-blue-500"}`} />
                Today's Tracking
            </h3>
            <div className="space-y-3 md:space-y-4">
                {trackingItems.map((item, index) => (
                    <div key={index} className={`flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-xl transition-colors ${
                        item.hasData ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'
                    }`}>
                        <div
                            className="h-8 w-8 md:h-10 md:w-10 rounded-xl flex items-center justify-center shadow-sm"
                            style={{ backgroundColor: `${item.color}20` }}
                        >
                            <item.icon className="h-4 w-4 md:h-5 md:w-5" style={{ color: item.color }} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs md:text-sm font-medium text-gray-700">{item.label}</p>
                            <p className={`text-base md:text-lg font-bold ${item.hasData ? 'text-green-700' : 'text-gray-900'}`}>
                                {item.value}
                            </p>
                        </div>
                        {item.hasData && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

// Enhanced Flow Intensity Modal with optional symptom and mood tracking
function FlowIntensityModal({ isOpen, onClose, onCompleteTracking }) {
    const [currentStep, setCurrentStep] = React.useState(1)
    const [selectedFlowIntensity, setSelectedFlowIntensity] = React.useState(null)
    const [selectedSymptoms, setSelectedSymptoms] = React.useState([])
    const [selectedMood, setSelectedMood] = React.useState(null)
    const [selectedEnergyLevel, setSelectedEnergyLevel] = React.useState(null)
    const [selectedWellness, setSelectedWellness] = React.useState(null)
    const [skipSymptoms, setSkipSymptoms] = React.useState(false)
    const [skipMood, setSkipMood] = React.useState(false)
    const [skipEnergy, setSkipEnergy] = React.useState(false)
    const [skipWellness, setSkipWellness] = React.useState(false)
    
    const flowOptions = [
        { value: "light", label: "Light", description: "Minimal bleeding, light spotting", color: "#10B981" },
        { value: "medium", label: "Medium", description: "Normal/regular bleeding", color: "#F59E0B" },
        { value: "heavy", label: "Heavy", description: "Heavy bleeding, frequent changes", color: "#EF4444" }
    ]

    const symptomOptions = [
        { value: "cramps", label: "Cramps", color: "#EF4444", icon: "🩸" },
        { value: "headache", label: "Headache", color: "#F59E0B", icon: "🤕" },
        { value: "bloating", label: "Bloating", color: "#10B981", icon: "💨" },
        { value: "fatigue", label: "Fatigue", color: "#8B5CF6", icon: "😴" },
        { value: "mood_swings", label: "Mood Swings", color: "#EC4899", icon: "😤" },
        { value: "back_pain", label: "Back Pain", color: "#F97316", icon: "🦴" },
        { value: "breast_tenderness", label: "Breast Tenderness", color: "#A855F7", icon: "💕" },
        { value: "acne", label: "Acne", color: "#DC2626", icon: "😣" },
        { value: "food_cravings", label: "Food Cravings", color: "#059669", icon: "🍫" },
        { value: "insomnia", label: "Insomnia", color: "#1E40AF", icon: "😵" }
    ]

    const moodOptions = [
        { value: "happy", label: "Happy", description: "Feeling great and positive", icon: Smile, color: "#10B981" },
        { value: "good", label: "Good", description: "Feeling pretty good", icon: Smile, color: "#34D399" },
        { value: "neutral", label: "Neutral", description: "Feeling okay, neither good nor bad", icon: Meh, color: "#F59E0B" },
        { value: "bad", label: "Bad", description: "Feeling down or irritable", icon: Frown, color: "#F97316" },
        { value: "terrible", label: "Terrible", description: "Feeling very low or depressed", icon: Frown, color: "#EF4444" }
    ]

    const energyOptions = [
        { value: "very_high", label: "Very High", description: "Feeling energetic and motivated", icon: Zap, color: "#10B981" },
        { value: "high", label: "High", description: "Feeling good energy levels", icon: Sun, color: "#34D399" },
        { value: "moderate", label: "Moderate", description: "Feeling okay energy", icon: Activity, color: "#F59E0B" },
        { value: "low", label: "Low", description: "Feeling tired or sluggish", icon: Clock, color: "#F97316" },
        { value: "very_low", label: "Very Low", description: "Feeling exhausted", icon: Clock, color: "#EF4444" }
    ]

    const wellnessOptions = [
        { value: "excellent", label: "Excellent", description: "Feeling great overall", icon: Heart, color: "#10B981" },
        { value: "good", label: "Good", description: "Feeling pretty well", icon: Heart, color: "#34D399" },
        { value: "fair", label: "Fair", description: "Feeling okay overall", icon: Heart, color: "#F59E0B" },
        { value: "poor", label: "Poor", description: "Not feeling well", icon: Heart, color: "#F97316" },
        { value: "very_poor", label: "Very Poor", description: "Feeling very unwell", icon: Heart, color: "#EF4444" }
    ]

    React.useEffect(() => {
        if (isOpen) {
            setCurrentStep(1)
            setSelectedSymptoms([])
            setSelectedMood(null)
            setSelectedEnergyLevel(null)
            setSelectedWellness(null)
            setSkipSymptoms(false)
            setSkipMood(false)
            setSkipEnergy(false)
            setSkipWellness(false)
        }
    }, [isOpen])

    const handleNext = () => {
        if (currentStep === 1 && selectedFlowIntensity) {
            setCurrentStep(2)
        } else if (currentStep === 2) {
            setCurrentStep(3)
        } else if (currentStep === 3) {
            setCurrentStep(4)
        } else if (currentStep === 4) {
            setCurrentStep(5)
        } else if (currentStep === 5) {
            handleComplete()
        }
    }

    const handleSkip = () => {
        if (currentStep === 2) {
            setSkipSymptoms(true)
            setCurrentStep(3)
        } else if (currentStep === 3) {
            setSkipMood(true)
            setCurrentStep(4)
        } else if (currentStep === 4) {
            setSkipEnergy(true)
            setCurrentStep(5)
        } else if (currentStep === 5) {
            setSkipWellness(true)
            handleComplete()
        }
    }

    const handleComplete = () => {
        onCompleteTracking({
            flowIntensity: selectedFlowIntensity,
            symptoms: skipSymptoms ? [] : selectedSymptoms,
            moodScore: skipMood ? null : selectedMood,
            energyLevel: skipEnergy ? null : selectedEnergyLevel,
            wellnessScore: skipWellness ? null : selectedWellness
        })
        onClose()
    }

    const toggleSymptom = (symptom) => {
        setSelectedSymptoms(prev => 
            prev.includes(symptom) 
                ? prev.filter(s => s !== symptom)
                : [...prev, symptom]
        )
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Step {currentStep} of 5</span>
                        <span>{Math.round((currentStep / 5) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(currentStep / 5) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Step 1: Flow Intensity */}
                {currentStep === 1 && (
                    <>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Select Flow Intensity</h3>
                        <p className="text-gray-600 mb-6">How heavy is your flow today?</p>
                        
                        <div className="space-y-3">
                            {flowOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setSelectedFlowIntensity(option.value)}
                                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                                        selectedFlowIntensity === option.value
                                            ? 'border-pink-500 bg-pink-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: option.color }}
                                        ></div>
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-900">{option.label}</p>
                                            <p className="text-sm text-gray-600">{option.description}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={!selectedFlowIntensity}
                                className="flex-1 py-3 px-4 rounded-xl bg-pink-500 text-white font-medium hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}

                {/* Step 2: Symptoms */}
                {currentStep === 2 && (
                    <>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Track Symptoms (Optional)</h3>
                        <p className="text-gray-600 mb-6">Select any symptoms you're experiencing today:</p>
                        
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {symptomOptions.map((symptom) => (
                                <button
                                    key={symptom.value}
                                    onClick={() => toggleSymptom(symptom.value)}
                                    className={`w-full p-3 rounded-xl border-2 transition-all ${
                                        selectedSymptoms.includes(symptom.value)
                                            ? 'border-pink-500 bg-pink-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="text-xl">{symptom.icon}</div>
                                        <div className="text-left flex-1">
                                            <p className="font-semibold text-gray-900">{symptom.label}</p>
                                        </div>
                                        {selectedSymptoms.includes(symptom.value) && (
                                            <CheckCircle className="h-5 w-5 text-pink-500" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleSkip}
                                className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                            >
                                Skip
                            </button>
                            <button
                                onClick={handleNext}
                                className="flex-1 py-3 px-4 rounded-xl bg-pink-500 text-white font-medium hover:bg-pink-600"
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}

                {/* Step 3: Mood */}
                {currentStep === 3 && (
                    <>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Track Your Mood (Optional)</h3>
                        <p className="text-gray-600 mb-6">How are you feeling today?</p>
                        
                        <div className="space-y-3">
                            {moodOptions.map((mood) => (
                                <button
                                    key={mood.value}
                                    onClick={() => setSelectedMood(mood.value)}
                                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                                        selectedMood === mood.value
                                            ? 'border-pink-500 bg-pink-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <mood.icon className="h-6 w-6" style={{ color: mood.color }} />
                                        <div className="text-left flex-1">
                                            <p className="font-semibold text-gray-900">{mood.label}</p>
                                            <p className="text-sm text-gray-600">{mood.description}</p>
                                        </div>
                                        {selectedMood === mood.value && (
                                            <CheckCircle className="h-5 w-5 text-pink-500" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleSkip}
                                className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                            >
                                Skip
                            </button>
                            <button
                                onClick={handleNext}
                                className="flex-1 py-3 px-4 rounded-xl bg-pink-500 text-white font-medium hover:bg-pink-600"
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}

                {/* Step 4: Energy Level */}
                {currentStep === 4 && (
                    <>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Track Your Energy Level (Optional)</h3>
                        <p className="text-gray-600 mb-6">How are you feeling in terms of energy?</p>
                        
                        <div className="space-y-3">
                            {energyOptions.map((energy) => (
                                <button
                                    key={energy.value}
                                    onClick={() => setSelectedEnergyLevel(energy.value)}
                                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                                        selectedEnergyLevel === energy.value
                                            ? 'border-pink-500 bg-pink-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <energy.icon className="h-6 w-6" style={{ color: energy.color }} />
                                        <div className="text-left flex-1">
                                            <p className="font-semibold text-gray-900">{energy.label}</p>
                                            <p className="text-sm text-gray-600">{energy.description}</p>
                                        </div>
                                        {selectedEnergyLevel === energy.value && (
                                            <CheckCircle className="h-5 w-5 text-pink-500" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleSkip}
                                className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                            >
                                Skip
                            </button>
                            <button
                                onClick={handleNext}
                                className="flex-1 py-3 px-4 rounded-xl bg-pink-500 text-white font-medium hover:bg-pink-600"
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}

                {/* Step 5: Overall Wellness */}
                {currentStep === 5 && (
                    <>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Track Your Overall Wellness (Optional)</h3>
                        <p className="text-gray-600 mb-6">How are you feeling overall?</p>
                        
                        <div className="space-y-3">
                            {wellnessOptions.map((wellness) => (
                                <button
                                    key={wellness.value}
                                    onClick={() => setSelectedWellness(wellness.value)}
                                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                                        selectedWellness === wellness.value
                                            ? 'border-pink-500 bg-pink-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <wellness.icon className="h-6 w-6" style={{ color: wellness.color }} />
                                        <div className="text-left flex-1">
                                            <p className="font-semibold text-gray-900">{wellness.label}</p>
                                            <p className="text-sm text-gray-600">{wellness.description}</p>
                                        </div>
                                        {selectedWellness === wellness.value && (
                                            <CheckCircle className="h-5 w-5 text-pink-500" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleSkip}
                                className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                            >
                                Skip
                            </button>
                            <button
                                onClick={handleComplete}
                                className="flex-1 py-3 px-4 rounded-xl bg-pink-500 text-white font-medium hover:bg-pink-600"
                            >
                                Complete
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

// Tracking History Component
function TrackingHistory({ trackingData }) {
    const [isExpanded, setIsExpanded] = React.useState(false)
    
    // Get all tracked dates and sort them (most recent first)
    const trackedDates = Object.keys(trackingData)
        .filter(date => {
            const dayData = trackingData[date]
            return dayData && (
                dayData.flowIntensity || 
                dayData.symptoms?.length > 0 || 
                dayData.moodScore || 
                dayData.energyLevel || 
                dayData.wellnessScore
            )
        })
        .sort((a, b) => new Date(b) - new Date(a))
        .slice(0, isExpanded ? 20 : 5) // Show 5 by default, 20 when expanded

    const getSymptomIcon = (symptom) => {
        const icons = {
            cramps: "🩸",
            headache: "🤕",
            bloating: "💨",
            fatigue: "😴",
            mood_swings: "😤",
            back_pain: "🦴",
            breast_tenderness: "💕",
            acne: "😣",
            food_cravings: "🍫",
            insomnia: "😵"
        }
        return icons[symptom] || "•"
    }

    const getMoodIcon = (mood) => {
        switch (mood) {
            case "happy": return <Smile className="h-4 w-4 text-green-500" />
            case "good": return <Smile className="h-4 w-4 text-green-400" />
            case "neutral": return <Meh className="h-4 w-4 text-yellow-500" />
            case "bad": return <Frown className="h-4 w-4 text-orange-500" />
            case "terrible": return <Frown className="h-4 w-4 text-red-500" />
            default: return null
        }
    }

    const getEnergyIcon = (energy) => {
        switch (energy) {
            case "very_high": return <Zap className="h-4 w-4 text-green-500" />
            case "high": return <Sun className="h-4 w-4 text-green-400" />
            case "moderate": return <Activity className="h-4 w-4 text-yellow-500" />
            case "low": return <Clock className="h-4 w-4 text-orange-500" />
            case "very_low": return <Clock className="h-4 w-4 text-red-500" />
            default: return null
        }
    }

    const getWellnessIcon = (wellness) => {
        switch (wellness) {
            case "excellent": return <Heart className="h-4 w-4 text-green-500" />
            case "good": return <Heart className="h-4 w-4 text-green-400" />
            case "fair": return <Heart className="h-4 w-4 text-yellow-500" />
            case "poor": return <Heart className="h-4 w-4 text-orange-500" />
            case "very_poor": return <Heart className="h-4 w-4 text-red-500" />
            default: return null
        }
    }

    const getFlowIntensityColor = (intensity) => {
        switch (intensity) {
            case "light": return "text-green-600"
            case "medium": return "text-orange-600"
            case "heavy": return "text-red-600"
            default: return "text-gray-600"
        }
    }

    if (trackedDates.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                    <Clock className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                    Tracking History
                </h3>
                <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                        <Clock className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-gray-600 text-sm md:text-base">
                        No tracking history yet. Start marking your periods to build your tracking history.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                <Clock className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                Tracking History
                <span className="text-sm font-normal text-gray-500 ml-2">
                    ({trackedDates.length} entries)
                </span>
            </h3>
            
            <div className="space-y-3 md:space-y-4">
                {trackedDates.map((date) => {
                    const dayData = trackingData[date]
                    const formattedDate = new Date(date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                    })
                    
                    return (
                        <div key={date} className="border border-gray-200 rounded-xl p-3 md:p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-900">{formattedDate}</span>
                                {dayData.flowIntensity && (
                                    <span className={`text-sm font-medium ${getFlowIntensityColor(dayData.flowIntensity)}`}>
                                        {dayData.flowIntensity.charAt(0).toUpperCase() + dayData.flowIntensity.slice(1)} Flow
                                    </span>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 text-sm">
                                {dayData.moodScore && (
                                    <div className="flex items-center gap-2">
                                        {getMoodIcon(dayData.moodScore)}
                                        <span className="text-gray-700">Mood: {dayData.moodScore}</span>
                                    </div>
                                )}
                                
                                {dayData.energyLevel && (
                                    <div className="flex items-center gap-2">
                                        {getEnergyIcon(dayData.energyLevel)}
                                        <span className="text-gray-700">Energy: {dayData.energyLevel}</span>
                                    </div>
                                )}
                                
                                {dayData.wellnessScore && (
                                    <div className="flex items-center gap-2">
                                        {getWellnessIcon(dayData.wellnessScore)}
                                        <span className="text-gray-700">Wellness: {dayData.wellnessScore}</span>
                                    </div>
                                )}
                                
                                {dayData.symptoms && dayData.symptoms.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            {dayData.symptoms.slice(0, 3).map((symptom, index) => (
                                                <span key={index} title={symptom}>
                                                    {getSymptomIcon(symptom)}
                                                </span>
                                            ))}
                                            {dayData.symptoms.length > 3 && (
                                                <span className="text-xs text-gray-500">+{dayData.symptoms.length - 3}</span>
                                            )}
                                        </div>
                                        <span className="text-gray-700">Symptoms</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
            
            {trackedDates.length > 5 && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full mt-4 py-2 px-4 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    {isExpanded ? "Show Less" : `Show ${trackedDates.length - 5} More`}
                </button>
            )}
        </div>
    )
}

export default function PeriodCalendar() {
    const [currentDate, setCurrentDate] = React.useState(new Date()) // Controls the month displayed on the grid
    const [selectedDate, setSelectedDate] = React.useState(new Date()) // The date currently selected by clicking on the grid
    const [periodDates, setPeriodDates] = React.useState([])
    const [mode, setMode] = React.useState("normal") // State for normal/tricycling mode
    const [loading, setLoading] = React.useState(true)
    const [onboardingData, setOnboardingData] = React.useState(null)
    const [trackingData, setTrackingData] = React.useState({}) // Daily tracking data
    const [showFlowModal, setShowFlowModal] = React.useState(false)
    const [pendingPeriodDate, setPendingPeriodDate] = React.useState(null)

    // Placeholder for actual symptoms and moods (will be empty until user inputs)
    // Removed unused state variables - now using trackingData for all tracking

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const daysInMonth = lastDayOfMonth.getDate()
    const startingDayOfWeek = firstDayOfMonth.getDay() // 0 for Sunday, 1 for Monday, etc.

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]

    // Load period data and onboarding data from Firebase on component mount
    React.useEffect(() => {
        const loadUserData = async () => {
            try {
                setLoading(true)
                const auth = getAuth()
                const user = auth.currentUser

                if (!user) {
                    console.log('No user signed in')
                    setLoading(false)
                    return
                }

                const userDocRef = doc(db, 'users', user.uid)
                const userSnap = await getDoc(userDocRef)

                if (userSnap.exists()) {
                    const data = userSnap.data()
                    
                    // Load saved mode preference, default to normal
                    const savedMode = data.selectedMode || "normal"
                    setMode(savedMode)
                    
                    // Load mode-specific data
                    const modeKey = savedMode === "normal" ? "normalMode" : "tricyclingMode"
                    const modeData = data[modeKey] || {}
                    
                    // Load period dates for current mode
                    if (modeData.periodDates) {
                        const dates = modeData.periodDates.map(dateStr => new Date(dateStr))
                        setPeriodDates(dates)
                    } else {
                        setPeriodDates([])
                    }
                    
                    // Load onboarding data for current mode
                    if (modeData.onboarding) {
                        setOnboardingData(modeData.onboarding)
                    } else {
                        setOnboardingData(null)
                    }
                    
                    // Load tracking data for current mode
                    if (modeData.trackingData) {
                        setTrackingData(modeData.trackingData)
                    } else {
                        setTrackingData({})
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
                }
            } catch (error) {
                console.error('Error loading user data:', error)
            } finally {
                setLoading(false)
            }
        }

        loadUserData()
    }, []) // Remove mode dependency to avoid infinite loop

    // Handle mode change and save to Firebase
    const handleModeChange = async (newMode) => {
        try {
            setMode(newMode)
            
            // Save mode preference to Firebase
            const auth = getAuth()
            const user = auth.currentUser
            
            if (user) {
                const userDocRef = doc(db, 'users', user.uid)
                await setDoc(userDocRef, { selectedMode: newMode }, { merge: true })
                console.log(`Mode preference saved: ${newMode}`)
            }
            
            // Reload data for the new mode
            const userDocRef = doc(db, 'users', user.uid)
            const userSnap = await getDoc(userDocRef)
            
            if (userSnap.exists()) {
                const data = userSnap.data()
                const modeKey = newMode === "normal" ? "normalMode" : "tricyclingMode"
                const modeData = data[modeKey] || {}
                
                // Load period dates for new mode
                if (modeData.periodDates) {
                    const dates = modeData.periodDates.map(dateStr => new Date(dateStr))
                    setPeriodDates(dates)
                } else {
                    setPeriodDates([])
                }
                
                // Load onboarding data for new mode
                if (modeData.onboarding) {
                    setOnboardingData(modeData.onboarding)
                } else {
                    setOnboardingData(null)
                }
                
                // Load tracking data for new mode
                if (modeData.trackingData) {
                    setTrackingData(modeData.trackingData)
                } else {
                    setTrackingData({})
                }
            }
        } catch (error) {
            console.error('Error changing mode:', error)
        }
    }

    // Save period data to Firebase
    const savePeriodData = async (newPeriodDates) => {
        try {
            const auth = getAuth()
            const user = auth.currentUser

            if (!user) {
                console.log('No user signed in')
                return
            }

            const userDocRef = doc(db, 'users', user.uid)
            const userSnap = await getDoc(userDocRef)
            
            // Get existing data
            const existingData = userSnap.exists() ? userSnap.data() : {}
            const modeKey = mode === "normal" ? "normalMode" : "tricyclingMode"
            
            // Convert Date objects to strings for Firebase storage
            const dateStrings = newPeriodDates.map(date => date.toISOString())
            
            // Update mode-specific data
            const updatedData = {
                ...existingData,
                [modeKey]: {
                    ...existingData[modeKey],
                    periodDates: dateStrings,
                    lastUpdated: new Date().toISOString()
                }
            }
            
            await setDoc(userDocRef, updatedData, { merge: true })

            console.log(`Period data saved successfully for ${mode} mode`)
        } catch (error) {
            console.error('Error saving period data:', error)
            alert('Failed to save period data. Please try again.')
        }
    }

    const navigateMonth = (direction) => {
        const newDate = addMonths(currentDate, direction)
        setCurrentDate(newDate)
        setSelectedDate(newDate) // Also update selected date to the first of the new month
    }

    // --- Cycle Prediction Logic based on Mode, Onboarding Data, and Logged Periods ---
    const getCyclePredictions = React.useCallback(() => {
        // Get onboarding data as fallback/default values
        const onboardingCycleLength = onboardingData?.cycleLength ? parseInt(onboardingData.cycleLength) : 28
        const onboardingPeriodDuration = onboardingData?.periodDuration ? parseInt(onboardingData.periodDuration) : 5
        const onboardingLastPeriodDate = onboardingData?.lastPeriodDate ? new Date(onboardingData.lastPeriodDate) : null

        // If no logged periods, use onboarding data for predictions
        if (periodDates.length === 0) {
            if (!onboardingLastPeriodDate) {
            return {
                ovulationDay: null,
                fertileDays: [],
                predictedPeriod: [],
                currentPhase: "No cycle data",
                dayOfCycle: null,
                    cycleLength: onboardingCycleLength,
                nextPeriod: null,
                lastPeriod: null,
            }
        }

        const today = new Date()
            const dayOfCycle = differenceInDays(today, onboardingLastPeriodDate) + 1

        let cycleLength, ovulationDayOffset, fertileWindowStartOffset, fertileWindowEndOffset, periodDuration

        if (mode === "normal") {
                cycleLength = onboardingCycleLength
                periodDuration = onboardingPeriodDuration
                ovulationDayOffset = Math.round(cycleLength / 2) // Ovulation typically around day 14 of a 28-day cycle
                fertileWindowStartOffset = ovulationDayOffset - 2 // 2 days before ovulation
                fertileWindowEndOffset = ovulationDayOffset + 2 // 2 days after ovulation
        } else {
            // Tricycling mode (e.g., 84-day cycle, suppressed ovulation)
            cycleLength = 84
            periodDuration = 3 // Shorter withdrawal bleed
            ovulationDayOffset = null // Suppressed ovulation
                fertileWindowStartOffset = null
                fertileWindowEndOffset = null
            }

            const predictedNextPeriodStart = addDays(onboardingLastPeriodDate, cycleLength)
            const predictedPeriod = Array.from({ length: periodDuration }).map((_, i) => addDays(predictedNextPeriodStart, i))

            let ovulationDay = null
            let fertileDays = []
            if (ovulationDayOffset !== null) {
                ovulationDay = addDays(onboardingLastPeriodDate, ovulationDayOffset - 1)
                fertileDays = Array.from({ length: fertileWindowEndOffset - fertileWindowStartOffset + 1 }).map((_, i) =>
                    addDays(onboardingLastPeriodDate, fertileWindowStartOffset - 1 + i),
                )
            }

            // Determine current phase based on selectedDate
            let currentPhase = "Unknown"
            if (isSameDay(selectedDate, onboardingLastPeriodDate)) {
                currentPhase = "Menstrual Phase"
            } else if (
                ovulationDay &&
                differenceInDays(selectedDate, ovulationDay) >= -2 &&
                differenceInDays(selectedDate, ovulationDay) <= 0
            ) {
                currentPhase = "Ovulation"
            } else if (fertileDays.some((d) => isSameDay(d, selectedDate))) {
                currentPhase = "Fertile Window"
            } else if (dayOfCycle <= cycleLength / 2) {
                currentPhase = "Follicular Phase"
            } else if (dayOfCycle > cycleLength / 2 && dayOfCycle <= cycleLength) {
                currentPhase = "Luteal Phase"
            }

            return {
                ovulationDay,
                fertileDays,
                predictedPeriod,
                currentPhase,
                dayOfCycle,
                cycleLength,
                nextPeriod: predictedNextPeriodStart,
                lastPeriod: onboardingLastPeriodDate,
            }
        }

        // For users with logged periods, use logged data but fallback to onboarding
        const lastPeriodStartDate = periodDates[periodDates.length - 1]
        const today = new Date()
        const dayOfCycle = differenceInDays(today, lastPeriodStartDate) + 1

        // Calculate average cycle length from logged data, fallback to onboarding
        let calculatedCycleLength = onboardingCycleLength
        if (periodDates.length >= 2) {
            let totalDays = 0
            let cycleCount = 0
            
            for (let i = 1; i < periodDates.length; i++) {
                const daysDiff = Math.ceil((periodDates[i] - periodDates[i-1]) / (1000 * 60 * 60 * 24))
                if (daysDiff >= 21 && daysDiff <= 45) {
                    totalDays += daysDiff
                    cycleCount++
                }
            }
            
            if (cycleCount > 0) {
                calculatedCycleLength = Math.round(totalDays / cycleCount)
            }
        }

        let cycleLength, ovulationDayOffset, fertileWindowStartOffset, fertileWindowEndOffset, periodDuration

        if (mode === "normal") {
            cycleLength = calculatedCycleLength
            periodDuration = onboardingPeriodDuration
            ovulationDayOffset = Math.round(cycleLength / 2)
            fertileWindowStartOffset = ovulationDayOffset - 2
            fertileWindowEndOffset = ovulationDayOffset + 2
        } else {
            // Tricycling mode
            cycleLength = 84
            periodDuration = 3
            ovulationDayOffset = null
            fertileWindowStartOffset = null
            fertileWindowEndOffset = null
        }

        const predictedNextPeriodStart = addDays(lastPeriodStartDate, cycleLength)
        const predictedPeriod = Array.from({ length: periodDuration }).map((_, i) => addDays(predictedNextPeriodStart, i))

        let ovulationDay = null
        let fertileDays = []
        if (ovulationDayOffset !== null) {
            ovulationDay = addDays(lastPeriodStartDate, ovulationDayOffset - 1)
            fertileDays = Array.from({ length: fertileWindowEndOffset - fertileWindowStartOffset + 1 }).map((_, i) =>
                addDays(lastPeriodStartDate, fertileWindowStartOffset - 1 + i),
            )
        }

        // Determine current phase based on selectedDate
        let currentPhase = "Unknown"
        if (isSameDay(selectedDate, lastPeriodStartDate)) {
            currentPhase = "Menstrual Phase"
        } else if (
            ovulationDay &&
            differenceInDays(selectedDate, ovulationDay) >= -2 &&
            differenceInDays(selectedDate, ovulationDay) <= 0
        ) {
            currentPhase = "Ovulation"
        } else if (fertileDays.some((d) => isSameDay(d, selectedDate))) {
            currentPhase = "Fertile Window"
        } else if (dayOfCycle <= cycleLength / 2) {
            currentPhase = "Follicular Phase"
        } else if (dayOfCycle > cycleLength / 2 && dayOfCycle <= cycleLength) {
            currentPhase = "Luteal Phase"
        }

        return {
            ovulationDay,
            fertileDays,
            predictedPeriod,
            currentPhase,
            dayOfCycle,
            cycleLength,
            nextPeriod: predictedNextPeriodStart,
            lastPeriod: lastPeriodStartDate,
        }
    }, [periodDates, mode, selectedDate, onboardingData])

    const cyclePredictions = getCyclePredictions()

    // Combine all data for the CustomDay rendering
    const combinedPeriodData = {
        periodDays: periodDates,
        ovulationDay: cyclePredictions.ovulationDay,
        fertileDays: cyclePredictions.fertileDays,
        predictedPeriod: cyclePredictions.predictedPeriod,
        symptoms: trackingData, // Now using trackingData for all tracking
        moods: trackingData, // Now using trackingData for all tracking
    }

    const handleCompleteTracking = async (trackingData) => {
        if (!pendingPeriodDate) return

        const newPeriodDates = [...periodDates, new Date(pendingPeriodDate)]
        setPeriodDates(newPeriodDates)
        await savePeriodData(newPeriodDates)

        // Update tracking data with all collected information
        const newTrackingData = {
            ...trackingData,
            [pendingPeriodDate]: {
                ...trackingData[pendingPeriodDate],
                flowIntensity: trackingData.flowIntensity,
                symptoms: trackingData.symptoms,
                moodScore: trackingData.moodScore,
                energyLevel: trackingData.energyLevel,
                wellnessScore: trackingData.wellnessScore,
                date: pendingPeriodDate
            }
        }
        setTrackingData(newTrackingData)
        await saveTrackingData(newTrackingData)

        // Send email notification to partner
        try {
            const auth = getAuth()
            const user = auth.currentUser
            if (user) {
                const userDocRef = doc(db, 'users', user.uid)
                const userSnap = await getDoc(userDocRef)
                if (userSnap.exists()) {
                    const userData = userSnap.data()
                    const result = await sendPeriodStartedNotification(userData)
                    if (result.success) {
                        console.log('Partner notification sent successfully')
                    } else {
                        console.log('Partner notification not sent:', result.message)
                    }
                }
            }
        } catch (error) {
            console.error('Error sending partner notification:', error)
        }

        setShowFlowModal(false)
        setPendingPeriodDate(null)
    }

    const saveTrackingData = async (newTrackingData) => {
        try {
            const auth = getAuth()
            const user = auth.currentUser

            if (!user) {
                console.log('No user signed in')
                return
            }

            const userDocRef = doc(db, 'users', user.uid)
            const userSnap = await getDoc(userDocRef)
            
            // Get existing data
            const existingData = userSnap.exists() ? userSnap.data() : {}
            const modeKey = mode === "normal" ? "normalMode" : "tricyclingMode"
            
            // Update mode-specific data
            const updatedData = {
                ...existingData,
                [modeKey]: {
                    ...existingData[modeKey],
                    trackingData: newTrackingData,
                    lastUpdated: new Date().toISOString()
                }
            }
            
            await setDoc(userDocRef, updatedData, { merge: true })

            console.log(`Tracking data saved successfully for ${mode} mode`)
        } catch (error) {
            console.error('Error saving tracking data:', error)
            alert('Failed to save tracking data. Please try again.')
        }
    }

    const renderCalendarDays = () => {
        const days = []
        // Empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="h-20 md:h-28 lg:h-32"></div>)
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDayDate = new Date(year, month, day)
            const isSelected = isSameDay(currentDayDate, selectedDate)
            const isToday = isSameDay(currentDayDate, new Date())

            const isPeriodDay = combinedPeriodData.periodDays.some((d) => isSameDay(d, currentDayDate))
            const isOvulationDay = mode === "normal" && 
                combinedPeriodData.ovulationDay && isSameDay(combinedPeriodData.ovulationDay, currentDayDate)
            const isFertileDay = mode === "normal" && 
                combinedPeriodData.fertileDays.some((d) => isSameDay(d, currentDayDate))
            const isPredictedPeriodDay =
                combinedPeriodData.predictedPeriod.some((d) => isSameDay(d, currentDayDate)) && !isPeriodDay

            const dayStyle = {}
            if (isPeriodDay) {
                dayStyle.backgroundColor = mode === "normal" ? "#FF4D8F" : "#3B82F6"
                dayStyle.color = "white"
            } else if (isOvulationDay) {
                dayStyle.backgroundColor = "#10B981"
                dayStyle.color = "white"
            } else if (isFertileDay) {
                dayStyle.backgroundColor = mode === "normal" ? "#FF4D8F20" : "#3B82F620"
                dayStyle.color = mode === "normal" ? "#FF4D8F" : "#3B82F6"
            } else if (isPredictedPeriodDay) {
                dayStyle.backgroundColor = "#F3F4F6"
                dayStyle.color = mode === "normal" ? "#FF4D8F" : "#3B82F6"
                dayStyle.border = `2px dashed ${mode === "normal" ? "#FF4D8F" : "#3B82F6"}`
            }

            const dateString = format(currentDayDate, "yyyy-MM-dd")
            const dayTrackingData = trackingData[dateString] || {}
            const daySymptoms = dayTrackingData.symptoms || []
            const dayMood = dayTrackingData.moodScore

            days.push(
                <div
                    key={day}
                    className={cn(
                        "relative flex flex-col items-center justify-center p-1 md:p-2 text-center text-sm md:text-lg h-20 md:h-28 lg:h-32 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-200 hover:shadow-md",
                        isSelected && "ring-2 ring-offset-2 ring-blue-500", // Highlight selected day
                        isToday && "ring-2 ring-offset-2 ring-rose-500", // Highlight today
                    )}
                    style={dayStyle}
                    onClick={() => setSelectedDate(currentDayDate)} // Set selected date on click
                >
                    <span className={cn("z-10 text-sm md:text-xl font-bold", dayStyle.color === "white" && "text-white")}>{day}</span>
                    <div className="absolute bottom-1 md:bottom-2 flex gap-0.5 md:gap-1 z-20">
                        {isPeriodDay && <Droplets className="h-3 w-3 md:h-4 md:w-4 text-rose-500" title="Period Day" />}
                        {isOvulationDay && mode === "normal" && <Heart className="h-3 w-3 md:h-4 md:w-4 text-emerald-500" title="Ovulation Day" />}
                        {daySymptoms && daySymptoms.length > 0 && (
                            <div className="flex gap-0.5">
                                {daySymptoms.map((symptom, index) => (
                                    <div
                                        key={index}
                                        className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full"
                                        style={{
                                            backgroundColor:
                                                symptom === "cramps"
                                                    ? "#EF4444"
                                                    : symptom === "headache"
                                                        ? "#F59E0B"
                                                        : symptom === "mood_swings"
                                                            ? "#8B5CF6"
                                                            : "#000",
                                        }}
                                        title={symptom}
                                    />
                                ))}
                            </div>
                        )}
                        {dayMood && getMoodIcon(dayMood)}
                    </div>
                </div>,
            )
        }
        return days
    }

    const handleMarkPeriodButtonClick = async () => {
        const auth = getAuth()
        const user = auth.currentUser

        if (!user) {
            console.log('No user signed in')
            return
        }

        const selectedDateStr = format(selectedDate, "yyyy-MM-dd")
        const isCurrentlyMarked = periodDates.some(date => format(date, "yyyy-MM-dd") === selectedDateStr)

        if (isCurrentlyMarked) {
            // Remove period
            const newPeriodDates = periodDates.filter(date => format(date, "yyyy-MM-dd") !== selectedDateStr)
        setPeriodDates(newPeriodDates)
            await savePeriodData(newPeriodDates)
            
            // Also remove tracking data for this date
            const newTrackingData = { ...trackingData }
            delete newTrackingData[selectedDateStr]
            setTrackingData(newTrackingData)
            await saveTrackingData(newTrackingData)
        } else {
            // Mark period - show flow intensity modal
            setPendingPeriodDate(selectedDateStr)
            setShowFlowModal(true)
        }
    }

    return (
        <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 overflow-x-hidden">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-4">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Period Tracker</h2>
                        <ModeToggle mode={mode} onModeChange={handleModeChange} />
                    </div>
                    
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                            <span className="ml-3 text-gray-600">Loading your period data...</span>
                </div>
                    ) : (
                        <>
                    {/* Calendar and Legend Section */}
                            <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
                        {/* Calendar Section */}
                        <div className="flex-1 min-w-0">
                            {/* Month Navigation and Name Synced */}
                            <div className="flex items-center justify-between mb-6">
                                <Button variant="ghost" onClick={() => navigateMonth(-1)}>
                                    <ChevronLeft className="h-6 w-6" />
                                </Button>
                                        <div className="text-center flex-1 px-2">
                                            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
                                        {monthNames[month]} {year}
                                    </h3>
                                            <p className="text-xs md:text-sm text-gray-600 mt-2">
                                        {mode === "normal" ? "28-day cycle tracking" : "84-day extended cycle"}
                                    </p>
                                </div>
                                <Button variant="ghost" onClick={() => navigateMonth(1)}>
                                    <ChevronRight className="h-6 w-6" />
                                </Button>
                            </div>
                            
                            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                                {[
                                    "Sun",
                                    "Mon",
                                    "Tue",
                                    "Wed",
                                    "Thu",
                                    "Fri",
                                    "Sat",
                                ].map((day) => (
                                    <div
                                        key={day}
                                                className="p-2 md:p-4 text-center text-xs md:text-sm font-bold text-gray-600 border-r border-gray-200 last:border-r-0"
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>
                            {/* Calendar Grid */}
                                    <div className="grid grid-cols-7 gap-1 p-1 md:p-2 bg-gray-50 rounded-md border">{renderCalendarDays()}</div>

                                    <div className="mt-6 md:mt-8 text-center">
                                <Button
                                    onClick={handleMarkPeriodButtonClick}
                                            className="bg-rose-500 hover:bg-rose-600 text-white text-sm md:text-lg px-4 md:px-6 py-2 md:py-3"
                                >
                                            <PlusCircle className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                                    {periodDates.some((d) => isSameDay(d, selectedDate))
                                        ? `Remove Period for ${format(selectedDate, "MMM dd")}`
                                        : `Mark Period for ${format(selectedDate, "MMM dd")}`}
                                </Button>
                            </div>
                        </div>
                        {/* Legend Section - Aligned with Calendar */}
                                <div className="w-full xl:w-80 2xl:w-96 flex-shrink-0 xl:pt-16">
                            <Legend mode={mode} />
                        </div>
                    </div>

                    {/* Info sections below calendar and legend */}
                            <div className="grid gap-6 lg:gap-8 mt-6 lg:mt-8 lg:grid-cols-2">
                        <CycleInfo mode={mode} cycleInfo={cyclePredictions} />
                                <TrackingInfo mode={mode} trackingData={trackingData} />
                    </div>

                            {/* Tracking History Section */}
                            <div className="mt-6 lg:mt-8">
                                <TrackingHistory trackingData={trackingData} />
                </div>
                        </>
                    )}
            </div>
            </main>
            
            {/* Flow Intensity Modal */}
            <FlowIntensityModal
                isOpen={showFlowModal}
                onClose={() => {
                    setShowFlowModal(false)
                    setPendingPeriodDate(null)
                }}
                onCompleteTracking={handleCompleteTracking}
            />
        </div>
    )
}
