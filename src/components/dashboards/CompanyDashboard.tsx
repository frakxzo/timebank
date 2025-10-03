import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Briefcase, Coins, History, LogOut, Plus, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import ProjectsList from "@/components/projects/ProjectsList";
import CreateProjectDialog from "@/components/projects/CreateProjectDialog";
import PurchasePointsDialog from "@/components/points/PurchasePointsDialog";
import TransactionHistory from "@/components/transactions/TransactionHistory";

export default function CompanyDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [purchasePointsOpen, setPurchasePointsOpen] = useState(false);
  const myProjects = useQuery(api.projects.getByCompany, user ? { companyId: user._id } : "skip");

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen">
      <div className="border-b border-primary/30 bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.svg" alt="TimeBank" className="h-10 w-10 cursor-pointer" onClick={() => navigate("/")} />
            <h1 className="text-2xl font-bold neon-text">Company Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Points Balance</p>
              <p className="text-2xl font-bold text-primary">{user?.pointsBalance || 0}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs defaultValue="projects" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl">
              <TabsTrigger value="projects">
                <Briefcase className="h-4 w-4 mr-2" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="points">
                <Coins className="h-4 w-4 mr-2" />
                Points
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Projects</h2>
                <Button onClick={() => setCreateProjectOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </div>
              <ProjectsList projects={myProjects || []} isCompanyView />
            </TabsContent>

            <TabsContent value="points" className="space-y-4">
              <Card className="border-2 border-primary/30">
                <CardHeader>
                  <CardTitle>Purchase Points</CardTitle>
                  <CardDescription>
                    Buy points to fund your projects and hire interns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setPurchasePointsOpen(true)} size="lg">
                    <Coins className="h-4 w-4 mr-2" />
                    Buy Points
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <TransactionHistory />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <CreateProjectDialog open={createProjectOpen} onOpenChange={setCreateProjectOpen} />
      <PurchasePointsDialog open={purchasePointsOpen} onOpenChange={setPurchasePointsOpen} />
    </div>
  );
}
