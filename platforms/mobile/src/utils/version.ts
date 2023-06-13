export default (): string => {
  if (import.meta.env.DEV) return "DEV";
  else if (BETA_GITHUB_SHA.length > 0) return `BETA#${BETA_GITHUB_SHA}`;

  return `v${APP_VERSION}`;
};
