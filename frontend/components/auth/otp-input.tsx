"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  length?: number;
}

export function OtpInput({
  value,
  onChange,
  disabled = false,
  length = 4,
}: OtpInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Split value into array of single chars
  const digits = React.useMemo(() => {
    const chars = value.split("");
    const result: string[] = [];
    for (let i = 0; i < length; i++) {
      result.push(chars[i] || "");
    }
    return result;
  }, [value, length]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    const char = e.target.value.slice(-1); // Take latest entered char
    if (char && !/^\d$/.test(char)) return; // Digits only

    const newDigits = [...digits];
    newDigits[index] = char;
    const combined = newDigits.join("");
    onChange(combined);

    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (pasted) {
      onChange(pasted);
      const nextFocus = Math.min(pasted.length, length - 1);
      inputRefs.current[nextFocus]?.focus();
    }
  }

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 my-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className={cn(
            "h-14 w-12 sm:w-14 rounded-2xl border text-center text-2xl font-bold transition-all outline-none",
            "bg-white/90 border-charcoal-200 text-charcoal-900",
            "focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/15",
            digit && "border-brand-400 bg-brand-50/30 text-brand-600",
            disabled && "cursor-not-allowed opacity-50 bg-charcoal-50"
          )}
          autoFocus={index === 0}
        />
      ))}
    </div>
  );
}
