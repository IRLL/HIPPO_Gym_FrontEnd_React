// Turns camelCase to sentence Case
// credit: https://reactgo.com/javascript-camel-sentence-case/
export default function sentenceCase(string) {
  return string = string.replace(/([A-Z])/g,' $1');
}