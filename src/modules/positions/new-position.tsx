import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { api } from "@convex/api";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { PositionForm, PositionFormData } from "./position-form";

export function NewPosition() {
  const navigate = useNavigate({ from: "/positions" });
  const search = useSearch({ from: "/positions" });
  const add = useMutation(api.positions.add);

  const handleSubmit = async (data: PositionFormData) => {
    try {
      await add(data);
      toast.success("Position created successfully");
      navigate({
        to: ".",
        search: { showAdd: false, showEdit: "" },
      });
    } catch (error) {
      console.error("Failed to create position:", error);
      toast.error("Failed to create position");
    }
  };

  const isOpen = search.showAdd;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          navigate({ search: { ...search, showAdd: false } });
        }
      }}
    >
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>New Position</SheetTitle>
          <SheetDescription>
            Create a new position for employee assignments and scheduling.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <PositionForm onSubmit={handleSubmit} submitText="Create Position" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
