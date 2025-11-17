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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function HabitCreationForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [challengeLength, setChallengeLength] = useState<number | undefined>(30);
  const [color, setColor] = useState("#8b5cf6");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createHabit = useMutation((api as any).habits.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Please enter a habit name");
      return;
    }

    setIsSubmitting(true);
    try {
      await createHabit({
        name: name.trim(),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        frequency,
        challengeLength,
        startDate: Date.now(),
        color,
      });

      toast.success("Habit created successfully!");
      
      // Reset form
      setName("");
      setDescription("");
      setCategory("");
      setFrequency("daily");
      setChallengeLength(30);
      setColor("#8b5cf6");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to create habit");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const colorOptions = [
    { value: "#8b5cf6", label: "Purple" },
    { value: "#10b981", label: "Green" },
    { value: "#3b82f6", label: "Blue" },
    { value: "#f59e0b", label: "Orange" },
    { value: "#ef4444", label: "Red" },
    { value: "#ec4899", label: "Pink" },
    { value: "#14b8a6", label: "Teal" },
    { value: "#06b6d4", label: "Cyan" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300"
          size="lg"
        >
          <Plus className="h-5 w-5" />
          Create New Habit
          <Sparkles className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-2 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Create New Habit
          </DialogTitle>
          <DialogDescription className="text-base">
            Start tracking a new habit. Set your goals and watch your progress grow!
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Habit Name */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
          >
            <Label htmlFor="name" className="text-sm font-semibold">
              Habit Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Morning Exercise, Read Daily"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-2 focus:border-primary transition-colors"
              required
            />
          </motion.div>

          {/* Description */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <Label htmlFor="description" className="text-sm font-semibold">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="What does this habit involve?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-2 focus:border-primary transition-colors min-h-20"
              rows={3}
            />
          </motion.div>

          {/* Category and Frequency Row */}
          <motion.div 
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.15 }}
          >
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-semibold">
                Category
              </Label>
              <Input
                id="category"
                placeholder="e.g., Health, Learning"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border-2 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency" className="text-sm font-semibold">
                Frequency
              </Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Challenge Length and Color Row */}
          <motion.div 
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
          >
            <div className="space-y-2">
              <Label htmlFor="challengeLength" className="text-sm font-semibold">
                Challenge Length (days)
              </Label>
              <Input
                id="challengeLength"
                type="number"
                min="1"
                max="365"
                placeholder="30"
                value={challengeLength || ""}
                onChange={(e) => setChallengeLength(e.target.value ? parseInt(e.target.value) : undefined)}
                className="border-2 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color" className="text-sm font-semibold">
                Color Theme
              </Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger className="border-2">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border-2" 
                        style={{ backgroundColor: color }}
                      />
                      {colorOptions.find(c => c.value === color)?.label}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border-2" 
                          style={{ backgroundColor: option.value }}
                        />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Preview Card */}
          <motion.div 
            className="p-4 rounded-lg border-2 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.25 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm text-muted-foreground">Preview</h4>
              <div 
                className="px-3 py-1 rounded-full text-xs font-semibold text-white shadow-md"
                style={{ backgroundColor: color }}
              >
                {frequency}
              </div>
            </div>
            <h3 className="font-bold text-lg mb-1">{name || "Your Habit Name"}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description || "Your habit description will appear here"}
            </p>
            {challengeLength && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs font-semibold text-primary">
                  {challengeLength} Day Challenge
                </p>
              </div>
            )}
          </motion.div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-4 w-4" />
                  </motion.div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Habit
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
