"use client";

import MuiButton, { type ButtonProps as MuiButtonProps } from "@mui/material/Button";

type AppButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export type ButtonProps = Omit<MuiButtonProps, "variant" | "color"> & {
  variant?: AppButtonVariant;
};

const variantSxMap: Record<AppButtonVariant, MuiButtonProps["sx"]> = {
  primary: {
    textTransform: "none",
    borderRadius: "0.75rem",
    backgroundColor: "#6366f1",
    color: "#ffffff",
    "&:hover": {
      backgroundColor: "#4f46e5",
    },
    "&.Mui-disabled": {
      backgroundColor: "#c7d2fe",
      color: "#ffffff",
    },
  },
  secondary: {
    textTransform: "none",
    borderRadius: "0.75rem",
    borderColor: "#6366f1",
    color: "#4f46e5",
    "&:hover": {
      borderColor: "#4f46e5",
      backgroundColor: "#eef2ff",
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
  primary: "contained",
  secondary: "outlined",
  ghost: "text",
  danger: "contained",
};

export function Button({ variant = "primary", sx, ...props }: ButtonProps) {
  return (
    <MuiButton
      variant={variantModeMap[variant]}
      sx={{ ...variantSxMap[variant], ...sx }}
      {...props}
    />
  );
}

export default Button;