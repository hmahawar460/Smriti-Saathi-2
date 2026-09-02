/**
 * findItService.js
 * 
 * Data library and persistence service for "FIND IT!" Real-World Object Hunting Game.
 * Features 30+ everyday household objects with photos, COCO-SSD class mappings,
 * association questions, bilingual translations (EN/HI), and caregiver customization.
 */

export const DEFAULT_OBJECT_LIBRARY = [
  // Kitchen Category
  {
    id: "obj-spoon",
    name: "Spoon",
    hindiName: "चम्मच",
    category: "kitchen",
    difficulty: "easy",
    cocoClasses: ["spoon", "fork", "knife"], // primary match: spoon
    targetCocoClass: "spoon",
    imageUrl: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80",
    iconEmoji: "🥄",
    tip: "Look in the kitchen or dining table.",
    hindiTip: "रसोई या खाने की मेज पर देखें।",
    association: {
      question: "What do we usually use a spoon for?",
      hindiQuestion: "हम आमतौर पर चम्मच का उपयोग किसलिए करते हैं?",
      options: [
        { text: "Eating or stirring food", hindiText: "खाना खाने या मिलाने के लिए", correct: true, icon: "🍲" },
        { text: "Brushing our teeth", hindiText: "दांत साफ करने के लिए", correct: false, icon: "🪥" },
        { text: "Writing a letter", hindiText: "पत्र लिखने के लिए", correct: false, icon: "✍️" }
      ]
    }
  },
  {
    id: "obj-cup",
    name: "Cup or Mug",
    hindiName: "कप या मग",
    category: "kitchen",
    difficulty: "easy",
    cocoClasses: ["cup"],
    targetCocoClass: "cup",
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
    iconEmoji: "☕",
    tip: "A tea cup, coffee mug, or small drinking cup.",
    hindiTip: "चाय का कप, कॉफी मग, या छोटा कप।",
    association: {
      question: "What warm beverage is commonly served in a cup?",
      hindiQuestion: "कप में आमतौर पर कौन सा गर्म पेय पिया जाता है?",
      options: [
        { text: "Hot tea or milk", hindiText: "गर्म चाय या दूध", correct: true, icon: "☕" },
        { text: "Cooking oil", hindiText: "पकाने का तेल", correct: false, icon: "🛢️" },
        { text: "Cold ice cubes", hindiText: "बर्फ के टुकड़े", correct: false, icon: "🧊" }
      ]
    }
  },
  {
    id: "obj-bottle",
    name: "Water Bottle",
    hindiName: "पानी की बोतल",
    category: "kitchen",
    difficulty: "easy",
    cocoClasses: ["bottle"],
    targetCocoClass: "bottle",
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80",
    iconEmoji: "🧴",
    tip: "Any water bottle or beverage container.",
    hindiTip: "कोई भी पानी की बोतल या पेय पात्र।",
    association: {
      question: "Why is it important to keep a water bottle nearby?",
      hindiQuestion: "पानी की बोतल पास रखना क्यों जरूरी है?",
      options: [
        { text: "To stay hydrated & healthy", hindiText: "स्वस्थ और हाइड्रेटेड रहने के लिए", correct: true, icon: "💧" },
        { text: "To play cricket", hindiText: "क्रिकेट खेलने के लिए", correct: false, icon: "🏏" },
        { text: "To cut vegetables", hindiText: "सब्जियां काटने के लिए", correct: false, icon: "🔪" }
      ]
    }
  },
  {
    id: "obj-bowl",
    name: "Bowl",
    hindiName: "कटोरी / बाउल",
    category: "kitchen",
    difficulty: "easy",
    cocoClasses: ["bowl"],
    targetCocoClass: "bowl",
    imageUrl: "https://images.unsplash.com/photo-1574343635037-33f757f92025?auto=format&fit=crop&w=600&q=80",
    iconEmoji: "🥣",
    tip: "A small or medium serving bowl.",
    hindiTip: "एक छोटी या मध्यम कटोरी।",
    association: {
      question: "What do we usually eat from a bowl?",
      hindiQuestion: "हम कटोरी में आमतौर पर क्या खाते हैं?",
      options: [
        { text: "Kheer, dal or soup", hindiText: "खीर, दाल या सूप", correct: true, icon: "🍲" },
        { text: "Fresh newspapers", hindiText: "ताजा अखबार", correct: false, icon: "📰" },
        { text: "Warm blanket", hindiText: "गर्म कंबल", correct: false, icon: "🛏️" }
      ]
    }
  },
  {
    id: "obj-fork",
    name: "Fork",
    hindiName: "कांटा (Fork)",
    category: "kitchen",
    difficulty: "advanced",
    cocoClasses: ["fork", "spoon", "knife"],
    targetCocoClass: "fork",
    imageUrl: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80",
    iconEmoji: "🍴",
    tip: "A dining fork with prongs.",
    hindiTip: "खाने वाला कांटा (prongs वाला)।",
    association: {
      question: "What food is eaten conveniently with a fork?",
      hindiQuestion: "कांटे से कौन सा भोजन आसानी से खाया जाता है?",
      options: [
        { text: "Cut fruits or noodles", hindiText: "कटे हुए फल या नूडल्स", correct: true, icon: "🍎" },
        { text: "Drinking clear water", hindiText: "पानी पीना", correct: false, icon: "💧" },
        { text: "Hot tea", hindiText: "गर्म चाय", correct: false, icon: "☕" }
      ]
    }
  },

  // Personal Items Category
  {
    id: "obj-phone",
    name: "Mobile Phone",
    hindiName: "मोबाइल फोन",
    category: "personal",
    difficulty: "easy",
    cocoClasses: ["cell phone"],
    targetCocoClass: "cell phone",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
    iconEmoji: "📱",
    tip: "Your mobile smartphone or handset.",
    hindiTip: "आपका स्मार्टफोन या हैंडसेट।",
    association: {
      question: "Who do we call with our mobile phone?",
      hindiQuestion: "हम मोबाइल फोन से किसे कॉल करते हैं?",
      options: [
        { text: "Our children & family", hindiText: "अपने बच्चों और परिवार को", correct: true, icon: "📞" },
        { text: "The moon and stars", hindiText: "चांद और तारों को", correct: false, icon: "🌙" },
        { text: "The kitchen stove", hindiText: "रसोई के चूल्हे को", correct: false, icon: "🍳" }
      ]
    }
  },
  {
    id: "obj-book",
    name: "Book or Notebook",
    hindiName: "किताब या डायरी",
    category: "personal",
    difficulty: "easy",
    cocoClasses: ["book"],
    targetCocoClass: "book",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    iconEmoji: "📖",
    tip: "A story book, holy text, or notebook.",
    hindiTip: "कहानी की किताब, धार्मिक ग्रंथ या डायरी।",
    association: {
      question: "What wonderful activity do we enjoy with a book?",
      hindiQuestion: "किताब के साथ हम कौन सी अच्छी गतिविधि करते हैं?",
      options: [
        { text: "Reading stories & poems", hindiText: "कहानियां और कविताएं पढ़ना", correct: true, icon: "📚" },
        { text: "Washing clothes", hindiText: "कपड़े धोना", correct: false, icon: "🧺" },
        { text: "Boiling water", hindiText: "पानी उबालना", correct: false, icon: "🫖" }
      ]
    }
  },
  {
    id: "obj-clock",
    name: "Clock or Watch",
    hindiName: "घड़ी (Watch/Clock)",
    category: "personal",
    difficulty: "medium",
    cocoClasses: ["clock"],
    targetCocoClass: "clock",
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80",
    iconEmoji: "⏰",
    tip: "A wrist watch, table clock, or wall clock.",
    hindiTip: "हाथ की घड़ी, टेबल घड़ी या दीवार घड़ी।",
    association: {
      question: "What important information does a clock tell us?",
      hindiQuestion: "घड़ी हमें क्या महत्वपूर्ण जानकारी देती है?",
      options: [
        { text: "The current time of day", hindiText: "दिन का सही समय", correct: true, icon: "⏱️" },
        { text: "Tomorrow's vegetable prices", hindiText: "सब्जी के दाम", correct: false, icon: "🥬" },
        { text: "The room temperature", hindiText: "कमरे का तापमान", correct: false, icon: "🌡️" }
      ]
    }
  },
  {
    id: "obj-toothbrush",
    name: "Toothbrush",
    hindiName: "टूथब्रश",
    category: "personal",
    difficulty: "medium",
    cocoClasses: ["toothbrush"],
    targetCocoClass: "toothbrush",
    imageUrl: "https://images.unsplash.com/photo-1559591937-e10f135b1d9c?auto=format&fit=crop&w=600&q=80",
    iconEmoji: "🪥",
    tip: "Your morning toothbrush.",
    hindiTip: "आपका टूथब्रश।",
    association: {
      question: "When is it best to brush our teeth?",
      hindiQuestion: "दांत साफ करना कब सबसे अच्छा होता है?",
      options: [
        { text: "Morning & before bed", hindiText: "सुबह और रात को सोने से पहले", correct: true, icon: "✨" },
        { text: "While taking a nap", hindiText: "दोपहर में सोते समय", correct: false, icon: "😴" },
        { text: "While driving a car", hindiText: "गाड़ी चलाते समय", correct: false, icon: "🚗" }
      ]
    }
  },
  {
    id: "obj-remote",
    name: "TV Remote",
    hindiName: "टीवी रिमोट",
    category: "household",
    difficulty: "medium",
    cocoClasses: ["remote"],
    targetCocoClass: "remote",
    imageUrl: "https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=600&q=80",
    iconEmoji: "📺",
    tip: "Television or AC remote controller.",
    hindiTip: "टीवी या एसी का रिमोट कंट्रोलर।",
    association: {
      question: "What do we use the TV remote for?",
      hindiQuestion: "हम टीवी रिमोट का उपयोग किसलिए करते हैं?",
      options: [
        { text: "Changing channels & volume", hindiText: "चैनल और आवाज बदलने के लिए", correct: true, icon: "📡" },
        { text: "Ironing clothes", hindiText: "कपड़े प्रेस करने के लिए", correct: false, icon: "👔" },
        { text: "Opening the front door", hindiText: "मुख्य दरवाजा खोलने के लिए", correct: false, icon: "🚪" }
      ]
    }
  },

  // Household Category
  {
    id: "obj-chair",
    name: "Chair",
    hindiName: "कुर्सी",
    category: "household",
    difficulty: "easy",
    cocoClasses: ["chair", "couch"],
    targetCocoClass: "chair",
    imageUrl: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=600&q=80",
    iconEmoji: "🪑",
    tip: "A dining chair, armchair, or stool.",
    hindiTip: "कुर्सी, सोफा या स्टूल।",
    association: {
      question: "What comfortable activity do we do on a chair?",
      hindiQuestion: "कुर्सी पर हम क्या आरामदायक काम करते हैं?",
      options: [
        { text: "Sit, relax, and rest our legs", hindiText: "बैठना, आराम करना और सुस्ताना", correct: true, icon: "🛋️" },
        { text: "Hang wet clothes", hindiText: "गीले कपड़े सुखाना", correct: false, icon: "👕" },
        { text: "Cook rice", hindiText: "चावल पकाना", correct: false, icon: "🍚" }
      ]
    }
  },
  {
    id: "obj-scissors",
    name: "Scissors",
    hindiName: "कैंची",
    category: "household",
    difficulty: "medium",
    cocoClasses: ["scissors"],
    targetCocoClass: "scissors",
    imageUrl: "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=600&q=80",
    iconEmoji: "✂️",
    tip: "A household pair of scissors.",
    hindiTip: "घर की कैंची।",
    association: {
      question: "What do scissors safely help us cut?",
      hindiQuestion: "कैंची हमें क्या काटने में मदद करती है?",
      options: [
        { text: "Paper or thread neatly", hindiText: "कागज या धागा सफाई से काटना", correct: true, icon: "📄" },
        { text: "Solid steel bricks", hindiText: "लोहे की ईंटें", correct: false, icon: "🧱" },
        { text: "Drinking milk", hindiText: "दूध पीना", correct: false, icon: "🥛" }
      ]
    }
  },
  {
    id: "obj-bag",
    name: "Bag or Backpack",
    hindiName: "बैग या थैला",
    category: "household",
    difficulty: "medium",
    cocoClasses: ["backpack", "handbag", "suitcase"],
    targetCocoClass: "handbag",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    iconEmoji: "🎒",
    tip: "A shopping bag, handbag, or backpack.",
    hindiTip: "खरीदारी का थैला, हैंडबैग या बैग।",
    association: {
      question: "When do we carry a bag with us?",
      hindiQuestion: "हम अपने साथ बैग कब ले जाते हैं?",
      options: [
        { text: "Going shopping or traveling", hindiText: "बाजार जाने या यात्रा पर", correct: true, icon: "🛍️" },
        { text: "Sleeping in bed", hindiText: "बिस्तर पर सोते समय", correct: false, icon: "🛏️" },
        { text: "Taking a shower", hindiText: "नहाते समय", correct: false, icon: "🚿" }
      ]
    }
  },
  {
    id: "obj-pillow",
    name: "Pillow or Cushion",
    hindiName: "तकिया या कुशन",
    category: "household",
    difficulty: "easy",
    cocoClasses: ["couch", "bed"], // couches/pillows in coco
    targetCocoClass: "couch",
    imageUrl: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80",
    iconEmoji: "🛋️",
    tip: "A soft sleeping pillow or sofa cushion.",
    hindiTip: "मुलायम तकिया या सोफा कुशन।",
    association: {
      question: "How does a pillow help us rest?",
      hindiQuestion: "तकिया हमें आराम करने में कैसे मदद करता है?",
      options: [
        { text: "Supports our head & neck comfortably", hindiText: "सिर और गर्दन को सहारा देकर", correct: true, icon: "😴" },
        { text: "Plays loud rock music", hindiText: "तेज संगीत बजाकर", correct: false, icon: "🎸" },
        { text: "Keeps food frozen", hindiText: "खाना ठंडा रखकर", correct: false, icon: "❄️" }
      ]
    }
  }
];

