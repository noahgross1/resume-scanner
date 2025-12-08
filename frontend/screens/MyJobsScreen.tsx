import React, { useState } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ScreenFlatList } from "@/components/ScreenFlatList";
import { ThemedText } from "@/components/ThemedText";
import { JobCard } from "@/components/JobCard";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MyJobsStackParamList } from "@/navigation/MyJobsStackNavigator";
import { mockJobs } from "@/data/mockData";
import { Job } from "@/types/job";

type MyJobsScreenProps = {
  navigation: NativeStackNavigationProp<MyJobsStackParamList, "MyJobs">;
};

type TabType = "saved" | "applied";

export default function MyJobsScreen({ navigation }: MyJobsScreenProps) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>("saved");

  const savedJobs = mockJobs.slice(0, 2);
  const appliedJobs = mockJobs.slice(2, 3);

  const currentJobs = activeTab === "saved" ? savedJobs : appliedJobs;

  const handleJobPress = (jobId: string) => {
    navigation.navigate("JobDetail", { jobId });
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.tabContainer}>
        <Pressable
          style={[
            styles.tab,
            {
              backgroundColor:
                activeTab === "saved" ? theme.link : theme.backgroundDefault,
            },
          ]}
          onPress={() => setActiveTab("saved")}
        >
          <Feather
            name="heart"
            size={18}
            color={activeTab === "saved" ? "#FFFFFF" : theme.textSecondary}
          />
          <ThemedText
            style={[
              styles.tabText,
              { color: activeTab === "saved" ? "#FFFFFF" : theme.textSecondary },
            ]}
          >
            Saved ({savedJobs.length})
          </ThemedText>
        </Pressable>
        <Pressable
          style={[
            styles.tab,
            {
              backgroundColor:
                activeTab === "applied" ? theme.link : theme.backgroundDefault,
            },
          ]}
          onPress={() => setActiveTab("applied")}
        >
          <Feather
            name="send"
            size={18}
            color={activeTab === "applied" ? "#FFFFFF" : theme.textSecondary}
          />
          <ThemedText
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "applied" ? "#FFFFFF" : theme.textSecondary,
              },
            ]}
          >
            Applied ({appliedJobs.length})
          </ThemedText>
        </Pressable>
      </View>
      <Spacer height={Spacing.lg} />
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
        style={[styles.emptyIcon, { backgroundColor: theme.backgroundDefault }]}
      >
        <Feather
          name={activeTab === "saved" ? "heart" : "send"}
          size={48}
          color={theme.textTertiary}
        />
      </View>
      <ThemedText type="h3" style={styles.emptyTitle}>
        No {activeTab === "saved" ? "Saved" : "Applied"} Jobs
      </ThemedText>
      <ThemedText secondary style={styles.emptySubtitle}>
        {activeTab === "saved"
          ? "Save jobs you're interested in to view them later"
          : "Jobs you've applied to will appear here"}
      </ThemedText>
    </View>
  );

  return (
    <ScreenFlatList
      data={currentJobs}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: Spacing.md,
  },
  tabContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  tabText: {
    fontWeight: "600",
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
    paddingHorizontal: Spacing.xl,
  },
});
