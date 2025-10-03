import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Loader2, User } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export default function ApplicationsDialog({ open, onOpenChange, projectId }: Props) {
  const applications = useQuery(api.applications.getByProject, open ? { projectId: projectId as any } : "skip");
  const updateStatus = useMutation(api.applications.updateStatus);

  const handle = async (applicationId: string, status: "accepted" | "rejected") => {
    try {
      await updateStatus({ applicationId: applicationId as any, status });
      toast.success(`Application ${status}`);
    } catch {
      toast.error("Failed to update application");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Applications</DialogTitle>
        </DialogHeader>
        {!applications ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          <Card className="border-2 border-border">
            <CardContent className="py-8 text-center">No applications yet</CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <Card key={app._id} className="border-2 border-primary/20">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-medium">{app.internName}</span>
                        <Badge variant="outline">{app.internSkills?.slice(0, 3).join(", ") || "No skills"}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground break-words">{app.message}</p>
                      {app.internImage && <img src={app.internImage} className="h-10 w-10 rounded" />}
                      {app.applicantEmail && (
                        <p className="text-xs text-muted-foreground">Email: {app.applicantEmail}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => handle(app._id as any, "rejected")}>Decline</Button>
                      <Button onClick={() => handle(app._id as any, "accepted")}>Approve</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