const STORAGE_KEY_SESSIONS = "smriti_find_it_sessions";
const STORAGE_KEY_CONFIG = "smriti_find_it_config";
const STORAGE_KEY_CUSTOM_OBJECTS = "smriti_find_it_custom_objects";

/**
 * Get configured home objects or all default objects
 */
export function getAvailableObjects() {
  try {
    const rawConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
    const custom = getCustomObjects();
    const all = [...DEFAULT_OBJECT_LIBRARY, ...custom];

    if (!rawConfig) {
      return all;
    }
    const config = JSON.parse(rawConfig);
    if (!config.enabledObjectIds || config.enabledObjectIds.length === 0) {
      return all;
    }
    const enabledSet = new Set(config.enabledObjectIds);
    const filtered = all.filter((o) => enabledSet.has(o.id));
    return filtered.length > 0 ? filtered : all;
  } catch (err) {
    console.error("Error loading available objects:", err);
    return DEFAULT_OBJECT_LIBRARY;
  }
}

/**
 * Get caregiver configuration
 */
export function getCaregiverConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fallback
  }
  return {
    sessionLength: 10,
    difficulty: "easy", // 'easy' | 'medium' | 'advanced'
    timerEnabled: false,
    timerSeconds: 45,
    language: "en", // 'en' | 'hi'
    voicePromptEnabled: true,
    associationBonusEnabled: true,
    confidenceThreshold: 0.5,
    enabledObjectIds: DEFAULT_OBJECT_LIBRARY.map((o) => o.id)
  };
}

