"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/clerk-react";

export function NavUser() {
  const { open } = useSidebar();

  return (
    <div>
      <UserButton showName={open} />
    </div>
  );

  // return (
  //   <SidebarMenu>
  //     <SidebarMenuItem>
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <SidebarMenuButton
  //             size="lg"
  //             className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
  //           >
  //             <Avatar className="w-8 h-8 rounded-lg">
  //               <AvatarImage src={user.avatar} alt={user.name} />
  //               <AvatarFallback className="rounded-lg">CN</AvatarFallback>
  //             </Avatar>
  //             <div className="grid flex-1 text-sm leading-tight text-left">
  //               <span className="font-semibold truncate">{user.name}</span>
  //               <span className="text-xs truncate">{user.email}</span>
  //             </div>
  //             <CaretSortIcon className="ml-auto size-4" />
  //           </SidebarMenuButton>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent
  //           className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
  //           side={isMobile ? "bottom" : "right"}
  //           align="end"
  //           sideOffset={4}
  //         >
  //           <DropdownMenuLabel className="p-0 font-normal">
  //             <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
  //               <Avatar className="w-8 h-8 rounded-lg">
  //                 <AvatarImage src={user.avatar} alt={user.name} />
  //                 <AvatarFallback className="rounded-lg">CN</AvatarFallback>
  //               </Avatar>
  //               <div className="grid flex-1 text-sm leading-tight text-left">
  //                 <span className="font-semibold truncate">{user.name}</span>
  //                 <span className="text-xs truncate">{user.email}</span>
  //               </div>
  //             </div>
  //           </DropdownMenuLabel>
  //           <DropdownMenuSeparator />
  //           <DropdownMenuGroup>
  //             <DropdownMenuItem>
  //               <Sparkles />
  //               Upgrade to Pro
  //             </DropdownMenuItem>
  //           </DropdownMenuGroup>
  //           <DropdownMenuSeparator />
  //           <DropdownMenuGroup>
  //             <DropdownMenuItem>
  //               <BadgeCheck />
  //               Account
  //             </DropdownMenuItem>
  //             <DropdownMenuItem>
  //               <ComponentPlaceholderIcon />
  //               Billing
  //             </DropdownMenuItem>
  //             <DropdownMenuItem>
  //               <Bell />
  //               Notifications
  //             </DropdownMenuItem>
  //           </DropdownMenuGroup>
  //           <DropdownMenuSeparator />
  //           <SignOutButton>
  //             <span>
  //               <LogOut />
  //               Log out
  //             </span>
  //           </SignOutButton>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     </SidebarMenuItem>
  //   </SidebarMenu>
  // );
}
