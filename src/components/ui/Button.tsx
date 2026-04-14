"use client";

import MuiButton, { type ButtonProps as MuiButtonProps } from "@mui/material/Button";
import type { SxProps, Theme } from "@mui/material/styles";

type AppButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export type ButtonProps = Omit<MuiButtonProps, "variant" | "color"> & {
  variant?: AppButtonVariant;
};

const variantSxMap: Record<AppButtonVariant, SxProps<Theme>> = {
  primary: {
    textTransform: "none",
    borderRadius: "0.75rem",
    borderColor: "#ff6a3d",
    backgroundColor: "transparent",
    color: "#ff6a3d",
    "&:hover": {
      borderColor: "#ff3b00",
      backgroundColor: "rgba(255,59,0,0.08)",
    },
    "&.Mui-disabled": {
      borderColor: "rgba(255,106,61,0.35)",
      backgroundColor: "transparent",
      color: "rgba(255,106,61,0.45)",
    },
  },
  secondary: {
    textTransform: "none",
    borderRadius: "0.75rem",
    borderColor: "#ff6a3d",
    color: "#ff6a3d",
    "&:hover": {
      borderColor: "#ff3b00",
      backgroundColor: "rgba(255,59,0,0.08)",
    },
  },
  ghost: {
    textTransform: "none",
    borderRadius: "0.75rem",
    color: "#334155",
    border: "none",
    "&:hover": {
      backgroundColor: "#f8fafc",
    },
  },
  danger: {
    textTransform: "none",
    borderRadius: "0.75rem",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    "&:hover": {
      backgroundColor: "#dc2626",
    },
    "&.Mui-disabled": {
      backgroundColor: "#fecaca",
      color: "#ffffff",
    },
  },
};

const variantModeMap: Record<AppButtonVariant, MuiButtonProps["variant"]> = {
  primary: "outlined",
  secondary: "outlined",
  ghost: "text",
  danger: "contained",
};

export function Button({ variant = "primary", sx, ...props }: ButtonProps) {
  const mergedSx = sx ? ([variantSxMap[variant], sx] as MuiButtonProps["sx"]) : variantSxMap[variant];

  return (
    <MuiButton
      variant={variantModeMap[variant]}
      sx={mergedSx}
      {...props}
    />
  );
}

export default Button;