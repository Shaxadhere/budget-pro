import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Select = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  disabled = false,
  className = "",
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
                    w-full flex items-center justify-between px-3 py-2 bg-white border rounded-lg text-sm transition-all duration-200
                    ${error ? "border-red-300 focus:ring-red-200" : "border-slate-300 focus:ring-indigo-200"}
                    ${disabled ? "bg-slate-100 cursor-not-allowed text-slate-400" : "hover:border-indigo-400 focus:border-indigo-500 focus:ring-4"}
                    ${isOpen ? "border-indigo-500 ring-4 ring-indigo-200" : ""}
                `}
        disabled={disabled}
      >
        <span className={!selectedOption ? "text-slate-400" : "text-slate-900"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-auto"
          >
            {options.length > 0 ? (
              <div className="p-1">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`
                                            w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors
                                            ${
                                              value === option.value
                                                ? "bg-indigo-50 text-indigo-700 font-medium"
                                                : "text-slate-700 hover:bg-slate-50"
                                            }
                                        `}
                  >
                    <span>{option.label}</span>
                    {value === option.value && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3 text-center text-sm text-slate-500">
                No options available
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Select;
