import * as React from "react";
import { AVAILABLE_ANALYSIS_MODELS } from "@/lib/analysis/models";
import { Cpu } from "lucide-react";

export interface ModelSelectorProps {
  value: string;
  onChange: (model: string) => void;
  disabled?: boolean;
  size?: "sm" | "xs";
  className?: string;
  showIcon?: boolean;
  label?: string;
  id?: string;
}

export function ModelSelector({
  value,
  onChange,
  disabled = false,
  size = "sm",
  className = "",
  showIcon = true,
  label = "Model:",
  id = "analysis-model-select",
}: ModelSelectorProps) {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {showIcon && <Cpu className="size-3.5 text-zinc-400 shrink-0" />}
      {label && (
        <label htmlFor={id} className="text-xs text-zinc-300 font-medium whitespace-nowrap cursor-pointer">
          {label}
        </label>
      )}
      <select
        id={id}
        aria-label="Select AI model"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`rounded border border-[#555555] bg-[#222222] text-white outline-none cursor-pointer hover:border-zinc-400 focus:border-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          size === "xs"
            ? "px-2 py-0.5 text-xs h-7"
            : "px-2.5 py-1 text-xs sm:text-sm h-8"
        }`}
      >
        {AVAILABLE_ANALYSIS_MODELS.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name} — {model.description}
          </option>
        ))}
      </select>
    </div>
  );
}
