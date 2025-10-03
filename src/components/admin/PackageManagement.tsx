import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Coins, Package } from "lucide-react";

export default function PackageManagement() {
  const packages = useQuery(api.pointPackages.list);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Package Management</h2>
        <Button>
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
    </div>
  );
}
