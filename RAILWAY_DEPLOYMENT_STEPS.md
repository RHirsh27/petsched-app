# 🚀 PetSched Railway Deployment - Step by Step

Your PetSched application is ready for Railway deployment! Here are the exact steps to follow:

## ✅ What's Already Prepared

Your application has been configured with:
- ✅ Backend deployment files (`Procfile`, `railway.json`)
- ✅ Frontend deployment files (`server.js`, `Procfile`, `railway.json`)
- ✅ Environment variable configuration
- ✅ Database migration scripts
- ✅ Build scripts for both frontend and backend

## 🗄️ Step 1: Set Up Railway Account & Database

1. **Sign up for Railway**
   - Go to [railway.app](https://railway.app)
   - Click "Sign Up" and create an account
   - Connect your GitHub account

2. **Create New Project**
   - Click "New Project"
   - Select "Provision PostgreSQL"
   - This will create a PostgreSQL database for your app

3. **Note Your Database URL**
   - In your project dashboard, go to the PostgreSQL service
   - Copy the `DATABASE_URL` (you'll need this for the backend)

## 🔧 Step 2: Deploy Backend

1. **Add Backend Service**
   - In your Railway project, click "New Service"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the `petsched-backend` directory

2. **Configure Backend Environment Variables**
   - Go to your backend service dashboard
   - Click "Variables" tab
   - Add these variables:

```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://username:password@host:port/database
USE_SQLITE=false
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=https://your-frontend-domain.railway.app
```

3. **Deploy Backend**
   - Railway will automatically build and deploy
   - Check the "Deployments" tab for build logs
   - Note the backend URL (e.g., `https://your-backend.railway.app`)

## 🌐 Step 3: Deploy Frontend

1. **Add Frontend Service**
   - In your Railway project, click "New Service"
   - Select "Deploy from GitHub repo"
   - Choose the same repository
   - Select the `petsched-frontend` directory

2. **Configure Frontend Environment Variables**
   - Go to your frontend service dashboard
   - Click "Variables" tab
   - Add these variables:

```bash
REACT_APP_API_URL=https://your-backend-url.railway.app
GENERATE_SOURCEMAP=false
```

3. **Deploy Frontend**
   - Railway will build your React app
   - It will serve the built files using the Express server
   - Note the frontend URL (e.g., `https://your-frontend.railway.app`)

## 🔗 Step 4: Connect Frontend and Backend

1. **Update CORS Settings**
   - Go back to your backend service
   - Update the `CORS_ORIGIN` variable with your frontend URL:
   ```
   CORS_ORIGIN=https://your-frontend.railway.app
   ```
   - Redeploy the backend service

2. **Test the Connection**
   - Visit your frontend URL
   - Try to register a new user
   - Check if the API calls are working

## 🧪 Step 5: Test Your Deployment

### Test Backend API
Visit: `https://your-backend.railway.app/api/health`

### Test Frontend
Visit: `https://your-frontend.railway.app`

### Test User Registration
1. Go to your frontend URL
2. Try to register a new user
3. Check if the registration works

## 🔧 Environment Variables Reference

### Backend Variables (Required)
```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://username:password@host:port/database
USE_SQLITE=false
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=https://your-frontend-domain.railway.app
```

### Frontend Variables (Required)
```bash
REACT_APP_API_URL=https://your-backend-url.railway.app
GENERATE_SOURCEMAP=false
```

### Optional Variables (Backend)
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@petsched.com
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## 🚨 Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check Railway build logs
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **API Not Responding**
   - Check if backend service is running
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

## 🎉 Success!

Once deployed, your PetSched application will be available at:
- **Frontend**: `https://your-frontend.railway.app`
- **Backend API**: `https://your-backend.railway.app`

### Next Steps:
1. Set up monitoring and logging
2. Configure automatic deployments
3. Add custom domains
4. Set up SSL certificates
5. Scale your application as needed

## 📞 Getting Help

- **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: Join their community
- **GitHub Issues**: Check for known issues

Happy deploying! 🚀 