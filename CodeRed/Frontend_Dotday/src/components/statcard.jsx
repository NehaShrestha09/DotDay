// src/components/StatCard.jsx
import React from "react"

const statcard = ({ title, value, emoji, subtitle }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <div className="text-2xl font-bold text-gray-900">
        {value} {emoji}
      </div>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </div>
  )
}

export default statcard
