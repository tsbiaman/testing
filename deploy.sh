#!/bin/bash

# Docker Swarm Deployment Script
# Usage: ./deploy.sh [stack-name]

set -e

STACK_NAME=${1:-"myapp"}
IMAGE_NAME="myapp:latest"

echo "🚀 Deploying $STACK_NAME to Docker Swarm..."

# Build the image
echo "📦 Building Docker image..."
docker build -t $IMAGE_NAME .

# Deploy to swarm
echo "🐳 Deploying to Docker Swarm..."
docker stack deploy -c docker-compose.swarm.yml $STACK_NAME

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "📊 Service status:"
docker stack services $STACK_NAME

echo "✅ Deployment complete!"
echo "🌐 Your app should be available at the swarm load balancer"
echo ""
echo "To check logs: docker service logs $STACK_NAME""_app"
echo "To scale: docker service scale $STACK_NAME""_app=3"
echo "To remove: docker stack rm $STACK_NAME"