import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { Building2, Loader2, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export default function Onboarding() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setRole = useMutation(api.profile.setRole);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
    if (user?.role) {
      navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  const handleRoleSelection = async (role: string) => {
    setIsSubmitting(true);
    try {
      await setRole({ role });
      toast.success(`Welcome! You're now registered as ${role === "company" ? "a Company" : "an Intern"}`);
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to set role. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <Card className="border-2 border-primary cyber-glow">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold neon-text">Choose Your Role</CardTitle>
            <CardDescription className="text-lg">
              Select how you want to use TimeBank
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card
                className={`cursor-pointer transition-all border-2 ${
                  selectedRole === "company"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedRole("company")}
              >
                <CardHeader className="text-center">
                  <Building2 className="h-16 w-16 mx-auto mb-4 text-primary" />
                  <CardTitle className="text-xl">Company</CardTitle>
                  <CardDescription>
                    Post projects, hire interns, and manage your team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Purchase points to fund projects</li>
                    <li>• Post project opportunities</li>
                    <li>• Review intern applications</li>
                    <li>• Track project progress</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card
                className={`cursor-pointer transition-all border-2 ${
                  selectedRole === "intern"
                    ? "border-secondary bg-secondary/10"
                    : "border-border hover:border-secondary/50"
                }`}
                onClick={() => setSelectedRole("intern")}
              >
                <CardHeader className="text-center">
                  <UserCircle className="h-16 w-16 mx-auto mb-4 text-secondary" />
                  <CardTitle className="text-xl">Intern</CardTitle>
                  <CardDescription>
                    Find projects, earn points, and learn new skills
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Browse available projects</li>
                    <li>• Apply to opportunities</li>
                    <li>• Earn points for completed work</li>
                    <li>• Access learning courses</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </CardContent>
          <div className="p-6 pt-0">
            <Button
              className="w-full"
              size="lg"
              disabled={!selectedRole || isSubmitting}
              onClick={() => selectedRole && handleRoleSelection(selectedRole)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
