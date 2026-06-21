"use client";

/**
 * Reads the real variant schema saved by the merchant dashboard:
 * variant_metadata.variant_groups = [{ name, key, type, required, options?, price_adjustment?, ... }]
 */

export function computePriceAdjustment(variantGroups, selections = {}) {
	if (!variantGroups) return 0;
	let delta = 0;
	for (const group of variantGroups) {
		const val = selections[group.key];
		if (val == null || val === "") continue;
		if (group.type === "select") {
			const opt = (group.options || []).find((o) => o.value === val);
			if (opt?.price_adjustment) delta += Number(opt.price_adjustment);
		} else if (group.type === "boolean") {
			if (val === true && group.price_adjustment)
				delta += Number(group.price_adjustment);
		} else if (group.type === "range") {
			const num = Number(val);
			if (!Number.isNaN(num) && group.price_per_unit)
				delta += num * Number(group.price_per_unit);
		}
	}
	return delta;
}

// Cheapest guaranteed price across required select groups — used for "From ₦X" display.
export function getMinPriceAdjustment(variantGroups) {
	if (!variantGroups) return 0;
	let total = 0;
	for (const group of variantGroups) {
		if (
			group.type === "select" &&
			group.required &&
			Array.isArray(group.options) &&
			group.options.length > 0
		) {
			const pool = group.options.filter((o) => o.available !== false);
			const candidates = pool.length > 0 ? pool : group.options;
			total += Math.min(
				...candidates.map((o) => Number(o.price_adjustment) || 0),
			);
		}
	}
	return total;
}

// Human-readable list of current selections, e.g. [{ name: 'Size', display: 'Large' }]
export function formatVariantSelections(variantGroups, selections = {}) {
	if (!variantGroups) return [];
	const result = [];
	for (const group of variantGroups) {
		const val = selections[group.key];
		if (val == null || val === "" || val === false) continue;
		if (group.type === "select") {
			const opt = (group.options || []).find((o) => o.value === val);
			result.push({ name: group.name, display: opt?.label || val });
		} else if (group.type === "boolean") {
			if (val === true) result.push({ name: group.name, display: "Yes" });
		} else if (group.type === "range") {
			result.push({
				name: group.name,
				display: `${val}${group.unit ? " " + group.unit : ""}`,
			});
		} else if (group.type === "text") {
			result.push({ name: group.name, display: val });
		}
	}
	return result;
}

export function getMissingRequiredGroups(variantGroups, selections = {}) {
	if (!variantGroups) return [];
	return variantGroups.filter((g) => {
		if (!g.required) return false;
		const val = selections[g.key];
		if (g.type === "select") return val == null || val === "";
		if (g.type === "text")
			return !val || (g.min_length && val.length < g.min_length);
		if (g.type === "range") return val == null || val === "";
		return false;
	});
}

function SelectGroup({ group, value, onChange, hasError }) {
	return (
		<div>
			<div className="flex items-center gap-1.5 mb-3.25 text-base">
				<span className="font-semibold text-black text-[15px]">
					{group.name}
				</span>
				{group.required && (
					<span className="text-red-500 font-bold h-fit">*</span>
				)}
			</div>
			<div className="flex flex-wrap gap-2.75">
				{(group.options || [])
					.filter((opt) => opt.available !== false)
					.map((opt) => {
						const isSelected = value[group.key] === opt.value;
						return (
							<button
								key={opt.value}
								type="button"
								onClick={() => onChange(group.key, opt.value)}
								className={`flex items-center gap-1.5 px-4 py-2 text-[15px] font-medium rounded-full border-[1.5px] transition ${
									isSelected
										? "border-primary bg-primary text-white"
										: "border-primary/40 text-black hover:border-primary"
								}`}
							>
								<span>{opt.label}</span>
								{!!opt.price_adjustment && (
									<span
										className={isSelected ? "text-white/70" : "text-black/70"}
									>
										- ₦{Number(opt.price_adjustment).toLocaleString()}
									</span>
								)}
							</button>
						);
					})}
			</div>
			{hasError && (
				<p className="text-[13px] text-red-500 mt-1">
					Please select a {group.name.toLowerCase()} before continuing.
				</p>
			)}
		</div>
	);
}

