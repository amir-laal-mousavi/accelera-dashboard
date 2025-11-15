import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function TrialBanner() {
  const trialStatus = useQuery(api.trial.getTrialStatus);
  const [dismissed, setDismissed] = useState(false);

  if (!trialStatus || dismissed) return null;

  const { isOnTrial, daysLeft, trialEndAt } = trialStatus;

  if (!isOnTrial) return null;

  const isEndingSoon = daysLeft <= 3;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <Card
          className={`relative overflow-hidden border-2 ${
            isEndingSoon
              ? "border-orange-500/50 bg-gradient-to-r from-orange-500/10 to-red-500/10"
              : "border-primary/50 bg-gradient-to-r from-primary/10 to-purple-500/10"
          }`}
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {isEndingSoon ? (
                <Clock className="h-5 w-5 text-orange-500 animate-pulse" />
              ) : (
                <Sparkles className="h-5 w-5 text-primary" />
              )}
              <div>
                <p className="font-semibold">
                  {isEndingSoon
                    ? `Trial ending soon! ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`
                    : `You're on a 7-day Pro trial. ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left.`}
                </p>
                <p className="text-sm text-muted-foreground">
                  Upgrade now to keep all Pro features after{" "}
                  {new Date(trialEndAt!).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Upgrade Now
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDismissed(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
