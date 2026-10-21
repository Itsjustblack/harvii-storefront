import { ImageOff } from "lucide-react";

// Shown wherever a product has no picture yet. Fills its parent; `compact` hides the words for small thumbnails.
export default function NoPhoto({ compact = false, className = "" }) {
	return (
		<div
			role="img"
			aria-label="No photo yet"
			className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-slate-400 ${className}`}
		>
			<ImageOff size={compact ? 18 : 32} strokeWidth={1.5} />
			{!compact && <span className="text-xs font-medium">No photo yet</span>}
		</div>
	);
}
