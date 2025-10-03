import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
}

export default function ApplyToProjectDialog({ open, onOpenChange, projectId, projectTitle }: Props) {
  const apply = useMutation(api.applications.create);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const message = (fd.get("message") as string) || "";
    const email = (fd.get("email") as string) || "";
    if (!message.trim() || !email.trim()) {
      toast.error("Please provide both email and a short message");
      return;
    }
    setIsSubmitting(true);
    try {
      await apply({ projectId: projectId as any, message, applicantEmail: email });
      toast.success("Application sent!");
      onOpenChange(false);
    } catch (e) {
      toast.error("Failed to apply");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply to: {projectTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Your Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" rows={4} placeholder="Share why you're a great fit..." required />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : "Submit Application"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
