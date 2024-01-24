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

export function camelCaseToNormalTextCapitalized(text) {
  // Split the text at uppercase letters and join with a space
  const splitText = text.replace(/([A-Z])/g, " $1");

  // Capitalize the first letter of each word
  return splitText.charAt(0).toUpperCase() + splitText.slice(1);
}

export function capitaliseFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function convertFrom24HourTo12Hour(time: number) {
  // takes in a 24 hour time, such as 2030and returns a 12 hour time, such as 8:30PM
  const hour = Math.floor(time / 100);
  const minute = time % 100;
  return `${hour % 12 || 12}:${minute == 0 ? "00" : minute} ${
    hour >= 12 ? "PM" : "AM"
  }`;
}

export function returnStartAndEndTimes(startTime: number, duration: number) {
  // takes in the startTime in 24 hour time and the endTime in minutes and returns a string that shows the start-end time in 12 hour time.
}
