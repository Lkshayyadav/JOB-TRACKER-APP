import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { SyncingLoader } from "../../src/components/common/SyncingLoader";
import {
  Search,
  Plus,
  X,
  ChevronDown,
  Upload,
  Pin,
  ExternalLink,
  Globe,
} from "lucide-react-native";
import { useApplicationStore } from "../../src/store/applicationStore";
import { PlatformAPI } from "../../src/api/platform.api";
import { ApplicationCard } from "../../src/components/applications/ApplicationCard";
import { StatusModal } from "../../src/components/applications/StatusModal";
import { Application, ApplicationStatus, ApplicationPriority, Platform } from "../../src/types";
import { formatDate, formatRelativeDays, getCompanyInitials } from "../../src/utils/formatters";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";

type PipelineTab = "all" | "active" | "interviews" | "offers" | "rejected";
type SortOption = "newest" | "oldest" | "company";

const PIPELINE_TABS: { id: PipelineTab; label: string }[] = [
  { id: "all", label: "All Applications" },
  { id: "active", label: "Active Pipeline" },
  { id: "interviews", label: "Interviews" },
  { id: "offers", label: "Offers" },
  { id: "rejected", label: "Rejected" },
];

const STATUSES: (ApplicationStatus | "All")[] = [
  "All",
  "Applied",
  "OA",
  "Technical Round",
  "HR Round",
  "Offer",
  "Rejected",
];

const PRIORITIES: (ApplicationPriority | "All")[] = ["All", "High", "Medium", "Low"];

