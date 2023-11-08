export const filterObjByKeys = (
  queryObj: Record<string, string>,
  searchParamsToKeep: false | "all" | string[],
) => {
  // keep none of the original query params
  if (searchParamsToKeep === false) return {};

  // Return All
  if (searchParamsToKeep === "all") return queryObj;

  // Filter down to only ones we want to preserve
  return Object.fromEntries(
    Object.entries(queryObj).filter(([key]) =>
      searchParamsToKeep.includes(key),
    ),
  );
};
