import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Doc } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";
import { Briefcase, Calendar, Clock, DollarSign } from "lucide-react";
import ApplicationsDialog from "@/components/applications/ApplicationsDialog";
import ApplyToProjectDialog from "@/components/applications/ApplyToProjectDialog";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { toast } from "sonner";

interface ProjectsListProps {
  projects: Array<Doc<"projects"> & { companyName?: string; companyImage?: string }>;
  isCompanyView?: boolean;
}

export default function ProjectsList({ projects, isCompanyView }: ProjectsListProps) {
  const [openApplicationsFor, setOpenApplicationsFor] = useState<string | null>(null);
  const [openApplyFor, setOpenApplyFor] = useState<string | null>(null);

  // Add company-side completion actions
  const approve = useMutation(api.projects.approveCompletion);
  const reject = useMutation(api.projects.rejectCompletion);

  if (projects.length === 0) {
    return (
      <Card className="border-2 border-border">
        <CardContent className="py-12 text-center">
          <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No projects found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {projects.map((project, index) => (
        <motion.div
          key={project._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="border-2 border-primary/30 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <CardDescription className="mt-2">{project.description}</CardDescription>
                </div>
                <Badge variant={project.status === "open" ? "default" : "secondary"}>
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-sm">{project.pointsReward} points</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-secondary" />
                  <span className="text-sm">{project.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{project.difficulty}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{project.category}</Badge>
                </div>
              </div>

              {isCompanyView ? (
                <>
                  {/* If completion requested, show approve/rework/reject buttons */}
                  {project.status === "in_progress" && project.completionRequested ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Badge variant="outline">Completion requested</Badge>
                      <div className="ml-auto flex gap-2">
                        <Button
                          onClick={async () => {
                            try {
                              await approve({ projectId: project._id as any });
                              toast.success("Approved and rewarded intern");
                            } catch (e) {
                              toast.error(e instanceof Error ? e.message : "Failed to approve");
                            }
                          }}
                        >
                          Approve & Reward
                        </Button>
                        <Button
                          variant="outline"
                          onClick={async () => {
                            try {
                              await reject({ projectId: project._id as any, action: "redo" as any });
                              toast.success("Requested rework");
                            } catch (e) {
                              toast.error(e instanceof Error ? e.message : "Failed to request rework");
                            }
                          }}
                        >
                          Request Rework
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            try {
                              await reject({ projectId: project._id as any, action: "reject" as any });
                              toast.success("Rejected and unassigned");
                            } catch (e) {
                              toast.error(e instanceof Error ? e.message : "Failed to reject");
                            }
                          }}
                        >
                          Reject & Unassign
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full" onClick={() => setOpenApplicationsFor(project._id as any)}>
                      View Applications
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setOpenApplyFor(project._id as any)}
                  disabled={project.status !== "open"}
                >
                  Apply
                </Button>
              )}
            </CardContent>
          </Card>
          <ApplicationsDialog
            open={openApplicationsFor === (project._id as any)}
            onOpenChange={(o) => !o && setOpenApplicationsFor(null)}
            projectId={project._id as any}
          />
          <ApplyToProjectDialog
            open={openApplyFor === (project._id as any)}
            onOpenChange={(o) => !o && setOpenApplyFor(null)}
            projectId={project._id as any}
            projectTitle={project.title}
          />
        </motion.div>
      ))}
    </div>
  );
}