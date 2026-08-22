import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Briefcase } from "lucide-react-native";
import { useAuthStore } from "../src/store/authStore";
import { COLORS, SPACING } from "../src/constants/theme";

export default function SplashScreen() {
  const router = useRouter();
  const { isInitialized, token } = useAuthStore();

  useEffect(() => {
    if (isInitialized) {
      if (token) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/login");
      }
    }
  }, [isInitialized, token]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.iconCircle}>
          <Briefcase size={36} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>JobTrack</Text>
        <Text style={styles.subtitle}>Career Pipeline & Application Tracker</Text>
      </View>
      <ActivityIndicator color={COLORS.primary} size="large" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  logoContainer: {
    alignItems: "center",
    gap: SPACING.sm,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primary}18`,
    borderWidth: 1.5,
    borderColor: `${COLORS.primary}50`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  loader: {
    marginTop: SPACING.xxl,
  },
});
