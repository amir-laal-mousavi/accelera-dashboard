// Cache-bust: v1.0.13 - Force cache invalidation for Router context fix
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5"
    >
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="./logo.svg" alt="Logo" className="h-10 w-10" loading="eager" />
            <h1 className="text-xl font-bold tracking-tight">ACCELERA</h1>
          </div>
          <div className="flex items-center gap-4">
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <Button onClick={() => navigate("/dashboard")}>
                    Dashboard
                  </Button>
                ) : (
                  <Button onClick={() => navigate("/auth")}>
                    Get Started
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="flex justify-center mb-8">
            <img
              src="./logo.svg"
              alt="ACCELERA Logo"
              width={120}
              height={120}
              className="rounded-2xl"
              loading="eager"
            />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Your Life,
            <br />
            <span className="text-primary">Optimized</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            ACCELERA is your all-in-one productivity dashboard. Track tasks, habits, health, workouts, reading, and finances with powerful analytics.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8 gap-2">
              <Sparkles className="h-5 w-5" />
              Start 7-Day Free Trial
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/dashboard")} className="text-lg px-8">
              View Demo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Cancel anytime • Full Pro access
          </p>
        </motion.div>

        {/* Pricing Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-20 max-w-4xl"
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Get started with basic features</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Basic task tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Up to 3 habits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Basic analytics</span>
                </li>
              </ul>
              <Button className="w-full mt-6" variant="outline" onClick={() => navigate("/auth")}>
                Get Started
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-bl-lg">
              POPULAR
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Pro
                <Sparkles className="h-5 w-5 text-primary" />
              </CardTitle>
              <CardDescription>Full access to all features</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$9</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Unlimited tasks & habits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Advanced analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Export data</span>
                </li>
              </ul>
              <Button className="w-full mt-6 gap-2" onClick={() => navigate("/auth")}>
                <Sparkles className="h-4 w-4" />
                Start 7-Day Free Trial
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                No credit card required
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-20 max-w-6xl"
        >
          {[
            { icon: "📋", label: "Tasks" },
            { icon: "🎯", label: "Habits" },
            { icon: "💪", label: "Workouts" },
            { icon: "📚", label: "Reading" },
            { icon: "💰", label: "Finance" },
            { icon: "📊", label: "Analytics" },
          ].map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              className="p-6 border rounded-xl bg-card hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-2">{feature.icon}</div>
              <p className="font-semibold">{feature.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>
          Powered by{" "}
          <a
            href="https://vly.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary transition-colors"
          >
            vly.ai
          </a>
        </p>
      </footer>
    </motion.div>
  );
}