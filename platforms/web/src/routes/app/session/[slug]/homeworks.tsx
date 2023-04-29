import type { Component } from "solid-js";

import {
  type Homework,
  getCurrentWeekNumber,
  getDayNameFromDayNumber,

  callUserHomeworksAPI,
  callUserHomeworkDoneAPI,

  parseHomeworks,
  createExternalFileURL
} from "@/utils/client";

import app, { AppStateCode } from "@/stores/app";
import { Transition, TransitionChild } from "solid-headless";

const AppHomeworks: Component = () => {
  const [windowWidth, setWindowWidth] = createSignal(window.innerWidth);
  const windowResizeHandler = () => setWindowWidth(window.innerWidth);

  onMount(() => {
    console.groupCollapsed("homeworks");
    window.addEventListener("resize", windowResizeHandler);
  });

  onCleanup(() => {
    console.groupEnd();
    window.removeEventListener("resize", windowResizeHandler);
  });

  interface HomeworkFilters {
    done: boolean;
    not_done: boolean;

    /** Names of the subjects. */
    subjectsToIgnore: string[];
  }

  const [filters, setFilters] = createStore<HomeworkFilters>({
    done: true,
    not_done: true,

    subjectsToIgnore: []
  });

  const [weekNumber, setWeekNumber] = createSignal(getCurrentWeekNumber());

  const endpoint = () => app.current_user.endpoints?.[`/user/homeworks/${weekNumber()}`];

  /** Renew the homeworks when needed. */
  createEffect(on([weekNumber, () => app.current_user.session], async ([week]) => {
    console.groupCollapsed(`Week ${week}`);
    onCleanup(() => console.groupEnd());

    await callUserHomeworksAPI(week);
  }));

  const homeworks = createMemo(() => endpoint()
    ? parseHomeworks(endpoint()!.donnees)
    : null
  );

  const [showFiltersMenu, setShowFiltersMenu] = createSignal(false);

  const applyFilters = (homeworks: Homework[]) => {
    return homeworks.filter(homework => {
      if (filters.subjectsToIgnore.includes(homework.subject_name)) return false;

      if (homework.done && filters.done) return true;
      if (!homework.done && filters.not_done) return true;

      return false;
    });
  };

  const getAvailableSubjects = () => {
    const subjects = new Set<string>();

    for (const homeworks_key in homeworks() ?? []) {
      const homeworks_day = homeworks()![homeworks_key];

      for (const homework of homeworks_day) {
        subjects.add(homework.subject_name);
      }
    }

    return [...subjects];
  };

  const BaseFilterToggleButton: Component<{
    label: string,
    active: boolean,
    action: (checked: boolean) => void
  }> = (props) => (
    <label
      classList={{
        "bg-brand-light/40 opacity-100 dark:bg-dark-300/80": props.active,
        "bg-brand-light/40 opacity-50 dark:bg-dark-300/40": !props.active
      }}
      class="w-full flex cursor-pointer items-center gap-2 px-4 py-3 transition first:rounded-t-md last:rounded-b-md md:(py-1) !md:rounded-full"
    >
      <input type="checkbox"
        checked={props.active}
        onChange={evt => props.action(evt.currentTarget.checked)}
      />
      <span class="text-brand-dark dark:text-brand-white truncate">{props.label}</span>
    </label>
  );

  const FilterToggleButton: Component<{
    filter: keyof Omit<HomeworkFilters, "subjectsToIgnore">,
    label: string,
  }> = (props) => (
    <BaseFilterToggleButton
      label={props.label}
      active={filters[props.filter]}
      action={checked => setFilters(props.filter, checked)}
    />
  );

  const SubjectFilterButton: Component<{
    name: string
  }> = (props) => (
    <BaseFilterToggleButton
      label={props.name}
      active={!filters.subjectsToIgnore.includes(props.name)}
      action={checked => {
        if (checked) {
          setFilters("subjectsToIgnore", curr => curr.filter(id => id !== props.name));
        }
        else {
          setFilters("subjectsToIgnore", curr => [...curr, props.name]);
        }
      }}
    />
  );
  return (
    <>
      <Title>{app.current_user.slug} - Devoirs - {APP_NAME}</Title>
      <div class="flex flex-col items-center gap-2">
        <h2 class="text-xl font-medium">Devoirs de la semaine {weekNumber()}</h2>

        <div class="flex items-center justify-center gap-2">
          <button
            class="bg-brand-light dark:bg-brand-primary flex rounded-full px-4 py-1"
            onClick={() => setWeekNumber(prev => prev - 1)}
          >
            <IconMdiArrowLeft />
          </button>
          <button
            class="bg-brand-light dark:bg-brand-primary flex rounded-full px-4 py-1"
            onClick={() => setWeekNumber(prev => prev + 1)}
          >
            <IconMdiArrowRight />
          </button>
        </div>

        <button onClick={() => callUserHomeworksAPI(weekNumber(), { force: true })}>Actualiser</button>

        <button class="bg-brand-light text-md text-brand-primary dark:text-brand-light mt-4 w-max rounded-full px-8 py-2 font-medium md:hidden dark:(bg-dark-200)"
          onClick={() => setShowFiltersMenu(true)}
        >
          Filtres
        </button>

        <Show when={homeworks()}
          fallback={
            <div>
              <p>Les devoirs sont en cours de récupération...</p>
            </div>
          }
        >
          <div class="relative my-8 w-full flex justify-center md:px-4">
            <div class="z-40 md:(sticky h-full max-w-72 w-full)"
              classList={{
                // Header is `h-18` and app state banner is `h-8`
                // We add `+2` padding on `md` => `h-28`.
                // Since this is the filter header, we add `+6` padding
                "top-24 md:top-26": app.current_state.code === AppStateCode.Idle,
                "top-32 md:top-34": app.current_state.code !== AppStateCode.Idle
              }}
            >
              <h4
                class="bg-brand-light text-md text-brand-primary dark:text-brand-light mb-4 hidden h-max w-max rounded-full px-8 py-2 font-medium md:block dark:(bg-dark-200)"
              >
                Filtres
              </h4>

              <Transition appear show={showFiltersMenu() || windowWidth() >= 768}>
                <TransitionChild
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div onClick={() => setShowFiltersMenu(false)} class="bg-brand-dark fixed inset-0 bg-opacity-60 md:hidden" aria-hidden="true" />
                </TransitionChild>
                <TransitionChild
                  class="fixed bottom-0 w-full transform md:relative"
                  enter="transition ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-4"
                >
                  <div class="bg-brand-white dark:md:bg-brand-dark w-full flex flex-col gap-4 rounded-t-md p-8 dark:bg-dark-500 md:(p-0 pr-8)"
                    classList={{ "hidden md:flex": !showFiltersMenu() }}
                  >
                    <div class="flex flex-col md:(flex-row gap-2)">
                      <FilterToggleButton filter="done" label="Fait" />
                      <FilterToggleButton filter="not_done" label="Non Fait" />
                    </div>

                    <div class="flex flex-col md:gap-2">
                      <For each={getAvailableSubjects()}>
                        {subject => (
                          <SubjectFilterButton name={subject} />
                        )}
                      </For>
                    </div>
                  </div>
                </TransitionChild>
              </Transition>

            </div>

            <div class="w-full flex flex-col md:max-w-4xl">
              <For each={Object.keys(homeworks()!).map(Number)}
                fallback={
                  <div class="border-brand-primary mx-auto w-max border-2 rounded-md px-4 py-2">
                    <p class="text-center">Aucun devoirs cette semaine !</p>
                  </div>
                }
              >
                {day_index => (
                  <Show when={homeworks()![day_index].length > 0}>
                    <div class="relative flex flex-col rounded-md">
                      <h2 class="bg-brand-light text-md text-brand-primary dark:text-brand-light shadow-brand-white dark:shadow-brand-dark sticky z-20 py-2 pl-6 font-medium shadow-lg md:mb-4 md:rounded-full dark:(bg-dark-200)"
                        classList={{
                          // Header is `h-18` and app state banner is `h-8`.
                          // We add `+2` padding on `md`.
                          "top-18 md:top-20": app.current_state.code === AppStateCode.Idle,
                          "top-26 md:top-28": app.current_state.code !== AppStateCode.Idle
                        }}
                      >{getDayNameFromDayNumber(day_index)}</h2>
                      <For each={applyFilters(homeworks()![day_index])}>
                        {(homework, homework_index) => (
                          <div style={{ "border-color": homework.subject_color }}
                            class="dark:text-brand-white bg-brand-dark/2 relative flex flex-col gap-2 border-l-4 px-4 py-3 transition-colors md:(mb-2 ml-8 mr-4 rounded-lg) dark:(bg-dark-300/40 hover:bg-dark-300/50)">
                            <div class="flex items-center justify-between">
                              <h3 class="text-md font-medium dark:font-semibold">{homework.subject_name}</h3>
                              <label class="flex cursor-pointer items-center gap-2 border rounded-full px-3 py-1 text-xs"
                                classList={{
                                  "border-brand-primary bg-brand-light text-brand-primary dark:(bg-dark-200 text-brand-light border-transparent)": homework.done,
                                  "border-brand-dark dark:border-brand-white": !homework.done
                                }}
                              >
                                {homework.done
                                  ? <>Fait <IconMdiCheck /></>
                                  : <>Non Fait <IconMdiClose /></>
                                }
                                <input
                                  hidden
                                  type="checkbox"
                                  checked={homework.done}
                                  onChange={(event) => {
                                    callUserHomeworkDoneAPI({
                                      homework_id: homework.id,
                                      week_number: weekNumber(),
                                      done: event.currentTarget.checked
                                    });
                                  }}
                                />
                              </label>
                            </div>

                            <div class="break-words text-sm" innerHTML={homework.description} />

                            <Show when={homework.attachments.length > 0}>
                              <div class="mt-2 flex flex-wrap gap-2">
                                <For each={homework.attachments}>
                                  {attachment => (
                                    <a
                                      class="bg-brand-light text-brand-dark dark:text-brand-light dark:border-brand-light rounded-md px-2 py-1 text-xs dark:(border bg-dark-300)"
                                      href={createExternalFileURL(attachment)}
                                      target="_blank"
                                    >
                                      {attachment.name}
                                    </a>
                                  )}
                                </For>
                              </div>
                            </Show>

                            <Show when={homeworks()![day_index].length - 1 !== homework_index()}>
                              <span class="bg-brand-dark absolute left-0 right-0 z-10 h-[2px] opacity-5 -bottom-[1px] md:hidden dark:(bg-dark-200 opacity-100)" />
                            </Show>
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>
                )}
              </For>
            </div>
          </div>
        </Show>
      </div>
    </>
  );
};

export default AppHomeworks;

