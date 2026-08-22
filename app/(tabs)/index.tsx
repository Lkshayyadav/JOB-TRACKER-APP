import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import {
  Briefcase,
  Layers,
  CalendarCheck,
  Award,
  Plus,
  ChevronRight,
  Pin,
  ChevronDown,
} from "lucide-react-native";
import { useAuthStore } from "../../src/store/authStore";
import { useDashboardStore } from "../../src/store/dashboardStore";
import { useApplicationStore } from "../../src/store/applicationStore";
import { PlatformAPI } from "../../src/api/platform.api";
import { MetricCard } from "../../src/components/dashboard/MetricCard";
import { StageProgressBar } from "../../src/components/dashboard/StageProgressBar";
import { StatusModal } from "../../src/components/applications/StatusModal";
import { SyncingLoader } from "../../src/components/common/SyncingLoader";
import { Application, ApplicationStatus, Platform } from "../../src/types";
import { formatDate } from "../../src/utils/formatters";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { stats, isLoading, fetchDashboard } = useDashboardStore();
  const { applications, fetchApplications, updateStatus } = useApplicationStore();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedAppForStatus, setSelectedAppForStatus] = useState<Application | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        fetchDashboard(),
        fetchApplications(),
        PlatformAPI.getPlatforms().then(setPlatforms).catch(() => {}),
      ]);
    } finally {
      setInitialLoading(false);
    }
  }, [fetchDashboard, fetchApplications]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <SyncingLoader
          title="Syncing Dashboard Metrics..."
          subtitle="Connecting to database server & assembling your application pipeline..."
        />
      </SafeAreaView>
    );
  }

  const recentApps = applications.slice(0, 4);

  const totalApps = stats?.totalApplications ?? applications.length;
  const activeApps =
    stats?.activeApplications ??
    applications.filter((a) => !["Offer", "Rejected"].includes(a.status)).length;
  const interviewApps =
    stats?.interviewsScheduled ??
    applications.filter((a) => ["OA", "Technical Round", "HR Round"].includes(a.status)).length;
  const offerApps =
    stats?.offersReceived ?? applications.filter((a) => a.status === "Offer").length;

  const breakdown = stats?.statusBreakdown ?? {
    Wishlist: applications.filter((a) => a.status === "Wishlist").length,
    Applied: applications.filter((a) => a.status === "Applied").length,
    OA: applications.filter((a) => a.status === "OA").length,
    "Technical Round": applications.filter((a) => a.status === "Technical Round").length,
    "HR Round": applications.filter((a) => a.status === "HR Round").length,
    Offer: applications.filter((a) => a.status === "Offer").length,
    Rejected: applications.filter((a) => a.status === "Rejected").length,
  };

  const getStatusColor = (s: ApplicationStatus) => {
    return COLORS.status[s] || COLORS.primary;
  };

  const handleUpdateStatus = async (newStatus: ApplicationStatus) => {
    if (selectedAppForStatus) {
      await updateStatus(selectedAppForStatus._id, newStatus);
      setSelectedAppForStatus(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadData}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header: User Greeting & Quick Add */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || "Lakshay Yadav"} 👋</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/application/create")}
            style={styles.addBtn}
          >
            <Plus size={16} color={COLORS.onPrimary} />
            <Text style={styles.addBtnText}>+ Add Application</Text>
          </TouchableOpacity>
        </View>

        {/* 2x2 Metric Cards Grid */}
        <View style={styles.gridRow}>
          <MetricCard
            title="Total Applications"
            value={totalApps}
            icon={<Briefcase size={20} color={COLORS.primary} />}
            accentColor={COLORS.primary}
            onPress={() => router.push("/(tabs)/applications")}
          />
          <MetricCard
            title="Active Pipeline"
            value={activeApps}
            icon={<Layers size={20} color={COLORS.info} />}
            accentColor={COLORS.info}
            onPress={() => router.push("/(tabs)/applications")}
          />
        </View>

        <View style={styles.gridRow}>
          <MetricCard
            title="Interviews"
            value={interviewApps}
            icon={<CalendarCheck size={20} color={COLORS.warning} />}
            accentColor={COLORS.warning}
            onPress={() => router.push("/(tabs)/followups")}
          />
          <MetricCard
            title="Offers Received"
            value={offerApps}
            icon={<Award size={20} color={COLORS.primary} />}
            accentColor={COLORS.primary}
          />
        </View>

        {/* Stage Progress Distribution */}
        <StageProgressBar breakdown={breakdown} total={totalApps} />

        {/* Recent Pipeline Activity Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Pipeline Activity</Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/applications")}
            style={styles.viewAllRow}
          >
            <Text style={styles.viewAllText}>View All Pipeline</Text>
            <ChevronRight size={14} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {recentApps.length > 0 ? (
          recentApps.map((item) => {
            const matchedPlatform = platforms.find(
              (p) => p._id === item.platformId || p.name === item.applicationMethod
            );
            const platformName = matchedPlatform?.name || item.applicationMethod || "Website";
            const platformColor = matchedPlatform?.color || COLORS.primary;

            return (
              <TouchableOpacity
                key={item._id}
                activeOpacity={0.75}
                onPress={() => router.push(`/application/${item._id}`)}
                style={styles.appRowCard}
              >
                <View style={styles.cardTop}>
                  <View style={styles.companyCol}>
                    <View style={styles.companyRow}>
                      <Text style={styles.companyName} numberOfLines={1}>
                        {item.company}
                      </Text>
                      {item.isPinned && (
                        <View style={styles.pinTag}>
                          <Pin size={11} color={COLORS.primary} />
                        </View>
                      )}
                    </View>
                    <Text style={styles.roleText} numberOfLines={1}>
                      {item.role}
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setSelectedAppForStatus(item)}
                    style={[
                      styles.quickStatusBtn,
                      {
                        borderColor: `${getStatusColor(item.status)}50`,
                        backgroundColor: `${getStatusColor(item.status)}18`,
                      },
                    ]}
                  >
                    <Text style={[styles.quickStatusText, { color: getStatusColor(item.status) }]}>
                      {item.status}
                    </Text>
                    <ChevronDown size={12} color={getStatusColor(item.status)} />
                  </TouchableOpacity>
                </View>

                <View style={styles.badgesRow}>
                  <View
                    style={[
                      styles.sourceBadge,
                      {
                        borderColor: `${platformColor}40`,
                        backgroundColor: `${platformColor}15`,
                      },
                    ]}
                  >
                    <View style={[styles.sourceDot, { backgroundColor: platformColor }]} />
                    <Text style={[styles.sourceText, { color: platformColor }]}>
                      {platformName}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.priorityPillBadge,
                      {
                        borderColor: "rgba(245, 158, 11, 0.4)",
                        backgroundColor: "rgba(245, 158, 11, 0.15)",
                      },
                    ]}
                  >
                    <Text style={styles.priorityPillText}>{item.priority}</Text>
                  </View>

                  <Text style={styles.dateLabel}>{formatDate(item.appliedDate)}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Applications Yet</Text>
            <Text style={styles.emptyDesc}>
              Tap the "+ Add Application" button above to log your first job application.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* 1-Tap Fast Status Modal */}
      {selectedAppForStatus && (
        <StatusModal
          visible={Boolean(selectedAppForStatus)}
          currentStatus={selectedAppForStatus.status}
          onSelectStatus={handleUpdateStatus}
          onClose={() => setSelectedAppForStatus(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 80,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
    paddingTop: SPACING.xs,
  },
  greeting: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.onPrimary,
  },
  gridRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  viewAllRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewAllText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  appRowCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  companyCol: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  companyName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  pinTag: {
    padding: 2,
    backgroundColor: `${COLORS.primary}20`,
    borderRadius: 3,
  },
  roleText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  quickStatusBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  quickStatusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.04)",
  },
  sourceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  sourceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sourceText: {
    fontSize: 10,
    fontWeight: "600",
  },
  priorityPillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
  },
  priorityPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#F59E0B",
    textTransform: "uppercase",
  },
  dateLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
