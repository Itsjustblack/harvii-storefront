import { Hanken_Grotesk, Sora } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { headers } from "next/headers";
import StoreProvider from "@/app/StoreProvider";
import TanctackQueryProvider from "@/providers/TanctackQueryProvider";
import { StorefrontProvider } from "@/context/StorefrontContext";
import ThemeInjector from "@/components/ThemeInjector";
import { getStorefrontConfig } from "@/lib/api";
import { DEV_SLUG } from "@/lib/env";
import "./globals.css";

const secondary = Hanken_Grotesk({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-secondary",
});
const primary = Sora({
	subsets: ["latin"],
	weight: ["500", "600", "700", "800"],
	variable: "--font-primary",
});

export async function generateMetadata() {
	const slug = await getSlug();
	try {
		const config = await getStorefrontConfig(slug);
		return {
			title: config.seo_title || config.store_name || "Harvii Store",
			description: config.seo_description || config.tagline || "",
			icons: config.favicon_url ? { icon: config.favicon_url } : {},
		};
	} catch {
		return { title: "Harvii Store" };
	}
}

async function getSlug() {
	try {
		const h = await headers();
		return h.get("x-slug") || DEV_SLUG;
	} catch {
		return DEV_SLUG;
	}
}

export default async function RootLayout({ children }) {
	const slug = await getSlug();

	let config = null;
	try {
		config = await getStorefrontConfig(slug);
	} catch {
		// Config unavailable — allow pages to render with null config
	}

	return (
		<html lang="en">
			<body
				className={`${secondary.variable} ${primary.variable} font-secondary antialiased`}
			>
				<TanctackQueryProvider>
					<StoreProvider>
						<StorefrontProvider
							config={config}
							slug={slug}
						>
							<ThemeInjector primaryColor={config?.primary_color} />
							{children}
							<Toaster position="top-center" />
						</StorefrontProvider>
					</StoreProvider>
				</TanctackQueryProvider>
			</body>
		</html>
	);
}
