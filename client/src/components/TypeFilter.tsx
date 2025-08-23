import React from 'react';

interface TypeFilterProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

const TypeFilter: React.FC<TypeFilterProps> = ({ selectedType, onTypeChange }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => onTypeChange('all')}
        className={`px-3 py-1 rounded-full text-sm transition-colors ${
          selectedType === 'all' 
            ? 'bg-blue-100 text-blue-800 border border-blue-200' 
            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
        }`}
      >
        All
      </button>
      <button
        onClick={() => onTypeChange('feature_request')}
        className={`px-3 py-1 rounded-full text-sm transition-colors ${
          selectedType === 'feature_request' 
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
        }`}
      >
        ✨ Feature Requests
      </button>
      <button
        onClick={() => onTypeChange('bug')}
        className={`px-3 py-1 rounded-full text-sm transition-colors ${
          selectedType === 'bug' 
            ? 'bg-red-100 text-red-800 border border-red-200' 
            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
        }`}
      >
        🐛 Bugs
      </button>
    </div>
  );
};

export default TypeFilter;
