import React from "react";
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import { ApplicationStatus } from "../../types";

interface StagePillSelectorProps {
  selectedStage: ApplicationStatus | "All";
  onSelectStage: (stage: ApplicationStatus | "All") => void;
  counts?: Record<string, number>;
}

const STAGES: (ApplicationStatus | "All")[] = [
  "All",
  "Wishlist",
  "Applied",
  "OA",
  "Technical Round",
  "HR Round",
  "Offer",
  "Rejected",
];

export const StagePillSelector: React.FC<StagePillSelectorProps> = ({
  selectedStage,
  onSelectStage,
  counts = {},
}) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {STAGES.map((stage) => {
          const isSelected = selectedStage === stage;
          const count = counts[stage] ?? (stage === "All" ? counts.total : undefined);

          return (
            <TouchableOpacity
              key={stage}
              activeOpacity={0.8}
              onPress={() => onSelectStage(stage)}
              style={[
                styles.pill,
                isSelected ? styles.pillSelected : styles.pillUnselected,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  isSelected ? styles.pillTextSelected : styles.pillTextUnselected,
                ]}
              >
                {stage}
              </Text>
              {count !== undefined && count > 0 && (
                <View
                  style={[
                    styles.countBadge,
                    isSelected ? styles.countBadgeSelected : styles.countBadgeUnselected,
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      isSelected ? styles.countTextSelected : styles.countTextUnselected,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: SPACING.sm,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: 6,
  },
  pillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillUnselected: {
    backgroundColor: COLORS.cardElevated,
    borderColor: COLORS.border,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  pillTextSelected: {
    color: COLORS.onPrimary,
  },
  pillTextUnselected: {
    color: COLORS.textSecondary,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.full,
  },
  countBadgeSelected: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  countBadgeUnselected: {
    backgroundColor: COLORS.surfaceHighlight,
  },
  countText: {
    fontSize: 10,
    fontWeight: "700",
  },
  countTextSelected: {
    color: COLORS.onPrimary,
  },
  countTextUnselected: {
    color: COLORS.textSecondary,
  },
});
