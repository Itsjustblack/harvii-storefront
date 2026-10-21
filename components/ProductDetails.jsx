"use client";
import NoPhoto from "./NoPhoto";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { ShoppingCart, Check, Minus, Plus } from "lucide-react";
import VariantPicker, {
	computePriceAdjustment,
	getMinPriceAdjustment,
	getMissingRequiredGroups,
} from "./VariantPicker";
import BundleContents from "./BundleContents";
import ShareButton from "./ShareButton";
import { addToCart, buildCartKey } from "@/lib/features/cart/cartSlice";
import { formatPrice } from '@/lib/money'
import { notifyAddedToCart } from '@/lib/notifyAddedToCart'


const ProductDetails = ({ product }) => {
	const dispatch = useDispatch();
	const router = useRouter();

	const allImages = [
		...(product.image_url ? [product.image_url] : []),
		...(product.images || []),
	].filter((v, i, arr) => arr.indexOf(v) === i);

	const [mainImage, setMainImage] = useState(allImages[0] || "");
	const [variants, setVariants] = useState({});
	const [added, setAdded] = useState(false);
	const [qty, setQty] = useState(1);
	const addRowRef = useRef(null);
	const [mainButtonOffscreen, setMainButtonOffscreen] = useState(false);
	const [footerVisible, setFooterVisible] = useState(false);
	const showStickyBar = mainButtonOffscreen && !footerVisible;

	// On phones, keep the buy button in reach once the main one scrolls away.
	useEffect(() => {
		const el = addRowRef.current;
		if (!el || typeof IntersectionObserver === "undefined") return;
		const observer = new IntersectionObserver(
			([entry]) => setMainButtonOffscreen(!entry.isIntersecting),
			{ rootMargin: "0px 0px -72px 0px" },
		);
		observer.observe(el);
		const footer = document.querySelector("footer");
		let footerObserver;
		if (footer) {
			footerObserver = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting));
			footerObserver.observe(footer);
		}
		return () => {
			observer.disconnect();
			footerObserver?.disconnect();
		};
	}, []);

	const variantGroups = product.variant_metadata?.variant_groups;
	const basePrice = Number(product.price);
	const priceAdjustment = computePriceAdjustment(variantGroups, variants);
	const displayPrice = basePrice + priceAdjustment;
	const minAdjustment = getMinPriceAdjustment(variantGroups);
	const missingRequired = getMissingRequiredGroups(variantGroups, variants);

	const cartKey = buildCartKey(product.product_id, variants);
	const inCart = useSelector((s) => !!s.cart.cartItems[cartKey]);
	const isOutOfStock = product.in_stock === false;

	const handleAddToCart = () => {
		if (inCart) {
			router.push("/cart");
			return;
		}
		dispatch(
			addToCart({
				product_id: product.product_id,
				quantity: qty,
				name: product.name,
				price: displayPrice,
				base_price: basePrice,
				currency: product.currency || "NGN",
				image_url: product.image_url || product.images?.[0] || "",
				variants,
				variant_metadata: product.variant_metadata || null,
			}),
		);
		setAdded(true);
		setTimeout(() => setAdded(false), 2000);
		notifyAddedToCart({
			name: product.name,
			imageUrl: product.image_url || product.images?.[0],
			quantity: qty,
			onViewCart: () => router.push("/cart"),
		});
	};

	return (
		<div className="grid lg:grid-cols-[1.5fr_1.7fr] gap-12">
			{/* Image gallery */}
			<div className="flex max-sm:flex-col-reverse gap-3 aspect-square h-full md:aspect-auto md:h-154">
				{allImages.length > 1 && (
					<div className="flex flex-col gap-3 overflow-y-auto shrink-0">
						{allImages.map((img, i) => (
							<button
								key={i}
								onClick={() => setMainImage(img)}
								className={`bg-black/5 flex items-center justify-center size-20 sm:size-24 rounded-lg shrink-0 border-2 transition ${
									mainImage === img ? "border-primary" : "border-transparent"
								}`}
							>
								<Image
									src={img}
									alt=""
									width={70}
									height={70}
									className="object-contain w-full h-full rounded-md"
								/>
							</button>
						))}
					</div>
				)}

				<div className="relative size-full bg-[#F4F5F6] rounded-lg overflow-hidden flex items-center justify-center">
					{mainImage ? (
						<div className="relative size-full">
							<Image
								src={mainImage}
								alt={product.name}
								fill
								sizes="(max-width: 1024px) 100vw, 50vw"
								className="object-contain p-3"
							/>
						</div>
					) : (
						<NoPhoto />
					)}
					{product.category && (
						<div className="absolute top-4 left-4 flex items-center gap-1.75 bg-white/90 backdrop-blur-sm px-3.25 py-1.75 rounded-full">
							<span className="size-1.5 rounded-full bg-primary"></span>
							<span className="text-xs font-semibold text-black/70">
								{product.category}
							</span>
						</div>
					)}
				</div>
			</div>

			{/* Info */}
			<div className="flex-1">
				{/* <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
					{product.category}
				</p> */}
				<div className="mb-3.5 flex items-start justify-between gap-3">
					<h1 className="font-primary font-bold text-4xl sm:text-5xl lg:text-[50px] tracking-[-0.035em] text-black break-words min-w-0">
						{product.name}
					</h1>
					<ShareButton
						title={product.name}
						text={`Check out ${product.name}`}
						className="mt-1.5"
					/>
				</div>

				<div className="mt-4 pb-3.5 border-b border-primary/20">
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-baseline gap-2.5">
							{missingRequired.length > 0 ? (
								<>
									{/* <span className="text-[15px] text-[#9A988F]">From</span> */}
									<span className="font-primary font-bold text-2xl sm:text-[28px] lg:text-[34px] tracking-[-0.02em] text-black">
										{formatPrice(basePrice + minAdjustment)}
									</span>
								</>
							) : (
								<>
									<span className="font-primary font-bold text-2xl sm:text-[28px] lg:text-[34px] tracking-[-0.02em] text-black">
										{formatPrice(displayPrice)}
									</span>
									{priceAdjustment !== 0 && (
										<span className="text-[13px] text-primary/60 self-center">
											incl. options
										</span>
									)}
								</>
							)}
						</div>

						{isOutOfStock ? (
							<span className="inline-flex items-center gap-1.75 px-3.5 py-1.75 bg-black/5 text-black/50 text-[13px] rounded-full font-semibold">
								<span className="size-1.75 rounded-full bg-black/30"></span>
								Out of Stock
							</span>
						) : (
							<span className="inline-flex items-center gap-1.75 px-3.5 py-1.75 bg-primary/10 text-primary text-[13px] rounded-full font-semibold">
								<span className="size-1.75 rounded-full bg-primary"></span>
								In Stock
							</span>
						)}
					</div>

					{product.description && (
						<div className="mt-4 text-primary">
							<h3 className="text-[15px] font-semibold mb-3">Description</h3>
							<p className="mt-3.5 text-base text-primary max-w-lg leading-relaxed whitespace-pre-line">
								{product.description}
							</p>
						</div>
					)}
				</div>

				{/* Variant picker */}
				{variantGroups && variantGroups.length > 0 && (
					<VariantPicker
						variantGroups={variantGroups}
						value={variants}
						onChange={setVariants}
					/>
				)}

				{/* {missingRequired.length > 0 && (
					<div className="flex items-start gap-2.75 mt-6.5 bg-primary/5 border border-primary/15 rounded-lg px-4 py-3.5">
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="var(--primary)"
							strokeWidth="1.8"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="shrink-0 mt-0.25"
						>
							<circle
								cx="12"
								cy="12"
								r="9"
							></circle>
							<path d="M12 8h.01M11 12h1v4h1"></path>
						</svg>
						<span className="text-[13.5px] leading-[1.5] text-black/70">
							No {missingRequired.map((g) => g.name.toLowerCase()).join(", ")}{" "}
							picked yet — you can add this to your cart now and choose your{" "}
							{missingRequired.map((g, i) => (
								<span key={g.key}>
									{i > 0 && ", "}
									<strong className="text-primary">{g.name}</strong>
								</span>
							))}{" "}
							from the cart page.
						</span>
					</div>
				)} */}

				{product.product_type === "composite" && (
					<BundleContents
						components={product.composite_components}
						bundlePrice={basePrice}
						currency={product.currency}
					/>
				)}

				{/* Quantity + Add to Cart */}
				<div ref={addRowRef} className="flex items-stretch gap-3.5 mt-7.5">
					<div className="flex items-center gap-1 border-[1.5px] border-black/10 bg-white rounded-xl p-1">
						<button
							type="button"
							onClick={() => setQty((q) => Math.max(1, q - 1))}
							disabled={qty <= 1}
							aria-label="Decrease"
							className="size-10.5 rounded-[10px] flex items-center justify-center text-black bg-black/5 hover:bg-black/10 disabled:opacity-40 disabled:text-black/30 disabled:hover:bg-black/5 disabled:cursor-not-allowed transition active:scale-[0.96]"
						>
							<Minus
								size={16}
								strokeWidth={2.4}
							/>
						</button>
						<span className="min-w-9.5 text-center font-primary font-bold text-[15px] sm:text-[17px] lg:text-[17px] text-black">
							{qty}
						</span>
						<button
							type="button"
							onClick={() => setQty((q) => q + 1)}
							aria-label="Increase"
							className="size-10.5 rounded-[10px] flex items-center justify-center text-black bg-black/5 hover:bg-black/10 transition active:scale-[0.96]"
						>
							<Plus
								size={16}
								strokeWidth={2.4}
							/>
						</button>
					</div>
					<button
						onClick={handleAddToCart}
						disabled={isOutOfStock}
						className={`flex-1 flex items-center justify-center gap-2.75 rounded-xl px-7 font-semibold text-base transition active:scale-[0.99] ${
							isOutOfStock
								? "bg-primary/20 text-primary/50 cursor-not-allowed"
								: "bg-primary hover:bg-primary-hover text-white"
						}`}
					>
						{added ? (
							<>
								<Check size={18} /> Added!
							</>
						) : inCart ? (
							<>
								<ShoppingCart size={18} /> View Cart
							</>
						) : (
							<>
								<ShoppingCart size={18} /> Add to Cart · {formatPrice(displayPrice * qty)}
							</>
						)}
					</button>
				</div>
			</div>

			{/* Phones only: appears above the tab bar once the main button is off-screen */}
			<div
				className={`md:hidden fixed inset-x-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur transition-transform duration-200 ${
					showStickyBar && !isOutOfStock ? "translate-y-0" : "translate-y-full pointer-events-none"
				}`}
				style={{ bottom: "calc(4rem + env(safe-area-inset-bottom))" }}
				aria-hidden={!(showStickyBar && !isOutOfStock)}
			>
				<button
					type="button"
					onClick={handleAddToCart}
					tabIndex={showStickyBar && !isOutOfStock ? 0 : -1}
					className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-6 text-base font-semibold text-white transition active:scale-[0.99]"
				>
					{added ? (
						<><Check size={18} /> Added!</>
					) : inCart ? (
						<><ShoppingCart size={18} /> View Cart</>
					) : (
						<><ShoppingCart size={18} /> Add to Cart · {formatPrice(displayPrice * qty)}</>
					)}
				</button>
			</div>
		</div>
	);
};

export default ProductDetails;
