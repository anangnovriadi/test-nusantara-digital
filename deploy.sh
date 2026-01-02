#!/bin/bash

# 🚀 Production Deployment Script
# Usage: ./deploy.sh [backend|frontend|all]

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🚀 Production Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    
    if [ ! -z "$pid" ]; then
        echo "⚠️  Port $port is in use by PID $pid. Killing..."
        kill -9 $pid 2>/dev/null || true
        sleep 2
        echo "✅ Port $port freed"
    else
        echo "✅ Port $port is available"
    fi
}

# Function to deploy backend
deploy_backend() {
    echo -e "${YELLOW}📦 Deploying Backend (NestJS)...${NC}"
    
    cd employee-api
    
    # Pull latest code
    echo "1. Pulling latest code..."
    git pull origin main || { echo -e "${RED}Failed to pull code${NC}"; exit 1; }
    
    # Install dependencies
    echo "2. Installing dependencies..."
    npm install
    
    # Build
    echo "3. Building application..."
    npm run build || { echo -e "${RED}Build failed${NC}"; exit 1; }
    
    # Check if PM2 process exists
    if pm2 list | grep -q "employee-api"; then
        echo "4. Stopping PM2 process..."
        pm2 stop employee-api
        pm2 delete employee-api
        sleep 2
    fi
    
    # Kill port if still in use (backend usually runs on 3000 or 4002)
    echo "5. Checking ports..."
    kill_port 3000
    kill_port 4002
    
    # Start new process
    echo "6. Starting new PM2 process..."
    pm2 start ecosystem.config.js --env production
    pm2 save
    
    echo -e "${GREEN}✅ Backend deployed successfully!${NC}"
    
    cd ..
}

# Function to deploy frontend
deploy_frontend() {
    echo -e "${YELLOW}🎨 Deploying Frontend (Next.js)...${NC}"
    
    cd employee-fe
    
    # Pull latest code
    echo "1. Pulling latest code..."
    git pull origin main || { echo -e "${RED}Failed to pull code${NC}"; exit 1; }
    
    # Install dependencies
    echo "2. Installing dependencies..."
    npm install
    
    # Clear cache
    echo "3. Clearing build cache..."
    rm -rf .next
    rm -rf node_modules/.cache
    
    # Build
    echo "4. Building application..."
    npm run build || { echo -e "${RED}Build failed${NC}"; exit 1; }
    
    # Check if PM2 process exists
    if pm2 list | grep -q "employee-fe"; then
        echo "5. Stopping PM2 process..."
        pm2 stop employee-fe
        pm2 delete employee-fe
        sleep 2
    fi
    
    # Kill port if still in use (Next.js default is 3000)
    echo "6. Checking ports..."
    kill_port 3000
    
    # Start new process
    echo "7. Starting new PM2 process..."
    pm2 start npm --name "employee-fe" -- start
    pm2 save
    
    echo -e "${GREEN}✅ Frontend deployed successfully!${NC}"
    
    cd ..
}

# Main script
case "$1" in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    all)
        deploy_backend
        echo ""
        deploy_frontend
        ;;
    *)
        echo "Usage: $0 {backend|frontend|all}"
        echo ""
        echo "Examples:"
        echo "  $0 backend   - Deploy backend only"
        echo "  $0 frontend  - Deploy frontend only"
        echo "  $0 all       - Deploy both backend and frontend"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}📊 PM2 Status:${NC}"
pm2 list
echo ""
echo -e "${GREEN}✨ Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
