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
  ArrowLeft,
  Pin,
  ExternalLink,
  Edit2,
  Trash2,
  Calendar,
  Mail,
  User,
  Clock,
} from "lucide-react-native";
import { useApplicationStore } from "../../src/store/applicationStore";
import { ApplicationAPI } from "../../src/api/application.api";
import { Application, ApplicationHistory } from "../../src/types";
import { StatusBadge, PriorityBadge } from "../../src/components/common/Badge";
import { StatusModal } from "../../src/components/applications/StatusModal";
import { formatDate, formatRelativeDays, getCompanyInitials } from "../../src/utils/formatters";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";

export default function ApplicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { applications, updateStatus, updateApplication, deleteApplication } = useApplicationStore();

  const [app, setApp] = useState<Application | null>(null);
  const [history, setHistory] = useState<ApplicationHistory[]>([]);
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  useEffect(() => {
    const found = applications.find((a) => a._id === id);
    if (found) {
      setApp(found);
    }
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Application not found</Text>
        </View>
      </SafeAreaView>
    );
  }

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

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Navbar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleTogglePin} style={styles.actionIconBtn}>
            <Pin size={18} color={app.isPinned ? COLORS.primary : COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push(`/application/edit?id=${app._id}`)}
            style={styles.actionIconBtn}
          >
            <Edit2 size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.actionIconBtn}>
            <Trash2 size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Company Card Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getCompanyInitials(app.company)}</Text>
          </View>
          <Text style={styles.companyTitle}>{app.company}</Text>
          <Text style={styles.roleTitle}>{app.role}</Text>

          <View style={styles.badgeRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setStatusModalVisible(true)}
              style={styles.stageChanger}
            >
              <StatusBadge status={app.status} />
              <Text style={styles.tapChangeText}>Tap to change</Text>
            </TouchableOpacity>
            <PriorityBadge priority={app.priority} />
          </View>
        </View>

        {/* Info Grid */}
        <View style={styles.infoCard}>
          <Text style={styles.cardHeader}>Application Meta</Text>

          <View style={styles.metaRow}>
            <Calendar size={16} color={COLORS.textMuted} />
            <Text style={styles.metaLabel}>Applied Date:</Text>
            <Text style={styles.metaValue}>{formatDate(app.appliedDate)}</Text>
          </View>

          {app.followUpDate && (
            <View style={styles.metaRow}>
              <Clock size={16} color={COLORS.primary} />
              <Text style={styles.metaLabel}>Next Follow-up:</Text>
              <Text style={[styles.metaValue, { color: COLORS.primary }]}>
                {formatDate(app.followUpDate)} ({formatRelativeDays(app.followUpDate)})
              </Text>
            </View>
          )}

          {app.applicationMethod && (
            <View style={styles.metaRow}>
              <User size={16} color={COLORS.textMuted} />
              <Text style={styles.metaLabel}>Source Method:</Text>
              <Text style={styles.metaValue}>{app.applicationMethod}</Text>
            </View>
          )}

          {app.companyWebsite && (
            <TouchableOpacity
              onPress={() => Linking.openURL(app.companyWebsite!)}
              style={styles.metaRow}
            >
              <ExternalLink size={16} color={COLORS.info} />
              <Text style={[styles.metaLabel, { color: COLORS.info }]}>Company Website</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Recruiter Details */}
        {(app.recruiterName || app.recruiterEmail) && (
          <View style={styles.infoCard}>
            <Text style={styles.cardHeader}>Recruiter Contact</Text>
            {app.recruiterName && (
              <View style={styles.metaRow}>
                <User size={16} color={COLORS.textMuted} />
                <Text style={styles.metaLabel}>Name:</Text>
                <Text style={styles.metaValue}>{app.recruiterName}</Text>
              </View>
            )}
            {app.recruiterEmail && (
              <TouchableOpacity
                onPress={() => Linking.openURL(`mailto:${app.recruiterEmail}`)}
                style={styles.metaRow}
              >
                <Mail size={16} color={COLORS.primary} />
                <Text style={[styles.metaValue, { color: COLORS.primary }]}>
                  {app.recruiterEmail}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Notes */}
        {app.notes && (
          <View style={styles.infoCard}>
            <Text style={styles.cardHeader}>Interview Notes & Prep</Text>
            <Text style={styles.notesText}>{app.notes}</Text>
          </View>
        )}

        {/* Audit Timeline History */}
        {history.length > 0 && (
          <View style={styles.infoCard}>
            <Text style={styles.cardHeader}>Stage Audit History</Text>
            {history.map((h, i) => (
              <View key={h._id || i} style={styles.historyItem}>
                <View style={styles.historyBullet} />
                <View style={styles.historyContent}>
                  <Text style={styles.historyTransition}>
                    {h.previousStatus} ➔ <Text style={{ color: COLORS.primary }}>{h.newStatus}</Text>
                  </Text>
                  <Text style={styles.historyDate}>{formatDate(h.changedAt)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Stage Switcher Modal */}
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
  backBtn: {
    padding: 8,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardElevated,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionIconBtn: {
    padding: 8,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardElevated,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 80,
  },
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceHighlight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.sm,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.primary,
  },
  companyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },
  roleTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: SPACING.md,
  },
  stageChanger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tapChangeText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  cardHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  metaLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.text,
  },
  notesText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 20,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  historyBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  historyContent: {
    flex: 1,
  },
  historyTransition: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
  },
  historyDate: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