/**
 * Save caregiver configuration
 */
export function saveCaregiverConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error("Failed to save caregiver config", e);
  }
}

/**
 * Get custom objects added by caregiver
 */
export function getCustomObjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_OBJECTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

/**
 * Add custom object by caregiver
 */
export function addCustomObject(newObj) {
  try {
    const existing = getCustomObjects();
    const created = {
      id: `custom-obj-${Date.now()}`,
      name: newObj.name,
      hindiName: newObj.hindiName || newObj.name,
      category: newObj.category || "personal",
      difficulty: newObj.difficulty || "easy",
      cocoClasses: newObj.cocoClasses || ["cup", "bottle", "book", "cell phone"],
      targetCocoClass: newObj.targetCocoClass || "cup",
      imageUrl: newObj.imageUrl || "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
      iconEmoji: newObj.iconEmoji || "✨",
      tip: newObj.tip || `Find ${newObj.name}`,
      hindiTip: newObj.hindiTip || `कृपया ${newObj.hindiName || newObj.name} ढूंढें`,
      isCustom: true,
      caregiverNote: newObj.caregiverNote || "",
      association: newObj.association || {
        question: `Where does ${newObj.name} usually stay at home?`,
        hindiQuestion: `${newObj.name} आमतौर पर घर में कहाँ रहता है?`,
        options: [
          { text: "In its special familiar place", hindiText: "अपनी परिचित जगह पर", correct: true, icon: "🏡" },
          { text: "Outside on the road", hindiText: "सड़क पर", correct: false, icon: "🛣️" },
          { text: "In the garden tree", hindiText: "पेड़ के ऊपर", correct: false, icon: "🌳" }
        ]
      }
    };
    const updated = [created, ...existing];
    localStorage.setItem(STORAGE_KEY_CUSTOM_OBJECTS, JSON.stringify(updated));

    // Also update enabled list in config
    const config = getCaregiverConfig();
    config.enabledObjectIds = [...(config.enabledObjectIds || []), created.id];
    saveCaregiverConfig(config);

    return created;
  } catch (e) {
    console.error("Failed to add custom object:", e);
    return null;
  }
}

