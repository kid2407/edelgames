const debugMode = true;

const logLevelThreshold: 0 | 1 | 2 | 3 = 0;

const logLevelShort = [
    'ALL',          // 0 -> every debug output
    'APPLICATION',  // 1 -> no spam, only things happening                      <-- game room events should appear here
    'SYSTEM',       // 2 -> only mildly important stuff                         <-- room and user changes will occur here
    'IMPORTANT',    // 3 -> nearly no debug output, only major events
];


export default function debug(logLevel: number = 0, ...args: any[]) {
    if (debugMode && logLevel >= logLevelThreshold) console.log(`[${logLevelShort[logLevel]}]`, ...args);
}
