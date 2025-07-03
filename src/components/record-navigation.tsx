import { FileRouteTypes } from "@/routeTree.gen";
import {
  Link,
  useChildMatches,
  useParams,
  useRouter,
} from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type Props = {
  storageKey: FileRouteTypes["to"];
};

export const RecordNavigation = ({ storageKey }: Props) => {
  const router = useRouter();
  const matches = useChildMatches();
  const lastMatchId = useMemo<string>(
    () => matches[matches.length - 1].routeId,
    [matches]
  );

  const currentId = useParams({ strict: false })?.id;
  const [ids, setIds] = useState<string[]>([]);

  const loadIds = useCallback(() => {
    const ids = JSON.parse(sessionStorage.getItem(storageKey) ?? "[]");
    setIds(ids);
  }, [storageKey]);

  //subscribe to changes in the storage
  useEffect(() => {
    loadIds();
    const unsub = router.subscribe("onLoad", loadIds);
    return () => unsub();
  }, [storageKey]);

  if (!ids.length || !currentId) return null;

  const total = ids.length;
  const currentIndex = ids.indexOf(currentId);
  const firstId = ids?.[0] ?? null;
  const lastId = ids?.[ids.length - 1] ?? null;
  const previousId = ids?.[currentIndex - 1] ?? null;
  const nextId = ids?.[currentIndex + 1] ?? null;

  return (
    <div className="items-center hidden border rounded-lg shadow-sm sm:flex border-input">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-r-none"
            disabled={currentId === firstId}
            asChild
          >
            <Link to={lastMatchId} params={{ id: firstId }}>
              <ChevronsLeft />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>First</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-none"
            disabled={!previousId}
            asChild
          >
            <Link to={lastMatchId} params={{ id: previousId }}>
              <ChevronLeft />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Previous</TooltipContent>
      </Tooltip>
      <div className="hidden px-2 text-xs sm:block">
        {currentIndex + 1} of {total}
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-none"
            disabled={!nextId}
            asChild
          >
            <Link to={lastMatchId} params={{ id: nextId }}>
              <ChevronRight />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Next</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-l-none"
            disabled={lastId === currentId}
            asChild
          >
            <Link to={lastMatchId} params={{ id: lastId }}>
              <ChevronsRight />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Last</TooltipContent>
      </Tooltip>
    </div>
  );
};
