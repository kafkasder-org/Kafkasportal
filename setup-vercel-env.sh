#!/bin/bash

# Vercel Environment Variables Setup Script
# Interactive script to set all required environment variables

set -e

echo "🔧 Vercel Environment Variables Setup"
echo "====================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }

# Check if logged in to Vercel
if ! npx vercel whoami &> /dev/null; then
    print_warning "Not logged in to Vercel"
    read -p "Login now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npx vercel login
    else
        echo "Please run: npx vercel login"
        exit 1
    fi
fi

print_success "Logged in to Vercel as: $(npx vercel whoami)"
echo ""

# Function to set environment variable for all environments
set_env_var() {
    local var_name=$1
    local var_value=$2
    local description=$3

    echo ""
    print_info "$description"

    if [ -z "$var_value" ]; then
        read -p "Enter $var_name: " var_value
    fi

    if [ -n "$var_value" ]; then
        echo "$var_value" | npx vercel env add "$var_name" production
        echo "$var_value" | npx vercel env add "$var_name" preview
        echo "$var_value" | npx vercel env add "$var_name" development
        print_success "$var_name set for all environments"
    else
        print_warning "Skipping $var_name (empty value)"
    fi
}

echo "Setting up REQUIRED environment variables..."
echo ""

# Generate secrets if not provided
CSRF_SECRET=${CSRF_SECRET:-$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")}
SESSION_SECRET=${SESSION_SECRET:-$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")}

print_info "Generated CSRF_SECRET: $CSRF_SECRET"
print_info "Generated SESSION_SECRET: $SESSION_SECRET"
echo ""

# Required variables
read -p "Enter your Convex deployment URL (e.g., https://your-project.convex.cloud): " CONVEX_URL
set_env_var "NEXT_PUBLIC_CONVEX_URL" "$CONVEX_URL" "Setting Convex URL"

set_env_var "CSRF_SECRET" "$CSRF_SECRET" "Setting CSRF secret"
set_env_var "SESSION_SECRET" "$SESSION_SECRET" "Setting session secret"

read -p "Enter first admin email [baskan@dernek.org]: " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-baskan@dernek.org}
set_env_var "FIRST_ADMIN_EMAIL" "$ADMIN_EMAIL" "Setting admin email"

read -p "Enter first admin password: " -s ADMIN_PASSWORD
echo ""
set_env_var "FIRST_ADMIN_PASSWORD" "$ADMIN_PASSWORD" "Setting admin password"

set_env_var "NODE_ENV" "production" "Setting NODE_ENV"
set_env_var "NEXT_PUBLIC_APP_NAME" "Kafkasder Panel" "Setting app name"

echo ""
read -p "Do you want to set optional environment variables? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Optional: Sentry (Error Tracking)"
    read -p "Enter Sentry DSN (or press Enter to skip): " SENTRY_DSN
    if [ -n "$SENTRY_DSN" ]; then
        set_env_var "NEXT_PUBLIC_SENTRY_DSN" "$SENTRY_DSN" "Setting Sentry DSN (public)"
        set_env_var "SENTRY_DSN" "$SENTRY_DSN" "Setting Sentry DSN (server)"
    fi

    echo ""
    echo "Optional: Email Service (SMTP)"
    read -p "Configure email service? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "SMTP Host [smtp.gmail.com]: " SMTP_HOST
        SMTP_HOST=${SMTP_HOST:-smtp.gmail.com}
        set_env_var "SMTP_HOST" "$SMTP_HOST" "Setting SMTP host"

        read -p "SMTP Port [587]: " SMTP_PORT
        SMTP_PORT=${SMTP_PORT:-587}
        set_env_var "SMTP_PORT" "$SMTP_PORT" "Setting SMTP port"

        read -p "SMTP User: " SMTP_USER
        set_env_var "SMTP_USER" "$SMTP_USER" "Setting SMTP user"

        read -p "SMTP Password: " -s SMTP_PASSWORD
        echo ""
        set_env_var "SMTP_PASSWORD" "$SMTP_PASSWORD" "Setting SMTP password"

        read -p "SMTP From [noreply@kafkasder.org]: " SMTP_FROM
        SMTP_FROM=${SMTP_FROM:-noreply@kafkasder.org}
        set_env_var "SMTP_FROM" "$SMTP_FROM" "Setting SMTP from"
    fi

    echo ""
    echo "Optional: Twilio (SMS Service)"
    read -p "Configure Twilio? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Twilio Account SID: " TWILIO_SID
        set_env_var "TWILIO_ACCOUNT_SID" "$TWILIO_SID" "Setting Twilio SID"

        read -p "Twilio Auth Token: " -s TWILIO_TOKEN
        echo ""
        set_env_var "TWILIO_AUTH_TOKEN" "$TWILIO_TOKEN" "Setting Twilio token"

        read -p "Twilio Phone Number: " TWILIO_PHONE
        set_env_var "TWILIO_PHONE_NUMBER" "$TWILIO_PHONE" "Setting Twilio phone"
    fi

    echo ""
    echo "Optional: OpenAI (AI Chat)"
    read -p "Configure OpenAI? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "OpenAI API Key: " -s OPENAI_KEY
        echo ""
        set_env_var "OPENAI_API_KEY" "$OPENAI_KEY" "Setting OpenAI key"
    fi
fi

echo ""
print_success "Environment variables configured!"
echo ""
print_info "You can view/edit variables at:"
echo "https://vercel.com/dashboard → Your Project → Settings → Environment Variables"
echo ""
print_warning "Remember: After setting environment variables, redeploy for changes to take effect"
echo ""
