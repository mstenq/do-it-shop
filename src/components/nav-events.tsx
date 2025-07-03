import { ArmchairIcon } from "lucide-react";
import { GlobalSearch } from "./global-search";

export const NavEvents = () => {
  return (
    <div className="flex flex-col gap-3 px-2 pt-2">
      <div className="flex items-center gap-2">
        <div className="p-1 bg-black rounded-lg">
          <ArmchairIcon className="text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-black">Do It Shop</div>
          <div className="text-xs">v2.0.0</div>
        </div>
      </div>
      <GlobalSearch />
    </div>
  );
};
