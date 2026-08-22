import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import { ApplicationStatus } from "../../types";

interface StageProgressBarProps {
  breakdown: Record<ApplicationStatus, number>;
  total: number;
}

export const StageProgressBar: React.FC<StageProgressBarProps> = ({ breakdown, total }) => {
  const stages: ApplicationStatus[] = [
    "Wishlist",
    "Applied",
    "OA",
    "Technical Round",
    "HR Round",
    "Offer",
    "Rejected",
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pipeline Stage Distribution</Text>

      {/* Segmented Multi-Color Progress Bar */}
      <View style={styles.barContainer}>
        {total > 0 ? (
          stages.map((stage) => {
            const count = breakdown[stage] || 0;
            if (count === 0) return null;
            const pct = (count / total) * 100;
            return (
              <View
                key={stage}
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  backgroundColor: COLORS.status[stage],
                }}
              />
            );
          })
        ) : (
          <View style={{ width: "100%", height: "100%", backgroundColor: COLORS.border }} />
        )}
      </View>

      {/* Stage Legend Pills */}
      <View style={styles.legendGrid}>
        {stages.map((stage) => {
          const count = breakdown[stage] || 0;
          return (
            <View key={stage} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.status[stage] }]} />
              <Text style={styles.legendText}>
                {stage}: <Text style={styles.legendCount}>{count}</Text>
              </Text>
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
  header: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  barContainer: {
    height: 10,
    flexDirection: "row",
    borderRadius: RADIUS.full,
    overflow: "hidden",
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.md,
  },
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: "45%",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  legendCount: {
    fontWeight: "600",
    color: COLORS.text,
  },
});
