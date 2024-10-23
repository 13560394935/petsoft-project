import AppHeader from "@/components/app-header";
import AppFooter from "@/components/app-footer";
import BackgroundPattern from "@/components/background-pattern";
import PetContextProvider from "@/contexts/pet-context-provider";
import SearchContextProvider from "@/contexts/search-context-provider";
import prisma from "@/lib/db";
import { Toaster } from "sonner";
import { checkAuth, getPetsByUserId } from "@/lib/server-utils";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await checkAuth();

  const pets = await getPetsByUserId(session.user.id);

  return (
    <div>
      <BackgroundPattern />

      <div className="flex flex-col max-w-[1050px] mx-auto px-4 min-h-screen">
        <AppHeader />
        <SearchContextProvider>
          <PetContextProvider data={pets}>{children}</PetContextProvider>
        </SearchContextProvider>
        <AppFooter />
      </div>

      <Toaster position="top-right" />
    </div>
  );
}
