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
          className="animate-pulse border-b border-[color:var(--border)] bg-[color:var(--surface)]"
        >
          <td className="py-4 px-3 sm:px-4 text-center">
            <div className="h-4 w-5 bg-[color:var(--surface-muted)] rounded-sm mx-auto" />
          </td>
          <td className="py-4 px-4 sm:px-6">
            <div className="h-4 w-28 bg-[color:var(--surface-muted)] rounded-sm mb-1.5" />
            <div className="h-3 w-16 bg-[color:var(--surface-muted)]/70 rounded-sm" />
          </td>
          <td className="py-4 px-4">
            <div className="h-6 w-16 bg-[color:var(--surface-muted)] rounded-full" />
          </td>
          <td className="py-4 px-4">
            <div className="h-4 w-28 bg-[color:var(--surface-muted)] rounded-sm" />
          </td>
          <td className="py-4 px-4">
            <div className="h-4 w-48 bg-[color:var(--surface-muted)] rounded-sm" />
          </td>
          <td className="py-4 px-4">
            <div className="h-4 w-32 bg-[color:var(--surface-muted)] rounded-sm mb-1" />
            <div className="h-3 w-20 bg-[color:var(--surface-muted)]/70 rounded-sm" />
          </td>
          <td className="py-4 px-4">
            <div className="h-6 w-24 bg-[color:var(--surface-muted)] rounded-full" />
          </td>
          <td className="py-4 px-4 sm:px-6 text-right">
            <div className="h-7 w-20 bg-[color:var(--surface-muted)] rounded-lg ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );
};
