const debugMode = true;

export default function debug(...args: any[]) {
    if(debugMode) console.log(...args);
}
