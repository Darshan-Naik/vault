const VaultsSkeleton = () => {
  return (
    <ul className="space-y-1.5">
      {[...Array(6)].map((_, index) => (
        <li 
          key={index} 
          className="opacity-0 animate-fade-in"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50">
            {/* Icon skeleton */}
            <div className="flex-shrink-0 w-10 h-10 rounded-lg shimmer" />
            
            {/* Content skeleton */}
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded shimmer" />
              <div className="h-3 w-1/2 rounded shimmer" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default VaultsSkeleton;
