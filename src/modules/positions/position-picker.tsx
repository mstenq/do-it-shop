import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { api } from "@convex/api";
import { Id } from "@convex/dataModel";
import { useQuery } from "convex-helpers/react/cache";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "@tanstack/react-router";

type Props = {
  value?: string;
  onSelect: (_id: Id<"positions">) => void;
  className?: string;
  label?: string;
  placeholder?: string;
};

export function PositionPicker({
  value,
  onSelect,
  className,
  label = "Position",
  placeholder = "Select position",
}: Props) {
  const positions = useQuery(api.positions.all, {
    includeDeleted: false,
  });

  const [open, setOpen] = useState(false);

  const selectedPosition = positions?.find(
    (position) => position._id === value
  );

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          {value && selectedPosition ? selectedPosition.name : placeholder}
          <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <Command>
          <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No {label.toLowerCase()} found</CommandEmpty>
            <CommandGroup>
              {(positions ?? []).map((position) => (
                <CommandItem
                  className="cursor-pointer"
                  value={position._id}
                  key={position._id}
                  keywords={[position.name]}
                  onSelect={() => {
                    onSelect(position._id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      position._id === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: position.schedulerColor }}
                    />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{position.name}</span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function FormPositionPicker({
  value,
  onSelect,
  className,
  label = "Position",
  placeholder = "Select position",
}: Props) {
  return (
    <FormItem className={className}>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <PositionPicker
          value={value}
          onSelect={onSelect}
          className={className}
          label={label}
          placeholder={placeholder}
        />
      </FormControl>
      <FormDescription className="flex items-center col-start-2 sm:!-mt-3">
        Need to create a new {label.toLowerCase()}?
        <Button variant="link" size="sm" asChild>
          <Link to="/positions" search={{ showAdd: true }}>
            Create New
          </Link>
        </Button>
      </FormDescription>
      <FormMessage />
    </FormItem>
  );
}
