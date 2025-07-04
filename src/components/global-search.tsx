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
  IdCardIcon,
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
import { useNavigate } from "@tanstack/react-router";

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
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["1", "2"]));

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
    console.log("Selected:", item);
    if (item.table === "employees") {
      navigate({ to: "/employees/$id", params: { id: item._id } });
    }
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
        <kbd className="p-1 -mr-2.5 font-sans rounded text-xs border bg-background">
          {shortcutText}
        </kbd>
      </Button>

      <CommandDialog shouldFilter={false} open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search events, vendors, tasks..."
          value={searchValue}
          onValueChange={(v) => setSearchValue(v)}
        />
        <CommandList className="max-h-[calc(100vh-200px)]">
          <CommandEmpty>No results found.</CommandEmpty>

          {/* {favoriteItems.length > 0 && !searchValue && (
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
          )} */}

          {/* {!searchValue && (
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
          )} */}

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
                    onClick={(e) => toggleFavorite(item._id, e)}
                  >
                    <Star
                      className={`h-3 w-3 ${
                        favorites.has(item._id)
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
