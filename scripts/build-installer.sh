#!/bin/bash

# Build script for Mailchimp MCP Installer and Uninstaller
# Builds both Xcode projects and creates a DMG

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
INSTALLER_DIR="$PROJECT_ROOT/installer/macos"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Building Mailchimp MCP Installer and Uninstaller${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo -e "${RED}Error: xcodebuild not found. Please install Xcode.${NC}"
    exit 1
fi

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}Error: This script must be run on macOS${NC}"
    exit 1
fi

INSTALLER_PROJECT="$INSTALLER_DIR/MailchimpMCPInstaller/MailchimpMCPInstaller.xcodeproj"
UNINSTALLER_PROJECT="$INSTALLER_DIR/MailchimpMCPUninstaller/MailchimpMCPUninstaller.xcodeproj"
INSTALLER_PROJECT_YML="$INSTALLER_DIR/MailchimpMCPInstaller/project.yml"
UNINSTALLER_PROJECT_YML="$INSTALLER_DIR/MailchimpMCPUninstaller/project.yml"

# Function to check for XcodeGen
check_xcodegen() {
    if ! command -v xcodegen &> /dev/null; then
        echo -e "${RED}Error: XcodeGen is not installed${NC}"
        echo -e "${YELLOW}Installation:${NC}"
        echo -e "  brew install xcodegen"
        echo -e ""
        echo -e "Or run: ${BLUE}$SCRIPT_DIR/check-xcodegen.sh${NC} for more options\n"
        exit 1
    fi
}

# Function to generate Xcode project
generate_project() {
    local PROJECT_DIR="$1"
    local PROJECT_YML="$2"
    local PROJECT_NAME="$3"
    
    if [ ! -f "$PROJECT_YML" ]; then
        echo -e "${RED}Error: project.yml not found at: $PROJECT_YML${NC}"
        return 1
    fi
    
    echo -e "${BLUE}Generating $PROJECT_NAME Xcode project...${NC}"
    cd "$PROJECT_DIR"
    
    if xcodegen generate; then
        echo -e "${GREEN}✅ $PROJECT_NAME project generated successfully${NC}\n"
        return 0
    else
        echo -e "${RED}❌ Failed to generate $PROJECT_NAME project${NC}"
        return 1
    fi
}

# Check if Xcode projects exist, generate if needed
if [ ! -d "$INSTALLER_PROJECT" ] || [ ! -d "$UNINSTALLER_PROJECT" ]; then
    echo -e "${YELLOW}Xcode projects not found. Checking for XcodeGen...${NC}\n"
    check_xcodegen
    
    # Generate installer project if needed
    if [ ! -d "$INSTALLER_PROJECT" ]; then
        if ! generate_project "$INSTALLER_DIR/MailchimpMCPInstaller" "$INSTALLER_PROJECT_YML" "Installer"; then
            exit 1
        fi
    fi
    
    # Generate uninstaller project if needed
    if [ ! -d "$UNINSTALLER_PROJECT" ]; then
        if ! generate_project "$INSTALLER_DIR/MailchimpMCPUninstaller" "$UNINSTALLER_PROJECT_YML" "Uninstaller"; then
            exit 1
        fi
    fi
    
    # Return to project root
    cd "$PROJECT_ROOT"
fi

# Build installer if project exists
if [ -d "$INSTALLER_PROJECT" ]; then
    echo -e "${GREEN}Building Installer app...${NC}"
    xcodebuild -project "$INSTALLER_PROJECT" \
        -scheme MailchimpMCPInstaller \
        -configuration Release \
        -derivedDataPath "$INSTALLER_DIR/MailchimpMCPInstaller/build" \
        clean build
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Installer built successfully${NC}\n"
    else
        echo -e "${RED}❌ Installer build failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Installer Xcode project not found. Skipping build.${NC}"
    echo -e "${YELLOW}   To build, create an Xcode project at: $INSTALLER_PROJECT${NC}\n"
fi

# Build uninstaller if project exists
if [ -d "$UNINSTALLER_PROJECT" ]; then
    echo -e "${GREEN}Building Uninstaller app...${NC}"
    xcodebuild -project "$UNINSTALLER_PROJECT" \
        -scheme MailchimpMCPUninstaller \
        -configuration Release \
        -derivedDataPath "$INSTALLER_DIR/MailchimpMCPUninstaller/build" \
        clean build
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Uninstaller built successfully${NC}\n"
    else
        echo -e "${RED}❌ Uninstaller build failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Uninstaller Xcode project not found. Skipping build.${NC}"
    echo -e "${YELLOW}   To build, create an Xcode project at: $UNINSTALLER_PROJECT${NC}\n"
fi

# Create DMG if both apps were built
INSTALLER_APP="$INSTALLER_DIR/MailchimpMCPInstaller/build/Build/Products/Release/MailchimpMCPInstaller.app"
UNINSTALLER_APP="$INSTALLER_DIR/MailchimpMCPUninstaller/build/Build/Products/Release/MailchimpMCPUninstaller.app"

if [ -d "$INSTALLER_APP" ] && [ -d "$UNINSTALLER_APP" ]; then
    echo -e "${GREEN}Creating DMG package...${NC}"
    "$SCRIPT_DIR/build-dmg.sh"
else
    echo -e "${YELLOW}⚠️  Skipping DMG creation. One or both apps were not built.${NC}"
    echo -e "${YELLOW}   Installer: $INSTALLER_APP${NC}"
    echo -e "${YELLOW}   Uninstaller: $UNINSTALLER_APP${NC}"
fi

echo -e "\n${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Build Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"

