import Sidebar from "../components/sidebar";
import TipCard from "../components/TipCard";

const CareTips = () => {
  const tips = [
    {
      icon: "💧",
      title: "Stay Hydrated",
      description:
        "Drink plenty of water during your cycle to help reduce bloating and ease cramps. Aim for 8-10 glasses daily.",
      category: "Wellness",
      bgColor: "bg-blue-50",
    },
    {
      icon: "🧘‍♀️",
      title: "Practice Gentle Yoga",
      description:
        "Light stretching and yoga poses can help relieve menstrual cramps and reduce stress. Try child's pose or cat-cow stretches.",
      category: "Exercise",
      bgColor: "bg-purple-50",
    },
    {
      icon: "🍃",
      title: "Use Heat Therapy",
      description:
        "Apply a heating pad or hot water bottle to your lower abdomen to help relax muscles and reduce cramping pain.",
      category: "Pain Relief",
      bgColor: "bg-orange-50",
    },
    {
      icon: "🥗",
      title: "Eat Iron-Rich Foods",
      description:
        "Include spinach, lentils, and lean meats in your diet to replenish iron lost during menstruation.",
      category: "Nutrition",
      bgColor: "bg-green-50",
    },
    {
      icon: "😴",
      title: "Get Quality Sleep",
      description:
        "Aim for 7-9 hours of sleep per night. Your body needs extra rest during menstruation to recover and heal.",
      category: "Rest",
      bgColor: "bg-indigo-50",
    },
    {
      icon: "🛁",
      title: "Take Warm Baths",
      description:
        "A warm bath with Epsom salts can help relax your muscles, reduce stress, and ease menstrual discomfort.",
      category: "Self-Care",
      bgColor: "bg-pink-50",
    },
    {
      icon: "🌿",
      title: "Try Herbal Teas",
      description:
        "Chamomile, ginger, and peppermint teas can help soothe cramps and reduce nausea during your period.",
      category: "Natural Remedies",
      bgColor: "bg-teal-50",
    },
    {
      icon: "📱",
      title: "Track Your Symptoms",
      description:
        "Keep a record of your symptoms, mood, and flow to better understand your cycle patterns and share with your doctor.",
      category: "Tracking",
      bgColor: "bg-yellow-50",
    },
    {
      icon: "👥",
      title: "Talk to Someone",
      description:
        "Don't hesitate to reach out to friends, family, or healthcare providers if you're experiencing severe symptoms.",
      category: "Support",
      bgColor: "bg-rose-50",
    },
  ];

  return (
    <div className="flex h-screen w-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8 max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Care Tips 💡
          </h1>
          <p className="text-gray-600">
            Helpful tips and advice to make your menstrual cycle more
            comfortable and manageable.
          </p>
        </div>

        {/* Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tips.map((tip, index) => (
            <TipCard
              key={index}
              icon={tip.icon}
              title={tip.title}
              description={tip.description}
              category={tip.category}
              bgColor={tip.bgColor}
            />
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-12 p-6 max-w-4xl mx-auto bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Need More Help?
            </h2>
            <p className="text-gray-600 mb-4">
              If you experience severe pain or unusual symptoms, consult with a
              healthcare professional.
            </p>
            <button
              type="button"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-pink-600 transition-colors duration-200"
            >
              Contact Support
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CareTips;
