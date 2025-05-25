/**
 * @fileoverview Emoji Picker Component for Svelte
 * A feature-rich emoji picker with AI-powered search capabilities
 */

// ✅ Export the actual component in Svelte environments
// Consumers can import this file in their Svelte apps directly
// For environments that support `.svelte` files (like SvelteKit + Vite)
export { default as EmojiPicker } from './App.svelte';

// ✅ Optional path reference for environments that don’t support `.svelte` import
export const EMOJI_PICKER_COMPONENT_PATH = './App.svelte';

export  { emojiMetadata } from './help/emoList';
export { default as debounce } from './help/debounce';

/**
 * Factory function to create the emoji picker (for non-Svelte environments)
 * This is a placeholder - actual implementation would need to be built/compiled
 */
export function createEmojiPicker() {
  throw new Error('This component is designed for Svelte. Please import the .svelte file directly in your Svelte project.');
}

// ✅ Component props
export interface EmojiPickerProps {
  /** Additional CSS class name to apply to the component */
  className?: string;
}

// ✅ Component events
export interface EmojiPickerEvents {
  /** Fired when an emoji is selected */
  emoji: CustomEvent<string>;
}

// ✅ Re-export additional types
export * from './types';

// ✅ Metadata for docs / DX
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
