import React from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface SkillChipProps {
  label: string;
  type: "matched" | "missing";
}

export function SkillChip({ label, type }: SkillChipProps) {
  const { theme } = useTheme();

  const backgroundColor = type === "matched" ? theme.successLight : theme.warningLight;
  const textColor = type === "matched" ? theme.successDark : theme.warningDark;

  return (
    <View style={[styles.chip, { backgroundColor }]}>
      <ThemedText type="small" style={[styles.label, { color: textColor }]}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  label: {
    fontWeight: "500",
  },
});
