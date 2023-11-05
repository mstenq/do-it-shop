export type QueryObj = Record<string, string>;

export const getQueryObjFromHref = (href: string): QueryObj => {
  const url = new URL(href, window.location.origin);
  const searchParams = new URLSearchParams(url.search);
  const queryObj = Object.fromEntries(searchParams);

  return queryObj;
};
