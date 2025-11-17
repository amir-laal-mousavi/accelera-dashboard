import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

interface DailyLogFormProps {
  date: number;
  existingLog?: {
    _id: Id<"dailyLogs">;
    mood?: string;
    productivityScore?: number;
    healthScore?: number;
    notes?: string;
  } | null;
}

export function DailyLogForm({ date, existingLog }: DailyLogFormProps) {
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState<string>(existingLog?.mood || "");
  const [productivityScore, setProductivityScore] = useState(existingLog?.productivityScore?.toString() || "");
  const [healthScore, setHealthScore] = useState(existingLog?.healthScore?.toString() || "");
  const [notes, setNotes] = useState(existingLog?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createLog = useMutation((api as any).dailyLogs.create);
  const updateLog = useMutation((api as any).dailyLogs.update);

  useEffect(() => {
    if (existingLog) {
      setMood(existingLog.mood || "");
      setProductivityScore(existingLog.productivityScore?.toString() || "");
      setHealthScore(existingLog.healthScore?.toString() || "");
      setNotes(existingLog.notes || "");
    } else {
      setMood("");
      setProductivityScore("");
      setHealthScore("");
      setNotes("");
    }
  }, [existingLog]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      if (existingLog) {
        await updateLog({
          id: existingLog._id,
          mood: mood as any,
          productivityScore: productivityScore ? parseInt(productivityScore) : undefined,
          healthScore: healthScore ? parseInt(healthScore) : undefined,
          notes: notes.trim() || undefined,
        });
        toast.success("Daily log updated!");
      } else {
        await createLog({
          date,
          mood: mood as any,
          productivityScore: productivityScore ? parseInt(productivityScore) : undefined,
          healthScore: healthScore ? parseInt(healthScore) : undefined,
          notes: notes.trim() || undefined,
        });
        toast.success("Daily log created!");
      }

      setOpen(false);
    } catch (error) {
      toast.error("Failed to save daily log");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          {existingLog ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {existingLog ? "Edit Log" : "Add Log"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{existingLog ? "Edit Daily Log" : "Add Daily Log"}</DialogTitle>
          <DialogDescription>
            Track your mood, productivity, and notes for the day
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mood">Mood</Label>
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger>
                <SelectValue placeholder="Select mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Great">😄 Great</SelectItem>
                <SelectItem value="Good">🙂 Good</SelectItem>
                <SelectItem value="Okay">😐 Okay</SelectItem>
                <SelectItem value="Bad">😞 Bad</SelectItem>
                <SelectItem value="Terrible">😢 Terrible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productivityScore">Productivity Score (0-100)</Label>
              <Input
                id="productivityScore"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={productivityScore}
                onChange={(e) => setProductivityScore(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="healthScore">Health Score (0-100)</Label>
              <Input
                id="healthScore"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={healthScore}
                onChange={(e) => setHealthScore(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="How was your day? Any reflections?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : existingLog ? "Update Log" : "Add Log"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