function AddonsGroup({ groups, value, onChange }) {
	return (
		<div>
			<div className="flex items-center gap-1.5 mb-3.5">
				<p className="text-base font-semibold text-[#1A1D29]">Add-ons</p>
				<p className="text-sm text-primary/80">
					- Optional extras for your order
				</p>
			</div>
			<div className="flex flex-col gap-2.5">
				{groups.map((group) => {
					const checked = !!value[group.key];
					return (
						<button
							key={group.key}
							type="button"
							role="switch"
							aria-checked={checked}
							onClick={() => onChange(group.key, !checked)}
							className={`flex items-center justify-between gap-3 w-full px-4 py-3 rounded-xl border-[1.5px] transition ${
								checked
									? "border-primary bg-primary/5"
									: "border-primary/40 bg-white"
							}`}
						>
							<span className="flex flex-col items-start gap-1">
								<span className="flex items-center gap-2">
									<span className="text-[15px] font-semibold text-[#1A1D29]">
										{group.name}
									</span>
									{checked && (
										<span className="inline-flex items-center gap-1 bg-primary text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
											<svg
												width="11"
												height="11"
												viewBox="0 0 24 24"
												fill="none"
												stroke="#fff"
												strokeWidth="3.4"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<path d="M20 6L9 17l-5-5"></path>
											</svg>
											Added
										</span>
									)}
								</span>
								{group.price_adjustment > 0 && (
									<span className="text-[14px] font-semibold text-primary font-primary">
										₦{Number(group.price_adjustment).toLocaleString()}
									</span>
								)}
							</span>
							<span
								className={`w-11 h-6 rounded-full shrink-0 relative transition ${checked ? "bg-primary" : "bg-slate-200"}`}
							>
								<span
									className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
										checked ? "translate-x-5" : ""
									}`}
								/>
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}

function TextGroup({ group, value, onChange, hasError }) {
	const current = value[group.key] || "";
	const maxLength = group.max_length || 200;
	return (
		<div>
			<p className="text-[15px] font-semibold text-black">
				{group.name}
				{group.required && <span className="text-primary ml-1">*</span>}
			</p>
			<div className="relative mt-3">
				<textarea
					rows={3}
					value={current}
					maxLength={maxLength}
					onChange={(e) => onChange(group.key, e.target.value)}
					placeholder={group.placeholder || `e.g. ${group.name.toLowerCase()}`}
					className="w-full resize-none border-[1.5px] border-primary/40 bg-white rounded-lg px-4 py-3.75 text-[15px] text-black outline-none focus:border-primary transition"
				/>
				<span className="absolute right-3.5 -bottom-5.5 text-xs text-primary/70 font-primary">
					{current.length}/{maxLength}
				</span>
			</div>
			{hasError && (
				<p className="text-[13px] text-red-500 mt-1">
					{current.length === 0
						? `${group.name} is required.`
						: `${group.name} must be at least ${group.min_length} characters.`}
				</p>
			)}
		</div>
	);
}

function RangeGroup({ group, value, onChange, hasError }) {
	const current = value[group.key];

	const handleRangeChange = (e) => {
		const raw = e.target.value;
		if (raw === "") {
			onChange(group.key, "");
			return;
		}
		let num = Number(raw);
		if (Number.isNaN(num)) return;
		if (group.min != null) num = Math.max(group.min, num);
		if (group.max != null) num = Math.min(group.max, num);
		onChange(group.key, String(num));
	};

	return (
		<div>
			<div className="flex items-center gap-1.5 mb-3">
				<span className="text-[15px] font-semibold text-[#1A1D29]">
					{group.name}
				</span>
				{group.required && (
					<span className="text-red-500 font-bold h-fit">*</span>
				)}
			</div>
			<div className="flex items-center gap-3">
				<input
					type="number"
					min={group.min}
					max={group.max}
					value={current ?? ""}
					onChange={handleRangeChange}
					placeholder={`${group.min ?? ""}–${group.max ?? ""}`}
					className="w-32.5 border-[1.5px] border-[#E8E5DF] bg-white rounded-lg px-4 py-3.5 text-[14.5px] text-[#1A1D29] outline-none focus:border-primary transition"
				/>
				{group.unit && (
					<span className="text-[15px] font-medium text-primary/70">
						{group.unit}
					</span>
				)}
				{group.price_per_unit > 0 &&
					current !== undefined &&
					current !== "" && (
						<span className="inline-flex items-center gap-2 ml-1">
							<span className="text-[15px] text-[#CFCDC6] font-medium">=</span>
							<span className="font-primary font-bold text-xl tracking-wide text-primary">
								₦
								{(
									Number(current) * Number(group.price_per_unit)
								).toLocaleString()}
							</span>
						</span>
					)}
			</div>
			{group.price_per_unit > 0 && (
				<p className="mt-2.5 text-[12.5px] text-[#A8A6A0] font-medium">
					Charged at ₦{Number(group.price_per_unit).toLocaleString()} /{" "}
					{group.unit || "unit"}
				</p>
			)}
			{hasError && (
				<p className="text-[13px] text-red-500 mt-1">
					Please enter a value for {group.name.toLowerCase()}
					{group.min != null && group.max != null
						? ` (between ${group.min} and ${group.max}).`
						: "."}
				</p>
			)}
		</div>
	);
}

export default function VariantPicker({
	variantGroups,
	value = {},
	onChange,
	errors = [],
}) {
	if (!variantGroups || variantGroups.length === 0) return null;

	const handleChange = (key, val) => onChange({ ...value, [key]: val });

	const booleanGroups = variantGroups.filter((g) => g.type === "boolean");
	const typeOrder = { select: 0, range: 1, text: 2 };
	const otherGroups = variantGroups
		.filter((g) => g.type !== "boolean")
		.sort((a, b) => (typeOrder[a.type] ?? 99) - (typeOrder[b.type] ?? 99));

	return (
		<div className="flex flex-col gap-5 my-5">
			{otherGroups.map((group) => {
				const hasError = errors.includes(group.key);
				switch (group.type) {
					case "select":
						return (
							<SelectGroup
								key={group.key}
								group={group}
								value={value}
								onChange={handleChange}
								hasError={hasError}
							/>
						);
					case "range":
						return (
							<RangeGroup
								key={group.key}
								group={group}
								value={value}
								onChange={handleChange}
								hasError={hasError}
							/>
						);
					case "text":
						return (
							<TextGroup
								key={group.key}
								group={group}
								value={value}
								onChange={handleChange}
								hasError={hasError}
							/>
						);
					default:
						return null;
				}
			})}
			{booleanGroups.length > 0 && (
				<AddonsGroup
					groups={booleanGroups}
					value={value}
					onChange={handleChange}
				/>
			)}
		</div>
	);
}
