import { BeforeLoadContextOptions, redirect } from "@tanstack/react-router";
import { z, ZodSchema } from "zod";
import {
  uriDecodeAndParse,
  uriEncodeAndStringify,
} from "./url-encoding-decoding";

export const restoreSearchStateByPath = (
  ctx: BeforeLoadContextOptions<any, any, any, any, any>,
  searchSchema: ZodSchema
) => {
  // only restore if entering and there isn't already a search string
  if (ctx.cause !== "enter" || ctx.location.searchStr !== "") {
    return;
  }

  // get last match in array
  const lastMatch = ctx.matches[ctx.matches.length - 1];

  // stringify the current search state (This object may have data while the string is empty because of the default search object set in the route)
  const currentSearchVerified = searchSchema.safeParse(ctx.search);
  const currentSearchString = currentSearchVerified.success
    ? uriEncodeAndStringify(currentSearchVerified.data)
    : "";

  // get the search string from session storage
  let searchString = sessionStorage.getItem(lastMatch.id);

  // parse and verify the search string using the provided schema
  const parsedSearch = uriDecodeAndParse(searchString ?? "");
  const verifiedSearch = searchSchema.safeParse(parsedSearch);

  // Bail if search is invalid
  if (!verifiedSearch.success) {
    sessionStorage.removeItem(lastMatch.id);
    return;
  }

  // after parsing and verifying the search string, stringify it again to check if it's the same as the current search string
  searchString = uriEncodeAndStringify(verifiedSearch.data);

  // Bail if no previous search string or if the current search string is the same as the previous search string
  if (
    searchString === null ||
    searchString === "" ||
    searchString === currentSearchString
  ) {
    return;
  }

  // If search is valid, restore the search state at the current path
  throw redirect({
    to: ".",
    search: verifiedSearch.data,
  });
};

const MatchSchema = z.object({
  id: z.string(),
  search: z.any(),
});

export const saveSearchStateByPath = (match: any, searchSchema: ZodSchema) => {
  // verify match data
  const verifiedMatch = MatchSchema.safeParse(match);
  if (!verifiedMatch.success) {
    return;
  }

  // verify search data
  const verifiedSearch = searchSchema.safeParse(verifiedMatch.data.search);
  if (!verifiedSearch.success) {
    return;
  }

  // save search state to session storage
  sessionStorage.setItem(
    verifiedMatch.data.id,
    uriEncodeAndStringify(verifiedSearch.data)
  );
};
