"use client";
import { usePetContext, useSearchContext } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function PetList() {
  const { pets, selectedPetId, handleChangeSelectedId } = usePetContext();

  const { searchQuery } = useSearchContext();

  console.log("petList-pets", pets, pets.toString);

  const filterdPets = pets.filter((pet) =>
    pet.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ul className="bg-white border-b border-light">
      {filterdPets.map((pet) => (
        <li key={pet.id}>
          <button
            onClick={() => handleChangeSelectedId(pet.id)}
            className={cn(
              "flex items-center h-[70px] w-full cursor-pointer px-5 text-base gap-3 hover:bg-[#EFF1F2] focus:hover:bg-[#EFF1F2] transition",
              {
                "bg-[#EFF1F2]": selectedPetId === pet.id,
              }
            )}
          >
            <Image
              src={pet.imageUrl}
              alt="Pet image"
              width={45}
              height={45}
              className="w-[45px] h-[45px] rounded-full object-cover"
            ></Image>
            <p className="font-semibold">{pet.name}</p>
          </button>
        </li>
      ))}
    </ul>
  );
}
