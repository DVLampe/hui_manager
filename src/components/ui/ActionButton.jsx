import React from 'react';

const colorVariants = {
  red: 'from-red-600 to-red-700 hover:from-red-700 hover:to-red-800',
  yellow: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
  green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
};

const ActionButton = ({ onClick, disabled, icon: Icon, text, color = 'red' }) => {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-3 bg-gradient-to-r text-white rounded-xl p-4 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 ${colorVariants[color]}`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-semibold">{text}</span>
    </button>
  );
};

export default ActionButton;
