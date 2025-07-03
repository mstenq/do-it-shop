import { tryCatch } from "./tryCatch";

export const uriEncodeAndStringify = (v: any) => {
  const [jsonString, stringifyError] = tryCatch(() => JSON.stringify(v));
  if (stringifyError) return "";
  const [encodedString, encodeError] = tryCatch(() =>
    encodeURIComponent(jsonString)
  );
  if (encodeError) return "";
  return encodedString;
};

export const uriDecodeAndParse = (v: string) => {
  // if the value happens to be JSON, parse it and return it
  const [result, e] = tryCatch(() => JSON.parse(decodeURIComponent(v)));

  // if the value is not JSON, return it as is
  if (e) return v;

  return result;
};
