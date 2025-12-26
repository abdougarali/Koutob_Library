# CI/CD Setup Guide

This document describes the CI/CD pipeline setup for the bookshop project.

## Overview

The project uses GitHub Actions for continuous integration and deployment. The CI pipeline runs on every push and pull request to ensure code quality and build success.

## GitHub Actions Workflow

### Location
`.github/workflows/ci.yml`

### Triggers
- Push to `main`, `master`, or `develop` branches
- Pull requests to `main`, `master`, or `develop` branches

### Jobs

#### 1. Lint and Test
- **ESLint**: Checks code quality and style
- **Unit Tests**: Runs all Vitest tests
- **Coverage**: Generates test coverage reports
- **Codecov**: Uploads coverage (optional, requires Codecov account)

#### 2. Build
- **Next.js Build**: Verifies the application builds successfully
- Uses environment variables from GitHub Secrets (or test defaults)

## Setting Up GitHub Secrets

For production builds and deployments, you need to configure GitHub Secrets.

### Steps

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each required secret:

### Required Secrets

| Secret Name | Description | Example |
|------------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js | `your-random-secret-key-here` |
| `NEXTAUTH_URL` | Base URL of the application | `https://yourdomain.com` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-api-secret` |

### Optional Secrets

- `CODECOV_TOKEN` - For uploading coverage to Codecov (if using Codecov)

## Local Development Setup

### Environment Variables

Create a `.env.local` file in the `bookshop` directory:

```env
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3002

# Password Hashing
BCRYPT_SALT_ROUNDS=10

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Security Note**: 
- `.env.local` is already in `.gitignore`
- Never commit secrets to version control
- Use different secrets for development and production

### Running CI Checks Locally

```bash
# Run linting
npm run lint

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build the application
npm run build
```

## Test Coverage

### Viewing Coverage Reports

After running `npm run test:coverage`, open:
- HTML Report: `coverage/index.html` in your browser
- Text Report: Displayed in terminal

### Coverage Configuration

Coverage is configured in `vitest.config.ts`:
- Provider: `v8`
- Reporters: `text`, `json`, `html`
- Excluded: `node_modules/`, `tests/`, `scripts/`, test files

## Deployment

### Vercel Deployment

For Vercel deployment, set environment variables in:
1. Vercel Dashboard → Project Settings → Environment Variables
2. Add the same secrets as GitHub Secrets

### Environment-Specific Variables

You can set different values for:
- **Production**: Production deployments
- **Preview**: Preview deployments (PRs)
- **Development**: Local development

## Troubleshooting

### Build Fails in CI

1. Check if all required environment variables are set
2. Verify Node.js version matches (currently 20)
3. Check for TypeScript errors: `npm run build`
4. Review workflow logs in GitHub Actions

### Tests Fail in CI

1. Ensure all tests pass locally: `npm test`
2. Check for environment-specific issues
3. Verify mocks are properly configured
4. Review test output in workflow logs

### Coverage Not Uploading

1. Codecov upload is optional and won't fail the build
2. To enable, add `CODECOV_TOKEN` secret
3. Or remove the Codecov step if not needed

## Best Practices

1. **Never commit secrets**: Always use GitHub Secrets or `.env.local`
2. **Test locally first**: Run `npm test` and `npm run build` before pushing
3. **Keep dependencies updated**: Regularly update `package-lock.json`
4. **Review CI logs**: Check workflow runs for warnings or issues
5. **Use branch protection**: Require CI to pass before merging PRs

## Next Steps

- [ ] Set up branch protection rules
- [ ] Configure deployment workflow (if needed)
- [ ] Set up Codecov account (optional)
- [ ] Add E2E tests with Playwright
- [ ] Configure automated dependency updates (Dependabot)



























