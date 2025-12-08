import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Job } from "@/types/job";

interface JobCardProps {
  job: Job;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function JobCard({ job, onPress }: JobCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const getMatchColor = () => {
    if (job.matchScore >= 80) return theme.success;
    if (job.matchScore >= 60) return theme.warning;
    return theme.error;
  };

  const getMatchBgColor = () => {
    if (job.matchScore >= 80) return theme.successLight;
    if (job.matchScore >= 60) return theme.warningLight;
    return theme.errorLight;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <View style={styles.header}>
        <View
          style={[styles.companyLogo, { backgroundColor: theme.backgroundSecondary }]}
        >
          <ThemedText type="h4" style={{ color: theme.link }}>
            {getInitials(job.company)}
          </ThemedText>
        </View>
        <View style={styles.headerInfo}>
          <ThemedText type="h4" numberOfLines={2} style={styles.title}>
            {job.title}
          </ThemedText>
          <ThemedText secondary type="body">
            {job.company}
          </ThemedText>
        </View>
        <View
          style={[styles.matchBadge, { backgroundColor: getMatchBgColor() }]}
        >
          <ThemedText
            type="h4"
            style={[styles.matchText, { color: getMatchColor() }]}
          >
            {job.matchScore}%
          </ThemedText>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.locationRow}>
          <Feather name="map-pin" size={14} color={theme.textSecondary} />
          <ThemedText secondary type="small">
            {job.location}
          </ThemedText>
        </View>
        <View style={styles.metaRow}>
          <View style={[styles.typeBadge, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText type="caption">{job.type}</ThemedText>
          </View>
          <ThemedText tertiary type="caption">
            {job.postedDate}
          </ThemedText>
        </View>
      </View>

      <View style={styles.chevron}>
        <Feather name="chevron-right" size={20} color={theme.textTertiary} />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    position: "relative",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  title: {
    marginBottom: 2,
  },
  matchBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  matchText: {
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 48 + Spacing.md,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  chevron: {
    position: "absolute",
    right: Spacing.lg,
    top: "50%",
    marginTop: -10,
  },
});
