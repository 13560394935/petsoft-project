"use client";
import { createContext, useState } from "react";

export const SearchContext = createContext<TSearchContext | null>(null);

type TSearchContext = {
  searchQuery: string;
  handleChangeSearchQuery: (query: string) => void;
};

type SearchContextProviderProp = {
  children: React.ReactNode;
};

export default function SearchContextProvider({
  children,
}: SearchContextProviderProp) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleChangeSearchQuery = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <SearchContext.Provider value={{ searchQuery, handleChangeSearchQuery }}>
      {children}
    </SearchContext.Provider>
  );
}
