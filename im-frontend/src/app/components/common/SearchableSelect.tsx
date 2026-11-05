import { useState, useEffect } from "react";
import { useController, useFormContext } from "react-hook-form";

interface SearchableSelectProps {
  name: string;
  label: string;
  placeholder?: string;
  options: string[];
  showOther?: boolean;
  required?: boolean;
  onSelectCallback?: (selectedValue: string) => void;
}

export function SearchableSelect({
  name,
  label,
  placeholder = "Search...",
  options = [],
  showOther = false,
  required = true,
  onSelectCallback,
}: SearchableSelectProps) {
  const { control } = useFormContext();

  // 🎯 Official React Hook Form hook for custom components
  const {
    field: {
      value: formValue,
      onChange: setFormFieldValue,
      onBlur: setFormBlur,
    },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: "",
  });

  const currentValue = formValue || "";
  const [searchText, setSearchText] = useState(currentValue);
  const [showDropdown, setShowDropdown] = useState(false);

  // Combine parent options with 'Other'
  const fullOptions = showOther ? [...options, "Other"] : options;

  // Always keep input text in sync if form value updates externally or resets
  useEffect(() => {
    setSearchText(currentValue);
  }, [currentValue]);

  // Filter dropdown options
  const filteredOptions = fullOptions.filter((item) =>
    item.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleSelect = (item: string) => {
    setSearchText(item);
    setFormFieldValue(item); // Updates React Hook Form state
    setShowDropdown(false);

    if (onSelectCallback) {
      onSelectCallback(item);
    }
  };

  // const handleBlur = () => {
  //   setFormBlur(); // Signals to RHF that field was touched
  //   setShowDropdown(false);

  //   const typedText = searchText.trim();

  //   // Check if typed text matches an option (case-insensitive)
  //   const exactMatch = fullOptions.find(
  //     (opt) => opt.toLowerCase() === typedText.toLowerCase(),
  //   );

  //   if (exactMatch) {
  //     // Valid option typed out manually (e.g. "India")
  //     handleSelect(exactMatch);
  //   } else {
  //     // ❌ Invalid typing (e.g. "wew") -> Immediately reverts back to last selected valid value
  //     setSearchText("");
  //     setFormFieldValue("");

  //     if (onSelectCallback) {
  //       onSelectCallback("");
  //     }
  //   }
  // };

  const handleBlur = () => {
    setFormBlur(); // Signals to RHF that field was touched
    setShowDropdown(false);

    const typedText = searchText.trim();

    // Check if typed text matches an option (case-insensitive)
    const exactMatch = fullOptions.find(
      (opt) => opt.toLowerCase() === typedText.toLowerCase(),
    );

    if (exactMatch) {
      // Valid option typed out manually (e.g. "India")
      handleSelect(exactMatch);
    } else {
      // ❌ Invalid typing (e.g. "wew") -> Immediately reverts back to last selected valid value
      setSearchText("");
      setFormFieldValue("");

      if (onSelectCallback) {
        onSelectCallback("");
      }
    }
  };

  return (
    <div className="flex flex-col gap-1.5 relative">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-[#ee613e]">*</span>}
      </label>

      <input
        type="text"
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`w-full h-[40px] px-4 py-3 rounded-[10px] border text-sm text-gray-800 placeholder:text-gray-400 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
          error
            ? "border-red-500 focus:ring-red-300 focus:border-red-500"
            : "border-gray-200 focus:ring-[#0f4c81]/30 focus:border-[#0f4c81]"
        }`}
      />

      {/* Floating Dropdown */}
      {showDropdown && (
        <div className="absolute top-[100%] left-0 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto z-50 divide-y divide-gray-100">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((item, index) => (
              <div
                key={index}
                // e.preventDefault() prevents blur from firing before selection finishes
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(item);
                }}
                className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${
                  item === "Other"
                    ? "font-medium text-[#0f4c81]"
                    : "text-gray-700"
                }`}
              >
                {item}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              No results found
            </div>
          )}
        </div>
      )}

      {error?.message && (
        <p className="text-xs text-red-500 mt-0.5">{error.message}</p>
      )}
    </div>
  );
}
