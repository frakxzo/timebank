import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { History } from "lucide-react";

export default function TransactionHistory() {
  const transactions = useQuery(api.transactions.getByUser);

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="border-2 border-border">
        <CardContent className="py-12 text-center">
          <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No transactions yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction, index) => (
        <motion.div
          key={transaction._id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className="border-2 border-accent/30">
            <CardContent className="py-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction._creationTime).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={transaction.type === "earn" ? "default" : "secondary"}>
                    {transaction.type === "earn" ? "+" : "-"}{transaction.amount} points
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
