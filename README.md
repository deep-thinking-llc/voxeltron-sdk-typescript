# @voxeltron/plugin-sdk

SDK for building Voxeltron plugins in JavaScript/TypeScript.

This in-repo SDK surface is Apache-2.0 licensed and should be treated as `0.x` pre-stable while the dedicated public SDK repo is being prepared.

## Installation

```bash
npm install @voxeltron/plugin-sdk
```

## Quick Start

```typescript
import { definePlugin, log, Context } from '@voxeltron/plugin-sdk';

export default definePlugin({
  info: {
    name: 'my-plugin',
    version: '1.0.0',
    description: 'My Voxeltron plugin',
    author: 'Your Name',
  },
  hooks: {
    onDeploySuccess: async (ctx: Context) => {
      log('info', `Deploy succeeded: ${ctx.projectId}`);
    },
  },
});
```

## Building

```bash
npx tsc
```

## API Reference

### definePlugin(definition)

Creates a plugin definition.

### Types

- `Context`: Hook context
- `PluginInfo`: Plugin metadata
- `HookHandler`: Hook function type

### Host Functions

- `log(level, message)`: Log a message
- `getConfig(key)`: Get configuration value (async)
- `sendWebhook(url, body)`: Send HTTP webhook (async)

## License

Apache-2.0
