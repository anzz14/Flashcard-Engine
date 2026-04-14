import Alert from "@mui/material/Alert";

type UploadErrorBannerProps = {
  message: string;
  onDismiss: () => void;
};

export default function UploadErrorBanner({ message, onDismiss }: UploadErrorBannerProps) {
  return (
    <Alert severity="error" onClose={onDismiss}>
      {message}
    </Alert>
  );
}
