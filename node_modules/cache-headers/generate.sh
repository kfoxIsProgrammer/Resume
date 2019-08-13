#!/bin/bash

rm -rf $2
# keep the npm command here so it can still be run
# as a standalone script/command
npm run $1
changed=$(git diff --name-only $2)
if [ -n "$changed" ]; then
    git add $2
    prevVersion=$(npm show . version 2>&1)
    # not sure how to get the actual version this is going
    # to update to in the npm preversion script
    git commit -n -m "updated ./$2 (previous version $prevVersion)"
fi

