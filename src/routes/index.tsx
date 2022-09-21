export default () => {
  const accounts = [] as any[] | null; // TODO

  return (
    <div class="h-screen w-screen bg-brand-primary dark:bg-brand-dark text-brand-white">
      <header class="fixed top-0 w-full py-4 flex flex-col items-center justify-start">
        <h1 class="font-bold text-3xl dark:text-brand-primary">{APP_NAME}</h1>
        <p class="text-lg text-brand-light mb-4">Client Pronote non-officiel.</p>

        <button>
          Sombre/Clair{/* {theme === "light" ? "Mode Sombre" : "Mode Clair"} */}
        </button>
      </header>

      <section class="h-full w-full flex items-center justify-center py-32 px-4">
        <Show keyed
          when={accounts !== null && accounts}
          fallback={
            <p>Chargement des comptes...</p>
          }
        >
          { accounts => (
            <Show
              when={accounts.length > 0}
              fallback={
                <div class="
                  flex flex-col justify-center items-center gap-4 max-w-md p-6 rounded-lg

                  dark:bg-brand-primary dark:bg-opacity-20 dark:border-2 dark:border-brand-primary
                  bg-brand-dark bg-opacity-20 border-2 border-brand-dark
                ">
                  <p class="text-sm sm:text-base opacity-100 text-center">
                    Aucun compte sauvegardé localement !
                  </p>
                  <Link href="/link">
                    Ajouter un compte Pronote
                  </Link>
                </div>
              }
            >
              <For each={accounts}>
                {account => (
                  <Link href={`/app/${account.slug}/dashboard`}>
                    <div
                      class="
                      bg-brand-white rounded-xl text-brand-primary
                      p-4 cursor-pointer hover:bg-opacity-80 transition-colors
                      hover:shadow-sm
                    "
                    >
                      <h2 class="font-semibold">
                        {account.data.userInformations.ressource.L} ({account.data.userInformations.ressource.classeDEleve.L})
                      </h2>
                      <p class="text-opacity-60">
                        {account.data.schoolInformations.General.NomEtablissement}
                      </p>
                    </div>
                  </Link>
                )}
              </For>
            </Show>
          )}
        </Show>
      </section>

      <footer class="w-full fixed bottom-0 flex flex-col items-center justify-center h-16">
        <a
          class="font-medium text-brand-light dark:text-brand-white hover:text-opacity-60 transition-colors"
          href="https://github.com/Vexcited/pornote"
          rel="noopener noreferrer"
          target="_blank"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
};
