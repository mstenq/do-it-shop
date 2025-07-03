import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { api } from "@convex/api";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { PositionForm, PositionFormData } from "./position-form";

export function EditPosition() {
  const navigate = createFileRoute("/positions")().useNavigate();
  const search = createFileRoute("/positions")().useSearch();
  const update = useMutation(api.positions.update);

  const positionId = search.showEdit;
  const position = useQuery(api.positions.get, { _id: positionId });

  const handleSubmit = async (data: PositionFormData) => {
    if (!positionId || !position) return;

    try {
      await update({
        _id: position._id,
        ...data,
      });
      toast.success("Position updated successfully");
      navigate({ search: { ...search, showEdit: "" } });
    } catch (error) {
      console.error("Failed to update position:", error);
      toast.error("Failed to update position");
    }
  };

  const isOpen = Boolean(positionId);

  if (isOpen && !position) {
    return (
      <Sheet open={isOpen}>
        <SheetContent className="sm:max-w-md">
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          navigate({ search: { ...search, showEdit: "" } });
        }
      }}
    >
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit Position</SheetTitle>
          <SheetDescription>
            Update position details and requirements.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <PositionForm
            onSubmit={handleSubmit}
            defaultValues={
              position
                ? {
                    name: position.name,
                    schedulerColor: position.schedulerColor,
                    requiredDriversLicense: position.requiredDriversLicense,
                  }
                : undefined
            }
            submitText="Update Position"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
