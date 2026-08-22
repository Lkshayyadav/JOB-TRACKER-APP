import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Sliders,
  User,
  Bell,
  Database,
  Download,
  Upload,
  LogOut,
  Check,
  Globe,
  Share2,
} from "lucide-react-native";
import { useAuthStore } from "../../src/store/authStore";
import { useApplicationStore } from "../../src/store/applicationStore";
import { PlatformAPI } from "../../src/api/platform.api";
import { Platform, ApplicationPriority } from "../../src/types";
import { Input } from "../../src/components/common/Input";
import { Button } from "../../src/components/common/Button";
import { Storage } from "../../src/utils/storage";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";

type SettingsTab = "defaults" | "data" | "profile" | "notifications";

const PRIORITIES: ApplicationPriority[] = ["High", "Medium", "Low"];
const METHODS = ["Website", "LinkedIn Easy Apply", "Referral", "Email", "Recruiter", "Other"];

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { applications, createApplication } = useApplicationStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>("defaults");

  // Tab 1: Defaults State
  const [defaultPriority, setDefaultPriority] = useState<ApplicationPriority>("Medium");
  const [defaultMethod, setDefaultMethod] = useState("Website");
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [defaultPlatformId, setDefaultPlatformId] = useState<string>("");

  // Tab 2: Profile Details State (Matching Screenshot 2)
  const nameParts = (user?.name || "").split(" ");
  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [twitter, setTwitter] = useState("");
  const [portfolio, setPortfolio] = useState("https://portfolio-theta-mocha-62.vercel.app/");

  // Tab 3: Notifications State
  const [interviewAlerts, setInterviewAlerts] = useState(true);
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

    Storage.getItem<string>("jobtrack_default_priority").then((val) => {
      if (val) setDefaultPriority(val as ApplicationPriority);
    });
    Storage.getItem<string>("jobtrack_default_method").then((val) => {
      if (val) setDefaultMethod(val);
    });
    Storage.getItem<any>("jobtrack_social_profiles").then((val) => {
      if (val) {
        if (val.linkedin) setLinkedin(val.linkedin);
        if (val.github) setGithub(val.github);
        if (val.twitter) setTwitter(val.twitter);
        if (val.portfolio) setPortfolio(val.portfolio);
      }
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

  const handleSaveProfile = async () => {
    await Storage.setItem("jobtrack_social_profiles", {
      linkedin,
      github,
      twitter,
      portfolio,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Tab 4: Data Management (Export CSV & Export JSON)
  const handleExportCSV = async () => {
    if (applications.length === 0) {
      Alert.alert("Export", "No applications to export yet.");
      return;
    }
    const headers = ["Company", "Role", "Status", "Priority", "Applied Date", "Notes"];
    const rows = applications.map((a) =>
      `"${a.company}","${a.role}","${a.status}","${a.priority}","${a.appliedDate}","${(a.notes || "").replace(/"/g, "'")}"`
    );
    const csvContent = [headers.join(","), ...rows].join("\n");
    await Share.share({ message: csvContent, title: "JobTrack_Applications.csv" });
  };

  const handleExportJSON = async () => {
    if (applications.length === 0) {
      Alert.alert("Export", "No applications to export yet.");
      return;
    }
    const jsonStr = JSON.stringify(applications, null, 2);
    await Share.share({ message: jsonStr, title: "JobTrack_Backup.json" });
  };

  const handleImportSampleCSV = async () => {
    Alert.alert(
      "Import Applications",
      "Would you like to import 2 sample application records to batch log entries?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          onPress: async () => {
            await createApplication({
              company: "Stripe",
              role: "Mobile Software Engineer",
              status: "Applied",
              priority: "High",
              appliedDate: new Date().toISOString().split("T")[0],
              notes: "Imported via CSV batch log.",
            });
            await createApplication({
              company: "Vercel",
              role: "React Native Developer",
              status: "OA",
              priority: "High",
              appliedDate: new Date().toISOString().split("T")[0],
              notes: "Imported via CSV batch log.",
            });
            Alert.alert("Success", "Imported 2 application records into your pipeline!");
          },
        },
      ]
    );
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
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Configure your personal preferences, template defaults, and CSV data flows.</Text>
      </View>

      {/* 4 Segmented Tabs (Matching Web Screenshot) */}
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
            onPress={() => setActiveTab("data")}
            style={[styles.tabBtn, activeTab === "data" && styles.tabBtnActive]}
          >
            <Database size={14} color={activeTab === "data" ? COLORS.onPrimary : COLORS.textSecondary} />
            <Text style={[styles.tabBtnText, activeTab === "data" && styles.tabBtnTextActive]}>
              Data Management
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

            <Text style={styles.fieldLabel}>DEFAULT PLATFORM</Text>
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

            <Text style={styles.fieldLabel}>DEFAULT PRIORITY</Text>
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

            <Text style={styles.fieldLabel}>DEFAULT APPLICATION METHOD</Text>
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

            <Button
              title="Save Defaults"
              onPress={handleSaveDefaults}
              style={{ marginTop: SPACING.lg }}
            />
          </View>
        )}

        {/* TAB 2: DATA MANAGEMENT (Matching Screenshot 3) */}
        {activeTab === "data" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Bulk Data Controls</Text>
            <Text style={styles.cardDesc}>
              Export your application details or import previously logged positions via CSV.
            </Text>

            {/* Import Card */}
            <View style={styles.subCard}>
              <View style={styles.subCardHeader}>
                <Upload size={16} color={COLORS.primary} />
                <Text style={styles.subCardTitle}>Import Applications</Text>
              </View>
              <Text style={styles.subCardDesc}>
                Upload a CSV file containing columns like Company, Role, Source, Status, Priority, and Notes to batch log entries.
              </Text>
              <Button
                title="Choose CSV File"
                variant="outline"
                onPress={handleImportSampleCSV}
                style={{ marginTop: SPACING.sm }}
              />
            </View>

            {/* Export Card */}
            <View style={[styles.subCard, { marginTop: SPACING.md }]}>
              <View style={styles.subCardHeader}>
                <Download size={16} color={COLORS.success} />
                <Text style={styles.subCardTitle}>Export Applications</Text>
              </View>
              <Text style={styles.subCardDesc}>
                Download a full snapshot of your job tracking records. Highly recommended for backing up logs.
              </Text>
              <View style={styles.exportBtnRow}>
                <Button
                  title="Export CSV"
                  variant="outline"
                  onPress={handleExportCSV}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Export JSON"
                  variant="outline"
                  onPress={handleExportJSON}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </View>
        )}

        {/* TAB 3: PROFILE DETAILS (Matching Screenshot 2) */}
        {activeTab === "profile" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Profile Details</Text>
            <Text style={styles.cardDesc}>Update your email address and profile details.</Text>

            <View style={styles.twoColRow}>
              <View style={{ flex: 1 }}>
                <Input label="FIRST NAME" value={firstName} onChangeText={setFirstName} />
              </View>
              <View style={{ flex: 1 }}>
                <Input label="LAST NAME" value={lastName} onChangeText={setLastName} />
              </View>
            </View>

            <Input label="EMAIL ADDRESS" value={email} onChangeText={setEmail} autoCapitalize="none" />
            <Input label="CURRENT PASSWORD" isPassword placeholder="••••••••" value={currentPassword} onChangeText={setCurrentPassword} />

            {/* Social Links & Web Profiles */}
            <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>SOCIAL LINKS & WEB PROFILES</Text>

            <Input
              label="LINKEDIN PROFILE"
              placeholder="https://linkedin.com/in/username"
              value={linkedin}
              onChangeText={setLinkedin}
              autoCapitalize="none"
            />

            <Input
              label="GITHUB PROFILE"
              placeholder="https://github.com/username"
              value={github}
              onChangeText={setGithub}
              autoCapitalize="none"
            />

            <Input
              label="X / TWITTER PROFILE"
              placeholder="https://x.com/username"
              value={twitter}
              onChangeText={setTwitter}
              autoCapitalize="none"
            />

            <Input
              label="PORTFOLIO / PERSONAL SITE"
              placeholder="https://portfolio-theta-mocha-62.vercel.app/"
              value={portfolio}
              onChangeText={setPortfolio}
              autoCapitalize="none"
            />

            <View style={styles.profileBtnRow}>
              <Button
                title="Discard"
                variant="outline"
                onPress={() => {
                  setFirstName(nameParts[0] || "");
                  setLastName(nameParts.slice(1).join(" ") || "");
                }}
                style={{ flex: 1 }}
              />
              <Button
                title="Save Changes"
                onPress={handleSaveProfile}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}

        {/* TAB 4: NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notifications Preference</Text>
            <Text style={styles.cardDesc}>Control how and when you receive application reminders.</Text>

            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleTitle}>Interview reminders</Text>
                <Text style={styles.toggleSub}>Receive email notifications 24 hours prior to scheduled interviews.</Text>
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
                <Text style={styles.toggleTitle}>Weekly progress digest</Text>
                <Text style={styles.toggleSub}>Get a weekly email summary of your application statistics and status changes.</Text>
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
    lineHeight: 16,
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
    fontSize: 11,
    fontWeight: "700",
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
  twoColRow: {
    flexDirection: "row",
    gap: 10,
  },
  subCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  subCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  subCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  subCardDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  exportBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: SPACING.sm,
  },
  profileBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: SPACING.lg,
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
