import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Pin, Calendar, MapPin, DollarSign, ChevronRight } from "lucide-react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import { Application } from "../../types";
import { StatusBadge, PriorityBadge } from "../common/Badge";
import { formatDate, formatRelativeDays, getCompanyInitials } from "../../utils/formatters";

interface ApplicationCardProps {
  application: Application;
  onPress: () => void;
  onStatusPress?: () => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onPress,
  onStatusPress,
}) => {
  const initials = getCompanyInitials(application.company);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.container,
        application.isPinned && styles.pinnedContainer,
      ]}
    >
      {/* Top Row: Avatar, Company/Role, Pinned Icon */}
      <View style={styles.topRow}>
        <View style={styles.leftHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.titleCol}>
            <Text style={styles.company} numberOfLines={1}>
              {application.company}
            </Text>
            <Text style={styles.role} numberOfLines={1}>
              {application.role}
            </Text>
          </View>
        </View>

        {application.isPinned && (
          <View style={styles.pinIcon}>
            <Pin size={14} color={COLORS.primary} />
          </View>
        )}
      </View>

      {/* Middle Row: Status Badge & Priority */}
      <View style={styles.badgeRow}>
        <TouchableOpacity
          activeOpacity={onStatusPress ? 0.7 : 1}
          onPress={onStatusPress}
          style={styles.statusTouch}
        >
          <StatusBadge status={application.status} />
        </TouchableOpacity>
        <PriorityBadge priority={application.priority} />
      </View>

      {/* Details Row: Location / Salary / Follow-up */}
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Calendar size={12} color={COLORS.textMuted} />
          <Text style={styles.detailText}>Applied {formatDate(application.appliedDate)}</Text>
        </View>

        {application.followUpDate && (
          <View style={[styles.detailItem, styles.followUpHighlight]}>
            <Text style={styles.followUpText}>
              Next: {formatRelativeDays(application.followUpDate)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  pinnedContainer: {
    borderColor: `${COLORS.primary}50`,
    backgroundColor: `${COLORS.cardElevated}`,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  leftHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceHighlight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },
  titleCol: {
    flex: 1,
  },
  company: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  role: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  pinIcon: {
    padding: 4,
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: RADIUS.xs,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: SPACING.xs,
  },
  statusTouch: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.04)",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  followUpHighlight: {
    backgroundColor: `${COLORS.primary}12`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  followUpText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "600",
  },
});
