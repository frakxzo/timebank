import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { BookOpen, Briefcase, LogOut, Package, Users } from "lucide-react";
import { useNavigate } from "react-router";
import UserManagement from "@/components/admin/UserManagement";
import ProjectManagement from "@/components/admin/ProjectManagement";
import PackageManagement from "@/components/admin/PackageManagement";

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const stats = useQuery(api.admin.getStats);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen">
      <div className="border-b border-accent/30 bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.svg" alt="TimeBank" className="h-10 w-10 cursor-pointer" onClick={() => navigate("/")} />
            <h1 className="text-2xl font-bold neon-text">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/courses")}>
              <BookOpen className="h-4 w-4 mr-2" />
              Manage Courses
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
          className="space-y-6"
        >
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-2 border-primary/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">{stats.totalUsers}</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-secondary/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-secondary">{stats.activeProjects}</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-accent/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-accent">{stats.totalTransactions}</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-primary/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">{stats.totalCourses}</p>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl">
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="projects">
                <Briefcase className="h-4 w-4 mr-2" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="packages">
                <Package className="h-4 w-4 mr-2" />
                Packages
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="projects">
              <ProjectManagement />
            </TabsContent>

            <TabsContent value="packages">
              <PackageManagement />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
