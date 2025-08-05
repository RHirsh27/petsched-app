# PetSched Backend Deployment Script for Railway
Write-Host "🚀 Starting PetSched Backend Deployment..." -ForegroundColor Green

# Check if we're in production
if ($env:NODE_ENV -eq "production") {
    Write-Host "📦 Production environment detected" -ForegroundColor Yellow
    
    # Run database migrations
    Write-Host "🗄️ Running database migrations..." -ForegroundColor Cyan
    npm run migrate
    
    # Seed database if needed
    if ($env:SEED_DATABASE -eq "true") {
        Write-Host "🌱 Seeding database..." -ForegroundColor Cyan
        npm run seed
    }
}

# Start the server
Write-Host "🚀 Starting server..." -ForegroundColor Green
npm start 