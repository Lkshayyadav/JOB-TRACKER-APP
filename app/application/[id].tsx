import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  X,
  Pin,
  ExternalLink,
  ChevronDown,
  Globe,
  Calendar,
  Briefcase,
  User,
  Mail,
  Clock,
  History,
} from "lucide-react-native";
import { useApplicationStore } from "../../src/store/applicationStore";
import { PlatformAPI } from "../../src/api/platform.api";
import { ApplicationAPI } from "../../src/api/application.api";
import { Application, ApplicationHistory, ApplicationStatus, Platform } from "../../src/types";
import { StatusModal } from "../../src/components/applications/StatusModal";
import { formatDate, formatRelativeDays } from "../../src/utils/formatters";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";

export default function ApplicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { applications, updateStatus, updateApplication, deleteApplication } = useApplicationStore();

  const [app, setApp] = useState<Application | null>(null);
  const [history, setHistory] = useState<ApplicationHistory[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  useEffect(() => {
    const found = applications.find((a) => a._id === id);
    if (found) setApp(found);

    PlatformAPI.getPlatforms().then(setPlatforms).catch(() => {});

    if (id) {
      ApplicationAPI.getHistory(id)
        .then(setHistory)
        .catch(() => {});
    }
  }, [id, applications]);

  if (!app) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Application Details</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <X size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Application not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const matchedPlatform = platforms.find(
    (p) => p._id === app.platformId || p.name === app.applicationMethod
  );
  const platformName = matchedPlatform?.name || app.applicationMethod || "Website";
  const platformColor = matchedPlatform?.color || COLORS.primary;

  const handleTogglePin = async () => {
    await updateApplication(app._id, { isPinned: !app.isPinned });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Application",
      `Are you sure you want to remove ${app.company} from your pipeline?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteApplication(app._id);
            router.back();
          },
        },
      ]
    );
  };

  const handleOpenUrl = (url?: string) => {
    if (!url) return;
    const full = url.startsWith("http") ? url : `https://${url}`;
    Linking.openURL(full).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header (Matching Screenshot 2) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Application Details</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title Card: Company Name + Pin + Delete */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <View style={styles.titleLeft}>
              <Text style={styles.companyName}>{app.company}</Text>
              <TouchableOpacity onPress={handleTogglePin} style={styles.pinBtn}>
                <Pin size={16} color={app.isPinned ? COLORS.primary : COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>

          {/* Role & Company Website Link */}
          <View style={styles.roleRow}>
            <Text style={styles.roleTitle}>{app.role}</Text>
            {app.companyWebsite && (
              <TouchableOpacity onPress={() => handleOpenUrl(app.companyWebsite)}>
                <ExternalLink size={14} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 2x2 Meta Grid (Matching Screenshot 2) */}
        <View style={styles.metaGrid}>
          {/* JOB SOURCE */}
          <View style={styles.metaGridItem}>
            <Text style={styles.metaGridLabel}>JOB SOURCE</Text>
            <View style={[styles.sourceBadge, { backgroundColor: `${platformColor}18`, borderColor: `${platformColor}40` }]}>
              <View style={[styles.sourceDot, { backgroundColor: platformColor }]} />
              <Text style={[styles.sourceBadgeText, { color: platformColor }]}>{platformName}</Text>
            </View>
          </View>

          {/* PRIORITY */}
          <View style={styles.metaGridItem}>
            <Text style={styles.metaGridLabel}>PRIORITY</Text>
            <View style={[styles.priorityBadge, { backgroundColor: "rgba(245, 158, 11, 0.15)", borderColor: "rgba(245, 158, 11, 0.4)" }]}>
              <Text style={styles.priorityBadgeText}>{app.priority}</Text>
            </View>
          </View>

          {/* APPLIED DATE */}
          <View style={styles.metaGridItem}>
            <Text style={styles.metaGridLabel}>APPLIED DATE</Text>
            <View style={styles.dateValRow}>
              <Calendar size={13} color={COLORS.textMuted} />
              <Text style={styles.dateValText}>{formatDate(app.appliedDate)}</Text>
            </View>
          </View>

          {/* FOLLOW-UP DATE */}
          <View style={styles.metaGridItem}>
            <Text style={styles.metaGridLabel}>FOLLOW-UP DATE</Text>
            <View style={styles.dateValRow}>
              <Clock size={13} color={app.followUpDate ? COLORS.primary : COLORS.textMuted} />
              <Text style={[styles.dateValText, app.followUpDate && { color: COLORS.primary }]}>
                {app.followUpDate ? formatDate(app.followUpDate) : "None scheduled"}
              </Text>
            </View>
          </View>
        </View>

        {/* APPLICATION DETAILS & CONTACTS (Matching Screenshot 2) */}
        <View style={styles.cardBox}>
          <View style={styles.cardBoxHeader}>
            <User size={15} color={COLORS.primary} />
            <Text style={styles.cardBoxTitle}>APPLICATION DETAILS & CONTACTS</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Application Method:</Text>
            <Text style={styles.infoValue}>{app.applicationMethod || "Website"}</Text>
          </View>

          {app.recruiterName && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Recruiter Name:</Text>
              <Text style={styles.infoValue}>{app.recruiterName}</Text>
            </View>
          )}

          {app.recruiterEmail && (
            <TouchableOpacity
              onPress={() => Linking.openURL(`mailto:${app.recruiterEmail}`)}
              style={styles.infoRow}
            >
              <Text style={styles.infoLabel}>Recruiter Email:</Text>
              <Text style={[styles.infoValue, { color: COLORS.primary }]}>{app.recruiterEmail}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* CURRENT STATUS & UPDATE (Matching Screenshot 2) */}
        <View style={styles.cardBox}>
          <View style={styles.statusBoxHeader}>
            <Text style={styles.cardBoxTitle}>CURRENT STATUS</Text>
            <View style={[styles.statusBadgeSmall, { backgroundColor: `${COLORS.status[app.status]}20`, borderColor: `${COLORS.status[app.status]}50` }]}>
              <Text style={[styles.statusBadgeSmallText, { color: COLORS.status[app.status] }]}>{app.status}</Text>
            </View>
          </View>

          <Text style={[styles.infoLabel, { marginTop: SPACING.sm, marginBottom: 4 }]}>UPDATE STATUS</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setStatusModalVisible(true)}
            style={styles.statusPickerDropdown}
          >
            <Text style={styles.statusPickerText}>{app.status}</Text>
            <ChevronDown size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* NOTES BOX (Matching Screenshot 2) */}
        <View style={styles.cardBox}>
          <Text style={styles.cardBoxTitle}>NOTES</Text>
          <View style={styles.notesContainer}>
            <Text style={styles.notesContent}>
              {app.notes || "No notes provided for this job application."}
            </Text>
          </View>
        </View>

        {/* PIPELINE HISTORY LOGS (Matching Screenshot 2) */}
        <View style={styles.cardBox}>
          <View style={styles.cardBoxHeader}>
            <History size={15} color={COLORS.info} />
            <Text style={styles.cardBoxTitle}>PIPELINE HISTORY LOGS</Text>
          </View>

          <View style={styles.historyList}>
            {history.length > 0 ? (
              history.map((h, idx) => (
                <View key={h._id || idx} style={styles.historyRow}>
                  <View style={styles.historyDot} />
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyStatusText}>
                      {h.newStatus} <Text style={styles.historyTimestamp}>{formatDate(h.changedAt)}</Text>
                    </Text>
                    <Text style={styles.historySubText}>Stage transition recorded</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.historyRow}>
                <View style={styles.historyDot} />
                <View style={styles.historyInfo}>
                  <Text style={styles.historyStatusText}>
                    {app.status} <Text style={styles.historyTimestamp}>{formatDate(app.appliedDate)}</Text>
                  </Text>
                  <Text style={styles.historySubText}>Application created</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Fast Status Update Modal */}
      <StatusModal
        visible={statusModalVisible}
        currentStatus={app.status}
        onSelectStatus={(newStatus) => updateStatus(app._id, newStatus)}
        onClose={() => setStatusModalVisible(false)}
      />
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
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 80,
    gap: SPACING.sm,
  },
  titleSection: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  companyName: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },
  pinBtn: {
    padding: 4,
  },
  deleteBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  deleteText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "700",
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  roleTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metaGridItem: {
    width: "50%",
    paddingVertical: 6,
  },
  metaGridLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textMuted,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  sourceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  sourceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sourceBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  priorityBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#F59E0B",
    textTransform: "uppercase",
  },
  dateValRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dateValText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: "500",
  },
  cardBox: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardBoxHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: SPACING.sm,
  },
  cardBoxTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
  },
  statusBoxHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  statusBadgeSmallText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statusPickerDropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.borderLight,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    marginTop: 4,
  },
  statusPickerText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "600",
  },
  notesContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xs,
  },
  notesContent: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  historyList: {
    marginTop: SPACING.xs,
    gap: SPACING.sm,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.info,
    marginTop: 4,
  },
  historyInfo: {
    flex: 1,
  },
  historyStatusText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
  },
  historyTimestamp: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: "400",
  },
  historySubText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
});
