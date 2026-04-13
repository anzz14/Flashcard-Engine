import Chip from "@mui/material/Chip";

export type BadgeColor = "indigo" | "green" | "red" | "orange" | "yellow" | "gray";

type BadgeProps = {
  label: string;
  color?: BadgeColor;
  compact?: boolean;
  thinBorder?: boolean;
};

const badgeColorSx: Record<
  BadgeColor,
  { backgroundColor: string; color: string; borderColor: string }
> = {
  indigo: { backgroundColor: "#e0e7ff", color: "#3730a3", borderColor: "#becdff" },
  green: { backgroundColor: "#dcfce7", color: "#166534", borderColor: "#afe8c6" },
  red: { backgroundColor: "#fee2e2", color: "#991b1b", borderColor: "#f7bfc0" },
  orange: { backgroundColor: "#ffedd5", color: "#9a3412", borderColor: "#f1cca5" },
  yellow: { backgroundColor: "#fef9c3", color: "#854d0e", borderColor: "#efe58f" },
  gray: { backgroundColor: "#f1f5f9", color: "#334155", borderColor: "#cfd8e3" },
};

const palette: BadgeColor[] = ["indigo", "green", "red", "orange", "yellow", "gray"];

export function getTopicColor(topicTag: string): BadgeColor {
  const text = topicTag.trim().toLowerCase();
  if (!text) return "gray";

  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0;
  }

  return palette[Math.abs(hash) % palette.length];
}

export function Badge({ label, color = "indigo", compact = false, thinBorder = false }: BadgeProps) {
  const borderColor = badgeColorSx[color].borderColor;

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        borderRadius: "9999px",
        fontWeight: 600,
        fontSize: compact ? "0.68rem" : "0.75rem",
        height: compact ? 22 : 24,
        "& .MuiChip-label": {
          px: compact ? 0.75 : 1,
        },
        ...(thinBorder
          ? {
              borderStyle: "solid",
              borderWidth: "1px",
              borderColor,
            }
          : {}),
        ...badgeColorSx[color],
      }}
    />
  );
}

export default Badge;