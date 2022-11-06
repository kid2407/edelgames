# Requirements
- Docker Desktop 4.10.* or higher

# General information
We are using a docker stack of two containers. One each for frontend (NodeJS, ReactJS) and backend (NodeJS, express, socket.io).
These are handled as two separate projects and are placed inside the app folder.

The backend and the frontend can be used independently by commenting them out in the docker-compose.yml file

# Running
Go into the projects root directory and execute
- `docker compose up -d` for a complete startup

The frontend (react) can now be accessed by sending a GET Request to `http://127.0.0.1:3000`.

The backend (react) can now be accessed by sending a POST Request to `http://127.0.0.1:5000`.

# Hot reload
Both parts (frontend, backend) can use a hotloading feature (automatically started, when using docker) that allows development without constant restarts.
ReactJS supports Hotloading out of the box. The Backend uses nodemon to detect and apply changes. 