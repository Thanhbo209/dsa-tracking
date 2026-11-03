import Image from "next/image";

export interface DsaLogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  priority?: boolean;
  alt?: string;
}

const SIZE_DIMENSIONS: Record<
  "xs" | "sm" | "md" | "lg" | "xl",
  { width: number; height: number; defaultClass: string }
> = {
  xs: { width: 32, height: 16, defaultClass: "h-3.5 w-auto" },
  sm: { width: 48, height: 24, defaultClass: "h-5 w-auto" },
  md: { width: 72, height: 36, defaultClass: "h-7 w-auto" },
  lg: { width: 120, height: 60, defaultClass: "h-10 w-auto" },
  xl: { width: 180, height: 90, defaultClass: "h-14 w-auto" },
};

export function DsaLogo({
  className,
  size = "md",
  priority = false,
  alt = "DSA Logo",
}: DsaLogoProps) {
  const config = SIZE_DIMENSIONS[size];

  return (
    <Image
      src="/logo.png"
      alt={alt}
      width={config.width}
      height={config.height}
      priority={priority}
      className={`inline-block object-contain select-none ${className || config.defaultClass}`}
    />
  );
}
