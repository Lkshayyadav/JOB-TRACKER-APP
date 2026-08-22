import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";

interface SyncingLoaderProps {
  title?: string;
  subtitle?: string;
}

export const SyncingLoader: React.FC<SyncingLoaderProps> = ({
  title = "Syncing Data...",
  subtitle = "Connecting to database & assembling records...",
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.loaderBox}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  loaderBox: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    alignItems: "center",
    gap: SPACING.sm,
    width: "100%",
    maxWidth: 320,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginTop: SPACING.xs,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 16,
  },
});
