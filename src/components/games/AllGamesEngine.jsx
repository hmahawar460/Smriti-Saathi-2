import { useState, useEffect } from "react";
import { translations } from "../../data/translations";
import {
  Brain,
  Volume2,
  Pause,
  Play,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  Award,
  Sun,
  Flame,
  Coffee,
  Bell,
  Feather,
  Music,
  Check,
  BookOpen,
  Umbrella,
  Key,
  Utensils,
  CloudRain,
  Home,
  ArrowUp,
  ArrowDown,
  Circle,
  Square,
  Triangle,
  Star,
  Glasses,
  Footprints,
  Pill,
  Flower2,
  RotateCcw
} from "lucide-react";
import confetti from "canvas-confetti";
import { allUnifiedGames } from "../../data/unifiedGamesData";
import { useRealtimeTracking } from "../../context/RealtimeTrackingContext";
import { LiveGameIndicator } from "../patient/LiveGameIndicator";
import {
  MorningStretchGraphic,
  MeditationGraphic,
  RobotAvatar
} from "../common/GraphicAssets";
import { MyMemoriesGameEngine } from "./MyMemoriesGameEngine";
import { FindItGameEngine } from "./FindItGameEngine";
import { GameCompletedResultScreen } from "./GameCompletedResultScreen";

export const AllGamesEngine = ({
  task,
  profile,
  onComplete,
  onContinue,
  onBack,
  onBackToGames
}) => {
  const [replayKey, setReplayKey] = useState(0);
  const rawTitleLower = (task?.title + " " + (task?.id || "")).toLowerCase();
  if (
    task?.id === "game-find-it" ||
    rawTitleLower.includes("find it") ||
    rawTitleLower.includes("object hunt")
  ) {
    return (
      <FindItGameEngine
        task={task}
        profile={profile}
        onComplete={onComplete}
        onContinue={onContinue}
        onBack={onBack}
        onBackToGames={onBackToGames}
      />
    );
  }

  if (
    task?.id === "game-my-memories" ||
    rawTitleLower.includes("my memories") ||
    rawTitleLower.includes("personal recall")
  ) {
    return (
      <MyMemoriesGameEngine
        task={task}
        profile={profile}
        onComplete={onComplete}
        onContinue={onContinue}
        onBack={onBack}
        onBackToGames={onBackToGames}
      />
    );
  }

  return (
    <AllGamesEngineCore
      key={replayKey}
      task={task}
      profile={profile}
      onComplete={onComplete}
      onContinue={onContinue}
      onBack={onBack}
      onBackToGames={onBackToGames}
      onReplay={() => setReplayKey((k) => k + 1)}
    />
  );
};

