import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X, Check } from "lucide-react-native";
import { useApplicationStore } from "../../src/store/applicationStore";
import { Input } from "../../src/components/common/Input";
import { Button } from "../../src/components/common/Button";
import { ApplicationStatus, ApplicationPriority } from "../../src/types";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";

const STAGES: ApplicationStatus[] = [
  "Wishlist",
  "Applied",
  "OA",
  "Technical Round",
  "HR Round",
  "Offer",
  "Rejected",
];

const PRIORITIES: ApplicationPriority[] = ["Low", "Medium", "High"];

export default function CreateApplicationModal() {
  const router = useRouter();
  const { createApplication } = useApplicationStore();

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("Applied");
  const [priority, setPriority] = useState<ApplicationPriority>("Medium");
  const [appliedDate, setAppliedDate] = useState(new Date().toISOString().split("T")[0]);
  const [followUpDate, setFollowUpDate] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [salary, setSalary] = useState("");
  const [location, setLocation] = useState("");
  const [applicationMethod, setApplicationMethod] = useState("LinkedIn");
  const [recruiterName, setRecruiterName] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!company.trim() || !role.trim()) {
      setError("Please fill in company name and role title");
      return;
    }
    setLoading(true);
    setError("");

    const success = await createApplication({
      company: company.trim(),
      role: role.trim(),
      status,
      priority,
      appliedDate: appliedDate || new Date().toISOString().split("T")[0],
      followUpDate: followUpDate.trim() || undefined,
      jobUrl: jobUrl.trim() || undefined,
      salary: salary.trim() || undefined,
      location: location.trim() || undefined,
      applicationMethod,
      recruiterName: recruiterName.trim() || undefined,
      recruiterEmail: recruiterEmail.trim() || undefined,
      notes: notes.trim() || undefined,
      isPinned: false,
    });

    setLoading(false);
    if (success) {
      router.back();
    } else {
      setError("Failed to create application. Check network connection.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>New Application</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.saveHeaderBtn, loading && { opacity: 0.5 }]}
        >
          <Text style={styles.saveHeaderText}>Save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Primary Details */}
          <Input
            label="Company Name *"
            placeholder="e.g. Stripe, Google, Linear"
            value={company}
            onChangeText={setCompany}
          />

          <Input
            label="Job Role Title *"
            placeholder="e.g. Senior Frontend Engineer"
            value={role}
            onChangeText={setRole}
          />

          {/* Stage Selector Pills */}
          <Text style={styles.sectionLabel}>Pipeline Stage</Text>
          <View style={styles.pillGrid}>
            {STAGES.map((s) => {
              const isSel = status === s;
              const color = COLORS.status[s];
              return (
                <TouchableOpacity
                  key={s}
                  onPress={() => setStatus(s)}
                  style={[
                    styles.stagePill,
                    isSel && { borderColor: color, backgroundColor: `${color}20` },
                  ]}
                >
                  <Text style={[styles.stagePillText, isSel && { color, fontWeight: "700" }]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Priority Pills */}
          <Text style={styles.sectionLabel}>Priority</Text>
          <View style={styles.priorityRow}>
            {PRIORITIES.map((p) => {
              const isSel = priority === p;
              const color = COLORS.priority[p];
              return (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPriority(p)}
                  style={[
                    styles.priorityPill,
                    isSel && { borderColor: color, backgroundColor: `${color}20` },
                  ]}
                >
                  <Text style={[styles.priorityText, isSel && { color, fontWeight: "700" }]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Dates */}
          <Input
            label="Applied Date (YYYY-MM-DD)"
            placeholder="2026-08-22"
            value={appliedDate}
            onChangeText={setAppliedDate}
          />

          <Input
            label="Next Follow-up / Interview Date (YYYY-MM-DD)"
            placeholder="2026-08-29"
            value={followUpDate}
            onChangeText={setFollowUpDate}
          />

          {/* Compensation & Source */}
          <Input
            label="Target Salary / Compensation"
            placeholder="e.g. $140,000 / ₹24 LPA"
            value={salary}
            onChangeText={setSalary}
          />

          <Input
            label="Source / Method"
            placeholder="e.g. LinkedIn, Referral, Wellfound"
            value={applicationMethod}
            onChangeText={setApplicationMethod}
          />

          <Input
            label="Job Posting URL"
            placeholder="https://..."
            value={jobUrl}
            onChangeText={setJobUrl}
            autoCapitalize="none"
          />

          {/* Recruiter Details */}
          <Input
            label="Recruiter / Contact Name"
            placeholder="e.g. Sarah Connor"
            value={recruiterName}
            onChangeText={setRecruiterName}
          />

          <Input
            label="Recruiter Email"
            placeholder="sarah@company.com"
            value={recruiterEmail}
            onChangeText={setRecruiterEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {/* Notes */}
          <Input
            label="Preparation Notes"
            placeholder="Key discussion points, referral contacts, or requirements..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            style={{ height: 90, textAlignVertical: "top" }}
          />

          <Button
            title="Create Application"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  closeBtn: {
    padding: 8,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardElevated,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
  },
  saveHeaderBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  saveHeaderText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.onPrimary,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 80,
  },
  sectionLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "500",
    marginBottom: SPACING.xs,
    marginTop: SPACING.xs,
  },
  pillGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: SPACING.md,
  },
  stagePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stagePillText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  priorityRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: SPACING.md,
  },
  priorityPill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priorityText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  errorBox: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderColor: COLORS.error,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    textAlign: "center",
  },
  submitBtn: {
    marginTop: SPACING.md,
  },
});
