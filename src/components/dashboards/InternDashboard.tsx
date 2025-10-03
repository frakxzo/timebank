import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { BookOpen, Briefcase, History, LogOut, Star } from "lucide-react";
import { useNavigate } from "react-router";
import ProjectMarketplace from "@/components/projects/ProjectMarketplace";
import MyApplications from "@/components/applications/MyApplications";
import TransactionHistory from "@/components/transactions/TransactionHistory";

export default function InternDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen">
      <div className="border-b border-secondary/30 bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.svg" alt="TimeBank" className="h-10 w-10 cursor-pointer" onClick={() => navigate("/")} />
            <h1 className="text-2xl font-bold neon-text">Intern Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Points Earned</p>
              <p className="text-2xl font-bold text-secondary">{user?.totalPointsEarned || 0}</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/courses")}>
              <BookOpen className="h-4 w-4 mr-2" />
              Courses
            </Button>
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
          <Tabs defaultValue="marketplace" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl">
              <TabsTrigger value="marketplace">
                <Briefcase className="h-4 w-4 mr-2" />
                Marketplace
              </TabsTrigger>
              <TabsTrigger value="applications">
                <Star className="h-4 w-4 mr-2" />
                My Applications
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-2" />
                Earnings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="marketplace">
              <ProjectMarketplace />
            </TabsContent>

            <TabsContent value="applications">
              <MyApplications />
            </TabsContent>

            <TabsContent value="history">
              <TransactionHistory />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
