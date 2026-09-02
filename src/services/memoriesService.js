// src/services/memoriesService.js
// Storage and intelligent question generation engine for "My Memories" game

export const MEMORY_CATEGORIES = [
  { id: "person", label: "Person / Family", icon: "Users", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { id: "place", label: "Place / Home", icon: "Home", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { id: "object", label: "Object / Belonging", icon: "Package", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { id: "event", label: "Family Event / Celebration", icon: "PartyPopper", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { id: "pet", label: "Pet / Animal", icon: "Dog", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { id: "other", label: "Favorite Food / Tradition", icon: "Sparkles", color: "bg-rose-100 text-rose-800 border-rose-200" },
];

export const INITIAL_DEFAULT_MEMORIES = [
  {
    id: "mem-1",
    category: "person",
    name: "Priya",
    relationship: "Daughter",
    location: "Home",
    memory: "Priya visits every Sunday with homemade sweets.",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    dateAdded: "2026-08-10",
    timesPlayed: 8,
    timesRemembered: 8,
    isFavorite: true,
  },
  {
    id: "mem-2",
    category: "place",
    name: "Ancestral Home",
    relationship: "Family Residence",
    location: "Jabalpur",
    memory: "This was our beloved family home with the courtyard mango tree.",
    imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
    dateAdded: "2026-08-12",
    timesPlayed: 7,
    timesRemembered: 6,
    isFavorite: true,
  },
  {
    id: "mem-3",
    category: "person",
    name: "Aarav",
    relationship: "Grandson",
    location: "Living Room",
    memory: "Aarav loves reading stories with you and showing his school drawings.",
    imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80",
    dateAdded: "2026-08-15",
    timesPlayed: 6,
    timesRemembered: 5,
    isFavorite: true,
  },
  {
    id: "mem-4",
    category: "pet",
    name: "Bruno",
    relationship: "Family Pet Dog",
    location: "Garden",
    memory: "Bruno loves resting by your feet while you sip your morning tea.",
    imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
    dateAdded: "2026-08-18",
    timesPlayed: 5,
    timesRemembered: 5,
    isFavorite: false,
  },
  {
    id: "mem-5",
    category: "object",
    name: "Brass Puja Diya",
    relationship: "Devotional Item",
    location: "Puja Room",
    memory: "Lit every morning during prayers and evening aarti.",
    imageUrl: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=800&q=80",
    dateAdded: "2026-08-20",
    timesPlayed: 6,
    timesRemembered: 5,
    isFavorite: true,
  },
  {
    id: "mem-6",
    category: "event",
    name: "Diwali Family Dinner",
    relationship: "Annual Festival",
    location: "Dining Hall",
    memory: "All the children and relatives gathered for sweets and sparklers.",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    dateAdded: "2026-08-22",
    timesPlayed: 4,
    timesRemembered: 4,
    isFavorite: false,
  },
  {
    id: "mem-7",
    category: "place",
    name: "Lodhi Gardens",
    relationship: "Favorite Walking Park",
    location: "New Delhi",
    memory: "Your favorite evening walking spot with friends amidst the flowers.",
    imageUrl: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
    dateAdded: "2026-08-25",
    timesPlayed: 4,
    timesRemembered: 3,
    isFavorite: false,
  },
  {
    id: "mem-8",
    category: "other",
    name: "Adrak Wali Chai",
    relationship: "Daily Morning Ritual",
    location: "Kitchen / Veranda",
    memory: "Warm ginger tea brewed with fresh cardamom every 7:30 AM.",
    imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
    dateAdded: "2026-08-26",
    timesPlayed: 5,
    timesRemembered: 5,
    isFavorite: true,
  },
];

export const INITIAL_JOURNAL_ENTRIES = [
  {
    id: "jrn-1",
    memoryId: "mem-1",
    memoryName: "Priya",
    date: "Yesterday, 4:15 PM",
    speechText: "Priya brings the best kaju katli. Her smile reminds me of my mother.",
    emotion: "Happy & Nostalgic",
    emotionEmoji: "😊",
    inputType: "voice",
  },
  {
    id: "jrn-2",
    memoryId: "mem-2",
    memoryName: "Ancestral Home",
    date: "2 days ago, 11:30 AM",
    speechText: "We used to sit under the big tree during monsoon rains.",
    emotion: "Warm & Peaceful",
    emotionEmoji: "❤️",
    inputType: "voice",
  },
];

const STORAGE_KEYS = {
  MEMORIES: "smriti_family_memories_v1",
  JOURNAL: "smriti_memory_journal_v1",
  SCORES: "smriti_memory_scores_v1",
};

export const getStoredMemories = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMORIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(INITIAL_DEFAULT_MEMORIES));
      return INITIAL_DEFAULT_MEMORIES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load memories from localStorage", e);
    return INITIAL_DEFAULT_MEMORIES;
  }
};

export const saveMemories = (memories) => {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
  } catch (e) {
    console.error("Failed to save memories", e);
  }
};

export const addMemory = (memoryData) => {
  const current = getStoredMemories();
  const newMemory = {
    id: `mem-${Date.now()}`,
    dateAdded: new Date().toISOString().split("T")[0],
    timesPlayed: 0,
    timesRemembered: 0,
    isFavorite: false,
    ...memoryData,
  };
  const updated = [newMemory, ...current];
  saveMemories(updated);
  return newMemory;
};

export const updateMemory = (id, updates) => {
  const current = getStoredMemories();
  const updated = current.map((m) => (m.id === id ? { ...m, ...updates } : m));
  saveMemories(updated);
  return updated;
};

export const deleteMemory = (id) => {
  const current = getStoredMemories();
  const updated = current.filter((m) => m.id !== id);
  saveMemories(updated);
  return updated;
};

export const getJournalEntries = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.JOURNAL);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(INITIAL_JOURNAL_ENTRIES));
      return INITIAL_JOURNAL_ENTRIES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_JOURNAL_ENTRIES;
  }
};

