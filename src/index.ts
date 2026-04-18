// SPDX-License-Identifier: Apache-2.0
// Copyright (C) 2026 Deep Thinking LLC.
/**
 * Voxeltron Plugin SDK for JavaScript/TypeScript
 * 
 * This SDK provides the necessary types and functions for building
 * Voxeltron plugins using JavaScript or TypeScript.
 * 
 * @example
 * ```typescript
 * import { definePlugin, onDeployStart, Context } from '@voxeltron/plugin-sdk';
 * 
 * export default definePlugin({
 *   name: 'my-plugin',
 *   version: '1.0.0',
 *   hooks: {
 *     onDeployStart: (ctx: Context) => {
 *       console.log(`Deployment started: ${ctx.projectId}`);
 *     }
 *   }
 * });
 * ```
 */

/** Plugin information */
export interface PluginInfo {
  /** Plugin name */
  name: string;
  /** Plugin version */
  version: string;
  /** Plugin description */
  description?: string;
  /** Plugin author */
  author?: string;
}

/** Context passed to hooks */
export interface Context {
  /** Hook name being fired */
  hook: string;
  /** Project ID (if applicable) */
  projectId?: string;
  /** Deployment ID (if applicable) */
  deploymentId?: string;
  /** Additional context data */
  data: Record<string, unknown>;
}

/** Hook handler function type */
export type HookHandler = (ctx: Context) => Promise<void> | void;

/** Plugin definition */
export interface PluginDefinition {
  /** Plugin information */
  info: PluginInfo;
  /** Hook handlers */
  hooks: {
    [hookName: string]: HookHandler;
  };
}

/**
 * Define a Voxeltron plugin
 * @param definition Plugin definition
 * @returns Plugin definition
 */
export function definePlugin(definition: PluginDefinition): PluginDefinition {
  return definition;
}

/**
 * Log a message
 * @param level Log level
 * @param message Message to log
 */
export function log(level: 'debug' | 'info' | 'warn' | 'error', message: string): void {
  // In Tier 2, this sends to the daemon via IPC
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };
  
  // Send to parent process via IPC
  if (typeof process !== 'undefined' && process.send) {
    process.send({ type: 'log', data: logEntry });
  } else {
    console.log(`[${level.toUpperCase()}] ${message}`);
  }
}

/**
 * Get plugin configuration value
 * @param key Configuration key
 * @returns Configuration value or undefined
 */
export async function getConfig(key: string): Promise<string | undefined> {
  // In Tier 2, this calls the daemon via IPC
  return new Promise((resolve) => {
    if (typeof process !== 'undefined' && process.send) {
      const requestId = Math.random().toString(36).substring(7);
      
      const handler = (response: { type: string; id: string; value?: string }) => {
        if (response.type === 'config_response' && response.id === requestId) {
          resolve(response.value);
          process.off?.('message', handler);
        }
      };
      
      process.on('message', handler);
      process.send({ type: 'config_get', id: requestId, key });
      
      // Timeout after 5 seconds
      setTimeout(() => {
        resolve(undefined);
        process.off?.('message', handler);
      }, 5000);
    } else {
      resolve(undefined);
    }
  });
}

/**
 * Send a webhook
 * @param url Webhook URL
 * @param body Request body
 */
export async function sendWebhook(url: string, body: unknown): Promise<void> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Voxeltron-Plugin/1.0',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    log('error', `Failed to send webhook: ${error}`);
    throw error;
  }
}

/**
 * Create a context object
 * @param hook Hook name
 * @param data Additional data
 * @returns Context object
 */
export function createContext(
  hook: string,
  data: Record<string, unknown> = {}
): Context {
  return {
    hook,
    projectId: data.projectId as string | undefined,
    deploymentId: data.deploymentId as string | undefined,
    data,
  };
}

// Default export
export default {
  definePlugin,
  log,
  getConfig,
  sendWebhook,
  createContext,
};
