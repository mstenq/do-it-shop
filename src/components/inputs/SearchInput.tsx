import { Input, type InputProps } from "@/components/ui/input";
import { Button } from "../ui/button";
import { SearchIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useState } from "react";
import { cn } from "@/utils";

type Props = Omit<InputProps, "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const SearchInputField = ({ onChange, className, ...props }: Props) => (
  <Input
    type="search"
    placeholder="Search..."
    {...props}
    className={cn("h-8", className)}
    onChange={(e) => onChange(e.target.value)}
  />
);

export const SearchInput = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Enter") setIsOpen(false);
    if (e.code === "Tab") setIsOpen(false);
  };
  return (
    <div className="w-full @container sm:max-w-[250px]">
      <div className="hidden w-full @[100px]:block">
        <SearchInputField {...props} className="max-w-80" />
      </div>
      <div className="block w-full @[100px]:hidden">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button onClick={() => setIsOpen(true)} variant="outline" size="xs">
              <SearchIcon className="w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="left"
            align="center"
            className="flex w-full max-w-[250px] gap-2 rounded-xl"
          >
            <SearchInputField
              {...props}
              onKeyDown={handleKeyDown}
              className="h-10"
            />
            <Button onClick={() => setIsOpen(false)} className="">
              <SearchIcon className="w-4" />
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
