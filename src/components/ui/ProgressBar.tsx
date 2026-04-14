import LinearProgress from "@mui/material/LinearProgress";

type ProgressBarProps = {
  value: number;
  max: number;
  label?: string;
  color?: string;
};

export function ProgressBar({ value, max, label, color = "#6366f1" }: ProgressBarProps) {
  const safeMax = max > 0 ? max : 1;
  const clampedValue = Math.min(Math.max(value, 0), safeMax);
  const percentage = Math.round((clampedValue / safeMax) * 100);

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-sm text-white">
        <span>{label ?? `${percentage}%`}</span>
        <span>{percentage}%</span>
      </div>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 10,
          borderRadius: 9999,
          backgroundColor: "#e2e8f0",
          "& .MuiLinearProgress-bar": {
            backgroundColor: color,
          },
        }}
      />
    </div>
  );
}

export default ProgressBar;