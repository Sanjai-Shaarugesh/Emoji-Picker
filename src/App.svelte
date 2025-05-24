<script>
 
  import { onMount, createEventDispatcher } from 'svelte';
  import { Popover, Separator } from 'bits-ui';
  import { Smile, Search, X } from '@lucide/svelte';
  import { emojiCategories } from './help/emoList';
  import * as tf from '@tensorflow/tfjs';
  import '@tensorflow/tfjs-backend-wasm';
  import { load } from '@tensorflow-models/universal-sentence-encoder';
 
  import { emojiMetadata } from './help/emoList';
  import debounce from './help/debounce';

  const dispatch = createEventDispatcher();
  const { className = '' } = $props();

  let recentEmojis = $state(['😀', '👍', '❤️', '😂', '🎉', '👋', '🔥', '💯']);
  let activeCategory = $state('Smileys & People');
  let searchQuery = $state('');
  let typedQuery = $state('');
  let filteredEmojis = $state([]);
  let searchInput;
  let model = null;
  let isModelLoading = $state(true);
  let isMobile = $state(false);
  let isSearching = $state(false);
  let emojiEmbeddingsCache = null;
  let searchCache = new Map();
  let wasmReady = $state(false);

  // Initialize WebAssembly backend
  async function initWasm() {
    try {
      await tf.setBackend('wasm');
      await tf.ready();
      wasmReady = true;
      console.log("WASM backend initialized");
    } catch (e) {
      console.warn("WASM backend failed, falling back to default:", e);
      await tf.setBackend('webgl');
      await tf.ready();
    }
  }

  const allEmojis = Object.values(emojiCategories).flat();
  
  // Create full emoji data with descriptions for searching
  const fullEmojiData = {};
  allEmojis.forEach(emoji => {
    fullEmojiData[emoji] = emojiMetadata[emoji] || [emoji];
  });

  // Common emotional keywords mapping for immediate results
  const quickEmojiMap = {
    'happy': ['😀', '😃', '😄', '😁', '🙂', '😊'],
    'sad': ['😢', '😭', '😞', '😔', '😟', '🥺'],
    'angry': ['😠', '😡', '🤬', '👿', '💢'],
    'love': ['❤️', '💕', '😍', '🥰', '💗', '💓'],
    'laugh': ['😂', '🤣', '😆', '😅', '😹'],
    'cool': ['😎', '🆒', '👍', '🤙'],
    'party': ['🎉', '🎊', '🥳', '🎈', '🎆'],
    'food': ['🍕', '🍔', '🍟', '🌮', '🍣', '🍩'],
    'animal': ['🐶', '🐱', '🦁', '🐼', '🦊', '🐢']
  };

  // Optimize by precomputing search terms at initialization
  const categoryIcons = {
    'Smileys & People': '😀',
    'Animals & Nature': '🐶',
    'Food & Drink': '🍎',
    'Activity': '⚽',
    'Travel & Places': '🚗',
    'Objects': '💻',
    'Symbols': '❤️',
    'Flags': '🏁'
  };

  // Precompute emoji terms for faster search
  const allEmojiTerms = Object.entries(fullEmojiData).map(([emoji, terms]) => ({
    emoji,
    terms: terms.join(' ').toLowerCase()
  }));

  // Create flat term index for fast prefix searching
  const termIndex = new Map();
  allEmojiTerms.forEach(({emoji, terms}) => {
    const words = terms.split(/\s+/);
    words.forEach(word => {
      if (!termIndex.has(word)) {
        termIndex.set(word, []);
      }
      termIndex.get(word).push(emoji);
    });
  });

  async function loadModel() {
    try {
      // Initialize WASM backend before loading model
      await initWasm();
      
      model = await load();
      
      // Pre-compute embeddings for all emoji descriptions
      await precalculateEmojiEmbeddings();
      isModelLoading = false;
    } catch (error) {
      console.error("Error loading TensorFlow model:", error);
      isModelLoading = false;
      // Fall back to basic search if model fails to load
    }
  }

  async function precalculateEmojiEmbeddings() {
    // Split into smaller batches to prevent memory issues
    const batchSize = 100;
    const batches = [];
    
    for (let i = 0; i < allEmojiTerms.length; i += batchSize) {
      batches.push(allEmojiTerms.slice(i, i + batchSize));
    }
    
    // Process in batches
    const embeddings = [];
    for (const batch of batches) {
      const batchTerms = batch.map(item => item.terms);
      const batchEmbeddings = await model.embed(batchTerms);
      
      // Convert to regular array for easier handling
      const values = await batchEmbeddings.array();
      embeddings.push(...values);
      
      // Clean up tensor to free memory
      batchEmbeddings.dispose();
    }
    
    // Store the embeddings
    emojiEmbeddingsCache = tf.tensor2d(embeddings);
  }

  // Fast prefix-based search that executes instantly
  function instantSearch(query) {
    if (!query) return [];
    query = query.toLowerCase().trim();
    
    // First check quickEmojiMap for instant emotional keywords
    for (const [keyword, emojis] of Object.entries(quickEmojiMap)) {
      if (keyword.includes(query) || query.includes(keyword)) {
        return emojis;
      }
    }
    
    // Then check our term index for exact prefix matches
    const results = new Set();
    termIndex.forEach((emojis, term) => {
      if (term.startsWith(query) || query.startsWith(term)) {
        emojis.forEach(emoji => results.add(emoji));
      }
    });
    
    return Array.from(results).slice(0, 24); // Limit to reasonable number
  }

  // Debounced full search to avoid lag while typing
  const debouncedSearch = debounce(async () => {
    await performSearch(searchQuery);
  }, 300);

  // Update search results immediately on input change
  $effect(() => {
    typedQuery = searchQuery;
    
    if (!searchQuery.trim()) {
      filteredEmojis = [];
      return;
    }
    
    // Check cache first for instant results
    if (searchCache.has(searchQuery)) {
      filteredEmojis = searchCache.get(searchQuery);
      return;
    }
    
    // Run instant search first for immediate feedback
    const instantResults = instantSearch(searchQuery);
    if (instantResults.length > 0) {
      filteredEmojis = instantResults;
    }
    
    // Then trigger the full search
    debouncedSearch();
  });

  async function performSearch(query) {
    if (!query.trim()) {
      filteredEmojis = [];
      return;
    }

    const processedQuery = query.toLowerCase().trim();
    
    // Check cache first for instant results
    if (searchCache.has(processedQuery)) {
      filteredEmojis = searchCache.get(processedQuery);
      return;
    }
    
    // Show loading state
    isSearching = true;

    // Use model for semantic search
    if (model && emojiEmbeddingsCache) {
      try {
        // Encode the search query
        const queryEmbedding = await model.embed(processedQuery);
        
        // Calculate similarity scores using optimized TensorFlow operations
        const scores = tf.tidy(() => {
          // Calculate cosine similarity using pre-cached embeddings
          const similarity = tf.matMul(queryEmbedding, emojiEmbeddingsCache.transpose()).dataSync();
          return similarity;
        });
        
        // Map scores to emojis and sort by relevance
        const scoredEmojis = allEmojiTerms.map((item, i) => ({
          emoji: item.emoji,
          score: scores[i]
        }));
        
        // Sort by score and take results - lower threshold for more matches
        const sortedResults = scoredEmojis
          .sort((a, b) => b.score - a.score)
          .filter(item => item.score > 0.15) // Lower threshold for more matches
          .slice(0, 30) // Limit max results
          .map(item => item.emoji);

        // If no results with TensorFlow, fallback to basic search
        if (sortedResults.length === 0) {
          basicSearch(processedQuery);
        } else {
          filteredEmojis = sortedResults;
          // Cache this search result for future use
          searchCache.set(processedQuery, sortedResults);
        }
      } catch (error) {
        console.error("Error during NLP search:", error);
        basicSearch(processedQuery); // Fallback
      } finally {
        isSearching = false;
      }
    } else {
      basicSearch(processedQuery); // Use basic search if model isn't loaded
    }
  }

  function basicSearch(query) {
    // Enhanced basic search with fallbacks
    const results = new Set();
    
    // First pass: direct keyword matching
    Object.entries(fullEmojiData).forEach(([emoji, keywords]) => {
      if (keywords.some(keyword => keyword.toLowerCase().includes(query) || 
                               query.includes(keyword.toLowerCase()))) {
        results.add(emoji);
      }
    });
    
    // If no results, try partial matching
    if (results.size === 0) {
      Object.entries(fullEmojiData).forEach(([emoji, keywords]) => {
        for (const keyword of keywords) {
          // Check if any word in the keyword contains the query
          const words = keyword.toLowerCase().split(' ');
          if (words.some(word => word.includes(query) || query.includes(word))) {
            results.add(emoji);
          }
        }
      });
    }
    
    // If still no results, suggest some popular emojis as fallback
    if (results.size === 0) {
      const fallbackEmojis = ['😀', '👍', '❤️', '🎉', '👋', '💪', '🙏', '🤔'];
      fallbackEmojis.forEach(emoji => results.add(emoji));
    }
    
    filteredEmojis = Array.from(results);
    isSearching = false;
    
    // Cache this search result
    searchCache.set(query, filteredEmojis);
  }

  // Limit cache size to prevent memory issues
  function maintainCacheSize() {
    if (searchCache.size > 100) {
      // Remove oldest entries
      const keysToDelete = Array.from(searchCache.keys()).slice(0, 20);
      keysToDelete.forEach(key => searchCache.delete(key));
    }
  }

  function selectEmoji(emoji) {
    recentEmojis = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 8);
    dispatch('emoji', emoji);
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      searchQuery = '';
      searchInput?.blur();
    }
  }

  function checkDeviceSize() {
    isMobile = window.innerWidth < 640; 
  }

  onMount(() => {
    loadModel();
    searchInput?.focus();
    checkDeviceSize();
    
    
    window.addEventListener('resize', checkDeviceSize);
    
    return () => {
      window.removeEventListener('resize', checkDeviceSize);
      
      if (emojiEmbeddingsCache) {
        emojiEmbeddingsCache.dispose();
      }
    };
  });
