"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const ToggleGroupContext = React.createContext<{
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline";
  value?: string | string[];
  onItemClick?: (itemValue: string) => void;
}>({});

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors outline-none cursor-pointer select-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-transparent text-zinc-400 hover:text-white hover:bg-[#2a2a2a] data-[state=on]:bg-[#333333] data-[state=on]:text-white",
        outline:
          "border border-[#383838] bg-[#1e1e1e] text-zinc-400 hover:bg-[#2a2a2a] hover:text-white data-[state=on]:border-primary data-[state=on]:bg-primary/15 data-[state=on]:text-white",
      },
      size: {
        default: "h-8 px-2.5 min-w-8",
        sm: "h-7 px-2 text-[11px] min-w-7",
        lg: "h-9 px-3 min-w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ToggleGroupProps extends React.ComponentProps<"div"> {
  type?: "single" | "multiple";
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
}

function ToggleGroup({
  className,
  variant = "default",
  size = "default",
  type = "single",
  value,
  onValueChange,
  children,
  ...props
}: ToggleGroupProps) {
  const onItemClick = React.useCallback(
    (itemValue: string) => {
      if (!onValueChange) return;
      if (type === "single") {
        onValueChange(value === itemValue ? "" : itemValue);
      } else {
        const arr = Array.isArray(value) ? value : [];
        const next = arr.includes(itemValue)
          ? arr.filter((v) => v !== itemValue)
          : [...arr, itemValue];
        onValueChange(next);
      }
    },
    [onValueChange, type, value],
  );

  return (
    <ToggleGroupContext.Provider
      value={{ size, variant, value, onItemClick }}
    >
      <div
        data-slot="toggle-group"
        role="group"
        className={cn(
          "inline-flex items-center gap-1 rounded-lg border border-[#383838] bg-[#1e1e1e] p-0.5",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

interface ToggleGroupItemProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof toggleVariants> {
  value: string;
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  value: itemValue,
  onClick,
  ...props
}: ToggleGroupItemProps) {
  const context = React.useContext(ToggleGroupContext);
  const isSelected = Array.isArray(context.value)
    ? context.value.includes(itemValue)
    : context.value === itemValue;

  return (
    <button
      type="button"
      data-slot="toggle-group-item"
      data-state={isSelected ? "on" : "off"}
      aria-pressed={isSelected}
      className={cn(
        toggleVariants({
          variant: variant ?? context.variant,
          size: size ?? context.size,
        }),
        className,
      )}
      onClick={(e) => {
        onClick?.(e);
        context.onItemClick?.(itemValue);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export { ToggleGroup, ToggleGroupItem };
