# Fiber UI

## Local Development Setup

### 1. Install Doppler CLI

```bash
# macOS
brew install dopplerhq/cli/doppler

# Windows
scoop install doppler

# Linux
curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh | sh
```

### 2. Configure Doppler

```bash
# Login to Doppler
doppler login

# Setup the project (configured in doppler.yaml)
doppler setup
```

### 3. Start the Database

Go to https://github.com/MoonwalkInc/fiber-rewards-api and see README to start db.

### 4. Start the App

```bash
pnpm install
pnpm run dev
```

The app will be running on [localhost:3000](http://localhost:3000/)
