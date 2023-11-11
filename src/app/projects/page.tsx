"use client";
import { Form } from "@/components/form";
import { LayoutMain } from "@/components/layouts/LayoutMain";
import { Button, SubmitButton } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { insertProjectSchema } from "@/server/db/schema";
import { api } from "@/trpc/react";
import { useState } from "react";

export default function Projects() {
  const [isOpen, setIsOpen] = useState(false);

  const utils = api.useUtils();
  const { mutateAsync: createProject } = api.projects.create.useMutation({
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

  return (
    <LayoutMain>
      <div className="">
        <div className="flex justify-between p-4">
          <h2 className="text-lg">Projects</h2>
          <div className="flex gap-2">
            <Button variant="default" size="sm" onClick={() => setIsOpen(true)}>
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
          <Form
            schema={insertProjectSchema}
            defaultValues={{ projectName: "", dueDate: "" }}
            onSubmit={createProject}
          >
            {(form) => (
              <>
                <Form.Input
                  label="Project Name"
                  control={form.control}
                  name="projectName"
                  description="How you want to refer to this project"
                />
                <Form.Input
                  label="Due Date"
                  min={new Date().toISOString().split("T")[0]}
                  type="date"
                  control={form.control}
                  name="dueDate"
                  description="The date the project is due"
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <SubmitButton>Create Project</SubmitButton>
                </DialogFooter>
              </>
            )}
          </Form>
        </DialogContent>
      </Dialog>
    </LayoutMain>
  );
}
