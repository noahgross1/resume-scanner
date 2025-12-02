import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface MatchScoreBadgeProps {
  score: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const SIZE = 120;
const STROKE_WIDTH = 8;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function MatchScoreBadge({ score }: MatchScoreBadgeProps) {
  const { theme } = useTheme();
  const progress = useSharedValue(0);

  const getMatchColor = () => {
    if (score >= 80) return theme.success;
    if (score >= 60) return theme.warning;
    return theme.error;
  };

  const getMatchBgColor = () => {
    if (score >= 80) return theme.successLight;
    if (score >= 60) return theme.warningLight;
    return theme.errorLight;
  };

  const getMatchLabel = () => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    return "Partial Match";
  };

  useEffect(() => {
    progress.value = withTiming(score / 100, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [score]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <View style={[styles.container, { backgroundColor: getMatchBgColor() }]}>
      <View style={styles.circleContainer}>
        <Svg width={SIZE} height={SIZE} style={styles.svg}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={theme.border}
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
          />
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={getMatchColor()}
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            animatedProps={animatedProps}
            rotation={-90}
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        </Svg>
        <View style={styles.scoreContainer}>
          <ThemedText type="h1" style={[styles.score, { color: getMatchColor() }]}>
            {score}
          </ThemedText>
          <ThemedText type="caption" style={{ color: getMatchColor() }}>
            %
          </ThemedText>
        </View>
      </View>
      <View style={styles.labelContainer}>
        <ThemedText type="h4" style={{ color: getMatchColor() }}>
          {getMatchLabel()}
        </ThemedText>
        <ThemedText secondary type="small" style={styles.subtitle}>
          Based on your resume and skills
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xl,
  },
  circleContainer: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  svg: {
    position: "absolute",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  score: {
    fontWeight: "700",
  },
  labelContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
});