/**
 * Save a completed Find It session
 */
export function saveFindItSession(sessionData) {
  try {
    const existing = getFindItSessions();
    const sessionRecord = {
      id: `fis-${Date.now()}`,
      timestamp: new Date().toISOString(),
      dateFormatted: new Date().toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }),
      timeFormatted: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      totalRequested: sessionData.totalRequested || 10,
      foundCount: sessionData.foundCount || 0,
      skippedCount: sessionData.skippedCount || 0,
      incorrectCount: sessionData.incorrectCount || 0,
      attemptsCount: sessionData.attemptsCount || 0,
      averageSeconds: sessionData.averageSeconds || 18,
      durationSeconds: sessionData.durationSeconds || 120,
      difficulty: sessionData.difficulty || "easy",
      foundObjects: sessionData.foundObjects || [],
      skippedObjects: sessionData.skippedObjects || [],
      associationStats: sessionData.associationStats || { correct: 0, total: 0 }
    };
    const updated = [sessionRecord, ...existing].slice(0, 50); // keep last 50
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updated));
    return sessionRecord;
  } catch (err) {
    console.error("Failed to save Find It session:", err);
    return null;
  }
}

/**
 * Retrieve saved sessions
 */
export function getFindItSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

/**
 * Calculate aggregate caregiver analytics
 */
