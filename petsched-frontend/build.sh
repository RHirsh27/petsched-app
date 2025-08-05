#!/bin/bash

# PetSched Frontend Build Script for Railway
echo "🚀 Starting PetSched Frontend Build..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the React app
echo "🏗️ Building React app..."
npm run build

echo "✅ Frontend build completed!" 