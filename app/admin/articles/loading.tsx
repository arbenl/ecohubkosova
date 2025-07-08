export default function AdminArticlesLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-96 animate-pulse" />
      </div>

      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-80 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-60 animate-pulse" />
              </div>
              <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
              <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
