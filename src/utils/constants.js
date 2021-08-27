import { v4 as uuidv4 } from "uuid";

//parse the projectId from the original query string
let search = window.location.search;
let origin = window.location.origin;
let wsPrefix = ""
let host = window.location.hostname;
let default_redirect = window.location.href;
let params = new URLSearchParams(search);
let userId = params.get("userId");
let redirect = params.get("redirect");
let debug = params.get("debug");

if (host === "localhost" || host === "127.0.0.1") {
	host = "irll.net";
} else if (host.includes("testing")) {
	host = host.replace("testing.", "");
} else if (host.includes("fingerprint")) {
	host = host.replace("fingerprint.", "");
} else if (host.includes("beta")) {
	host = host.replace("beta.", "");
} else if (host.includes("code")) {
	host = host.replace("code.", "");
}

if (origin.indexOf("http://") === 0) wsPrefix = "ws"
else if (origin.indexOf("https://") === 0) wsPrefix = "wss"

export const SERVER = params.get("server");
export const REDIRECT = SERVER && redirect ? redirect : default_redirect;
export const PROJECT_ID = SERVER ? "" : params.get("projectId");
export const CSS_PATH = params.get("css");
export const USER_ID = SERVER && userId ? userId : uuidv4();
export const WS_URL = SERVER ? SERVER : `${wsPrefix}://${USER_ID}.${host}:5000`;
export const DEBUG = debug === "true" ? true : false;

//api endpoint used to send GET and POST requests
export const RLAPI = `https://api.${host}/next`;
