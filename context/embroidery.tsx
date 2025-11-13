import createContextHook from "@nkzw/create-context-hook";
import { useState, useCallback, useMemo } from "react";
import { EmbroideryResult, EmbroideryStyle, EmbroideryCategory } from "@/types/embroidery";

export const [EmbroideryProvider, useEmbroidery] = createContextHook(() => {
  const [results, setResults] = useState<EmbroideryResult[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<EmbroideryStyle>("cross-stitch");
  const [selectedCategory, setSelectedCategory] = useState<EmbroideryCategory>("image");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});

  const addResult = useCallback((result: EmbroideryResult) => {
    setResults((prev) => [result, ...prev]);
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  const updateFilter = useCallback((filterType: string, value: string) => {
    setSelectedFilters((prev) => ({ ...prev, [filterType]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedFilters({});
  }, []);

  return useMemo(() => ({
    results,
    selectedStyle,
    setSelectedStyle,
    selectedCategory,
    setSelectedCategory,
    selectedFilters,
    updateFilter,
    clearFilters,
    addResult,
    clearResults,
  }), [results, selectedStyle, selectedCategory, selectedFilters, updateFilter, clearFilters, addResult, clearResults]);
});
