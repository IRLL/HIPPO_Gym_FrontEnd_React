import { v4 as uuidv4 } from 'uuid';

//parse the projectId from the original query string
let search = window.location.search;
let params = new URLSearchParams(search);

export const SERVER = params.get('server');
export const REDIRECT = SERVER ? params.get('redirect') : "";
export const PROJECT_ID = SERVER ? "" : params.get('projectId');
export const CSS_PATH = SERVER ? params.get('css') : "";
export const USER_ID = SERVER ? "" : uuidv4();
export const WS_URL = SERVER ? SERVER : `wss://${USER_ID}.irll.net:5000`;

//api endpoint used to send GET and POST requests
export const RLAPI = "https://api.irll.net/next";
