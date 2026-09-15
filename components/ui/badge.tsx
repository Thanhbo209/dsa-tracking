import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-[#444444] bg-[#262626] text-zinc-300",
        outline:
          "border-[#383838] text-zinc-300 bg-transparent",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive",
        easy:
          "border-[#46C6C2]/30 bg-[#46C6C2]/10 text-[#46C6C2]",
        medium:
          "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
        hard:
          "border-red-500/30 bg-red-500/10 text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
