# 🚀 Sellify Deployment Guide

## Overview

This guide covers deploying Sellify to production environments including frontend, backend, database, and external services configuration.

## Prerequisites

- Node.js 18+ installed
- MongoDB database (local or cloud)
- Redis server
- Stripe account
- Cloudinary account
- Domain name (optional)

## Environment Setup

### Production Environment Variables

Create a `.env` file for production:

```env
# Environment
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sellify?retryWrites=true&w=majority

# JWT Secrets (Generate strong secrets)
ACCESS_JWT_SECRET=your_super_secure_access_jwt_secret_here
REFRESH_JWT_SECRET=your_super_secure_refresh_jwt_secret_here

# Redis
REDIS_URL=redis://username:password@hostname:port

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# URLs
CLIENT_URL=https://your-frontend-domain.com
FRONTEND_URL=https://your-frontend-domain.com
```

## Deployment Options

### Option 1: Railway (Recommended)

#### Backend Deployment

1. **Create Railway Account**

   - Sign up at [railway.app](https://railway.app)
   - Connect your GitHub account

2. **Deploy Backend**

   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login to Railway
   railway login

   # Deploy from root directory
   railway up
   ```

3. **Configure Environment Variables**
   - Add all environment variables in Railway dashboard
   - Ensure `NODE_ENV=production`

#### Frontend Deployment

1. **Build Frontend**

   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify/Vercel**
   - Connect your GitHub repo
   - Set build command: `npm run build`
   - Set publish directory: `dist`

### Option 2: Heroku

#### Backend Deployment

1. **Prepare for Heroku**

   ```bash
   # Install Heroku CLI
   # Create Procfile in root directory
   echo "web: node backend/server.js" > Procfile
   ```

2. **Deploy to Heroku**

   ```bash
   # Login to Heroku
   heroku login

   # Create app
   heroku create your-app-name

   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_uri
   # ... add all other env vars

   # Deploy
   git push heroku main
   ```

### Option 3: AWS/DigitalOcean

#### Server Setup

1. **Create Server Instance**

   - Ubuntu 20.04 LTS
   - At least 1GB RAM
   - SSH access configured

2. **Install Dependencies**

   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2 for process management
   sudo npm install -g pm2

   # Install Nginx
   sudo apt install nginx -y
   ```

3. **Deploy Application**

   ```bash
   # Clone repository
   git clone https://github.com/MaximumCell/Sellify.git
   cd Sellify

   # Install dependencies
   npm install
   cd frontend && npm install && npm run build

   # Copy built files to root
   cd ..
   cp -r frontend/dist ./

   # Start with PM2
   pm2 start backend/server.js --name "sellify-backend"
   pm2 startup
   pm2 save
   ```

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create Cluster**

   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create new cluster (free tier available)
   - Configure network access (whitelist IP)

2. **Create Database User**

   - Create username and password
   - Assign read/write permissions

3. **Get Connection String**
   - Copy connection string
   - Add to environment variables

### Self-Hosted MongoDB

1. **Install MongoDB**

   ```bash
   # Ubuntu
   sudo apt install mongodb -y

   # Start service
   sudo systemctl start mongodb
   sudo systemctl enable mongodb
   ```

2. **Configure Security**
   ```bash
   # Create admin user
   mongo
   > use admin
   > db.createUser({
       user: "admin",
       pwd: "secure_password",
       roles: ["userAdminAnyDatabase"]
   })
   ```

## Redis Setup

### Redis Cloud (Recommended)

1. **Create Redis Instance**
   - Sign up at [Redis Cloud](https://redis.com/redis-enterprise-cloud/)
   - Create new database
   - Get connection details

### Self-Hosted Redis

1. **Install Redis**

   ```bash
   # Ubuntu
   sudo apt install redis-server -y

   # Start service
   sudo systemctl start redis
   sudo systemctl enable redis
   ```

2. **Configure Security**

   ```bash
   # Edit redis.conf
   sudo nano /etc/redis/redis.conf

   # Set password
   requirepass your_secure_password
   ```

## External Services

### Stripe Setup

1. **Create Stripe Account**

   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Complete account verification

2. **Get API Keys**

   - Navigate to API keys section
   - Copy Live Secret Key
   - Add to environment variables

3. **Configure Webhooks**
   - Add webhook endpoint: `https://your-domain.com/api/payment/webhook`
   - Select events: `checkout.session.completed`

### Cloudinary Setup

1. **Create Account**

   - Sign up at [Cloudinary](https://cloudinary.com)
   - Get cloud name, API key, and secret

2. **Configure Upload Settings**
   - Set upload presets
   - Configure transformations
   - Set security rules

## SSL/HTTPS Setup

### Using Certbot (Let's Encrypt)

1. **Install Certbot**

   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   ```

2. **Get SSL Certificate**

   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Auto-renewal**
   ```bash
   sudo crontab -e
   # Add line:
   0 12 * * * /usr/bin/certbot renew --quiet
   ```

## Nginx Configuration

### Basic Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend (React build)
    location / {
        root /path/to/Sellify/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Performance Optimization

### Frontend Optimization

1. **Build Optimization**

   ```bash
   # Analyze bundle size
   npm run build -- --analyze

   # Optimize images
   npm install --save-dev vite-plugin-imagemin
   ```

2. **CDN Setup**
   - Use Cloudflare for static assets
   - Configure caching headers
   - Enable gzip compression

### Backend Optimization

1. **PM2 Configuration**

   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [
       {
         name: "sellify-backend",
         script: "backend/server.js",
         instances: "max",
         exec_mode: "cluster",
         env: {
           NODE_ENV: "production",
           PORT: 5000,
         },
       },
     ],
   };
   ```

2. **Database Optimization**
   - Create indexes on frequently queried fields
   - Enable connection pooling
   - Monitor query performance

## Monitoring and Logging

### Application Monitoring

1. **PM2 Monitoring**

   ```bash
   pm2 monit
   pm2 logs
   ```

2. **Error Tracking**
   - Integrate Sentry for error tracking
   - Set up log aggregation
   - Monitor application metrics

### Server Monitoring

1. **System Monitoring**

   ```bash
   # Install htop
   sudo apt install htop -y

   # Monitor resources
   htop
   ```

2. **Log Management**
   ```bash
   # Configure log rotation
   sudo nano /etc/logrotate.d/sellify
   ```

## Backup Strategy

### Database Backup

1. **MongoDB Backup**

   ```bash
   # Create backup script
   #!/bin/bash
   mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/sellify" --out /backup/$(date +%Y%m%d)

   # Schedule with cron
   0 2 * * * /path/to/backup-script.sh
   ```

2. **Redis Backup**
   ```bash
   # Redis persistence configuration
   save 900 1
   save 300 10
   save 60 10000
   ```

## Security Checklist

### Server Security

- [ ] Update system packages regularly
- [ ] Configure firewall (UFW)
- [ ] Disable root login
- [ ] Use SSH keys only
- [ ] Install fail2ban
- [ ] Regular security audits

### Application Security

- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Input validation implemented
- [ ] Rate limiting enabled
- [ ] Security headers configured

## Troubleshooting

### Common Issues

1. **Database Connection Errors**

   - Check MongoDB URI format
   - Verify network access
   - Confirm credentials

2. **Redis Connection Issues**

   - Check Redis server status
   - Verify connection string
   - Test connectivity

3. **Stripe Webhook Errors**
   - Verify webhook endpoint
   - Check endpoint security
   - Validate event handling

### Performance Issues

1. **Slow Database Queries**

   - Add database indexes
   - Optimize queries
   - Enable query profiling

2. **Memory Usage**
   - Monitor Node.js memory
   - Implement connection pooling
   - Optimize image processing

## Maintenance

### Regular Tasks

1. **Weekly**

   - Review application logs
   - Check system resources
   - Verify backups

2. **Monthly**

   - Update dependencies
   - Security audit
   - Performance review

3. **Quarterly**
   - Database optimization
   - Security updates
   - Disaster recovery test

This deployment guide ensures a robust, secure, and scalable production environment for Sellify.
