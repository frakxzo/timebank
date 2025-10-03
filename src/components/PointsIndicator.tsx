import { Coins } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function PointsIndicator() {
  const currentUser = useQuery(api.users.current, {});

  if (!currentUser) return null;
  if (currentUser.role !== "intern" && currentUser.role !== "company") return null;

  const balance = currentUser.pointsBalance || 0;

  return (
    <div className="hidden sm:flex items-center gap-2 rounded-md border px-3 py-1 bg-card/60">
      <Coins className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">{balance} pts</span>
    </div>
  );
}
