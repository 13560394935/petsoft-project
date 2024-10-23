// import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";

type petFormBtnProps = {
  actionType: "add" | "edit";
};

export default function petFormBtn({ actionType }: petFormBtnProps) {
  // const { pending } = useFormStatus();

  return (
    <Button type="submit" className="mt-5 self-end">
      {actionType === "add" ? "Add a new pet" : "Edit pet"}
    </Button>
  );
}
