interface FormSkeletonProps {
  fieldsCount?: number;
  columns?: 1 | 2 | 3 | 4;
  showTitle?: boolean;
}

export function FormSkeleton({
  fieldsCount = 9,
  columns = 3,
  showTitle = true,
}: FormSkeletonProps) {
  const gridColsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div className="p-6 space-y-6 animate-pulse w-full bg-white rounded-lg shadow-sm border border-gray-100">
      {/* Title Placeholder */}
      {showTitle && (
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="h-7 w-52 bg-gray-200 rounded-md"></div>
          <div className="h-9 w-24 bg-gray-200 rounded-md"></div>
        </div>
      )}

      {/* Inputs Grid Placeholder */}
      <div className={`grid ${gridColsClass} gap-6`}>
        {Array.from({ length: fieldsCount }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2">
            {/* Label line */}
            <div className="h-4 w-28 bg-gray-200 rounded"></div>
            {/* Input field box */}
            <div className="h-10 w-full bg-gray-200 rounded-md"></div>
          </div>
        ))}
      </div>

      {/* Button Placeholder */}
      <div className="flex justify-start gap-3 pt-4 border-t border-gray-100">
        <div className="h-10 w-24 bg-gray-200 rounded-md"></div>
        <div className="h-10 w-32 bg-gray-200 rounded-md"></div>
      </div>
    </div>
  );
}
