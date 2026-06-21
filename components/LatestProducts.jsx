"use client";
import { useEffect, useState } from "react";
import Title from "./Title";
import ProductCard from "./ProductCard";
import { ProductGridSkeleton } from "./Skeleton";
import { useStorefront } from "@/context/StorefrontContext";
import { getProducts } from "@/lib/api";

const LatestProducts = () => {
	const { slug } = useStorefront();
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getProducts(slug, { page_size: 8 })
			.then((data) => setProducts(data.items || []))
			.catch(() => {})
			.finally(() => setLoading(false));
	}, [slug]);

	if (loading) {
		return (
			<div className="my-16 max-w-7xl mx-auto">
				<ProductGridSkeleton
					count={8}
					className="mt-12 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-10 justify-between"
				/>
			</div>
		);
	}

	if (products.length === 0) return null;

	return (
		<div className="my-16 max-w-7xl xl:mx-auto mx-6">
			<Title
				title="Latest Products"
				description={`Showing ${Math.min(products.length, 8)} products`}
				href="/shop"
			/>
			<div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 justify-between">
				{products.slice(0, 8).map((product) => (
					<ProductCard
						key={product.product_id}
						product={product}
					/>
				))}
			</div>
		</div>
	);
};

export default LatestProducts;
