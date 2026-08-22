import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Briefcase,
  Layers,
  CalendarCheck,
  Award,
  Plus,
  LogOut,
  ChevronRight,
} from "lucide-react-native";
import { useAuthStore } from "../../src/store/authStore";
import { useDashboardStore } from "../../src/store/dashboardStore";
import { useApplicationStore } from "../../src/store/applicationStore";
import { MetricCard } from "../../src/components/dashboard/MetricCard";
import { StageProgressBar } from "../../src/components/dashboard/StageProgressBar";
import { ApplicationCard } from "../../src/components/applications/ApplicationCard";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { stats, isLoading, fetchDashboard } = useDashboardStore();
  const { applications, fetchApplications } = useApplicationStore();

  const loadData = useCallback(() => {
    fetchDashboard();
    fetchApplications();
  }, [fetchDashboard, fetchApplications]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const recentApps = applications.slice(0, 3);

  // Compute stats fallback if dashboard payload is loading
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

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
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
        {/* Header: User Greeting & Logout */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || "Job Seeker"} 👋</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/application/create")}
              style={styles.addBtn}
            >
              <Plus size={18} color={COLORS.onPrimary} />
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7} onPress={handleLogout} style={styles.logoutBtn}>
              <LogOut size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
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

        {/* Recent Applications Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/applications")}
            style={styles.viewAllRow}
          >
            <Text style={styles.viewAllText}>View Pipeline</Text>
            <ChevronRight size={14} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {recentApps.length > 0 ? (
          recentApps.map((app) => (
            <ApplicationCard
              key={app._id}
              application={app}
              onPress={() => router.push(`/application/${app._id}`)}
            />
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Applications Yet</Text>
            <Text style={styles.emptyDesc}>
              Tap the "+ Add" button above to log your first job application.
            </Text>
          </View>
        )}
      </ScrollView>
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.onPrimary,
  },
  logoutBtn: {
    padding: 8,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
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
