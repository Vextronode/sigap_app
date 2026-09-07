import React from "react";

interface AlertTableSkeletonProps {
  rowCount?: number;
}

export const AlertTableSkeleton: React.FC<AlertTableSkeletonProps> = ({
  rowCount = 4,
}) => {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, idx) => (
        <tr
          key={`skeleton-${idx}`}
          className="animate-pulse border-b border-slate-100 bg-white"
        >
          <td className="py-4 px-4 sm:px-6">
            <div className="h-4 w-28 bg-slate-200 rounded-sm mb-1.5" />
            <div className="h-3 w-16 bg-slate-100 rounded-sm" />
          </td>
          <td className="py-4 px-4">
            <div className="h-6 w-16 bg-slate-200 rounded-full" />
          </td>
          <td className="py-4 px-4">
            <div className="h-4 w-28 bg-slate-200 rounded-sm" />
          </td>
          <td className="py-4 px-4">
            <div className="h-4 w-48 bg-slate-200 rounded-sm" />
          </td>
          <td className="py-4 px-4">
            <div className="h-6 w-24 bg-slate-200 rounded-full" />
          </td>
          <td className="py-4 px-4 sm:px-6 text-right">
            <div className="h-7 w-20 bg-slate-200 rounded-lg ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );
};
