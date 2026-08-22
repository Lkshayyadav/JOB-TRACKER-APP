import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  RefreshControl,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import {
  Globe,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Star,
  Check,
  X,
  Briefcase,
} from "lucide-react-native";
import { PlatformAPI } from "../../src/api/platform.api";
import { Platform } from "../../src/types";
import { Input } from "../../src/components/common/Input";
import { Button } from "../../src/components/common/Button";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";

const COLOR_PRESETS = [
  { name: "Sky", hex: "#0EA5E9" },
  { name: "Dark", hex: "#1E293B" },
  { name: "Black", hex: "#000000" },
  { name: "Blue", hex: "#2563EB" },
  { name: "Indigo", hex: "#4F46E5" },
  { name: "Green", hex: "#10B981" },
  { name: "Amber", hex: "#F59E0B" },
  { name: "Slate", hex: "#64748B" },
  { name: "Lime", hex: "#CCFF00" },
];

export default function PlatformsScreen() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [logo, setLogo] = useState("");
  const [color, setColor] = useState("#4F46E5");
  const [description, setDescription] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const loadPlatforms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await PlatformAPI.getPlatformStats();
      if (Array.isArray(data)) {
        setPlatforms(data);
      } else {
        const raw = await PlatformAPI.getPlatforms();
        if (Array.isArray(raw)) setPlatforms(raw);
      }
    } catch {
      try {
        const raw = await PlatformAPI.getPlatforms();
        if (Array.isArray(raw)) setPlatforms(raw);
      } catch {
        // ignore
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPlatforms();
    }, [loadPlatforms])
  );

  const handleOpenCreate = () => {
    setEditingPlatform(null);
    setName("");
    setWebsite("");
    setLogo("");
    setColor("#4F46E5");
    setDescription("");
    setIsDefault(false);
    setFormError("");
    setModalVisible(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditingPlatform(p);
    setName(p.name || "");
    setWebsite(p.url || p.website || "");
    setLogo(p.icon || p.logo || "");
    setColor(p.color || "#4F46E5");
    setDescription(p.description || "");
    setIsDefault(Boolean(p.isDefault));
    setFormError("");
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setFormError("Please enter platform name");
      return;
    }
    setFormLoading(true);
    setFormError("");

    try {
      if (editingPlatform) {
        await PlatformAPI.updatePlatform(editingPlatform._id, {
          name: name.trim(),
          url: website.trim() || undefined,
          icon: logo.trim() || undefined,
          color,
          isDefault,
        });
      } else {
        await PlatformAPI.createPlatform({
          name: name.trim(),
          url: website.trim() || undefined,
          icon: logo.trim() || undefined,
          color,
          isDefault,
        });
      }
      setModalVisible(false);
      loadPlatforms();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to save platform");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (p: Platform) => {
    Alert.alert(
      "Delete Platform",
      `Are you sure you want to remove ${p.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await PlatformAPI.deletePlatform(p._id);
            loadPlatforms();
          },
        },
      ]
    );
  };

  const handleOpenUrl = (siteUrl?: string) => {
    if (!siteUrl) return;
    const full = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;
    Linking.openURL(full).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Platform Management</Text>
          <Text style={styles.subtitle}>{platforms.length} sources & job boards tracked</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpenCreate}
          style={styles.addBtn}
        >
          <Plus size={16} color={COLORS.onPrimary} />
          <Text style={styles.addBtnText}>+ Add Platform</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={styles.loadingText}>Syncing Platform Sources...</Text>
        </View>
      ) : (
        <FlatList
          data={platforms}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadPlatforms}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          renderItem={({ item }) => {
            const itemColor = item.color || COLORS.primary;

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.headerLeft}>
                    <View style={[styles.platformIcon, { backgroundColor: `${itemColor}20`, borderColor: itemColor }]}>
                      <Globe size={18} color={itemColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.titleRow}>
                        <Text style={styles.platformName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        {item.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Star size={10} color={COLORS.primary} />
                            <Text style={styles.defaultText}>Default</Text>
                          </View>
                        )}
                      </View>
                      {item.url ? (
                        <TouchableOpacity onPress={() => handleOpenUrl(item.url)} style={styles.urlRow}>
                          <Text style={styles.urlText} numberOfLines={1}>
                            {item.url}
                          </Text>
                          <ExternalLink size={11} color={COLORS.textMuted} />
                        </TouchableOpacity>
                      ) : (
                        <Text style={styles.noUrlText}>No URL added</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity onPress={() => handleOpenEdit(item)} style={styles.actionBtn}>
                      <Edit2 size={15} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
                      <Trash2 size={15} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.metricItem}>
                    <Briefcase size={13} color={COLORS.textMuted} />
                    <Text style={styles.metricLabel}>Applications:</Text>
                    <Text style={styles.metricVal}>{item.totalApplications || 0}</Text>
                  </View>

                  {item.successRate !== undefined && (
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Success Rate:</Text>
                      <Text style={[styles.metricVal, { color: COLORS.primary }]}>
                        {item.successRate}%
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Globe size={40} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No Platforms Added</Text>
              <Text style={styles.emptyDesc}>
                Add job platforms like LinkedIn, Wellfound, Indeed, or Referral networks to track your application sources.
              </Text>
            </View>
          }
        />
      )}

      {/* Edit / Add Platform Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingPlatform ? "Edit Platform" : "Add Platform"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 20 }}>
              {formError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{formError}</Text>
                </View>
              ) : null}

              <Input
                label="PLATFORM NAME *"
                placeholder="e.g. LinkedIn, Wellfound"
                value={name}
                onChangeText={setName}
              />

              <Input
                label="WEBSITE URL"
                placeholder="e.g. linkedin.com"
                value={website}
                onChangeText={setWebsite}
                autoCapitalize="none"
              />

              <Input
                label="LOGO URL (OPTIONAL)"
                placeholder="e.g. https://domain.com/logo.png"
                value={logo}
                onChangeText={setLogo}
                autoCapitalize="none"
              />

              <Text style={styles.sectionLabel}>COLOR THEME</Text>
              <View style={styles.colorInputRow}>
                <View style={[styles.colorPreviewBox, { backgroundColor: color }]} />
                <View style={{ flex: 1 }}>
                  <Input
                    value={color}
                    onChangeText={setColor}
                    placeholder="#4F46E5"
                    style={{ marginBottom: 0 }}
                  />
                </View>
              </View>

              <View style={styles.presetGrid}>
                {COLOR_PRESETS.map((p) => {
                  const isSel = color.toLowerCase() === p.hex.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={p.hex}
                      onPress={() => setColor(p.hex)}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: p.hex },
                        isSel && styles.colorCircleSelected,
                      ]}
                    >
                      {isSel && <Check size={12} color="#FFF" />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Input
                label="DESCRIPTION (OPTIONAL)"
                placeholder="Keep quick notes about job boards, profiles, referral networks..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                style={{ height: 70, textAlignVertical: "top" }}
              />

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsDefault(!isDefault)}
                style={styles.defaultToggleRow}
              >
                <View style={[styles.checkbox, isDefault && styles.checkboxActive]}>
                  {isDefault && <Check size={14} color={COLORS.onPrimary} />}
                </View>
                <Text style={styles.toggleLabel}>Set as Default Platform</Text>
              </TouchableOpacity>

              <View style={styles.modalBtnRow}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setModalVisible(false)}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Save Platform"
                  onPress={handleSubmit}
                  loading={formLoading}
                  style={{ flex: 1 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    flex: 1,
  },
  platformIcon: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  platformName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  defaultBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: `${COLORS.primary}18`,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.full,
  },
  defaultText: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.primary,
  },
  urlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  urlText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  noUrlText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionBtn: {
    padding: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.04)",
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  metricVal: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: COLORS.cardElevated,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    maxHeight: "88%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
  },
  closeBtn: {
    padding: 6,
  },
  sectionLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "700",
    marginBottom: SPACING.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  colorInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: SPACING.sm,
  },
  colorPreviewBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: SPACING.md,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  colorCircleSelected: {
    borderWidth: 2,
    borderColor: "#FFF",
  },
  defaultToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleLabel: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "500",
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: SPACING.sm,
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
});
