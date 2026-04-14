"use client";

import { X } from "@/lib/lucide";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import type { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: "xs" | "sm" | "md";
};

export function Modal({ open, onClose, title, children, maxWidth = "sm" }: ModalProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={maxWidth}>
      <DialogTitle sx={{ pr: 6 }}>{title}</DialogTitle>
      <IconButton
        aria-label="Close"
        onClick={onClose}
        sx={{ position: "absolute", right: 8, top: 8, color: "#ffffff" }}
      >
        <X size={18} />
      </IconButton>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}

export default Modal;