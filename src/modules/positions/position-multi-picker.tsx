import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { api } from "@convex/api";
import { Id } from "@convex/dataModel";
import { Link } from "@tanstack/react-router";
import { useQuery } from "convex-helpers/react/cache";

type Props = {
  value?: string[];
  onValueChange: (_ids: Id<"positions">[]) => void;
  className?: string;
  placeholder?: string;
};

export function PositionMultiPicker({
  value,
  onValueChange,
  placeholder = "Select positions",
}: Props) {
  const positions = useQuery(api.positions.all, {
    includeDeleted: false,
  });

  const options = (positions ?? [])?.map((position) => ({
    value: position._id,
    label: position.name,
    icon: ({ className }: { className?: string }) => (
      <div
        className={cn(className, "w-2 h-2 rounded-full")}
        style={{ backgroundColor: position.schedulerColor }}
      />
    ),
  }));

  return (
    <MultiSelect
      defaultValue={value}
      placeholder={placeholder}
      onValueChange={(v) => onValueChange(v as Id<"positions">[])}
      options={options}
    />
  );
}

export function FormPositionMultiPicker({
  value,
  onValueChange,
  className,
  label = "Position",
  placeholder = "Select position",
}: Props & { label: string }) {
  return (
    <FormItem className={className}>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <PositionMultiPicker
          value={value}
          onValueChange={onValueChange}
          className={className}
          placeholder={placeholder}
        />
      </FormControl>
      <FormDescription className="flex items-center col-start-2 sm:!-mt-3">
        Need to create a new {label.toLowerCase()}?
        <Button variant="link" size="sm" asChild>
          {/* <Link to="/positions" search={{ showAdd: true }}>
            Create New
          </Link> */}
        </Button>
      </FormDescription>
      <FormMessage />
    </FormItem>
  );
}
