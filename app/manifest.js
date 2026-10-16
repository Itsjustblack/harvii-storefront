import { headers } from "next/headers";
import { getStorefrontConfig } from "@/lib/api";
import { DEV_SLUG } from "@/lib/env";

// Lets "Add to Home Screen" on Android use the merchant's own icon and name.
export default async function manifest() {
	let slug = DEV_SLUG;
	try {
		slug = (await headers()).get("x-slug") || DEV_SLUG;
	} catch {}
	try {
		const config = await getStorefrontConfig(slug);
		const icon = config.brand_assets?.icon?.urls;
		return {
			name: config.store_name,
			short_name: config.store_name,
			start_url: "/",
			display: "standalone",
			background_color: "#ffffff",
			theme_color: config.primary_color || "#000000",
			icons: icon
				? [
						{ src: icon.png192, sizes: "192x192", type: "image/png" },
						{ src: icon.png512, sizes: "512x512", type: "image/png" },
					]
				: [],
		};
	} catch {
		return { name: "Harvii Store", start_url: "/" };
	}
}
