"use client";
import { createContext, useOptimistic, useState } from "react";
import { addPet, deletePet, editPet } from "@/actions/action";
import { toast } from "sonner";
import { PetEssentials } from "@/lib/types";
import { Pet } from "@prisma/client";

export const PetContext = createContext<TPetContext | null>(null);

type TPetContext = {
  pets: Pet[];
  selectedPetId: Pet["id"] | null;
  handleChangeSelectedId: (id: Pet["id"]) => void;
  handleCheckoutPet: (id: Pet["id"]) => Promise<void>;
  selectedPet: Pet | undefined;
  handleAddPet: (newPet: PetEssentials) => Promise<void>;
  handleEditPet: (id: Pet["id"], newPet: PetEssentials) => Promise<void>;
  numberOfPets: number;
};

type PetContextProviderProp = {
  data: Pet[];
  children: React.ReactNode;
};

export default function PetContextProvider({
  data,
  children,
}: PetContextProviderProp) {
  const [optimisticPets, setOptimisticPets] = useOptimistic(
    data,
    (prev, { action, payload }) => {
      switch (action) {
        case "add":
          return [...prev, { id: `${Date.now()}`, ...payload }];
        case "edit":
          return prev.map((pet) => {
            if (pet.id === payload.id) {
              return { ...pet, ...payload.newPet };
            }
            return pet;
          });
        case "delete":
          return prev.filter((pet) => pet.id !== payload);
        default:
          return prev;
      }
    }
  );

  const [selectedPetId, setSelectedPetId] = useState<Pet["id"] | null>(null);

  //derived State
  const selectedPet = optimisticPets.find((pet) => pet.id === selectedPetId);
  const numberOfPets = optimisticPets.length;

  // event handlers / actions

  const handleAddPet = async (newPet: PetEssentials) => {
    setOptimisticPets({ action: "add", payload: newPet });

    console.log("optimisticPets", optimisticPets);

    const error = await addPet(newPet);

    if (error) {
      toast.warning(error.message);
      return;
    }
  };

  const handleEditPet = async (id: Pet["id"], newPet: PetEssentials) => {
    setOptimisticPets({ action: "edit", payload: { id: id, newPet } });
    const error = await editPet(id, newPet);
    if (error) {
      toast.warning(error.message);
      return;
    }
  };

  const handleCheckoutPet = async (id: Pet["id"]) => {
    setOptimisticPets({ action: "delete", payload: id });
    const error = await deletePet(id);
    if (error) {
      toast.warning(error.message);
      return;
    }
    setSelectedPetId(null);
  };

  const handleChangeSelectedId = (id: Pet["id"]) => {
    setSelectedPetId(id);
  };

  // const handleCheckoutPet = (id: string) => {
  //   setSelectedPetId((prev) => prev.filter((pet) => pet.id !== id));
  // };

  return (
    <PetContext.Provider
      value={{
        pets: optimisticPets,
        selectedPetId,
        selectedPet,
        numberOfPets,
        handleAddPet,
        handleEditPet,
        handleCheckoutPet,
        handleChangeSelectedId,
      }}
    >
      {children}
    </PetContext.Provider>
  );
}
