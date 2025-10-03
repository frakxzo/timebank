import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { motion } from "framer-motion";
import { Coins, Package, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function PackageManagement() {
  const packages = useQuery(api.pointPackages.list);
  const createPackage = useMutation(api.pointPackages.create);
  const [createOpen, setCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    points: "",
    price: "",
    description: "",
  });

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.points || !formData.price || !formData.description.trim()) {
      toast.error("All fields are required");
      return;
    }

    const points = Number(formData.points);
    const price = Number(formData.price);

    if (!Number.isFinite(points) || points <= 0) {
      toast.error("Points must be a positive number");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Price must be a positive number");
      return;
    }

    setIsSubmitting(true);
    try {
      await createPackage({
        name: formData.name,
        points,
        price,
        description: formData.description,
      });
      toast.success("Package created successfully!");
      setCreateOpen(false);
      setFormData({ name: "", points: "", price: "", description: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create package");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Package Management</h2>
        <Button onClick={() => setCreateOpen(true)}>
          <Package className="h-4 w-4 mr-2" />
          Create Package
        </Button>
      </div>

      {!packages || packages.length === 0 ? (
        <Card className="border-2 border-border">
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No packages found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="border-2 border-primary/30">
                <CardHeader className="text-center">
                  <Coins className="h-12 w-12 mx-auto mb-2 text-primary" />
                  <CardTitle>{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-3xl font-bold text-primary">{pkg.points} points</p>
                  <p className="text-xl font-bold mt-2">${pkg.price}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Point Package</DialogTitle>
            <DialogDescription>Add a new point package for companies to purchase</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Package Name</Label>
              <Input
                id="name"
                placeholder="e.g., Starter Pack"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                placeholder="e.g., 100"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="e.g., 10.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="e.g., Perfect for small projects"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <Button onClick={handleCreate} disabled={isSubmitting} className="w-full">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Package
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}