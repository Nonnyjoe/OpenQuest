"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrengthIndicator?: boolean;
  value?: string;
}

export function PasswordInput({
  className,
  showStrengthIndicator = false,
  value = "",
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [strength, setStrength] = React.useState(0);

  React.useEffect(() => {
    if (showStrengthIndicator) {
      setStrength(calculateStrength(value));
    }
  }, [value, showStrengthIndicator]);

  const calculateStrength = (value: string) => {
    if (!value) return 0;

    let score = 0;

    // Length checks (max 2 points)
    if (value.length >= 8) score += 1;
    if (value.length >= 12) score += 1;

    // Complexity checks (max 4 points)
    if (/[a-z]/.test(value)) score += 1; // lowercase
    if (/[A-Z]/.test(value)) score += 1; // uppercase
    if (/[0-9]/.test(value)) score += 1; // numbers
    if (/[^a-zA-Z0-9]/.test(value)) score += 1; // special characters

    // Pattern checks (max 2 points)
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(value)) score += 1;
    if (/^(?=.*[!@#$%^&*])/.test(value)) score += 1;

    // Normalize score to 0-5 range
    return Math.min(Math.floor((score / 8) * 5), 5);
  };

  const strengthColors = {
    0: "bg-muted",
    1: "bg-destructive",
    2: "bg-orange-500",
    3: "bg-yellow-500",
    4: "bg-green-500",
    5: "bg-primary",
  } as const;

  const strengthTexts = {
    0: value ? "Very weak" : "Enter password",
    1: "Very weak",
    2: "Weak",
    3: "Fair",
    4: "Strong",
    5: "Very strong",
  } as const;

  const strengthRequirements = [
    { regex: /.{8,}/, text: "At least 8 characters" },
    { regex: /[A-Z]/, text: "Uppercase letter" },
    { regex: /[a-z]/, text: "Lowercase letter" },
    { regex: /[0-9]/, text: "Number" },
    { regex: /[^A-Za-z0-9]/, text: "Special character" },
  ];

  return (
    <div className="relative space-y-2">
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          className={cn("pr-10", className)}
          value={value}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {showStrengthIndicator && (
        <div className="space-y-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className={cn(
                  "h-1 w-full rounded-full transition-all duration-300",
                  strength >= index
                    ? strengthColors[strength as keyof typeof strengthColors]
                    : "bg-muted"
                )}
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-xs">
            <p
              className={cn(
                "transition-colors duration-200",
                !value
                  ? "text-muted-foreground"
                  : strength > 2
                  ? "text-muted-foreground"
                  : "text-destructive"
              )}
            >
              {strengthTexts[strength as keyof typeof strengthTexts]}
            </p>
            {value && strength < 4 && (
              <p className="text-muted-foreground">
                {strengthRequirements.find(({ regex }) => !regex.test(value))
                  ?.text || "Make it stronger"}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
