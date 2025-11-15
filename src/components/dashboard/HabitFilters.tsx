import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, SortAsc } from "lucide-react";

interface HabitFiltersProps {
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  categories: string[];
}

export function HabitFilters({
  categoryFilter,
  setCategoryFilter,
  sortBy,
  setSortBy,
  categories,
}: HabitFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-6 p-4 border-2 rounded-lg bg-card/50">
      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="border-2">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
        <SortAsc className="h-4 w-4 text-muted-foreground" />
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="border-2">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="streak">Longest Streak</SelectItem>
            <SelectItem value="completion">Completion Rate</SelectItem>
            <SelectItem value="date">Start Date (Newest)</SelectItem>
            <SelectItem value="date-old">Start Date (Oldest)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setCategoryFilter("all");
          setSortBy("name");
        }}
        className="gap-2"
      >
        <Filter className="h-4 w-4" />
        Reset
      </Button>
    </div>
  );
}
