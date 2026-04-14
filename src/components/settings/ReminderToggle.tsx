"use client";

import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

type ReminderToggleProps = {
  initialEnabled: boolean;
};

export default function ReminderToggle({ initialEnabled }: ReminderToggleProps) {
  const { show } = useToast();
  const [reminderEnabled, setReminderEnabled] = useState(initialEnabled);

  const handleToggle = async (checked: boolean) => {
    const previous = reminderEnabled;
    setReminderEnabled(checked);

    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderEnabled: checked }),
      });

      if (!response.ok) {
        throw new Error("Failed to update reminders");
      }
    } catch {
      setReminderEnabled(previous);
      show("Failed to update reminders", "error");
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-transparent p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-[#ff6a3d]">Daily email reminders</p>
        <p className="text-sm text-white">
          Get an email when you have cards due. Sent at 8:00 AM UTC.
        </p>
      </div>

      <FormControlLabel
        control={
          <Switch
            checked={reminderEnabled}
            onChange={(_, checked) => {
              void handleToggle(checked);
            }}
            sx={{
              "& .MuiSwitch-switchBase": {
                color: "#ffffff",
              },
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "#ff6a3d",
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "#ff6a3d",
                opacity: 0.9,
              },
              "& .MuiSwitch-track": {
                backgroundColor: "rgba(255,255,255,0.35)",
                opacity: 1,
              },
            }}
          />
        }
        label=""
      />
    </div>
  );
}
