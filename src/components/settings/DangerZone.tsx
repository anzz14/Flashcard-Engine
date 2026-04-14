"use client";

import TextField from "@mui/material/TextField";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

const WARNING_TEXT =
  "This permanently deletes your account, all decks, and all cards. This cannot be undone.";

export default function DangerZone() {
  const router = useRouter();
  const { show } = useToast();

  const [open, setOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  const closeModal = () => {
    if (deleting) return;
    setOpen(false);
    setConfirmInput("");
  };

  const handleDelete = async () => {
    if (confirmInput !== "DELETE") return;

    setDeleting(true);
    try {
      const response = await fetch("/api/user/account", { method: "DELETE" });
      const payload = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to delete account");
      }

      await signOut({ redirect: false });
      router.push("/login");
    } catch {
      show("Failed to delete account", "error");
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-xl border border-red-200 bg-red-50/40 p-5">
      <div className="space-y-2">
        <h4 className="text-lg font-semibold text-red-700">Delete Account</h4>
        <p className="text-sm text-white">{WARNING_TEXT}</p>
      </div>

      <div className="mt-4 flex justify-end">
        <Button variant="danger" onClick={() => setOpen(true)}>
          Delete my account
        </Button>
      </div>

      <Modal open={open} onClose={closeModal} title="Confirm account deletion" maxWidth="sm">
        <div className="space-y-4 pt-1">
          <p className="text-sm text-white">{WARNING_TEXT}</p>

          <TextField
            label='Type "DELETE" to confirm'
            value={confirmInput}
            onChange={(event) => setConfirmInput(event.target.value)}
            fullWidth
            autoFocus
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={closeModal}
              disabled={deleting}
              sx={{ color: "#ffffff", "&:hover": { backgroundColor: "transparent" } }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                void handleDelete();
              }}
              disabled={deleting || confirmInput !== "DELETE"}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
