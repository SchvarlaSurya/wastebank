export type WasteCategory = "anorganik" | "organik" | "khusus";

export interface WasteItem {
  id: string;
  name: string;
  category: WasteCategory;
  pricePerKg: number;
}

export const wasteCatalog: WasteItem[] = [
  { id: "plastic", name: "Plastik Campur", category: "anorganik", pricePerKg: 4200 },
  { id: "paper", name: "Kertas dan Kardus", category: "anorganik", pricePerKg: 2800 },
  { id: "metal", name: "Logam Ringan", category: "anorganik", pricePerKg: 7600 },
  { id: "organic", name: "Sisa Organik Kering", category: "organik", pricePerKg: 1700 },
  { id: "battery", name: "Baterai Rumah Tangga", category: "khusus", pricePerKg: 9800 },
  { id: "electronics", name: "Elektronik Kecil", category: "khusus", pricePerKg: 13200 },
];

export const categoryLabel: Record<WasteCategory, string> = {
  anorganik: "Anorganik",
  organik: "Organik",
  khusus: "Khusus",
};
