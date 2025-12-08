import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

import { ScreenFlatList } from "@/components/ScreenFlatList";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { JobCard } from "@/components/JobCard";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { SearchStackParamList } from "@/navigation/SearchStackNavigator";
import { mockJobs } from "@/data/mockData";
import { Job } from "@/types/job";

type JobResultsScreenProps = {
  navigation: NativeStackNavigationProp<SearchStackParamList, "JobResults">;
  route: RouteProp<SearchStackParamList, "JobResults">;
};

export default function JobResultsScreen({
  navigation,
  route,
}: JobResultsScreenProps) {
  const { theme } = useTheme();
  const { jobTitle, location } = route.params;
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setJobs(mockJobs);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleJobPress = (jobId: string) => {
    navigation.navigate("JobDetail", { jobId });
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View
        style={[styles.searchSummary, { backgroundColor: theme.backgroundDefault }]}
      >
        <View style={styles.searchInfo}>
          <ThemedText type="h4">{jobTitle}</ThemedText>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={14} color={theme.textSecondary} />
            <ThemedText secondary type="small">
              {location}
            </ThemedText>
          </View>
        </View>
        <Pressable
          style={[styles.filterButton, { backgroundColor: theme.backgroundSecondary }]}
        >
          <Feather name="sliders" size={18} color={theme.text} />
        </Pressable>
      </View>
      <Spacer height={Spacing.lg} />
      <ThemedText secondary type="small">
        {isLoading ? "Searching..." : `${jobs.length} jobs found`}
      </ThemedText>
      <Spacer height={Spacing.md} />
    </View>
  );

  const renderItem = ({ item }: { item: Job }) => (
    <>
      <JobCard job={item} onPress={() => handleJobPress(item.id)} />
      <Spacer height={Spacing.md} />
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View
        style={[
          styles.emptyIcon,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        <Feather name="search" size={48} color={theme.textTertiary} />
      </View>
      <ThemedText type="h3" style={styles.emptyTitle}>
        No Jobs Found
      </ThemedText>
      <ThemedText secondary style={styles.emptySubtitle}>
        Try adjusting your search criteria or location
      </ThemedText>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.link} />
      <Spacer height={Spacing.lg} />
      <ThemedText secondary>Finding your perfect job matches...</ThemedText>
    </View>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        {renderHeader()}
        {renderLoading()}
      </ThemedView>
    );
  }

  return (
    <ScreenFlatList
      data={jobs}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: Spacing.md,
  },
  searchSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  searchInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["5xl"],
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["5xl"],
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    textAlign: "center",
  },
});
