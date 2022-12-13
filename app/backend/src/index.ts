'use strict';

// @ts-ignore // ignoring node_modules not synchronized with local files
import * as http from "http";
// @ts-ignore // ignoring node_modules not synchronized with local files
import {Server} from "socket.io";
// @ts-ignore // ignoring node_modules not synchronized with local files
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import * as path from "path";
import Controller from "./framework/Controller";

dotenv.config({
    path: path.resolve(__dirname + '/./../../../.env')
})


// @ts-ignore
const BACKEND_PORT: number = process.env.API_HTTP_PORT || 5000;
// @ts-ignore
const REACT_PORT: number = process.env.REACT_HTTP_PORT || 3000;
const DOMAIN: string = process.env.DOMAIN || "http://localhost";


// setup server
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: `${DOMAIN}:${REACT_PORT}`
    }
});

const controller = new Controller(io);

io.on('connection', controller.onConnect.bind(controller));
io.listen(BACKEND_PORT);
