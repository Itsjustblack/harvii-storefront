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

export function ProductDetailsSkeleton() {
	return (
		<div className="grid lg:grid-cols-[1.5fr_1.7fr] gap-12 animate-pulse">
			{/* Image gallery */}
			<div className="flex max-sm:flex-col-reverse gap-3 aspect-square h-full md:aspect-auto md:h-154">
				<div className="flex flex-col gap-3 shrink-0">
					{Array(4)
						.fill(0)
						.map((_, i) => (
							<div
								key={i}
								className="bg-slate-100 rounded-lg size-20 sm:size-24 shrink-0"
							/>
						))}
				</div>
				<div className="bg-slate-100 rounded-lg size-full" />
			</div>

			{/* Info */}
			<div className="flex-1">
				<div className="h-9 sm:h-11 lg:h-13 w-3/4 bg-slate-100 rounded-lg" />

				<div className="mt-4 pb-3.5 border-b border-slate-100">
					<div className="flex items-center justify-between gap-3">
						<div className="h-8 w-32 bg-slate-100 rounded-lg" />
						<div className="h-7 w-24 bg-slate-100 rounded-full" />
					</div>
					<div className="mt-4 space-y-2">
						<div className="h-3.5 w-20 bg-slate-100 rounded" />
						<div className="h-3.5 w-full max-w-lg bg-slate-100 rounded" />
						<div className="h-3.5 w-2/3 max-w-lg bg-slate-100 rounded" />
					</div>
				</div>

				{/* Variant picker */}
				<div className="mt-5 flex flex-col gap-2">
					<div className="h-4 w-16 bg-slate-100 rounded" />
					<div className="flex gap-2.75">
						<div className="h-10 w-20 bg-slate-100 rounded-full" />
						<div className="h-10 w-24 bg-slate-100 rounded-full" />
						<div className="h-10 w-20 bg-slate-100 rounded-full" />
					</div>
				</div>

				{/* Quantity + Add to Cart */}
				<div className="flex items-stretch gap-3.5 mt-7.5">
					<div className="h-13 w-32 bg-slate-100 rounded-xl shrink-0" />
					<div className="h-13 flex-1 bg-slate-100 rounded-xl" />
				</div>
			</div>
		</div>
	);
}
