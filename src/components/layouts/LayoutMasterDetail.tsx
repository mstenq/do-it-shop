"use client";
import { cn } from "@/utils";
import { usePathname } from "next/navigation";

type Props = {
  gridTitle: string;
  gridOnlyPath: string;
  grid: React.ReactNode;
  detail: React.ReactNode;
};

export const MasterDetail = ({
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
          "scroll max-h-[--content-height] min-h-[--content-height] overflow-y-auto",
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
      <div className="scroll max-h-[--content-height] min-h-[--content-height] w-full overflow-y-auto border-l">
        {detail}
      </div>
    </>
  );
};
