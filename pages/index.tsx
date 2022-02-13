import type { SavedAccountData } from "types/SavedAccountData";

import NextLink from "next/link";
import { useState, useEffect } from "react";

import { accountsStore } from "@/webUtils/accountsStore";
import { useTheme } from "next-themes";

import Button from "components/Button";

export default function Home () {
  type SavedAccounts = { [slug: string]: SavedAccountData };
  const [accounts, setAccounts] = useState<SavedAccounts | null>(null);

  const { theme, setTheme } = useTheme();
  const toggleTheme = () => theme === "dark" ? setTheme("light") : setTheme("dark");

  useEffect(() => {
    const tempAccounts: SavedAccounts = {};
    accountsStore.iterate((accountData: SavedAccountData, slug) => {
      tempAccounts[slug] = accountData;
    })
      .then(() => {
        setAccounts(tempAccounts);
      });
  }, []);

  return (
    <div className="h-screen w-screen bg-brand-primary dark:bg-brand-dark text-brand-white">
      <header className="fixed top-0 h-32 w-full flex flex-col items-center justify-center">
        <h1 className="font-bold text-3xl dark:text-brand-primary">Pornote</h1>
        <p className="text-lg text-brand-primary dark:text-green-100">Client Pronote non-officiel.</p>
        <Button
          onClick={toggleTheme}
        >
          Toggle Theme
        </Button>
      </header>

      <section className="h-full w-full flex items-center justify-center py-32 px-4">
        {!accounts ? <p>Loading...</p>
          : Object.keys(accounts).length > 0
            ? (
              Object.entries(accounts).map(([slug, accountData]) =>
                <NextLink
                  key={slug}
                  href={`/app/${slug}/dashboard`}
                >
                  <div
                    className="
                      bg-brand-white rounded-xl text-brand-primary
                      p-4 cursor-pointer hover:bg-opacity-80 transition-colors
                      hover:shadow-sm
                    "
                    key={slug}
                  >
                    <h2 className="font-semibold">
                      {accountData.userInformations.ressource.L} ({accountData.userInformations.ressource.classeDEleve.L})
                    </h2>
                    <p className="text-opacity-60">
                      {accountData.schoolInformations.General.NomEtablissement}
                    </p>
                  </div>
                </NextLink>
              )
            )
            : (
              <div className="flex flex-col justify-center items-center">
                <p className="text-md">Aucun compte sauvegardé localement</p>
                <Button
                  isButton={false}
                  linkHref="/login"
                >
                  Ajouter un compte Pronote
                </Button>
              </div>
            )
        }
      </section>

      <footer className="w-full fixed bottom-0 flex flex-col items-center justify-center h-16">
        <a
          className="font-medium text-brand-light hover:text-opacity-60 transition-colors"
          href="https://github.com/Vexcited/pornote"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
}
