#!/usr/bin/env bash

# Startup expressjs & socket.io backend using nodemon worker
(cd backend; npm run build; npm run start)

# Startup reactjs frontend using nodemon worker
(cd frontend; npm run build)
