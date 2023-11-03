"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { newDate } from "@/utils/dateUtils";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useState } from "react";

export default function Projects() {
  const [isOpen, setIsOpen] = useState(false);

  const utils = api.useUtils();
  const { mutate: createProject } = api.projects.create.useMutation({
    onSuccess: () => {
      setIsOpen(false);
      utils.projects.all.invalidate().catch((e) => console.error(e));
    },
  });
  const { mutate: deleteProject } = api.projects.delete.useMutation({
    onSuccess: () => {
      utils.projects.all.invalidate().catch((e) => console.error(e));
    },
  });

  const { data: projects } = api.projects.all.useQuery(undefined, {
    suspense: true,
  });

  const [formState, setFormState] = useState({ projectName: "", dueDate: "" });

  return (
    <div className="container p-8">
      <div className="">
        <div className="flex justify-between py-4">
          <h2 className="text-lg">Projects</h2>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsOpen(true)}
              //   onClick={() => {
              //     createUser({
              //       tenantId: Number(params.tenantId),
              //       user: {
              //         firstName: "John",
              //         lastName: "Doe",
              //         email: `mason.sten+${new Date().toISOString()}@gmail.com`,
              //       },
              //       password: "rush2112",
              //     });
              //   }}
            >
              Create Project
            </Button>
          </div>
        </div>
        <table className="pretty-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Name</th>
              <th>Updated At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(projects ?? []).map((project) => (
              <tr key={project?.id}>
                <td>{project.id}</td>
                <td>{project.projectName}</td>
                <td>
                  {project.dueDate &&
                    new Date(project.dueDate).toLocaleDateString()}
                </td>
                <td className="space-x-2">
                  <button
                    onClick={() => {
                      if (
                        confirm("Are you sure you want to delete this project?")
                      ) {
                        deleteProject(project.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createProject({
                projectName: formState.projectName,
                dueDate: newDate(formState.dueDate).getTime(),
              });
            }}
          >
            <DialogHeader>
              <DialogTitle>Login</DialogTitle>
              <DialogDescription>Login as user</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <Label>Email</Label>
              <Input
                type="text"
                placeholder="Project Name"
                value={formState.projectName}
                onChange={(e) =>
                  setFormState((p) => ({ ...p, projectName: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-4">
              <Label>Due Date</Label>
              <Input
                type="date"
                placeholder="Due Date"
                value={formState.dueDate}
                onChange={(e) =>
                  setFormState((p) => ({ ...p, dueDate: e.target.value }))
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
