/**
 * This is where the typing of EVERY Pronote
 * functions are located.
 *
 * Whatever API call you can do to Pronote will
 * be typed here. Of course, these typings are
 * based on the data I actually got from these
 * endpoints and requests saw in the DevTools.
 *
 * Feel free to contribute on this to add new
 * specific typings for some endpoints.
 */

export interface PronoteApiGeolocation {
  request: {
    nomFonction: "geoLoc";
    lat: string;
    long: string;
  }

  response: {
    url: string; // "https://0190027B.index-education.net/pronote",
    nomEtab: string; // "LYCEE PROF. MARCEL BARBANCEYS",
    lat: string; //"45.380878662",
    long: string; // "2.274143683",
    cp: string; //"19160"
  }[] | Record<string, unknown> // `{}` when no results.
}
