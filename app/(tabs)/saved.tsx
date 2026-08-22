import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bookmark, ExternalLink, ArrowRight, Trash2, Plus } from "lucide-react-native";
import { useFocusEffect } from "expo-router";
import { SyncingLoader } from "../../src/components/common/SyncingLoader";
import { useSavedJobStore } from "../../src/store/savedJobStore";
import { useApplicationStore } from "../../src/store/applicationStore";
import { SavedJob } from "../../src/types";
import { formatDate, getCompanyInitials } from "../../src/utils/formatters";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";

export default function SavedJobsScreen() {
  const { savedJobs, isLoading, fetchSavedJobs, deleteSavedJob, applySavedJob } = useSavedJobStore();
  const [initialLoading, setInitialLoading] = useState(true);
  const { fetchApplications } = useApplicationStore();

  const loadData = React.useCallback(async () => {
    try {
      await fetchSavedJobs();
    } finally {
      setInitialLoading(false);
    }
  }, [fetchSavedJobs]);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleApply = async (job: SavedJob) => {
    const success = await applySavedJob(job._id);
    if (success) {
      fetchApplications();
    }
  };

  const handleOpenLink = (url?: string) => {
    if (url) {
      Linking.openURL(url).catch(() => {});
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Saved Job Bookmarks</Text>
          <Text style={styles.subtitle}>{savedJobs.length} roles saved for later</Text>
        </View>
      </View>

      {initialLoading ? (
        <SyncingLoader
          title="Syncing Saved Bookmarks..."
          subtitle="Loading saved job postings..."
        />
      ) : (
      <FlatList
        data={savedJobs}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchSavedJobs}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.topRow}>
              <View style={styles.cardLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getCompanyInitials(item.company)}</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.company} numberOfLines={1}>
                    {item.company}
                  </Text>
                  <Text style={styles.role} numberOfLines={1}>
                    {item.role}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => deleteSavedJob(item._id)}
                style={styles.deleteBtn}
              >
                <Trash2 size={16} color={COLORS.error} />
              </TouchableOpacity>
            </View>

            {item.notes && (
              <Text style={styles.notes} numberOfLines={2}>
                {item.notes}
              </Text>
            )}

            <View style={styles.footerRow}>
              <Text style={styles.savedDate}>Saved {formatDate(item.savedDate)}</Text>

              <View style={styles.actionGroup}>
                {item.jobUrl && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleOpenLink(item.jobUrl)}
                    style={styles.linkBtn}
                  >
                    <ExternalLink size={13} color={COLORS.textSecondary} />
                    <Text style={styles.linkText}>Job Post</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleApply(item)}
                  style={styles.applyBtn}
                >
                  <Text style={styles.applyText}>Move to Applied</Text>
                  <ArrowRight size={13} color={COLORS.onPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Bookmark size={40} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Saved Jobs</Text>
            <Text style={styles.emptyDesc}>
              Bookmark open vacancies and roles you find online, then convert them into active applications with 1 tap.
            </Text>
          </View>
        }
      />
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
  listContent: {
    paddingHorizontal: SPACING.md,
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
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  infoCol: {
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
  deleteBtn: {
    padding: 6,
  },
  notes: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.04)",
  },
  savedDate: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  actionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
  },
  linkText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  applyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
  },
  applyText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.onPrimary,
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
