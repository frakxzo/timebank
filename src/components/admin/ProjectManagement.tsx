import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import ProjectsList from "@/components/projects/ProjectsList";

export default function ProjectManagement() {
  const projects = useQuery(api.projects.list, {});

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Project Management</h2>
      <ProjectsList projects={projects || []} isCompanyView />
    </div>
  );
}
