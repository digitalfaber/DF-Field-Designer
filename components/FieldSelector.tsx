
import React from 'react';
import { FieldType } from '../types';

interface FieldSelectorProps {
  selectedField: FieldType;
  onSelectField: (fieldType: FieldType) => void;
}

const FieldSelector: React.FC<FieldSelectorProps> = ({ selectedField, onSelectField }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-4 p-2 bg-gray-800 rounded-full shadow-lg border border-gray-700">
      {Object.values(FieldType).map((type) => (
        <button
          key={type}
          onClick={() => onSelectField(type)}
          className={`px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900 ${
            selectedField === type
              ? 'bg-green-500 text-white shadow-md'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  );
};

export default FieldSelector;
