#!/bin/bash

# Build and deploy on master branch
if [[ $TRAVIS_BRANCH == 'master' && $TRAVIS_PULL_REQUEST == 'false' ]]; then
    echo "Connecting to docker hub"
    echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

    echo "Building image"
    docker build -t heavysaturn/lemonsaurus:latest -f docker/Dockerfile .

    echo "Pushing image"
    docker push heavysaturn/lemonsaurus:latest

    curl -H "token: $AUTODEPLOY_TOKEN" $AUTODEPLOY_URL
else
    echo "Skipping deploy"
fi
