import React, { useState, useEffect } from 'react';
import { useFloating, offset, shift } from '@floating-ui/react';
import { Option } from '../types/Option';
import { AutocompleteProps } from '../types/AutocompleteProps';

const Autocomplete = <T extends Option>({
  description,
  disabled = false,
  filterOptions,
  label,
  loading,
  multiple = false,
  onChange,
  onInputChange,
  options,
  placeholder = '',
  renderOption,
  value
}: AutocompleteProps<T>) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<T[]>(value);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<T[]>([]);
  const [isTyping, setIsTyping] = useState(false); // To track if user is typing
  const [highlightedIndex, setHighlightedIndex] = useState(-1); // To track highlighted option during arrow navigation

  // Floating UI setup
  const { refs, floatingStyles } = useFloating({
    middleware: [offset(5), shift()],
    placement: 'bottom-start',
  });

  // Effect to handle debounced search filtering
  useEffect(() => {
    const handler = setTimeout(() => {
      let filtered: T[];
      
      // check if filterOptions is provided, otherwise use the default logic
      if (filterOptions) {
        filtered = filterOptions(options, inputValue);
      } else {
        // Assume options are objects and use label property for comparison
        filtered = options.filter(option => 
          option.label.toLowerCase().includes(inputValue.toLowerCase())
        );
      }
      setFilteredOptions(filtered);
      setIsOpen(filtered.length > 0);
      setHighlightedIndex(-1); // Reset the highlighted index after highlighted index after filtering

      // reset the typing state once filtering is done
      setIsTyping(false);
    }, 500);

    return () => {
      clearTimeout(handler); // Clear timeout to debounce correctly
    };
  }, [inputValue, options]);

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onInputChange(value); // Notify parent of input change
    setIsTyping(true); // Mark typing as started
  };

  // Handle selection toggle when a user checks/unchecks an option
  const handleOptionToggle = (option: T) => {
    let updatedSelectedOptions = [...selectedOptions];
    if (multiple) {
      // If multiple is true, allow toggling selection
      if (isOptionSelected(option)) {
        updatedSelectedOptions = updatedSelectedOptions.filter(selected => selected.id !== option.id);
      } else {
        updatedSelectedOptions.push(option);
      }
    } else {
      // If multiple is false, allow selection of only one option
      updatedSelectedOptions = [option];
      setIsOpen(false); // Close dropdown after selection
    }
    setSelectedOptions(updatedSelectedOptions);
    onChange(updatedSelectedOptions);
  };

  // Handle keyboard navigation with Arrow keys and Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredOptions.length > 0) {
        setHighlightedIndex((prevIndex) =>
          prevIndex === filteredOptions.length - 1 ? 0 : prevIndex + 1
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredOptions.length > 0) {
        setHighlightedIndex((prevIndex) =>
          prevIndex === 0 ? filteredOptions.length - 1 : prevIndex - 1
        );
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        const option = filteredOptions[highlightedIndex];
        handleOptionToggle(option);
      }
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (!refs.floating.current?.contains(e.target as Node) && !refs.reference.current?.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isOptionSelected = (option: T) => {
    return selectedOptions.some(selected => selected.label === option.label);
  };

  if (disabled) {
    return null;
  }

  if (loading) {
    return (
    <div role="status">
      <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  )};

  return (
    <div className="w-full relative">
      <h1><b>{description}</b></h1>
      <label>{label}</label>
      <div ref={refs.reference} className="relative">
        {/* Input Field */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
        />

        {/* Left search icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          viewBox="0 0 16 16"
        >
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
        </svg>

        {/* Right loading spinner (only when typing) */}
        {isTyping && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M8 3a5 5 0 1 1 0 10A5 5 0 0 1 8 3zm0 1a4 4 0 1 0 0 8A4 4 0 0 0 8 4z"
            />
          </svg>
        )}
      </div>

      {/* Dropdown */}
      {!isTyping && isOpen && (
        <ul
          ref={refs.floating}
          style={floatingStyles}
          className="bg-white border border-gray-300 rounded-md w-full mt-20 z-10 max-h-60 overflow-auto"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <li
                key={option.label}
                className={`px-4 py-2 flex items-center hover:bg-gray-100 cursor-pointer ${
                  highlightedIndex === index ? 'bg-gray-100' : ''
                }`}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => handleOptionToggle(option)}
              >
                {/* Checkbox for selection */}
                <input
                  type="checkbox"
                  checked={isOptionSelected(option)}
                  onChange={() => handleOptionToggle(option)}
                  className="mr-2"
                />
                <span className="flex flex-col">
                  {renderOption ? renderOption(option) : <span>{option.label}</span>}
                </span>
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-500">No options</li>
          )}
        </ul>
      )}

      {/* Render selected options (Optional) */}
      {selectedOptions.length > 0 && (
        <div className="mt-2">
          {selectedOptions.map(option => (
            <span key={option.label} className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded mr-1">
              {option.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default Autocomplete;
