FROM node:16

WORKDIR /var/www/app/backend

# Copying app code into the container. This allows to upload all data to the container, and only synchronizing specific folders later
# Effectively preventing the need to sync every config file by volumes while keeping the node modules in the container
COPY ./app/backend .

# Installing node packages
RUN npm i

# First time compiling ts to js
ENV NODE_PATH=./build
RUN npm run build