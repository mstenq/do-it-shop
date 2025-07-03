import { camelToProperCase } from "@/utils/textCaseConvert";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { XIcon } from "lucide-react";

type Props = {
  filters: Record<string, string | boolean>;
};

export const CurrentFilters = ({ filters }: Props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const filteredSearch = Object.entries(filters).filter(([key, value]) =>
    Boolean(value)
  );

  const clearFilters = () => {
    navigate({
      to: ".",
      search: {
        filters: undefined,
      },
    });
  };

  const clearOneFilter = (key: string) => {
    navigate({
      to: location.pathname,
      search: {
        filters: {
          ...filters,
          [key]: undefined,
        },
      },
    });
  };

  return (
    <div className="flex items-center gap-2">
      {filteredSearch.map(([key, value]) => (
        <Badge
          onClick={() => clearOneFilter(key)}
          key={key}
          variant="outline"
          className="gap-2 pl-1.5 pr-2 cursor-pointer group h-9"
        >
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-600 whitespace-nowrap">
              {camelToProperCase(key)}
            </span>
            <span className="whitespace-nowrap">{String(value)}</span>
          </div>
          <span className="text-gray-300 group-hover:text-gray-900">
            <XIcon className="w-4 h-4" />
          </span>
        </Badge>
      ))}
      {filteredSearch.length > 0 && (
        <Button onClick={clearFilters} variant="ghost" className="px-2">
          Clear
        </Button>
      )}
    </div>
  );
};
