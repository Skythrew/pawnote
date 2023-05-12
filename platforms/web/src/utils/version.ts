export default () => {
  if (import.meta.env.DEV) return "DEV";
  else if (BETA_GITHUB_SHA) return `BETA#${BETA_GITHUB_SHA}`;

  return `v${APP_VERSION}`;
};