export const addJournalEntry = (entry) => {
  try {
    const current = getJournalEntries();
    const newEntry = {
      id: `jrn-${Date.now()}`,
      date: "Just now",
      ...entry,
    };
    const updated = [newEntry, ...current];
    localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to add journal entry", e);
    return [];
  }
};

export const getScoreHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCORES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const recordSessionScore = (sessionResult) => {
  try {
    const current = getScoreHistory();
    const updated = [sessionResult, ...current].slice(0, 30);
    localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to record score", e);
  }
};

/**
 * Intelligent Question Generator
 * Generates varied, elderly-appropriate questions strictly based on caregiver inputs.
 * NEVER invents personal facts.
 */
export const generateQuestionForMemory = (memory, allMemories, difficulty = "Medium", lang = "en") => {
  const isHindi = lang === "hi";
  const { category, name, relationship, location, memory: memoryText } = memory;

  // Decide question type according to category and difficulty
  // Question types: recognition, relationship, place, object, memory, event, emotion, association
  const questionTypePool = [];

  if (category === "person") {
    questionTypePool.push("recognition");
    if (relationship) questionTypePool.push("relationship");
    if (memoryText) questionTypePool.push("memory");
    questionTypePool.push("emotion");
  } else if (category === "place") {
    questionTypePool.push("recognition");
    if (location) questionTypePool.push("place");
    if (memoryText) questionTypePool.push("memory");
    questionTypePool.push("emotion");
  } else if (category === "object") {
    questionTypePool.push("recognition");
    questionTypePool.push("object");
    if (memoryText) questionTypePool.push("memory");
  } else if (category === "event") {
    questionTypePool.push("recognition");
    questionTypePool.push("event");
    if (memoryText) questionTypePool.push("emotion");
  } else if (category === "pet") {
    questionTypePool.push("recognition");
    questionTypePool.push("relationship");
    questionTypePool.push("emotion");
  } else {
    questionTypePool.push("recognition");
    questionTypePool.push("emotion");
  }

  // Easy mode prefers direct recognition questions
  let selectedType = "recognition";
  if (difficulty === "Easy") {
    selectedType = "recognition";
  } else {
    // Select from pool
    selectedType = questionTypePool[Math.floor(Math.random() * questionTypePool.length)];
  }

  let promptText = "";
  let promptTextHi = "";
  let correctAnswer = "";
  let correctAnswerHi = "";
  let gentleFeedbackSuccess = "";
  let gentleFeedbackGentle = "";
  let gentleFeedbackSuccessHi = "";
  let gentleFeedbackGentleHi = "";
  let distractors = [];

  // 1. RECOGNITION
  if (selectedType === "recognition") {
    if (category === "person") {
      promptText = "Who is this in the photograph?";
      promptTextHi = "तस्वीर में यह कौन हैं?";
      correctAnswer = name;
      correctAnswerHi = name;
      gentleFeedbackSuccess = `That's right! This is ${name}${relationship ? `, your ${relationship.toLowerCase()}` : ""}.`;
      gentleFeedbackGentle = `That's okay. This is ${name}${relationship ? `, your ${relationship.toLowerCase()}` : ""}.`;
      gentleFeedbackSuccessHi = `बिल्कुल सही! यह ${name} हैं${relationship ? `, आपकी ${relationship}` : ""}।`;
      gentleFeedbackGentleHi = `कोई बात नहीं। यह ${name} हैं${relationship ? `, आपकी ${relationship}` : ""}।`;

      // Distractors from other person memories or common names
      const otherNames = allMemories
        .filter((m) => m.id !== memory.id && m.category === "person")
        .map((m) => m.name);
      const fallbackNames = ["Anita", "Sunita", "Rajesh", "Vikram", "Meena", "Rohan"];
      distractors = Array.from(new Set([...otherNames, ...fallbackNames]))
        .filter((n) => n.toLowerCase() !== name.toLowerCase());
    } else if (category === "place") {
      promptText = "Do you remember this place?";
      promptTextHi = "क्या आपको यह जगह याद है?";
      correctAnswer = name;
      correctAnswerHi = name;
      gentleFeedbackSuccess = `Wonderful! This is ${name}${location ? ` in ${location}` : ""}.`;
      gentleFeedbackGentle = `Take your time. This is ${name}${location ? ` in ${location}` : ""}.`;
      gentleFeedbackSuccessHi = `बहुत बढ़िया! यह ${name} है${location ? `, ${location} में` : ""}।`;
      gentleFeedbackGentleHi = `कोई बात नहीं। यह ${name} है${location ? `, ${location} में` : ""}।`;

      const otherPlaces = allMemories
        .filter((m) => m.id !== memory.id && m.category === "place")
        .map((m) => m.name);
      const fallbackPlaces = ["City Park", "Local Market", "Grandmother's Garden", "Old School", "Temple Courtyard"];
      distractors = Array.from(new Set([...otherPlaces, ...fallbackPlaces]))
        .filter((n) => n.toLowerCase() !== name.toLowerCase());
    } else if (category === "pet") {
      promptText = "Who is this lovely companion?";
      promptTextHi = "यह प्यारा साथी कौन है?";
      correctAnswer = name;
      correctAnswerHi = name;
      gentleFeedbackSuccess = `Spot on! This is ${name}, your faithful friend.`;
      gentleFeedbackGentle = `That's quite alright. This is ${name}, your friendly pet dog.`;
      gentleFeedbackSuccessHi = `बिल्कुल सही! यह ${name} हैं।`;
      gentleFeedbackGentleHi = `कोई बात नहीं। यह आपके प्यारे साथी ${name} हैं।`;
      distractors = ["Tommy", "Sheru", "Rocky", "Moti", "Leo"].filter((n) => n.toLowerCase() !== name.toLowerCase());
    } else {
      promptText = "What is shown in this picture?";
      promptTextHi = "इस तस्वीर में क्या दिखाया गया है?";
      correctAnswer = name;
      correctAnswerHi = name;
      gentleFeedbackSuccess = `Correct! This is ${name}.`;
      gentleFeedbackGentle = `That is okay. This is ${name}.`;
      gentleFeedbackSuccessHi = `बिल्कुल सही! यह ${name} है।`;
      gentleFeedbackGentleHi = `कोई बात नहीं। यह ${name} है।`;
      const otherObjects = allMemories
        .filter((m) => m.id !== memory.id)
        .map((m) => m.name);
      const fallbackObjects = ["Reading Glasses", "Morning Tea", "Silver Watch", "Gardening Tools", "Prayer Bell"];
      distractors = Array.from(new Set([...otherObjects, ...fallbackObjects]))
        .filter((n) => n.toLowerCase() !== name.toLowerCase());
    }
  }

  // 2. RELATIONSHIP
  else if (selectedType === "relationship") {
    promptText = `How is ${name} related to you?`;
    promptTextHi = `${name} का आपसे क्या रिश्ता है?`;
    correctAnswer = relationship || "Family member";
    correctAnswerHi = relationship === "Daughter" ? "बेटी" : relationship === "Grandson" ? "पोता / नाती" : "परिवार के सदस्य";
    gentleFeedbackSuccess = `That's right! ${name} is your ${relationship || "beloved family member"}.`;
    gentleFeedbackGentle = `That's okay. ${name} is your ${relationship || "beloved family member"}.`;
    gentleFeedbackSuccessHi = `बिल्कुल सही! ${name} आपकी ${relationship} हैं।`;
    gentleFeedbackGentleHi = `कोई बात नहीं। ${name} आपकी ${relationship} हैं।`;

    const relations = ["Daughter", "Grandson", "Son", "Brother", "Sister", "Caregiver", "Neighbor", "Granddaughter"];
    distractors = relations.filter((r) => r.toLowerCase() !== (relationship || "").toLowerCase());
  }

  // 3. PLACE / LOCATION
  else if (selectedType === "place") {
    promptText = `Where is ${name} located?`;
    promptTextHi = `${name} कहाँ स्थित है?`;
    correctAnswer = location || "Our Family Town";
    correctAnswerHi = location || "हमारा शहर";
    gentleFeedbackSuccess = `Yes! ${name} is in ${location}.`;
    gentleFeedbackGentle = `No worries at all. ${name} is located in ${location}.`;
    gentleFeedbackSuccessHi = `हाँ! ${name} ${location} में है।`;
    gentleFeedbackGentleHi = `कोई बात नहीं। ${name} ${location} में स्थित है।`;
    distractors = ["Jabalpur", "Delhi", "Kolkata", "Varanasi", "Mumbai", "Jaipur"]
      .filter((loc) => loc.toLowerCase() !== (location || "").toLowerCase());
  }

  // 4. OBJECT / USE
  else if (selectedType === "object") {
    promptText = `What is this ${name.toLowerCase()} used for?`;
    promptTextHi = `इस ${name} का उपयोग किसलिए किया जाता है?`;
    correctAnswer = memoryText || "Daily morning routine & prayers";
    correctAnswerHi = "दैनिक पूजा और सुबह की प्रार्थना";
    gentleFeedbackSuccess = `Exactly right! It is used for ${memoryText || "daily prayers"}.`;
    gentleFeedbackGentle = `That's okay. We use it for ${memoryText || "daily prayers"}.`;
    gentleFeedbackSuccessHi = `बिल्कुल सही! इसका उपयोग पूजा व दिनचर्या में होता है।`;
    gentleFeedbackGentleHi = `कोई बात नहीं। यह पूजा और दिनचर्या के लिए है।`;
    distractors = [
      "Keeping in the store room",
      "Outdoor sports",
      "Fixing furniture",
      "Only on special holidays"
    ];
  }

  // 5. EVENT / OCCASION
  else if (selectedType === "event") {
    promptText = "What kind of happy occasion was this?";
    promptTextHi = "यह किस तरह का खुशी का अवसर था?";
    correctAnswer = name;
    correctAnswerHi = name;
    gentleFeedbackSuccess = `Yes! This was ${name}.`;
    gentleFeedbackGentle = `Take it easy! This was our celebration of ${name}.`;
    gentleFeedbackSuccessHi = `हाँ! यह ${name} का उत्सव था।`;
    gentleFeedbackGentleHi = `कोई बात नहीं! यह ${name} का उत्सव था।`;
    distractors = ["Birthday Party", "Wedding Anniversary", "Diwali Festival", "Sunday Picnic", "New Year Gathering"]
      .filter((e) => e.toLowerCase() !== name.toLowerCase());
  }

  // 6. EMOTION
  else if (selectedType === "emotion") {
    promptText = "How does this photograph make you feel?";
    promptTextHi = "यह तस्वीर देखकर आपको कैसा महसूस होता है?";
    correctAnswer = isHindi ? "😊 बहुत खुशी और सुकून" : "😊 Happy & Peaceful";
    correctAnswerHi = "😊 बहुत खुशी और सुकून";
    gentleFeedbackSuccess = "Thank you for sharing your warmth. Cherished memories bring joy to the heart.";
    gentleFeedbackGentle = "Cherished memories always carry love and comfort.";
    gentleFeedbackSuccessHi = "अपनी भावनाएं साझा करने के लिए धन्यवाद। प्यारी यादें मन को सुकून देती हैं।";
    gentleFeedbackGentleHi = "प्यारी यादें हमेशा प्यार और सुकून देती हैं।";
    distractors = isHindi
      ? ["❤️ बहुत प्यार और स्नेह", "😐 सामान्य महसूस हो रहा है", "💭 पुरानी बातें याद आ रही हैं"]
      : ["❤️ Deeply Loved & Nostalgic", "😐 Calm & Neutral", "💭 Thinking of old times"];
  }

  // 7. MEMORY
  else if (selectedType === "memory") {
    promptText = `What do you remember about ${name}?`;
    promptTextHi = `आपको ${name} के बारे में क्या याद आता है?`;
    correctAnswer = memoryText || `${name} brings warm moments into our day.`;
    correctAnswerHi = memoryText || `${name} से जुड़ी प्यारी यादें।`;
    gentleFeedbackSuccess = `Lovely recall! ${memoryText || "A truly special memory."}`;
    gentleFeedbackGentle = `That's completely fine. ${memoryText || "A truly special memory."}`;
    gentleFeedbackSuccessHi = `सुंदर याद! ${memoryText || "एक बहुत ही खास याद।"}`;
    gentleFeedbackGentleHi = `कोई बात नहीं। ${memoryText || "एक बहुत ही खास याद।"}`;
    distractors = [
      "Visits once every few years",
      "Bought recently from the market",
      "Belongs to someone in the neighborhood"
    ];
  }

  // Assemble choices according to difficulty
  let optionCount = 4;
  if (difficulty === "Easy") {
    optionCount = 2; // 1 correct + 1 distractor + I don't remember
  } else if (difficulty === "Medium") {
    optionCount = 3;
  } else {
    optionCount = 4;
  }

  const chosenDistractors = distractors.slice(0, optionCount - 1);
  const rawOptions = [
    isHindi ? correctAnswerHi || correctAnswer : correctAnswer,
    ...chosenDistractors,
  ];

  // Shuffle options
  const shuffled = rawOptions.sort(() => Math.random() - 0.5);

  // Always append "I don't remember"
  const iDontRememberOption = isHindi ? "🤷 मुझे याद नहीं" : "🤷 I don't remember";
  const finalOptions = [...shuffled, iDontRememberOption];

  return {
    id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    memoryId: memory.id,
    memory,
    questionType: selectedType,
    prompt: isHindi ? promptTextHi : promptText,
    promptEn: promptText,
    promptHi: promptTextHi,
    correctAnswer: isHindi ? correctAnswerHi || correctAnswer : correctAnswer,
    options: finalOptions,
    iDontRememberOption,
    gentleFeedbackSuccess: isHindi ? gentleFeedbackSuccessHi : gentleFeedbackSuccess,
    gentleFeedbackGentle: isHindi ? gentleFeedbackGentleHi : gentleFeedbackGentle,
  };
};
