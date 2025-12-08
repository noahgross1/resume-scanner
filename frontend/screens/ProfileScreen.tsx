import React from "react";
import { StyleSheet, View, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";
import { mockUser, mockResumes } from "@/data/mockData";

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, "Profile">;
};

interface MenuItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}

function MenuItem({ icon, label, subtitle, onPress, danger }: MenuItemProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
      ]}
      onPress={onPress}
    >
      <View style={styles.menuItemContent}>
        <View
          style={[
            styles.menuIconContainer,
            {
              backgroundColor: danger
                ? theme.errorLight
                : theme.backgroundSecondary,
            },
          ]}
        >
          <Feather
            name={icon}
            size={20}
            color={danger ? theme.error : theme.link}
          />
        </View>
        <View style={styles.menuTextContainer}>
          <ThemedText
            type="body"
            style={[styles.menuLabel, danger ? { color: theme.error } : null]}
          >
            {label}
          </ThemedText>
          {subtitle ? (
            <ThemedText secondary type="small">
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
      </View>
      <Feather name="chevron-right" size={20} color={theme.textTertiary} />
    </Pressable>
  );
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { theme } = useTheme();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          Alert.alert("Logged Out", "You have been logged out successfully");
        },
      },
    ]);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <ScreenScrollView>
      <View style={styles.profileHeader}>
        <Pressable style={[styles.avatar, { backgroundColor: theme.link }]}>
          <ThemedText type="h1" style={{ color: "#FFFFFF" }}>
            {getInitials(mockUser.name)}
          </ThemedText>
          <View
            style={[styles.editBadge, { backgroundColor: theme.backgroundRoot }]}
          >
            <Feather name="edit-2" size={12} color={theme.link} />
          </View>
        </Pressable>
        <Spacer height={Spacing.lg} />
        <ThemedText type="h2">{mockUser.name}</ThemedText>
        <ThemedText secondary type="body">
          {mockUser.email}
        </ThemedText>
      </View>

      <Spacer height={Spacing["2xl"]} />

      <View style={styles.section}>
        <ThemedText type="small" secondary style={styles.sectionLabel}>
          ACCOUNT
        </ThemedText>
        <Spacer height={Spacing.sm} />
        <MenuItem
          icon="file-text"
          label="My Resumes"
          subtitle={`${mockResumes.length} resumes uploaded`}
          onPress={() => navigation.navigate("Resumes")}
        />
        <Spacer height={Spacing.sm} />
        <MenuItem
          icon="settings"
          label="Settings"
          onPress={() => navigation.navigate("Settings")}
        />
      </View>

      <Spacer height={Spacing.xl} />

      <View style={styles.section}>
        <ThemedText type="small" secondary style={styles.sectionLabel}>
          SUPPORT
        </ThemedText>
        <Spacer height={Spacing.sm} />
        <MenuItem
          icon="help-circle"
          label="Help & Support"
          onPress={() => Alert.alert("Help", "Contact support@jobmatch.app")}
        />
        <Spacer height={Spacing.sm} />
        <MenuItem
          icon="shield"
          label="Privacy Policy"
          onPress={() => Alert.alert("Privacy", "Privacy policy content")}
        />
      </View>

      <Spacer height={Spacing.xl} />

      <View style={styles.section}>
        <MenuItem icon="log-out" label="Log Out" onPress={handleLogout} danger />
      </View>

      <Spacer height={Spacing.xl} />

      <ThemedText tertiary type="caption" style={styles.version}>
        JobMatch v1.0.0
      </ThemedText>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: "center",
    paddingTop: Spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {},
  sectionLabel: {
    fontWeight: "600",
    letterSpacing: 0.5,
    marginLeft: Spacing.xs,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextContainer: {
    gap: 2,
  },
  menuLabel: {
    fontWeight: "500",
  },
  version: {
    textAlign: "center",
  },
});
