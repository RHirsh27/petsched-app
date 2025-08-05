# 🚀 PetSched Production Deployment Guide

## 📋 Prerequisites

- Node.js 16+ installed
- PostgreSQL database (for production)
- Environment variables configured
- SSL certificate (for HTTPS)

## 🏗️ Deployment Options

### Option 1: Heroku (Recommended for MVP)

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku app**
   ```bash
   heroku create your-petsched-app
   ```

4. **Add PostgreSQL addon**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

5. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-super-secret-jwt-key
   heroku config:set CORS_ORIGIN=https://your-frontend-domain.com
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 2: AWS (Production Scale)

1. **EC2 Setup**
   - Launch Ubuntu 20.04 instance
   - Install Node.js, PostgreSQL, Nginx
   - Configure security groups

2. **Database Setup**
   ```bash
   # Install PostgreSQL
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   
   # Create database
   sudo -u postgres createdb petsched
   sudo -u postgres createuser petsched_user
   ```

3. **Application Setup**
   ```bash
   # Clone repository
   git clone https://github.com/your-repo/petsched-backend.git
   cd petsched-backend
   
   # Install dependencies
   npm install --production
   
   # Set environment variables
   export NODE_ENV=production
   export DATABASE_URL=postgresql://petsched_user:password@localhost:5432/petsched
   export JWT_SECRET=your-super-secret-jwt-key
   ```

4. **PM2 Process Manager**
   ```bash
   npm install -g pm2
   pm2 start server.js --name petsched-api
   pm2 startup
   pm2 save
   ```

### Option 3: Docker (Containerized)

1. **Create Dockerfile**
   ```dockerfile
   FROM node:16-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 5000
   CMD ["node", "server.js"]
   ```

2. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     api:
       build: .
       ports:
         - "5000:5000"
       environment:
         - NODE_ENV=production
         - DATABASE_URL=postgresql://user:password@db:5432/petsched
       depends_on:
         - db
     
     db:
       image: postgres:13
       environment:
         - POSTGRES_DB=petsched
         - POSTGRES_USER=user
         - POSTGRES_PASSWORD=password
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
   volumes:
     postgres_data:
   ```

3. **Deploy with Docker**
   ```bash
   docker-compose up -d
   ```

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# Server
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://username:password@host:5432/database
USE_SQLITE=false

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Email (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@petsched.com
```

### Optional Environment Variables

```bash
# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Payment Processing (Stripe)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key

# Cloud Storage (AWS S3)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=petsched-uploads

# Logging
LOG_LEVEL=info
```

## 🗄️ Database Migration

### Development to Production

1. **Export SQLite data**
   ```bash
   sqlite3 database.sqlite ".dump" > backup.sql
   ```

2. **Import to PostgreSQL**
   ```bash
   psql -h localhost -U username -d petsched -f backup.sql
   ```

3. **Run migrations**
   ```bash
   npm run migrate
   ```

## 🔒 Security Checklist

- [ ] HTTPS/SSL enabled
- [ ] JWT secret changed from default
- [ ] Rate limiting configured
- [ ] CORS origins restricted
- [ ] Environment variables secured
- [ ] Database credentials secured
- [ ] File upload validation
- [ ] Input sanitization enabled
- [ ] Error messages sanitized for production

## 📊 Monitoring & Logging

### Application Monitoring

1. **Health Checks**
   ```bash
   curl https://your-api.com/api/health
   ```

2. **Log Monitoring**
   ```bash
   # View logs
   heroku logs --tail
   
   # Or with PM2
   pm2 logs petsched-api
   ```

3. **Performance Monitoring**
   - Set up New Relic or DataDog
   - Monitor response times
   - Track error rates

## 🚀 Frontend Deployment

### Vercel (Recommended)

1. **Connect GitHub repository**
2. **Set environment variables**
   ```
   REACT_APP_API_URL=https://your-api-domain.com
   ```
3. **Deploy automatically**

### Netlify

1. **Build command**: `npm run build`
2. **Publish directory**: `build`
3. **Environment variables**: Same as Vercel

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: "your-petsched-app"
          heroku_email: "your-email@example.com"
```

## 📈 Scaling Considerations

### Database Scaling
- Use connection pooling
- Implement read replicas
- Consider database sharding for multi-tenancy

### Application Scaling
- Use load balancers
- Implement horizontal scaling
- Consider microservices architecture

### Caching Strategy
- Redis for session storage
- CDN for static assets
- Database query caching

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection**
   ```bash
   # Check connection
   psql $DATABASE_URL -c "SELECT 1"
   ```

2. **Memory Issues**
   ```bash
   # Monitor memory usage
   pm2 monit
   ```

3. **Port Conflicts**
   ```bash
   # Check what's using the port
   lsof -i :5000
   ```

## 📞 Support

For deployment issues:
- Check logs: `heroku logs --tail`
- Monitor health: `/api/health`
- Test endpoints: Use Postman or curl
- Database: Check connection and migrations

---

**Next Steps:**
1. Choose deployment option
2. Set up environment variables
3. Deploy backend
4. Deploy frontend
5. Test all endpoints
6. Monitor performance
7. Set up monitoring and alerts 