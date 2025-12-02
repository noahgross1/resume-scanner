import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";

import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { SearchStackParamList } from "@/navigation/SearchStackNavigator";
import { mockSearchHistory } from "@/data/mockData";

type SearchScreenProps = {
  navigation: NativeStackNavigationProp<SearchStackParamList, "Search">;
};

type InputMode = "resume" | "linkedin";

export default function SearchScreen({ navigation }: SearchScreenProps) {
  const { theme } = useTheme();
  const [inputMode, setInputMode] = useState<InputMode>("resume");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [selectedResume, setSelectedResume] = useState<string | null>(null);

  const handlePickResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedResume(result.assets[0].name);
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const handleSearch = () => {
    if (!jobTitle.trim()) {
      Alert.alert("Missing Information", "Please enter a job title");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    navigation.navigate("JobResults", {
      resumeText:
        inputMode === "linkedin" ? linkedinUrl : selectedResume || undefined,
      jobTitle: jobTitle.trim(),
      location: location.trim() || "Any Location",
    });
  };

  const handleRecentSearch = (search: { jobTitle: string; location: string }) => {
    setJobTitle(search.jobTitle);
    setLocation(search.location);
  };

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedText type="h2" style={styles.sectionTitle}>
        Find Your Perfect Job
      </ThemedText>
      <ThemedText secondary style={styles.subtitle}>
        Upload your resume or paste your LinkedIn profile to get AI-powered job
        matches
      </ThemedText>

      <Spacer height={Spacing.xl} />

      <View style={styles.segmentedControl}>
        <Pressable
          style={[
            styles.segmentButton,
            {
              backgroundColor:
                inputMode === "resume"
                  ? theme.link
                  : theme.backgroundDefault,
            },
          ]}
          onPress={() => setInputMode("resume")}
        >
          <Feather
            name="file-text"
            size={18}
            color={inputMode === "resume" ? "#FFFFFF" : theme.textSecondary}
          />
          <ThemedText
            style={[
              styles.segmentText,
              {
                color:
                  inputMode === "resume" ? "#FFFFFF" : theme.textSecondary,
              },
            ]}
          >
            Resume
          </ThemedText>
        </Pressable>
        <Pressable
          style={[
            styles.segmentButton,
            {
              backgroundColor:
                inputMode === "linkedin"
                  ? theme.link
                  : theme.backgroundDefault,
            },
          ]}
          onPress={() => setInputMode("linkedin")}
        >
          <Feather
            name="linkedin"
            size={18}
            color={inputMode === "linkedin" ? "#FFFFFF" : theme.textSecondary}
          />
          <ThemedText
            style={[
              styles.segmentText,
              {
                color:
                  inputMode === "linkedin" ? "#FFFFFF" : theme.textSecondary,
              },
            ]}
          >
            LinkedIn
          </ThemedText>
        </Pressable>
      </View>

      <Spacer height={Spacing.xl} />

      {inputMode === "resume" ? (
        <Pressable
          style={({ pressed }) => [
            styles.uploadBox,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: selectedResume ? theme.success : theme.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={handlePickResume}
        >
          <View
            style={[
              styles.uploadIconCircle,
              {
                backgroundColor: selectedResume
                  ? theme.successLight
                  : theme.backgroundSecondary,
              },
            ]}
          >
            <Feather
              name={selectedResume ? "check" : "upload"}
              size={24}
              color={selectedResume ? theme.success : theme.link}
            />
          </View>
          <ThemedText type="h4" style={styles.uploadTitle}>
            {selectedResume ? selectedResume : "Upload Resume"}
          </ThemedText>
          <ThemedText secondary type="small">
            {selectedResume ? "Tap to change" : "PDF files supported"}
          </ThemedText>
        </Pressable>
      ) : (
        <View>
          <ThemedText type="small" style={styles.inputLabel}>
            LinkedIn Profile URL
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="https://linkedin.com/in/yourprofile"
            placeholderTextColor={theme.textTertiary}
            value={linkedinUrl}
            onChangeText={setLinkedinUrl}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>
      )}

      <Spacer height={Spacing.xl} />

      <View>
        <ThemedText type="small" style={styles.inputLabel}>
          Job Title
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
              color: theme.text,
            },
          ]}
          placeholder="e.g. React Native Developer"
          placeholderTextColor={theme.textTertiary}
          value={jobTitle}
          onChangeText={setJobTitle}
        />
      </View>

      <Spacer height={Spacing.lg} />

      <View>
        <ThemedText type="small" style={styles.inputLabel}>
          Location
        </ThemedText>
        <View style={styles.locationInputContainer}>
          <TextInput
            style={[
              styles.input,
              styles.locationInput,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="City, State or Remote"
            placeholderTextColor={theme.textTertiary}
            value={location}
            onChangeText={setLocation}
          />
          <Pressable
            style={[
              styles.locationButton,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <Feather name="map-pin" size={20} color={theme.link} />
          </Pressable>
        </View>
      </View>

      <Spacer height={Spacing["2xl"]} />

      <Button onPress={handleSearch}>Search Jobs</Button>

      <Spacer height={Spacing["2xl"]} />

      {mockSearchHistory.length > 0 ? (
        <View>
          <ThemedText type="h4" style={styles.recentTitle}>
            Recent Searches
          </ThemedText>
          <Spacer height={Spacing.md} />
          {mockSearchHistory.slice(0, 3).map((search) => (
            <Pressable
              key={search.id}
              style={({ pressed }) => [
                styles.recentItem,
                {
                  backgroundColor: theme.backgroundDefault,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => handleRecentSearch(search)}
            >
              <View style={styles.recentItemContent}>
                <Feather name="clock" size={18} color={theme.textSecondary} />
                <View style={styles.recentItemText}>
                  <ThemedText type="body">{search.jobTitle}</ThemedText>
                  <ThemedText secondary type="small">
                    {search.location}
                  </ThemedText>
                </View>
              </View>
              <Feather
                name="chevron-right"
                size={20}
                color={theme.textTertiary}
              />
            </Pressable>
          ))}
        </View>
      ) : null}
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    marginBottom: Spacing.sm,
  },
  segmentedControl: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  segmentButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  segmentText: {
    fontWeight: "600",
  },
  uploadBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderStyle: "dashed",
  },
  uploadIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  uploadTitle: {
    marginBottom: Spacing.xs,
  },
  inputLabel: {
    marginBottom: Spacing.sm,
    fontWeight: "500",
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  locationInputContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  locationInput: {
    flex: 1,
  },
  locationButton: {
    width: Spacing.inputHeight,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  recentTitle: {
    marginBottom: Spacing.xs,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  recentItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  recentItemText: {
    gap: 2,
  },
});
