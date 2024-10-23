"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import PetForm from "./pet-form";

type PetButtonProp = {
  actionType: "add" | "edit" | "checkout";
  children?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
};

export default function PetButton({
  actionType,
  children,
  onClick,
  disabled = false,
}: PetButtonProp) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  if (actionType === "checkout") {
    return (
      <Button disabled={disabled} variant="secondary" onClick={onClick}>
        {children}
      </Button>
    );
  }

  return (
    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
      <DialogTrigger asChild>
        {actionType === "add" ? (
          <Button size="icon">
            <PlusIcon className="h-6 w-6" onClick={onClick}></PlusIcon>
          </Button>
        ) : (
          <Button variant="secondary" onClick={onClick}>
            {children}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {actionType === "add" ? "Add a new Pet" : "Edit Pet"}
          </DialogTitle>
        </DialogHeader>

        <PetForm
          actionType={actionType}
          onFormSubmission={() => {
            setIsFormOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
