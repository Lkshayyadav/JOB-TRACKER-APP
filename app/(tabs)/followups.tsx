import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { SyncingLoader } from "../../src/components/common/SyncingLoader";
import { Clock, Calendar, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react-native";
import { useApplicationStore } from "../../src/store/applicationStore";
import { Application } from "../../src/types";
import { StatusBadge } from "../../src/components/common/Badge";
import { formatDate, formatRelativeDays, getCompanyInitials } from "../../src/utils/formatters";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";

export default function FollowUpsScreen() {
  const router = useRouter();
  const { applications, isLoading, fetchApplications } = useApplicationStore();
  const [initialLoading, setInitialLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      await fetchApplications();
    } finally {
      setInitialLoading(false);
    }
  }, [fetchApplications]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Filter apps that have followUpDate or are in interview stages
  const followUpApps = applications.filter(
    (app) => app.followUpDate || ["OA", "Technical Round", "HR Round"].includes(app.status)
  );

  // Group by urgency
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdue: Application[] = [];
  const dueToday: Application[] = [];
  const upcoming: Application[] = [];

  followUpApps.forEach((app) => {
    if (!app.followUpDate) {
      upcoming.push(app);
      return;
    }
    const d = new Date(app.followUpDate);
    d.setHours(0, 0, 0, 0);
    const diff = d.getTime() - today.getTime();

    if (diff < 0) {
      overdue.push(app);
    } else if (diff === 0) {
      dueToday.push(app);
    } else {
      upcoming.push(app);
    }
  });

  const renderSection = (
    title: string,
    items: Application[],
    badgeColor: string,
    icon: React.ReactNode
  ) => {
    if (items.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          {icon}
          <Text style={styles.sectionTitle}>{title}</Text>
          <View style={[styles.badge, { backgroundColor: `${badgeColor}18` }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>{items.length}</Text>
          </View>
        </View>

        {items.map((app) => (
          <TouchableOpacity
            key={app._id}
            activeOpacity={0.75}
            onPress={() => router.push(`/application/${app._id}`)}
            style={styles.card}
          >
            <View style={styles.cardLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getCompanyInitials(app.company)}</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.company} numberOfLines={1}>
                  {app.company}
                </Text>
                <Text style={styles.role} numberOfLines={1}>
                  {app.role}
                </Text>
                <View style={styles.statusRow}>
                  <StatusBadge status={app.status} />
                  {app.followUpDate && (
                    <Text style={styles.dateText}>
                      {formatRelativeDays(app.followUpDate)} ({formatDate(app.followUpDate)})
                    </Text>
                  )}
                </View>
              </View>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Interview & Follow-up Tracker</Text>
        <Text style={styles.subtitle}>
          {followUpApps.length} active {followUpApps.length === 1 ? "action item" : "action items"} scheduled
        </Text>
      </View>

      {initialLoading && applications.length === 0 ? (
        <SyncingLoader
          title="Syncing Follow-up Schedules..."
          subtitle="Calculating upcoming interview deadlines..."
        />
      ) : (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchApplications}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {followUpApps.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Clock size={40} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Follow-ups Scheduled</Text>
            <Text style={styles.emptyDesc}>
              When you set a follow-up date or schedule an interview round for an application, it will appear here automatically.
            </Text>
          </View>
        ) : (
          <>
            {renderSection(
              "Due Today",
              dueToday,
              COLORS.primary,
              <CheckCircle2 size={16} color={COLORS.primary} />
            )}
            {renderSection(
              "Action Overdue",
              overdue,
              COLORS.error,
              <AlertCircle size={16} color={COLORS.error} />
            )}
            {renderSection(
              "Upcoming Timeline",
              upcoming,
              COLORS.info,
              <Calendar size={16} color={COLORS.info} />
            )}
          </>
        )}
      </ScrollView>
    )}</SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 80,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    flex: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceHighlight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
  },
  cardInfo: {
    flex: 1,
  },
  company: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  role: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "500",
  },
  emptyContainer: {
    padding: SPACING.xxl,
    alignItems: "center",
    gap: SPACING.sm,
    marginTop: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  emptyDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
});
