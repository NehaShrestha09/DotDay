"use client"

import { useState, useCallback } from "react"
import {
    Calendar,
    ChevronRight,
    ChevronLeft,
    Heart,
    User,
    Clock,
    Target,
    Mail,
    Check,
    AlertCircle,
    HelpCircle,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { cn } from "../../lib/utils"
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import db from "../firebase/firestore";
import { useNavigate } from "react-router-dom"



// Helper Components (included directly as they are not from shadcn/ui)

function ProgressBar({ currentStep, totalSteps }) {
    const progress = (currentStep / totalSteps) * 100
    return (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6 sm:mb-8">
            <div
                className="h-2 rounded-full transition-all duration-500 ease-out"
                style={{
                    width: `${progress}%`,
                    backgroundColor: "#FF4D8F", // DotDay pink
                }}
            />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>
                    Step {currentStep} of {totalSteps}
                </span>
                <span>{Math.round(progress)}% Complete</span>
            </div>
        </div>
    )
}

function StepCard({ title, subtitle, icon: Icon, children, isOptional = false }) {
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
            <div className="text-center mb-6 sm:mb-8">
                <div
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg"
                    style={{ backgroundColor: "#FF4D8F20" }} // Light DotDay pink
                >
                    {Icon && <Icon className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: "#FF4D8F" }} />} {/* DotDay pink */}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 px-2">{title}</h2>
                <p className="text-gray-600 text-sm sm:text-base px-2">{subtitle}</p>
                {isOptional && (
                    <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium">
                        Optional - Can Skip
                    </span>
                )}
            </div>
            {children}
        </div>
    )
}

function MultipleChoiceOption({ option, isSelected, onClick, description }) {
    return (
        <button
            onClick={onClick}
            className={`w-full p-3 sm:p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${isSelected ? "border-pink-500 bg-pink-50 shadow-lg" : "border-gray-200 hover:border-pink-300 hover:bg-pink-50"
                }`}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? "border-pink-500 bg-pink-500" : "border-gray-300"
                        }`}
                >
                    {isSelected && <Check className="h-2 w-2 sm:h-3 sm:w-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">{option}</div>
                    {description && <div className="text-xs sm:text-sm text-gray-600 mt-1">{description}</div>}
                </div>
            </div>
        </button>
    )
}

function DateInput({ value, onChange, label, required = false }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type="date"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-base sm:text-lg"
                required={required}
            />
        </div>
    )
}

function NumberInput({ value, onChange, label, min, max, placeholder, required = false }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                min={min}
                max={max}
                placeholder={placeholder}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-base sm:text-lg"
                required={required}
            />
        </div>
    )
}

function EmailInput({ value, onChange, label, required = false }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type="email"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="partner@example.com"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-base sm:text-lg"
                required={required}
            />
        </div>
    )
}

function MultiSelectOption({ option, isSelected, onClick, description }) {
    return (
        <button
            onClick={onClick}
            className={`w-full p-3 sm:p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${isSelected ? "border-pink-500 bg-pink-50 shadow-lg" : "border-gray-200 hover:border-pink-300 hover:bg-pink-50"
                }`}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? "border-pink-500 bg-pink-500" : "border-gray-300"
                        }`}
                >
                    {isSelected && <Check className="h-2 w-2 sm:h-3 sm:w-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">{option}</div>
                    {description && <div className="text-xs sm:text-sm text-gray-600 mt-1">{description}</div>}
                </div>
            </div>
        </button>
    )
}