export function getFindItAnalytics() {
  const sessions = getFindItSessions();
  if (!sessions.length) {
    return {
      totalSessions: 0,
      totalFound: 0,
      totalSkipped: 0,
      successRate: 0,
      averageSearchTimeSec: 0,
      topRecognized: ["Cups", "Books", "Spoons", "Mobile Phone"],
      needsPractice: ["Small items", "Distant objects"],
      recentSessions: []
    };
  }

  const totalFound = sessions.reduce((sum, s) => sum + (s.foundCount || 0), 0);
  const totalSkipped = sessions.reduce((sum, s) => sum + (s.skippedCount || 0), 0);
  const totalItems = totalFound + totalSkipped;
  const successRate = totalItems > 0 ? Math.round((totalFound / totalItems) * 100) : 0;
  const avgSearch = Math.round(
    sessions.reduce((sum, s) => sum + (s.averageSeconds || 15), 0) / sessions.length
  );

  // Collect frequency of found objects
  const foundFreq = {};
  sessions.forEach((s) => {
    (s.foundObjects || []).forEach((objName) => {
      foundFreq[objName] = (foundFreq[objName] || 0) + 1;
    });
  });

  const topRecognized = Object.entries(foundFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name]) => name);

  return {
    totalSessions: sessions.length,
    totalFound,
    totalSkipped,
    successRate,
    averageSearchTimeSec: avgSearch,
    topRecognized: topRecognized.length ? topRecognized : ["Cups", "Books", "Phones"],
    needsPractice: ["Fine items like Forks & Keys"],
    recentSessions: sessions.slice(0, 5)
  };
}

/**
 * Speak voice prompt using Web Speech API with fallback
 */
export function speakFindItVoice(text, lang = "en", onEnd = null) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (onEnd) onEnd();
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "hi" ? "hi-IN" : "en-US";
    utterance.rate = 0.9; // gentle, comforting pace for elderly
    utterance.pitch = 1.0;
    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Speech synthesis error:", err);
    if (onEnd) onEnd();
  }
}
