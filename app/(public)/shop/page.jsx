"use client";
import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { X, SlidersHorizontal, ChevronDown } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/Skeleton";
import { useStorefront } from "@/context/StorefrontContext";
import { getProducts } from "@/lib/api";
import { useCategories, useTags } from "@/lib/queries";

const PAGE_SIZE = 12;

function CategoryDropdown({ categories, category, onSelect }) {
	const [open, setOpen] = useState(false);
	const ref = useRef(null);

	useEffect(() => {
		const handler = (e) => {
			if (ref.current && !ref.current.contains(e.target)) setOpen(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	return (
		<div
			className="relative"
			ref={ref}
		>
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="w-full flex items-center justify-between gap-2 border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white text-slate-700 hover:border-slate-400 transition"
			>
				<span className="truncate">{category || "All categories"}</span>
				<ChevronDown
					size={16}
					className={`text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
				/>
			</button>
			{open && (
				<div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-30 max-h-72 overflow-y-auto">
					<button
						type="button"
						onClick={() => {
							onSelect("");
							setOpen(false);
						}}
						className={`w-full text-left px-4 py-2.5 text-sm transition ${
							!category
								? "text-[var(--primary)] font-medium bg-[var(--primary)]/5"
								: "text-slate-600 hover:bg-slate-50"
						}`}
					>
						All categories
					</button>
					{categories.map((cat) => (
						<button
							type="button"
							key={cat}
							onClick={() => {
								onSelect(cat);
								setOpen(false);
							}}
							className={`w-full text-left px-4 py-2.5 text-sm transition ${
								category === cat
									? "text-[var(--primary)] font-medium bg-[var(--primary)]/5"
									: "text-slate-600 hover:bg-slate-50"
							}`}
						>
							{cat}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

function FilterDrawer({
	isOpen,
	onClose,
	availableTags,
	initialTags,
	initialMinPrice,
	initialMaxPrice,
	onApply,
}) {
	const [draftTags, setDraftTags] = useState(initialTags);
	const [draftMin, setDraftMin] = useState(initialMinPrice);
	const [draftMax, setDraftMax] = useState(initialMaxPrice);

	useEffect(() => {
		if (isOpen) {
			setDraftTags(initialTags);
			setDraftMin(initialMinPrice);
			setDraftMax(initialMaxPrice);
		}
	}, [isOpen, initialTags, initialMinPrice, initialMaxPrice]);

	useEffect(() => {
		if (!isOpen) return;
		const onKey = (e) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [isOpen, onClose]);

	useEffect(() => {
		document.body.style.overflow = isOpen ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	const toggleTag = (tag) => {
		setDraftTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
		);
	};

	const handleApply = () => {
		onApply({ tags: draftTags, minPrice: draftMin, maxPrice: draftMax });
		onClose();
	};

	const handleClear = () => {
		setDraftTags([]);
		setDraftMin("");
		setDraftMax("");
	};

	return (
		<>
			<div
				aria-hidden="true"
				onClick={onClose}
				className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
					isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
				}`}
			/>
			<div
				role="dialog"
				aria-modal="true"
				className={`fixed inset-x-0 bottom-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md z-50 bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85dvh] overflow-y-auto transition-all duration-300 ease-out ${
					isOpen
						? "translate-y-0 sm:scale-100 sm:opacity-100"
						: "translate-y-full sm:scale-95 sm:opacity-0 sm:pointer-events-none"
				}`}
			>
				<div className="flex justify-center pt-3 pb-2 sticky top-0 bg-white z-10 sm:hidden">
					<div className="w-10 h-1 rounded-full bg-slate-200" />
				</div>
				<button
					onClick={onClose}
					aria-label="Close"
					className="absolute top-3 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
				>
					<X size={16} />
				</button>

				<div className="px-5 pb-8 pt-4 sm:pt-6">
					<h2 className="text-lg font-semibold text-slate-800 mb-5">Filters</h2>

					<div className="mb-6">
						<p className="text-sm font-medium text-slate-700 mb-2">
							Price range
						</p>
						<div className="flex items-center gap-3">
							<input
								type="number"
								min="0"
								placeholder="Min ₦"
								value={draftMin}
								onChange={(e) => setDraftMin(e.target.value)}
								className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)] transition"
							/>
							<span className="text-slate-400">–</span>
							<input
								type="number"
								min="0"
								placeholder="Max ₦"
								value={draftMax}
								onChange={(e) => setDraftMax(e.target.value)}
								className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)] transition"
							/>
						</div>
					</div>

					{availableTags.length > 0 && (
						<div className="mb-2">
							<p className="text-sm font-medium text-slate-700 mb-2">Tags</p>
							<div className="flex flex-wrap gap-2">
								{availableTags.map((tag) => {
									const active = draftTags.includes(tag);
									return (
										<button
											key={tag}
											type="button"
											onClick={() => toggleTag(tag)}
											className={`px-3.5 py-1.5 text-sm rounded-full border capitalize transition ${
												active
													? "border-[var(--primary)] bg-[var(--primary)] text-white"
													: "border-slate-200 text-slate-600 hover:border-slate-400"
											}`}
										>
											{tag}
										</button>
									);
								})}
							</div>
						</div>
					)}

					<div className="flex gap-3 mt-8">
						<button
							onClick={handleClear}
							className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition"
						>
							Clear
						</button>
						<button
							onClick={handleApply}
							className="flex-1 py-3 bg-[var(--primary)] text-white rounded-xl font-medium text-sm hover:opacity-90 transition"
						>
							Apply Filters
						</button>
					</div>
				</div>
			</div>
		</>
	);
}

