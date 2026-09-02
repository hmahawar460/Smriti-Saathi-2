import { useState, useEffect, useRef } from "react";
import {
  Heart,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  RotateCcw,
  Mic,
  MicOff,
  Send,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  Users,
  Home as HomeIcon,
  Package,
  PartyPopper,
  Dog,
  Settings,
  HelpCircle,
  PlusCircle
} from "lucide-react";
import confetti from "canvas-confetti";
import { useRealtimeTracking } from "../../context/RealtimeTrackingContext";
import { LiveGameIndicator } from "../patient/LiveGameIndicator";
import {
  getStoredMemories,
  generateQuestionForMemory,
  addJournalEntry,
  recordSessionScore,
  updateMemory,
  MEMORY_CATEGORIES
} from "../../services/memoriesService";
import { GameCompletedResultScreen } from "./GameCompletedResultScreen";

export const MyMemoriesGameEngine = ({
  task,
  profile,
  onComplete,
  onContinue,
  onBack,
  onBackToGames,
  onOpenCaregiverManager
}) => {
  const {
    startLiveGame,
    recordEvent,
    completeGame,
    abandonGame,
    TRACKING_EVENT_TYPES
  } = useRealtimeTracking();

  // Language state (default to profile language or en)
  const [lang, setLang] = useState(profile?.language === "hi" ? "hi" : "en");
  const isHindi = lang === "hi";

  // Audio / Speech Narration State
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Difficulty: Easy (2 choices), Medium (3 choices), Advanced (4 choices)
  const [difficulty, setDifficulty] = useState("Easy"); // Start gently for elderly friendly experience
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveStruggles, setConsecutiveStruggles] = useState(0);

  // Game Flow States
  const [memoriesList, setMemoriesList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedbackState, setFeedbackState] = useState(null); // 'correct' | 'gentle'
  const [isCompleted, setIsCompleted] = useState(false);

  // Metrics tracking
  const [startTime, setStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [answersHistory, setAnswersHistory] = useState([]);
  const [responseTimes, setResponseTimes] = useState([]);

  // Emotional Memory reflection modal / prompt
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [reflectionText, setReflectionText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const speechRecognitionRef = useRef(null);

  // Load memories on mount
  useEffect(() => {
    const list = getStoredMemories();
    // Shuffle slightly or take up to 6 memories for a calm, non-fatiguing session
    const activeSlice = [...list].sort(() => Math.random() - 0.5).slice(0, 6);
    setMemoriesList(activeSlice.length > 0 ? activeSlice : list);

    startLiveGame(
      {
        id: "game-my-memories",
        title: "MY MEMORIES",
        domain: "Emotional Recall",
        difficulty
      },
      profile,
      { totalSteps: activeSlice.length || 6, difficulty }
    );

    return () => {
      if (!isCompleted) {
        abandonGame();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Prepare current question whenever currentIndex or difficulty or memoriesList change
  useEffect(() => {
    if (memoriesList.length > 0 && currentIndex < memoriesList.length) {
      const mem = memoriesList[currentIndex];
      const q = generateQuestionForMemory(mem, memoriesList, difficulty, lang);
      setCurrentQuestion(q);
      setSelectedOption(null);
      setFeedbackState(null);
      setQuestionStartTime(Date.now());

      // Auto-narrate question if audio enabled
      if (audioEnabled) {
        speakText(q.prompt);
      }
    }
  }, [currentIndex, difficulty, lang, memoriesList]);

  // Voice narration helper using Web Speech Synthesis
  const speakText = (text) => {
    if (!window.speechSynthesis || !audioEnabled) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.88; // Calm, slow pace for elderly clarity
      utterance.pitch = 1.0;
      utterance.lang = isHindi ? "hi-IN" : "en-US";
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error", e);
    }
  };

  // Handle Answer Selection
  const handleSelectOption = (option) => {
    if (selectedOption || !currentQuestion) return; // Prevent double taps
    setSelectedOption(option);

    const timeSpentSec = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000));
    setResponseTimes((prev) => [...prev, timeSpentSec]);

    const isIDontRemember = option === currentQuestion.iDontRememberOption;
    const isCorrect = !isIDontRemember && option === currentQuestion.correctAnswer;

    // Telemetry log
    recordEvent(
      isCorrect ? TRACKING_EVENT_TYPES.STEP_SUCCESS : TRACKING_EVENT_TYPES.STEP_ERROR,
      {
        memoryId: currentQuestion.memory.id,
        memoryName: currentQuestion.memory.name,
        questionType: currentQuestion.questionType,
        selectedOption: option,
        isCorrect,
        isIDontRemember,
        timeSpentSec,
        difficulty
      }
    );

    // Update memory played counts in background
    updateMemory(currentQuestion.memory.id, {
      timesPlayed: (currentQuestion.memory.timesPlayed || 0) + 1,
      timesRemembered: (currentQuestion.memory.timesRemembered || 0) + (isCorrect ? 1 : 0)
    });

    const answerRecord = {
      memory: currentQuestion.memory,
      question: currentQuestion,
      selected: option,
      isCorrect,
      isIDontRemember,
      timeSpentSec
    };
    setAnswersHistory((prev) => [...prev, answerRecord]);

    // Adaptive difficulty logic:
    if (isCorrect) {
      setFeedbackState("correct");
      setConsecutiveCorrect((prev) => prev + 1);
      setConsecutiveStruggles(0);
      if (audioEnabled) {
        speakText(currentQuestion.gentleFeedbackSuccess);
      }
      // Gentle celebratory feedback
      if (consecutiveCorrect >= 2) {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
      }
      // If elderly is doing great, adapt difficulty upward slightly
      if (consecutiveCorrect >= 2 && difficulty === "Easy") {
        setDifficulty("Medium");
      }
    } else {
      // Gentle feedback - never punitive!
      setFeedbackState("gentle");
      setConsecutiveStruggles((prev) => prev + 1);
      setConsecutiveCorrect(0);
      if (audioEnabled) {
        speakText(currentQuestion.gentleFeedbackGentle);
      }
      // If struggling consecutively, reduce difficulty to keep experience reassuring
      if (consecutiveStruggles >= 1 && difficulty !== "Easy") {
        setDifficulty("Easy");
      }
    }
  };

  // Move directly to next step on Continue
  const handleProceedNext = () => {
    advanceToNextMemory();
  };

  const advanceToNextMemory = () => {
    setShowReflectionModal(false);
    setReflectionText("");
    setReflectionSaved(false);

    if (currentIndex + 1 < memoriesList.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishGameSession();
    }
  };

  // Voice Reflection (Web Speech API)
  const toggleSpeechRecognition = () => {
    if (isRecording) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        isHindi
          ? "आपके ब्राउज़र में आवाज़ पहचान उपलब्ध नहीं है। आप नीचे लिख सकते हैं।"
          : "Voice recognition is not supported on this browser. You can type your memory below."
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = isHindi ? "hi-IN" : "en-US";

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setReflectionText(currentTranscript);
      };
      recognition.onerror = (e) => {
        console.warn("Speech error", e);
        setIsRecording(false);
      };
      recognition.onend = () => setIsRecording(false);

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  // Helper for quick suggestion thought chips
  const getQuickThoughts = (mem) => {
    if (!mem) return [];
    if (mem.category === "person") {
      return isHindi
        ? [
            `बहुत प्यारी ${mem.relationship || "बेटी"} ❤️`,
            "हमेशा खुश रखती है 😊",
            "तुम्हारी बहुत याद आती है 🌸",
            "सदा सुखी रहो, आशीर्वाद 🙏"
          ]
        : [
            `Loving ${mem.relationship || "daughter"} ❤️`,
            "Always brings happiness 😊",
            "Fondly thinking of you 🌸",
            "Sending love & blessings 🙏"
          ];
    }
    if (mem.category === "place") {
      return isHindi
        ? ["बहुत सुंदर और शांतिपूर्ण जगह 🏡", "यहाँ की बहुत अच्छी यादें हैं ✨", "यहाँ जाना बहुत पसंद है 🌿"]
        : ["Peaceful & beautiful place 🏡", "Wonderful memories here ✨", "Always loved visiting 🌿"];
    }
    if (mem.category === "pet") {
      return isHindi
        ? ["बहुत प्यारा और वफादार साथी 🐾", "इसके साथ खेलना बहुत पसंद है 🐕"]
        : ["Faithful & loving friend 🐾", "Loved playing together 🐕"];
    }
    return isHindi
      ? ["बहुत पुरानी और खास याद ✨", "मन को शांति और खुशी मिलती है 🕊️"]
      : ["Special cherished memory ✨", "Brings warmth and comfort 🕊️"];
  };

  // Save emotional reflection into Memory Journal and smoothly continue
  const handleAddNoteAndContinue = (customText = null) => {
    const textToSave = (typeof customText === "string" ? customText : reflectionText).trim();
    const finalNote =
      textToSave ||
      (isHindi
        ? `${currentMem?.name || "याद"} के बारे में आज के सत्र में स्नेहपूर्वक विचार साझा किया गया।`
        : `Shared a warm thought about ${currentMem?.name || "this memory"} during today's session.`);

    addJournalEntry({
      memoryId: currentQuestion?.memory?.id,
      memoryName: currentQuestion?.memory?.name || "Family Memory",
      speechText: finalNote,
      emotion: "Warm Reflection",
      emotionEmoji: "❤️",
      inputType: isRecording ? "voice" : textToSave ? "text" : "quick_note"
    });

    if (isRecording && speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (err) {
        // ignore
      }
      setIsRecording(false);
    }

    setReflectionSaved(true);
    setTimeout(() => {
      advanceToNextMemory();
    }, 900);
  };

  // Backward compatibility alias for handleSaveReflection
  const handleSaveReflection = () => {
    handleAddNoteAndContinue();
  };

  // Finish session & calculate results
  const finishGameSession = () => {
    const totalCount = answersHistory.length || memoriesList.length;
    const rememberedCount = answersHistory.filter((a) => a.isCorrect).length;
    const avgSeconds =
      responseTimes.length > 0
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : 8;

    // Calculate category breakdown
    const personAnswers = answersHistory.filter((a) => a.memory.category === "person");
    const placeAnswers = answersHistory.filter((a) => a.memory.category === "place");

    const sessionResult = {
      date: new Date().toLocaleDateString(isHindi ? "hi-IN" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }),
      totalCount,
      rememberedCount,
      avgSeconds,
      difficulty,
      personSuccessRate: personAnswers.length
        ? Math.round((personAnswers.filter((a) => a.isCorrect).length / personAnswers.length) * 100)
        : 100,
      placeSuccessRate: placeAnswers.length
        ? Math.round((placeAnswers.filter((a) => a.isCorrect).length / placeAnswers.length) * 100)
        : 100
    };

    recordSessionScore(sessionResult);
    completeGame({
      score: Math.round((rememberedCount / Math.max(1, totalCount)) * 100),
      totalSteps: totalCount,
      completedSteps: rememberedCount
    });

    setIsCompleted(true);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });

    const finalScore = Math.round((rememberedCount / Math.max(1, totalCount)) * 100);
    const totalTimeSec = Math.max(1, responseTimes.reduce((a, b) => a + b, 0));
    if (onComplete) {
      onComplete(task?.id || "game-my-memories", finalScore, finalScore, totalTimeSec, totalCount - rememberedCount);
    }
  };

  if (isCompleted) {
    const rememberedCount = answersHistory.filter((a) => a.isCorrect).length;
    const totalCount = memoriesList.length || 1;
    const scorePct = Math.round((rememberedCount / Math.max(1, totalCount)) * 100);
    const totalTimeSec = Math.max(
      1,
      responseTimes.reduce((a, b) => a + b, 0)
    );

    return (
      <GameCompletedResultScreen
        gameTitle={task?.title || (isHindi ? "मेरी यादें (My Memories)" : "My Memories Personal Recall")}
        score={scorePct}
        maxScore={100}
        timeSeconds={totalTimeSec}
        accuracy={scorePct}
        correctCount={rememberedCount}
        totalQuestions={totalCount}
        taskId={task?.id || "game-my-memories"}
        profile={profile}
        onContinue={onContinue || onBackToGames || onBack}
        onReplay={() => {
          setIsCompleted(false);
          setCurrentIndex(0);
          setAnswersHistory([]);
          setResponseTimes([]);
        }}
        onBackToGames={onBackToGames || onBack}
        customMessage={
          isHindi
            ? `अद्भुत याददाश्त! आपने अपने परिवार की ${rememberedCount}/${totalCount} यादों को सही पहचाना।`
            : `Heartwarming recall! You recognized ${rememberedCount} of ${totalCount} cherished family memories with love and clarity.`
        }
      />
    );
  }

  const currentMem = currentQuestion?.memory;
  const currentCategory = MEMORY_CATEGORIES.find((c) => c.id === currentMem?.category) || MEMORY_CATEGORIES[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9FBFB] to-[#EDF6F5] py-4 px-3 sm:px-6 lg:px-8 flex flex-col justify-between">
      {/* 1. TOP ACCESSIBLE HEADER */}
      <div className="max-w-4xl w-full mx-auto bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-teal-100 shadow-sm mb-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Back button */}
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs sm:text-sm font-bold transition active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{isHindi ? "वापस जाएं" : "Exit"}</span>
          </button>

          {/* Title & Progress */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-slate-800 tracking-tight flex items-center gap-2">
                <span>{isHindi ? "मेरी यादें (My Memories)" : "My Memories"}</span>
                <span className="text-[11px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                  {difficulty}
                </span>
              </h1>
              {!isCompleted && memoriesList.length > 0 && (
                <p className="text-[11px] font-bold text-slate-500">
                  {isHindi ? "याद" : "Memory"} {currentIndex + 1} / {memoriesList.length}
                </p>
              )}
            </div>
          </div>

          {/* Controls: Audio Toggle, Language Toggle, Caregiver Vault */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Audio narration button */}
            <button
              onClick={() => {
                if (isSpeaking && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                }
                setAudioEnabled(!audioEnabled);
              }}
              title={audioEnabled ? "Voice narration active" : "Voice narration muted"}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
                audioEnabled
                  ? "bg-teal-50 text-teal-800 border border-teal-200"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4 text-teal-600 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{audioEnabled ? (isHindi ? "आवाज़ चालू" : "Voice On") : (isHindi ? "आवाज़ बंद" : "Muted")}</span>
            </button>

            {/* Language Switch */}
            <button
              onClick={() => setLang(isHindi ? "en" : "hi")}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition active:scale-95 cursor-pointer border border-slate-200"
            >
              {isHindi ? "English" : "हिंदी"}
            </button>

            {/* Caregiver Memory Vault shortcut */}
            {onOpenCaregiverManager && (
              <button
                onClick={onOpenCaregiverManager}
                title="Caregiver Memory Settings"
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden md:inline">{isHindi ? "यादें जोड़ें" : "Add Memories"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Calm Progress Bar */}
        {!isCompleted && memoriesList.length > 0 && (
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.round(((currentIndex + 1) / memoriesList.length) * 100)}%`
              }}
            />
          </div>
        )}
      </div>

      {/* 2. MAIN ACTIVE GAMEPLAY SCREEN (ONE PHOTO AT A TIME) */}
      {!isCompleted && currentQuestion && (
        <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col justify-center space-y-4 py-2">
          {/* PHOTO CARD CONTAINER */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-teal-100/80 flex flex-col items-center">
            {/* Category Tag */}
            <div className="w-full flex items-center justify-between mb-3">
              <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${currentCategory.color}`}>
                {isHindi
                  ? currentCategory.id === "person"
                    ? "परिवार / व्यक्ति"
                    : currentCategory.id === "place"
                    ? "घर / स्थान"
                    : currentCategory.id === "pet"
                    ? "पालतू साथी"
                    : "विशेष वस्तु"
                  : currentCategory.label}
              </span>

              {/* Read Aloud Button */}
              <button
                onClick={() => speakText(currentQuestion.prompt)}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 transition active:scale-95 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isHindi ? "सवाल सुनें" : "Read Aloud"}</span>
              </button>
            </div>

            {/* The Photograph (Large, Clear, High-Contrast, Calm border) */}
            <div className="w-full max-h-[340px] sm:max-h-[380px] rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200/80 flex items-center justify-center relative shadow-inner">
              <img
                src={currentMem?.imageUrl}
                alt={currentMem?.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center max-h-[340px] sm:max-h-[380px] transition-transform duration-300 hover:scale-[1.02]"
              />
            </div>

            {/* AI Generated Question Prompt */}
            <div className="mt-4 text-center px-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#132A2F] leading-snug">
                {currentQuestion.prompt}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
                {isHindi
                  ? "नीचे दिए गए विकल्पों में से चुनें या 'मुझे याद नहीं' पर टैप करें।"
                  : "Tap your answer below, or choose 'I don't remember' anytime."}
              </p>
            </div>

            {/* ANSWER BUTTONS (Large, Tactile, Elderly Accessible) */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === option;
                const isIDontRemember = option === currentQuestion.iDontRememberOption;
                const isCorrectChoice = option === currentQuestion.correctAnswer;

                let buttonStyle = "bg-slate-50 hover:bg-slate-100 text-slate-800 border-2 border-slate-200";

                if (isIDontRemember) {
                  buttonStyle = "bg-amber-50 hover:bg-amber-100 text-amber-900 border-2 border-amber-200";
                }

                if (selectedOption) {
                  if (isSelected) {
                    if (isCorrectChoice) {
                      buttonStyle = "bg-emerald-600 text-white border-2 border-emerald-700 shadow-md";
                    } else if (isIDontRemember) {
                      buttonStyle = "bg-amber-500 text-white border-2 border-amber-600 shadow-md";
                    } else {
                      buttonStyle = "bg-teal-700 text-white border-2 border-teal-800 shadow-md";
                    }
                  } else if (isCorrectChoice) {
                    // Softly show the correct answer after any selection so elderly is reassured
                    buttonStyle = "bg-emerald-50 text-emerald-900 border-2 border-emerald-400 font-black";
                  } else {
                    buttonStyle = "bg-slate-50 text-slate-400 border border-slate-200 opacity-60";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={!!selectedOption}
                    onClick={() => handleSelectOption(option)}
                    className={`min-h-[58px] sm:min-h-[64px] px-4 py-3 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-between transition-all duration-150 active:scale-[0.98] cursor-pointer shadow-xs ${buttonStyle}`}
                  >
                    <span className="text-left leading-snug">{option}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 shrink-0 ml-2 text-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* GENTLE FEEDBACK CARD */}
            {selectedOption && feedbackState && (
              <div
                className={`w-full mt-4 p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in ${
                  feedbackState === "correct"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                    : "bg-teal-50 border-teal-200 text-teal-950"
                }`}
              >
                <div className="flex items-center gap-3 text-left">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      feedbackState === "correct"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-teal-600 text-white shadow-xs"
                    }`}
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm sm:text-base">
                      {feedbackState === "correct"
                        ? currentQuestion.gentleFeedbackSuccess
                        : currentQuestion.gentleFeedbackGentle}
                    </h4>
                    {currentMem?.memory && (
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        "{currentMem.memory}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                  <button
                    type="button"
                    onClick={() => setShowReflectionModal(true)}
                    className="flex-1 sm:flex-initial px-4 py-3 bg-teal-50 hover:bg-teal-100 text-[#0D7377] border border-teal-200 rounded-xl font-bold text-xs sm:text-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    title={`Add note about ${currentMem?.name || "this memory"}`}
                  >
                    <BookOpen className="w-4 h-4 text-[#0D7377]" />
                    <span>{isHindi ? "नोट जोड़ें" : "Add Notes"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleProceedNext}
                    className="flex-1 sm:flex-initial px-6 py-3 bg-[#0D7377] hover:bg-[#0A5C5F] text-white rounded-xl font-black text-xs sm:text-sm transition active:scale-95 cursor-pointer shadow-xs flex items-center justify-center gap-2 shrink-0"
                  >
                    <span>{isHindi ? "आगे बढ़ें" : "Continue"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. EMOTIONAL REFLECTION PROMPT MODAL (VOICE / TYPE) */}
      {showReflectionModal && currentQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-teal-200 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-teal-800">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  {isHindi ? "व्यक्तिगत याद पत्रिका" : "Memory Journal"}
                </span>
                <h3 className="text-lg font-extrabold text-[#132A2F]">
                  {isHindi
                    ? "क्या आप इस याद के बारे में कुछ बताना चाहेंगे?"
                    : `Would you like to share a thought about ${currentMem?.name}?`}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              {isHindi
                ? "यह आपकी निजी डायरी में सुरक्षित रहेगा जिसे आपके परिवार के सदस्य पढ़ सकेंगे।"
                : "Your words are gently preserved in your private Family Journal for your loved ones."}
            </p>

            {/* Thumbnail */}
            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-200">
              <img
                src={currentMem?.imageUrl}
                alt={currentMem?.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800">{currentMem?.name}</p>
                <p className="text-[11px] text-slate-500">{currentMem?.relationship || currentMem?.location}</p>
              </div>
            </div>

            {/* Quick Thought Suggestion Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 block">
                {isHindi ? "त्वरित विचार चुनें या नीचे लिखें:" : "Pick a quick thought or type below:"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {getQuickThoughts(currentMem).map((thought, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReflectionText(thought)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer active:scale-95 ${
                      reflectionText === thought
                        ? "bg-teal-100 border-[#0D7377] text-teal-900 font-bold"
                        : "bg-slate-50 hover:bg-teal-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    {thought}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Input Area */}
            <div className="relative">
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder={
                  isHindi
                    ? `यहाँ बोलें या लिखें... (जैसे: '${currentMem?.name || "प्रिया"} से मिलकर बहुत अच्छा लगा था...')`
                    : `Speak or type your thoughts about ${currentMem?.name || "this memory"}...`
                }
                rows={3}
                className="w-full text-sm p-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D7377] bg-slate-50 font-medium text-slate-800"
              />
            </div>

            {/* Saved indicator feedback */}
            {reflectionSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center justify-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {isHindi
                    ? `${currentMem?.name || ""} का विचार डायरी में जुड़ गया! आगे बढ़ रहे हैं...`
                    : `Note added to ${currentMem?.name || ""}'s journal! Continuing...`}
                </span>
              </div>
            )}

            {/* Action Buttons: Microphone, Add Note while Continuing, Skip */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`w-full sm:w-auto py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                    isRecording
                      ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                      : "bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200"
                  }`}
                  title={isRecording ? "Stop recording" : "Record voice reflection"}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-teal-600" />}
                  <span>
                    {isRecording
                      ? isHindi ? "सुन रहे हैं..." : "Listening..."
                      : isHindi ? "बोलकर बताएं" : "Speak Note"}
                  </span>
                </button>

                {/* Primary button: Add Notes */}
                <button
                  type="button"
                  onClick={() => handleAddNoteAndContinue()}
                  className="w-full sm:flex-1 py-3.5 px-5 rounded-xl bg-[#0D7377] hover:bg-[#0A5C5F] text-white font-black text-xs sm:text-sm shadow-xs hover:shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  title="Save note to journal and continue to the next memory"
                >
                  <PlusCircle className="w-4 h-4 text-teal-200" />
                  <span>{isHindi ? "नोट जोड़ें" : "Add Notes"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="text-[11px] text-slate-400">
                  {isHindi ? "निजी पारिवारिक पत्रिका में सुरक्षित" : "Safely saved in Family Journal"}
                </span>

                <button
                  type="button"
                  onClick={advanceToNextMemory}
                  className="px-3 py-1 text-slate-500 hover:text-slate-800 font-bold hover:underline cursor-pointer"
                >
                  {isHindi ? "बिना नोट के आगे बढ़ें" : "Continue without note"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. DAILY RESULT SUMMARY CARD (NO MEDICAL DIAGNOSIS STIGMA) */}
      {isCompleted && (
        <div className="max-w-2xl w-full mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-teal-100 space-y-6 my-auto">
          {/* Header Badge */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white flex items-center justify-center mx-auto shadow-md shadow-teal-500/20">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#132A2F]">
              {isHindi ? "आज की याद गतिविधि" : "Today's Memory Activity"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {isHindi
                ? "आपने अपनी पसंदीदा तस्वीरों और पारिवारिक यादों के साथ समय बिताया।"
                : "You spent quality time with familiar photographs and family memories."}
            </p>
          </div>

          {/* Key Metrics Bento */}
          <div className="grid grid-cols-3 gap-3">
            {/* Score */}
            <div className="bg-teal-50/80 rounded-2xl p-4 border border-teal-100 text-center">
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
                {isHindi ? "स्कोर (Score)" : "Score"}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-teal-900 mt-1 block">
                {Math.round((answersHistory.filter((a) => a.isCorrect).length / Math.max(1, memoriesList.length)) * 100)}%
              </span>
              <span className="text-[11px] font-semibold text-teal-700 block mt-0.5">
                {answersHistory.filter((a) => a.isCorrect).length}/{memoriesList.length} ⭐
              </span>
            </div>

            {/* Total Time */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {isHindi ? "समय (Time)" : "Time"}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 block">
                {(() => {
                  const totalSec = responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0)) : 15;
                  return totalSec > 60 ? `${Math.floor(totalSec / 60)}m ${totalSec % 60}s` : `${totalSec}s`;
                })()}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">
                ⏱ {isHindi ? "कुल समय" : "Total elapsed"}
              </span>
            </div>

            {/* Family Recognition */}
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 text-center">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                {isHindi ? "पारिवारिक यादें" : "Family Recall"}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-900 mt-1 block">
                ❤️ {isHindi ? "मजबूत" : "Strong"}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 block mt-0.5">
                100% {isHindi ? "सत्यापित" : "Verified"}
              </span>
            </div>
          </div>

          {/* Gentle Non-Diagnostic Clinical Note */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 font-medium leading-relaxed">
              {isHindi
                ? "नोट: यह स्कोर किसी मेडिकल जांच या निदान का विकल्प नहीं है। यह केवल मस्तिष्क को सक्रिय रखने और यादों को ताज़ा करने के लिए एक प्यार भरा अभ्यास है।"
                : "Gentle note: This memory score is an encouraging cognitive wellness activity, not a clinical diagnosis. Every moment spent recalling cherished memories strengthens neural pathways."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => {
                setIsCompleted(false);
                setCurrentIndex(0);
                setAnswersHistory([]);
                setResponseTimes([]);
              }}
              className="w-full sm:flex-1 py-3.5 px-4 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isHindi ? "फिर से खेलें (Replay)" : "Replay Game"}</span>
            </button>

            {onOpenCaregiverManager && (
              <button
                onClick={onOpenCaregiverManager}
                className="w-full sm:flex-1 py-3 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
              >
                <BookOpen className="w-4 h-4 text-amber-700" />
                <span>{isHindi ? "यादें प्रबंधित करें" : "Caregiver Vault"}</span>
              </button>
            )}

            <button
              onClick={() => {
                if (onComplete) {
                  onComplete(
                    Math.round(
                      (answersHistory.filter((a) => a.isCorrect).length /
                        Math.max(1, memoriesList.length)) *
                        100
                    )
                  );
                }
                onBack();
              }}
              className="w-full sm:flex-1 py-3 px-5 bg-[#0D7377] hover:bg-[#0A5C5F] text-white rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm transition active:scale-95"
            >
              <span>{isHindi ? "आगे बढ़ें (Continue)" : "Continue"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5. FOOTER ASSURANCE */}
      <div className="max-w-4xl w-full mx-auto text-center py-2">
        <p className="text-[11px] font-semibold text-slate-400">
          Smriti-Saathi Personal Recall Engine · {isHindi ? "परिवार की यादों से सुरक्षित व पोषित" : "Nourished with real caregiver memories"}
        </p>
      </div>
    </div>
  );
};
