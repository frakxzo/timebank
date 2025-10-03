import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Coins, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PurchasePointsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PurchasePointsDialog({ open, onOpenChange }: PurchasePointsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const packages = useQuery(api.pointPackages.list);
  const purchasePoints = useMutation(api.transactions.purchasePoints);

  const handlePurchase = async (packageId: string) => {
    setIsSubmitting(true);
    try {
      await purchasePoints({ packageId: packageId as any });
      toast.success("Points purchased successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to purchase points");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Purchase Points</DialogTitle>
          <DialogDescription>Choose a package to add points to your account</DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-3 gap-4">
          {packages?.map((pkg) => (
            <Card key={pkg._id} className="border-2 border-primary/30">
              <CardHeader className="text-center">
                <Coins className="h-12 w-12 mx-auto mb-2 text-primary" />
                <CardTitle>{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div>
                  <p className="text-3xl font-bold text-primary">{pkg.points}</p>
                  <p className="text-sm text-muted-foreground">points</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">${pkg.price}</p>
                </div>
                <Button
                  onClick={() => handlePurchase(pkg._id)}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Purchase"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
