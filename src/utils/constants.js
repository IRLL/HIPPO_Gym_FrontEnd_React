import { v4 as uuidv4 } from "uuid";

//parse the projectId from the original query string
let search = window.location.search;
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
}

export const SERVER = params.get("server");
export const REDIRECT = SERVER && redirect ? redirect : default_redirect;
export const PROJECT_ID = SERVER ? "" : params.get("projectId");
export const CSS_PATH = params.get("css");
export const USER_ID = SERVER && userId ? userId : uuidv4();
// export const WS_URL = SERVER ? SERVER : `wss://${USER_ID}.${host}:5000`;
export const DEBUG = debug === "true" ? true : false;

//api endpoint used to send GET and POST requests
// export const RLAPI = `https://api.${host}/next`;


export const WS_URL = SERVER ? SERVER : `wss://x4v1m0bphh.execute-api.ca-central-1.amazonaws.com/production`;
export const RLAPI = `https://a41rc4wb7e.execute-api.ca-central-1.amazonaws.com/live`;
