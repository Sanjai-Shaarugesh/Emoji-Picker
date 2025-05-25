declare module '@shaarugesh/emoji-picker-svelte' {
  import type { SvelteComponentTyped } from 'svelte';

  export interface EmojiPickerProps {
    className?: string;
  }

  export interface EmojiPickerEvents {
    emoji: CustomEvent<string>;
  }

  const EmojiPicker: SvelteComponentTyped<EmojiPickerProps, EmojiPickerEvents>;
  export default EmojiPicker;
}
