import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X } from 'lucide-react';

const MobileNumberDropdown = ({ 
  selectedNumbers = [], 
  onNumbersChange, 
  availableNumbers = [],
  placeholder = "Select mobile number",
  className = ""
}) => {
  const [dropdowns, setDropdowns] = useState([]);
  console.log(":dropdowns",dropdowns[0]?.selectedNumber)

  // Memoize available numbers to prevent unnecessary re-calculations
  const allAvailableNumbers = useMemo(() => {
    return (availableNumbers.length > 0 ? availableNumbers : [])
      .map((number, index) => ({
        id: index,
        number: typeof number === 'string' ? number : number.mobile_number || number.number,
        label: typeof number === 'string' ? number : number.mobile_number || number.number
      }));
  }, [availableNumbers]);

  // Initialize dropdowns based on selectedNumbers
  useEffect(() => {
    console.log('MobileNumberDropdown useEffect triggered', { selectedNumbers, availableNumbers: allAvailableNumbers });
    
    // Only proceed if we have available numbers
    if (allAvailableNumbers.length === 0) {
      console.log('No available numbers yet, waiting...');
      return;
    }

    // Check if selectedNumbers is valid and not empty
    if (Array.isArray(selectedNumbers) && selectedNumbers.length > 0) {
      console.log('Creating dropdowns for selected numbers:', selectedNumbers);
      
      const initialDropdowns = selectedNumbers.map((number, index) => {
        const numberStr = String(number).trim(); // Ensure string and trim whitespace
        console.log(`Creating dropdown ${index} with number: "${numberStr}"`);
        
        // Verify this number exists in available numbers
        const exists = allAvailableNumbers.some(availableNum => 
          String(availableNum.number).trim() === numberStr
        );
        console.log(`Number "${numberStr}" exists in available numbers:`, exists);
        
        return {
          id: `dropdown-${index}-${Date.now()}-${Math.random()}`,
          selectedNumber: numberStr
        };
      });
      
      console.log('Setting dropdowns with selected numbers:', initialDropdowns);
      setDropdowns(initialDropdowns);
    } else {
      console.log('No selected numbers, setting single empty dropdown');
      setDropdowns([{ 
        id: `dropdown-0-${Date.now()}-${Math.random()}`, 
        selectedNumber: '' 
      }]);
    }
  }, [selectedNumbers, allAvailableNumbers]);

  const getAvailableNumbers = (currentDropdownId, currentSelectedNumber) => {
    const selectedInOtherDropdowns = dropdowns
      .filter(dropdown => dropdown.id !== currentDropdownId)
      .map(dropdown => dropdown.selectedNumber)
      .filter(number => number !== '');

    // Get available numbers (not selected in other dropdowns)
    const availableNumbers = allAvailableNumbers.filter(number => {
      const numberStr = String(number.number).trim();
      const currentSelectedStr = String(currentSelectedNumber).trim();
      
      // If this is the currently selected number in this dropdown, include it
      if (numberStr === currentSelectedStr) {
        return true;
      }
      
      // Otherwise, only include if not selected in other dropdowns
      return !selectedInOtherDropdowns.some(selected => 
        String(selected).trim() === numberStr
      );
    });

    // If current selected number exists but is not in available numbers,
    // add it as a special option (this handles the case where a previously 
    // selected number is no longer in the main available list)
    const currentSelectedStr = String(currentSelectedNumber).trim();
    if (currentSelectedStr && !availableNumbers.some(num => 
        String(num.number).trim() === currentSelectedStr)) {
      
      // Add the missing selected number as an option
      availableNumbers.push({
        id: `missing-${currentDropdownId}`,
        number: currentSelectedStr,
        label: currentSelectedStr,
        isMissing: true
      });
    }

    return availableNumbers;
  };

  const handleDropdownChange = (dropdownId, selectedValue) => {
    console.log('Dropdown change:', { dropdownId, selectedValue });
    
    const updatedDropdowns = dropdowns.map(dropdown =>
      dropdown.id === dropdownId
        ? { ...dropdown, selectedNumber: selectedValue }
        : dropdown
    );
    
    setDropdowns(updatedDropdowns);
    
    const selectedNumbers = updatedDropdowns
      .map(dropdown => dropdown.selectedNumber)
      .filter(number => number !== '');
    
    console.log('Notifying parent with selected numbers:', selectedNumbers);
    onNumbersChange(selectedNumbers);
  };

  // Add new dropdown
  const addDropdown = () => {
    const newDropdown = {
      id: `dropdown-${dropdowns.length}-${Date.now()}-${Math.random()}`,
      selectedNumber: ''
    };
    const updatedDropdowns = [...dropdowns, newDropdown];
    setDropdowns(updatedDropdowns);
  };

  // Remove dropdown
  const removeDropdown = (dropdownId) => {
    if (dropdowns.length <= 1) return; // Keep at least one dropdown
    
    const updatedDropdowns = dropdowns.filter(dropdown => dropdown.id !== dropdownId);
    setDropdowns(updatedDropdowns);
    
    // Notify parent component
    const selectedNumbers = updatedDropdowns
      .map(dropdown => dropdown.selectedNumber)
      .filter(number => number !== '');
    
    onNumbersChange(selectedNumbers);
  };

  // Check if we can add more dropdowns
  const canAddMore = () => {
    const selectedCount = dropdowns.filter(d => d.selectedNumber !== '').length;
    return selectedCount < allAvailableNumbers.length && 
           dropdowns.every(d => d.selectedNumber !== '');
  };

  // If no available numbers, show loading
  if (allAvailableNumbers.length === 0) {
    console.log('No available numbers, showing loading...');
    return (
      <div className={className}>
        <div className="text-sm text-gray-500">
          Loading mobile numbers...
        </div>
      </div>
    );
  }

  // If dropdowns not ready, show loading
  if (!dropdowns || dropdowns.length === 0) {
    console.log('Dropdowns not ready, showing loading...');
    return (
      <div className={className}>
        <div className="text-sm text-gray-500">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-3">
        {dropdowns.map((dropdown, index) => {
          const availableForThisDropdown = getAvailableNumbers(dropdown.id, dropdown.selectedNumber);
          console.log(`Dropdown ${index} - Selected: "${dropdown.selectedNumber}", Available:`, 
            availableForThisDropdown.map(n => n.number));
          
          return (
            <div key={dropdown.id} className="flex items-center gap-2">
              <div className="flex-1">
                <select
                  value={dropdown.selectedNumber}
                  onChange={(e) => handleDropdownChange(dropdown.id, e.target.value)}
                  className="w-full px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required={index === 0} // First dropdown is required
                >
                  <option value="">{placeholder}</option>
                  {availableForThisDropdown.map((number) => {
                    const numberStr = String(number.number).trim();
                    const selectedStr = String(dropdown.selectedNumber).trim();
                    const isSelected = numberStr === selectedStr;
                    
                    console.log(`Option "${numberStr}" - dropdown value: "${selectedStr}" - match: ${isSelected}`);
                    
                    return (
                      <option 
                        key={`${dropdown.id}-${number.id}`} 
                        value={numberStr}
                      >
                        {number.label}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              {/* Button container with fixed width to prevent layout shifts */}
              <div className="flex items-center gap-1 min-w-[72px]">
                {/* Add button - only show on the last dropdown if we can add more */}
                {index === dropdowns.length - 1 && canAddMore() && (
                  <button
                    type="button"
                    onClick={addDropdown}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors flex-shrink-0"
                    title="Add another number"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
                
                {/* Remove button - only show if more than one dropdown */}
                {dropdowns.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDropdown(dropdown.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors flex-shrink-0"
                    title="Remove this number"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Show selected numbers count */}
      {dropdowns.filter(d => d.selectedNumber !== '').length > 0 && (
        <div className="mt-2 text-xs text-gray-600">
          {dropdowns.filter(d => d.selectedNumber !== '').length} number(s) selected
        </div>
      )}
    </div>
  );
};

export default MobileNumberDropdown;