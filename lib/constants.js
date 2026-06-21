export const FIAT_CURRENCY_SYMBOLS = {
	NGN: "₦",
	USD: "$",
	EUR: "€",
	GBP: "£",
	JPY: "¥",
	CAD: "CA$",
	GHS: "GH₵",
	KES: "KSh",
	ZAR: "R",
};

export const CRYPTO_CURRENCY_SYMBOLS = {
	USDT: "₮",
	USDC: "$",
	DAI: "◈",
};

export const CURRENCY_SYMBOLS = {
	...FIAT_CURRENCY_SYMBOLS,
	...CRYPTO_CURRENCY_SYMBOLS,
};
