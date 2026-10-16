import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { getStorefrontConfig } from "@/lib/api";
import { DEV_SLUG } from "@/lib/env";
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomTabBar from "@/components/BottomTabBar";
import AIChat from "@/components/AIChat";

async function getSlug() {
	try {
		const h = await headers();
		return h.get("x-slug") || DEV_SLUG;
	} catch {
		return DEV_SLUG;
	}
}

export default async function StorefrontLayout({ children }) {
	const slug = await getSlug();

	let config = null;
	try {
		config = await getStorefrontConfig(slug);
	} catch (err) {
		if (err?.status === 404) {
			notFound();
		}
		// Other errors (network, 5xx) — proceed with null config rather than taking the whole site down
	}

	if (config && !config.is_published) {
		const params = new URLSearchParams();
		params.set("store", config.store_name || "");
		const brandIcon = config.brand_assets?.icon?.urls?.png192 || config.logo_url;
		if (brandIcon) params.set("logo", brandIcon);
		redirect(`/coming-soon?${params}`);
	}

	return (
		<>
			<Banner />
			<Navbar />
			<main>{children}</main>
			<Footer />
			{/* Reserves room so the fixed bottom tab bar never covers the footer on phones */}
			<div
				className="md:hidden"
				aria-hidden="true"
				style={{ height: "calc(4rem + env(safe-area-inset-bottom))" }}
			/>
			<BottomTabBar />
			<AIChat />
		</>
	);
}
