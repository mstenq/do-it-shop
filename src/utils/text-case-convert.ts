export const camelToProperCase = (str: string) => {
  return str
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const stringToSpacedTitleCase = (str: string) => {
  return str
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase()); // Capitalize first letter of each word
};
