export default function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-square w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-1/3 rounded-full" />
        <div className="skeleton h-4 w-full rounded-full" />
        <div className="skeleton h-4 w-2/3 rounded-full" />
        <div className="skeleton h-5 w-1/2 rounded-full mt-2" />
        <div className="skeleton h-10 w-full rounded-full mt-3" />
      </div>
    </div>
  )
}
