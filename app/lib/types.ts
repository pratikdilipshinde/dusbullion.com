export type Metal = "GOLD" | "SILVER";
export type Form = "BAR" | "COIN";

export type Product = {
  id: string;
  sku: string;
  name: string;
  metal: Metal;
  form: Form;
  weightGrams: number;
  purity: string;      // "999.9"
  premiumUsd: number;  // flat premium
  brand?: string;      // e.g., PAMP, RCM
  country?: string;    // e.g., CH/CA/US
  image: string;       // /products/xxx.jpg
  inStock: boolean;
};