export default function ApplicationsScreen() {
  const router = useRouter();
  const {
    applications,
    isLoading,
    fetchApplications,
    updateStatus,
  } = useApplicationStore();

  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [activeTab, setActiveTab] = useState<PipelineTab>("all");
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | "All">("All");
  const [selectedPriority, setSelectedPriority] = useState<ApplicationPriority | "All">("All");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedAppForStatus, setSelectedAppForStatus] = useState<Application | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadData = React.useCallback(async () => {
    try {
      await Promise.all([
        fetchApplications(),
        PlatformAPI.getPlatforms().then(setPlatforms).catch(() => {}),
      ]);
    } finally {
      setInitialLoading(false);
    }
  }, [fetchApplications]);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Filter & Sort Applications
  const filteredApps = useMemo(() => {
    return applications
      .filter((app) => {
        // Tab filter
        if (activeTab === "active" && ["Offer", "Rejected"].includes(app.status)) return false;
        if (activeTab === "interviews" && !["OA", "Technical Round", "HR Round"].includes(app.status)) return false;
        if (activeTab === "offers" && app.status !== "Offer") return false;
        if (activeTab === "rejected" && app.status !== "Rejected") return false;

        // Platform filter
        if (selectedPlatformId !== "all") {
          const matchId = app.platformId === selectedPlatformId;
          const matchMethod = app.applicationMethod === selectedPlatformId;
          if (!matchId && !matchMethod) return false;
        }

        // Status dropdown filter
        if (selectedStatus !== "All" && app.status !== selectedStatus) return false;

        // Priority filter
        if (selectedPriority !== "All" && app.priority !== selectedPriority) return false;

        // Search text
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

        if (sortBy === "company") return a.company.localeCompare(b.company);
        if (sortBy === "oldest") return new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime();
        return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
      });
  }, [applications, activeTab, selectedPlatformId, selectedStatus, selectedPriority, sortBy, searchQuery]);

  const handleUpdateStatus = async (newStatus: ApplicationStatus) => {
    if (selectedAppForStatus) {
      await updateStatus(selectedAppForStatus._id, newStatus);
      setSelectedAppForStatus(null);
    }
  };

  const getPriorityColor = (p: ApplicationPriority) => {
    switch (p) {
      case "High":
        return "#EF4444";
      case "Medium":
        return "#F59E0B";
      case "Low":
        return "#10B981";
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusColor = (s: ApplicationStatus) => {
    return COLORS.status[s] || COLORS.primary;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header with Add & Import CSV actions */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Applications</Text>
          <Text style={styles.subtitle}>Manage and track the progress of your submitted jobs.</Text>
        </View>

        <View style={styles.headerBtnGroup}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/application/create")}
            style={styles.addBtn}
          >
            <Plus size={16} color={COLORS.onPrimary} />
            <Text style={styles.addBtnText}>+ Add Application</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Platform Filter Capsules Row (Matching Web Screenshot) */}
      <View style={styles.platformFilterRow}>
        <Text style={styles.platformLabel}>Platform:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.platformScroll}>
          <TouchableOpacity
            onPress={() => setSelectedPlatformId("all")}
            style={[styles.platformPill, selectedPlatformId === "all" && styles.platformPillActive]}
          >
            <Text style={[styles.platformPillText, selectedPlatformId === "all" && styles.platformPillTextActive]}>
              All Platforms
            </Text>
          </TouchableOpacity>

          {platforms.map((p) => {
            const isSel = selectedPlatformId === p._id;
            const itemColor = p.color || COLORS.primary;

            return (
              <TouchableOpacity
                key={p._id}
                onPress={() => setSelectedPlatformId(p._id)}
                style={[
                  styles.platformPill,
                  isSel && { backgroundColor: `${itemColor}25`, borderColor: itemColor },
                ]}
              >
                <View style={[styles.pillDot, { backgroundColor: itemColor }]} />
                <Text style={[styles.platformPillText, isSel && { color: "#FFF", fontWeight: "700" }]}>
                  {p.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 5 Segmented Pipeline Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {PIPELINE_TABS.map((tab) => {
            const isSel = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[styles.tabItem, isSel && styles.tabItemActive]}
              >
                <Text style={[styles.tabText, isSel && styles.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Search & Multi-Dropdown Filter Bar (Matching Screenshot 1) */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBox}>
          <Search size={15} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search company or role..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={15} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Dropdown Filters Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsScroll}>
          {/* Status Filter */}
          <TouchableOpacity
            onPress={() => {
              const nextIdx = (STATUSES.indexOf(selectedStatus) + 1) % STATUSES.length;
              setSelectedStatus(STATUSES[nextIdx]);
            }}
            style={[styles.dropdownPill, selectedStatus !== "All" && styles.dropdownPillActive]}
          >
            <Text style={styles.dropdownPillText}>Status: {selectedStatus}</Text>
            <ChevronDown size={12} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Priority Filter */}
          <TouchableOpacity
            onPress={() => {
              const nextIdx = (PRIORITIES.indexOf(selectedPriority) + 1) % PRIORITIES.length;
              setSelectedPriority(PRIORITIES[nextIdx]);
            }}
            style={[styles.dropdownPill, selectedPriority !== "All" && styles.dropdownPillActive]}
          >
            <Text style={styles.dropdownPillText}>Priority: {selectedPriority}</Text>
            <ChevronDown size={12} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Sort Filter */}
          <TouchableOpacity
            onPress={() => {
              if (sortBy === "newest") setSortBy("oldest");
              else if (sortBy === "oldest") setSortBy("company");
              else setSortBy("newest");
            }}
            style={styles.dropdownPill}
          >
            <Text style={styles.dropdownPillText}>
              Sort: {sortBy === "newest" ? "Newest" : sortBy === "oldest" ? "Oldest" : "Company A-Z"}
            </Text>
            <ChevronDown size={12} color={COLORS.textMuted} />
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Applications Table / Cards List */}
      {initialLoading ? (
        <SyncingLoader
          title="Syncing Application Pipeline..."
          subtitle="Connecting to database server & assembling your pipeline stages..."
        />
      ) : (
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
        renderItem={({ item }) => {
          const matchedPlatform = platforms.find(
            (p) => p._id === item.platformId || p.name === item.applicationMethod
          );
          const platformName = matchedPlatform?.name || item.applicationMethod || "Website";
          const platformColor = matchedPlatform?.color || COLORS.primary;

          return (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => router.push(`/application/${item._id}`)}
              style={[styles.appRowCard, item.isPinned && styles.appRowCardPinned]}
            >
              {/* Row Header: Company & Role */}
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

                {/* Status Quick Update Pill (Matching Web Screenshot) */}
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

              {/* Row Badges: Source Platform & Priority */}
              <View style={styles.badgesRow}>
                {/* Source Platform Badge */}
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

                {/* Priority Pill */}
                <View
                  style={[
                    styles.priorityPillBadge,
                    {
                      borderColor: `${getPriorityColor(item.priority)}40`,
                      backgroundColor: `${getPriorityColor(item.priority)}15`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityPillText,
                      { color: getPriorityColor(item.priority) },
                    ]}
                  >
                    {item.priority}
                  </Text>
                </View>

                {/* Applied Date */}
                <Text style={styles.dateLabel}>{formatDate(item.appliedDate)}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Applications Found</Text>
            <Text style={styles.emptyDesc}>
              {searchQuery || selectedStatus !== "All" || selectedPlatformId !== "all"
                ? "Try adjusting your filters or search terms."
                : "Tap + Add Application to track your first job application."}
            </Text>
          </View>
        }
      />

      )}

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
    marginTop: 1,
  },
  headerBtnGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  platformFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    gap: 6,
  },
  platformLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  platformScroll: {
    gap: 6,
    paddingRight: SPACING.md,
  },
  platformPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  platformPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  platformPillText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  platformPillTextActive: {
    color: COLORS.onPrimary,
    fontWeight: "700",
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tabsWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  tabsScroll: {
    paddingHorizontal: SPACING.md,
    gap: 16,
  },
  tabItem: {
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabItemActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.text,
    fontWeight: "700",
  },
  searchBarContainer: {
    paddingHorizontal: SPACING.md,
    gap: 6,
    marginBottom: SPACING.xs,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 38,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
  },
  filterPillsScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  dropdownPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dropdownPillActive: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}15`,
  },
  dropdownPillText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 80,
    gap: 6,
  },
  appRowCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  appRowCardPinned: {
    borderColor: `${COLORS.primary}50`,
    backgroundColor: COLORS.cardElevated,
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
    textTransform: "uppercase",
  },
  dateLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    padding: SPACING.xxl,
    alignItems: "center",
    gap: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  emptyDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
