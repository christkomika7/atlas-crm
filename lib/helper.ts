import countries from "world-countries";

export const formatedCountries = countries.map((country, index) => {
    const frenchName = country.translations?.fra?.common;
    return {
        id: `${index}-${country.name.common}`,
        icon: country.flag,
        label: frenchName,
        value: country.name.common,
    };
});

export function getCountryFrenchName(name: string): string | undefined {
    const country = countries.find(
        (c) => c.name.common.toLowerCase() === name?.toLowerCase()
    );
    return country?.translations?.fra?.common;
}

/**
 * Renvoie l'URL d'un joli drapeau (PNG) depuis flagcdn.com.
 * @param countryName Nom du pays (en anglais, ex: "France", "Cameroon")
 * @returns L’URL de l’image du drapeau
 */
export function getFlagUrl(countryName: string): string | undefined {
    const country = countries.find(
        (c) => c.name.common.toLowerCase() === countryName.toLowerCase()
    );
    if (!country) return undefined;

    const code = country.cca2.toLowerCase(); // ex: "fr"
    return `https://flagcdn.com/w80/${code}.png`; // format PNG
}



export const currencies = [
    { id: 1, label: "Franc CFA BEAC (XAF)", value: "XAF", icon: "Fr" },
    { id: 2, label: "Franc CFA BCEAO (XOF)", value: "XOF", icon: "Fr" },
    { id: 3, label: "Dollar Américain (USD)", value: "USD", icon: "$" },
    { id: 4, label: "Euro (EUR)", value: "EUR", icon: "€" },
    { id: 5, label: "Livre Sterling (GBP)", value: "GBP", icon: "£" },
    { id: 6, label: "Yen Japonais (JPY)", value: "JPY", icon: "¥" },
    { id: 7, label: "Dollar Canadien (CAD)", value: "CAD", icon: "$" },
    { id: 8, label: "Franc Suisse (CHF)", value: "CHF", icon: "CHF" },
    { id: 9, label: "Yuan Chinois (CNY)", value: "CNY", icon: "¥" },
    { id: 10, label: "Dirham Marocain (MAD)", value: "MAD", icon: "DH" },
    { id: 11, label: "Naira Nigérian (NGN)", value: "NGN", icon: "₦" },
    { id: 12, label: "Rand Sud-Africain (ZAR)", value: "ZAR", icon: "R" },
    { id: 13, label: "Dinar Algérien (DZD)", value: "DZD", icon: "د.ج" },
    { id: 14, label: "Roupie Indienne (INR)", value: "INR", icon: "₹" },
    { id: 15, label: "Dinar Tunisien (TND)", value: "TND", icon: "د.ت" },
    { id: 16, label: "Franc Guinéen (GNF)", value: "GNF", icon: "FG" },
    { id: 17, label: "Shilling Kenyan (KES)", value: "KES", icon: "KSh" },
    { id: 18, label: "Dollar Australien (AUD)", value: "AUD", icon: "$" },
    { id: 19, label: "Couronne Suédoise (SEK)", value: "SEK", icon: "kr" },
    { id: 20, label: "Couronne Norvégienne (NOK)", value: "NOK", icon: "kr" },
    { id: 21, label: "Couronne Danoise (DKK)", value: "DKK", icon: "kr" },
    { id: 22, label: "Peso Mexicain (MXN)", value: "MXN", icon: "$" },
    { id: 23, label: "Real Brésilien (BRL)", value: "BRL", icon: "R$" },
    { id: 24, label: "Rouble Russe (RUB)", value: "RUB", icon: "₽" },
    { id: 25, label: "Won Sud-Coréen (KRW)", value: "KRW", icon: "₩" },
    { id: 26, label: "Dollar de Singapour (SGD)", value: "SGD", icon: "$" },
    { id: 27, label: "Ringgit Malaisien (MYR)", value: "MYR", icon: "RM" },
    { id: 28, label: "Baht Thaïlandais (THB)", value: "THB", icon: "฿" },
    { id: 29, label: "Riyal Saoudien (SAR)", value: "SAR", icon: "ر.س" },
    { id: 30, label: "Dirham des Émirats Arabes Unis (AED)", value: "AED", icon: "د.إ" },
];

