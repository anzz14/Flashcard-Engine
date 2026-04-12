"use client";

import TextField from "@mui/material/TextField";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function ChangePasswordForm() {
  const { show } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const newPasswordError = useMemo(() => {
    if (newPassword.length === 0) return "";
    if (newPassword.length < 8) return "New password must be at least 8 characters";
    return "";
  }, [newPassword]);

  const confirmPasswordError = useMemo(() => {
    if (confirmPassword.length === 0) return "";
    if (newPassword !== confirmPassword) return "Passwords do not match";
    return "";
  }, [confirmPassword, newPassword]);

  const isValid =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCurrentPasswordError("");

    if (!isValid) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const payload = (await response.json()) as { error?: string; success?: boolean };

      if (!response.ok) {
        if (response.status === 400 && payload.error === "Current password is incorrect") {
          setCurrentPasswordError("Current password is incorrect");
          return;
        }

        throw new Error(payload.error || "Failed to change password");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      show("Password changed successfully", "success");
    } catch {
      show("Failed to change password", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <TextField
        label="Current password"
        type="password"
        value={currentPassword}
        onChange={(event) => {
          setCurrentPassword(event.target.value);
          if (currentPasswordError) {
            setCurrentPasswordError("");
          }
        }}
        fullWidth
        error={Boolean(currentPasswordError)}
        helperText={currentPasswordError || " "}
      />

      <TextField
        label="New password"
        type="password"
        value={newPassword}
        onChange={(event) => setNewPassword(event.target.value)}
        fullWidth
        error={Boolean(newPasswordError)}
        helperText={newPasswordError || " "}
      />

      <TextField
        label="Confirm new password"
        type="password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        fullWidth
        error={Boolean(confirmPasswordError)}
        helperText={confirmPasswordError || " "}
      />

      <div className="flex justify-end">
        <Button type="submit" variant="secondary" disabled={submitting || !isValid}>
          Change Password
        </Button>
      </div>
    </form>
  );
}
