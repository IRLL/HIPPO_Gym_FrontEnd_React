import { v4 as uuidv4 } from 'uuid';

//parse the projectId from the original query string
let search = window.location.search;
let params = new URLSearchParams(search);

let server = params.get('server');
export const SERVER = server;
export const REDIRECT = server ? params.get('redirect') : "";
export const PROJECT_ID = server ? "" : params.get('projectId');
export const CSS_PATH = server ? params.get('css') : "";
export const USER_ID = server ? "" : uuidv4();
export const WS_URL = server ? server : `wss://${USER_ID}.irll.net:5000`;

//api endpoint used to send GET and POST requests
export const RLAPI = "https://api.testing.irll.net/next";