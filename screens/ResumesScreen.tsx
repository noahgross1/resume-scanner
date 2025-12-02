import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";

import { ScreenFlatList } from "@/components/ScreenFlatList";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { mockResumes } from "@/data/mockData";
import { Resume } from "@/types/job";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ResumeCardProps {
  resume: Resume;
  onDelete: (id: string) => void;
}

function ResumeCard({ resume, onDelete }: ResumeCardProps) {
  const { theme } = useTheme();
  const translateX = useSharedValue(0);
  const deleteOpacity = useSharedValue(0);

  const handleDelete = () => {
    Alert.alert(
      "Delete Resume",
      `Are you sure you want to delete "${resume.filename}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(resume.id),
        },
      ]
    );
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = Math.max(event.translationX, -80);
        deleteOpacity.value = Math.min(Math.abs(event.translationX) / 80, 1);
      }
    })
    .onEnd(() => {
      if (translateX.value < -40) {
        translateX.value = withSpring(-80);
        deleteOpacity.value = withSpring(1);
      } else {
        translateX.value = withSpring(0);
        deleteOpacity.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteStyle = useAnimatedStyle(() => ({
    opacity: deleteOpacity.value,
  }));

  return (
    <View style={styles.cardWrapper}>
      <Animated.View
        style={[
          styles.deleteAction,
          { backgroundColor: theme.error },
          deleteStyle,
        ]}
      >
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Feather name="trash-2" size={24} color="#FFFFFF" />
        </Pressable>
      </Animated.View>
      <GestureDetector gesture={pan}>
        <AnimatedPressable
          style={[
            styles.resumeCard,
            { backgroundColor: theme.backgroundDefault },
            cardStyle,
          ]}
        >
          <View
            style={[
              styles.pdfIcon,
              { backgroundColor: theme.errorLight },
            ]}
          >
            <Feather name="file-text" size={24} color={theme.error} />
          </View>
          <View style={styles.resumeInfo}>
            <ThemedText type="body" style={styles.filename} numberOfLines={1}>
              {resume.filename}
            </ThemedText>
            <ThemedText secondary type="small">
              {resume.dateAdded} • {resume.size}
            </ThemedText>
          </View>
          <Feather name="more-vertical" size={20} color={theme.textTertiary} />
        </AnimatedPressable>
      </GestureDetector>
    </View>
  );
}

export default function ResumesScreen() {
  const { theme } = useTheme();
  const [resumes, setResumes] = useState<Resume[]>(mockResumes);

  const handleAddResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newResume: Resume = {
          id: Date.now().toString(),
          filename: result.assets[0].name,
          dateAdded: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          size: `${Math.round((result.assets[0].size || 0) / 1024)} KB`,
        };
        setResumes([newResume, ...resumes]);
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const handleDeleteResume = (id: string) => {
    setResumes(resumes.filter((r) => r.id !== id));
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const renderItem = ({ item }: { item: Resume }) => (
    <>
      <ResumeCard resume={item} onDelete={handleDeleteResume} />
      <Spacer height={Spacing.md} />
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View
        style={[styles.emptyIcon, { backgroundColor: theme.backgroundDefault }]}
      >
        <Feather name="file-text" size={48} color={theme.textTertiary} />
      </View>
      <ThemedText type="h3" style={styles.emptyTitle}>
        No Resumes Yet
      </ThemedText>
      <ThemedText secondary style={styles.emptySubtitle}>
        Upload your resume to get personalized job matches
      </ThemedText>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <Spacer height={Spacing.lg} />
      <Button onPress={handleAddResume}>Add Resume</Button>
    </View>
  );

  return (
    <ScreenFlatList
      data={resumes}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    position: "relative",
  },
  resumeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  pdfIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  resumeInfo: {
    flex: 1,
    gap: 4,
  },
  filename: {
    fontWeight: "500",
  },
  deleteAction: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
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
  footer: {
    paddingTop: Spacing.md,
  },
});
