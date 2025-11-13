import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import { Scissors, Sparkles, Loader2, Settings, Download, Edit3, ImageIcon, Hexagon, Type, Sparkle } from "lucide-react-native";
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Sharing from "expo-sharing";

import Colors from "@/constants/colors";
import { useEmbroidery } from "@/context/embroidery";
import { EmbroideryStyle, EmbroideryCategory } from "@/types/embroidery";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width - 48;

const categories: { id: EmbroideryCategory; label: string; description: string; icon: any }[] = [
  { id: "image", label: "Image Embroidery", description: "Convert photos to embroidery", icon: ImageIcon },
  { id: "logo", label: "Logo Embroidery", description: "Brand and logo designs", icon: Hexagon },
  { id: "font", label: "Font Embroidery", description: "Text and typography", icon: Type },
  { id: "tattoo", label: "Tattoo Embroidery", description: "Tattoo-style patterns", icon: Sparkle },
];

const embroideryStyles: { id: EmbroideryStyle; label: string; description: string }[] = [
  { id: "cross-stitch", label: "Cross Stitch", description: "Classic pixelated pattern" },
  { id: "satin", label: "Satin Stitch", description: "Smooth, filled areas" },
  { id: "running", label: "Running Stitch", description: "Simple outline style" },
  { id: "french-knot", label: "French Knot", description: "Textured dot pattern" },
];

const filterOptions = {
  style: ["Modern", "Vintage", "Minimalist", "Ornate"],
  color: ["Monochrome", "Colorful", "Pastel", "Bold"],
  complexity: ["Simple", "Medium", "Detailed", "Intricate"],
  size: ["Small", "Medium", "Large", "Extra Large"],
};

