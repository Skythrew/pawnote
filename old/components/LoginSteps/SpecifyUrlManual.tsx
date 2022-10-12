import type { StateTypes } from "pages/login";
import type { SchoolInformations } from "types/SavedAccountData";

import {
  useState,
  useEffect,

  // Types
  Dispatch,
  FormEvent,
  SetStateAction
} from "react";

import { getCommonInformationsFrom } from "@/webUtils/fetchPronote";

/** Used on the `useEffect` to DRY with `SpecifyUrlGeolocation`. */
import specifyUrlCheckState from "./utils/specifyUrlCheckState";

import InputText from "components/InputText";
import Button from "components/Button";

type SpecifyUrlManualProps = {
  state: StateTypes;
  setState: Dispatch<SetStateAction<StateTypes>>;
}

function SpecifyUrlManual ({ state, setState }: SpecifyUrlManualProps) {
  const [pronoteUrl, setPronoteUrl] = useState("");
  const defaultButtonMessage = "Utiliser ce serveur";
  const [buttonMessage, setButtonMessage] = useState(defaultButtonMessage);

  /**
   * Parse the informations from the selected school.
   * Move to next step if the informations are valid.
   */
  const handlePronoteConnect = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (pronoteUrl) {
      setButtonMessage("Récupération des informations...");
      const informationsData = await getCommonInformationsFrom(pronoteUrl);

      setButtonMessage(defaultButtonMessage);
      if (informationsData.success) {
        const schoolInformations = informationsData.data;

        setState({
          ...state,
          schoolInformations
        });
      }
      else {
        console.error("Error while getting informations from Pronote.", informationsData);
      }
    }
  };

  /**
   * Move to next step if a school have been
   * selected in the state.
   */
  useEffect(() => {
    specifyUrlCheckState({
      state,
      setState
    });
  }, [state, setState]);

  return (
    <div className="
      flex flex-col justify-center items-center
      min-w-lg rounded-xl p-8 gap-4
      bg-brand-primary
      dark:bg-brand-primary dark:bg-opacity-20
      dark:border-2 dark:border-brand-primary
    ">
      <div className="flex flex-col text-center text-brand-light">
        <h2 className="text-xl font-medium">Manuel</h2>
        <p className="opacity-80 dark:opacity-60">Saisissez l&apos;URL Pronote de votre établissement</p>
      </div>

      <form
        className="flex flex-col justify-center items-center gap-4"
        onSubmit={handlePronoteConnect}
      >
        <InputText
          labelColor="text-brand-light"
          inputClass="text-brand-light placeholder:text-opacity-20 placeholder:text-brand-light"
          id="manualPronoteUrl"
          label="URL Pronote"
          placeholder="https://.../pronote/"
          value={pronoteUrl}
          onChange={e => setPronoteUrl(e.target.value)}
        />

        <Button
          isButton={true}
          buttonType="submit"
        >
          {buttonMessage}
        </Button>
      </form>
    </div>
  );
}

export default SpecifyUrlManual;