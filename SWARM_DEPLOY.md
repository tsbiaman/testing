# Docker Swarm Deployment

## Build and Deploy

### 1. Build the Image
```bash
docker build -t your-app:latest .
```

### 2. Deploy to Swarm
```bash
# Initialize swarm (if not already done)
docker swarm init

# Deploy the service
docker service create \
  --name your-app \
  --replicas 1 \
  --publish 80:5000 \
  your-app:latest
```

### 3. Scale the Service
```bash
# Scale to 3 replicas
docker service scale your-app=3
```

### 4. Update the Service
```bash
# Build new image
docker build -t your-app:v2 .

# Update service with rolling update
docker service update --image your-app:v2 your-app
```

## Monitoring

### Check Service Status
```bash
docker service ls
docker service ps your-app
```

### View Logs
```bash
docker service logs -f your-app
```

### Check Health
```bash
curl http://your-vps-ip/api/health
```

## Environment Variables

Set environment variables when creating the service:
```bash
docker service create \
  --name your-app \
  --env NODE_ENV=production \
  --env PORT=5000 \
  --publish 80:5000 \
  your-app:latest
```

## Networking

The app will be available at:
- **Internal**: http://your-app:5000
- **External**: http://your-vps-ip (if published on port 80)

## Troubleshooting

### Service Not Starting
```bash
# Check service logs
docker service logs your-app

# Inspect service
docker service inspect your-app
```

### Remove and Recreate
```bash
docker service rm your-app
docker service create --name your-app --publish 80:5000 your-app:latest
```