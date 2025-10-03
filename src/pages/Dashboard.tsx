import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import CompanyDashboard from "@/components/dashboards/CompanyDashboard";
import InternDashboard from "@/components/dashboards/InternDashboard";
import AdminDashboard from "@/components/dashboards/AdminDashboard";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !user.role) {
    navigate("/onboarding");
    return null;
  }

  return (
    <>
      {user.role === "company" && <CompanyDashboard />}
      {user.role === "intern" && <InternDashboard />}
      {user.role === "admin" && <AdminDashboard />}
    </>
  );
}
