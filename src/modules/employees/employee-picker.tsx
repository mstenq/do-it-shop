import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { useState } from "react";

type Props = {
  value?: string;
  onSelect: (_id: Id<"employees">) => void;
  className?: string;
  label?: string;
  placeholder?: string;
  queryArgs?: (typeof api.employees.all)["_args"];
};

export function EmployeePicker({
  value,
  onSelect,
  className,
  label = "Employee",
  placeholder = "Select employee",
  queryArgs,
}: Props) {
  const employees = useQuery(
    api.employees.all,
    queryArgs ?? {
      includeDeleted: false,
      isActive: true,
    }
  );

  const [open, setOpen] = useState(false);

  const selectedEmployee = employees?.find(
    (employee) => employee._id === value
  );

  return (
    <FormItem className={className}>
      <FormLabel>{label}</FormLabel>
      <Popover modal open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-full justify-between font-normal",
                !value && "text-muted-foreground"
              )}
            >
              {value && selectedEmployee
                ? `${selectedEmployee.nameFirst} ${selectedEmployee.nameLast}`
                : placeholder}
              <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
            </Button>
          </FormControl>
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
                {(employees ?? []).map((employee) => (
                  <CommandItem
                    className="cursor-pointer"
                    value={employee._id}
                    key={employee._id}
                    keywords={[employee.nameFirst, employee.nameLast]}
                    onSelect={() => {
                      onSelect(employee._id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        employee._id === value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">
                        {employee.nameFirst} {employee.nameLast}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
}
