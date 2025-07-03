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
import { ConvexType } from "@/utils/convexType";
import { api } from "@convex/api";
import {
  Calendar,
  FileIcon,
  MapPin,
  Package,
  SearchIcon,
  Star,
  StoreIcon,
  Truck,
  Users,
} from "lucide-react";
import React, { useDeferredValue, useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  type: "event" | "vendor" | "transport" | "task";
  icon: React.ComponentType<{ className?: string }>;
}

const MOCK_ITEMS: SearchItem[] = [
  {
    id: "1",
    title: "Annual Company Conference 2024",
    subtitle: "Main event",
    type: "event",
    icon: Calendar,
  },
  {
    id: "2",
    title: "Catering Solutions Inc",
    subtitle: "Food & Beverage vendor",
    type: "vendor",
    icon: Package,
  },
  {
    id: "3",
    title: "Hotel shuttle service",
    subtitle: "Transportation",
    type: "transport",
    icon: Truck,
  },
  {
    id: "4",
    title: "Setup venue decorations",
    subtitle: "Task - Due tomorrow",
    type: "task",
    icon: Users,
  },
  {
    id: "5",
    title: "Grand Ballroom",
    subtitle: "Venue vendor",
    type: "vendor",
    icon: MapPin,
  },
  {
    id: "6",
    title: "Flight AA1234",
    subtitle: "New York to Los Angeles",
    type: "transport",
    icon: Truck,
  },
];

const RECENT_ITEMS = MOCK_ITEMS.slice(0, 4);

const ResultIcon = ({
  table,
}: {
  table: ConvexType<"search.all">[number]["table"];
}) => {
  switch (table) {
    case "employees":
      return <StoreIcon className="w-4 h-4" />;
    default:
      return <FileIcon className="w-4 h-4" />;
  }
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const deferredSearchValue = useDeferredValue(searchValue);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["1", "2"]));

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

  const toggleFavorite = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId);
      } else {
        newFavorites.add(itemId);
      }
      return newFavorites;
    });
  };

  const handleItemSelect = (item: SearchItem) => {
    console.log("Selected:", item.title);
    setOpen(false);
  };

  const favoriteItems = MOCK_ITEMS.filter((item) => favorites.has(item.id));

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="default"
            className="flex items-center justify-start w-full gap-2 text-muted-foreground"
            onClick={() => setOpen(true)}
          >
            <SearchIcon className="w-4 h-4" />
            Search...
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-center">
          <div className="">Global Search</div>
          {shortcutText}
        </TooltipContent>
      </Tooltip>

      <CommandDialog shouldFilter={false} open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search events, vendors, tasks..."
          value={searchValue}
          onValueChange={(v) => setSearchValue(v)}
        />
        <CommandList className="max-h-[calc(100vh-200px)]">
          <CommandEmpty>No results found.</CommandEmpty>

          {favoriteItems.length > 0 && !searchValue && (
            <CommandGroup heading="Favorites">
              {favoriteItems.map((item) => (
                <CommandItem
                  key={"fave-" + item.id}
                  value={`favorite-${item.id}-${item.title}`}
                  onSelect={() => handleItemSelect(item)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    <div>
                      <div className="font-medium">{item.title}</div>
                      {item.subtitle && (
                        <div className="text-sm text-muted-foreground">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-6 h-6 p-0"
                    onClick={(e) => toggleFavorite(item.id, e)}
                  >
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  </Button>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!searchValue && (
            <CommandGroup heading="Recent">
              {RECENT_ITEMS.map((item) => (
                <CommandItem
                  key={"recent-" + item.id}
                  value={`recent-${item.id}-${item.title}`}
                  onSelect={() => handleItemSelect(item)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    <div>
                      <div className="font-medium">{item.title}</div>
                      {item.subtitle && (
                        <div className="text-sm text-muted-foreground">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-6 h-6 p-0"
                    onClick={(e) => toggleFavorite(item.id, e)}
                  >
                    <Star
                      className={`h-3 w-3 ${
                        favorites.has(item.id)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </Button>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!!searchValue && searchResults.length > 0 && (
            <CommandGroup heading="Search Results">
              {searchResults.map((item) => (
                <CommandItem
                  key={"all-" + item.id}
                  value={`all-${item.id}-${item.title}`}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    {/* <item.icon className="w-4 h-4" /> */}
                    <ResultIcon table={item.table} />
                    <div>
                      <div className="pb-1 font-medium">{item.title}</div>
                      <div className="flex items-center gap-2">
                        <div className="pt-0.5 font-mono text-sm rounded text-muted-foreground">
                          {item.id}
                        </div>
                        {item.subtitle && (
                          <>
                            <div>•</div>
                            <div className="text-sm text-muted-foreground">
                              {item.subtitle}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-6 h-6 p-0"
                    onClick={(e) => toggleFavorite(item.id, e)}
                  >
                    <Star
                      className={`h-3 w-3 ${
                        favorites.has(item.id)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </Button>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
