import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  isOwned: boolean;
  isAdmin: boolean;
  courseTitle: string;
};

export default function CourseVideosDialog({ open, onOpenChange, courseId, isOwned, isAdmin, courseTitle }: Props) {
  const { user } = useAuth();
  const courseIdConvex = useMemo(() => courseId as any, [courseId]);
  const canContribute = isAdmin || (user?.role === "intern" && isOwned);

  const videos = useQuery(api.courses.listVideos, open ? { courseId: courseIdConvex } : "skip");

  const addVideo = useMutation(api.courses.addVideo);
  const genUpload = useMutation(api.courses.generateVideoUploadUrl);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setVideoUrl("");
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [open]);

  const handleUploadAndAttach = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return toast.error("Select a file to upload");
    if (!title.trim()) return toast.error("Title is required");
    try {
      setIsUploading(true);
      const url = await genUpload({ courseId: courseIdConvex });
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": file.type },
        body: file,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Upload failed");
      }
      const { storageId } = await res.json();

      await addVideo({
        courseId: courseIdConvex,
        title,
        description: description || undefined,
        fileId: storageId as any,
      });
      toast.success("Video uploaded and added");
      setTitle("");
      setDescription("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddUrl = async () => {
    if (!title.trim()) return toast.error("Title is required");
    if (!videoUrl.trim()) return toast.error("Video URL is required");
    try {
      await addVideo({
        courseId: courseIdConvex,
        title,
        description: description || undefined,
        videoUrl,
      });
      toast.success("Video link added");
      setTitle("");
      setDescription("");
      setVideoUrl("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Course Videos — {courseTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            {!videos ? (
              <p className="text-sm text-muted-foreground">Loading videos…</p>
            ) : videos.length === 0 ? (
              <p className="text-sm text-muted-foreground">No videos yet.</p>
            ) : (
              <ul className="space-y-3">
                {videos.map((v) => (
                  <li key={v._id} className="rounded border p-3">
                    <div className="font-medium">{v.title}</div>
                    {v.description ? <div className="text-sm text-muted-foreground">{v.description}</div> : null}
                    <div className="mt-2">
                      {v.signedUrl ? (
                        <video controls className="w-full rounded" src={v.signedUrl} />
                      ) : v.videoUrl ? (
                        <a className="text-primary underline" href={v.videoUrl} target="_blank" rel="noreferrer">
                          Open video
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">No source</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {canContribute ? (
            <div className="space-y-3 border-t pt-4">
              <div className="grid gap-3">
                <div className="grid gap-1">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Lesson 1: Intro" />
                </div>
                <div className="grid gap-1">
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short summary"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Add by URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  <Button onClick={handleAddUrl}>Add URL</Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Or upload .mp4</Label>
                <Input ref={fileRef} type="file" accept="video/mp4" />
                <Button onClick={handleUploadAndAttach} disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Upload & Attach"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Purchase this course to access its videos.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
