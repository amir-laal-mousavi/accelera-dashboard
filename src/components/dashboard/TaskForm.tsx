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

interface TaskFormProps {
  task?: {
    _id: Id<"tasks">;
    task: string;
    status: string;
    priority: string;
    area: string;
    scheduled?: number;
    deadline?: number;
    notes?: string;
  };
}

export function TaskForm({ task }: TaskFormProps) {
  const [open, setOpen] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [status, setStatus] = useState("Not Started");
  const [priority, setPriority] = useState("Medium");
  const [area, setArea] = useState("Work");
  const [scheduled, setScheduled] = useState("");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when task prop changes or dialog opens
  useEffect(() => {
    if (task && open) {
      setTaskName(task.task);
      setStatus(task.status);
      setPriority(task.priority);
      setArea(task.area);
      setScheduled(task.scheduled ? new Date(task.scheduled).toISOString().split('T')[0] : "");
      setDeadline(task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : "");
      setNotes(task.notes || "");
    } else if (!task && open) {
      // Reset for new task
      setTaskName("");
      setStatus("Not Started");
      setPriority("Medium");
      setArea("Work");
      setScheduled("");
      setDeadline("");
      setNotes("");
    }
  }, [task, open]);

  const createTask = useMutation(api.tasks.create);
  const updateTask = useMutation(api.tasks.update);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskName.trim()) {
      toast.error("Please enter a task name");
      return;
    }

    setIsSubmitting(true);
    try {
      if (task) {
        await updateTask({
          id: task._id,
          task: taskName.trim(),
          status: status as any,
          priority: priority as any,
          area: area as any,
          scheduled: scheduled ? new Date(scheduled).getTime() : undefined,
          deadline: deadline ? new Date(deadline).getTime() : undefined,
          notes: notes.trim() || undefined,
        });
        toast.success("Task updated successfully!");
      } else {
        await createTask({
          task: taskName.trim(),
          status: status as any,
          priority: priority as any,
          area: area as any,
          scheduled: scheduled ? new Date(scheduled).getTime() : undefined,
          deadline: deadline ? new Date(deadline).getTime() : undefined,
          notes: notes.trim() || undefined,
        });
        toast.success("Task created successfully!");
      }
      
      setOpen(false);
      if (!task) {
        setTaskName("");
        setStatus("To Do");
        setPriority("Medium");
        setArea("Personal");
        setScheduled("");
        setDeadline("");
        setNotes("");
      }
    } catch (error) {
      toast.error(`Failed to ${task ? "update" : "create"} task`);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {task ? (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update your task details" : "Add a new task to track"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taskName">Task Name *</Label>
            <Input
              id="taskName"
              placeholder="e.g., Complete project report"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">Area</Label>
            <Select value={area} onValueChange={setArea}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Work">Work</SelectItem>
                <SelectItem value="Study">Study</SelectItem>
                <SelectItem value="Programming">Programming</SelectItem>
                <SelectItem value="Fitness">Fitness</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Book">Book</SelectItem>
                <SelectItem value="Studying">Studying</SelectItem>
                <SelectItem value="Self">Self</SelectItem>
                <SelectItem value="Research">Research</SelectItem>
                <SelectItem value="Startup">Startup</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled">Scheduled Date</Label>
              <Input
                id="scheduled"
                type="date"
                value={scheduled}
                onChange={(e) => setScheduled(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : task ? "Update Task" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