const AllGamesEngineCore = ({
  task,
  profile,
  onComplete,
  onContinue,
  onBack,
  onBackToGames,
  onReplay
}) => {

  const t = translations[profile.language];
  const {
    startLiveGame,
    recordEvent,
    pauseGame,
    resumeGame,
    completeGame,
    abandonGame,
    TRACKING_EVENT_TYPES
  } = useRealtimeTracking();

  const [isCompleted, setIsCompleted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorsCount, setErrorsCount] = useState(0);
  const [score, setScore] = useState(92);
  const [attemptsCount, setAttemptsCount] = useState(0);

  // Initialize real-time telemetry tracking on mount
  useEffect(() => {
    startLiveGame(task, profile, {
      totalSteps: 10,
      difficulty: task.difficulty || "Medium"
    });

    return () => {
      // If unmounted without completion, mark abandoned
      if (!isCompleted) {
        abandonGame();
      }
    };
  }, [task.id]);

  const titleLower = (task.title + " " + (task.id || "")).toLowerCase();
  const isGame1Memory = titleLower.includes("memory match") || titleLower.includes("game-1") && !titleLower.includes("game-10") || titleLower === "memory";
  const isGame2Number = titleLower.includes("number recall") || titleLower.includes("number memory") || titleLower.includes("game-2");
  const isGame3Picture = titleLower.includes("picture recall") || titleLower.includes("object recall") || titleLower.includes("game-3") || titleLower.includes("picture");
  const isGame4Pattern = titleLower.includes("pattern recall") || titleLower.includes("pattern puzzle") || titleLower.includes("game-4");
  const isGame5Sound = titleLower.includes("sound match") || titleLower.includes("audio match") || titleLower.includes("game-5");
  const isGame6Puzzle = titleLower.includes("simple puzzle") || titleLower.includes("jigsaw") || titleLower.includes("game-6");
  const isGame7FindObject = titleLower.includes("find the object") || titleLower.includes("find object") || titleLower.includes("spot") || titleLower.includes("game-7");
  const isGame8ColorShape = titleLower.includes("color & shape") || titleLower.includes("color and shape") || titleLower.includes("game-8");
  const isGame9Routine = titleLower.includes("routine recall") || titleLower.includes("daily routine") || titleLower.includes("routine ordering") || titleLower.includes("game-9");
  const isGame10Place = titleLower.includes("familiar place") || titleLower.includes("place memory") || titleLower.includes("scene memory") || titleLower.includes("game-10");
  const isStretch = titleLower.includes("stretch");
  const isMeditation = titleLower.includes("meditation");
  const isCrossword = titleLower.includes("crossword");
  const isSudoku = titleLower.includes("sudoku");
  const isStoryRecall = titleLower.includes("story recall");
  const activeIsMemory = isGame1Memory || !isGame2Number && !isGame3Picture && !isGame4Pattern && !isGame5Sound && !isGame6Puzzle && !isGame7FindObject && !isGame8ColorShape && !isGame9Routine && !isGame10Place && !isStretch && !isMeditation && !isCrossword && !isSudoku && !isStoryRecall;
  const playSoundEffect = (freq = 440, type = "sine", duration = 0.3) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(1e-3, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
    }
  };
  useEffect(() => {
    if (isPaused || isCompleted) return;
    const timer = setInterval(() => setElapsedSeconds((s) => s + 1), 1e3);
    return () => clearInterval(timer);
  }, [isPaused, isCompleted]);
  const speakInstruction = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    }
  };
  const finishGameWithScore = (finalScore, finalErrors = 0) => {
    setScore(finalScore);
    setErrorsCount(finalErrors);
    setIsCompleted(true);
    playSoundEffect(587.33, "sine", 0.6);
    try {
      confetti({ particleCount: 85, spread: 70, origin: { y: 0.6 } });
    } catch {
    }
    completeGame({
      finalScore,
      finalErrors,
      elapsedSeconds
    });
    onComplete(task.id, finalScore, finalScore, elapsedSeconds + 30, finalErrors);
  };
  const initialMemTiles = [
    { id: 1, pairId: 1, name: "Brass Kettle", icon: "Coffee", bg: "bg-amber-100", isFlipped: false, isMatched: false },
    { id: 2, pairId: 1, name: "Brass Kettle", icon: "Coffee", bg: "bg-amber-100", isFlipped: false, isMatched: false },
    { id: 3, pairId: 2, name: "Clay Lamp", icon: "Flame", bg: "bg-orange-100", isFlipped: false, isMatched: false },
    { id: 4, pairId: 2, name: "Clay Lamp", icon: "Flame", bg: "bg-orange-100", isFlipped: false, isMatched: false },
    { id: 5, pairId: 3, name: "Marigold", icon: "Sun", bg: "bg-yellow-100", isFlipped: false, isMatched: false },
    { id: 6, pairId: 3, name: "Marigold", icon: "Sun", bg: "bg-yellow-100", isFlipped: false, isMatched: false },
    { id: 7, pairId: 4, name: "Temple Bell", icon: "Bell", bg: "bg-teal-100", isFlipped: false, isMatched: false },
    { id: 8, pairId: 4, name: "Temple Bell", icon: "Bell", bg: "bg-teal-100", isFlipped: false, isMatched: false }
  ];
  const [memTiles, setMemTiles] = useState(() => [...initialMemTiles].sort(() => Math.random() - 0.5));
  const [selectedMemIndices, setSelectedMemIndices] = useState([]);
  const [memAttempts, setMemAttempts] = useState(0);
  const handleMemTileClick = (index) => {
    if (isPaused || isCompleted) return;
    if (memTiles[index].isFlipped || memTiles[index].isMatched) return;
    if (selectedMemIndices.length >= 2) return;
    playSoundEffect(440, "sine", 0.15);
    const newTiles = [...memTiles];
    newTiles[index].isFlipped = true;
    setMemTiles(newTiles);
    const newSelected = [...selectedMemIndices, index];
    setSelectedMemIndices(newSelected);
    if (newSelected.length === 2) {
      setMemAttempts((a) => a + 1);
      const idx1 = newSelected[0];
      const idx2 = newSelected[1];
      if (memTiles[idx1].pairId === memTiles[idx2].pairId) {
        playSoundEffect(659.25, "triangle", 0.3);
        recordEvent({
          eventType: TRACKING_EVENT_TYPES.ANSWER_CORRECT,
          stepNumber: memAttempts + 1,
          correct: true,
          instructionType: "IMAGE",
          description: `Matched pair: ${memTiles[idx1].name}`
        });
        setTimeout(() => {
          setMemTiles((prev) => {
            const updated = [...prev];
            updated[idx1].isMatched = true;
            updated[idx2].isMatched = true;
            return updated;
          });
          setSelectedMemIndices([]);
          const remaining = memTiles.filter((t2) => !t2.isMatched && t2.id !== memTiles[idx1].id && t2.id !== memTiles[idx2].id);
          if (remaining.length === 0) {
            const finalAcc = Math.max(70, Math.round(4 / Math.max(memAttempts + 1, 4) * 100));
            finishGameWithScore(finalAcc, errorsCount);
          }
        }, 350);
      } else {
        setErrorsCount((e) => e + 1);
        recordEvent({
          eventType: TRACKING_EVENT_TYPES.ANSWER_INCORRECT,
          stepNumber: memAttempts + 1,
          correct: false,
          instructionType: "IMAGE",
          description: `Mismatched: ${memTiles[idx1].name} & ${memTiles[idx2].name}`
        });
        setTimeout(() => {
          setMemTiles((prev) => {
            const updated = [...prev];
            updated[idx1].isFlipped = false;
            updated[idx2].isFlipped = false;
            return updated;
          });
          setSelectedMemIndices([]);
        }, 850);
      }
    }
  };
  const [numberRound, setNumberRound] = useState(1);
  const numberSeries = [
    { target: "7 3 9", clean: "739", label: "Level 1: 3 Digits" },
    { target: "5 8 2 4", clean: "5824", label: "Level 2: 4 Digits" }
  ];
  const [numberPhase, setNumberPhase] = useState("show");
  const [enteredNumber, setEnteredNumber] = useState("");
  const [numberSeconds, setNumberSeconds] = useState(4);
  useEffect(() => {
    if (!isGame2Number || numberPhase !== "show" || isCompleted) return;
    const interval = setInterval(() => {
      setNumberSeconds((s) => {
        if (s <= 1) {
          setNumberPhase("input");
          return 0;
        }
        return s - 1;
      });
    }, 1e3);
    return () => clearInterval(interval);
  }, [isGame2Number, numberPhase, isCompleted, numberRound]);
  const handleNumberTap = (digit) => {
    if (numberPhase !== "input" || isCompleted) return;
    playSoundEffect(400 + parseInt(digit) * 40, "sine", 0.15);
    const next = enteredNumber + digit;
    setEnteredNumber(next);
    const currentTarget = numberSeries[numberRound - 1];
    if (next === currentTarget.clean) {
      playSoundEffect(784, "triangle", 0.3);
      if (numberRound < numberSeries.length) {
        setTimeout(() => {
          setNumberRound((r) => r + 1);
          setEnteredNumber("");
          setNumberSeconds(5);
          setNumberPhase("show");
        }, 500);
      } else {
        finishGameWithScore(96, errorsCount);
      }
    } else if (next.length >= currentTarget.clean.length) {
      setErrorsCount((e) => e + 1);
      playSoundEffect(220, "sawtooth", 0.2);
      setTimeout(() => setEnteredNumber(""), 600);
    }
  };
  const pictureObjects = [
    { id: "p1", name: "Brass Tea Cup", icon: Coffee, isShown: true },
    { id: "p2", name: "Black Umbrella", icon: Umbrella, isShown: true },
    { id: "p3", name: "Brass Door Key", icon: Key, isShown: true },
    { id: "p4", name: "Clay Rice Bowl", icon: Utensils, isShown: true },
    { id: "p5", name: "Temple Bell", icon: Bell, isShown: false },
    { id: "p6", name: "Peacock Feather", icon: Feather, isShown: false },
    { id: "p7", name: "Reading Spectacles", icon: Glasses, isShown: false },
    { id: "p8", name: "Morning Lotus", icon: Flower2, isShown: false }
  ];
  const [picturePhase, setPicturePhase] = useState("memorize");
  const [selectedPictureIds, setSelectedPictureIds] = useState([]);
  const [pictureSecondsLeft, setPictureSecondsLeft] = useState(6);
  useEffect(() => {
    if (!isGame3Picture || picturePhase !== "memorize" || isCompleted) return;
    const interval = setInterval(() => {
      setPictureSecondsLeft((s) => {
        if (s <= 1) {
          setPicturePhase("select");
          return 0;
        }
        return s - 1;
      });
    }, 1e3);
    return () => clearInterval(interval);
  }, [isGame3Picture, picturePhase, isCompleted]);
  const handleTogglePictureSelect = (id) => {
    if (picturePhase !== "select" || isCompleted) return;
    playSoundEffect(520, "sine", 0.15);
    const next = selectedPictureIds.includes(id) ? selectedPictureIds.filter((i) => i !== id) : [...selectedPictureIds, id];
    setSelectedPictureIds(next);
    const shownIds = pictureObjects.filter((p) => p.isShown).map((p) => p.id);
    if (shownIds.every((sid) => next.includes(sid)) && next.length === shownIds.length) {
      finishGameWithScore(98, errorsCount);
    }
  };
  const [patternSequence, setPatternSequence] = useState([0, 2, 1]);
  const [playerInputSequence, setPlayerInputSequence] = useState([]);
  const [activeLamp, setActiveLamp] = useState(null);
  const [isShowingPattern, setIsShowingPattern] = useState(true);
  const [patternRound, setPatternRound] = useState(1);
  useEffect(() => {
    if (!isGame4Pattern || isCompleted) return;
    setIsShowingPattern(true);
    let step = 0;
    const interval = setInterval(() => {
      if (step < patternSequence.length) {
        setActiveLamp(patternSequence[step]);
        playSoundEffect(300 + patternSequence[step] * 100, "sine", 0.2);
        setTimeout(() => setActiveLamp(null), 450);
        step++;
      } else {
        clearInterval(interval);
        setIsShowingPattern(false);
      }
    }, 850);
    return () => clearInterval(interval);
  }, [isGame4Pattern, isCompleted, patternRound]);
  const handleLampClick = (idx) => {
    if (isShowingPattern || isPaused || isCompleted) return;
    setActiveLamp(idx);
    playSoundEffect(300 + idx * 100, "sine", 0.2);
    setTimeout(() => setActiveLamp(null), 250);
    const nextInput = [...playerInputSequence, idx];
    setPlayerInputSequence(nextInput);
    const currentCheckIndex = nextInput.length - 1;
    if (nextInput[currentCheckIndex] !== patternSequence[currentCheckIndex]) {
      setErrorsCount((e) => e + 1);
      setPlayerInputSequence([]);
      speakInstruction("Let us try that sequence once more.");
      setIsShowingPattern(true);
      setTimeout(() => {
        let step = 0;
        const interval = setInterval(() => {
          if (step < patternSequence.length) {
            setActiveLamp(patternSequence[step]);
            setTimeout(() => setActiveLamp(null), 450);
            step++;
          } else {
            clearInterval(interval);
            setIsShowingPattern(false);
          }
        }, 850);
      }, 400);
    } else if (nextInput.length === patternSequence.length) {
      if (patternRound >= 2) {
        finishGameWithScore(94, errorsCount);
      } else {
        setPatternRound(2);
        setTimeout(() => {
          setPatternSequence([0, 2, 1, 3]);
          setPlayerInputSequence([]);
        }, 500);
      }
    }
  };
  const soundRounds = [
    {
      id: "bell",
      title: "Sound #1",
      correctId: "bell",
      freq: 880,
      choices: [
        { id: "bell", name: "Temple Bell", icon: Bell, desc: "A peaceful bell chime" },
        { id: "rain", name: "Monsoon Rain", icon: CloudRain, desc: "Gentle raindrops" },
        { id: "flute", name: "Bamboo Flute", icon: Music, desc: "A melodious tune" }
      ]
    },
    {
      id: "rain",
      title: "Sound #2",
      correctId: "rain",
      freq: 220,
      choices: [
        { id: "sun", name: "Morning Bird", icon: Sun, desc: "Sweet chirp" },
        { id: "rain", name: "Monsoon Rain", icon: CloudRain, desc: "Gentle raindrops" },
        { id: "kettle", name: "Boiling Kettle", icon: Coffee, desc: "Warm tea kettle" }
      ]
    },
    {
      id: "flute",
      title: "Sound #3",
      correctId: "flute",
      freq: 523.25,
      choices: [
        { id: "flute", name: "Bamboo Flute", icon: Music, desc: "A melodious tune" },
        { id: "bell", name: "Temple Bell", icon: Bell, desc: "Chime" },
        { id: "clock", name: "Grandfather Clock", icon: Clock, desc: "Steady tick" }
      ]
    }
  ];
  const [currentSoundRoundIndex, setCurrentSoundRoundIndex] = useState(0);
  const [isPlayingSoundAnim, setIsPlayingSoundAnim] = useState(false);
  const playCurrentSound = () => {
    const currentRound = soundRounds[currentSoundRoundIndex];
    setIsPlayingSoundAnim(true);
    playSoundEffect(currentRound.freq, "sine", 1);
    setTimeout(() => setIsPlayingSoundAnim(false), 1e3);
  };
  const handlePickSound = (choiceId) => {
    if (isCompleted) return;
    const currentRound = soundRounds[currentSoundRoundIndex];
    if (choiceId === currentRound.correctId) {
      playSoundEffect(784, "triangle", 0.3);
      if (currentSoundRoundIndex < soundRounds.length - 1) {
        setCurrentSoundRoundIndex((i) => i + 1);
      } else {
        finishGameWithScore(98, errorsCount);
      }
    } else {
      setErrorsCount((e) => e + 1);
      playSoundEffect(250, "sawtooth", 0.2);
    }
  };
  const puzzlePieces = [
    { id: 0, title: "Top-Left (Golden Sun)", color: "bg-amber-500", icon: Sun },
    { id: 1, title: "Top-Right (Tea Garden)", color: "bg-emerald-600", icon: Feather },
    { id: 2, title: "Bottom-Left (Lotus Pond)", color: "bg-teal-500", icon: Flower2 },
    { id: 3, title: "Bottom-Right (Village Home)", color: "bg-orange-500", icon: Home }
  ];
  const [placedSlots, setPlacedSlots] = useState([null, null, null, null]);
  const [selectedPuzzlePiece, setSelectedPuzzlePiece] = useState(null);
  const handleSelectTrayPiece = (pieceId) => {
    setSelectedPuzzlePiece(pieceId);
    playSoundEffect(440, "sine", 0.15);
  };
  const handlePlaceInSlot = (slotIdx) => {
    if (selectedPuzzlePiece === null) return;
    if (selectedPuzzlePiece === slotIdx) {
      playSoundEffect(659.25, "triangle", 0.25);
      const next = [...placedSlots];
      next[slotIdx] = selectedPuzzlePiece;
      setPlacedSlots(next);
      setSelectedPuzzlePiece(null);
      if (next.every((val, i) => val === i)) {
        finishGameWithScore(96, errorsCount);
      }
    } else {
      setErrorsCount((e) => e + 1);
      playSoundEffect(261, "sawtooth", 0.2);
    }
  };
  const findObjectTargets = [
    { id: "lamp", name: "Golden Clay Lamp", icon: Flame, color: "text-amber-500" },
    { id: "kettle", name: "Brass Tea Kettle", icon: Coffee, color: "text-amber-700" },
    { id: "bell", name: "Temple Bell", icon: Bell, color: "text-teal-600" }
  ];
  const [findRoundIndex, setFindRoundIndex] = useState(0);
  const currentFindTarget = findObjectTargets[findRoundIndex];
  const sceneItemsGrid = [
    { id: "s1", icon: Umbrella, name: "Umbrella" },
    { id: "s2", icon: Key, name: "Key" },
    { id: "lamp", icon: Flame, name: "Golden Clay Lamp" },
    { id: "s3", icon: Glasses, name: "Spectacles" },
    { id: "s4", icon: Feather, name: "Feather" },
    { id: "kettle", icon: Coffee, name: "Brass Tea Kettle" },
    { id: "s5", icon: Flower2, name: "Lotus" },
    { id: "s6", icon: BookOpen, name: "Book" },
    { id: "bell", icon: Bell, name: "Temple Bell" },
    { id: "s7", icon: Clock, name: "Clock" },
    { id: "s8", icon: Sun, name: "Morning Sun" },
    { id: "s9", icon: Utensils, name: "Bowl" }
  ];
  const handleSpotItem = (itemId) => {
    if (isCompleted) return;
    if (itemId === currentFindTarget.id) {
      playSoundEffect(784, "triangle", 0.3);
      if (findRoundIndex < findObjectTargets.length - 1) {
        setFindRoundIndex((r) => r + 1);
      } else {
        finishGameWithScore(98, errorsCount);
      }
    } else {
      setErrorsCount((e) => e + 1);
      playSoundEffect(260, "sawtooth", 0.2);
    }
  };
  const colorShapeRounds = [
    {
      ruleType: "COLOR",
      ruleText: "MATCH COLOR: Tap the RED card",
      targetCriteria: "red",
      cards: [
        { id: "c1", color: "bg-rose-500", shape: "Circle", shapeIcon: Circle, label: "Red Circle", matches: true },
        { id: "c2", color: "bg-emerald-500", shape: "Square", shapeIcon: Square, label: "Green Square", matches: false },
        { id: "c3", color: "bg-blue-500", shape: "Triangle", shapeIcon: Triangle, label: "Blue Triangle", matches: false }
      ]
    },
    {
      ruleType: "SHAPE",
      ruleText: "MATCH SHAPE: Tap the STAR shape",
      targetCriteria: "star",
      cards: [
        { id: "c4", color: "bg-amber-500", shape: "Circle", shapeIcon: Circle, label: "Amber Circle", matches: false },
        { id: "c5", color: "bg-purple-600", shape: "Star", shapeIcon: Star, label: "Purple Star", matches: true },
        { id: "c6", color: "bg-emerald-500", shape: "Triangle", shapeIcon: Triangle, label: "Green Triangle", matches: false }
      ]
    },
    {
      ruleType: "COLOR",
      ruleText: "MATCH COLOR: Tap the GREEN card",
      targetCriteria: "green",
      cards: [
        { id: "c7", color: "bg-emerald-500", shape: "Square", shapeIcon: Square, label: "Green Square", matches: true },
        { id: "c8", color: "bg-rose-500", shape: "Triangle", shapeIcon: Triangle, label: "Red Triangle", matches: false },
        { id: "c9", color: "bg-amber-500", shape: "Star", shapeIcon: Star, label: "Amber Star", matches: false }
      ]
    },
    {
      ruleType: "SHAPE",
      ruleText: "MATCH SHAPE: Tap the TRIANGLE shape",
      targetCriteria: "triangle",
      cards: [
        { id: "c10", color: "bg-blue-500", shape: "Square", shapeIcon: Square, label: "Blue Square", matches: false },
        { id: "c11", color: "bg-amber-500", shape: "Triangle", shapeIcon: Triangle, label: "Golden Triangle", matches: true },
        { id: "c12", color: "bg-rose-500", shape: "Circle", shapeIcon: Circle, label: "Red Circle", matches: false }
      ]
    }
  ];
  const [colorShapeIndex, setColorShapeIndex] = useState(0);
  const handlePickColorShapeCard = (matches) => {
    if (isCompleted) return;
    if (matches) {
      playSoundEffect(784, "triangle", 0.25);
      if (colorShapeIndex < colorShapeRounds.length - 1) {
        setColorShapeIndex((i) => i + 1);
      } else {
        finishGameWithScore(97, errorsCount);
      }
    } else {
      setErrorsCount((e) => e + 1);
      playSoundEffect(260, "sawtooth", 0.2);
    }
  };
  const correctRoutineSequence = [
    { id: "r1", stepNum: 1, title: "Wake Up & Gentle Morning Stretch", icon: Sun, time: "7:00 AM" },
    { id: "r2", stepNum: 2, title: "Nutritious Breakfast & Warm Ginger Tea", icon: Coffee, time: "8:00 AM" },
    { id: "r3", stepNum: 3, title: "Take Morning Blood Pressure Medicine", icon: Pill, time: "9:00 AM" },
    { id: "r4", stepNum: 4, title: "Pleasant Garden Walk with Family", icon: Footprints, time: "10:00 AM" }
  ];
  const [userRoutineOrder, setUserRoutineOrder] = useState(() => [
    correctRoutineSequence[1],
    correctRoutineSequence[3],
    correctRoutineSequence[0],
    correctRoutineSequence[2]
  ]);
  const [routineChecked, setRoutineChecked] = useState(false);
  const moveRoutineItem = (index, direction) => {
    if (isCompleted) return;
    const newOrder = [...userRoutineOrder];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setUserRoutineOrder(newOrder);
    playSoundEffect(440, "sine", 0.15);
  };
  const handleVerifyRoutine = () => {
    const isCorrect = userRoutineOrder.every((item, i) => item.id === correctRoutineSequence[i].id);
    setRoutineChecked(true);
    if (isCorrect) {
      playSoundEffect(784, "triangle", 0.4);
      finishGameWithScore(98, errorsCount);
    } else {
      setErrorsCount((e) => e + 1);
      playSoundEffect(260, "sawtooth", 0.3);
      speakInstruction("Let us check the routine order: Wake up first, then breakfast, then medicine, then walk.");
    }
  };
  const placeQuestions = [
    {
      q: "What was resting peacefully on the veranda porch mat?",
      options: ["A sleeping ginger cat", "A bicycle", "A stray dog"],
      correct: 0
    },
    {
      q: "What color were the soft curtains near the window?",
      options: ["Bright Red", "Ocean Blue", "Golden Yellow"],
      correct: 1
    },
    {
      q: "What object was placed on the central wooden table?",
      options: ["A brass tea kettle & cup", "A radio set", "A box of paints"],
      correct: 0
    }
  ];
  const [placePhase, setPlacePhase] = useState("observe");
  const [placeSeconds, setPlaceSeconds] = useState(8);
  const [placeQuestionIndex, setPlaceQuestionIndex] = useState(0);
  useEffect(() => {
    if (!isGame10Place || placePhase !== "observe" || isCompleted) return;
    const interval = setInterval(() => {
      setPlaceSeconds((s) => {
        if (s <= 1) {
          setPlacePhase("questions");
          return 0;
        }
        return s - 1;
      });
    }, 1e3);
    return () => clearInterval(interval);
  }, [isGame10Place, placePhase, isCompleted]);
  const handleAnswerPlaceQuestion = (choiceIdx) => {
    if (isCompleted) return;
    if (choiceIdx === placeQuestions[placeQuestionIndex].correct) {
      playSoundEffect(659.25, "triangle", 0.25);
      if (placeQuestionIndex < placeQuestions.length - 1) {
        setPlaceQuestionIndex((i) => i + 1);
      } else {
        finishGameWithScore(96, errorsCount);
      }
    } else {
      setErrorsCount((e) => e + 1);
      playSoundEffect(250, "sawtooth", 0.2);
    }
  };
  const storyNarrative = {
    title: "A Pleasant Morning at the Jorhat Flower Fair",
    content: `Yesterday morning at 8:00 AM, grandmother Radha walked with her neighbor Sunita to the lively Jorhat flower fair. Radha carried a sunny yellow cloth bag. Along the pathway, she greeted the friendly tea stall owner and stopped by the fragrant marigold flower shop. She carefully selected five fresh garlands of orange marigolds and two earthen clay lamps for the evening prayer at home. Before taking the blue bus back home at 10:30 AM, Radha and Sunita enjoyed a warm cup of cardamom milk tea together.`,
    audioSummary: "Yesterday morning at 8 AM, Radha went with Sunita to the Jorhat flower fair carrying a yellow cloth bag. She bought five orange marigold garlands and two clay lamps, enjoyed cardamom tea, and took the blue bus home at 10:30 AM."
  };
  const storyQuestions = [
    {
      q: "1. What color was the cloth bag that grandmother Radha carried?",
      options: ["Sunny Yellow", "Emerald Green", "Deep Red", "Sky Blue"],
      correct: 0,
      hint: "It was the bright color of the morning sun."
    },
    {
      q: "2. Who accompanied Radha to the flower fair?",
      options: ["Her neighbor Sunita", "The village postman", "Her young grandson", "The grocery shopkeeper"],
      correct: 0,
      hint: "Her friendly neighbor walked with her."
    },
    {
      q: "3. How many orange marigold garlands did Radha select?",
      options: ["Five (5) garlands", "Two (2) garlands", "Ten (10) garlands", "One (1) garland"],
      correct: 0,
      hint: "She chose five fragrant garlands."
    },
    {
      q: "4. What special items did she buy for the evening prayer?",
      options: ["Two earthen clay lamps", "A brass temple bell", "A silver incense holder", "A wooden flute"],
      correct: 0,
      hint: "She bought two clay lamps for the evening prayer."
    },
    {
      q: "5. What kind of warm beverage did they enjoy before heading home?",
      options: ["Cardamom milk tea", "Cold lemonade", "Black coffee", "Coconut water"],
      correct: 0,
      hint: "A comforting cup of cardamom tea."
    }
  ];
  const [storyPhase, setStoryPhase] = useState("read");
  const [currentStoryQIndex, setCurrentStoryQIndex] = useState(0);
  const [selectedStoryOption, setSelectedStoryOption] = useState(null);
  const [isStoryNarrationPlaying, setIsStoryNarrationPlaying] = useState(false);
  const [storyScorePoints, setStoryScorePoints] = useState(0);
  const speakStory = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(storyNarrative.content);
      utt.rate = 0.82;
      utt.onstart = () => setIsStoryNarrationPlaying(true);
      utt.onend = () => setIsStoryNarrationPlaying(false);
      utt.onerror = () => setIsStoryNarrationPlaying(false);
      window.speechSynthesis.speak(utt);
    }
  };
  const stopStoryAudio = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsStoryNarrationPlaying(false);
    }
  };
  const handleAnswerStoryQuestion = (optionIdx) => {
    if (isCompleted || selectedStoryOption !== null) return;
    setSelectedStoryOption(optionIdx);
    const isCorrect = optionIdx === storyQuestions[currentStoryQIndex].correct;
    if (isCorrect) {
      playSoundEffect(784, "triangle", 0.3);
      setStoryScorePoints((prev) => prev + 1);
    } else {
      setErrorsCount((e) => e + 1);
      playSoundEffect(260, "sawtooth", 0.25);
    }
    setTimeout(() => {
      setSelectedStoryOption(null);
      if (currentStoryQIndex < storyQuestions.length - 1) {
        setCurrentStoryQIndex((i) => i + 1);
      } else {
        const correctCount = storyScorePoints + (isCorrect ? 1 : 0);
        const calcScore = Math.max(75, Math.round(correctCount / storyQuestions.length * 100));
        finishGameWithScore(calcScore, errorsCount + (isCorrect ? 0 : 1));
      }
    }, 900);
  };
  const stretchSteps = [
    { title: "Gentle Neck Tilts", desc: "Slowly tilt your head to the left, then to the right with easy breaths.", duration: 15 },
    { title: "Shoulder Rolls", desc: "Roll shoulders gently backward in a circle 5 times, relaxing the upper body.", duration: 15 },
    { title: "Seated Reach", desc: "Raise both arms comfortably towards the ceiling, stretching the torso.", duration: 15 },
    { title: "Deep Calming Breath", desc: "Inhale deeply through your nose, hold gently, and exhale softly through your mouth.", duration: 15 }
  ];
  const [stretchStepIndex, setStretchStepIndex] = useState(0);
  const [meditationBreathPhase, setMeditationBreathPhase] = useState("Inhale");
  const [meditationCycles, setMeditationCycles] = useState(0);
  useEffect(() => {
    if (!isMeditation || isCompleted) return;
    const interval = setInterval(() => {
      setMeditationBreathPhase((prev) => {
        if (prev === "Inhale") {
          playSoundEffect(523.25, "sine", 0.5);
          return "Hold";
        }
        if (prev === "Hold") return "Exhale";
        playSoundEffect(392, "sine", 0.5);
        setMeditationCycles((c) => {
          if (c >= 3) {
            finishGameWithScore(98, 0);
          }
          return c + 1;
        });
        return "Inhale";
      });
    }, 4e3);
    return () => clearInterval(interval);
  }, [isMeditation, isCompleted]);
  const crosswordQuestions = [
    { clue: "Morning hot beverage brewed with leaves", answer: "TEA", options: ["TEA", "ICE", "SUN"] },
    { clue: "Illuminating source in the morning sky", answer: "SUN", options: ["SUN", "MOON", "LAMP"] },
    { clue: "Gentle morning activity in the garden", answer: "WALK", options: ["WALK", "SWIM", "RIDE"] }
  ];
  const [crosswordIndex, setCrosswordIndex] = useState(0);
  const handlePickCrossword = (choice) => {
    if (isCompleted) return;
    if (choice === crosswordQuestions[crosswordIndex].answer) {
      playSoundEffect(784, "triangle", 0.25);
      if (crosswordIndex < crosswordQuestions.length - 1) {
        setCrosswordIndex((i) => i + 1);
      } else {
        finishGameWithScore(96, errorsCount);
      }
    } else {
      setErrorsCount((e) => e + 1);
      playSoundEffect(260, "sawtooth", 0.2);
    }
  };
  const [sudokuSelected, setSudokuSelected] = useState(null);
  if (isCompleted) {
    return (
      <GameCompletedResultScreen
        gameTitle={task?.title || "Cognitive Game"}
        score={score}
        maxScore={100}
        timeSeconds={elapsedSeconds}
        accuracy={score}
        errorsCount={errorsCount}
        taskId={task?.id}
        profile={profile}
        onContinue={onContinue || onBack}
        onReplay={onReplay}
        onBackToGames={onBackToGames || onBack}
        customMessage={
          profile?.language === "hi"
            ? `संज्ञानात्मक स्तर स्थिर, सतर्क और केंद्रित है (${score}%)। आपकी दैनिक मस्तिष्क गतिविधि बहुत अच्छी रही!`
            : `Cognition is steady, engaged, and alert (${score}%). Your daily brain exercise routine is on track. Well done!`
        }
      />
    );
  }
  return <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6 animate-in fade-in duration-200">
      
      {
    /* Top Header Bar */
  }
      <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-xs border border-[#0D7377]/15 mb-4">
        <button
    onClick={onBack}
    className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-bold text-sm py-1 px-3 rounded-xl hover:bg-slate-100 transition cursor-pointer"
  >
          <ChevronLeft className="w-5 h-5" />
          Exit
        </button>

        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-black text-[#132A2F]">
            {task.title}
          </h2>
          <span className="text-xs font-bold text-[#0D7377]">
            Active Cognitive Exercise
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
    onClick={() => speakInstruction(task.title + ". " + (task.description || "Focus calmly on the activity."))}
    title="Read instructions aloud"
    className="p-2 rounded-xl bg-slate-100 hover:bg-teal-50 text-[#0D7377] transition cursor-pointer"
  >
            <Volume2 className="w-4 h-4" />
          </button>
          <button
    onClick={() => setIsPaused(!isPaused)}
    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${isPaused ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-700"}`}
  >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span>{isPaused ? "Resume" : "Pause"}</span>
          </button>
        </div>
      </div>

      {/* Live Real-Time Game & AI Engine Telemetry Indicator */}
      <LiveGameIndicator
        gameTitle={task.title}
        currentStep={attemptsCount + 1}
        totalSteps={10}
        difficulty={task.difficulty || "Medium"}
        onTakeBreak={() => setIsPaused(true)}
      />

      {
    /* Picture & Exercise Visual Banner */
  }
      {(() => {
    const found = allUnifiedGames.find(
      (g) => g.id === task.id || g.title.toLowerCase().includes(task.title.toLowerCase()) || task.title.toLowerCase().includes(g.title.toLowerCase().replace(/^\d+\.\s*/, ""))
    );
    const imgUrl = task.imageUrl || found?.imageUrl || "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80";
    return <div className="relative w-full h-36 sm:h-44 rounded-3xl overflow-hidden shadow-xs border border-slate-200 mb-4">
            <img
      src={imgUrl}
      alt={task.title}
      className="w-full h-full object-cover"
      onError={(e) => {
        e.target.style.display = "none";
      }}
    />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white text-xs font-black">
              <span className="bg-indigo-600/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs">
                🧠 {task.domain || "Cognitive"} Exercise
              </span>
              <span className="bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-full text-teal-200">
                ⏱️ {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, "0")}
              </span>
            </div>

            <div className="absolute bottom-3 left-3 right-3 text-white">
              <p className="text-xs sm:text-sm font-semibold text-teal-100 line-clamp-1">
                {task.description || found?.tagline || "Focus calmly on the activity at your own comfortable pace."}
              </p>
            </div>
          </div>;
  })()}

      {
    /* ------------------------------------------------------------ */
  }
      {
    /* GAME 1: 🧠 MEMORY MATCH */
  }
      {
    /* ------------------------------------------------------------ */
  }
      {activeIsMemory && <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-emerald-300 space-y-4">
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl font-black text-[#132A2F]">
              Match the Pairs
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Tap cards to flip them and find all matching pairs · Attempts: {memAttempts}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {memTiles.map((tile, idx) => {
    const isRevealed = tile.isFlipped || tile.isMatched;
    return <button
      key={tile.id}
      onClick={() => handleMemTileClick(idx)}
      disabled={tile.isMatched}
      className={`h-28 sm:h-32 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center p-2 text-center shadow-xs border-2 cursor-pointer ${tile.isMatched ? "bg-emerald-100 border-emerald-400 text-emerald-800" : isRevealed ? `${tile.bg} border-[#0D7377] text-[#132A2F] scale-102` : "bg-[#F8FCFB] border-slate-200 text-slate-400 hover:border-[#0D7377]"}`}
    >
                  {isRevealed ? <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center mb-1 text-[#0D7377]">
                        {tile.icon === "Coffee" && <Coffee className="w-6 h-6" />}
                        {tile.icon === "Flame" && <Flame className="w-6 h-6" />}
                        {tile.icon === "Sun" && <Sun className="w-6 h-6" />}
                        {tile.icon === "Bell" && <Bell className="w-6 h-6" />}
                      </div>
                      <span className="text-xs font-bold leading-tight">{tile.name}</span>
                    </div> : <div className="flex flex-col items-center">
                      <Brain className="w-8 h-8 opacity-40 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Tap to Flip</span>
                    </div>}
                </button>;
  })}
          </div>

          <button
    onClick={() => finishGameWithScore(94, errorsCount)}
    className="w-full py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl mt-2 cursor-pointer"
  >
            Complete Session Early
          </button>
        </div>}

      {
    /* ------------------------------------------------------------ */
  }
      {
    /* GAME 2: 🔢 NUMBER RECALL */
  }
      {
    /* ------------------------------------------------------------ */
  }
      {isGame2Number && <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-300 text-center space-y-6">
          <div>
            <div className="inline-block bg-blue-50 text-[#1D7BF6] px-3 py-1 rounded-full text-xs font-bold mb-2">
              {numberSeries[numberRound - 1].label}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#132A2F]">
              {numberPhase === "show" ? "Remember This Number Series" : "Enter the Numbers in Order"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              {numberPhase === "show" ? `Memorize in ${numberSeconds}s` : "Use the keypad below to enter what you saw"}
            </p>
          </div>

          {numberPhase === "show" ? <div className="py-10 bg-blue-50 border-2 border-blue-200 rounded-3xl animate-pulse">
              <span className="text-5xl font-black tracking-widest text-[#1D7BF6]">
                {numberSeries[numberRound - 1].target}
              </span>
            </div> : <div className="space-y-4">
              <div className="h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl font-black text-[#0D7377] tracking-widest border border-slate-300">
                {enteredNumber || "\u2014 \u2014 \u2014"}
              </div>
              <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => <button
    key={digit}
    onClick={() => handleNumberTap(digit)}
    className="h-14 bg-slate-50 hover:bg-teal-50 border-2 border-slate-200 hover:border-[#0D7377] rounded-2xl font-black text-2xl text-slate-800 transition active:scale-95 cursor-pointer"
  >
                    {digit}
                  </button>)}
              </div>
              <div className="flex justify-center gap-2 max-w-xs mx-auto">
                <button
    onClick={() => setEnteredNumber("")}
    className="py-2.5 px-4 bg-rose-50 text-rose-700 font-bold text-xs rounded-xl cursor-pointer"
  >
                  Clear
                </button>
                <button
    onClick={() => handleNumberTap("0")}
    className="w-20 h-12 bg-slate-50 border-2 border-slate-200 font-black text-xl text-slate-800 rounded-xl cursor-pointer"
  >
                  0
                </button>
              </div>
            </div>}

          <button
    onClick={() => finishGameWithScore(95, errorsCount)}
    className="px-6 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl cursor-pointer"
  >
            Skip to Result
          </button>
        </div>}

      {
    /* ------------------------------------------------------------ */
  }
      {
    /* GAME 3: 🖼️ PICTURE RECALL */
  }
      {
    /* ------------------------------------------------------------ */
  }
      {isGame3Picture && <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-300 text-center space-y-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-[#132A2F]">
              {picturePhase === "memorize" ? "Observe These 4 Familiar Items" : "Which Items Did You See?"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              {picturePhase === "memorize" ? `Memorize them before time runs out (${pictureSecondsLeft}s)` : "Tap all 4 items that were shown"}
            </p>
          </div>

          {picturePhase === "memorize" ? <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {pictureObjects.filter((o) => o.isShown).map((obj) => {
    const IconComponent = obj.icon;
    return <div key={obj.id} className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex flex-col items-center shadow-xs">
                    <IconComponent className="w-10 h-10 text-amber-800 mb-2" />
                    <span className="text-xs font-black text-amber-950">{obj.name}</span>
                  </div>;
  })}
            </div> : <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {pictureObjects.map((obj) => {
    const isSel = selectedPictureIds.includes(obj.id);
    const IconComponent = obj.icon;
    return <button
      key={obj.id}
      onClick={() => handleTogglePictureSelect(obj.id)}
      className={`p-4 rounded-2xl border-2 flex flex-col items-center transition cursor-pointer ${isSel ? "bg-teal-100 border-[#0D7377] text-[#0D7377] scale-102 font-black" : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-400 font-medium"}`}
    >
                    <IconComponent className="w-8 h-8 mb-2" />
                    <span className="text-xs">{obj.name}</span>
                  </button>;
  })}
            </div>}

          <button
    onClick={() => finishGameWithScore(96, errorsCount)}
    className="px-6 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl cursor-pointer"
  >
            Complete Picture Game
          </button>
        </div>}

      {
    /* ------------------------------------------------------------ */
  }
      {
    /* GAME 4: 🎨 PATTERN RECALL */
  }
      {
    /* ------------------------------------------------------------ */
  }
      {isGame4Pattern && <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-300 text-center space-y-6">
          <div>
            <span className="text-xs font-bold text-[#0D7377] uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Round {patternRound} of 2
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#132A2F] mt-2">
              {isShowingPattern ? "Watch the Sequence" : "Tap the Tiles in Order"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              {isShowingPattern ? "Memorize which colored lamp lights up" : "Your turn! Tap the sequence."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            {[
    { id: 0, color: "bg-rose-500", name: "Ruby Lamp" },
    { id: 1, color: "bg-emerald-500", name: "Emerald Lamp" },
    { id: 2, color: "bg-amber-500", name: "Golden Lamp" },
    { id: 3, color: "bg-blue-500", name: "Sapphire Lamp" }
  ].map((lamp) => {
    const isLit = activeLamp === lamp.id;
    return <button
      key={lamp.id}
      onClick={() => handleLampClick(lamp.id)}
      disabled={isShowingPattern}
      className={`h-28 rounded-3xl transition-all duration-200 transform active:scale-95 flex flex-col items-center justify-center p-3 text-white font-black text-sm shadow-md cursor-pointer ${lamp.color} ${isLit ? "ring-8 ring-yellow-300 scale-105 brightness-125" : "opacity-80 hover:opacity-100"}`}
    >
                  <Sparkles className={`w-8 h-8 mb-1 ${isLit ? "animate-spin text-yellow-100" : "text-white"}`} />
                  <span>{lamp.name}</span>
                </button>;
  })}
          </div>

          <button
    onClick={() => finishGameWithScore(92, errorsCount)}
    className="px-6 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl cursor-pointer"
  >
            Complete Pattern Game
          </button>
        </div>}

      {
    /* ------------------------------------------------------------ */
  }
      {
    /* GAME 5: 🔊 SOUND MATCH */
  }
      {
    /* ------------------------------------------------------------ */
  }
      {isGame5Sound && <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-300 text-center space-y-6">
          <div>
            <span className="text-xs font-bold text-[#0D7377] uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Round {currentSoundRoundIndex + 1} of {soundRounds.length}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#132A2F] mt-2">
              Listen and Match the Sound
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Tap the play button to hear the sound, then choose what made it
            </p>
          </div>

          <button
    onClick={playCurrentSound}
    className={`w-28 h-28 mx-auto rounded-full bg-[#0D7377] text-white flex flex-col items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer ${isPlayingSoundAnim ? "ring-8 ring-teal-200 animate-pulse" : ""}`}
  >
            <Volume2 className="w-12 h-12 mb-1" />
            <span className="text-[10px] font-black uppercase tracking-wider">Play Sound</span>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {soundRounds[currentSoundRoundIndex].choices.map((snd) => {
    const IconComp = snd.icon;
    return <button
      key={snd.id}
      onClick={() => handlePickSound(snd.id)}
      className="p-4 rounded-2xl border-2 border-slate-200 hover:border-[#0D7377] hover:bg-teal-50 text-slate-800 flex flex-col items-center transition cursor-pointer"
    >
                  <IconComp className="w-8 h-8 text-[#0D7377] mb-2" />
                  <span className="text-sm font-black">{snd.name}</span>
                  <span className="text-[10px] text-slate-500">{snd.desc}</span>
                </button>;
  })}
          </div>

          <button
    onClick={() => finishGameWithScore(95, errorsCount)}
    className="px-6 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl cursor-pointer"
  >
            Complete Sound Game
          </button>
        </div>}

      {
    /* ------------------------------------------------------------ */
  }
      {
    /* GAME 6: 🧩 SIMPLE PUZZLE */
  }
      {
    /* ------------------------------------------------------------ */
  }
      {isGame6Puzzle && <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-300 text-center space-y-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-[#132A2F]">
              4-Piece Scene Puzzle
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Select a piece from the tray below, then tap the matching corner slot to place it
            </p>
          </div>

          {
    /* Puzzle Board (2x2 Grid) */
  }
          <div className="w-64 h-64 mx-auto bg-slate-100 border-4 border-dashed border-slate-300 rounded-3xl grid grid-cols-2 p-2 gap-2">
            {[0, 1, 2, 3].map((slotIdx) => {
    const placedPieceId = placedSlots[slotIdx];
    const isFilled = placedPieceId !== null;
    const pieceInfo = isFilled ? puzzlePieces[placedPieceId] : null;
    return <button
      key={slotIdx}
      onClick={() => handlePlaceInSlot(slotIdx)}
      className={`rounded-2xl flex flex-col items-center justify-center text-white transition-all border-2 ${isFilled && pieceInfo ? `${pieceInfo.color} border-white shadow-md` : "bg-white/60 border-slate-300 text-slate-400 hover:bg-teal-50 cursor-pointer"}`}
    >
                  {isFilled && pieceInfo ? <>
                      <pieceInfo.icon className="w-8 h-8 mb-1" />
                      <span className="text-[10px] font-black">{pieceInfo.title}</span>
                    </> : <span className="text-xs font-bold">Slot #{slotIdx + 1}</span>}
                </button>;
  })}
          </div>

          {
    /* Tray */
  }
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-2">Pieces Tray:</span>
            <div className="flex justify-center gap-2 flex-wrap">
              {puzzlePieces.map((piece) => {
    const isAlreadyPlaced = placedSlots.includes(piece.id);
    const isSelected = selectedPuzzlePiece === piece.id;
    return <button
      key={piece.id}
      disabled={isAlreadyPlaced}
      onClick={() => handleSelectTrayPiece(piece.id)}
      className={`px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${isAlreadyPlaced ? "bg-slate-100 text-slate-400 cursor-not-allowed opacity-50" : isSelected ? "bg-[#0D7377] text-white ring-4 ring-teal-200" : "bg-slate-100 hover:bg-slate-200 text-slate-800"}`}
    >
                    <piece.icon className="w-4 h-4" />
                    <span>{piece.title}</span>
                  </button>;
  })}
            </div>
          </div>

          <button
    onClick={() => finishGameWithScore(96, errorsCount)}
    className="px-6 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl cursor-pointer"
  >
            Complete Puzzle Game
          </button>
        </div>}

      {
    /* ------------------------------------------------------------ */
  }
      {
    /* GAME 7: 👀 FIND THE OBJECT */
  }
      {
    /* ------------------------------------------------------------ */
  }
      {isGame7FindObject && <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-300 text-center space-y-5">
          <div>
            <span className="text-xs font-bold text-[#0D7377] uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Round {findRoundIndex + 1} of {findObjectTargets.length}
            </span>
            <div className="flex items-center justify-center gap-2 mt-2">
              <h3 className="text-xl sm:text-2xl font-black text-[#132A2F]">
                Find the: <span className="text-[#0D7377] underline">{currentFindTarget.name}</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Scan the scene and tap the target item as quickly as you can!
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-md mx-auto">
            {sceneItemsGrid.map((item) => {
    const ItemIcon = item.icon;
    return <button
      key={item.id}
      onClick={() => handleSpotItem(item.id)}
      className="h-20 bg-slate-50 hover:bg-teal-50 border-2 border-slate-200 hover:border-[#0D7377] rounded-2xl flex flex-col items-center justify-center p-2 transition active:scale-95 cursor-pointer"
    >
                  <ItemIcon className="w-7 h-7 text-[#132A2F] mb-1" />
                  <span className="text-[10px] font-bold text-slate-600 truncate w-full text-center">
                    {item.name}
                  </span>
                </button>;
  })}
          </div>

          <button
    onClick={() => finishGameWithScore(98, errorsCount)}
    className="px-6 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl cursor-pointer"
  >
            Complete Search Game
          </button>
        </div>}

      {
    /* ------------------------------------------------------------ */
  }
      {
    /* GAME 8: 🚦 COLOR & SHAPE MATCH */
  }
      {
    /* ------------------------------------------------------------ */
  }
      {isGame8ColorShape && <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-300 text-center space-y-6">
          <div>
            <span className="text-xs font-bold text-[#0D7377] uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Rule {colorShapeIndex + 1} of {colorShapeRounds.length}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#132A2F] mt-2">
              {colorShapeRounds[colorShapeIndex].ruleText}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Tap the card below that matches the instruction above
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {colorShapeRounds[colorShapeIndex].cards.map((card) => {
    const ShapeIcon = card.shapeIcon;
    return <button
      key={card.id}
      onClick={() => handlePickColorShapeCard(card.matches)}
      className={`h-36 rounded-3xl ${card.color} text-white flex flex-col items-center justify-center p-4 shadow-md transition transform active:scale-95 cursor-pointer hover:brightness-110`}
    >
                  <ShapeIcon className="w-12 h-12 mb-2 fill-current opacity-90" />
                  <span className="text-base font-black">{card.label}</span>
                </button>;
  })}
          </div>

          <button
    onClick={() => finishGameWithScore(97, errorsCount)}
    className="px-6 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl cursor-pointer"
  >
            Complete Color & Shape Match
          </button>
        </div>}

      {
    /* ------------------------------------------------------------ */
  }
      {
    /* GAME 9: 📅 DAILY ROUTINE RECALL */
  }
      {
    /* ------------------------------------------------------------ */
  }
      {isGame9Routine && <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-300 text-left space-y-5">
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl font-black text-[#132A2F]">
              Daily Routine Sequencing
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Arrange these 4 daily activities from first to last (Morning → Afternoon)
            </p>
          </div>

          <div className="space-y-3">
            {userRoutineOrder.map((item, idx) => {
    const IconComp = item.icon;
    return <div
      key={item.id}
      className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center justify-between shadow-2xs"
    >
                  <div className="flex items-center gap-3.5">
                    <span className="w-8 h-8 rounded-full bg-[#0D7377] text-white font-black text-sm flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <IconComp className="w-6 h-6 text-[#0D7377]" />
                    <div>
                      <h4 className="font-extrabold text-sm text-[#132A2F]">{item.title}</h4>
                      <span className="text-xs text-slate-500 font-semibold">{item.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
      onClick={() => moveRoutineItem(idx, "up")}
      disabled={idx === 0}
      className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
      onClick={() => moveRoutineItem(idx, "down")}
      disabled={idx === userRoutineOrder.length - 1}
      className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>;
  })}
          </div>

          <button
    onClick={handleVerifyRoutine}
    className="w-full py-4 bg-[#0D7377] hover:bg-[#0A5C5F] text-white font-extrabold text-base rounded-2xl shadow-md transition cursor-pointer text-center"
  >
            Check Routine Sequence ✓
          </button>
        </div>}

      {
    /* ------------------------------------------------------------ */
  }
      {
    /* GAME 10: 🏠 FAMILIAR PLACE MEMORY */
  }
      {
    /* ------------------------------------------------------------ */
  }
      {isGame10Place && <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-300 text-left space-y-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-[#132A2F]">
              {placePhase === "observe" ? "Explore the Familiar Veranda Scene" : `Question ${placeQuestionIndex + 1} of 3`}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              {placePhase === "observe" ? `Observe carefully for ${placeSeconds}s` : "Answer based on the room scene you observed"}
            </p>
          </div>

          {placePhase === "observe" ? <div className="space-y-4">
              <div className="bg-gradient-to-r from-amber-50 to-teal-50 p-5 rounded-2xl border border-teal-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-[#0D7377]">
                  <Home className="w-5 h-5" />
                  <span>Scene: Morning Veranda in Jorhat</span>
                </div>
                <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
                  "The morning sun shines through the window with <strong>ocean blue curtains</strong>. On the central wooden table sits a warm <strong>brass tea kettle and cup</strong>. Outside on the veranda porch mat, a <strong>sleeping ginger cat</strong> rests peacefully under the shade."
                </p>
              </div>

              <button
    onClick={() => setPlacePhase("questions")}
    className="w-full py-3 bg-[#0D7377] text-white font-bold text-sm rounded-xl cursor-pointer"
  >
                I'm Ready for Questions
              </button>
            </div> : <div className="space-y-4">
              <h4 className="font-extrabold text-base text-[#132A2F]">
                {placeQuestions[placeQuestionIndex].q}
              </h4>
              <div className="space-y-2.5">
                {placeQuestions[placeQuestionIndex].options.map((opt, oIdx) => <button
    key={oIdx}
    onClick={() => handleAnswerPlaceQuestion(oIdx)}
    className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 hover:border-[#0D7377] hover:bg-teal-50 font-bold text-sm transition active:scale-98 cursor-pointer"
  >
                    {opt}
                  </button>)}
              </div>
            </div>}

          <button
    onClick={() => finishGameWithScore(96, errorsCount)}
    className="px-6 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl cursor-pointer"
  >
            Complete Place Memory Game
          </button>
        </div>}

      {
    /* ------------------------------------------------------------ */
  }
      {
    /* GAME 11: 📖 STORY RECALL */
  }
      {
    /* ------------------------------------------------------------ */
  }
      {isStoryRecall && <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-300 text-left space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0D7377] uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              {storyPhase === "read" ? "Phase 1: Read & Listen to Story" : `Question ${currentStoryQIndex + 1} of ${storyQuestions.length}`}
            </span>
            <button
    onClick={isStoryNarrationPlaying ? stopStoryAudio : speakStory}
    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${isStoryNarrationPlaying ? "bg-rose-100 text-rose-800 animate-pulse" : "bg-teal-50 text-[#0D7377] hover:bg-teal-100"}`}
  >
              <Volume2 className="w-4 h-4" />
              <span>{isStoryNarrationPlaying ? "Stop Voice" : "Read Aloud"}</span>
            </button>
          </div>

          {storyPhase === "read" ? <div className="space-y-5">
              <div className="p-5 sm:p-6 rounded-3xl bg-amber-50/80 border-2 border-amber-200 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-amber-950">
                      {storyNarrative.title}
                    </h3>
                    <p className="text-xs text-amber-800 font-semibold">
                      Listen or read carefully at your own gentle pace
                    </p>
                  </div>
                </div>

                <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-medium">
                  {storyNarrative.content}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
    onClick={() => {
      stopStoryAudio();
      setStoryPhase("questions");
    }}
    className="flex-1 py-4 bg-[#0D7377] hover:bg-[#0A5C5F] text-white font-extrabold text-base rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
  >
                  <span>I'm Ready for the Questions</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div> : <div className="space-y-5">
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Question {currentStoryQIndex + 1}
                </span>
                <h4 className="font-extrabold text-base sm:text-lg text-[#132A2F] leading-snug">
                  {storyQuestions[currentStoryQIndex].q}
                </h4>
              </div>

              <div className="space-y-3">
                {storyQuestions[currentStoryQIndex].options.map((option, oIdx) => {
    const isChosen = selectedStoryOption === oIdx;
    const isCorrect = oIdx === storyQuestions[currentStoryQIndex].correct;
    return <button
      key={oIdx}
      disabled={selectedStoryOption !== null}
      onClick={() => handleAnswerStoryQuestion(oIdx)}
      className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 font-bold text-sm sm:text-base transition active:scale-98 cursor-pointer flex items-center justify-between ${selectedStoryOption !== null ? isCorrect ? "bg-emerald-100 border-emerald-500 text-emerald-950 font-black" : isChosen ? "bg-rose-100 border-rose-400 text-rose-950" : "bg-white border-slate-200 text-slate-400 opacity-60" : "bg-white border-slate-200 hover:border-[#0D7377] hover:bg-teal-50 text-slate-800"}`}
    >
                      <span>{option}</span>
                      {selectedStoryOption !== null && isCorrect && <Check className="w-5 h-5 text-emerald-700 stroke-[3]" />}
                    </button>;
  })}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
    onClick={() => setStoryPhase("read")}
    className="text-xs font-bold text-slate-500 hover:text-[#0D7377] underline cursor-pointer"
  >
                  ← Read Story Again
                </button>

                <button
    onClick={() => finishGameWithScore(95, errorsCount)}
    className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-xs rounded-xl cursor-pointer"
  >
                  Complete Story Recall
                </button>
              </div>
            </div>}
        </div>}

      {
    /* ------------------------------------------------------------ */
  }
      {
    /* GAME 12: 🙆 MORNING STRETCH */
  }
      {
    /* ------------------------------------------------------------ */
  }
      {isStretch && <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-blue-200 text-center space-y-6">
          <div className="flex items-center justify-center my-auto">
            <MorningStretchGraphic className="w-24 h-24" />
          </div>
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Step {stretchStepIndex + 1} of {stretchSteps.length}
            </span>
            <h3 className="text-2xl font-black text-[#132A2F] mt-2">
              {stretchSteps[stretchStepIndex].title}
            </h3>
            <p className="text-sm text-slate-600 font-medium mt-1 max-w-md mx-auto">
              "{stretchSteps[stretchStepIndex].desc}"
            </p>
          </div>

          <div className="flex justify-center gap-3">
            {stretchStepIndex < stretchSteps.length - 1 ? <button
    onClick={() => {
      playSoundEffect(587, "sine", 0.2);
      setStretchStepIndex((i) => i + 1);
    }}
    className="py-3 px-6 bg-[#1D7BF6] hover:bg-blue-600 text-white font-extrabold text-sm rounded-2xl shadow-md transition cursor-pointer"
  >
                Next Stretch Pose →
              </button> : <button
    onClick={() => finishGameWithScore(98, 0)}
    className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-md transition cursor-pointer"
  >
                Complete Morning Stretch ✓
              </button>}
          </div>
        </div>}

      {
    /* ------------------------------------------------------------ */
  }
      {
    /* GAME 13: 🧘 MEDITATION & BREATHING */
  }
      {
    /* ------------------------------------------------------------ */
  }
      {isMeditation && <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-orange-200 text-center space-y-6">
          <div className="flex items-center justify-center my-auto">
            <MeditationGraphic className="w-24 h-24" />
          </div>
          <div>
            <span className="text-xs font-bold text-orange-700 uppercase bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              Cycle {meditationCycles + 1} of 4
            </span>
            <h3 className="text-3xl font-black text-[#132A2F] mt-2 tracking-wide">
              {meditationBreathPhase}
            </h3>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Follow the breathing rhythm peacefully. Relax your shoulders.
            </p>
          </div>

          <div className="w-36 h-36 mx-auto rounded-full bg-gradient-to-tr from-orange-400 to-amber-300 flex items-center justify-center text-white font-black text-xl shadow-lg transition-all duration-1000 transform scale-105">
            {meditationBreathPhase}
          </div>

          <button
    onClick={() => finishGameWithScore(98, 0)}
    className="py-3 px-6 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm rounded-2xl shadow-md transition cursor-pointer"
  >
            Finish Meditation Session ✓
          </button>
        </div>}

      {
    /* ------------------------------------------------------------ */
  }
      {
    /* GAME 14: 🔤 CROSSWORD & WORDS */
  }
      {
    /* ------------------------------------------------------------ */
  }
      {isCrossword && <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-300 text-center space-y-6">
          <div>
            <span className="text-xs font-bold text-[#0D7377] uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Word Clue {crosswordIndex + 1} of {crosswordQuestions.length}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#132A2F] mt-2">
              "{crosswordQuestions[crosswordIndex].clue}"
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Select the correct word that matches this clue:
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
            {crosswordQuestions[crosswordIndex].options.map((opt) => <button
    key={opt}
    onClick={() => handlePickCrossword(opt)}
    className="h-16 rounded-2xl bg-slate-50 hover:bg-teal-50 border-2 border-slate-200 hover:border-[#0D7377] text-slate-900 font-black text-lg transition active:scale-95 cursor-pointer flex items-center justify-center shadow-xs"
  >
                {opt}
              </button>)}
          </div>

          <button
    onClick={() => finishGameWithScore(96, errorsCount)}
    className="px-6 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl cursor-pointer"
  >
            Complete Word Game
          </button>
        </div>}

      {
    /* ------------------------------------------------------------ */
  }
      {
    /* GAME 15: 🔢 SUDOKU MINI */
  }
      {
    /* ------------------------------------------------------------ */
  }
      {isSudoku && <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-300 text-center space-y-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-[#132A2F]">
              4x4 Mini Number Grid
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Every row and column should have numbers 1 to 4 without repetition.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto bg-slate-100 p-3 rounded-2xl border-2 border-slate-300">
            {["1", "2", "3", "4", "3", "4", "?", "2", "2", "1", "4", "3", "4", "3", "2", "1"].map((cell, idx) => <div
    key={idx}
    className={`h-12 rounded-xl flex items-center justify-center font-black text-lg ${cell === "?" ? "bg-amber-200 text-amber-900 border-2 border-amber-400 animate-pulse" : "bg-white text-slate-800 shadow-2xs"}`}
  >
                {cell === "?" && sudokuSelected ? sudokuSelected : cell}
              </div>)}
          </div>

          <div>
            <p className="text-xs font-bold text-slate-600 mb-2">Select the missing number for (?):</p>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4].map((num) => <button
    key={num}
    onClick={() => {
      setSudokuSelected(num);
      if (num === 1) {
        playSoundEffect(784, "triangle", 0.3);
        setTimeout(() => finishGameWithScore(98, errorsCount), 600);
      } else {
        setErrorsCount((e) => e + 1);
        playSoundEffect(260, "sawtooth", 0.2);
      }
    }}
    className="w-12 h-12 bg-white hover:bg-teal-50 border-2 border-slate-200 hover:border-[#0D7377] rounded-xl font-black text-lg text-slate-800 transition active:scale-95 cursor-pointer shadow-xs"
  >
                  {num}
                </button>)}
            </div>
          </div>

          <button
    onClick={() => finishGameWithScore(96, errorsCount)}
    className="px-6 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl cursor-pointer"
  >
            Complete Su Doku
          </button>
        </div>}

    </div>;
};
