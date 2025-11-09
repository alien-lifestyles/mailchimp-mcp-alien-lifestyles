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

INSTALLER_PROJECT="$INSTALLER_DIR/MailchimpMCPInstaller.xcodeproj"
UNINSTALLER_PROJECT="$INSTALLER_DIR/MailchimpMCPUninstaller.xcodeproj"

# Check if Xcode projects exist
if [ ! -d "$INSTALLER_PROJECT" ] && [ ! -f "$INSTALLER_DIR/MailchimpMCPInstaller/Package.swift" ]; then
    echo -e "${YELLOW}Warning: Xcode project not found.${NC}"
    echo -e "${YELLOW}Creating Xcode project structure...${NC}"
    echo -e "${YELLOW}Note: You'll need to create the Xcode projects manually using Xcode.${NC}"
    echo -e "${YELLOW}The Swift source files are ready in: $INSTALLER_DIR${NC}\n"
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
if [ -d "$INSTALLER_DIR/MailchimpMCPInstaller/build/Release/MailchimpMCPInstaller.app" ] && \
   [ -d "$INSTALLER_DIR/MailchimpMCPUninstaller/build/Release/MailchimpMCPUninstaller.app" ]; then
    echo -e "${GREEN}Creating DMG package...${NC}"
    "$SCRIPT_DIR/build-dmg.sh"
else
    echo -e "${YELLOW}⚠️  Skipping DMG creation. One or both apps were not built.${NC}"
fi

echo -e "\n${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Build Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"

