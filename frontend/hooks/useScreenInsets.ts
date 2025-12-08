import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { Spacing } from "@/constants/theme";
import { useSafeBottomTabBarHeight } from "@/hooks/useSafeBottomTabBarHeight";

export function useScreenInsets() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useSafeBottomTabBarHeight();

  return {
    paddingTop: headerHeight + Spacing.xl,
    paddingBottom: tabBarHeight + Spacing.xl,
    scrollInsetBottom: insets.bottom + 16,
  };
}
