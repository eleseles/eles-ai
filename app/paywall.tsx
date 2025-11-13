import { useRouter } from "expo-router";
import {
  Crown,
  Check,
  X,
  Sparkles,
  Zap,
  Shield,
  Infinity,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "@/constants/colors";

interface PlanCardProps {
  title: string;
  price: string;
  period: string;
  description: string;
  popular?: boolean;
  selected: boolean;
  onPress: () => void;
  savings?: string;
}

function PlanCard({
  title,
  price,
  period,
  description,
  popular = false,
  selected,
  onPress,
  savings,
}: PlanCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.planCard,
        selected && styles.planCardSelected,
        popular && styles.planCardPopular,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {popular && (
        <View style={styles.popularBadge}>
          <Crown size={14} color="#FFFFFF" strokeWidth={2} fill="#FFFFFF" />
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}
      <View style={styles.planCardHeader}>
        <View style={styles.planInfo}>
          <Text style={[styles.planTitle, selected && styles.planTitleSelected]}>
            {title}
          </Text>
          <Text style={styles.planDescription}>{description}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={[styles.price, selected && styles.priceSelected]}>{price}</Text>
          <Text style={styles.period}>/{period}</Text>
        </View>
      </View>
      {savings && (
        <View style={styles.savingsBadge}>
          <Text style={styles.savingsText}>{savings}</Text>
        </View>
      )}
      <View
        style={[
          styles.radioButton,
          selected && styles.radioButtonSelected,
          popular && selected && styles.radioButtonPopular,
        ]}
      >
        {selected && <View style={styles.radioButtonInner} />}
      </View>
    </TouchableOpacity>
  );
}

interface FeatureItemProps {
  icon: React.ReactNode;
  text: string;
}

function FeatureItem({ icon, text }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>{icon}</View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

export default function PaywallScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>("yearly");
  const [isProcessing, setIsProcessing] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];

  const handleSubscribe = () => {
    setIsProcessing(true);

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

    setTimeout(() => {
      setIsProcessing(false);
      router.back();
    }, 1500);
  };

  return (
    <View style={styles.safeArea}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.placeholder} />
            <View style={styles.crownContainer}>
              <Crown size={32} color={Colors.accent} strokeWidth={2} fill={Colors.accent} />
            </View>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
              <X size={24} color={Colors.text.primary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>Unlock Premium</Text>
              <Text style={styles.heroSubtitle}>
                Get unlimited access to all embroidery styles and features
              </Text>
            </View>

            <View style={styles.featuresSection}>
              <FeatureItem
                icon={<Infinity size={20} color={Colors.accent} strokeWidth={2} />}
                text="Unlimited pattern generations"
              />
              <FeatureItem
                icon={<Sparkles size={20} color={Colors.accent} strokeWidth={2} />}
                text="Access to all embroidery styles"
              />
              <FeatureItem
                icon={<Zap size={20} color={Colors.accent} strokeWidth={2} />}
                text="Priority processing & support"
              />
              <FeatureItem
                icon={<Shield size={20} color={Colors.accent} strokeWidth={2} />}
                text="Ad-free experience"
              />
            </View>

            <View style={styles.plansSection}>
              <Text style={styles.sectionTitle}>Choose Your Plan</Text>

              <PlanCard
                title="Yearly"
                price="$29.99"
                period="year"
                description="Best value for creators"
                popular={true}
                selected={selectedPlan === "yearly"}
                onPress={() => setSelectedPlan("yearly")}
                savings="Save 50%"
              />

              <PlanCard
                title="Monthly"
                price="$4.99"
                period="month"
                description="Perfect to get started"
                selected={selectedPlan === "monthly"}
                onPress={() => setSelectedPlan("monthly")}
              />
            </View>

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={[styles.subscribeButton, isProcessing && styles.buttonDisabled]}
                onPress={handleSubscribe}
                disabled={isProcessing}
                activeOpacity={0.8}
              >
                <Crown size={20} color="#FFFFFF" strokeWidth={2} fill="#FFFFFF" />
                <Text style={styles.subscribeButtonText}>
                  {isProcessing ? "Processing..." : `Continue with ${selectedPlan === "yearly" ? "Yearly" : "Monthly"}`}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.disclaimerSection}>
              <Text style={styles.disclaimer}>
                Auto-renewable subscription. Cancel anytime.
              </Text>
              <Text style={styles.disclaimer}>
                Payment charged to your account at confirmation.
              </Text>
              <View style={styles.links}>
                <TouchableOpacity>
                  <Text style={styles.link}>Terms of Service</Text>
                </TouchableOpacity>
                <Text style={styles.linkSeparator}>•</Text>
                <TouchableOpacity>
                  <Text style={styles.link}>Privacy Policy</Text>
                </TouchableOpacity>
                <Text style={styles.linkSeparator}>•</Text>
                <TouchableOpacity>
                  <Text style={styles.link}>Restore</Text>
                </TouchableOpacity>
              </View>
            </View>
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  crownContainer: {
    position: "absolute" as const,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto" as const,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: Colors.text.primary,
    letterSpacing: -1,
    marginBottom: 12,
    textAlign: "center" as const,
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center" as const,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresSection: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.text.primary,
  },
  plansSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text.primary,
    marginBottom: 16,
    textAlign: "center" as const,
  },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    position: "relative" as const,
  },
  planCardSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.surface,
  },
  planCardPopular: {
    borderColor: Colors.accent,
  },
  popularBadge: {
    position: "absolute" as const,
    top: -12,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  planCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  planTitleSelected: {
    color: Colors.accent,
  },
  planDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.text.primary,
    letterSpacing: -1,
  },
  priceSelected: {
    color: Colors.accent,
  },
  period: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "500" as const,
  },
  savingsBadge: {
    alignSelf: "flex-start" as const,
    backgroundColor: "#10B981",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  radioButton: {
    position: "absolute" as const,
    top: 20,
    right: 20,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: Colors.accent,
  },
  radioButtonPopular: {
    borderColor: Colors.accent,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.accent,
  },
  subscribeButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  subscribeButtonText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  disclaimerSection: {
    alignItems: "center",
    gap: 8,
  },
  disclaimer: {
    fontSize: 11,
    color: Colors.text.muted,
    textAlign: "center" as const,
    lineHeight: 16,
  },
  links: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  link: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: "500" as const,
  },
  linkSeparator: {
    fontSize: 12,
    color: Colors.text.muted,
  },
});
