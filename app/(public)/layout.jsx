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
		if (config.logo_url) params.set("logo", config.logo_url);
		redirect(`/coming-soon?${params}`);
	}

	return (
		<>
			<Banner />
			<Navbar />
			<BottomTabBar />
			<main>{children}</main>
			<Footer />
			<AIChat />
		</>
	);
}
