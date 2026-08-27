import { Theme } from "@/types";

export const lightColors = {
  surface: "#FFFFFF",
  surfaceSecondary: "#FFFFFF",
  onSurface: "#000000",
  onSurfaceVariant: "#7c7c7c",
  surfaceContainer: "#ebebeb",
  primary: "#628395",
  primaryDisabled: "#c4c4c4",
  danger: "#f9342a",
  border: "#9f9f9f",
  shadow: "rgba(44, 44, 44, 0.18)",
  tabBarActive: "#628395",
  tabBarInactive: "#828282",
};

export const darkColors: typeof lightColors = {
  surface: "#121212",
  surfaceSecondary: "#2d2d2d",
  onSurface: "#FFFFFF",
  onSurfaceVariant: "#d8d8d8",
  surfaceContainer: "#3c3c3c",
  primary: "#628395",
  primaryDisabled: "#c4c4c4",
  danger: "#F32013",
  border: "#cacaca",
  shadow: "rgba(244, 244, 244, 0.48)",
  tabBarActive: "#628395",
  tabBarInactive: "#9e9e9e",
};

export type AppColors = typeof lightColors;

export const getColors = (theme: Theme): AppColors =>
  theme === "light" ? lightColors : darkColors;
