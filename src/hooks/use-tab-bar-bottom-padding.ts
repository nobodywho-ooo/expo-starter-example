import { isAndroid } from "@/helpers";

// Approximate bottom padding needed to keep content clear of the native tab bar
export const useTabBarBottomPadding = (): number => {
  return isAndroid ? 10 : 90;
};
