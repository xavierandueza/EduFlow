export function toCamelCase(str) {
  return str
    .split(" ") // Split the string into words
    .map((word, index) => {
      // If it's the first word, convert it to lowercase
      if (index === 0) {
        return word.toLowerCase();
      }
      // Otherwise, capitalize the first letter and lowercase the rest
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(""); // Join the words back into a single string
}
