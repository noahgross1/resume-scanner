import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Linking,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { SkillChip } from "@/components/SkillChip";
import { MatchScoreBadge } from "@/components/MatchScoreBadge";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { SearchStackParamList } from "@/navigation/SearchStackNavigator";
import { mockJobs } from "@/data/mockData";

type JobDetailScreenProps = {
  navigation: NativeStackNavigationProp<SearchStackParamList, "JobDetail">;
  route: RouteProp<SearchStackParamList, "JobDetail">;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function JobDetailScreen({
  navigation,
  route,
}: JobDetailScreenProps) {
  const { theme } = useTheme();
  const { jobId } = route.params;
  const job = mockJobs.find((j) => j.id === jobId);
  const [isSaved, setIsSaved] = useState(false);
  const [showImprove, setShowImprove] = useState(false);

  const heartScale = useSharedValue(1);

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  if (!job) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText>Job not found</ThemedText>
      </View>
    );
  }

  const handleSave = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    heartScale.value = withSpring(1.3, { damping: 4, stiffness: 300 }, () => {
      heartScale.value = withSpring(1);
    });
    setIsSaved(!isSaved);
  };

  const handleApply = async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    try {
      const canOpen = await Linking.canOpenURL(job.applyUrl);
      if (canOpen) {
        await Linking.openURL(job.applyUrl);
      } else {
        Alert.alert("Error", "Unable to open the application link");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open the link");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScreenScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View
            style={[
              styles.companyLogo,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText type="h3" style={{ color: theme.link }}>
              {getInitials(job.company)}
            </ThemedText>
          </View>
          <AnimatedPressable
            onPress={handleSave}
            style={[
              styles.saveButton,
              { backgroundColor: theme.backgroundDefault },
              heartAnimatedStyle,
            ]}
          >
            <Feather
              name={isSaved ? "heart" : "heart"}
              size={24}
              color={isSaved ? theme.error : theme.textSecondary}
            />
          </AnimatedPressable>
        </View>

        <ThemedText type="h2" style={styles.title}>
          {job.title}
        </ThemedText>
        <ThemedText secondary type="body" style={styles.company}>
          {job.company}
        </ThemedText>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="map-pin" size={16} color={theme.textSecondary} />
            <ThemedText secondary type="small">
              {job.location}
            </ThemedText>
          </View>
          <View style={styles.metaItem}>
            <Feather name="clock" size={16} color={theme.textSecondary} />
            <ThemedText secondary type="small">
              {job.postedDate}
            </ThemedText>
          </View>
        </View>

        {job.salary ? (
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="dollar-sign" size={16} color={theme.textSecondary} />
              <ThemedText secondary type="small">
                {job.salary}
              </ThemedText>
            </View>
            <View
              style={[styles.jobTypeBadge, { backgroundColor: theme.backgroundDefault }]}
            >
              <ThemedText type="small">{job.type}</ThemedText>
            </View>
          </View>
        ) : null}

        <Spacer height={Spacing.xl} />

        <MatchScoreBadge score={job.matchScore} />

        <Spacer height={Spacing.xl} />

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Matched Skills
          </ThemedText>
          <View style={styles.chipContainer}>
            {job.matchedSkills.map((skill, index) => (
              <SkillChip key={index} label={skill} type="matched" />
            ))}
          </View>
        </View>

        {job.missingSkills.length > 0 ? (
          <View style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Missing Qualifications
            </ThemedText>
            <View style={styles.chipContainer}>
              {job.missingSkills.map((skill, index) => (
                <SkillChip key={index} label={skill} type="missing" />
              ))}
            </View>
          </View>
        ) : null}

        {job.howToImprove.length > 0 ? (
          <View style={styles.section}>
            <Pressable
              style={[
                styles.improveHeader,
                { backgroundColor: theme.backgroundDefault },
              ]}
              onPress={() => setShowImprove(!showImprove)}
            >
              <View style={styles.improveHeaderContent}>
                <Feather name="trending-up" size={20} color={theme.link} />
                <ThemedText type="h4">How to Improve</ThemedText>
              </View>
              <Feather
                name={showImprove ? "chevron-up" : "chevron-down"}
                size={20}
                color={theme.textSecondary}
              />
            </Pressable>
            {showImprove ? (
              <View
                style={[
                  styles.improveContent,
                  { backgroundColor: theme.backgroundDefault },
                ]}
              >
                {job.howToImprove.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <View
                      style={[styles.tipNumber, { backgroundColor: theme.link }]}
                    >
                      <ThemedText
                        type="small"
                        style={{ color: "#FFFFFF", fontWeight: "600" }}
                      >
                        {index + 1}
                      </ThemedText>
                    </View>
                    <ThemedText type="body" style={styles.tipText}>
                      {tip}
                    </ThemedText>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Job Description
          </ThemedText>
          <ThemedText secondary type="body" style={styles.description}>
            {job.description}
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Requirements
          </ThemedText>
          {job.requirements.map((req, index) => (
            <View key={index} style={styles.requirementItem}>
              <Feather name="check-circle" size={18} color={theme.success} />
              <ThemedText type="body" style={styles.requirementText}>
                {req}
              </ThemedText>
            </View>
          ))}
        </View>

        <Spacer height={100} />
      </ScreenScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: theme.backgroundRoot, ...Shadows.lg },
        ]}
      >
        <Button onPress={handleApply}>Apply Now</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  companyLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginBottom: Spacing.xs,
  },
  company: {
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  jobTypeBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  improveHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  improveHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  improveContent: {
    padding: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
    marginTop: -BorderRadius.md,
    paddingTop: Spacing.xl,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tipText: {
    flex: 1,
  },
  description: {
    lineHeight: 24,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  requirementText: {
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
    paddingBottom: Spacing["2xl"],
  },
});