function ShopContent() {
	const { slug } = useStorefront();
	const searchParams = useSearchParams();
	const router = useRouter();

	const [products, setProducts] = useState([]);
	const { data: categories = [] } = useCategories(slug);
	const { data: availableTags = [] } = useTags(slug);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(true);
	const [filterOpen, setFilterOpen] = useState(false);

	const q = searchParams.get("q") || "";
	const category = searchParams.get("category") || "";
	const tags = searchParams.getAll("tags");
	const minPrice = searchParams.get("min_price") || "";
	const maxPrice = searchParams.get("max_price") || "";

	const fetchProducts = useCallback(
		async (pageNum) => {
			setLoading(true);
			try {
				const data = await getProducts(slug, {
					q: q || undefined,
					category: category || undefined,
					tags: tags.length > 0 ? tags : undefined,
					minPrice: minPrice || undefined,
					maxPrice: maxPrice || undefined,
					page: pageNum,
					page_size: PAGE_SIZE,
				});
				if (pageNum === 1) {
					setProducts(data.items || []);
				} else {
					setProducts((prev) => [...prev, ...(data.items || [])]);
				}
				setTotal(data.total || 0);
			} catch {}
			setLoading(false);
		},
		[slug, q, category, tags.join(","), minPrice, maxPrice],
	);

	useEffect(() => {
		setPage(1);
		fetchProducts(1);
	}, [fetchProducts]);

	const loadMore = () => {
		const next = page + 1;
		setPage(next);
		fetchProducts(next);
	};

	const setFilter = (key, val) => {
		const params = new URLSearchParams(searchParams);
		if (val) params.set(key, val);
		else params.delete(key);
		router.push(`/shop?${params}`);
	};

	const applyDrawerFilters = ({
		tags: newTags,
		minPrice: newMin,
		maxPrice: newMax,
	}) => {
		const params = new URLSearchParams(searchParams);
		params.delete("tags");
		newTags.forEach((t) => params.append("tags", t));
		if (newMin) params.set("min_price", newMin);
		else params.delete("min_price");
		if (newMax) params.set("max_price", newMax);
		else params.delete("max_price");
		router.push(`/shop?${params}`);
	};

	const hasMore = products.length < total;
	const hasAnyFilter = q || category || tags.length > 0 || minPrice || maxPrice;
	const activeFilterCount =
		tags.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0);

	return (
		<div className="min-h-screen mx-6 text-slate-800">
			<div className="max-w-7xl mx-auto py-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-2xl font-semibold">
						{category ? category : q ? `Results for "${q}"` : "All Products"}
					</h1>
					{!loading && (
						<p className="text-sm text-slate-400 mt-1">
							{total} {total === 1 ? "product" : "products"}
						</p>
					)}
				</div>

				{/* Category — custom dropdown on mobile so it doesn't eat vertical space */}
				{categories.length > 0 && (
					<div className="sm:hidden mb-4">
						<CategoryDropdown
							categories={categories}
							category={category}
							onSelect={(cat) => setFilter("category", cat)}
						/>
					</div>
				)}

				{/* Category — pills on desktop */}
				{categories.length > 0 && (
					<div className="flex flex-wrap gap-2 mb-8">
						<button
							onClick={() => setFilter("category", "")}
							className={`px-4 py-1.5 rounded-full text-sm border transition ${
								!category
									? "bg-(--primary) text-white border-(--primary)"
									: "border-slate-200 text-slate-600 hover:border-slate-400"
							}`}
						>
							All
						</button>
						{[...categories]
							.sort((a, b) => b.length - a.length)
							.map((cat) => (
								<button
									key={cat}
									onClick={() => setFilter("category", cat)}
									className={`px-4 py-1.5 rounded-full text-sm border transition ${
										category === cat
											? "bg-[var(--primary)] text-white border-(--primary)"
											: "border-slate-200 text-slate-600 hover:border-slate-400"
									}`}
								>
									{cat}
								</button>
							))}
					</div>
				)}

				{/* Filters button + clear-all */}
				<div className="flex items-center gap-2 mb-8">
					<button
						onClick={() => setFilterOpen(true)}
						className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm border border-slate-200 text-slate-600 hover:border-slate-400 transition"
					>
						<SlidersHorizontal size={14} />
						Filters
						{activeFilterCount > 0 && (
							<span className="ml-0.5 bg-[var(--primary)] text-white text-[10px] rounded-full size-4 flex items-center justify-center">
								{activeFilterCount}
							</span>
						)}
					</button>
					{/* {hasAnyFilter && (
						<button
							onClick={() => router.push("/shop")}
							className="flex items-center gap-1 px-4 py-1.5 rounded-full text-sm border border-red-200 text-red-400 hover:bg-red-50 transition"
						>
							<X size={12} /> Clear all
						</button>
					)} */}
				</div>

				{/* Grid */}
				{loading && products.length === 0 ? (
					<ProductGridSkeleton
						count={PAGE_SIZE}
						className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
					/>
				) : products.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-32 text-slate-400">
						<p className="text-5xl mb-4">🔍</p>
						<p className="text-xl font-medium text-slate-600">
							No products found
						</p>
						<p className="text-sm mt-2">
							Try a different search or browse all products
						</p>
						<button
							onClick={() => router.push("/shop")}
							className="mt-6 px-6 py-2 bg-[var(--primary)] text-white rounded-full text-sm hover:opacity-90 transition"
						>
							Browse all
						</button>
					</div>
				) : (
					<>
						<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
							{products.map((product) => (
								<ProductCard
									key={product.product_id}
									product={product}
								/>
							))}
						</div>
						{hasMore && (
							<div className="flex justify-center mt-12">
								<button
									onClick={loadMore}
									disabled={loading}
									className="px-8 py-3 border border-slate-200 rounded-full text-sm text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
								>
									{loading ? "Loading…" : "Load more"}
								</button>
							</div>
						)}
					</>
				)}
			</div>

			<FilterDrawer
				isOpen={filterOpen}
				onClose={() => setFilterOpen(false)}
				availableTags={availableTags}
				initialTags={tags}
				initialMinPrice={minPrice}
				initialMaxPrice={maxPrice}
				onApply={applyDrawerFilters}
			/>
		</div>
	);
}

export default function Shop() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center text-slate-400">
					Loading…
				</div>
			}
		>
			<ShopContent />
		</Suspense>
	);
}
