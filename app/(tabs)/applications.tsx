import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, Plus, X } from "lucide-react-native";
import { useApplicationStore } from "../../src/store/applicationStore";
import { StagePillSelector } from "../../src/components/applications/StagePillSelector";
import { ApplicationCard } from "../../src/components/applications/ApplicationCard";
import { StatusModal } from "../../src/components/applications/StatusModal";
import { Application, ApplicationStatus, ApplicationPriority } from "../../src/types";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";

export default function ApplicationsScreen() {
  const router = useRouter();
  const {
    applications,
    selectedStage,
    searchQuery,
    selectedPriority,
    isLoading,
    fetchApplications,
    setSelectedStage,
    setSearchQuery,
    setSelectedPriority,
    updateStatus,
  } = useApplicationStore();

  const [selectedAppForStatus, setSelectedAppForStatus] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = { total: applications.length };
    applications.forEach((app) => {
      counts[app.status] = (counts[app.status] || 0) + 1;
    });
    return counts;
  }, [applications]);

  const filteredApps = useMemo(() => {
    return applications
      .filter((app) => {
        if (selectedStage !== "All" && app.status !== selectedStage) {
          return false;
        }
        if (selectedPriority !== "All" && app.priority !== selectedPriority) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCompany = app.company.toLowerCase().includes(q);
          const matchRole = app.role.toLowerCase().includes(q);
          const matchNotes = app.notes?.toLowerCase().includes(q);
          if (!matchCompany && !matchRole && !matchNotes) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
      });
  }, [applications, selectedStage, selectedPriority, searchQuery]);

  const handleUpdateStatus = async (newStatus: ApplicationStatus) => {
    if (selectedAppForStatus) {
      await updateStatus(selectedAppForStatus._id, newStatus);
      setSelectedAppForStatus(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Applications Pipeline</Text>
          <Text style={styles.subtitle}>
            {filteredApps.length} {filteredApps.length === 1 ? "role" : "roles"} active
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/application/create")}
          style={styles.addBtn}
        >
          <Plus size={18} color={COLORS.onPrimary} />
          <Text style={styles.addBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      <StagePillSelector
        selectedStage={selectedStage}
        onSelectStage={setSelectedStage}
        counts={stageCounts}
      />

      <View style={styles.filterSection}>
        <View style={styles.searchBar}>
          <Search size={16} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search company, role..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.priorityPillRow}>
          {(["All", "High", "Medium", "Low"] as (ApplicationPriority | "All")[]).map((p) => {
            const isSel = selectedPriority === p;
            return (
              <TouchableOpacity
                key={p}
                onPress={() => setSelectedPriority(p)}
                style={[styles.priorityPill, isSel && styles.priorityPillActive]}
              >
                <Text style={[styles.priorityText, isSel && styles.priorityTextActive]}>{p}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <FlatList
        data={filteredApps}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchApplications}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        renderItem={({ item }) => (
          <ApplicationCard
            application={item}
            onPress={() => router.push(`/application/${item._id}`)}
            onStatusPress={() => setSelectedAppForStatus(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Applications Found</Text>
            <Text style={styles.emptyDesc}>
              {searchQuery || selectedStage !== "All" || selectedPriority !== "All"
                ? "Try clearing filters to see more applications."
                : "Tap + New above to create your first application."}
            </Text>
          </View>
        }
      />

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    marginBottom: SPACING.xs,
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
  filterSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardElevated,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 40,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
  },
  priorityPillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  priorityPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priorityPillActive: {
    backgroundColor: "rgba(204, 255, 0, 0.12)",
    borderColor: COLORS.primary,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  priorityTextActive: {
    color: COLORS.primary,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 80,
  },
  emptyContainer: {
    padding: SPACING.xxl,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
