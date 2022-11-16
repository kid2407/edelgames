#!/usr/bin/env bash

NODE_DIR="./node_modules/"
if [ -d "$DIR" ]; then
  # Take action if $DIR exists. #
  echo "Node modules already installed, although maybe not upt o date"
else
  mkdir "$NODE_DIR" -p
  npm install
fi

# running express & socket
npm run dev