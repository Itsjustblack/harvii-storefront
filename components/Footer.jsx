"use client";
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";
import { useStorefront } from "@/context/StorefrontContext";
import { HARVII_MARKETING_URL } from "@/lib/env";

export default function Footer() {
	const { config } = useStorefront();
	const storeName = config?.store_name || "Harvii Store";
	const logoUrl = config?.logo_url;
	const tagline =
		config?.tagline ||
		"Serving the best, every single time. Fresh meals and everyday essentials, delivered.";
	const social = config?.social_links || {};
	const year = new Date().getFullYear();

	const wordmark = storeName.endsWith(".")
		? storeName.slice(0, -1)
		: storeName;
	const wordmarkAccent = storeName.endsWith(".") ? "." : "";

	const socialLinks = [
		social.facebook && { href: social.facebook, Icon: Facebook },
		social.instagram && { href: social.instagram, Icon: Instagram },
		social.twitter && { href: social.twitter, Icon: Twitter },
	].filter(Boolean);

	const contactLinks = [
		config?.contact_email && {
			text: config.contact_email,
			href: `mailto:${config.contact_email}`,
			Icon: Mail,
		},
		config?.contact_phone && {
			text: config.contact_phone,
			href: `tel:${config.contact_phone.replace(/\s+/g, "")}`,
			Icon: Phone,
		},
		config?.contact_address && {
			text: config.contact_address,
			Icon: MapPin,
		},
	].filter(Boolean);

	const navLinks = [
		{ text: "Home", path: "/" },
		{ text: "Shop", path: "/shop" },
		{ text: "Track Order", path: "/track" },
		contactLinks.length > 0 && { text: "Contact", path: "/contact" },
	].filter(Boolean);

	return (
		<footer className="mt-10">
			<div className="max-w-330 mx-auto px-6 sm:px-10 pt-16 pb-7.5">
				<div className="grid grid-cols-1 sm:grid-cols-[1.6fr_1fr_1.2fr] gap-10 pb-12 border-b border-slate-200">
					<div>
						{logoUrl ? (
							<Image
								src={logoUrl}
								alt={storeName}
								width={120}
								height={40}
								className="object-contain max-h-10"
							/>
						) : (
							<p className="font-primary font-extrabold text-[28px] tracking-[-0.04em] text-(--primary)">
								{wordmark}
								<span className="text-(--primary)">{wordmarkAccent}</span>
							</p>
						)}
						<p className="font-secondary text-[15px] leading-[1.65] text-slate-500 mt-4 mb-6 max-w-[34ch]">
							{tagline}
						</p>
						{socialLinks.length > 0 && (
							<div className="flex items-center gap-3">
								{socialLinks.map(({ href, Icon }, i) => (
									<a
										key={i}
										href={href}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center justify-center w-10.5 h-10.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition text-slate-500"
									>
										<Icon size={20} strokeWidth={1.8} />
									</a>
								))}
							</div>
						)}
					</div>

					<div>
						<h4 className="font-secondary font-bold text-[13px] tracking-[0.14em] uppercase text-slate-500 mb-5">
							Explore
						</h4>
						<div className="flex flex-col gap-3.5">
							{navLinks.map((link, i) => (
								<Link
									key={i}
									href={link.path}
									className="font-secondary text-[15px] text-slate-600 hover:text-slate-900 transition"
								>
									{link.text}
								</Link>
							))}
						</div>
					</div>

					{contactLinks.length > 0 && (
						<div>
							<h4 className="font-secondary font-bold text-[13px] tracking-[0.14em] uppercase text-slate-500 mb-5">
								Contact
							</h4>
							<div className="flex flex-col gap-3.5">
								{contactLinks.map(({ text, href, Icon }, i) =>
									href ? (
										<a
											key={i}
											href={href}
											className="flex items-center gap-3 font-secondary text-[15px] text-slate-600 hover:text-slate-900 transition"
										>
											<Icon size={18} strokeWidth={1.7} className="text-slate-400 shrink-0" />
											{text}
										</a>
									) : (
										<div
											key={i}
											className="flex items-center gap-3 font-secondary text-[15px] text-slate-600"
										>
											<Icon size={18} strokeWidth={1.7} className="text-slate-400 shrink-0" />
											{text}
										</div>
									)
								)}
							</div>
						</div>
					)}
				</div>

				<div className="flex items-center justify-between gap-4 flex-wrap pt-6">
					<span className="font-secondary text-[13.5px] text-slate-400">
						© {year} {storeName}. Powered by{" "}
						<a
							href={HARVII_MARKETING_URL}
							target="_blank"
							rel="noopener noreferrer"
							className="text-slate-500 hover:text-slate-700 transition"
						>
							Harvii
						</a>
					</span>
					<div className="flex gap-6">
						<Link
							href="/privacy"
							className="font-secondary text-[13.5px] text-slate-400 hover:text-slate-700 transition"
						>
							Privacy
						</Link>
						<Link
							href="/terms"
							className="font-secondary text-[13.5px] text-slate-400 hover:text-slate-700 transition"
						>
							Terms
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
