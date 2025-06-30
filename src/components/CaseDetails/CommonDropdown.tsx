// CommonDropdown.tsx
import React from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface CommonDropdownProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

const CommonDropdown: React.FC<CommonDropdownProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select",
  error,
  required = false,
  className = "",
  disabled = false
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-200'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      >
        <option disabled value="">
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default CommonDropdown;