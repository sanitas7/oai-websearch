# oai-websearch

A simple CLI tool for web searching with OpenAI o3 and the web search tool

## Installation

### Using npm

Install directly from GitHub:

```bash
npm install -g github:sanitas7/oai-websearch
```

## Usage

### Basic Usage

```bash
oai-websearch 'How to use bbox as a prompt in SAM2'
```

### Options

- `-r, --reasoning-effort <level>`: Reasoning effort level (low|medium|high, default: medium)
- `-c, --search-context-size <level>`: Search context size (low|medium|high, default: medium)  
- `-k, --openai-api-key <key>`: OpenAI API key

### API Key Configuration

API keys are resolved in the following priority order:

1. `--openai-api-key` option
2. Environment variable `OAI_SEARCH_API_KEY`
3. Environment variable `OPENAI_API_KEY`

### Examples

```bash
# Minimal example
oai-websearch 'Latest TypeScript features'

# With high reasoning effort and low search context size
oai-websearch --reasoning-effort high --search-context-size low 'Latest papers including edge cases'

# With API key specified directly
oai-websearch --openai-api-key sk-... 'search query'
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Development mode (watch files)
npm run dev
```

## License

Apache-2.0