"use client";

import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

type ProfileFormProps = {
  initialName: string;
  initialEmail: string;
};

export default function ProfileForm({ initialName, initialEmail }: ProfileFormProps) {
  const { show } = useToast();
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);

  const isChanged = useMemo(
    () => name.trim() !== initialName.trim(),
    [initialName, name]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isChanged) return;

    setSaving(true);
    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = (await response.json()) as { name?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setName(data.name ?? name.trim());
      show("Profile updated", "success");
    } catch {
      show("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <TextField
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          fullWidth
        />

        <TextField label="Email" value={initialEmail} disabled fullWidth />

        <Box sx={{ pt: 1, display: "flex", justifyContent: "flex-end" }}>
          <Button type="submit" variant="primary" disabled={!isChanged || saving}>
            Save
          </Button>
        </Box>
      </Stack>
    </form>
  );
}
