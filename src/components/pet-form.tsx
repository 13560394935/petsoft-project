"use client";

import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { usePetContext } from "@/lib/hooks";
import PetFormBtn from "./pet-form-btn";
import { flushSync } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TPetForm, petFormSchema } from "@/lib/validations";

type PetFormProps = {
  actionType: "add" | "edit";
  onFormSubmission: () => void;
};

export default function PetForm({
  actionType,
  onFormSubmission,
}: PetFormProps) {
  const { handleAddPet, handleEditPet, selectedPet } = usePetContext();

  const {
    register,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<TPetForm>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: actionType === "add" ? "" : selectedPet?.name,
      ownerName: actionType === "add" ? "" : selectedPet?.ownerName,
      age: actionType === "add" ? undefined : selectedPet?.age,
      imageUrl: actionType === "add" ? "" : selectedPet?.imageUrl,
      notes: actionType === "add" ? "" : selectedPet?.notes,
    },
  });

  return (
    <form
      action={async (formData) => {
        const result = await trigger();

        console.log("result", result);

        if (!result) return;

        flushSync(() => {
          onFormSubmission(); // This update will happen immediately
        });

        // const petData = {
        //   name: formData.get("name") as string,
        //   ownerName: formData.get("ownerName") as string,
        //   imageUrl:
        //     (formData.get("imageUrl") as string) ||
        //     "https://bytegrad.com/course-assets/react-nextjs/pet-placeholder.png",
        //   age: parseInt(formData.get("age") as string),
        //   notes: formData.get("notes") as string,
        // };

        const petData = getValues();
        petData.imageUrl =
          petData.imageUrl ||
          "https://bytegrad.com/course-assets/react-nextjs/pet-placeholder.png";

        if (actionType === "add") {
          await handleAddPet(petData);
        } else if (actionType === "edit") {
          await handleEditPet(selectedPet!.id, petData);
        }
      }}
    >
      <div className="space-y-3 flex flex-col">
        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")}></Input>
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="ownerName">Owner Name</Label>
          <Input id="ownerName" {...register("ownerName")}></Input>
          {errors.ownerName && (
            <p className="text-red-500">{errors.ownerName.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="imageUrl">Image Url</Label>
          <Input id="imageUrl" {...register("imageUrl")}></Input>
          {errors.imageUrl && (
            <p className="text-red-500">{errors.imageUrl.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="age">Age</Label>
          <Input id="age" {...register("age")}></Input>
          {errors.age && <p className="text-red-500">{errors.age.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" {...register("notes")} rows={3}></Textarea>
          {errors.notes && (
            <p className="text-red-500">{errors.notes.message}</p>
          )}
        </div>

        <PetFormBtn actionType={actionType} />
      </div>
    </form>
  );
}
