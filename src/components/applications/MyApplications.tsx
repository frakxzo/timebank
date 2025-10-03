import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";

export default function MyApplications() {
  const applications = useQuery(api.applications.getByIntern);

  if (!applications || applications.length === 0) {
    return (
      <Card className="border-2 border-border">
        <CardContent className="py-12 text-center">
          <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No applications yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {applications.map((app, index) => (
        <motion.div
          key={app._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="border-2 border-secondary/30">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{app.project?.title || "Unknown Project"}</CardTitle>
                  <CardDescription>Company: {app.companyName}</CardDescription>
                </div>
                <Badge variant={app.status === "accepted" ? "default" : app.status === "rejected" ? "destructive" : "secondary"}>
                  {app.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{app.message}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
