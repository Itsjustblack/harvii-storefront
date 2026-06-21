"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, ShoppingBag } from "lucide-react";
import QuickAddSheet from "./QuickAddSheet";
import { getMinPriceAdjustment } from "./VariantPicker";

const PLACEHOLDER =
	"https://gocart-gs.vercel.app/_next/static/media/product_img4.60bc85fd.png";

const ProductCard = ({ product }) => {
	const [sheetOpen, setSheetOpen] = useState(false);
	const imageUrl = product.image_url || product.images?.[0] || PLACEHOLDER;
	const isOutOfStock = product.in_stock === false;
	const minAdjustment = getMinPriceAdjustment(
		product.variant_metadata?.variant_groups,
	);

	return (
		<Link
			href={`/product/${product.product_id}`}
			className={`group flex flex-col gap-3 w-full max-w-90 mx-auto ${isOutOfStock && "pointer-events-none opacity-70"}`}
			tabIndex={isOutOfStock ? -1 : undefined}
		>
			<div className="relative bg-[#F4F5F6] h-40 sm:h-68 rounded-lg flex items-center justify-center overflow-hidden">
				<Image
					width={500}
					height={500}
					className="max-h-30 sm:max-h-40 w-auto group-hover:scale-105 transition duration-300 object-contain"
					src={imageUrl}
					alt={product.name}
				/>
				{product.category && (
					<div className="absolute bottom-3 left-2 flex items-center gap-2 bg-white/80 backdrop-blur-sm font-medium px-2 py-0.5 rounded-full">
						<div className="size-1.5 rounded-full bg-(--primary)"></div>
						<p className="text-xs leading-4">{product.category}</p>
					</div>
				)}
				{isOutOfStock && (
					<div className="absolute inset-0 bg-white/70 flex items-center justify-center">
						<span className="bg-slate-700 text-white text-xs font-medium px-3 py-1 rounded-full">
							Out of Stock
						</span>
					</div>
				)}
				{product.storefront_featured && !isOutOfStock && (
					<span className="absolute top-2 left-2 bg-(--primary) text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
						Featured
					</span>
				)}
				{product.product_type === "composite" && !isOutOfStock && (
					<span className="absolute top-2 right-2 bg-slate-800/90 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
						Bundle
					</span>
				)}
				{/* {!isOutOfStock && (
					<button
						onClick={() => setSheetOpen(true)}
						aria-label="Quick add to cart"
						className="absolute bottom-3 right-3 z-10 size-9 rounded-full bg-(--primary) text-white flex items-center justify-center hover:opacity-90 active:scale-90 transition"
					>
						<Plus
							size={14}
							strokeWidth={2.5}
						/>
					</button>
				)} */}
			</div>

			<div className="flex items-center justify-between gap-2">
				<p className="min-w-0 flex-1 truncate font-semibold text-[15px] leading-4.5 text-[#1A1A1A]">
					{product.name}
				</p>
				<p className="shrink-0 font-semibold text-[15px] leading-4.5 text-(--primary) font-primary">
					{/* {fromPrice && (
							<span className="text-slate-400 font-normal mr-0.5">From</span>
						)} */}
					₦ {(Number(product.price) + minAdjustment).toLocaleString()}
				</p>
			</div>
			{/* {product.category && (
					<p className="text-[13px] leading-4 text-[#767D8A] mt-1">
						{product.category}
					</p>
				)} */}

			{/* <QuickAddSheet
				product={product}
				isOpen={sheetOpen}
				onClose={() => setSheetOpen(false)}
			/> */}
		</Link>
	);
};

export default ProductCard;