</script>
<svelte:window on:keydown={handleKeydown} />





<Popover.Root>
  <Popover.Trigger
    class="inline-flex items-center justify-center p-2 text-2xl text-gray-600 dark:text-gray-300 bg-white/40 dark:bg-gray-800/40 rounded-full shadow hover:bg-white/60 hover:dark:bg-gray-700/60 backdrop-blur transition-all"
  >
    <Smile class="w-5 h-5" />
  </Popover.Trigger>

  <Popover.Portal>
    <Popover.Content
      class="z-50 w-[90vw] max-w-[420px] sm:w-[320px] rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl"
      side={isMobile ? "bottom" : "right"}
      sideOffset={isMobile ? 5 : 12}
      align={isMobile ? "center" : "start"}
    >
      <div class="flex items-center mb-4">
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mr-3">
          <Smile class="w-6 h-6 text-gray-600 dark:text-gray-200" />
        </div>
        <div class="flex flex-col">
          <h4 class="text-base font-semibold text-gray-900 dark:text-white">Pick an emoji</h4>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {wasmReady ? 'Supercharged TBM AI with WASM' : 'Make it expressive'}
          </p>
        </div>
      </div>

      <Separator.Root class="h-px bg-gray-300 dark:bg-gray-700 mb-3" />

      <!-- Search Input with loading indicator -->
      <div class="relative mb-3">
        <div class="relative">
          <input
            bind:this={searchInput}
            bind:value={searchQuery}
            type="text"
            placeholder={isModelLoading ? "Loading smart search..." : "Search emojis by description..."}
            class="w-full px-3 py-2 pl-9 text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-400"
          />
          <div class="absolute inset-y-0 left-2 flex items-center pointer-events-none">
            <Search class="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          {#if searchQuery}
            <button 
              onclick={() => searchQuery = ''}
              class="absolute inset-y-0 right-2 flex items-center"
            >
              <X class="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
            </button>
          {/if}
        </div>
        {#if (isModelLoading || isSearching) && searchQuery}
          <div class="flex items-center space-x-2 text-xs text-blue-500 dark:text-blue-400 mt-1">
            <div class="animate-spin h-3 w-3 border border-blue-500 dark:border-blue-400 rounded-full border-t-transparent"></div>
            <span>{isModelLoading ? "Loading intelligent search..." : "Finding more emojis..."}</span>
          </div>
        {/if}
      </div>

      <!-- Category Tabs -->
      {#if !searchQuery.trim()}
        <div class="flex space-x-1 overflow-x-auto mb-2 pb-1 no-scrollbar">
          {#each Object.keys(emojiCategories) as category}
            <button
              onclick={() => (activeCategory = category)}
              class="flex items-center justify-center min-w-10 h-10 text-lg rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors
              {activeCategory === category ? 'bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}"
              title={category}
            >
              {categoryIcons[category]}
            </button>
          {/each}
        </div>
      {/if}

      <!-- Emoji Grid -->
      <div class="h-56 overflow-y-auto custom-scrollbar">
        {#if searchQuery.trim()}
          {#if filteredEmojis.length > 0}
            <div class="grid grid-cols-6 sm:grid-cols-8 gap-1">
              {#each filteredEmojis as emoji}
                <button
                  onclick={() => selectEmoji(emoji)}
                  class="w-8 h-8 text-lg rounded hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-110 active:scale-95 transition"
                >
                  {emoji}
                </button>
              {/each}
            </div>
          {:else if isSearching || isModelLoading}
            <div class="flex justify-center items-center h-full">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
            </div>
          {:else}
            <div class="text-center py-6">
              <p class="text-sm text-gray-500 dark:text-gray-400">No matches found for "{searchQuery}"</p>
              <div class="mt-3 grid grid-cols-8 gap-1 max-w-xs mx-auto">
                {#each ['😀', '👍', '❤️', '😂', '🎉', '👋', '🔥', '💯'] as emoji}
                  <button
                    onclick={() => selectEmoji(emoji)}
                    class="w-8 h-8 text-lg rounded hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-110 active:scale-95 transition"
                  >
                    {emoji}
                  </button>
                {/each}
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Try these popular emojis instead</p>
            </div>
          {/if}
        {:else}
          {#if recentEmojis.length > 0}
            <div class="mb-3">
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Recent</p>
              <div class="grid grid-cols-6 sm:grid-cols-8 gap-1">
                {#each recentEmojis as emoji}
                  <button
                    onclick={() => selectEmoji(emoji)}
                    class="w-8 h-8 text-lg rounded hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-110 active:scale-95 transition"
                  >
                    {emoji}
                  </button>
                {/each}
              </div>
            </div>
          {/if}

          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">{activeCategory}</p>
            <div class="grid grid-cols-6 sm:grid-cols-8 gap-1">
              {#each emojiCategories[activeCategory] as emoji}
                <button
                  onclick={() => selectEmoji(emoji)}
                  class="w-8 h-8 text-lg rounded hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-110 active:scale-95 transition"
                >
                  {emoji}
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 text-center">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          {searchQuery.trim()
            ? `${filteredEmojis.length} emojis found`
            : `${emojiCategories[activeCategory].length} emojis`}
        </p>
      </div>
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>

<style>
  /* Custom scrollbar styles */
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 20px;
  }
  
  /* Hide scrollbar for clean UI while maintaining functionality */
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
</style>
