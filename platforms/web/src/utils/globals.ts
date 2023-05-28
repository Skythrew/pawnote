export const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const searchParamsToObject = (entries: IterableIterator<[string, string]>) => {
  const result: Record<string, unknown> = {};

  for (const [key, value] of entries) {
    result[key] = value;
  }

  return result;
};
