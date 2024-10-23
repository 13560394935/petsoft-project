import Logo from "@/components/logo";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col gap-y-5 justify-center items-center min-h-screen">
      <Logo />
      {children}
    </div>
  );
}
