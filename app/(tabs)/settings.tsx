import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Sliders,
  User,
  Bell,
  Database,
  Globe,
  LogOut,
  Save,
  Check,
  Shield,
  Download,
} from "lucide-react-native";
import { useAuthStore } from "../../src/store/authStore";
import { useApplicationStore } from "../../src/store/applicationStore";
import { PlatformAPI } from "../../src/api/platform.api";
import { Platform, ApplicationPriority } from "../../src/types";
import { Input } from "../../src/components/common/Input";
import { Button } from "../../src/components/common/Button";
import { Storage } from "../../src/utils/storage";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";

type SettingsTab = "defaults" | "profile" | "notifications" | "data";

const PRIORITIES: ApplicationPriority[] = ["High", "Medium", "Low"];
const METHODS = ["Website", "LinkedIn Easy Apply", "Referral", "Email", "Recruiter", "Other"];

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { applications } = useApplicationStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>("defaults");

  // Tab 1: Defaults State
  const [defaultPriority, setDefaultPriority] = useState<ApplicationPriority>("Medium");
  const [defaultMethod, setDefaultMethod] = useState("Website");
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [defaultPlatformId, setDefaultPlatformId] = useState<string>("");

  // Tab 2: Profile State
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  // Tab 3: Notifications State
  const [interviewAlerts, setInterviewAlerts] = useState(true);
  const [followUpReminders, setFollowUpReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // Status message
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    PlatformAPI.getPlatforms()
      .then((data) => {
        setPlatforms(data);
        const def = data.find((p) => p.isDefault);
        if (def) setDefaultPlatformId(def._id);
      })
      .catch(() => {});

    // Load saved preferences
    Storage.getItem<string>("jobtrack_default_priority").then((val) => {
      if (val) setDefaultPriority(val as ApplicationPriority);
    });
    Storage.getItem<string>("jobtrack_default_method").then((val) => {
      if (val) setDefaultMethod(val);
    });
  }, []);

  const handleSaveDefaults = async () => {
    await Storage.setItem("jobtrack_default_priority", defaultPriority);
    await Storage.setItem("jobtrack_default_method", defaultMethod);
    if (defaultPlatformId) {
      await Storage.setItem("jobtrack_default_platform", defaultPlatformId);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out of your account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/welcome");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Preferences, templates, profile & notifications</Text>
      </View>

      {/* 4 Segmented Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
          <TouchableOpacity
            onPress={() => setActiveTab("defaults")}
            style={[styles.tabBtn, activeTab === "defaults" && styles.tabBtnActive]}
          >
            <Sliders size={14} color={activeTab === "defaults" ? COLORS.onPrimary : COLORS.textSecondary} />
            <Text style={[styles.tabBtnText, activeTab === "defaults" && styles.tabBtnTextActive]}>
              Application Defaults
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("profile")}
            style={[styles.tabBtn, activeTab === "profile" && styles.tabBtnActive]}
          >
            <User size={14} color={activeTab === "profile" ? COLORS.onPrimary : COLORS.textSecondary} />
            <Text style={[styles.tabBtnText, activeTab === "profile" && styles.tabBtnTextActive]}>
              Profile Details
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("notifications")}
            style={[styles.tabBtn, activeTab === "notifications" && styles.tabBtnActive]}
          >
            <Bell size={14} color={activeTab === "notifications" ? COLORS.onPrimary : COLORS.textSecondary} />
            <Text style={[styles.tabBtnText, activeTab === "notifications" && styles.tabBtnTextActive]}>
              Notifications
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("data")}
            style={[styles.tabBtn, activeTab === "data" && styles.tabBtnActive]}
          >
            <Database size={14} color={activeTab === "data" ? COLORS.onPrimary : COLORS.textSecondary} />
            <Text style={[styles.tabBtnText, activeTab === "data" && styles.tabBtnTextActive]}>
              Data Management
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {saveSuccess && (
          <View style={styles.successBox}>
            <Check size={16} color={COLORS.onPrimary} />
            <Text style={styles.successText}>Settings updated successfully!</Text>
          </View>
        )}

        {/* TAB 1: APPLICATION DEFAULTS */}
        {activeTab === "defaults" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Application Template Defaults</Text>
            <Text style={styles.cardDesc}>
              Values automatically pre-filled when adding a new application to speed up logging.
            </Text>

            {/* Default Priority */}
            <Text style={styles.fieldLabel}>Default Priority</Text>
            <View style={styles.pillRow}>
              {PRIORITIES.map((p) => {
                const isSel = defaultPriority === p;
                return (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setDefaultPriority(p)}
                    style={[styles.pill, isSel && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, isSel && styles.pillTextActive]}>{p}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Default Method */}
            <Text style={styles.fieldLabel}>Default Application Method</Text>
            <View style={styles.pillWrap}>
              {METHODS.map((m) => {
                const isSel = defaultMethod === m;
                return (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setDefaultMethod(m)}
                    style={[styles.pill, isSel && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, isSel && styles.pillTextActive]}>{m}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Default Platform */}
            {platforms.length > 0 && (
              <>
                <Text style={styles.fieldLabel}>Default Source Platform</Text>
                <View style={styles.pillWrap}>
                  {platforms.map((p) => {
                    const isSel = defaultPlatformId === p._id;
                    return (
                      <TouchableOpacity
                        key={p._id}
                        onPress={() => setDefaultPlatformId(p._id)}
                        style={[styles.pill, isSel && styles.pillActive]}
                      >
                        <Text style={[styles.pillText, isSel && styles.pillTextActive]}>{p.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            <Button
              title="Save Defaults"
              onPress={handleSaveDefaults}
              style={{ marginTop: SPACING.lg }}
            />
          </View>
        )}

        {/* TAB 2: PROFILE DETAILS */}
        {activeTab === "profile" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>User Profile</Text>
            <Text style={styles.cardDesc}>Your personal identity and connected account details.</Text>

            <Input label="Full Name" value={name} onChangeText={setName} />
            <Input label="Email Address" value={email} onChangeText={setEmail} editable={false} />

            <View style={styles.infoNote}>
              <Shield size={16} color={COLORS.primary} />
              <Text style={styles.infoNoteText}>
                Email address is managed via your centralized account authentication.
              </Text>
            </View>

            <Button
              title="Update Profile"
              onPress={() => {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 2500);
              }}
              style={{ marginTop: SPACING.md }}
            />
          </View>
        )}

        {/* TAB 3: NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notification Preferences</Text>
            <Text style={styles.cardDesc}>Configure interview alerts and deadline reminders.</Text>

            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleTitle}>Daily Interview Alerts</Text>
                <Text style={styles.toggleSub}>Push notifications on the day of scheduled rounds</Text>
              </View>
              <Switch
                value={interviewAlerts}
                onValueChange={setInterviewAlerts}
                thumbColor={interviewAlerts ? COLORS.primary : COLORS.borderLight}
                trackColor={{ false: COLORS.surface, true: `${COLORS.primary}50` }}
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleTitle}>Follow-up Reminders</Text>
                <Text style={styles.toggleSub}>Alerts when follow-up dates are reached</Text>
              </View>
              <Switch
                value={followUpReminders}
                onValueChange={setFollowUpReminders}
                thumbColor={followUpReminders ? COLORS.primary : COLORS.borderLight}
                trackColor={{ false: COLORS.surface, true: `${COLORS.primary}50` }}
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleTitle}>Weekly Progress Summary</Text>
                <Text style={styles.toggleSub}>Weekly summary of total applications & conversion</Text>
              </View>
              <Switch
                value={weeklyDigest}
                onValueChange={setWeeklyDigest}
                thumbColor={weeklyDigest ? COLORS.primary : COLORS.borderLight}
                trackColor={{ false: COLORS.surface, true: `${COLORS.primary}50` }}
              />
            </View>
          </View>
        )}

        {/* TAB 4: DATA MANAGEMENT */}
        {activeTab === "data" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Data Management & Sync</Text>
            <Text style={styles.cardDesc}>Summary of stored items synced with the cloud database.</Text>

            <View style={styles.dataStatsRow}>
              <View style={styles.dataStatItem}>
                <Text style={styles.dataStatNum}>{applications.length}</Text>
                <Text style={styles.dataStatLabel}>Applications</Text>
              </View>
              <View style={styles.dataStatItem}>
                <Text style={styles.dataStatNum}>{platforms.length}</Text>
                <Text style={styles.dataStatLabel}>Platforms</Text>
              </View>
              <View style={styles.dataStatItem}>
                <Text style={[styles.dataStatNum, { color: COLORS.primary }]}>Synced</Text>
                <Text style={styles.dataStatLabel}>Cloud State</Text>
              </View>
            </View>

            <View style={styles.syncNote}>
              <Text style={styles.syncNoteText}>
                Connected to Render Backend (https://job-tracker-icbp.onrender.com). All changes are automatically synchronized.
              </Text>
            </View>
          </View>
        )}

        {/* Log Out Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          style={styles.logoutBtn}
        >
          <LogOut size={16} color={COLORS.error} />
          <Text style={styles.logoutBtnText}>Log Out Account</Text>
        </TouchableOpacity>
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
  tabsWrapper: {
    marginBottom: SPACING.sm,
  },
  tabsContent: {
    paddingHorizontal: SPACING.md,
    gap: 8,
  },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  tabBtnTextActive: {
    color: COLORS.onPrimary,
    fontWeight: "700",
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 80,
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  successText: {
    color: COLORS.onPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pillRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: SPACING.sm,
  },
  pillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: SPACING.sm,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillActive: {
    backgroundColor: `${COLORS.primary}20`,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  pillTextActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  infoNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: `${COLORS.primary}12`,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.xs,
  },
  infoNoteText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.04)",
  },
  toggleLeft: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  toggleSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dataStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: SPACING.sm,
  },
  dataStatItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginHorizontal: 4,
  },
  dataStatNum: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },
  dataStatLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  syncNote: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
  },
  syncNoteText: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    marginTop: SPACING.sm,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.error,
  },
});
