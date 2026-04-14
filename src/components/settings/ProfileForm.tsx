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

  const fieldSx = {
    "& .MuiInputLabel-root": {
      color: "#ffffff",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#ff6a3d",
    },
    "& .MuiOutlinedInput-root": {
      color: "#ffffff",
      "& fieldset": {
        borderColor: "rgba(255,255,255,0.18)",
      },
      "&:hover fieldset": {
        borderColor: "rgba(255,255,255,0.3)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#ff6a3d",
      },
    },
  };

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
          sx={fieldSx}
        />

        <TextField
          label="Email"
          value={initialEmail}
          disabled
          fullWidth
          sx={{
            ...fieldSx,
            "& .MuiInputLabel-root.Mui-disabled": {
              color: "rgba(255,255,255,0.8)",
            },
            "& .MuiOutlinedInput-root.Mui-disabled": {
              "& fieldset": {
                borderColor: "rgba(255,255,255,0.18)",
              },
            },
            "& .MuiInputBase-input.Mui-disabled": {
              WebkitTextFillColor: "#ffffff",
              color: "#ffffff",
              opacity: 1,
            },
          }}
        />

        <Box sx={{ pt: 1, display: "flex", justifyContent: "flex-end" }}>
          <Button type="submit" variant="primary" disabled={!isChanged || saving}>
            Save
          </Button>
        </Box>
      </Stack>
    </form>
  );
}
