import { cn } from "@/lib/utils";

type ContentBlockProp = {
  children: React.ReactNode;
  className?: string;
};

export default function ContentBlock({
  className,
  children,
}: ContentBlockProp) {
  return (
    <div
      className={cn(
        "bg-[#F7F8FA] shadow-sm rounded-sm overflow-hidden w-full h-full",
        className
      )}
    >
      {children}
    </div>
  );
}
