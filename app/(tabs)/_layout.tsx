import React from "react";
import { Tabs } from "expo-router";
import { LayoutDashboard, Layers, Clock, Bookmark, Globe, Settings as SettingsIcon } from "lucide-react-native";
import { COLORS } from "../../src/constants/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.cardElevated,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 9.5,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={19} color={color} />,
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: "Pipeline",
          tabBarIcon: ({ color, size }) => <Layers size={19} color={color} />,
        }}
      />
      <Tabs.Screen
        name="followups"
        options={{
          title: "Follow-ups",
          tabBarIcon: ({ color, size }) => <Clock size={19} color={color} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, size }) => <Bookmark size={19} color={color} />,
        }}
      />
      <Tabs.Screen
        name="platforms"
        options={{
          title: "Platforms",
          tabBarIcon: ({ color, size }) => <Globe size={19} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <SettingsIcon size={19} color={color} />,
        }}
      />
    </Tabs>
  );
}
