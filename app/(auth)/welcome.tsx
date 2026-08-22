import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Briefcase, ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react-native";
import { Button } from "../../src/components/common/Button";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Brand Logo */}
        <View style={styles.topLogo}>
          <View style={styles.iconCircle}>
            <Briefcase size={36} color={COLORS.primary} />
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>CAREER PIPELINE 2.0</Text>
          </View>
        </View>

        {/* Hero Headline */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Track & Land Your Next <Text style={styles.limeHighlight}>Dream Role</Text>
          </Text>
          <Text style={styles.heroDesc}>
            Manage applications, interview schedules, saved jobs, and platform conversion analytics with zero friction.
          </Text>

          {/* Value Props */}
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <CheckCircle2 size={16} color={COLORS.primary} />
              <Text style={styles.featureText}>Real-time Kanban Stage Transitions</Text>
            </View>
            <View style={styles.featureItem}>
              <Zap size={16} color={COLORS.primary} />
              <Text style={styles.featureText}>Urgent Follow-up & Interview Timeline</Text>
            </View>
            <View style={styles.featureItem}>
              <ShieldCheck size={16} color={COLORS.primary} />
              <Text style={styles.featureText}>Platform Conversion Analytics</Text>
            </View>
          </View>
        </View>

        {/* CTA Buttons */}
        <View style={styles.buttonGroup}>
          <Button
            title="Get Started"
            onPress={() => router.push("/(auth)/register")}
            size="lg"
            icon={<ArrowRight size={18} color={COLORS.onPrimary} />}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/(auth)/login")}
            style={styles.loginOutlineBtn}
          >
            <Text style={styles.loginOutlineText}>Log In to Existing Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: SPACING.xl,
  },
  topLogo: {
    alignItems: "center",
    marginTop: SPACING.lg,
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
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.cardElevated,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  liveText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  heroSection: {
    alignItems: "center",
    marginVertical: SPACING.md,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  limeHighlight: {
    color: COLORS.primary,
  },
  heroDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: SPACING.md,
    lineHeight: 22,
    paddingHorizontal: SPACING.sm,
  },
  featureList: {
    marginTop: SPACING.xl,
    gap: SPACING.sm,
    alignSelf: "stretch",
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "500",
  },
  buttonGroup: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  loginOutlineBtn: {
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    backgroundColor: COLORS.card,
  },
  loginOutlineText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
});
