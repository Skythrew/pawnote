export default () => {
  if (import.meta.env.DEV) return `DEV (basé sur la v${APP_VERSION})`;
  else if (BETA_GITHUB_SHA) return `#${BETA_GITHUB_SHA} (basé sur la v${APP_VERSION})`;

  return `v${APP_VERSION}`;
};
