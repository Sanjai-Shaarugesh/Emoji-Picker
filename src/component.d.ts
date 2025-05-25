declare module 'svelte-emoji-picker/component' {
  import type { SvelteComponentTyped } from 'svelte';
  import type { EmojiPickerProps, EmojiPickerEvents } from './types';

  export default class EmojiPicker extends SvelteComponentTyped<
    EmojiPickerProps,
    EmojiPickerEvents
  > {}
}
