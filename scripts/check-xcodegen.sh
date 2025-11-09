#!/bin/bash

# Check if XcodeGen is installed
# Provides installation instructions if not found

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Checking for XcodeGen...${NC}\n"

# Check if xcodegen command exists
if command -v xcodegen &> /dev/null; then
    XCODEGEN_VERSION=$(xcodegen --version 2>/dev/null || echo "unknown")
    echo -e "${GREEN}✅ XcodeGen is installed${NC}"
    echo -e "   Version: ${XCODEGEN_VERSION}\n"
    exit 0
fi

# Check if installed via Homebrew but not in PATH
if [ -f "/opt/homebrew/bin/xcodegen" ] || [ -f "/usr/local/bin/xcodegen" ]; then
    echo -e "${YELLOW}⚠️  XcodeGen found but not in PATH${NC}"
    echo -e "   Try: export PATH=\"/opt/homebrew/bin:\$PATH\" or \"/usr/local/bin:\$PATH\"\n"
    exit 1
fi

# Not found - provide installation instructions
echo -e "${RED}❌ XcodeGen is not installed${NC}\n"
echo -e "${YELLOW}Installation Instructions:${NC}\n"
echo -e "XcodeGen is required to generate Xcode projects automatically.\n"
echo -e "${BLUE}Option 1: Install via Homebrew (Recommended)${NC}"
echo -e "   brew install xcodegen\n"
echo -e "${BLUE}Option 2: Install via Mint${NC}"
echo -e "   mint install yonaskolb/XcodeGen\n"
echo -e "${BLUE}Option 3: Build from source${NC}"
echo -e "   See: https://github.com/yonaskolb/XcodeGen#installation\n"
echo -e "After installation, run this script again to verify.\n"
exit 1

