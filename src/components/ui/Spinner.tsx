import CircularProgress from "@mui/material/CircularProgress";
import { cn } from "@/lib/utils";

type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: 20,
  md: 32,
  lg: 48,
} as const;

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <CircularProgress
      size={sizeMap[size]}
      className={cn(className)}
      sx={{ color: "#ff6a3d !important" }}
    />
  );
}

export default Spinner;