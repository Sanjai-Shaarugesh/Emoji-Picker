/**
 * @fileoverview Emoji Picker Component for Svelte
 * A feature-rich emoji picker with AI-powered search capabilities
 */

// For JSR compatibility, we need to create a wrapper that doesn't directly import .svelte files
// Instead, we'll provide the component path and let the consumer handle the import

/**
 * Path to the main EmojiPicker Svelte component
 * Users should import this directly in their Svelte projects
 */
export const EMOJI_PICKER_COMPONENT_PATH = './App.svelte';



/**
 * Factory function to create the emoji picker (for non-Svelte environments)
 * This is a placeholder - actual implementation would need to be built/compiled
 */
export function createEmojiPicker() {
  throw new Error('This component is designed for Svelte. Please import the .svelte file directly in your Svelte project.');
}

// Type definitions for the component props
export interface EmojiPickerProps {
  /** Additional CSS class name to apply to the component */
  className?: string;
}

// Event types that the component dispatches
export interface EmojiPickerEvents {
  /** Fired when an emoji is selected */
  emoji: CustomEvent<string>;
}

// Re-export types
export * from './types';

// Component metadata
export const componentInfo = {
  name: 'EmojiPicker',
  version: '1.0.3',
  description: 'A Svelte emoji picker component with AI-powered search',
  features: [
    'AI-powered semantic search using TensorFlow.js',
    'WebAssembly optimization for better performance',
    'Category-based browsing',
    'Recent emoji tracking',
    'Responsive design for mobile and desktop',
    'Dark mode support',
    'Accessible keyboard navigation'
  ]
} as const;