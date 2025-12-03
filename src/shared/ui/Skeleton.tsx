import { cn } from '@/shared'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse bg-gray-200 dark:bg-gray-700 rounded', className)} />
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="px-6 py-4 text-left">
                <Skeleton className="h-4 w-24" />
              </th>
              <th className="px-6 py-4 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
              <th className="px-6 py-4 text-left">
                <Skeleton className="h-4 w-24" />
              </th>
              <th className="px-6 py-4 text-left">
                <Skeleton className="h-4 w-32" />
              </th>
              <th className="px-6 py-4 text-left">
                <Skeleton className="h-4 w-28" />
              </th>
              <th className="px-6 py-4 text-left">
                <Skeleton className="h-4 w-24" />
              </th>
              <th className="px-6 py-4 text-right">
                <Skeleton className="h-4 w-16 ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-4">
                  <Skeleton className="h-5 w-40" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-28" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-36" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-28" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
