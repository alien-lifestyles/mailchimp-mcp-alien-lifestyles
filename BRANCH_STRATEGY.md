# Branch Strategy

## Overview

This project uses a two-branch strategy to separate stable production code from experimental tier 1 improvements.

## Branch Structure

### `main` Branch
- **Purpose**: Stable, production-ready code
- **Status**: Protected, tested, and verified
- **Releases**: Tagged versions (v0.3, v0.4, etc.)
- **Workflow**: 
  - Only merged from `claude` after testing
  - Requires pull request reviews
  - All features must be tested and documented

### `claude` Branch
- **Purpose**: Tier 1 improvements and experimental features
- **Status**: Development and experimentation
- **Workflow**:
  - Direct commits allowed for rapid iteration
  - AI-suggested improvements
  - Experimental features
  - Testing ground before merging to main

## Workflow

### Starting Tier 1 Improvements

```bash
# Ensure you're on main and up to date
git checkout main
git pull origin main

# Create/switch to claude branch
git checkout claude
# Or if branch doesn't exist:
git checkout -b claude

# Push to GitHub
git push -u origin claude
```

### Making Changes on Claude Branch

```bash
# Make your changes
# ... edit files ...

# Commit changes
git add .
git commit -m "Tier 1: [description of improvement]"

# Push to GitHub
git push origin claude
```

### Testing on Claude Branch

- Test all changes thoroughly
- Verify functionality works as expected
- Check for regressions
- Document any breaking changes

### Merging to Main

When tier 1 improvements are ready for production:

```bash
# Option 1: Merge via Pull Request (Recommended)
# - Create PR from claude → main on GitHub
# - Review changes
# - Merge when approved

# Option 2: Direct merge (if you have permissions)
git checkout main
git pull origin main
git merge claude
git push origin main

# Tag the release
git tag -a v0.4 -m "Version 0.4.0 - [description]"
git push origin v0.4
```

### Keeping Branches in Sync

```bash
# Update claude with latest from main
git checkout claude
git merge main
# Resolve any conflicts
git push origin claude

# Or rebase to keep history clean
git checkout claude
git rebase main
git push origin claude --force-with-lease
```

## Branch Protection (GitHub Settings)

### Main Branch Protection
- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Do not allow force pushes
- ✅ Do not allow deletions

### Claude Branch
- ⚠️ Allow direct pushes (for rapid iteration)
- ⚠️ No required reviews (experimental branch)
- ✅ Still run CI/CD checks (optional)

## Best Practices

1. **Commit Messages**: Use prefix "Tier 1:" for all commits on claude branch
   ```
   Tier 1: Improve error handling in API client
   Tier 1: Add new tool for campaign analytics
   ```

2. **Regular Sync**: Keep claude branch updated with main regularly
   ```bash
   git checkout claude
   git merge main
   ```

3. **Feature Flags**: Consider using feature flags for experimental features
   - Allows gradual rollout
   - Easy to disable if issues arise

4. **Documentation**: Document all tier 1 improvements
   - Update CHANGELOG.md when merging to main
   - Add inline code comments for complex changes

5. **Testing**: Test thoroughly before merging to main
   - Unit tests
   - Integration tests
   - Manual testing
   - Edge case testing

## Current Status

- **Main Branch**: v0.3 (Native macOS Installer and Uninstaller)
- **Claude Branch**: Ready for tier 1 improvements

## Quick Reference

```bash
# Switch to claude branch
git checkout claude

# Create new feature branch from claude (optional)
git checkout -b claude/feature-name

# See differences between branches
git diff main..claude

# See commits in claude not in main
git log main..claude

# See commits in main not in claude
git log claude..main
```

