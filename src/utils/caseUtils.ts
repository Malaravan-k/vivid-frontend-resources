/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    const tenDigits = digits.substring(1);
    return `(${tenDigits.slice(0, 3)}) ${tenDigits.slice(3, 6)}-${tenDigits.slice(6)}`;
  }
  return phone;
};

/**
 * Check if phone numbers match (handles different formats)
 */
export const phoneNumbersMatch = (phone1: string, phone2: string): boolean => {
  if (!phone1 || !phone2) return false;
  
  const clean1 = phone1.replace(/\D/g, '');
  const clean2 = phone2.replace(/\D/g, '');
  
  // Handle different lengths (10 vs 11 digits with country code)
  const normalize = (num: string) => {
    if (num.length === 11 && num.startsWith('1')) {
      return num.substring(1);
    }
    return num;
  };
  
  return normalize(clean1) === normalize(clean2);
};