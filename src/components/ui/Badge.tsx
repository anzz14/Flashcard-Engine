import Chip from "@mui/material/Chip";

export type BadgeColor = "indigo" | "green" | "red" | "orange" | "yellow" | "gray";

type BadgeProps = {
  label: string;
  color?: BadgeColor;
};

const badgeColorSx: Record<BadgeColor, { backgroundColor: string; color: string }> = {
  indigo: { backgroundColor: "#e0e7ff", color: "#3730a3" },
  green: { backgroundColor: "#dcfce7", color: "#166534" },
  red: { backgroundColor: "#fee2e2", color: "#991b1b" },
  orange: { backgroundColor: "#ffedd5", color: "#9a3412" },
  yellow: { backgroundColor: "#fef9c3", color: "#854d0e" },
  gray: { backgroundColor: "#f1f5f9", color: "#334155" },
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

export function Badge({ label, color = "indigo" }: BadgeProps) {
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        borderRadius: "9999px",
        fontWeight: 600,
        ...badgeColorSx[color],
      }}
    />
  );
}

export default Badge;