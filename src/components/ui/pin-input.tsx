import { useRef, useEffect } from "react";
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
    const digit = newValue.replace(/\D/g, "");
    if (digit.length > 1) {
      const pastedDigits = digit.slice(0, length);
      const newPin = value.split("");
      for (let i = 0; i < pastedDigits.length && index + i < length; i++) {
        newPin[index + i] = pastedDigits[i];
      }
      onChange(newPin.join(""));
      const nextIndex = Math.min(index + pastedDigits.length, length - 1);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
      return;
    }

    if (digit.length === 0) {
      const newPin = value.split("");
      newPin[index] = "";
      onChange(newPin.join(""));
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    const newPin = value.split("");
    newPin[index] = digit;
    onChange(newPin.join(""));

    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    inputRefs.current[index]?.select();
  };

  return (
    <div className={cn("flex gap-3 justify-center", className)}>
      {Array.from({ length }).map((_, index) => {
        const isFilled = !!value[index];

        return (
          <div key={index} className="relative">
            <input
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
              className={cn(
                "relative w-14 h-16 text-center text-2xl font-semibold rounded-lg",
                "bg-card/80 border-2 border-border shadow-sm",
                "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 focus:shadow-lg focus:shadow-primary/10",
                "transition-all duration-200",
                "placeholder:text-muted-foreground/30",
                isFilled && "border-primary/50 shadow-md shadow-primary/5",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              style={
                {
                  WebkitTextSecurity: "disc",
                  textSecurity: "disc",
                } as React.CSSProperties
              }
            />

            {/* Bottom indicator dot */}
            <div
              className={cn(
                "absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full transition-all duration-200",
                isFilled ? "bg-primary scale-100" : "bg-border scale-75"
              )}
            />
          </div>
        );
      })}
    </div>
  );
}
