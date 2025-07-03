import { useOverlay } from "@/components/overlay";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { ConvexType } from "@/utils/convexType";
import { Id } from "@convex/dataModel";
import { ReactMutation } from "convex/react";
import { FunctionReference } from "convex/server";
import { toast } from "sonner";

type BatchMutation = ReactMutation<
  FunctionReference<
    "mutation",
    "public",
    {
      ids: Id<any>[];
    },
    any, // return type i believe
    string | undefined
  >
>;

type Props = {
  destroy: BatchMutation;
  restore: BatchMutation;
  showDeleted: boolean;
};

export const useStandardBatchActions = ({
  destroy,
  restore,
  showDeleted,
}: Props) => {
  const overlay = useOverlay();

  const handleDestroyClick = async (rows: any[], unselectAll: () => void) => {
    const ids = rows.map((row) => row._id);
    const confirm = async () => {
      try {
        await destroy({ ids });
      } catch (e) {
        console.log(e);
      } finally {
        overlay.close();
        unselectAll();
        toast.success(
          `Deleted ${ids.length} records${ids.length > 1 ? "s" : ""}.`
        );
      }
    };
    overlay.show(
      <AlertDialog open={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete records?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you wish to delete these {rows.length} records? This action can
              be undone by restoring the records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={overlay.close}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  const handleRestoreClick = async (rows: any[], unselectAll: () => void) => {
    const ids = rows.map((row) => row._id);
    const confirm = async () => {
      try {
        await restore({ ids });
      } catch (e) {
        console.log(e);
      } finally {
        overlay.close();
        unselectAll();
        toast.success(
          `Restored ${ids.length} records${ids.length > 1 ? "s" : ""}.`
        );
      }
    };
    overlay.show(
      <AlertDialog open={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore records?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you wish to restore these {rows.length} records?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={overlay.close}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirm}>Restore</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  // Create dynamic batch actions based on selection
  const getBatchActions = () => {
    const actions = [];

    // Always show delete action for non-deleted items
    actions.push({
      buttonProps: {
        variant: "destructive" as const,
        children: "Delete",
      },
      onClick: handleDestroyClick,
    });

    // Show restore action when showing deleted items
    if (showDeleted) {
      actions.push({
        buttonProps: {
          variant: "outline" as const,
          children: "Restore",
        },
        onClick: handleRestoreClick,
      });
    }

    return actions;
  };

  return getBatchActions();
};
