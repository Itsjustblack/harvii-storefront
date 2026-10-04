"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, Check, AlertCircle } from "lucide-react";
import VariantPicker, {
	computePriceAdjustment,
	getMissingRequiredGroups,
} from "./VariantPicker";

const PLACEHOLDER =
	"https://gocart-gs.vercel.app/_next/static/media/product_img4.60bc85fd.png";

export default function CartOptionsSheet({
	item,
	variantGroups,
	isOpen,
	onClose,
	onChange,
}) {
	const [mounted, setMounted] = useState(false);
	const [draftVariants, setDraftVariants] = useState(item?.variants || {});

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (isOpen) setDraftVariants(item?.variants || {});
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prevOverflow;
		};
	}, [isOpen]);

	if (!item || !mounted) return null;

	const imageUrl = item.image_url || PLACEHOLDER;
	const basePrice = Number(item.base_price ?? item.price);
	const adjustment = computePriceAdjustment(variantGroups, draftVariants);
	const unitPrice = basePrice + adjustment;
	const missingRequired = getMissingRequiredGroups(variantGroups, draftVariants);

	const handleDone = () => {
		onChange(draftVariants);
		onClose();
	};

	return createPortal(
		<div>
			{/* Backdrop */}
			<div
				aria-hidden="true"
				onClick={onClose}
				className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
					isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
				}`}
			/>
			{/* Side panel */}
			<div
				role="dialog"
				aria-modal="true"
				className={`fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-white overflow-y-auto will-change-transform transition-transform duration-300 ease-out ${
					isOpen ? "translate-x-0" : "translate-x-full"
				}`}
			>
				{/* Close */}
				<button
					onClick={onClose}
					aria-label="Close"
					className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
				>
					<X size={16} />
				</button>

				{/* Image */}
				<div className="m-5 mb-1 bg-[#F5F5F5] rounded-2xl flex items-center justify-center h-64 overflow-hidden">
					<Image
						src={imageUrl}
						alt={item.name}
						width={400}
						height={400}
						className="max-h-56 w-auto object-contain"
					/>
				</div>

				<div className="px-5 pb-10 pt-3">
					{/* Name + price */}
					<div className="flex items-start justify-between gap-3 mb-3">
						<h2 className="text-lg font-semibold text-slate-800 leading-snug">
							{item.name}
						</h2>
						<div className="text-right shrink-0">
							<p className="text-xl font-bold font-primary text-[var(--primary)]">
								₦{unitPrice.toLocaleString()}
							</p>
							{adjustment !== 0 && (
								<p className="text-xs text-slate-400 mt-0.5">
									base ₦{basePrice.toLocaleString()}
								</p>
							)}
						</div>
					</div>

					{/* Variants */}
					<VariantPicker
						variantGroups={variantGroups}
						value={draftVariants}
						onChange={setDraftVariants}
						errors={missingRequired.map((g) => g.key)}
					/>

					{missingRequired.length > 0 && (
						<div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2.5 mb-1">
							<AlertCircle size={14} className="shrink-0 mt-0.5" />
							<span>
								Choose {missingRequired.map((g) => g.name).join(", ")} to
								continue.
							</span>
						</div>
					)}
				</div>

				{/* Done — sticky footer */}
				<div className="sticky bottom-0 bg-white border-t border-slate-100 px-5 py-4">
					<button
						onClick={handleDone}
						className="w-full flex items-center justify-center gap-2 py-3.5 bg-[var(--primary)] text-white rounded-xl font-medium text-sm hover:opacity-90 active:scale-[0.98] transition"
					>
						<Check size={15} />
						Done
					</button>
				</div>
			</div>
		</div>,
		document.body,
	);
}
