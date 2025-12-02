import React, { useState } from "react";
import { StyleSheet, View, Pressable, Switch, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface SettingItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  subtitle?: string;
  hasToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
}

function SettingItem({
  icon,
  label,
  subtitle,
  hasToggle,
  toggleValue,
  onToggle,
  onPress,
}: SettingItemProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingItem,
        {
          backgroundColor: theme.backgroundDefault,
          opacity: pressed && !hasToggle ? 0.8 : 1,
        },
      ]}
      onPress={hasToggle ? undefined : onPress}
      disabled={hasToggle}
    >
      <View style={styles.settingContent}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <Feather name={icon} size={20} color={theme.link} />
        </View>
        <View style={styles.textContainer}>
          <ThemedText type="body" style={styles.settingLabel}>
            {label}
          </ThemedText>
          {subtitle ? (
            <ThemedText secondary type="small">
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
      </View>
      {hasToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: theme.border, true: theme.link }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <Feather name="chevron-right" size={20} color={theme.textTertiary} />
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [locationServices, setLocationServices] = useState(true);

  const handleClearCache = () => {
    Alert.alert("Clear Cache", "Are you sure you want to clear the app cache?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => Alert.alert("Success", "Cache cleared successfully"),
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            Alert.alert("Account Deleted", "Your account has been deleted"),
        },
      ]
    );
  };

  return (
    <ScreenScrollView>
      <View style={styles.section}>
        <ThemedText type="small" secondary style={styles.sectionLabel}>
          NOTIFICATIONS
        </ThemedText>
        <Spacer height={Spacing.sm} />
        <SettingItem
          icon="bell"
          label="Push Notifications"
          subtitle="Get notified about new job matches"
          hasToggle
          toggleValue={notifications}
          onToggle={setNotifications}
        />
        <Spacer height={Spacing.sm} />
        <SettingItem
          icon="mail"
          label="Email Alerts"
          subtitle="Receive weekly job digest"
          hasToggle
          toggleValue={emailAlerts}
          onToggle={setEmailAlerts}
        />
      </View>

      <Spacer height={Spacing.xl} />

      <View style={styles.section}>
        <ThemedText type="small" secondary style={styles.sectionLabel}>
          PREFERENCES
        </ThemedText>
        <Spacer height={Spacing.sm} />
        <SettingItem
          icon="map-pin"
          label="Location Services"
          subtitle="Use location for job search"
          hasToggle
          toggleValue={locationServices}
          onToggle={setLocationServices}
        />
        <Spacer height={Spacing.sm} />
        <SettingItem
          icon="globe"
          label="Language"
          subtitle="English"
          onPress={() => Alert.alert("Language", "Language settings")}
        />
      </View>

      <Spacer height={Spacing.xl} />

      <View style={styles.section}>
        <ThemedText type="small" secondary style={styles.sectionLabel}>
          DATA & STORAGE
        </ThemedText>
        <Spacer height={Spacing.sm} />
        <SettingItem
          icon="trash"
          label="Clear Cache"
          subtitle="Free up storage space"
          onPress={handleClearCache}
        />
        <Spacer height={Spacing.sm} />
        <SettingItem
          icon="download"
          label="Export Data"
          subtitle="Download your data"
          onPress={() => Alert.alert("Export", "Data export started")}
        />
      </View>

      <Spacer height={Spacing.xl} />

      <View style={styles.section}>
        <ThemedText type="small" secondary style={styles.sectionLabel}>
          DANGER ZONE
        </ThemedText>
        <Spacer height={Spacing.sm} />
        <Pressable
          style={({ pressed }) => [
            styles.dangerItem,
            {
              backgroundColor: theme.errorLight,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={handleDeleteAccount}
        >
          <Feather name="alert-triangle" size={20} color={theme.error} />
          <ThemedText type="body" style={{ color: theme.error }}>
            Delete Account
          </ThemedText>
        </Pressable>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  section: {},
  sectionLabel: {
    fontWeight: "600",
    letterSpacing: 0.5,
    marginLeft: Spacing.xs,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  settingLabel: {
    fontWeight: "500",
  },
  dangerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
});
