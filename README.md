# AI Code Reviewer

An AI-powered GitHub App that automatically reviews pull requests using **Claude** (Anthropic) and **GPT** (OpenAI). It posts inline review comments, suggests fixes, and provides a quality score for every PR.

## Features

- **Automatic PR Reviews** - Triggers on PR open, update, and reopen
- **Dual AI Support** - Configurable between Claude and OpenAI per repository
- **Inline Comments** - Posts review comments on specific lines in the diff
- **Auto-Fix Suggestions** - Suggests code fixes using GitHub's `suggestion` syntax
- **Quality Scoring** - Rates PRs from 1-10 with pass/fail checks
- **Security Analysis** - Detects hardcoded secrets, injection vulnerabilities, OWASP Top 10
- **Performance Review** - Flags N+1 queries, memory leaks, inefficient algorithms
- **Check Runs** - Creates GitHub check runs with pass/fail status
- **Web Dashboard** - React-based UI for settings, review history, and score trends
- **Configurable** - Per-repo `.codereview.yml` configuration file
- **Serverless** - Runs on AWS Lambda with API Gateway

## Architecture

```
GitHub PR Event (webhook)
        |
        v
  API Gateway (AWS)
        |
        v
  Lambda Handler
        |
        v
  Webhook Validator (verify signature)
        |
        v
  PR Processor
    ├── Fetch PR diff (Octokit)
    ├── Parse diff into chunks
    ├── Load .codereview.yml config
    └── For each file:
            |
            v
      AI Review Engine
        ├── Select provider (Claude/GPT)
        ├── Build review prompt
        ├── Send to AI API
        └── Parse structured findings
            |
            v
      Review Formatter
        ├── Inline review comments
        ├── Fix suggestions
        └── Quality score (1-10)
            |
            v
      GitHub Publisher
        ├── PR review comments
        ├── Check run (pass/fail)
        └── Summary comment
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20, TypeScript |
| AI Providers | Anthropic Claude API, OpenAI GPT API |
| GitHub | Octokit, GitHub App Webhooks |
| Backend | Express.js |
| Dashboard | React, Redux, Tailwind CSS |
| Database | MongoDB Atlas |
| Caching | Redis |
| Hosting | AWS Lambda + API Gateway |
| Testing | Jest, Supertest |
| CI/CD | GitHub Actions |
| Container | Docker |

## Quick Start

### Prerequisites

- Node.js 20+
- Docker and Docker Compose (for local development)
- GitHub App credentials
- AI API keys (Anthropic and/or OpenAI)

### Setup

```bash
# Clone the repository
git clone https://github.com/yashsaxena/ai-code-reviewer.git
cd ai-code-reviewer

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your credentials

# Start MongoDB and Redis
docker-compose up -d mongodb redis

# Run in development mode
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Building

```bash
npm run build
```

## Configuration

Create a `.codereview.yml` file in your repository root:

```yaml
# AI Provider: "claude" or "openai"
provider: claude
model: claude-sonnet-4-6

review:
  categories:
    - code-quality    # Bugs, anti-patterns, code smells
    - security        # Vulnerabilities, hardcoded secrets, OWASP
    - performance     # N+1 queries, memory leaks, optimizations

  max_files: 20           # Max files to review per PR
  max_lines: 500          # Max lines per file
  min_score_to_pass: 6    # Check fails below this score
  auto_suggest_fixes: true

ignore:
  files:
    - "*.md"
    - "package-lock.json"
  directories:
    - node_modules
    - dist
```

## Project Structure

```
ai-code-reviewer/
├── src/
│   ├── index.ts              # Lambda entry point
│   ├── config/               # Environment and default configs
│   ├── webhook/              # Webhook validation and routing
│   ├── github/               # GitHub API integration
│   ├── ai/                   # AI provider layer (Claude + OpenAI)
│   ├── review/               # Review engine, scorer, formatter
│   ├── config-loader/        # .codereview.yml parser
│   ├── db/                   # MongoDB models and repositories
│   ├── cache/                # Redis caching layer
│   ├── dashboard-api/        # REST API for web dashboard
│   └── utils/                # Logger, rate limiter
├── dashboard/                # React web dashboard
├── tests/                    # Unit and integration tests
├── infra/                    # Serverless and CloudFormation configs
├── .github/workflows/        # CI/CD pipelines
└── .codereview.yml           # Self-review config (dogfooding)
```

## How It Works

1. **Install** the GitHub App on your repository
2. **Open a PR** - the bot automatically receives a webhook
3. **AI analyzes** each changed file for quality, security, and performance issues
4. **Bot posts** inline comments with explanations and fix suggestions
5. **Check run** shows pass/fail with a quality score
6. **Dashboard** shows review history and score trends

## Deployment

### AWS Lambda (Production)

```bash
# Install Serverless Framework
npm install -g serverless

# Deploy
cd infra
serverless deploy --stage production
```

### Docker (Self-hosted)

```bash
docker-compose up -d
```

## Environment Variables

| Variable | Description |
|----------|------------|
| `GITHUB_APP_ID` | GitHub App ID |
| `GITHUB_APP_PRIVATE_KEY` | Base64-encoded private key |
| `GITHUB_WEBHOOK_SECRET` | Webhook secret |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `MONGODB_URI` | MongoDB connection string |
| `REDIS_URL` | Redis connection URL |
| `DEFAULT_AI_PROVIDER` | Default provider: `claude` or `openai` |

## License

MIT

## Author

**Yash Saxena** - [GitHub](https://github.com/yashsaxena) | [LinkedIn](https://www.linkedin.com/in/yash-saxena-049826160/)
