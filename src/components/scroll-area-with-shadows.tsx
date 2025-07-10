import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useScrollShadows } from "@/hooks/use-scroll-shadows";
import * as React from "react";

interface ScrollAreaWithShadowsProps {
  children: React.ReactNode;
  className?: string;
  orientation?: "vertical" | "horizontal" | "both";
  shadowSize?: "sm" | "md" | "lg";
  shadowColor?: string;
  shadowOpacity?: number;
  animationDuration?: string;
}

export function ScrollAreaWithShadows({
  children,
  className,
  orientation = "both",
  shadowSize = "sm",
  shadowColor = "hsl(var(--background))",
  shadowOpacity = 0.3,
  animationDuration = "200ms",
}: ScrollAreaWithShadowsProps) {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const { showLeftShadow, showRightShadow, showTopShadow, showBottomShadow } =
    useScrollShadows(scrollAreaRef);

  const shadowSizes = {
    sm: { width: 16, height: 16 }, // 4 * 4px
    md: { width: 24, height: 24 }, // 6 * 4px
    lg: { width: 32, height: 32 }, // 8 * 4px
  };

  const { width: shadowWidth, height: shadowHeight } = shadowSizes[shadowSize];

  // Create rgba color from shadowColor and shadowOpacity
  const shadowColorWithOpacity = shadowColor.startsWith("hsl")
    ? shadowColor.replace("hsl(", "hsla(").replace(")", `, ${shadowOpacity})`)
    : shadowColor.startsWith("rgb")
      ? shadowColor.replace("rgb(", "rgba(").replace(")", `, ${shadowOpacity})`)
      : `rgba(${shadowColor}, ${shadowOpacity})`;

  return (
    <div ref={scrollAreaRef} className="relative">
      <ScrollArea className={className}>
        {children}
        {(orientation === "horizontal" || orientation === "both") && (
          <ScrollBar orientation="horizontal" />
        )}
        {(orientation === "vertical" || orientation === "both") && (
          <ScrollBar orientation="vertical" />
        )}
      </ScrollArea>

      {/* Left shadow */}
      {(orientation === "horizontal" || orientation === "both") && (
        <div
          className="absolute top-0 bottom-0 left-0 z-10 pointer-events-none"
          style={{
            width: `${shadowWidth}px`,
            background: `linear-gradient(to right, ${shadowColorWithOpacity}, transparent)`,
            opacity: showLeftShadow ? 1 : 0,
            transition: `opacity ${animationDuration} ease-in-out`,
          }}
        />
      )}

      {/* Right shadow */}
      {(orientation === "horizontal" || orientation === "both") && (
        <div
          className="absolute top-0 bottom-0 right-0 z-10 pointer-events-none"
          style={{
            width: `${shadowWidth}px`,
            background: `linear-gradient(to left, ${shadowColorWithOpacity}, transparent)`,
            opacity: showRightShadow ? 1 : 0,
            transition: `opacity ${animationDuration} ease-in-out`,
          }}
        />
      )}
    </div>
  );
}
