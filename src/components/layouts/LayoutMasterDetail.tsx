"use client";
import { cn } from "@/utils";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

type Props = {
  gridTitle: string;
  gridOnlyPath: string;
  grid: React.ReactNode;
  detail: React.ReactNode;
};

export const LayoutMasterDetail = ({
  grid,
  detail,
  gridOnlyPath,
  gridTitle,
}: Props) => {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "scroll relative max-h-[--content-height] min-h-[--content-height] overflow-y-auto",
          pathname === gridOnlyPath && "col-span-2",
          pathname !== gridOnlyPath && "hidden lg:block",
        )}
      >
        {pathname === gridOnlyPath && (
          <div className="p-4 ">
            <h1 className="text-xl">{gridTitle}</h1>
          </div>
        )}
        {grid}
      </div>
      <div className="scroll col-span-2 max-h-[--content-height] min-h-[--content-height] w-full overflow-y-auto border-l lg:col-span-1">
        {detail}
      </div>
    </>
  );
};
