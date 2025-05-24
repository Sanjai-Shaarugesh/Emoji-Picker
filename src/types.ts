/**
 * Type definitions for the Emoji Picker component
 */

export type EmojiCategory = 
  | 'Smileys & People'
  | 'Animals & Nature'
  | 'Food & Drink'
  | 'Activity'
  | 'Travel & Places'
  | 'Objects'
  | 'Symbols'
  | 'Flags';

export interface EmojiMetadata {
  [emoji: string]: string[];
}

export interface CategoryIcons {
  [category: string]: string;
}

export interface QuickEmojiMap {
  [keyword: string]: string[];
}

export interface EmojiSearchResult {
  emoji: string;
  score: number;
}

export interface EmojiTermItem {
  emoji: string;
  terms: string;
}