//Capitalize the first character given a string
export default function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }