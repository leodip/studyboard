#!/bin/bash

# Script to build and push studyboard Docker image
DOCKER_REPO="leodip/studyboard"
TAG="latest"

# Function to display script usage
usage() {
    echo "Usage: $0 [-t tag]"
    echo "  -t    Docker image tag (default: latest)"
    exit 1
}

# Parse command line options
while getopts "t:" opt; do
    case $opt in
        t) TAG="$OPTARG" ;;
        ?) usage ;;
    esac
done

# Check if logged into Docker Hub
echo "🔍 Checking Docker Hub login status..."
if ! docker info 2>/dev/null | grep -q "Username"; then
    echo "❌ Not logged into Docker Hub. Please login first using:"
    echo "docker login"
    exit 1
fi

# Move to the directory containing the Dockerfile
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

echo "🏗️  Building ${DOCKER_REPO}:${TAG}..."

# Build the image
docker build -t "${DOCKER_REPO}:${TAG}" .

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    echo "📤 Pushing ${DOCKER_REPO}:${TAG} to Docker Hub..."
    docker push "${DOCKER_REPO}:${TAG}"
    
    if [ $? -eq 0 ]; then
        echo "✅ Push successful!"
    else
        echo "❌ Push failed!"
        exit 1
    fi
else
    echo "❌ Build failed!"
    exit 1
fi
