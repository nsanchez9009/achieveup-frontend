#!/bin/bash

echo "🚀 Setting up AchieveUp Frontend (TypeScript + UCF Colors)..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies (including TypeScript)..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cp env.example .env
    echo "✅ .env file created. Please update the API URL if needed."
else
    echo "✅ .env file already exists."
fi

# Check TypeScript installation
echo "🔍 Checking TypeScript installation..."
if npx tsc --version > /dev/null 2>&1; then
    echo "✅ TypeScript is properly installed"
else
    echo "❌ TypeScript installation failed. Please run 'npm install' again."
    exit 1
fi

# Check if backend is running
echo "🔍 Checking backend connection..."
if curl -s http://localhost:5000 > /dev/null; then
    echo "✅ Backend is running on http://localhost:5000"
else
    echo "⚠️  Backend is not running on http://localhost:5000"
    echo "   Please start the KnowGap backend before running the frontend."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "✨ Features:"
echo "   • TypeScript for type safety"
echo "   • UCF color scheme (Black, Gold, Grey, White)"
echo "   • Modern React with hooks"
echo "   • Responsive design"
echo ""
echo "To start the development server:"
echo "  npm start"
echo ""
echo "To build for production:"
echo "  npm run build"
echo ""
echo "To check TypeScript types:"
echo "  npx tsc --noEmit"
echo ""
echo "For more information, see README.md" 