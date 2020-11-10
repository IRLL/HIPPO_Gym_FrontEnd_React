export default function setCSS(cssPath) {
    let head  = document.getElementsByTagName('head')[0];
    let link  = document.createElement('link');
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = cssPath;
    link.media = 'all';
    head.appendChild(link);
}