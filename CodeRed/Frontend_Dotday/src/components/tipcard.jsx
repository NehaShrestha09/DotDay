const TipCard = ({ icon, title, description, category, bgColor = "bg-pink-50" }) => {
  return (
    <div className={`${bgColor} p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-start space-x-4">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <span className="px-2 py-1 text-xs font-medium text-pink-600 bg-pink-100 rounded-full">{category}</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}

export default TipCard
