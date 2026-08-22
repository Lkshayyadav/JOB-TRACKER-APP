import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { Check } from "lucide-react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import { ApplicationStatus } from "../../types";

interface StatusModalProps {
  visible: boolean;
  currentStatus: ApplicationStatus;
  onSelectStatus: (status: ApplicationStatus) => void;
  onClose: () => void;
}

const ALL_STATUSES: ApplicationStatus[] = [
  "Wishlist",
  "Applied",
  "OA",
  "Technical Round",
  "HR Round",
  "Offer",
  "Rejected",
];

export const StatusModal: React.FC<StatusModalProps> = ({
  visible,
  currentStatus,
  onSelectStatus,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.dragPill} />
              <Text style={styles.title}>Update Application Stage</Text>

              <View style={styles.statusList}>
                {ALL_STATUSES.map((status) => {
                  const isSelected = status === currentStatus;
                  const color = COLORS.status[status];

                  return (
                    <TouchableOpacity
                      key={status}
                      activeOpacity={0.7}
                      onPress={() => {
                        onSelectStatus(status);
                        onClose();
                      }}
                      style={[
                        styles.statusOption,
                        isSelected && { borderColor: color, backgroundColor: `${color}15` },
                      ]}
                    >
                      <View style={styles.statusLeft}>
                        <View style={[styles.statusDot, { backgroundColor: color }]} />
                        <Text
                          style={[
                            styles.statusText,
                            isSelected && { color: COLORS.text, fontWeight: "700" },
                          ]}
                        >
                          {status}
                        </Text>
                      </View>
                      {isSelected && <Check size={18} color={color} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.cardElevated,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  dragPill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.borderLight,
    alignSelf: "center",
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  statusList: {
    gap: SPACING.xs,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
});
