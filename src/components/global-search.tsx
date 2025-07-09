import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useIsMac } from "@/hooks/use-is-mac";
import { useStableQuery } from "@/hooks/use-stable-query";
import { ConvexType } from "@/utils/convex-type";
import { api } from "@convex/api";
import { useNavigate } from "@tanstack/react-router";
import { FileIcon, IdCardIcon, SearchIcon, Star } from "lucide-react";
import React, { useDeferredValue, useEffect, useState } from "react";

type SearchItem = ConvexType<"search.all">[number];
type Table = SearchItem["table"];

const ResultIcon = ({ table: type }: { table: Table }) => {
  switch (type) {
    case "employees":
      return <IdCardIcon className="w-4 h-4" />;
    default:
      return <FileIcon className="w-4 h-4" />;
  }
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const deferredSearchValue = useDeferredValue(searchValue);

  const navigate = useNavigate();

  const searchResults =
    useStableQuery(
      api.search.all,
      deferredSearchValue
        ? {
            q: deferredSearchValue,
          }
        : "skip"
    ) ?? [];

  const isMac = useIsMac();
  const shortcutText = isMac ? "⌘ + K" : "Ctrl + K";

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  const handleItemSelect = (item: SearchItem) => {
    console.log("Selected:", item);
    if (item.table === "employees") {
      navigate({ to: "/employees/$id", params: { id: item._id } });
    }
    if (item.table === "paySchedule") {
      navigate({ to: "/pay-roll/$id", params: { id: item._id } });
    }
    setSearchValue("");
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="default"
        className="flex items-center justify-between w-full gap-2 text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="w-4 h-4" />
        <kbd className="font-sans text-xs rounded ">{shortcutText}</kbd>
      </Button>

      <CommandDialog shouldFilter={false} open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search employees, projects, pay periods..."
          value={searchValue}
          onValueChange={(v) => setSearchValue(v)}
        />
        <CommandList className="max-h-[calc(100vh-200px)]">
          <CommandEmpty>No results found.</CommandEmpty>
          {!!searchValue && searchResults.length > 0 && (
            <CommandGroup heading="Search Results">
              {searchResults.map((item) => (
                <CommandItem
                  key={"all-" + item._id}
                  value={`all-${item._id}-${item.title}`}
                  className="flex items-center justify-between"
                  onSelect={() => handleItemSelect(item)}
                >
                  <div className="flex items-center gap-4">
                    {/* <item.icon className="w-4 h-4" /> */}
                    <ResultIcon table={item.table} />
                    <div>
                      <div className="pb-1 font-medium">{item.title}</div>
                      <div className="flex items-center gap-2">
                        {item.subtitle && (
                          <div className="text-sm text-muted-foreground">
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
