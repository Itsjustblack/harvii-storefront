"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, ShoppingBag } from "lucide-react";
import QuickAddSheet from "./QuickAddSheet";
import { getMinPriceAdjustment } from "./VariantPicker";
import { formatPrice } from '@/lib/money'

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
		<>
			<Link
				href={`/product/${product.product_id}`}
				className={`group flex flex-col gap-2.5 w-full max-w-90 mx-auto ${isOutOfStock && "pointer-events-none opacity-70"}`}
				tabIndex={isOutOfStock ? -1 : undefined}
			>
				<div className="relative bg-[#F4F5F6] aspect-square w-full rounded-lg overflow-hidden">
					{/* contain: the whole product is always visible, never cropped */}
					<Image
						fill
						sizes="(max-width: 640px) 50vw, 25vw"
						className="object-contain p-2"
						src={imageUrl}
						alt={product.name}
					/>
					{product.category && (
						<div className="absolute top-2 left-2 max-w-[70%] flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
							<span className="size-1.5 shrink-0 rounded-full bg-primary"></span>
							<span className="truncate text-[11px] font-semibold text-[#5C5A66]">
								{product.category}
							</span>
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
						<span className="absolute bottom-2 left-2 bg-primary text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
							Featured
						</span>
					)}
					{product.product_type === "composite" && !isOutOfStock && (
						<span className="absolute top-2 right-2 bg-slate-800/90 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
							Bundle
						</span>
					)}
					{!isOutOfStock && (
						<button
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								setSheetOpen(true);
							}}
							aria-label="Quick add to cart"
							className="absolute bottom-2 right-2 z-10 size-9 rounded-full bg-primary text-white flex items-center justify-center group/cart after:absolute after:p-8"
						>
							<Plus
								className="group-hover/cart:rotate-90 transition-transform duration-200"
								size={14}
								strokeWidth={2.5}
							/>
						</button>
					)}
				</div>

				{/* name wraps to two lines so it can be read in full; price sits on its own line */}
				<div className="flex flex-col gap-1">
					<p className="line-clamp-2 break-words font-medium text-[14px] sm:text-[15px] leading-5 text-[#1A1A1A]">
						{product.name}
					</p>
					<p className="font-semibold text-[15px] leading-5 text-slate-900 font-primary">
						{/* {fromPrice && (
								<span className="text-slate-400 font-normal mr-0.5">From</span>
							)} */}
						{formatPrice(Number(product.price) + minAdjustment)}
					</p>
				</div>
				{/* {product.category && (
						<p className="text-[13px] leading-4 text-[#767D8A] mt-1">
							{product.category}
						</p>
					)} */}
			</Link>

			<QuickAddSheet
				product={product}
				isOpen={sheetOpen}
				onClose={() => setSheetOpen(false)}
			/>
		</>
	);
};

export default ProductCard;
