# PetSched Railway Deployment Helper Script
# This script helps you prepare and deploy to Railway

param(
    [string]$Action = "prepare"
)

Write-Host "🚀 PetSched Railway Deployment Helper" -ForegroundColor Green
Write-Host "Action: $Action" -ForegroundColor Yellow

function Test-Prerequisites {
    Write-Host "🔍 Checking prerequisites..." -ForegroundColor Cyan
    
    # Check if Git is installed
    try {
        $gitVersion = git --version
        Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Git not found. Please install Git first." -ForegroundColor Red
        return $false
    }
    
    # Check if Node.js is installed
    try {
        $nodeVersion = node --version
        Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
        return $false
    }
    
    # Check if npm is installed
    try {
        $npmVersion = npm --version
        Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ npm not found. Please install npm first." -ForegroundColor Red
        return $false
    }
    
    return $true
}

function Install-Dependencies {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
    
    # Install backend dependencies
    Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
    Set-Location "petsched-backend"
    npm install
    Set-Location ".."
    
    # Install frontend dependencies
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    Set-Location "petsched-frontend"
    npm install
    Set-Location ".."
    
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
}

function Test-LocalBuild {
    Write-Host "🧪 Testing local build..." -ForegroundColor Blue
    
    # Test backend
    Write-Host "Testing backend..." -ForegroundColor Cyan
    Set-Location "petsched-backend"
    npm test
    Set-Location ".."
    
    # Test frontend build
    Write-Host "Testing frontend build..." -ForegroundColor Cyan
    Set-Location "petsched-frontend"
    npm run build
    Set-Location ".."
    
    Write-Host "✅ Local build tests passed" -ForegroundColor Green
}

function Show-DeploymentSteps {
    Write-Host "📋 Railway Deployment Steps:" -ForegroundColor Green
    Write-Host ""
    Write-Host "1. 🗄️ Set up Database:" -ForegroundColor Yellow
    Write-Host "   - Go to railway.app" -ForegroundColor White
    Write-Host "   - Create new project" -ForegroundColor White
    Write-Host "   - Provision PostgreSQL" -ForegroundColor White
    Write-Host ""
    Write-Host "2. 🔧 Deploy Backend:" -ForegroundColor Yellow
    Write-Host "   - Connect GitHub repository" -ForegroundColor White
    Write-Host "   - Select petsched-backend directory" -ForegroundColor White
    Write-Host "   - Set environment variables (see DEPLOYMENT.md)" -ForegroundColor White
    Write-Host ""
    Write-Host "3. 🌐 Deploy Frontend:" -ForegroundColor Yellow
    Write-Host "   - Add new service to project" -ForegroundColor White
    Write-Host "   - Select petsched-frontend directory" -ForegroundColor White
    Write-Host "   - Set REACT_APP_API_URL to backend URL" -ForegroundColor White
    Write-Host ""
    Write-Host "4. 🔗 Connect Services:" -ForegroundColor Yellow
    Write-Host "   - Update CORS_ORIGIN in backend" -ForegroundColor White
    Write-Host "   - Test the connection" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 See DEPLOYMENT.md for detailed instructions" -ForegroundColor Cyan
}

function Show-EnvironmentVariables {
    Write-Host "🔧 Required Environment Variables:" -ForegroundColor Green
    Write-Host ""
    Write-Host "Backend Variables:" -ForegroundColor Yellow
    Write-Host "NODE_ENV=production" -ForegroundColor White
    Write-Host "PORT=5000" -ForegroundColor White
    Write-Host "DATABASE_URL=postgresql://username:password@host:port/database" -ForegroundColor White
    Write-Host "USE_SQLITE=false" -ForegroundColor White
    Write-Host "JWT_SECRET=your-super-secret-jwt-key-change-this-in-production" -ForegroundColor White
    Write-Host "JWT_EXPIRES_IN=7d" -ForegroundColor White
    Write-Host "JWT_REFRESH_EXPIRES_IN=30d" -ForegroundColor White
    Write-Host "RATE_LIMIT_WINDOW_MS=900000" -ForegroundColor White
    Write-Host "RATE_LIMIT_MAX_REQUESTS=100" -ForegroundColor White
    Write-Host "CORS_ORIGIN=https://your-frontend-domain.railway.app" -ForegroundColor White
    Write-Host ""
    Write-Host "Frontend Variables:" -ForegroundColor Yellow
    Write-Host "REACT_APP_API_URL=https://your-backend-url.railway.app" -ForegroundColor White
    Write-Host "GENERATE_SOURCEMAP=false" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Generate a secure JWT_SECRET using:" -ForegroundColor Cyan
    Write-Host "node -e 'console.log(require(\"crypto\").randomBytes(64).toString(\"hex\"))'" -ForegroundColor White
}

# Main execution
switch ($Action.ToLower()) {
    "prepare" {
        if (Test-Prerequisites) {
            Install-Dependencies
            Test-LocalBuild
            Show-DeploymentSteps
            Show-EnvironmentVariables
        }
    }
    "test" {
        if (Test-Prerequisites) {
            Test-LocalBuild
        }
    }
    "steps" {
        Show-DeploymentSteps
    }
    "env" {
        Show-EnvironmentVariables
    }
    default {
        Write-Host "❌ Invalid action. Use: prepare, test, steps, or env" -ForegroundColor Red
        Write-Host "Usage: .\deploy-to-railway.ps1 -Action prepare" -ForegroundColor Yellow
    }
}

Write-Host "🎉 Deployment helper completed!" -ForegroundColor Green 