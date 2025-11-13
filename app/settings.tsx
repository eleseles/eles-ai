import { useRouter } from "expo-router";
import {
  Crown,
  ChevronRight,
  Info,
  Mail,
  Star,
  Trash2,
  X,
} from "lucide-react-native";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useEmbroidery } from "@/context/embroidery";

interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
  destructive?: boolean;
}

function SettingsItem({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  destructive = false,
}: SettingsItemProps) {
  return (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.iconContainer, destructive && styles.iconContainerDestructive]}>
          {icon}
        </View>
        <View style={styles.settingsItemText}>
          <Text style={[styles.settingsItemTitle, destructive && styles.textDestructive]}>
            {title}
          </Text>
          {subtitle && <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showChevron && (
        <ChevronRight size={20} color={Colors.text.muted} strokeWidth={2} />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { results, clearResults } = useEmbroidery();
  const isPremium = false;

  const handleUpgradeToPremium = () => {
    router.push("/paywall");
  };

  const handleClearHistory = () => {
    Alert.alert(
      "Clear History",
      `Delete all ${results.length} embroidery patterns?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            clearResults();
            Alert.alert("Success", "History cleared");
          },
        },
      ]
    );
  };

  const handleRateApp = () => {
    Alert.alert("Rate App", "Thank you for your support!");
  };

  const handleContactSupport = () => {
    Linking.openURL("mailto:support@embroidery-studio.com");
  };

  const handleAbout = () => {
    Alert.alert(
      "About Embroidery Studio",
      "Version 1.0.0\n\nTransform your photos into beautiful embroidery patterns with AI."
    );
  };

  return (
    <View style={styles.safeArea}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.closeButton}
            >
              <X size={24} color={Colors.text.primary} strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.title}>Settings</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {!isPremium && (
              <TouchableOpacity
                style={styles.premiumBanner}
                onPress={handleUpgradeToPremium}
                activeOpacity={0.9}
              >
                <View style={styles.premiumBannerContent}>
                  <View style={styles.premiumIconContainer}>
                    <Crown size={28} color="#FFFFFF" strokeWidth={2} fill="#FFFFFF" />
                  </View>
                  <View style={styles.premiumText}>
                    <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
                    <Text style={styles.premiumSubtitle}>
                      Unlimited patterns & exclusive styles
                    </Text>
                  </View>
                  <ChevronRight size={24} color="#FFFFFF" strokeWidth={2} />
                </View>
              </TouchableOpacity>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>General</Text>
              <View style={styles.sectionContent}>
                <SettingsItem
                  icon={<Star size={20} color={Colors.accent} strokeWidth={2} />}
                  title="Rate App"
                  subtitle="Love the app? Leave us a review"
                  onPress={handleRateApp}
                />
                <SettingsItem
                  icon={<Mail size={20} color={Colors.accent} strokeWidth={2} />}
                  title="Contact Support"
                  subtitle="Get help or send feedback"
                  onPress={handleContactSupport}
                />
                <SettingsItem
                  icon={<Info size={20} color={Colors.accent} strokeWidth={2} />}
                  title="About"
                  subtitle="App version & info"
                  onPress={handleAbout}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Data</Text>
              <View style={styles.sectionContent}>
                <SettingsItem
                  icon={<Trash2 size={20} color={Colors.text.primary} strokeWidth={2} />}
                  title="Clear History"
                  subtitle={`${results.length} patterns saved`}
                  onPress={handleClearHistory}
                  showChevron={false}
                  destructive={results.length > 0}
                />
              </View>
            </View>

            <Text style={styles.footer}>
              Made with care for embroidery enthusiasts
            </Text>
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
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    width: 44,
  },
  title: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  premiumBanner: {
    backgroundColor: Colors.accent,
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  premiumBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  premiumIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  premiumText: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text.secondary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerDestructive: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  settingsItemText: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  textDestructive: {
    color: "#EF4444",
  },
  settingsItemSubtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  footer: {
    fontSize: 13,
    color: Colors.text.muted,
    textAlign: "center" as const,
    marginTop: 16,
    marginBottom: 40,
  },
});