export default function HomeScreen() {
  const router = useRouter();
  const { 
    selectedStyle, 
    setSelectedStyle, 
    selectedCategory, 
    setSelectedCategory,
    selectedFilters,
    updateFilter,
    addResult 
  } = useEmbroidery();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [processedImageId, setProcessedImageId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setProcessedImage(null);
      setProcessedImageId(null);
    }
  };

  const handleDownload = async () => {
    if (!processedImage) return;

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(processedImage, {
          dialogTitle: "Save or share your embroidery pattern",
        });
      } else {
        Alert.alert("Not Available", "Sharing is not available on this device");
      }
    } catch (error) {
      console.error("Error sharing image:", error);
      Alert.alert("Error", "Failed to share the image");
    }
  };

  const handleEdit = () => {
    if (!processedImageId) return;
    router.push(`/edit/${processedImageId}`);
  };

  const processImage = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);

    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      const categoryContext: Record<EmbroideryCategory, string> = {
        "image": "a photo or image",
        "logo": "a logo or brand design with clean lines and solid shapes",
        "font": "text or typography with decorative lettering",
        "tattoo": "a tattoo-style design with bold linework and artistic details",
      };

      const embroideryPrompts: Record<EmbroideryStyle, string> = {
        "cross-stitch": "Transform this image into a cross-stitch embroidery pattern with visible grid squares, pixelated effect, and typical cross-stitch colors. Make it look like a handmade cross-stitch craft with clear X-shaped stitches.",
        "satin": "Convert this image into a satin stitch embroidery pattern with smooth, filled areas, elegant shading, and glossy thread appearance. Make it look luxurious and refined with parallel stitch lines.",
        "running": "Transform this image into a running stitch embroidery pattern with simple continuous lines, outline style, and hand-stitched aesthetic. Use minimal, elegant linework.",
        "french-knot": "Convert this image into a French knot embroidery pattern with textured dot clusters, dimensional effect, and delicate knotted appearance. Create a stippled, tactile look.",
      };

      const filterContext = Object.entries(selectedFilters)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");

      const fullPrompt = `${embroideryPrompts[selectedStyle]} This is ${categoryContext[selectedCategory]}.${
        filterContext ? ` Style preferences: ${filterContext}.` : ""
      }`;

      const apiResponse = await fetch("https://toolkit.rork.com/images/edit/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          images: [{ type: "image", image: base64.split(",")[1] }],
          aspectRatio: "1:1",
        }),
      });

      if (!apiResponse.ok) {
        throw new Error("Failed to process image");
      }

      const data = await apiResponse.json();
      const processedUri = `data:${data.image.mimeType};base64,${data.image.base64Data}`;
      const imageId = Date.now().toString();
      
      setProcessedImage(processedUri);
      setProcessedImageId(imageId);
      addResult({
        id: imageId,
        imageUri: processedUri,
        category: selectedCategory,
        style: selectedStyle,
        timestamp: Date.now(),
        originalImageUri: selectedImage,
        filters: selectedFilters,
      });

      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={{flex: 1}} edges={["top"]}>
        <View style={styles.container}>
        <View style={styles.header}>
          <Scissors size={28} color={Colors.accent} strokeWidth={2} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Embroidery Studio</Text>
            <Text style={styles.subtitle}>AI-Powered Pattern Generator</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsButton}>
            <Settings size={24} color={Colors.text.secondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      selectedCategory === category.id && styles.categoryCardActive,
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.categoryIcon,
                      selectedCategory === category.id && styles.categoryIconActive,
                    ]}>
                      <IconComponent 
                        size={24} 
                        color={selectedCategory === category.id ? "#FFFFFF" : Colors.text.secondary} 
                        strokeWidth={2} 
                      />
                    </View>
                    <Text style={[
                      styles.categoryLabel,
                      selectedCategory === category.id && styles.categoryLabelActive,
                    ]}>
                      {category.label}
                    </Text>
                    <Text style={styles.categoryDescription}>{category.description}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.filtersSection}>
            <Text style={styles.sectionTitle}>Filters</Text>
            {Object.entries(filterOptions).map(([filterType, options]) => (
              <View key={filterType} style={styles.filterGroup}>
                <Text style={styles.filterLabel}>{filterType.charAt(0).toUpperCase() + filterType.slice(1)}</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterOptionsContainer}
                >
                  {options.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.filterChip,
                        selectedFilters[filterType] === option && styles.filterChipActive,
                      ]}
                      onPress={() => updateFilter(filterType, option)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.filterChipText,
                        selectedFilters[filterType] === option && styles.filterChipTextActive,
                      ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ))}
          </View>

          <View style={styles.imageSection}>
            {!selectedImage ? (
              <TouchableOpacity style={styles.uploadBox} onPress={pickImage} activeOpacity={0.7}>
                <View style={styles.uploadIcon}>
                  <Sparkles size={40} color={Colors.text.muted} strokeWidth={1.5} />
                </View>
                <Text style={styles.uploadText}>Select an Image</Text>
                <Text style={styles.uploadSubtext}>Tap to choose from your library</Text>
              </TouchableOpacity>
            ) : (
              <Animated.View style={[styles.imageContainer, { transform: [{ scale: scaleAnim }] }]}>
                <Image source={{ uri: processedImage || selectedImage }} style={styles.image} contentFit="cover" />
                {isProcessing && (
                  <View style={styles.processingOverlay}>
                    <View style={styles.processingCard}>
                      <ActivityIndicator size="large" color={Colors.accent} />
                      <Text style={styles.processingText}>Creating embroidery pattern...</Text>
                    </View>
                  </View>
                )}
              </Animated.View>
            )}
          </View>

          {selectedImage && (
            <>
              <View style={styles.stylesSection}>
                <Text style={styles.sectionTitle}>Embroidery Style</Text>
                <View style={styles.stylesGrid}>
                  {embroideryStyles.map((style) => (
                    <TouchableOpacity
                      key={style.id}
                      style={[
                        styles.styleCard,
                        selectedStyle === style.id && styles.styleCardActive,
                      ]}
                      onPress={() => setSelectedStyle(style.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.styleLabel,
                        selectedStyle === style.id && styles.styleLabelActive,
                      ]}>
                        {style.label}
                      </Text>
                      <Text style={styles.styleDescription}>{style.description}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.actions}>
                {processedImage ? (
                  <>
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleDownload}
                        activeOpacity={0.7}
                      >
                        <Download size={20} color={Colors.accent} strokeWidth={2} />
                        <Text style={styles.actionButtonText}>Download</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleEdit}
                        activeOpacity={0.7}
                      >
                        <Edit3 size={20} color={Colors.accent} strokeWidth={2} />
                        <Text style={styles.actionButtonText}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={pickImage}
                      activeOpacity={0.7}
                    >
                      <Sparkles size={20} color={Colors.accent} strokeWidth={2} />
                      <Text style={styles.secondaryButtonText}>Try Another Image</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={pickImage}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.secondaryButtonText}>Change Image</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.primaryButton, isProcessing && styles.buttonDisabled]}
                      onPress={processImage}
                      disabled={isProcessing}
                      activeOpacity={0.7}
                    >
                      {isProcessing ? (
                        <Loader2 size={20} color="#FFFFFF" strokeWidth={2} />
                      ) : (
                        <Scissors size={20} color="#FFFFFF" strokeWidth={2} />
                      )}
                      <Text style={styles.primaryButtonText}>
                        {isProcessing ? "Processing..." : "Generate Pattern"}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </>
          )}
        </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  imageSection: {
    marginBottom: 32,
  },
  uploadBox: {
    height: IMAGE_SIZE,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  uploadIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },
  uploadSubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  imageContainer: {
    height: IMAGE_SIZE,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: Colors.surface,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  processingCard: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    gap: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  processingText: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: Colors.text.primary,
  },
  stylesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  stylesGrid: {
    gap: 12,
  },
  styleCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  styleCardActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent,
  },
  styleLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  styleLabelActive: {
    color: "#FFFFFF",
  },
  styleDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  actions: {
    gap: 12,
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.accent,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  settingsButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.accent,
  },
  categoriesSection: {
    marginBottom: 32,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryCard: {
    width: (width - 48 - 12) / 2,
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 12,
  },
  categoryCardActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.background,
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryIconActive: {
    backgroundColor: Colors.accent,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text.primary,
  },
  categoryLabelActive: {
    color: Colors.accent,
  },
  categoryDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  filtersSection: {
    marginBottom: 32,
  },
  filterGroup: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  filterOptionsContainer: {
    gap: 8,
    paddingRight: 24,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text.primary,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
});
