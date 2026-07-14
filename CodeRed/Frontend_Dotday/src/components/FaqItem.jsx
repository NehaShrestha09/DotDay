import { useState } from 'react';

export default function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left flex justify-between items-center text-lg font-medium text-gray-800"
      >
        {question}
        <span>{open ? '-' : '+'}</span>
      </button>
      {open && (
        <p className="mt-2 text-gray-600 text-sm transition-all duration-300">
          {answer}
        </p>
      )}
    </div>
  );
}
