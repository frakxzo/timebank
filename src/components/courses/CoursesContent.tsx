import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { motion } from "framer-motion";
import { BookOpen, LogOut, Plus, Check, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import UploadCourseDialog from "@/components/courses/UploadCourseDialog";
import { toast } from "sonner";

export default function CoursesContent() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");
  const courses = useQuery(api.courses.list, { category });
  const pending = useQuery(api.courses.listPending, user?.role === "admin" ? {} : "skip");
  const approve = useMutation(api.courses.approve);
  const remove = useMutation(api.courses.remove);
  const [openUpload, setOpenUpload] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen">
      <div className="border-b border-accent/30 bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.svg" alt="TimeBank" className="h-10 w-10 cursor-pointer" onClick={() => navigate("/")} />
            <h1 className="text-2xl font-bold neon-text">Courses</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setOpenUpload(true)} className="hidden sm:inline-flex">
              <Plus className="h-4 w-4 mr-2" />
              {user?.role === "admin" ? "Create Course" : "Submit Course"}
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
           <Button onClick={() => setOpenUpload(true)} className="sm:hidden">
             <Plus className="h-4 w-4 mr-2" />
             {user?.role === "admin" ? "Create" : "Submit"}
           </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {courses?.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="border-2 border-accent/30 hover:border-accent/50 transition-colors">
                  <CardHeader>
                    <BookOpen className="h-8 w-8 text-accent mb-2" />
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Start Learning
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

         {user?.role === "admin" && pending && pending.length > 0 && (
           <div className="space-y-4">
             <h3 className="text-xl font-bold">Pending Submissions</h3>
             <div className="grid md:grid-cols-2 gap-4">
               {pending.map((c) => (
                 <Card key={c._id} className="border-2 border-primary/30">
                   <CardHeader>
                     <CardTitle>{c.title}</CardTitle>
                     <CardDescription>{c.description}</CardDescription>
                   </CardHeader>
                   <CardContent className="flex gap-2">
                     <Button size="sm" onClick={async () => { await approve({ courseId: c._id as any }); toast.success("Approved"); }}>
                       <Check className="h-4 w-4 mr-1" /> Approve
                     </Button>
                     <Button size="sm" variant="outline" onClick={async () => { await remove({ courseId: c._id as any }); toast.success("Removed"); }}>
                       <X className="h-4 w-4 mr-1" /> Reject
                     </Button>
                   </CardContent>
                 </Card>
               ))}
             </div>
           </div>
         )}
        </motion.div>
      </div>
     <UploadCourseDialog open={openUpload} onOpenChange={setOpenUpload} role={user?.role || "intern"} />
    </div>
  );
}