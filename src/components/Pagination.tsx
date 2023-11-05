import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useQueryState } from "@/hooks";

interface PaginationProps {
  skip: number;
  total: number | undefined;
  limit: number | undefined;
  setSkip: (skip: number) => void;
  setLimit: (limit: number) => void;
}

export function Pagination({
  skip,
  total,
  limit,
  setSkip,
  setLimit,
}: PaginationProps) {
  const totalRef = useRef(0);

  if (!limit) return null;

  const noTotal = total === undefined;
  if (!noTotal) {
    totalRef.current = total;
  }
  const page = Math.ceil(skip / limit) + 1;
  const pageCount = Math.ceil(totalRef.current / limit);

  if (page > pageCount) setSkip(0);

  if (totalRef.current === 0) return null;
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${limit}`}
              onValueChange={(value) => setLimit(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={limit} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {page} of {pageCount}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            disabled={page === 1}
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => setSkip(0)}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            disabled={page === 1}
            onClick={() => setSkip(skip - limit)}
            variant="outline"
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            disabled={page === pageCount}
            onClick={() => {
              setSkip(skip + limit);
            }}
            variant="outline"
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            disabled={page === pageCount}
            onClick={() => {
              setSkip((pageCount - 1) * limit);
            }}
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
