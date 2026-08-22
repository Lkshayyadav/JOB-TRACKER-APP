import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import { ApplicationStatus } from "../../types";

interface StageProgressBarProps {
  breakdown: Record<ApplicationStatus, number>;
  total: number;
}

export const StageProgressBar: React.FC<StageProgressBarProps> = ({ breakdown, total }) => {
  const STAGE_CARDS: { label: string; stageKey: ApplicationStatus; color: string; bg: string }[] = [
    { label: "Applied", stageKey: "Applied", color: "#0EA5E9", bg: "rgba(14, 165, 233, 0.15)" },
    { label: "OA", stageKey: "OA", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.15)" },
    { label: "Technical", stageKey: "Technical Round", color: "#A855F7", bg: "rgba(168, 85, 247, 0.15)" },
    { label: "HR Round", stageKey: "HR Round", color: "#6366F1", bg: "rgba(99, 102, 241, 0.15)" },
    { label: "Offer", stageKey: "Offer", color: "#CCFF00", bg: "rgba(204, 255, 0, 0.18)" },
    { label: "Rejected", stageKey: "Rejected", color: "#EF4444", bg: "rgba(239, 68, 68, 0.15)" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>PIPELINE STATUS BREAKDOWN</Text>
        <Text style={styles.totalBadge}>{total} Total</Text>
      </View>

      {/* Multi-Segment Visual Progress Bar */}
      <View style={styles.barContainer}>
        {total > 0 ? (
          STAGE_CARDS.map((item) => {
            const count = breakdown[item.stageKey] || 0;
            if (count === 0) return null;
            const pct = (count / total) * 100;
            return (
              <View
                key={item.stageKey}
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  backgroundColor: item.color,
                }}
              />
            );
          })
        ) : (
          <View style={{ width: "100%", height: "100%", backgroundColor: COLORS.border }} />
        )}
      </View>

      {/* 2x3 Grid of Status Cards (Matching Web Dashboard) */}
      <View style={styles.grid}>
        {STAGE_CARDS.map((item) => {
          const count = breakdown[item.stageKey] || 0;
          return (
            <View key={item.stageKey} style={styles.gridCard}>
              <Text style={styles.gridLabel}>{item.label}</Text>
              <View style={[styles.gridCountBox, { backgroundColor: item.bg }]}>
                <Text style={[styles.gridCountText, { color: item.color }]}>{count}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  header: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  totalBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
  },
  barContainer: {
    height: 8,
    flexDirection: "row",
    borderRadius: RADIUS.full,
    overflow: "hidden",
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  gridCard: {
    width: "31%",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  gridCountBox: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  gridCountText: {
    fontSize: 14,
    fontWeight: "800",
  },
});
