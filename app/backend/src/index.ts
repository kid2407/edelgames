'use strict';


// @ts-ignore // ignoring node_modules not synchronized with local files
import * as http from "http";
// @ts-ignore // ignoring node_modules not synchronized with local files
import { Server } from "socket.io";
// @ts-ignore // ignoring node_modules not synchronized with local files
import express from "express";
import AppKernel from "./kernel/AppKernel";



// @ts-ignore
const PORT = process.env.API_HTTP_PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);


AppKernel.applyRoutes(app);

// setup express to listen to the configured PORT and sending a startup message
app.listen(PORT, () => {
    console.log(`App listening on ${PORT}`);
});