export function ProductSkeleton() {
	return (
		<div className="flex flex-col">
			<div className="bg-slate-100 h-40 sm:h-68 rounded-lg animate-pulse" />
			<div className="pt-2 flex items-center justify-between gap-2">
				<div className="h-4 w-2/3 bg-slate-100 rounded animate-pulse" />
				<div className="h-4 w-12 shrink-0 bg-slate-100 rounded animate-pulse" />
			</div>
			<div className="h-3 w-1/3 bg-slate-100 rounded mt-2 animate-pulse" />
		</div>
	);
}

export function ProductGridSkeleton({
	count = 8,
	className = "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-10",
}) {
	return (
		<div className={className}>
			{Array(count)
				.fill(0)
				.map((_, i) => (
					<ProductSkeleton key={i} />
				))}
		</div>
	);
}
