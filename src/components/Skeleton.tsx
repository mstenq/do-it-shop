import { type LooseAutocomplete } from "@/types/LooseAutocomplete";
import { cn } from "@/utils";
import { memo } from "react";

type SkeletonTextProps = {
  wordCount?: number;
  className?: string;
  itemClassName?: string;
  right?: boolean;
  gap?: LooseAutocomplete<"gap-1" | "gap-2" | "gap-3" | "gap-4">;
  size?: LooseAutocomplete<
    | "text-xs"
    | "text-sm"
    | "text-base"
    | "text-lg"
    | "text-xl"
    | "text-2xl"
    | "text-3xl"
    | "text-4xl"
    | "text-5xl"
    | "text-6xl"
    | "text-7xl"
    | "text-8xl"
    | "text-9xl"
  >;
};

const widths = [
  "w-4",
  "w-6",
  "w-8",
  "w-8",
  "w-10",
  "w-12",
  "w-12",
  "w-12",
  "w-16",
];
const getRandomWidth = () => {
  return widths[Math.floor(Math.random() * widths.length)];
};

const Text = memo(function _Text({
  size = "text-sm",
  gap = "gap-1",
  wordCount = 1,
  right = false,
  className,
  itemClassName,
}: SkeletonTextProps) {
  const array = Array.from(Array(wordCount).keys());
  return (
    <span className={cn("space-x-1", gap, right && "text-right", className)}>
      {array.map((_, i) => (
        <span
          key={i}
          className={cn(
            "inline-block animate-pulse select-none rounded bg-muted",
            size,
            getRandomWidth(),
            itemClassName,
          )}
        >
          &nbsp;
        </span>
      ))}
    </span>
  );
});

const sizeOptions = {
  "4": "w-4 h-4",
  "6": "w-6 h-6",
  "8": "w-8 h-8",
  "10": "w-10 h-10",
  "12": "w-12 h-12",
  "16": "w-16 h-16",
  "20": "w-20 h-20",
};

type SkeletonCircleProps = {
  size?: LooseAutocomplete<keyof typeof sizeOptions>;
  className?: string;
};

const Circle = memo(function _Circle({
  size = "10",
  className,
}: SkeletonCircleProps) {
  return (
    <span
      className={cn(
        "flex aspect-square animate-pulse select-none rounded-full bg-muted",
        sizeOptions[size as keyof typeof sizeOptions] ?? size,
        className,
      )}
    ></span>
  );
});

export const Skeleton = Object.assign(Text, {
  Text: Text,
  Circle: Circle,
});
