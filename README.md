
# 😄 EmojiPicker — A Svelte Emoji Picker Component

A simple, reusable, and event-based emoji picker built for Svelte. Perfect for chat apps, editors, and anything fun!



---

## 🚀 Features

- 🎉 Clean grid of emojis
- 🧠 Emits selected emoji using `on:emoji` event
- 🛠️ Easy to integrate into Svelte apps
- 📦 Works with `npm`, `pnpm`, `bun`, and `jsr` (Deno)

---

## 📦 Installation

Install via your favorite package manager:

### **npm**
```bash
npm i @shaarugesh/emoji-picker-svelte
```

### **pnpm**
```bash
pnpm add @shaarugesh/emoji-picker-svelte
```

### **bun**
```bash
bun add @shaarugesh/emoji-picker-svelte
```

### **jsr (Deno)**
```ts
import * as  EmojiPicker from "jsr:@shaarugesh/emoji-picker-svelte";
```

---

## 🧑‍💻 Usage

Import and use the emoji picker in any Svelte component:

```svelte
<script lang="ts">
    import EmojiPicker from '@shaarugesh/emoji-picker-svelte';

  let selectedElement = { content: '' };

  function updateTextSettings() {
    // Your custom logic
    console.log('Updated:', selectedElement.content);
  }
</script>

<EmojiPicker
  on:emoji={(e: CustomEvent) => {
    selectedElement.content = e.detail;
    updateTextSettings();
  }}
/>
```

---

## 📸 Preview

![EmojiPicker Preview](https://raw.githubusercontent.com/Sanjai-Shaarugesh/Emoji-Picker/refs/heads/main/public/emo-1.png)
![EmojiPicker Preview](https://raw.githubusercontent.com/Sanjai-Shaarugesh/Emoji-Picker/refs/heads/main/public/emo-2.png)

---

## 🎪 Demo Link
[https://emoji-picker-demo.vercel.app](https://emoji-picker-demo.vercel.app)

---


## Github repo link 

[https://github.com/Sanjai-Shaarugesh/Emoji-Picker](https://github.com/Sanjai-Shaarugesh/Emoji-Picker)

---

## 🛠 Development Setup

```bash
git clone https://github.com/your-org/emoji-picker.git
cd emoji-picker
npm install
npm run dev
```

Make sure you have [SvelteKit](https://kit.svelte.dev) if you're testing it inside an app.

---

## 🤝 Contributing

Got an idea? Found a bug? Open an issue or PR — contributions are welcome!

---

## 📄 License

MIT © [sanjai-shaarugesh](https://github.com/Sanjai-Shaarugesh/Emoji-Picker/blob/main/LICENSE)

---

## ❤️ Support

If you like this project, give it a ⭐ on GitHub and share it with others!
