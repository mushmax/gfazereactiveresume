# GFAZE Resume Production Deployment Guide

This guide provides step-by-step instructions for deploying GFAZE Resume to production using Docker Compose with Traefik for SSL termination and automatic certificate management.

## Prerequisites

- Docker and Docker Compose installed on your server
- Domain name: `gfazeresume.faze.pro` with DNS access
- Server with public IP address
- Ports 80 and 443 available on your server

## DNS Configuration

Before deployment, configure the following DNS A records to point to your server's public IP address:

```
gfazeresume.faze.pro          → YOUR_SERVER_IP
storage.gfazeresume.faze.pro  → YOUR_SERVER_IP
printer.gfazeresume.faze.pro  → YOUR_SERVER_IP
```

**Note**: All subdomains must resolve to the same server IP address for Traefik to properly route requests.

## Deployment Steps

### 1. Clone the Repository

```bash
git clone https://github.com/mushmax/gfazereactiveresume.git
cd gfazereactiveresume
```

### 2. Environment Configuration

The production Docker Compose file (`tools/compose/gfaze-production.yml`) is pre-configured for the gfazeresume.faze.pro domain.

**Important Security Settings to Update:**

Before deployment, you MUST update the following security-sensitive environment variables in `tools/compose/gfaze-production.yml`:

```yaml
# Database credentials (lines 16-18)
POSTGRES_USER: your_secure_db_user
POSTGRES_PASSWORD: your_secure_db_password
POSTGRES_DB: gfaze_resume_db

# MinIO storage credentials (lines 33-34)
MINIO_ROOT_USER: your_secure_minio_user
MINIO_ROOT_PASSWORD: your_secure_minio_password

# Application secrets (lines 83-84)
ACCESS_TOKEN_SECRET: your_secure_access_token_secret_here
REFRESH_TOKEN_SECRET: your_secure_refresh_token_secret_here

# Chrome browser token (lines 48, 76)
TOKEN: your_secure_chrome_token
CHROME_TOKEN: your_secure_chrome_token

# MinIO access credentials (lines 95-96)
STORAGE_ACCESS_KEY: your_secure_minio_user
STORAGE_SECRET_KEY: your_secure_minio_password
```

**Generate secure random strings for secrets:**

```bash
# Generate 32-character random strings for secrets
openssl rand -base64 32
```

### 3. Optional: OAuth Configuration

If you want to enable social authentication, uncomment and configure the following sections in `tools/compose/gfaze-production.yml`:

#### GitHub OAuth (lines 109-111)

```yaml
GITHUB_CLIENT_ID: your_github_client_id
GITHUB_CLIENT_SECRET: your_github_client_secret
GITHUB_CALLBACK_URL: https://gfazeresume.faze.pro/api/auth/github/callback
```

#### Google OAuth (lines 114-116)

```yaml
GOOGLE_CLIENT_ID: your_google_client_id
GOOGLE_CLIENT_SECRET: your_google_client_secret
GOOGLE_CALLBACK_URL: https://gfazeresume.faze.pro/api/auth/google/callback
```

#### OpenID Connect (lines 119-127)

```yaml
VITE_OPENID_NAME: Your_Provider_Name
OPENID_AUTHORIZATION_URL: https://your-provider.com/auth
OPENID_CALLBACK_URL: https://gfazeresume.faze.pro/api/auth/openid/callback
OPENID_CLIENT_ID: your_openid_client_id
OPENID_CLIENT_SECRET: your_openid_client_secret
OPENID_ISSUER: https://your-provider.com
OPENID_SCOPE: openid profile email
OPENID_TOKEN_URL: https://your-provider.com/token
OPENID_USER_INFO_URL: https://your-provider.com/userinfo
```

### 4. Deploy the Application

```bash
# Deploy using the production configuration
docker-compose -f tools/compose/gfaze-production.yml up -d
```

### 5. Verify Deployment

Check that all services are running:

```bash
docker-compose -f tools/compose/gfaze-production.yml ps
```

Monitor logs for any issues:

```bash
docker-compose -f tools/compose/gfaze-production.yml logs -f
```

## SSL Certificate Setup

SSL certificates are automatically provisioned and renewed by Let's Encrypt through Traefik. The configuration:

- Uses TLS Challenge for certificate validation
- Automatically redirects HTTP to HTTPS
- Stores certificates in the `letsencrypt_data` Docker volume
- Renews certificates automatically before expiration

**Certificate provisioning may take a few minutes on first deployment.**

## Service Architecture

The deployment includes the following services:

- **app**: Main GFAZE Resume application (port 3000)
- **postgres**: PostgreSQL database for application data
- **minio**: S3-compatible storage for file uploads
- **chrome**: Headless Chrome for PDF generation and previews
- **traefik**: Reverse proxy with automatic SSL termination

## Accessing the Application

Once deployed and DNS is configured:

- **Main Application**: https://gfazeresume.faze.pro
- **Storage Interface**: https://storage.gfazeresume.faze.pro (MinIO console)
- **PDF Generation**: https://printer.gfazeresume.faze.pro (Chrome service)

## Maintenance Commands

### Update the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose -f tools/compose/gfaze-production.yml pull
docker-compose -f tools/compose/gfaze-production.yml up -d
```

### Backup Database

```bash
# Create database backup
docker-compose -f tools/compose/gfaze-production.yml exec postgres pg_dump -U postgres gfaze_resume_db > backup.sql
```

### View Logs

```bash
# View all service logs
docker-compose -f tools/compose/gfaze-production.yml logs

# View specific service logs
docker-compose -f tools/compose/gfaze-production.yml logs app
docker-compose -f tools/compose/gfaze-production.yml logs traefik
```

### Stop Services

```bash
# Stop all services
docker-compose -f tools/compose/gfaze-production.yml down

# Stop and remove volumes (WARNING: This will delete all data)
docker-compose -f tools/compose/gfaze-production.yml down -v
```

## Troubleshooting

### SSL Certificate Issues

- Ensure DNS records are properly configured and propagated
- Check Traefik logs: `docker-compose -f tools/compose/gfaze-production.yml logs traefik`
- Verify ports 80 and 443 are accessible from the internet

### Application Not Loading

- Check application logs: `docker-compose -f tools/compose/gfaze-production.yml logs app`
- Verify database connectivity: `docker-compose -f tools/compose/gfaze-production.yml logs postgres`
- Ensure all services are running: `docker-compose -f tools/compose/gfaze-production.yml ps`

### Storage Issues

- Check MinIO logs: `docker-compose -f tools/compose/gfaze-production.yml logs minio`
- Verify storage credentials match between app and MinIO configuration

## Security Considerations

1. **Change Default Passwords**: Update all default passwords in the configuration
2. **Firewall Configuration**: Only expose ports 80 and 443 to the internet
3. **Regular Updates**: Keep Docker images updated with security patches
4. **Backup Strategy**: Implement regular backups of database and storage volumes
5. **Monitor Logs**: Set up log monitoring for security events

## Support

For deployment issues or questions:

- Check the application logs for error messages
- Verify DNS configuration and SSL certificate status
- Ensure all required environment variables are properly set
- Review Docker Compose service health status

---

**Note**: This deployment configuration is optimized for production use with ARM-64 compatibility and includes all necessary security configurations for the gfazeresume.faze.pro domain.
