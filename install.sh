#!/bin/bash

###############################################################################
# Mailchimp MCP - Quick Installer for macOS
# 
# This script provides the easiest way to install Mailchimp MCP on macOS.
# Simply download and run this script, or copy-paste into Terminal.
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "\n${CYAN}$1${NC}"
}

# Header
echo -e "${MAGENTA}"
echo "════════════════════════════════════════════════════════════════════"
echo "  Mailchimp MCP - Easy Installation for macOS"
echo "  Powered by Alien Lifestyles"
echo "════════════════════════════════════════════════════════════════════"
echo -e "${NC}\n"

# Step 1: Check Node.js
print_step "1️⃣  Checking prerequisites..."

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    echo ""
    print_info "Please install Node.js 20+ from: https://nodejs.org/"
    print_info "Or use Homebrew: brew install node"
    exit 1
fi

NODE_VERSION=$(node --version)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$NODE_MAJOR" -lt 20 ]; then
    print_error "Node.js version $NODE_VERSION detected. Node.js 20+ is required."
    print_info "Please upgrade Node.js: https://nodejs.org/"
    exit 1
fi

print_success "Node.js $NODE_VERSION detected"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

NPM_VERSION=$(npm --version)
print_success "npm $NPM_VERSION detected"

# Step 2: Install package
print_step "2️⃣  Installing Mailchimp MCP..."

# Check if already installed
if npm list -g @alien-lifestyles/mailchimp-mcp &> /dev/null; then
    print_warning "Package is already installed globally"
    print_info "Updating to latest version..."
    npm update -g @alien-lifestyles/mailchimp-mcp || {
        print_error "Failed to update package"
        exit 1
    }
else
    # Install globally
    npm install -g @alien-lifestyles/mailchimp-mcp || {
        print_error "Failed to install package"
        echo ""
        print_warning "You may need to run with sudo:"
        print_info "  sudo npm install -g @alien-lifestyles/mailchimp-mcp"
        exit 1
    }
fi

print_success "Package installed successfully"

# Step 3: Launch setup
print_step "3️⃣  Launching setup UI..."

echo ""
print_success "Installation complete!"
echo ""
print_info "The setup UI will open in your browser where you can:"
echo "  • Enter your Mailchimp API key"
echo "  • Configure server settings"
echo "  • Add your license key (optional - for paid features)"
echo "  • Set privacy preferences"
echo ""

# Launch setup
if command -v mailchimp-mcp-setup &> /dev/null; then
    print_info "Starting setup UI..."
    mailchimp-mcp-setup
else
    print_warning "Setup command not found in PATH"
    print_info "You can manually run: mailchimp-mcp-setup"
    print_info "Or: npm run setup (if installed locally)"
fi

