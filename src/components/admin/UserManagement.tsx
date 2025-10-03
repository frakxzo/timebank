import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { motion } from "framer-motion";
import { Users, DollarSign, ShieldBan, Trash2, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function UserManagement() {
  const [roleFilter, setRoleFilter] = useState("all");
  const users = useQuery(api.admin.getAllUsers, { role: roleFilter });
  const adjust = useMutation(api.admin.adjustUserPoints);
  const setBan = useMutation(api.admin.setUserBan);
  const del = useMutation(api.admin.deleteUser);

  const handleQuickAdjust = async (userId: string, amount: number) => {
    try {
      await adjust({ userId: userId as any, amount, reason: "Quick adjust" });
      toast.success(`${amount > 0 ? "Added" : "Removed"} ${Math.abs(amount)} points`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to adjust points");
    }
  };

  const handleCustomAdjust = async (userId: string) => {
    const amtStr = window.prompt("Enter amount to adjust (positive to add, negative to remove):", "50");
    if (!amtStr) return;
    const amount = Number(amtStr);
    if (Number.isNaN(amount) || amount === 0) {
      toast.error("Invalid amount");
      return;
    }
    const reason = window.prompt("Reason (optional):", "Admin adjustment") || undefined;
    try {
      await adjust({ userId: userId as any, amount, reason });
      toast.success("Balance adjusted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to adjust points");
    }
  };

  const handleToggleBan = async (userId: string, isBanned: boolean) => {
    try {
      await setBan({ userId: userId as any, isBanned: !isBanned });
      toast.success(!isBanned ? "User banned" : "User unbanned");
    } catch {
      toast.error("Failed to update ban status");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm("This will delete the user and related data. Continue?")) return;
    try {
      await del({ userId: userId as any });
      toast.success("User deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete user");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="company">Companies</SelectItem>
            <SelectItem value="intern">Interns</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!users || users.length === 0 ? (
        <Card className="border-2 border-border">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No users found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {users.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="border-2 border-primary/30">
                <CardContent className="py-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {user.name || user.email || "Anonymous"}{" "}
                        {user.isBanned ? <span className="ml-2 text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-500">banned</span> : null}
                      </p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="mt-1 text-sm flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span>{user.pointsBalance ?? 0} pts</span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        role: {user.role || "none"}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleQuickAdjust(user._id as any, -50)}>
                        <Minus className="h-3 w-3 mr-1" /> -50
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleQuickAdjust(user._id as any, +50)}>
                        <Plus className="h-3 w-3 mr-1" /> +50
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleCustomAdjust(user._id as any)}>
                        Adjust…
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleToggleBan(user._id as any, !!user.isBanned)}>
                        <ShieldBan className="h-3 w-3 mr-1" /> {user.isBanned ? "Unban" : "Ban"}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(user._id as any)}>
                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}