import { v4 as uuidv4 } from 'uuid';

//parse the projectId from the original query string
let search = window.location.search;
let params = new URLSearchParams(search);
let host = window.location.hostname;
let userId = params.get('userId');
let redirect = params.get('redirect');
if(host === "localhost"){ 
    host = "irll.net";
}

export const SERVER = params.get('server');
export const REDIRECT = SERVER && redirect ? redirect : "https://irll.ca/";
export const PROJECT_ID = SERVER ? "" : params.get('projectId');
export const CSS_PATH = params.get('css');
export const USER_ID = SERVER && userId ? userId : uuidv4();
export const WS_URL = SERVER ? SERVER : `wss://${USER_ID}.${host}:5000`;

//api endpoint used to send GET and POST requests
export const RLAPI = `https://api.${host}/next`;
