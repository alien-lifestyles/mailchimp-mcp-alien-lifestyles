#!/bin/bash

# Migration script to push all branches and tags to new private repository
# Run this after creating the private repository on GitHub

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Mailchimp MCP Repository Migration${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"

# Get the new private repository URL
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  ./scripts/migrate-to-private-repo.sh <private-repo-url>"
    echo -e ""
    echo -e "${YELLOW}Example:${NC}"
    echo -e "  ./scripts/migrate-to-private-repo.sh https://github.com/alien-lifestyles/Mailchimp-MCP-by-Alien-Lifestyles.git"
    echo -e ""
    echo -e "${YELLOW}Steps:${NC}"
    echo -e "  1. Create private repository on GitHub (see MIGRATION_STEPS.md)"
    echo -e "  2. Copy the repository URL"
    echo -e "  3. Run this script with the URL"
    exit 1
fi

PRIVATE_REPO_URL="$1"

echo -e "${BLUE}Step 1: Adding private repository as remote...${NC}"
if git remote | grep -q "^private$"; then
    echo -e "${YELLOW}Remote 'private' already exists. Removing...${NC}"
    git remote remove private
fi

git remote add private "$PRIVATE_REPO_URL"
echo -e "${GREEN}✅ Private repository added as remote${NC}\n"

echo -e "${BLUE}Step 2: Fetching all branches and tags from origin...${NC}"
git fetch origin --all --tags
echo -e "${GREEN}✅ Fetched all branches and tags${NC}\n"

echo -e "${BLUE}Step 3: Pushing all branches to private repository...${NC}"
git push private --all
echo -e "${GREEN}✅ All branches pushed${NC}\n"

echo -e "${BLUE}Step 4: Pushing all tags to private repository...${NC}"
git push private --tags
echo -e "${GREEN}✅ All tags pushed${NC}\n"

echo -e "${BLUE}Step 5: Verifying migration...${NC}"
echo -e "${YELLOW}Remote repositories:${NC}"
git remote -v
echo ""

echo -e "${YELLOW}Branches in private repo:${NC}"
git ls-remote --heads private | cut -f2 | sed 's|refs/heads/||'
echo ""

echo -e "${YELLOW}Tags in private repo:${NC}"
git ls-remote --tags private | cut -f2 | sed 's|refs/tags/||' | sed 's|\^{}||' | sort -u
echo ""

echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Migration Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Verify all branches and tags are in the private repository"
echo -e "  2. Rename original repository to 'MailchimpMCP_v0' (see MIGRATION_STEPS.md)"
echo -e "  3. Update your local repository to use private as origin:"
echo -e "     ${BLUE}git remote set-url origin $PRIVATE_REPO_URL${NC}"
echo -e "  4. Or keep both remotes and use 'private' for new work"

