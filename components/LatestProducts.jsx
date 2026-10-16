"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Title from "./Title";
import ProductCard from "./ProductCard";
import { ProductGridSkeleton } from "./Skeleton";
import { useStorefront } from "@/context/StorefrontContext";
import { getProducts } from "@/lib/api";

const LatestProducts = () => {
	const { slug } = useStorefront();
	const [products, setProducts] = useState([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getProducts(slug, { page_size: 8 })
			.then((data) => {
				setProducts(data.items || []);
				setTotal(Number(data.total) || (data.items || []).length);
			})
			.catch(() => {})
			.finally(() => setLoading(false));
	}, [slug]);

	if (loading) {
		return (
			<div className="my-16 mx-6">
				<div className="max-w-7xl mx-auto">
					<ProductGridSkeleton
						count={8}
						className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 justify-between"
					/>
				</div>
			</div>
		);
	}

	if (products.length === 0) return null;
	const shown = products.slice(0, 8);

	return (
		<div className="my-16 mx-6">
			<div className="max-w-7xl mx-auto">
				<Title
					title="Latest Products"
					description={
						total > shown.length
							? `Showing ${shown.length} of ${total} products`
							: `${shown.length} product${shown.length === 1 ? "" : "s"}`
					}
					href="/shop"
					buttonLabel={total > shown.length ? `Shop all ${total}` : "View all"}
				/>
				<div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 justify-between">
					{shown.map((product) => (
						<ProductCard
							key={product.product_id}
							product={product}
						/>
					))}
				</div>
				{total > shown.length && (
					<Link
						href="/shop"
						className="mt-10 flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 active:scale-[0.99]"
					>
						Browse all {total} products <ArrowRight size={16} />
					</Link>
				)}
			</div>
		</div>
	);
};

export default LatestProducts;
