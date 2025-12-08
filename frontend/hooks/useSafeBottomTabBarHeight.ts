import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

/**
 * Safely get bottom tab bar height.
 * Returns 0 if not inside a Bottom Tab Navigator (e.g., auth screens).
 */
export function useSafeBottomTabBarHeight(): number {
  try {
    return useBottomTabBarHeight();
  } catch (error) {
    // Not in a tab navigator context - return 0
    return 0;
  }
}
