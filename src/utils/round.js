// https://stackoverflow.com/questions/6134039/format-number-to-always-show-2-decimal-places
export default function round(num, places) {
	return Math.abs((Math.round(num * 10 ** places) / 10 ** places).toFixed(places));
}
