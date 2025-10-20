# Installation Guide

This guide provides detailed instructions for setting up the AI Product Recommendation Dashboard development environment on different operating systems.

## Table of Contents

- [System Requirements](#system-requirements)
- [Quick Installation](#quick-installation)
- [Detailed Setup](#detailed-setup)
- [Platform-Specific Instructions](#platform-specific-instructions)
- [Development Environment](#development-environment)
- [Optional Configuration](#optional-configuration)
- [Verification](#verification)
- [Next Steps](#next-steps)

## System Requirements

### Minimum Requirements

- **Node.js**: Version 18.x or higher
- **npm**: Version 8.x or higher (comes with Node.js)
- **Git**: Latest version
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Storage**: 2GB free space for dependencies and builds

### Recommended Requirements

- **Node.js**: Version 20.x (LTS)
- **npm**: Version 10.x or higher
- **Memory**: 16GB RAM for optimal performance
- **Storage**: 5GB free space
- **CPU**: Multi-core processor for faster builds

### Supported Operating Systems

- **Windows**: 10/11 (64-bit)
- **macOS**: 10.15 (Catalina) or later
- **Linux**: Ubuntu 18.04+, CentOS 7+, or equivalent

## Quick Installation

For experienced developers who want to get started quickly:

```bash
# Clone the repository
git clone <repository-url>
cd ai-product-dashboard

# Install dependencies
npm install

# Set up environment (optional)
cp .env.example .env
# Edit .env and add your OpenAI API key

# Start development
npm run dev

# Open browser to http://localhost:4200
```

## Detailed Setup

### Step 1: Install Node.js

#### Option A: Direct Download
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the LTS version for your operating system
3. Run the installer and follow the prompts
4. Verify installation:
   ```bash
   node --version  # Should show v18.x.x or higher
   npm --version   # Should show 8.x.x or higher
   ```

#### Option B: Using Node Version Manager (Recommended)

**For macOS/Linux:**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload terminal or run:
source ~/.bashrc

# Install and use Node.js 20
nvm install 20
nvm use 20
nvm alias default 20
```

**For Windows:**
```powershell
# Install nvm-windows from: https://github.com/coreybutler/nvm-windows
# Then run:
nvm install 20.0.0
nvm use 20.0.0
```

### Step 2: Install Git

#### Windows
1. Download from [git-scm.com](https://git-scm.com/)
2. Run installer with default settings
3. Verify: `git --version`

#### macOS
```bash
# Using Homebrew (recommended)
brew install git

# Or using Xcode Command Line Tools
xcode-select --install
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install git
```

#### Linux (CentOS/RHEL)
```bash
sudo yum install git
# or for newer versions:
sudo dnf install git
```

### Step 3: Clone Repository

```bash
# Clone the repository
git clone <repository-url>
cd ai-product-dashboard

# Verify you're in the correct directory
ls -la  # Should show package.json and other project files
```

### Step 4: Install Dependencies

```bash
# Install all project dependencies
npm install

# This will install:
# - Angular and React frameworks
# - Nx monorepo tools
# - TypeScript and build tools
# - Testing frameworks
# - Development dependencies
```

**Note**: Initial installation may take 5-10 minutes depending on your internet connection.

### Step 5: Environment Configuration

#### Create Environment File
```bash
# Copy example environment file
cp .env.example .env

# Edit the file with your preferred editor
nano .env  # or vim .env, or code .env
```

#### Configure OpenAI API Key (Optional)
```bash
# Add your OpenAI API key to .env
OPENAI_API_KEY=your_openai_api_key_here
```

**Getting an OpenAI API Key:**
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

**Note**: The application works without an OpenAI API key by using mock data.

## Platform-Specific Instructions

### Windows Setup

#### Prerequisites
```powershell
# Enable execution policy for PowerShell scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Install Windows Build Tools (if needed)
npm install -g windows-build-tools
```

#### Common Windows Issues
1. **Long path names**: Enable long path support in Windows
2. **Antivirus interference**: Add project folder to antivirus exclusions
3. **PowerShell restrictions**: Ensure PowerShell execution policy allows scripts

#### Windows-Specific Commands
```powershell
# Check if ports are available
netstat -ano | findstr :4200
netstat -ano | findstr :3001

# Kill processes if needed
taskkill /PID <PID> /F
```

### macOS Setup

#### Prerequisites
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Homebrew (recommended)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### macOS-Specific Optimizations
```bash
# Increase file watcher limits
echo 'kern.maxfiles=65536' | sudo tee -a /etc/sysctl.conf
echo 'kern.maxfilesperproc=65536' | sudo tee -a /etc/sysctl.conf

# Apply changes
sudo sysctl -w kern.maxfiles=65536
sudo sysctl -w kern.maxfilesperproc=65536
```

### Linux Setup

#### Ubuntu/Debian Prerequisites
```bash
# Update package list
sudo apt update

# Install build essentials
sudo apt install build-essential

# Install curl (if not present)
sudo apt install curl

# Increase file watcher limits
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

#### CentOS/RHEL Prerequisites
```bash
# Install development tools
sudo yum groupinstall "Development Tools"
# or for newer versions:
sudo dnf groupinstall "Development Tools"

# Install curl
sudo yum install curl
# or:
sudo dnf install curl
```

## Development Environment

### IDE Setup

#### Visual Studio Code (Recommended)
```bash
# Install VS Code extensions
code --install-extension angular.ng-template
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension nrwl.angular-console
```

**Recommended VS Code Extensions:**
- Angular Language Service
- TypeScript Importer
- Tailwind CSS IntelliSense
- Nx Console
- ESLint
- Prettier

#### WebStorm/IntelliJ IDEA
1. Install Node.js plugin
2. Install Angular plugin
3. Configure TypeScript service
4. Set up ESLint and Prettier

### Terminal Setup

#### Configure Shell (Optional)
```bash
# For better development experience, consider:
# - Oh My Zsh (macOS/Linux)
# - PowerShell 7 (Windows)
# - Windows Terminal (Windows)
```

#### Useful Aliases
```bash
# Add to ~/.bashrc, ~/.zshrc, or PowerShell profile
alias nxs="nx serve"
alias nxb="nx build"
alias nxt="nx test"
alias nxl="nx lint"
```

## Optional Configuration

### Git Configuration
```bash
# Set up Git user information
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set up Git aliases
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
```

### npm Configuration
```bash
# Set npm registry (if using private registry)
npm config set registry https://registry.npmjs.org/

# Set npm cache location (optional)
npm config set cache ~/.npm-cache

# Enable package-lock.json
npm config set package-lock true
```

### Performance Optimization
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Add to your shell profile for persistence
echo 'export NODE_OPTIONS="--max-old-space-size=4096"' >> ~/.bashrc
```

## Verification

### Verify Installation
```bash
# Check Node.js and npm versions
node --version  # Should be 18.x.x or higher
npm --version   # Should be 8.x.x or higher

# Check project dependencies
npm ls --depth=0

# Verify Nx installation
npx nx --version
```

### Test Development Environment
```bash
# Start development servers
npm run dev

# In another terminal, test API
curl http://localhost:3001/api/health

# Should return:
# {"status":"OK","message":"Development API server is running"}
```

### Test Build Process
```bash
# Test production build
npm run build:all

# Verify build outputs
ls -la dist/
# Should show:
# - angular-dashboard/
# - react-recommender/
# - react-recommender-web-component/
```

### Browser Testing
1. Open `http://localhost:4200` in your browser
2. Verify the Angular dashboard loads
3. Click on a product
4. Verify recommendations appear (may be mock data)
5. Check browser console for errors

## Next Steps

### Development Workflow
1. **Start development**: `npm run dev`
2. **Make changes**: Edit files in respective framework directories
3. **Test changes**: `npm run test`
4. **Build for production**: `npm run build:all`

### Learn the Codebase
1. Read [README.md](./README.md) for project overview
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
3. Check [API.md](./API.md) for API documentation
4. Explore the code structure:
   ```
   angular-dashboard/src/    # Angular components
   react-recommender/src/    # React components
   shared-types/src/         # TypeScript interfaces
   shared-api/src/           # API functions
   ```

### Common Development Tasks
```bash
# Run specific tests
nx test angular-dashboard
nx test react-recommender

# Lint code
npm run lint

# Build specific project
nx build angular-dashboard

# Serve specific project
nx serve angular-dashboard --port 4201
```

### Troubleshooting
If you encounter issues during installation:

1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common solutions
2. Verify system requirements are met
3. Clear npm cache: `npm cache clean --force`
4. Delete node_modules and reinstall: `rm -rf node_modules && npm install`
5. Check for port conflicts: `npx kill-port 4200 3001`

### Getting Help
- Review documentation files in the project root
- Check browser console for runtime errors
- Use `DEBUG=true npm run dev` for verbose logging
- Create an issue if you encounter persistent problems

## Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use different API keys for development and production
- Rotate API keys regularly

### Dependencies
```bash
# Check for security vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix
```

### Firewall Configuration
Ensure your firewall allows connections on:
- Port 4200 (Angular development server)
- Port 3001 (API development server)

## Performance Tips

### Development Performance
- Use SSD storage for better I/O performance
- Close unnecessary applications during development
- Use `npm ci` instead of `npm install` in CI/CD
- Enable file system watching optimizations

### Build Performance
- Use multiple CPU cores: `npm run build:all -- --parallel`
- Enable build caching: Nx automatically caches builds
- Use incremental builds during development

This completes the installation guide. You should now have a fully functional development environment for the AI Product Recommendation Dashboard.