import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface HealthLogFormProps {
  date: number;
}

export function HealthLogForm({ date }: HealthLogFormProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("water");
  
  // Water
  const [waterAmount, setWaterAmount] = useState("");
  const [waterGoal, setWaterGoal] = useState("2000");
  
  // Sleep
  const [sleepDuration, setSleepDuration] = useState("");
  const [sleepNotes, setSleepNotes] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addWater = useMutation((api as any).health.addWater);
  const addSleep = useMutation((api as any).health.addSleep);

  const handleSubmitWater = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!waterAmount) {
      toast.error("Please enter water amount");
      return;
    }

    setIsSubmitting(true);
    try {
      await addWater({
        dateTime: date,
        amount: parseInt(waterAmount),
        goal: waterGoal ? parseInt(waterGoal) : undefined,
      });

      toast.success("Water intake logged!");
      setWaterAmount("");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to log water intake");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitSleep = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sleepDuration) {
      toast.error("Please enter sleep duration");
      return;
    }

    setIsSubmitting(true);
    try {
      await addSleep({
        date,
        duration: parseFloat(sleepDuration),
        notes: sleepNotes.trim() || undefined,
      });

      toast.success("Sleep logged!");
      setSleepDuration("");
      setSleepNotes("");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to log sleep");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Health Log
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Health Log</DialogTitle>
          <DialogDescription>Track your water intake, sleep, and more</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="water">Water</TabsTrigger>
            <TabsTrigger value="sleep">Sleep</TabsTrigger>
          </TabsList>

          <TabsContent value="water">
            <form onSubmit={handleSubmitWater} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="waterAmount">Amount (ml) *</Label>
                <Input
                  id="waterAmount"
                  type="number"
                  placeholder="250"
                  value={waterAmount}
                  onChange={(e) => setWaterAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="waterGoal">Daily Goal (ml)</Label>
                <Input
                  id="waterGoal"
                  type="number"
                  placeholder="2000"
                  value={waterGoal}
                  onChange={(e) => setWaterGoal(e.target.value)}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Logging..." : "Log Water"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="sleep">
            <form onSubmit={handleSubmitSleep} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sleepDuration">Duration (hours) *</Label>
                <Input
                  id="sleepDuration"
                  type="number"
                  step="0.5"
                  placeholder="8"
                  value={sleepDuration}
                  onChange={(e) => setSleepDuration(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sleepNotes">Notes</Label>
                <Input
                  id="sleepNotes"
                  placeholder="Quality, interruptions, etc."
                  value={sleepNotes}
                  onChange={(e) => setSleepNotes(e.target.value)}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Logging..." : "Log Sleep"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