// Main UserOnboarding component
export default function UserOnboarding() {
    const navigate = useNavigate()
    const [currentStepIndex, setCurrentStepIndex] = useState(0)
    const [formData, setFormData] = useState({
        lastPeriodDate: "",
        lastPeriodKnown: true,
        periodDuration: "",
        cycleLength: "",
        calendarMode: "",
        partnerIntegration: "",
        partnerEmail: "",
        birthControl: "",
        tryingToConceive: "",
        commonSymptoms: [],
        premenstrualMood: "",
        primaryGoal: "",
    })

    const updateFormData = useCallback((key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }))
    }, [])

    // Define all steps in an array
    const steps =
        [
            {
                id: 1,
                title: "When did your last period start?",
                subtitle: "This helps us predict your next cycle accurately",
                icon: Calendar,
                component: (
                    <div className="space-y-6">
                        {/* Date Input Option */}
                        <DateInput
                            value={formData.lastPeriodDate}
                            onChange={(value) => {
                                updateFormData("lastPeriodDate", value)
                                updateFormData("lastPeriodKnown", true)
                            }}
                            label="Select your last period start date"
                            required={false}
                        />

                        {/* OR Divider */}
                        <div className="flex items-center gap-4">
                            <div className="flex-grow h-px bg-gray-300" />
                            <span className="text-sm text-gray-500">OR</span>
                            <div className="flex-grow h-px bg-gray-300" />
                        </div>

                        {/* "I don't remember" Option */}
                        <button
                            onClick={() => {
                                updateFormData("lastPeriodKnown", false)
                                updateFormData("lastPeriodDate", "")
                            }}
                            className={`w-full p-3 sm:p-4 rounded-xl border-2 text-center transition-all ${formData.lastPeriodKnown === false
                                ? "border-gray-500 bg-gray-50 shadow"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            <div className="flex items-center justify-center gap-3">
                                <HelpCircle className="h-5 w-5 text-gray-500" />
                                <div>
                                    <div className="font-semibold text-gray-900">I don't know / Can't remember</div>
                                    <div className="text-sm text-gray-600">
                                        We'll help you track from your next period
                                    </div>
                                </div>
                            </div>
                        </button>

                        {/* Info Box */}
                        <div
                            className={`rounded-xl p-4 border ${formData.lastPeriodKnown === false
                                ? "bg-orange-50 border-orange-200"
                                : "bg-blue-50 border-blue-200"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <AlertCircle
                                    className={`h-5 w-5 mt-0.5 ${formData.lastPeriodKnown === false ? "text-orange-500" : "text-blue-500"
                                        }`}
                                />
                                <div>
                                    <p
                                        className={`text-sm font-medium ${formData.lastPeriodKnown === false ? "text-orange-800" : "text-blue-800"
                                            }`}
                                    >
                                        {formData.lastPeriodKnown === false ? "No worries!" : "Why we need this"}
                                    </p>
                                    <p
                                        className={`text-sm ${formData.lastPeriodKnown === false ? "text-orange-700" : "text-blue-700"
                                            }`}
                                    >
                                        {formData.lastPeriodKnown === false
                                            ? "We'll start tracking accurately from your next period. You can log it when it arrives and we'll build your pattern from there."
                                            : "This date is essential for calculating your cycle predictions and providing accurate insights."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ),
                isValid: () => formData.lastPeriodKnown === false || formData.lastPeriodDate !== "",
                isOptional: false,
            }
            ,
            {
                id: 2,
                title: "How long does your period usually last?",
                subtitle: "Help us understand your typical flow duration",
                icon: Clock,
                component: (
                    <div className="space-y-6">
                        <NumberInput
                            value={formData.periodDuration}
                            onChange={(value) => updateFormData("periodDuration", value)}
                            label="Period duration (days)"
                            min="1"
                            max="10"
                            placeholder="e.g., 5"
                            required
                        />
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                            {[3, 4, 5, 6, 7].map((days) => (
                                <button
                                    key={days}
                                    onClick={() => updateFormData("periodDuration", days.toString())}
                                    className={`p-2 sm:p-3 rounded-xl border-2 text-center transition-all ${formData.periodDuration === days.toString()
                                        ? "border-pink-500 bg-pink-50"
                                        : "border-gray-200 hover:border-pink-300"
                                        }`}
                                >
                                    <div className="font-bold text-base sm:text-lg">{days}</div>
                                    <div className="text-xs text-gray-600">days</div>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => updateFormData("periodDuration", "unknown")}
                            className={`w-full p-3 rounded-xl border-2 text-center transition-all ${formData.periodDuration === "unknown"
                                ? "border-gray-500 bg-gray-50"
                                : "border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            I don't know / It varies
                        </button>
                    </div>
                ),
                isValid: () => formData.periodDuration !== "",
                isOptional: false,
            },
            {
                id: 3,
                title: "What's your typical cycle length?",
                subtitle: "Days from the start of one period to the start of the next",
                icon: Target,
                component: (
                    <div className="space-y-6">
                        <NumberInput
                            value={formData.cycleLength}
                            onChange={(value) => updateFormData("cycleLength", value)}
                            label="Cycle length (days)"
                            min="21"
                            max="45"
                            placeholder="e.g., 28"
                            required
                        />
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                            {[24, 26, 28, 30, 32, 35].map((days) => (
                                <button
                                    key={days}
                                    onClick={() => updateFormData("cycleLength", days.toString())}
                                    className={`p-2 sm:p-3 rounded-xl border-2 text-center transition-all ${formData.cycleLength === days.toString()
                                        ? "border-pink-500 bg-pink-50"
                                        : "border-gray-200 hover:border-pink-300"
                                        }`}
                                >
                                    <div className="font-bold text-base sm:text-lg">{days}</div>
                                    <div className="text-xs text-gray-600">days</div>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => updateFormData("cycleLength", "unknown")}
                            className={`w-full p-3 rounded-xl border-2 text-center transition-all ${formData.cycleLength === "unknown"
                                ? "border-gray-500 bg-gray-50"
                                : "border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            I don't know / It's irregular
                        </button>
                    </div>
                ),
                isValid: () => formData.cycleLength !== "",
                isOptional: false,
            },
            {
                id: 4,
                title: "Which calendar mode describes your situation?",
                subtitle: "This determines how we track and predict your cycles",
                icon: Calendar,
                component: (
                    <div className="space-y-3 sm:space-y-4">
                        <MultipleChoiceOption
                            option="Normal Cycle"
                            description="I experience regular monthly periods"
                            isSelected={formData.calendarMode === "normal"}
                            onClick={() => updateFormData("calendarMode", "normal")}
                        />
                        <MultipleChoiceOption
                            option="Tricycling"
                            description="I use birth control to skip periods for extended periods"
                            isSelected={formData.calendarMode === "tricycling"}
                            onClick={() => updateFormData("calendarMode", "tricycling")}
                        />
                        <MultipleChoiceOption
                            option="I don't know"
                            description="I'm not sure which applies to me"
                            isSelected={formData.calendarMode === "unknown"}
                            onClick={() => updateFormData("calendarMode", "unknown")}
                        />
                    </div>
                ),
                isValid: () => formData.calendarMode !== "",
                isOptional: false,
            },
            {
                id: 5,
                title: "Partner Integration",
                subtitle: "Would you like to connect with a partner to share cycle insights?",
                icon: Heart,
                component: (
                    <div className="space-y-3 sm:space-y-4">
                        <MultipleChoiceOption
                            option="Yes, I'd like to connect with my partner"
                            description="Share cycle insights and receive supportive notifications"
                            isSelected={formData.partnerIntegration === "yes"}
                            onClick={() => updateFormData("partnerIntegration", "yes")}
                        />
                        <MultipleChoiceOption
                            option="No, I prefer to keep this private"
                            description="Use the app for personal tracking only"
                            isSelected={formData.partnerIntegration === "no"}
                            onClick={() => updateFormData("partnerIntegration", "no")}
                        />
                        <MultipleChoiceOption
                            option="Maybe later"
                            description="I can set this up later in settings"
                            isSelected={formData.partnerIntegration === "later"}
                            onClick={() => updateFormData("partnerIntegration", "later")}
                        />
                    </div>
                ),
                isValid: () => formData.partnerIntegration !== "",
                isOptional: false,
            },
            {
                id: 6,
                title: "Partner's Email Address",
                subtitle: "We'll send them supportive insights and notifications",
                icon: Mail,
                component: (
                    <div className="space-y-6">
                        <EmailInput
                            value={formData.partnerEmail}
                            onChange={(value) => updateFormData("partnerEmail", value)}
                            label="Partner's email address"

                        />
                        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                            <div className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-green-800 font-medium">What your partner will receive</p>
                                    <ul className="text-sm text-green-700 mt-2 space-y-1">
                                        <li>• Gentle notifications about your cycle phases</li>
                                        <li>• Supportive suggestions when you log symptoms</li>
                                        <li>• Optional diary entries you choose to share</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                ),
                isValid: () => formData.partnerEmail !== "",
                isOptional: false,
                condition: () => formData.partnerIntegration === "yes", // Only show if partner integration is 'yes'
            },
            {
                id: 7,
                title: "Birth Control Information",
                subtitle: "This helps us provide more accurate predictions and insights",
                icon: User,
                component: (
                    <div className="space-y-3 sm:space-y-4">
                        <div className="grid gap-3 sm:gap-4">
                            <MultipleChoiceOption
                                option="Yes, combined pill"
                                isSelected={formData.birthControl === "combined-pill"}
                                onClick={() => updateFormData("birthControl", "combined-pill")}
                            />
                            <MultipleChoiceOption
                                option="Yes, progestin-only pill"
                                isSelected={formData.birthControl === "progestin-pill"}
                                onClick={() => updateFormData("birthControl", "progestin-pill")}
                            />
                            <MultipleChoiceOption
                                option="Yes, patch"
                                isSelected={formData.birthControl === "patch"}
                                onClick={() => updateFormData("birthControl", "patch")}
                            />
                            <MultipleChoiceOption
                                option="Yes, vaginal ring"
                                isSelected={formData.birthControl === "ring"}
                                onClick={() => updateFormData("birthControl", "ring")}
                            />
                            <MultipleChoiceOption
                                option="Yes, hormonal IUD"
                                isSelected={formData.birthControl === "iud"}
                                onClick={() => updateFormData("birthControl", "iud")}
                            />
                            <MultipleChoiceOption
                                option="Yes, implant"
                                isSelected={formData.birthControl === "implant"}
                                onClick={() => updateFormData("birthControl", "implant")}
                            />
                            <MultipleChoiceOption
                                option="No"
                                isSelected={formData.birthControl === "none"}
                                onClick={() => updateFormData("birthControl", "none")}
                            />
                            <MultipleChoiceOption
                                option="I don't know"
                                isSelected={formData.birthControl === "unknown"}
                                onClick={() => updateFormData("birthControl", "unknown")}
                            />
                            <MultipleChoiceOption
                                option="Prefer not to say"
                                isSelected={formData.birthControl === "prefer-not-to-say"}
                                onClick={() => updateFormData("birthControl", "prefer-not-to-say")}
                            />
                        </div>
                    </div>
                ),
                isValid: () => true, // Optional step, always valid
                isOptional: true,
            },
            {
                id: 8,
                title: "Common Symptoms & Goals",
                subtitle: "Help us personalize your experience",
                icon: Target,
                component: (
                    <div className="space-y-6 sm:space-y-8">
                        {/* Trying to Conceive */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-base sm:text-lg">
                                Are you currently trying to conceive (TTC)?
                            </h4>
                            <div className="space-y-3">
                                <MultipleChoiceOption
                                    option="Yes"
                                    isSelected={formData.tryingToConceive === "yes"}
                                    onClick={() => updateFormData("tryingToConceive", "yes")}
                                />
                                <MultipleChoiceOption
                                    option="No"
                                    isSelected={formData.tryingToConceive === "no"}
                                    onClick={() => updateFormData("tryingToConceive", "no")}
                                />
                                <MultipleChoiceOption
                                    option="I don't know"
                                    isSelected={formData.tryingToConceive === "unknown"}
                                    onClick={() => updateFormData("tryingToConceive", "unknown")}
                                />
                            </div>
                        </div>
                        {/* Common Symptoms */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-base sm:text-lg">
                                Top 3 symptoms you commonly experience (select up to 3)
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    "Cramps",
                                    "Bloating",
                                    "Mood Swings",
                                    "Fatigue",
                                    "Headaches",
                                    "Breast Tenderness",
                                    "Acne",
                                    "Cravings",
                                    "Low Energy",
                                    "I don't know",
                                ].map((symptom) => (
                                    <MultiSelectOption
                                        key={symptom}
                                        option={symptom}
                                        isSelected={formData.commonSymptoms.includes(symptom)}
                                        onClick={() => {
                                            const symptoms = formData.commonSymptoms.includes(symptom)
                                                ? formData.commonSymptoms.filter((s) => s !== symptom)
                                                : formData.commonSymptoms.length < 3
                                                    ? [...formData.commonSymptoms, symptom]
                                                    : formData.commonSymptoms
                                            updateFormData("commonSymptoms", symptoms)
                                        }}
                                    />
                                ))}
                            </div>
                            {formData.commonSymptoms.length > 0 && (
                                <div className="mt-3 text-sm text-gray-600">Selected: {formData.commonSymptoms.length}/3 symptoms</div>
                            )}
                        </div>
                    </div>
                ),
                isValid: () => true, // Optional step, always valid
                isOptional: true,
            },
            {
                id: 9,
                title: "Final Personalization",
                subtitle: "Help us tailor your app experience",
                icon: Heart,
                component: (
                    <div className="space-y-6 sm:space-y-8">
                        {/* Pre-menstrual Mood */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-base sm:text-lg">
                                How would you describe your typical mood during your pre-menstrual phase?
                            </h4>
                            <div className="space-y-3">
                                <MultipleChoiceOption
                                    option="Generally positive"
                                    isSelected={formData.premenstrualMood === "positive"}
                                    onClick={() => updateFormData("premenstrualMood", "positive")}
                                />
                                <MultipleChoiceOption
                                    option="A bit irritable/moody"
                                    isSelected={formData.premenstrualMood === "irritable"}
                                    onClick={() => updateFormData("premenstrualMood", "irritable")}
                                />
                                <MultipleChoiceOption
                                    option="Very emotional/sensitive"
                                    isSelected={formData.premenstrualMood === "emotional"}
                                    onClick={() => updateFormData("premenstrualMood", "emotional")}
                                />
                                <MultipleChoiceOption
                                    option="Low energy/withdrawn"
                                    isSelected={formData.premenstrualMood === "withdrawn"}
                                    onClick={() => updateFormData("premenstrualMood", "withdrawn")}
                                />
                                <MultipleChoiceOption
                                    option="No significant change"
                                    isSelected={formData.premenstrualMood === "no-change"}
                                    onClick={() => updateFormData("premenstrualMood", "no-change")}
                                />
                                <MultipleChoiceOption
                                    option="I don't know"
                                    isSelected={formData.premenstrualMood === "unknown"}
                                    onClick={() => updateFormData("premenstrualMood", "unknown")}
                                />
                            </div>
                        </div>
                        {/* Primary Goal */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-base sm:text-lg">
                                What is your primary goal for using this period tracker app?
                            </h4>
                            <div className="space-y-3">
                                <MultipleChoiceOption
                                    option="Understand my body better"
                                    isSelected={formData.primaryGoal === "understand-body"}
                                    onClick={() => updateFormData("primaryGoal", "understand-body")}
                                />
                                <MultipleChoiceOption
                                    option="Predict my period accurately"
                                    isSelected={formData.primaryGoal === "predict-period"}
                                    onClick={() => updateFormData("primaryGoal", "predict-period")}
                                />
                                <MultipleChoiceOption
                                    option="Manage symptoms"
                                    isSelected={formData.primaryGoal === "manage-symptoms"}
                                    onClick={() => updateFormData("primaryGoal", "manage-symptoms")}
                                />
                                <MultipleChoiceOption
                                    option="Track fertility"
                                    isSelected={formData.primaryGoal === "track-fertility"}
                                    onClick={() => updateFormData("primaryGoal", "track-fertility")}
                                />
                                <MultipleChoiceOption
                                    option="Improve communication with my partner"
                                    isSelected={formData.primaryGoal === "partner-communication"}
                                    onClick={() => updateFormData("partner-communication", "partner-communication")}
                                />
                                <MultipleChoiceOption
                                    option="I don't know"
                                    isSelected={formData.primaryGoal === "unknown"}
                                    onClick={() => updateFormData("primaryGoal", "unknown")}
                                />
                            </div>
                        </div>
                    </div>
                ),
                isValid: () => true, // Optional step, always valid
                isOptional: true,
            },
        ]

    const currentStepData = steps[currentStepIndex]
    const totalVisibleSteps = steps.filter((step) => !step.condition || step.condition()).length
    const currentVisibleStepNumber =
        steps.filter((_, index) => index <= currentStepIndex && (!steps[index].condition || steps[index].condition()))
            .length || 1

    const handleNext = () => {
        let nextIndex = currentStepIndex + 1
        while (nextIndex < steps.length && steps[nextIndex].condition && !steps[nextIndex].condition()) {
            nextIndex++ // Skip steps that don't meet their condition
        }
        if (nextIndex < steps.length) {
            setCurrentStepIndex(nextIndex)
        } else {
            handleComplete()
        }
    }

    const handlePrevious = () => {
        let prevIndex = currentStepIndex - 1
        while (prevIndex >= 0 && steps[prevIndex].condition && !steps[prevIndex].condition()) {
            prevIndex-- // Skip steps that don't meet their condition
        }
        if (prevIndex >= 0) {
            setCurrentStepIndex(prevIndex)
        }
    }

    const handleSkip = () => {
        handleNext()
    }

    const handleComplete = async () => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                console.error("No user is signed in!");
                alert("You must be signed in to complete onboarding.");
                return;
            }

            const userDocRef = doc(db, "users", user.uid);
            console.log("Updating user doc at:", userDocRef.path);

            // Get existing user data
            const userSnap = await getDoc(userDocRef);
            const existingData = userSnap.exists() ? userSnap.data() : {};

            // Save onboarding data in normalMode structure
            const updatedData = {
                ...existingData,
                normalMode: {
                    ...existingData.normalMode,
                    onboarding: formData,
                    lastUpdated: new Date().toISOString()
                },
                // Only add partnerConnection if partnerEmail is present
                ...(formData.partnerEmail
                    ? {
                        partnerConnection: {
                            partnerEmail: formData.partnerEmail,
                            connectionStatus: 'connected',
                            partnerName: 'Partner',
                            requestedAt: new Date().toISOString()
                        }
                    }
                    : {}),
                // Save notification settings
                notificationSettings: {
                    periodReminders: true,
                    cycleInsights: true,
                    wellnessTips: true,
                    partnerUpdates: true
                }
            };

            await setDoc(userDocRef, updatedData, { merge: true });



            console.log("Onboarding data saved successfully for normal mode:", formData);
            navigate("/dashboard")

        } catch (error) {
            console.error("Error in handleComplete:", error);
            alert("Something went wrong while saving your data. Please try again.");
        }
    };





    const isCurrentStepValid = currentStepData.isValid()

    return (
        <div className="min-h-screen w-full overflow-x-hidden">
            <div className="w-screen h-screen overflow-x-hidden bg-gradient-to-br from-pink-300 to-blue-300 py-16">

                <div className="w-full max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-6 sm:mb-8">
                        <div className="w-40 sm:w-60 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                            <img src="icons/logo.png" alt="DotDay Logo" className="w-full h-auto" />
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 px-4">
                            Welcome to DotDay
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base px-4">
                            Let's personalize your experience with a few questions
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <ProgressBar currentStep={currentVisibleStepNumber} totalSteps={totalVisibleSteps} />

                    {/* Step Content */}
                    <StepCard
                        title={currentStepData.title}
                        subtitle={currentStepData.subtitle}
                        icon={currentStepData.icon}
                        isOptional={currentStepData.isOptional}
                    >
                        {currentStepData.component}
                    </StepCard>

                    {/* Navigation Buttons */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 sm:mt-8 max-w-4xl mx-auto gap-4 sm:gap-0 px-4">
                        <Button
                            onClick={handlePrevious}
                            disabled={currentStepIndex === 0}
                            variant="outline"
                            className={cn(
                                "py-3 rounded-lg font-semibold bg-white border border-gray-300 text-gray-900",
                                currentStepIndex === 0 && "invisible"
                            )}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <div className="flex gap-3 order-1 sm:order-2 w-full sm:w-auto">
                            {/* Skip button for optional steps */}
                            {currentStepData.isOptional && currentStepIndex < steps.length - 1 && (
                                <Button
                                    onClick={handleSkip}
                                    variant="outline"
                                    className="py-3 rounded-lg font-semibold bg-white border border-gray-300 text-gray-900"
                                >
                                    Skip
                                </Button>
                            )}
                            {/* Next/Complete button */}
                            {currentStepIndex < steps.length - 1 ? (
                                <Button
                                    onClick={handleNext}
                                    disabled={!isCurrentStepValid}
                                    variant="outline"
                                    className={cn(
                                        "py-3 rounded-lg font-semibold bg-white border border-gray-300 text-gray-900",
                                        !isCurrentStepValid && "invisible"
                                    )}
                                    style={!isCurrentStepValid ? {} : { backgroundColor: "#FF4D8F" }}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleComplete}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold text-white hover:shadow-lg hover:scale-105 transition-all"
                                    style={{ backgroundColor: "#FF4D8F" }}
                                >
                                    Complete Setup
                                    <Check className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>


    )
}