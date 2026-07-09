/**
 * Shared currency list used across the app (invoices, incomes, etc.)
 * Format: { label, value, symbol }
 */
export const CURRENCIES = [
  { label: "PKR — Pakistani Rupee",   value: "PKR", symbol: "₨"  },
  { label: "USD — US Dollar",         value: "USD", symbol: "$"   },
  { label: "EUR — Euro",              value: "EUR", symbol: "€"   },
  { label: "GBP — British Pound",     value: "GBP", symbol: "£"   },
  { label: "AED — UAE Dirham",        value: "AED", symbol: "د.إ" },
  { label: "AUD — Australian Dollar", value: "AUD", symbol: "A$"  },
  { label: "CAD — Canadian Dollar",   value: "CAD", symbol: "C$"  },
  { label: "SAR — Saudi Riyal",       value: "SAR", symbol: "﷼"   },
  { label: "INR — Indian Rupee",      value: "INR", symbol: "₹"   },
  { label: "CNY — Chinese Yuan",      value: "CNY", symbol: "¥"   },
  { label: "JPY — Japanese Yen",      value: "JPY", symbol: "¥"   },
  { label: "CHF — Swiss Franc",       value: "CHF", symbol: "Fr"  },
  { label: "SGD — Singapore Dollar",  value: "SGD", symbol: "S$"  },
  { label: "MYR — Malaysian Ringgit", value: "MYR", symbol: "RM"  },
  { label: "TRY — Turkish Lira",      value: "TRY", symbol: "₺"   },
];

/** Quick symbol lookup: getCurrencySymbol("USD") → "$" */
export const getCurrencySymbol = (code) =>
  CURRENCIES.find((c) => c.value === code)?.symbol ?? code;

/** Select-compatible option list */
export const CURRENCY_OPTIONS = CURRENCIES.map(({ label, value }) => ({ label, value }));
