# 🚀 PetSched Railway Deployment Guide

This guide will walk you through deploying your PetSched application to Railway step by step.

## 📋 Prerequisites

Before we start, make sure you have:

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Railway Account** - Sign up at [railway.app](https://railway.app)
3. **Node.js** - Version 16 or higher (for local testing)

## 🗄️ Step 1: Set Up Database

Railway provides PostgreSQL databases. We'll need to set this up first:

### Option A: Use Railway's PostgreSQL (Recommended)

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Provision PostgreSQL"
4. Note down the database connection details (we'll need these later)

### Option B: Use External Database

You can also use:
- **Supabase** (free tier available)
- **Neon** (free tier available)
- **PlanetScale** (free tier available)

## 🔧 Step 2: Deploy Backend

### 2.1 Connect Your Repository

1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect your GitHub account if not already connected
4. Select your repository
5. Choose the `petsched-backend` directory

### 2.2 Configure Environment Variables

In your Railway project dashboard, go to "Variables" tab and add these environment variables:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# Database Configuration (use Railway's PostgreSQL URL)
DATABASE_URL=postgresql://username:password@host:port/database
USE_SQLITE=false

# JWT Configuration (generate a secure secret)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration (we'll update this after frontend deployment)
CORS_ORIGIN=https://your-frontend-domain.railway.app

# Optional: Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@petsched.com

# Optional: Payment Processing (Stripe)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 2.3 Deploy Backend

1. Railway will automatically detect your Node.js app
2. It will install dependencies and start the server
3. Check the "Deployments" tab to see the build logs
4. Once deployed, note the URL (e.g., `https://your-backend.railway.app`)

## 🌐 Step 3: Deploy Frontend

### 3.1 Create New Service for Frontend

1. In your Railway project, click "New Service"
2. Select "Deploy from GitHub repo"
3. Choose the same repository but select `petsched-frontend` directory

### 3.2 Configure Frontend Environment

Add these variables to the frontend service:

```bash
# React Configuration
REACT_APP_API_URL=https://your-backend-url.railway.app
GENERATE_SOURCEMAP=false
```

### 3.3 Deploy Frontend

1. Railway will build your React app
2. It will serve the built files using the Express server
3. Note the frontend URL (e.g., `https://your-frontend.railway.app`)

## 🔗 Step 4: Connect Frontend and Backend

### 4.1 Update CORS Settings

1. Go back to your backend service in Railway
2. Update the `CORS_ORIGIN` variable with your frontend URL:
   ```
   CORS_ORIGIN=https://your-frontend.railway.app
   ```
3. Redeploy the backend service

### 4.2 Test the Connection

1. Visit your frontend URL
2. Try to register a new user
3. Check if the API calls are working

## 🧪 Step 5: Test Your Deployment

### 5.1 Health Check

Visit your backend URL + `/api/health` to check if the API is running:
```
https://your-backend.railway.app/api/health
```

### 5.2 Test API Endpoints

You can test these endpoints:
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/pets` - Get pets (requires authentication)
- `GET /api/appointments` - Get appointments (requires authentication)

### 5.3 Test Frontend

1. Open your frontend URL
2. Try to register/login
3. Test the pet management features
4. Test the appointment scheduling

## 🔧 Step 6: Custom Domain (Optional)

### 6.1 Add Custom Domain

1. In Railway dashboard, go to your service
2. Click "Settings" tab
3. Scroll to "Domains" section
4. Add your custom domain
5. Update your DNS settings as instructed

### 6.2 Update Environment Variables

After adding custom domains, update:
- `CORS_ORIGIN` in backend
- `REACT_APP_API_URL` in frontend

## 📊 Step 7: Monitor Your Application

### 7.1 Railway Dashboard

Railway provides:
- **Logs** - View application logs
- **Metrics** - Monitor performance
- **Deployments** - Track deployment history

### 7.2 Set Up Monitoring

Consider adding:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Google Analytics** for user analytics

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check the build logs in Railway
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **API Not Responding**
   - Check if the backend service is running
   - Verify environment variables are set correctly
   - Check CORS settings

3. **Database Connection Issues**
   - Verify `DATABASE_URL` is correct
   - Check if PostgreSQL service is running
   - Ensure database migrations ran successfully

4. **Frontend Can't Connect to Backend**
   - Verify `REACT_APP_API_URL` is set correctly
   - Check CORS settings in backend
   - Ensure both services are deployed

### Getting Help

1. **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
2. **Railway Discord**: Join their community
3. **GitHub Issues**: Check for known issues

## 🎉 Congratulations!

Your PetSched application is now deployed on Railway! 

### Next Steps

1. **Set up monitoring** for production use
2. **Configure backups** for your database
3. **Set up CI/CD** for automatic deployments
4. **Add SSL certificates** for security
5. **Scale your application** as needed

### Useful Commands

```bash
# View Railway logs
railway logs

# Deploy manually
railway up

# Open Railway dashboard
railway open

# Check service status
railway status
```

## 📝 Notes

- Railway automatically handles SSL certificates
- Your app will scale automatically based on traffic
- You can set up automatic deployments from GitHub
- Railway provides generous free tier limits

Happy deploying! 🚀 