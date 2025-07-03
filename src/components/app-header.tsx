import { GlobalSearch } from "./global-search";
import { NavBreadcrumbs } from "./nav-breadcrumbs";
import { Spacer } from "./spacer";
import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";

export function AppHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="print:hidden z-20 bg-background sticky top-0 border-b flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center w-full gap-2 px-2">
        <SidebarTrigger className="" />

        <Separator orientation="vertical" className="h-4 mr-2" />
        <NavBreadcrumbs />
        <Spacer />
        {children}
      </div>
    </header>
  );
}
