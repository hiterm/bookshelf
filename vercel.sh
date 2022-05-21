#!/bin/bash

if [[ $VERCEL_GIT_COMMIT_REF == "master" ]] ; then
  echo "This is our master branch"
  yarn test && vite build
else
  echo "This is not our main branch"
  yarn test && yarn generate && yarn build
fi
