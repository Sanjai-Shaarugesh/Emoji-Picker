
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
npm install @your-org/emoji-picker
```

### **pnpm**
```bash
pnpm add @your-org/emoji-picker
```

### **bun**
```bash
bun add @your-org/emoji-picker
```

### **jsr (Deno)**
```ts
import EmojiPicker from "jsr:@your-org/emoji-picker";
```

---

## 🧑‍💻 Usage

Import and use the emoji picker in any Svelte component:

```svelte
<script lang="ts">
  import EmojiPicker from '@your-org/emoji-picker';

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

![EmojiPicker Preview](public/emo-1.png)
![EmojiPicker Preview](public/emo-2.png)

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

MIT © [Your Name](https://github.com/yourname)

---

## ❤️ Support

If you like this project, give it a ⭐ on GitHub and share it with others!
