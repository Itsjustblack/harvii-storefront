"use client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";

const Title = ({ title, description, visibleButton = true, href = "", buttonLabel = "View all" }) => {
	return (
		<div className="flex items-center justify-between flex-wrap gap-x-4 gap-y-3">
			<div className="flex flex-col gap-2">
				<h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-primary w-fit">
					{title}
				</h2>
				<p className="text-sm text-slate-500">{description}</p>
			</div>
			{visibleButton && (
				<Link
					href={href}
					className="flex items-center gap-1.5 text-sm font-semibold bg-transparent hover:bg-(--primary) shrink-0 border py-2.5 px-4 sm:py-3 sm:px-6 text-(--primary) hover:text-white rounded-full transition-colors duration-150 ease-out ml-auto"
				>
					{buttonLabel} <ArrowRight size={14} />
				</Link>
			)}
		</div>
	);
};

export default Title;
