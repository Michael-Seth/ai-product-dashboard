# 📋 Quick Reference Guide

## 🚀 Essential Commands

```bash
# Development
npm run dev                    # Start everything
npm run dev-server            # API only
nx serve angular-dashboard    # Frontend only

# Building
npm run build:all             # Build all projects
npm run build:prod           # Production build

# Code Quality
npm run lint                  # Lint code
npm run remove-comments       # Remove comments
npm run remove-console        # Clean console logs
```

## 📁 Project Structure

```
ai-product-dashboard/
├── 📁 angular-dashboard/     # Main e-commerce app (Angular)
├── 📁 react-recommender/     # AI widget (React)
├── 📁 api/                   # Backend API
├── 📁 scripts/               # Build & utility scripts
├── 📁 docs/                  # 📚 All documentation
│   ├── 📁 architecture/      # System design
│   ├── 📁 development/       # Dev guides
│   ├── 📁 api/              # API docs
│   ├── 📁 deployment/       # Deploy guides
│   └── 📁 troubleshooting/  # Help & support
└── 📄 README.md             # Main entry point
```

## 🔗 Quick Links

| Need | Go To |
|------|-------|
| **Get Started** | [Installation Guide](development/INSTALLATION.md) |
| **Understand System** | [Architecture](architecture/ARCHITECTURE.md) |
| **API Integration** | [API Docs](api/API.md) |
| **Deploy to Production** | [Deployment Guide](deployment/DEPLOYMENT.md) |
| **Fix Issues** | [Troubleshooting](troubleshooting/TROUBLESHOOTING.md) |
| **Contribute** | [Contributing Guide](CONTRIBUTING.md) |
| **See All Features** | [Features List](FEATURES.md) |

## 🎯 User Journey

1. **Browse** → `/products` - Product catalog
2. **Categories** → `/categories` - Organized shopping
3. **Deals** → `/deals` - Promotions & sales
4. **Details** → `/product/:id` - Product info + AI recommendations
5. **Cart** → `/cart` - Review selections
6. **Checkout** → `/checkout` - Complete purchase
7. **Success** → `/success` - Order confirmation

## 🛠️ Development Workflow

```bash
# 1. Setup
git clone <repo>
cd ai-product-dashboard
npm install

# 2. Develop
npm run dev
# Visit http://localhost:4200

# 3. Test
npm test
npm run test:integration

# 4. Build
npm run build:all

# 5. Deploy
npm run deploy:prod
```

## 🔧 Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| **Port in use** | `npx kill-port 4200` |
| **Build fails** | `rm -rf node_modules && npm install` |
| **Tests fail** | `nx reset && npm test` |
| **AI not working** | Check `OPENAI_API_KEY` in `.env` |
| **CORS errors** | Restart dev server: `npm run dev` |

## 📞 Getting Help

1. **Check** [Troubleshooting Guide](troubleshooting/TROUBLESHOOTING.md)
2. **Search** documentation with Ctrl/Cmd + F
3. **Review** [Contributing Guide](CONTRIBUTING.md) for dev questions
4. **Create** GitHub issue with details

---

**💡 Tip: Bookmark this page for quick access to everything you need!**