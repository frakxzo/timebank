import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: "admin" | "intern" | string;
}

export default function UploadCourseDialog({ open, onOpenChange, role }: Props) {
  const create = useMutation(api.courses.create);
  const submit = useMutation(api.courses.submit);
  const [category, setCategory] = useState<string>("development");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      category,
      videoUrl: (fd.get("videoUrl") as string) || undefined,
      thumbnailUrl: (fd.get("thumbnailUrl") as string) || undefined,
      duration: (fd.get("duration") as string) || undefined,
    };
    if (!payload.title?.trim() || !payload.description?.trim()) {
      toast.error("Title and description are required");
      return;
    }
    setIsSubmitting(true);
    try {
      if (role === "admin") {
        await create(payload as any);
        toast.success("Course created");
      } else {
        await submit(payload as any);
        toast.success("Submitted for approval");
      }
      onOpenChange(false);
    } catch {
      toast.error("Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{role === "admin" ? "Create Course" : "Submit Course"}</DialogTitle>
          <DialogDescription>
            {role === "admin"
              ? "Create a new course. It will be available immediately."
              : "Submit a course; it becomes visible after admin approval."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input id="duration" name="duration" placeholder="e.g., 1h 20m" />
            </div>
          </div>
          <div>
            <Label htmlFor="videoUrl">Video URL (YouTube, etc.)</Label>
            <Input id="videoUrl" name="videoUrl" placeholder="https://..." />
          </div>
          <div>
            <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
            <Input id="thumbnailUrl" name="thumbnailUrl" placeholder="https://..." />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : "Submit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
