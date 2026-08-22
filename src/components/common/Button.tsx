import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from "react-native";
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from "../../constants/theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getContainerStyle = () => {
    switch (variant) {
      case "secondary":
        return styles.secondary;
      case "outline":
        return styles.outline;
      case "danger":
        return styles.danger;
      case "ghost":
        return styles.ghost;
      case "primary":
      default:
        return styles.primary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "secondary":
        return styles.textSecondary;
      case "outline":
        return styles.textOutline;
      case "danger":
        return styles.textDanger;
      case "ghost":
        return styles.textGhost;
      case "primary":
      default:
        return styles.textPrimary;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.base, getContainerStyle(), styles[size], (disabled || loading) && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? COLORS.onPrimary : COLORS.primary} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.textBase, getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  sm: { paddingVertical: 8, paddingHorizontal: 12 },
  md: { paddingVertical: 14, paddingHorizontal: 20 },
  lg: { paddingVertical: 16, paddingHorizontal: 24 },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  outline: {
    backgroundColor: "transparent",
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  danger: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderColor: COLORS.error,
    borderWidth: 1,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    fontSize: 14,
    fontWeight: "600",
  },
  textPrimary: {
    color: COLORS.onPrimary,
    fontWeight: "700",
  },
  textSecondary: {
    color: COLORS.text,
  },
  textOutline: {
    color: COLORS.text,
  },
  textDanger: {
    color: COLORS.error,
  },
  textGhost: {
    color: COLORS.textSecondary,
  },
});
