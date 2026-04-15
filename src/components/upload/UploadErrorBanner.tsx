import Alert from "@mui/material/Alert";

type UploadErrorBannerProps = {
  message: string;
  onDismiss: () => void;
};

export default function UploadErrorBanner({ message, onDismiss }: UploadErrorBannerProps) {
  return (
    <Alert
      severity="error"
      onClose={onDismiss}
      sx={{
        border: "1px solid rgba(255,106,61,0.8)",
        backgroundColor: "transparent",
        color: "#ff6a3d",
        "& .MuiAlert-icon": {
          color: "#ff6a3d",
        },
      }}
    >
      {message}
    </Alert>
  );
}
