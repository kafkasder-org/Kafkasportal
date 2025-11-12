# 📊 Code Coverage & AI Review Setup

## 🤖 Codecov AI Reviewer

### Installation Steps:

1. Visit: https://github.com/apps/codecov-ai
2. Click "Install" or "Configure"
3. Select organization "Vadalov"
4. Choose "Kafkasder-panel" repository
5. Grant required permissions

### Usage in PRs:

```bash
@codecov-ai-reviewer test     # Generate tests for PR
@codecov-ai-reviewer review   # AI code review
```

## 📈 Codacy Coverage Integration

### GitHub Secrets Required:

```bash
CODACY_API_TOKEN=8eqmXlJlpXhV05Ngq7OU
CODECOV_TOKEN=<your-codecov-token>
```

### Environment Variables:

```bash
CODACY_ORGANIZATION_PROVIDER=gh
CODACY_USERNAME=Vadalov
CODACY_PROJECT_NAME=Kafkasder-panel
```

### Local Testing:

```bash
# Run tests with coverage
npm run test:coverage

# Test Codacy upload
./scripts/test-codacy-coverage.sh
```

### CI/CD Integration:

✅ **ci.yml**: Codecov + Codacy upload
✅ **ci-cd-enhanced.yml**: Codecov + Codacy upload  
✅ **JUnit XML**: Test reports
✅ **LCOV**: Coverage format

### Coverage Reports:

- **Codecov**: https://codecov.io/gh/Vadalov/Kafkasder-panel
- **Codacy**: https://app.codacy.com/gh/Vadalov/Kafkasder-panel

## 🚀 Quick Setup Commands:

```bash
# 1. Set up GitHub secrets
gh secret set CODACY_API_TOKEN --body "8eqmXlJlpXhV05Ngq7OU"
gh secret set CODECOV_TOKEN --body "<your-codecov-token>"

# 2. Test locally
npm run test:coverage
bash ./scripts/test-codacy-coverage.sh

# 3. Check integration
git push origin main  # Triggers CI/CD with coverage upload
```

## 📋 Integration Status:

- ✅ Codecov AI Reviewer app installation needed
- ✅ Codacy API token configured
- ✅ GitHub Actions workflows updated
- ✅ Coverage reporters configured (LCOV, JSON, HTML)
- ✅ JUnit XML test reports
