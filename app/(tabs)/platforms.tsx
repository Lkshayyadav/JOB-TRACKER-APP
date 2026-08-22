import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarChart3, TrendingUp, Globe, CheckCircle2 } from "lucide-react-native";
import { useApplicationStore } from "../../src/store/applicationStore";
import { PlatformAPI } from "../../src/api/platform.api";
import { Platform } from "../../src/types";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";

export default function PlatformsScreen() {
  const { applications, isLoading: appsLoading, fetchApplications } = useApplicationStore();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPlatforms = async () => {
    setLoading(true);
    try {
      const data = await PlatformAPI.getPlatforms();
      setPlatforms(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    loadPlatforms();
  }, []);

  // Compute platform source breakdown from applications
  const platformStats = useMemo(() => {
    const counts: Record<string, { total: number; interviews: number; offers: number }> = {};

    applications.forEach((app) => {
      const method = app.applicationMethod || "Website";
      if (!counts[method]) {
        counts[method] = { total: 0, interviews: 0, offers: 0 };
      }
      counts[method].total += 1;
      if (["OA", "Technical Round", "HR Round"].includes(app.status)) {
        counts[method].interviews += 1;
      }
      if (app.status === "Offer") {
        counts[method].offers += 1;
      }
    });

    return Object.entries(counts).map(([name, data]) => ({
      name,
      ...data,
      responseRate:
        data.total > 0 ? Math.round(((data.interviews + data.offers) / data.total) * 100) : 0,
    }));
  }, [applications]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Platform Analytics</Text>
        <Text style={styles.subtitle}>Response & conversion rates across job boards</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading || appsLoading}
            onRefresh={() => {
              fetchApplications();
              loadPlatforms();
            }}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {platformStats.length > 0 ? (
          platformStats.map((item) => (
            <View key={item.name} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.sourceInfo}>
                  <View style={styles.sourceIcon}>
                    <Globe size={18} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.sourceName}>{item.name}</Text>
                    <Text style={styles.sourceSub}>{item.total} applications logged</Text>
                  </View>
                </View>

                <View style={styles.rateBadge}>
                  <Text style={styles.rateText}>{item.responseRate}%</Text>
                  <Text style={styles.rateSub}>Response</Text>
                </View>
              </View>

              {/* Progress Bar for Conversion */}
              <View style={styles.barBackground}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.min(item.responseRate, 100)}%`,
                      backgroundColor:
                        item.responseRate > 30 ? COLORS.primary : COLORS.info,
                    },
                  ]}
                />
              </View>

              {/* Stats Counters */}
              <View style={styles.statsRow}>
                <View style={styles.statCol}>
                  <Text style={styles.statNum}>{item.interviews}</Text>
                  <Text style={styles.statLabel}>Interviews</Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={[styles.statNum, { color: COLORS.primary }]}>{item.offers}</Text>
                  <Text style={styles.statLabel}>Offers</Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={styles.statNum}>{item.total}</Text>
                  <Text style={styles.statLabel}>Total Applied</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <BarChart3 size={40} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Platform Data Yet</Text>
            <Text style={styles.emptyDesc}>
              As you submit applications with different sources (LinkedIn, Wellfound, Indeed, Referrals), your conversion analytics will appear here.
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
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sourceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  sourceIcon: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  sourceName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  sourceSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  rateBadge: {
    alignItems: "flex-end",
  },
  rateText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary,
  },
  rateSub: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  barBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surface,
    marginVertical: SPACING.md,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.04)",
  },
  statCol: {
    alignItems: "center",
  },
  statNum: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
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
