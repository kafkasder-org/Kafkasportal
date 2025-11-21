#!/bin/bash

# Kafkasder Panel - Automated Deployment Script
# This script helps you deploy to Vercel with Convex backend

set -e  # Exit on error

echo "🚀 Kafkasder Panel - Deployment Script"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Step 1: Check prerequisites
echo "📋 Step 1: Checking prerequisites..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 20.x"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_warning "Node.js version is $NODE_VERSION. Recommended: 20.x"
else
    print_success "Node.js $(node -v) installed"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_success "npm $(npm -v) installed"

echo ""

# Step 2: Generate secrets
echo "🔐 Step 2: Generating security secrets..."
echo ""

print_info "Generating CSRF_SECRET..."
CSRF_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
echo "CSRF_SECRET=$CSRF_SECRET"
echo ""

print_info "Generating SESSION_SECRET..."
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
echo "SESSION_SECRET=$SESSION_SECRET"
echo ""

print_success "Secrets generated!"
echo ""
print_warning "SAVE THESE SECRETS - You'll need them for Vercel environment variables"
echo ""

# Save to .env.local for reference
cat > .env.local.generated << EOF
# Generated secrets - $(date)
# Copy these to Vercel environment variables

CSRF_SECRET=$CSRF_SECRET
SESSION_SECRET=$SESSION_SECRET

# Required - Add your Convex URL after deployment
NEXT_PUBLIC_CONVEX_URL=

# Required - Set your admin credentials
FIRST_ADMIN_EMAIL=baskan@dernek.org
FIRST_ADMIN_PASSWORD=

# Optional - Add as needed
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=Kafkasder Panel
EOF

print_info "Secrets saved to .env.local.generated (for reference only)"
echo ""

# Step 3: Deploy Convex
echo "☁️  Step 3: Deploying Convex backend..."
echo ""

print_info "Checking Convex authentication..."
if npx convex whoami &> /dev/null; then
    print_success "Already logged in to Convex"
else
    print_warning "Not logged in to Convex"
    echo ""
    read -p "Do you want to login to Convex now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Opening browser for Convex login..."
        npx convex login
        print_success "Logged in to Convex"
    else
        print_error "Convex login required. Run: npx convex login"
        exit 1
    fi
fi

echo ""
read -p "Deploy Convex backend now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Deploying Convex..."
    npx convex deploy --yes

    print_success "Convex deployed!"
    echo ""
    print_warning "IMPORTANT: Copy your Convex deployment URL from above"
    print_warning "It looks like: https://your-project-name-123.convex.cloud"
    echo ""
    read -p "Press Enter to continue..."
else
    print_info "Skipping Convex deployment"
    print_warning "You'll need to deploy Convex manually: npm run convex:deploy"
fi

echo ""

# Step 4: Configure Vercel
echo "⚡ Step 4: Configuring Vercel..."
echo ""

print_info "Checking Vercel authentication..."
if npx vercel whoami &> /dev/null; then
    VERCEL_USER=$(npx vercel whoami)
    print_success "Logged in to Vercel as: $VERCEL_USER"
else
    print_warning "Not logged in to Vercel"
    echo ""
    read -p "Do you want to login to Vercel now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Logging in to Vercel..."
        npx vercel login
        print_success "Logged in to Vercel"
    else
        print_error "Vercel login required. Run: npx vercel login"
        exit 1
    fi
fi

echo ""
read -p "Link Vercel project now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Linking Vercel project..."
    npx vercel link
    print_success "Vercel project linked!"
else
    print_info "Skipping Vercel link"
    print_warning "Run 'npx vercel link' before deploying"
fi

echo ""

# Step 5: Set environment variables
echo "🔧 Step 5: Setting environment variables..."
echo ""

print_warning "You need to set the following environment variables in Vercel:"
echo ""
echo "Required:"
echo "  - NEXT_PUBLIC_CONVEX_URL (your Convex deployment URL)"
echo "  - CSRF_SECRET (generated above)"
echo "  - SESSION_SECRET (generated above)"
echo "  - FIRST_ADMIN_EMAIL (e.g., baskan@dernek.org)"
echo "  - FIRST_ADMIN_PASSWORD (your secure password)"
echo "  - NODE_ENV=production"
echo ""
echo "Optional:"
echo "  - NEXT_PUBLIC_SENTRY_DSN (for error tracking)"
echo "  - SENTRY_DSN"
echo "  - SMTP_* (for email)"
echo "  - TWILIO_* (for SMS)"
echo "  - OPENAI_API_KEY (for AI chat)"
echo ""

print_info "You can set these via:"
echo "  1. Vercel Dashboard: https://vercel.com/dashboard → Settings → Environment Variables"
echo "  2. Vercel CLI: npx vercel env add VARIABLE_NAME production"
echo ""

read -p "Have you set all required environment variables? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Please set environment variables before deploying"
    echo ""
    print_info "Reference file created: .env.local.generated"
    print_info "See DEPLOYMENT_GUIDE.md for detailed instructions"
    echo ""
    exit 0
fi

echo ""

# Step 6: Deploy to Vercel
echo "🚢 Step 6: Deploying to Vercel..."
echo ""

read -p "Deploy to Vercel production now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Deploying to Vercel production..."
    npx vercel --prod

    print_success "Deployment complete!"
    echo ""
    print_info "Next steps:"
    echo "  1. Visit your deployment URL"
    echo "  2. Check health endpoint: /api/health?detailed=true"
    echo "  3. Login with your admin credentials"
    echo ""
else
    print_info "Skipping Vercel deployment"
    print_warning "Run 'npm run vercel:prod' when ready to deploy"
fi

echo ""
echo "✨ Deployment script complete!"
echo ""
print_info "For troubleshooting, see: DEPLOYMENT_GUIDE.md"
print_info "Generated secrets saved in: .env.local.generated"
echo ""
