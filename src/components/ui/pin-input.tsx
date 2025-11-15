import { useRef, useEffect } from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  onComplete?: (value: string) => void;
}

export function PinInput({
  value,
  onChange,
  length = 4,
  className,
  autoFocus = false,
  disabled = false,
  onComplete,
}: PinInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (value.length === length && onComplete) {
      onComplete(value);
    }
  }, [value, length, onComplete]);

  const handleChange = (index: number, newValue: string) => {
    // Only allow digits
    const digit = newValue.replace(/\D/g, "");
    if (digit.length > 1) {
      // Handle paste
      const pastedDigits = digit.slice(0, length);
      let newPin = value.split("");
      for (let i = 0; i < pastedDigits.length && index + i < length; i++) {
        newPin[index + i] = pastedDigits[i];
      }
      onChange(newPin.join(""));
      // Focus the next empty input or the last one
      const nextIndex = Math.min(index + pastedDigits.length, length - 1);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
      return;
    }

    if (digit.length === 0) {
      // Backspace - clear current and move to previous
      const newPin = value.split("");
      newPin[index] = "";
      onChange(newPin.join(""));
      if (index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
      return;
    }

    // Set the digit
    const newPin = value.split("");
    newPin[index] = digit;
    onChange(newPin.join(""));

    // Move to next input
    if (index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      // If current is empty and backspace, go to previous
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    inputRefs.current[index]?.select();
  };

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className="w-12 h-12 text-center text-lg font-semibold"
        />
      ))}
    </div>
  );
}

