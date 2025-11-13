export type EmbroideryStyle = "cross-stitch" | "satin" | "running" | "french-knot";

export type EmbroideryCategory = "image" | "logo" | "font" | "tattoo";

export type FilterType = "style" | "color" | "complexity" | "size";

export interface CategoryFilter {
  id: string;
  label: string;
  type: FilterType;
  options: string[];
}

export interface EmbroideryResult {
  id: string;
  imageUri: string;
  category: EmbroideryCategory;
  style: EmbroideryStyle;
  timestamp: number;
  originalImageUri?: string;
  filters?: {
    style?: string;
    color?: string;
    complexity?: string;
    size?: string;
  };
}
