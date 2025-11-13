export type EmbroideryResult = {
  id: string;
  title: string;
  thumbnail?: string;
  createdAt?: string;
  tags?: string[];
  metadata?: Record<string, any>;
};

export type EmbroideryStyle = "cross-stitch" | "satin" | "running" | "other";
export type EmbroideryCategory = "image" | "text" | "pattern" | "other";
