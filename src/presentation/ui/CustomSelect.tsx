// src/presentation/ui/CustomSelect.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
  dotColor?: string;
  badge?: string;
}

export interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: DropdownOption[];
  placeholder: string;
  title: string;
  minWidth?: string;
  /** Direction the dropdown opens. Default: "down-left" */
  openDirection?: "down-left" | "down-right";
}

/**
 * CustomSelect — reusable dropdown matching the Header stream selector design.
 * Dark popover with dot indicators, badge pills, and chevron rotation animation.
 */
export function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  title,
  minWidth = "w-52",
  openDirection = "down-left",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-card hover:bg-card/80 border border-white/[0.08] transition-all duration-200 text-xs shadow-sm"
      >
        <div
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            selectedOption?.dotColor ?? (value ? "bg-accent" : "bg-white/40")
          }`}
        />
        <span className="text-white font-medium max-w-[130px] sm:max-w-[160px] truncate">
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          size={13}
          className={`text-secondary transition-transform duration-200 ml-auto ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2 ${minWidth} max-h-72 overflow-y-auto bg-card border border-white/[0.08] rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.6)] z-50 animate-scale-in ${
            openDirection === "down-right" ? "left-0" : "right-0 left-0"
          }`}
        >
          {/* Header */}
          <div className="p-2 border-b border-white/[0.06]">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-secondary px-2 py-1">
              {title}
            </p>
          </div>

          {/* Options */}
          <div className="p-1 space-y-0.5">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value || "__all__"}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                    isSelected
                      ? "bg-accent/15 text-accent font-semibold"
                      : "text-secondary hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      opt.dotColor
                        ? opt.dotColor
                        : isSelected
                        ? "bg-accent"
                        : "bg-white/20"
                    }`}
                  />
                  <span className="truncate text-left font-medium">
                    {opt.label}
                  </span>
                  {opt.badge && (
                    <span className="ml-auto text-secondary capitalize text-[10px] pl-1 font-mono">
                      {opt.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
