import { PropsWithChildren } from "react";

export const ReportHeader = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex items-end justify-between mb-6">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-12 h-12 bg-red-600 rounded-full">
          <span className="text-lg font-bold text-white">J</span>
        </div>
        <div>
          <div className="text-lg font-bold">JACK'S</div>
          <div className="text-sm">DO IT SHOP</div>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
};
