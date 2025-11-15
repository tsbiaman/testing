# 🚀 Automated TSBI Deployment

This repository includes a fully automated CI/CD pipeline that builds, tests, and deploys your application to TSBI infrastructure.

## ✨ Features

- **Automated Docker Builds** - Builds optimized production images
- **Multi-environment Support** - Different configs for main/dev/staging branches
- **Registry Integration** - Pushes to private Docker registry
- **SSH Deployment** - Secure deployment to VPS using SSH keys
- **Site Auto-configuration** - Creates site configs automatically
- **Health Monitoring** - Includes health checks and status reporting

## 🏗️ Deployment Flow

```
Git Push → Build → Test → Push to Registry → Deploy to VPS → Health Check
```

### Branch Mappings

| Branch | Environment | Domain Pattern | Description |
|--------|-------------|----------------|-------------|
| `main` | production | `repo-name.tsbi.fun` | Production deployment |
| `dev` | development | `dev-repo-name.tsbi.fun` | Development testing |
| `staging` | staging | `staging-repo-name.tsbi.fun` | Pre-production testing |

## 🔧 Configuration

### Required GitHub Secrets

Set these in your repository → Settings → Secrets and variables → Actions:

```
TSBI_HOST          # Your VPS IP/domain
TSBI_USER          # SSH username
TSBI_SSH_KEY       # Private SSH key (full content)
REGISTRY_USER      # Docker registry username
REGISTRY_PASSWORD  # Docker registry password
```

### Environment Variables

The workflow automatically sets:
- `SITE_ID`: Configurable in workflow file (default: `myapp`)
- `REGISTRY`: `registry.tsbi.fun`
- `IMAGE_NAME`: Repository name

## 📁 Generated Files

The deployment automatically creates:

### Site Configuration (`/data/ecosystem/sites/{site-id}.yml`)
```yaml
id: myapp
domain: testing.tsbi.fun
environment: production
image: registry.tsbi.fun/testing:abc123...
ports:
  - "80:5000"
environment_variables:
  - NODE_ENV=production
  - PORT=5000
health_check:
  path: /api/health
  interval: 30s
  timeout: 10s
restart_policy: unless-stopped
```

## 🚀 Manual Deployment

If you need to deploy manually:

```bash
# Build and push image
docker build -t registry.tsbi.fun/testing:latest .
docker push registry.tsbi.fun/testing:latest

# Deploy via SSH
ssh user@vps-ip "cd /data/ecosystem && ./scripts/deploy-from-registry.sh myapp production testing.tsbi.fun registry.tsbi.fun/testing:latest"
```

## 📊 Monitoring

### Check Deployment Status
```bash
# On your VPS
cd /data/ecosystem
docker service ls
docker service ps myapp
```

### View Logs
```bash
# Application logs
docker service logs -f myapp

# Deployment logs
tail -f /data/ecosystem/logs/deploy.log
```

### Health Check
```bash
curl https://testing.tsbi.fun/api/health
```

## 🐛 Troubleshooting

### Build Issues
```bash
# Check build logs in GitHub Actions
# Look for Node.js version or dependency errors
```

### Deployment Issues
```bash
# Check SSH connection
ssh -T user@vps-ip

# Verify registry access
docker login registry.tsbi.fun

# Check site configuration
cat /data/ecosystem/sites/myapp.yml
```

### Runtime Issues
```bash
# Check container logs
docker service logs myapp

# Restart service
docker service update --force myapp
```

## 🔄 Updates

The workflow automatically:
- Updates image references on each deployment
- Maintains site configuration
- Handles rolling updates
- Preserves environment settings

## 📝 Customization

### Change Site ID
Edit in `.github/workflows/deploy-to-tsbi.yml`:
```yaml
env:
  SITE_ID: your-custom-site-id
```

### Add Environment Variables
The site config automatically includes:
- `NODE_ENV`
- `PORT`

Add more in the workflow script if needed.

## 🎯 Best Practices

1. **Test on dev branch first** - Push to `dev` before `main`
2. **Monitor deployments** - Check logs after each deployment
3. **Use semantic versioning** - Tag releases appropriately
4. **Backup configurations** - Keep site configs versioned
5. **Secure secrets** - Rotate SSH keys regularly

## 📞 Support

If deployment fails:
1. Check GitHub Actions logs
2. Verify all secrets are set
3. Test SSH connection manually
4. Check VPS resources and Docker status

## 🗄️ Database Infrastructure

The TSBI ecosystem includes a complete database infrastructure with separate management tools:

### Database Management Tools
- **PostgreSQL**: pgAdmin 4 at `https://pgadmin.tsbi.fun`
- **MongoDB**: Mongo Express at `https://mongo.tsbi.fun`
- **Redis**: RedisInsight at `https://redis.tsbi.fun`

### Infrastructure Details
- Docker Swarm orchestration
- Traefik reverse proxy with automatic SSL
- Persistent data volumes
- Comprehensive monitoring (Prometheus + Grafana)

See `/VPS/data/ecosystem/infrastructure/docs/database-setup.md` for complete documentation.

---

**🎉 Your app deploys automatically on every push to main!**