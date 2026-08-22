import React, { useEffect, useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  Bookmark,
} from "lucide-react-native";
import { PlatformAPI } from "../../src/api/platform.api";
import { Platform } from "../../src/types";
import { Input } from "../../src/components/common/Input";
import { Button } from "../../src/components/common/Button";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";

const COLOR_PRESETS = [
  { name: "LinkedIn Blue", hex: "#0A66C2" },
  { name: "Wellfound Dark", hex: "#111827" },
  { name: "Indeed Blue", hex: "#2164F3" },
  { name: "YC Orange", hex: "#FF6600" },
  { name: "Greenhouse", hex: "#22C55E" },
  { name: "Electric Lime", hex: "#CCFF00" },
  { name: "Purple", hex: "#8B5CF6" },
  { name: "Rose", hex: "#F43F5E" },
];

export default function PlatformsScreen() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [color, setColor] = useState("#0A66C2");
  const [isDefault, setIsDefault] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const loadPlatforms = async () => {
    setLoading(true);
    try {
      const data = await PlatformAPI.getPlatformStats();
      setPlatforms(data);
    } catch {
      try {
        const data = await PlatformAPI.getPlatforms();
        setPlatforms(data);
      } catch {
        // ignore
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlatforms();
  }, []);

  const handleOpenCreate = () => {
    setEditingPlatform(null);
    setName("");
    setUrl("");
    setColor("#0A66C2");
    setIsDefault(false);
    setFormError("");
    setModalVisible(true);
  };

  const handleOpenEdit = (p: Platform) => {
    setEditingPlatform(p);
    setName(p.name);
    setUrl(p.url || "");
    setColor(p.color || "#0A66C2");
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
          url: url.trim() || undefined,
          color,
          isDefault,
        });
      } else {
        await PlatformAPI.createPlatform({
          name: name.trim(),
          url: url.trim() || undefined,
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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Job Platforms</Text>
          <Text style={styles.subtitle}>{platforms.length} sources & job boards tracked</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpenCreate}
          style={styles.addBtn}
        >
          <Plus size={18} color={COLORS.onPrimary} />
          <Text style={styles.addBtnText}>Add Platform</Text>
        </TouchableOpacity>
      </View>

      {/* Platforms Grid / List */}
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
                  <View>
                    <View style={styles.titleRow}>
                      <Text style={styles.platformName}>{item.name}</Text>
                      {item.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Star size={10} color={COLORS.primary} />
                          <Text style={styles.defaultText}>Default</Text>
                        </View>
                      )}
                    </View>
                    {item.url ? (
                      <TouchableOpacity onPress={() => handleOpenUrl(item.url)} style={styles.urlRow}>
                        <Text style={styles.urlText}>{item.url}</Text>
                        <ExternalLink size={11} color={COLORS.textMuted} />
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.noUrlText}>No URL added</Text>
                    )}
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    onPress={() => handleOpenEdit(item)}
                    style={styles.actionBtn}
                  >
                    <Edit2 size={16} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(item)}
                    style={styles.actionBtn}
                  >
                    <Trash2 size={16} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Stats Footer */}
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

      {/* Add / Edit Platform Modal */}
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
                label="Platform Name *"
                placeholder="e.g. LinkedIn, Wellfound, Indeed"
                value={name}
                onChangeText={setName}
              />

              <Input
                label="Website URL"
                placeholder="e.g. linkedin.com"
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
              />

              {/* Color Theme Selector */}
              <Text style={styles.sectionLabel}>Theme Color</Text>
              <View style={styles.presetGrid}>
                {COLOR_PRESETS.map((p) => {
                  const isSel = color === p.hex;
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
                      {isSel && <Check size={14} color="#FFF" />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Default Toggle */}
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

              <Button
                title={editingPlatform ? "Update Platform" : "Save Platform"}
                onPress={handleSubmit}
                loading={formLoading}
                style={{ marginTop: SPACING.md }}
              />
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
    width: 40,
    height: 40,
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
    maxHeight: "85%",
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
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "500",
    marginBottom: SPACING.xs,
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: SPACING.md,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    marginBottom: SPACING.sm,
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
