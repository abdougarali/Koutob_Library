# GitHub Actions Workflows

This directory contains CI/CD workflows for the bookshop project.

## CI Workflow (`ci.yml`)

The CI workflow runs on every push and pull request to main/master/develop branches.

### Jobs

1. **Lint and Test**
   - Runs ESLint to check code quality
   - Runs all unit tests with Vitest
   - Generates test coverage reports
   - Uploads coverage to Codecov (optional)

2. **Build**
   - Builds the Next.js application
   - Verifies that the build completes successfully

## Environment Variables

The build job requires environment variables. For CI, default test values are used. For production builds, set these as GitHub Secrets:

### Required Secrets

- `MONGODB_URI` - MongoDB connection string
- `NEXTAUTH_SECRET` - Secret key for NextAuth.js
- `NEXTAUTH_URL` - Base URL of the application
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

### Setting Up Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with its value

### Local Development

For local development, create a `.env.local` file in the `bookshop` directory:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3002
BCRYPT_SALT_ROUNDS=10
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

**Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

## Running Tests Locally

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Coverage Reports

Coverage reports are generated in the `coverage/` directory:
- HTML report: `coverage/index.html`
- JSON report: `coverage/coverage-final.json`

Open the HTML report in a browser to view detailed coverage information.
















