import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useRef } from "react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export type PaginationProps = {
  skip: number;
  total: number | undefined;
  limit: number | undefined;
  setSkip: (skip: number) => void;
  setLimit: (limit: number) => void;
};

export function Pagination({
  skip,
  total,
  limit,
  setSkip,
  setLimit,
}: PaginationProps) {
  const totalRef = useRef(0);

  const limitValue = limit ?? 0;

  const page = Math.ceil(skip / limitValue) + 1;
  const pageCount = Math.ceil(totalRef.current / limitValue);

  const noTotal = total === undefined;
  if (!noTotal) {
    totalRef.current = total;
  }

  if (!limit) return null;
  if (totalRef.current === 0) return null;
  return (
    <div className="flex w-full items-center justify-center px-2 @lg:justify-end">
      <div className="flex items-center @sm:space-x-4 @xl:space-x-8">
        <div className="flex items-center @sm:space-x-4 @xl:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="hidden text-sm font-medium @xl:block">
              Rows&nbsp;per&nbsp;page
            </p>
            <Select
              value={`${limit}`}
              onValueChange={(value) => {
                setLimit(Number(value));
                setSkip(0);
              }}
            >
              <SelectTrigger className="hidden h-8 w-[70px] @[270px]:flex">
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
            className="hidden h-8 w-8 p-0 @xl:flex"
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
            className="hidden h-8 w-8 p-0 @xl:flex"
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
