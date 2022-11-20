'use strict';

// @ts-ignore // ignoring node_modules not synchronized with local files
import * as http from "http";
// @ts-ignore // ignoring node_modules not synchronized with local files
import { Server } from "socket.io";
// @ts-ignore // ignoring node_modules not synchronized with local files
import express from "express";
import cors from "cors";
import Controller from "./framework/Controller";


// @ts-ignore
const PORT: number = process.env.API_HTTP_PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000"
    }
});

app.use(cors());

const controller = new Controller(io);

io.on('connection', controller.onConnect.bind(controller));

io.listen(PORT);
