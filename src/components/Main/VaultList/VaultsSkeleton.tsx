import { Skeleton } from "@/components/ui/skeleton";

const VaultsSkeleton = () => {
  return (
    <>
      {[...Array(5)].map((_, index) => (
        <li key={index} className="mb-2">
          <Skeleton className="h-8 w-full" />
        </li>
      ))}
    </>
  );
};

export default VaultsSkeleton;
