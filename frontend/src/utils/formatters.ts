export const formatCurrency = (val: number | string | null | undefined, compact: boolean = false): string => {
  if (val === null || val === undefined || isNaN(Number(val))) return '₹0';
  const num = Number(val);
  
  if (compact) {
    if (Math.abs(num) >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(num) >= 100000) {
      return `₹${(num / 100000).toFixed(2)} L`;
    }
    if (Math.abs(num) >= 1000) {
      return `₹${(num / 1000).toFixed(1)}k`;
    }
    return `₹${num.toFixed(0)}`;
  }
  
  return `₹${num.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
};

export const formatCurrencyInteger = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || isNaN(Number(val))) return '₹0';
  const num = Math.round(Number(val));
  return `₹${num.toLocaleString('en-IN')}`;
};

export const formatIndianNumber = (num: number | string | null | undefined): string => {
  if (num === null || num === undefined || isNaN(Number(num))) return '0';
  return Number(num).toLocaleString('en-IN');
};
