import { Skeleton } from "@/components/ui/skeleton";

const TabSectionLoading = () => (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full rounded-xl" />
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-[400px] rounded-xl" />
      ))}
    </div>
  </div>
);

export default TabSectionLoading; 