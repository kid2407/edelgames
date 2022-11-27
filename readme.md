# Development Setup

### Requirements
- Docker Desktop 4.10.* or higher or a local nodejs and npm installation

### With locale nodejs installation

- Go into `app/backend` and run `npm install` then `npm run dev`
- Go into `app/frontend` and run `npm install` then `npm run start`

This will start both apps in the development mode (using hot reload and less ts compiler optimization, as well as more logging).
The Frontend will be available at `http://localhost:3000/` and the backend at `http:/localhost:5000/`

### With docker

- Go into the root directory and run `docker composer up -d`

The development processes will be started automatically for you as long as the containers are running.

### Hot reload
Both parts (frontend, backend) can use a hotloading feature (automatically started, when using docker) that allows development without constant restarts.
ReactJS supports Hotloading out of the box. The Backend uses nodemon to detect and apply changes. 


# Development workflow
1. Fork the repository
2. Open a feature branch in your child repository (to maintain consistency, use *git flow* or similar)
3. Make and commit your changes -> please do your fellow coders a favour and use [semantic commit messages](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716) 
4. Repeat step 3
5. Finish your feature branch
6. Open a pull request for your changes in the main repository
7. Remember to drink water, stay hydrated!
8. Go to step 2

### Deployment
1. After your feature has been merged into the main repository, create a new version tag and merge the new state into the main branch
2. tbd


# Project standards

### Frontend 
- Whenever possible, use class components
- Place scss files next to its component and give it the same filename (excluding the extension)
