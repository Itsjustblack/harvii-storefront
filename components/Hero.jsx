"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, LayoutGrid, Star } from "lucide-react";
import { useStorefront } from "@/context/StorefrontContext";
import CategoriesMarquee from "./CategoriesMarquee";

const Hero = () => {
	const { config } = useStorefront();

	const heroImageUrl = config?.hero_image_url;
	const tagline = config?.tagline || config?.store_name || "Shop the best";

	return (
		<div className="mx-6">
			<div className="flex max-xl:flex-col gap-5 max-w-7xl mx-auto my-10">
				{/* Main hero panel */}
				<div className="relative flex-1 flex flex-col justify-end min-h-96 sm:min-h-130 rounded-[26px] p-8 sm:p-14 sm:pb-13 overflow-hidden bg-primary">
					{heroImageUrl && (
						<Image
							src={heroImageUrl}
							alt="Hero"
							fill
							className="object-cover opacity-60"
							priority
						/>
					)}
					{/* <div className="absolute -top-20 -right-15 w-75 h-75 rounded-full bg-[radial-gradient(circle,rgba(94,14,27,0.55),transparent_70%)]" />
					<div className="absolute -bottom-30 left-[30%] w-90 h-90 rounded-full bg-[radial-gradient(circle,rgba(94,14,27,0.28),transparent_70%)]" /> */}

					<span className="relative font-secondary font-semibold text-[13px] tracking-[0.32em] text-primary-foreground/55 uppercase">
						New Collection
					</span>
					<h1 className="relative font-primary font-extrabold text-4xl sm:text-6xl lg:text-[64px] leading-[1.05] sm:leading-[1.02] tracking-[-0.03em] text-primary-foreground mt-4.5 mb-8.5 uppercase">
						{tagline}
					</h1>
					<Link
						href="/shop"
						className="relative self-start inline-flex items-center gap-3 font-secondary font-semibold text-base text-primary-foreground bg-primary-foreground/15 py-3.75 px-7.5 rounded-full hover:bg-primary-foreground hover:text-primary active:scale-95 transition w-fit"
					>
						Shop Now{" "}
						<ArrowRightIcon
							size={18}
							strokeWidth={2}
						/>
					</Link>
				</div>

				{/* CTA cards */}
				<div className="flex flex-col gap-6 w-full xl:max-w-sm">
					<Link
						href="/shop"
						className="relative flex-1 flex flex-col justify-between min-h-59 rounded-[26px] py-8.5 px-8 overflow-hidden bg-accent hover:bg-accent-hover transition"
					>
						<div className="absolute -top-10 -right-7.5 w-37.5 h-37.5 rounded-full bg-accent-foreground/6" />
						<div className="relative">
							<div className="flex items-center justify-center w-11.5 h-11.5 rounded-[13px] bg-accent-foreground/12 mb-5.5">
								<LayoutGrid
									size={22}
									strokeWidth={1.8}
									className="text-accent-foreground"
								/>
							</div>
							<h3 className="font-primary font-bold text-[23px] tracking-[-0.02em] text-accent-foreground mb-1.75">
								Browse Products
							</h3>
							<p className="font-secondary text-[14.5px] leading-[1.5] text-accent-foreground/65">
								Explore our full catalogue
							</p>
						</div>
						<span className="relative inline-flex items-center gap-2 mt-5 font-secondary font-semibold text-[14.5px] text-accent-foreground">
							Shop now{" "}
							<ArrowRightIcon
								size={16}
								strokeWidth={2}
							/>
						</span>
					</Link>
					<Link
						href="/shop?featured=true"
						className="relative flex-1 flex flex-col justify-between min-h-59 rounded-[26px] py-8.5 px-8 overflow-hidden bg-accent-tint border border-accent-tint-border hover:border-accent transition"
					>
						<div className="relative">
							<div className="flex items-center justify-center w-11.5 h-11.5 rounded-[13px] bg-accent/10 mb-5.5">
								<Star
									size={22}
									strokeWidth={1.8}
									className="text-accent"
								/>
							</div>
							<h3 className="font-primary font-bold text-[23px] tracking-[-0.02em] text-[#1A1D29] mb-1.75">
								Most Popular
							</h3>
							<p className="font-secondary text-[14.5px] leading-[1.5] text-[#8A8273]">
								Our best-selling items
							</p>
						</div>
						<span className="relative inline-flex items-center gap-2 mt-5 font-secondary font-semibold text-[14.5px] text-accent">
							View all{" "}
							<ArrowRightIcon
								size={16}
								strokeWidth={2}
							/>
						</span>
					</Link>
				</div>
			</div>

			{/* <CategoriesMarquee /> */}
		</div>
	);
};

export default Hero;
