# Deployment Guide

## Vercel Deployment

This application is configured for easy deployment to Vercel.

### Prerequisites

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

### Quick Deployment

1. **Deploy to preview**:
   ```bash
   npm run deploy:vercel:preview
   ```

2. **Deploy to production**:
   ```bash
   npm run deploy:vercel
   ```

### Manual Deployment

1. **Build the application**:
   ```bash
   npm run build:prod
   ```

2. **Deploy with Vercel CLI**:
   ```bash
   # Preview deployment
   vercel

   # Production deployment
   vercel --prod
   ```

### Environment Variables

Set up these environment variables in your Vercel dashboard:

#### Required Variables
- `OPENAI_API_KEY` - Your OpenAI API key
- `AI_PRIMARY_PROVIDER` - Primary AI provider (default: "openai")

#### Optional Variables
- `GROK_API_KEY` - Your Grok/XAI API key
- `CLAUDE_API_KEY` - Your Claude/Anthropic API key
- `AI_FALLBACK_PROVIDERS` - Comma-separated fallback providers (default: "grok,claude,mock")
- `AI_ENABLE_FALLBACK` - Enable fallback providers (default: "true")
- `AI_MAX_RETRIES` - Maximum retry attempts (default: "2")
- `AI_RETRY_DELAY` - Retry delay in milliseconds (default: "1000")

### Project Structure

```
ai-product-dashboard/
├── api/                          # Vercel serverless functions
│   ├── health.js                 # Health check endpoint
│   └── recommendations.js        # AI recommendations endpoint
├── dist/angular-dashboard/       # Built Angular application
│   └── browser/                  # Static files served by Vercel
├── vercel.json                   # Vercel configuration
└── scripts/
    └── deploy-vercel.js          # Deployment script
```

### Build Process

The build process:
1. Builds the React web component (`npm run build:react-web-component`)
2. Copies web component files to Angular public directory
3. Builds the Angular application for production
4. Outputs everything to `dist/angular-dashboard/browser/`

### API Endpoints

- `/api/health` - Health check endpoint
- `/api/recommendations` - AI-powered product recommendations

### Troubleshooting

#### Build Issues
- Ensure all dependencies are installed: `npm install`
- Clear build cache: `rm -rf dist/ && npm run build:prod`

#### Environment Variables
- Check Vercel dashboard for correct variable names
- Ensure API keys are valid and have proper permissions

#### Web Component Loading
- Verify React web component files are in the build output
- Check browser console for loading errors

### Performance Optimization

The application includes:
- Static asset caching (1 year)
- Gzip compression
- Bundle optimization
- Code splitting

### Security Headers

Configured security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- CORS headers for API endpoints