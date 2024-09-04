import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CollarSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (hasCollar: boolean) => void;
}

export default function CollarSelectionDialog({
  open,
  onOpenChange,
  onSelect
}: CollarSelectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Does your dog have a collar?</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center space-x-4 mt-4">
          <Button onClick={() => onSelect(true)}>Yes</Button>
          <Button onClick={() => onSelect(false)}>No</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}