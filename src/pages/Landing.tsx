import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Coins, GraduationCap, Loader2, Zap } from "lucide-react";
import { useNavigate } from "react-router";

export default function Landing() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated && user?.role) {
      navigate("/dashboard");
    } else if (isAuthenticated) {
      navigate("/onboarding");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-primary/30 bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <img src="/logo.svg" alt="TimeBank" className="h-10 w-10" />
            <span className="text-2xl font-bold neon-text">TimeBank</span>
          </div>
          <div className="flex items-center gap-4">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : isAuthenticated ? (
              <Button onClick={() => navigate("/dashboard")} className="cyber-glow">
                Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => navigate("/auth")} variant="outline">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-block mb-6 px-4 py-2 border-2 border-primary rounded-none bg-primary/10">
            <span className="text-primary font-bold tracking-wider">NEXT-GEN TALENT MARKETPLACE</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 neon-text chromatic tracking-tight">
            TIMEBANK
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A revolutionary platform connecting companies with talented interns through a point-based economy
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleGetStarted} className="text-lg cyber-glow">
              <Zap className="mr-2 h-5 w-5" />
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
              Learn More
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 border-t border-primary/30">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 neon-text">How It Works</h2>
          <p className="text-xl text-muted-foreground">Three simple steps to success</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="border-2 border-primary p-8 bg-card/50 backdrop-blur cyber-border"
          >
            <Coins className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-2xl font-bold mb-3">For Companies</h3>
            <p className="text-muted-foreground">
              Purchase points, post projects, and hire talented interns to grow your business
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="border-2 border-secondary p-8 bg-card/50 backdrop-blur cyber-border"
          >
            <Briefcase className="h-12 w-12 text-secondary mb-4" />
            <h3 className="text-2xl font-bold mb-3">For Interns</h3>
            <p className="text-muted-foreground">
              Browse projects, apply to opportunities, and earn points for your work
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="border-2 border-accent p-8 bg-card/50 backdrop-blur cyber-border"
          >
            <GraduationCap className="h-12 w-12 text-accent mb-4" />
            <h3 className="text-2xl font-bold mb-3">Learn & Grow</h3>
            <p className="text-muted-foreground">
              Access exclusive courses and resources to develop your skills
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 border-t border-primary/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center border-2 border-primary p-12 bg-primary/5 cyber-border"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 neon-text">Ready to Join?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start your journey in the future of work today
          </p>
          <Button size="lg" onClick={handleGetStarted} className="text-lg cyber-glow">
            <Zap className="mr-2 h-5 w-5" />
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/30 bg-card/50 backdrop-blur mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2024 TimeBank. Built with vly.ai</p>
        </div>
      </footer>
    </div>
  );
}