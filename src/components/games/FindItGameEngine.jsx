import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Camera,
  CameraOff,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Volume2,
  VolumeX,
  RotateCcw,
  ArrowRight,
  Settings,
  ChevronLeft,
  Sparkles,
  Heart,
  Clock,
  FlipHorizontal,
  RefreshCw,
  ShieldCheck,
  Award,
  Smile,
  Zap,
  Info,
  Eye
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  getAvailableObjects,
  getCaregiverConfig,
  saveCaregiverConfig,
  saveFindItSession,
  speakFindItVoice
} from "../../services/findItService";
import {
  loadCocoModel,
  analyzeFrameForTarget,
  drawDetectionBox,
  clearDetectionBox,
  isModelLoading
} from "../../utils/objectDetectionEngine";
import { FindItCaregiverSuite } from "../caregiver/FindItCaregiverSuite";
import { GameCompletedResultScreen } from "./GameCompletedResultScreen";

export const FindItGameEngine = ({
  task,
  profile,
  onComplete,
  onContinue,
  onBack,
  onBackToGames,
  onOpenCaregiverSuite
}) => {
  // Game Setup & Config State
  const [config, setConfig] = useState(getCaregiverConfig());
  const [isHindi, setIsHindi] = useState(profile?.language === "hi" || config.language === "hi");
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Screen Stage: 'start' | 'permission' | 'playing' | 'association' | 'completed'
  const [stage, setStage] = useState("start");

  // Camera & Stream State
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState("environment"); // back camera preferred for pointing at objects
  const [isModelReady, setIsModelReady] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Round / Object State
  const [sessionObjects, setSessionObjects] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentObject, setCurrentObject] = useState(null);
  const [attemptsThisRound, setAttemptsThisRound] = useState(1);
  const [roundStartTime, setRoundStartTime] = useState(Date.now());
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(config.timerSeconds || 45);

  // Real-time Detection Status
  const [detectionResult, setDetectionResult] = useState({
    status: "searching", // 'searching' | 'correct' | 'wrong' | 'unclear'
    detectedLabel: null,
    confidence: 0,
    message: isHindi ? "कैमरे के सामने वस्तु दिखाएं" : "Show the object to the camera"
  });
  const [hasSuccessRound, setHasSuccessRound] = useState(false);

  // Session Results Log
  const [sessionResults, setSessionResults] = useState({
    found: [],
    skipped: [],
    wrongAttempts: 0,
    timesPerObject: []
  });

  // Refs for video, canvas & intervals
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const frameIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const isVerifyingRef = useRef(false);
  const sessionStartTimeRef = useRef(Date.now());

  // Keep Hindi toggle in sync
  useEffect(() => {
    setIsHindi(config.language === "hi" || profile?.language === "hi");
  }, [config.language, profile?.language]);

  // Preload AI model in background on mount
  useEffect(() => {
    loadCocoModel()
      .then((m) => {
        if (m) setIsModelReady(true);
      })
      .catch((err) => console.warn("Model preload notice:", err));

    return () => {
      stopCamera();
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Voice narration helper
  const speakInstruction = useCallback(
    (text, forceLang = null) => {
      if (isVoiceMuted) return;
      const lang = forceLang || (isHindi ? "hi" : "en");
      speakFindItVoice(text, lang);
    },
    [isVoiceMuted, isHindi]
  );

  // Start Camera Stream
  const startCamera = async (overrideFacing = null) => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const targetFacing = overrideFacing || facingMode;
      const constraints = {
        video: {
          facingMode: { ideal: targetFacing },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((e) => console.warn("Video play notice:", e));
        };
      }
      return true;
    } catch (err) {
      console.error("Camera access error:", err);
      // Fallback without facingMode if rear camera failed
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        streamRef.current = fallbackStream;
        setStream(fallbackStream);
        setIsCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.play().catch(() => {});
        }
        return true;
      } catch (fallbackErr) {
        setCameraError(
          isHindi
            ? "कैमरा शुरू नहीं हो सका। कृपया ब्राउज़र में कैमरा अनुमति जांचें।"
            : "Could not access camera. Please allow camera permissions in your browser."
        );
        return false;
      }
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    setIsCameraActive(false);
  };

  // Switch Front/Back Camera
  const toggleCameraFacing = async () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    if (isCameraActive) {
      await startCamera(nextMode);
    }
  };

  // Prepare and shuffle objects for the game session
  const prepareSession = () => {
    const pool = getAvailableObjects();
    // Filter by difficulty if desired or use all configured home objects
    let candidates = pool;
    if (config.difficulty === "easy") {
      const easyPool = pool.filter((o) => o.difficulty === "easy");
      candidates = easyPool.length >= 3 ? easyPool : pool;
    } else if (config.difficulty === "advanced") {
      const advPool = pool.filter((o) => o.difficulty === "advanced" || o.difficulty === "medium");
      candidates = advPool.length >= 3 ? advPool : pool;
    }

    // Shuffle and pick sessionLength (5, 10, or 15)
    const shuffled = [...candidates].sort(() => 0.5 - Math.random());
    const count = Math.min(config.sessionLength || 10, shuffled.length);
    const selected = shuffled.slice(0, count);

    setSessionObjects(selected);
    setCurrentIndex(0);
    setCurrentObject(selected[0]);
    setAttemptsThisRound(1);
    setRoundStartTime(Date.now());
    sessionStartTimeRef.current = Date.now();
    setSessionResults({
      found: [],
      skipped: [],
      wrongAttempts: 0,
      timesPerObject: []
    });
    return selected;
  };

  // Start the entire game
  const handleStartGame = async () => {
    prepareSession();
    setStage("permission");
  };

  // Confirm camera permission and enter gameplay
  const handleGrantPermission = async () => {
    const cameraOk = await startCamera();
    if (cameraOk) {
      setStage("playing");
      setRoundStartTime(Date.now());
      setTimerSecondsLeft(config.timerSeconds || 45);

      // Speak initial instruction
      const obj = sessionObjects[0];
      if (obj) {
        const spoken = isHindi
          ? `कृपया एक ${obj.hindiName} ढूंढें और कैमरे के सामने दिखाएं।`
          : `Please find a ${obj.name} and show it to the camera.`;
        speakInstruction(spoken);
      }
    }
  };

  // Process a single camera frame for object detection
  const processFrame = useCallback(async () => {
    if (isVerifyingRef.current || !videoRef.current || !currentObject || hasSuccessRound) {
      return;
    }

    isVerifyingRef.current = true;
    setIsAnalyzing(true);

    try {
      const result = await analyzeFrameForTarget(videoRef.current, currentObject, {
        difficulty: config.difficulty,
        minConfidence: config.confidenceThreshold || 0.48,
        lang: isHindi ? "hi" : "en"
      });

      // Update overlay canvas
      if (canvasRef.current && videoRef.current) {
        canvasRef.current.width = videoRef.current.videoWidth || 640;
        canvasRef.current.height = videoRef.current.videoHeight || 480;

        if (result.bbox && (result.status === "correct" || result.status === "wrong")) {
          drawDetectionBox(
            canvasRef.current,
            result.bbox,
            result.detectedLabel,
            result.status
          );
        } else {
          clearDetectionBox(canvasRef.current);
        }
      }

      setDetectionResult(result);

      // Handle outcomes
      if (result.status === "correct") {
        handleTargetFound(result);
      } else if (result.status === "wrong") {
        setAttemptsThisRound((prev) => prev + 1);
        setSessionResults((prev) => ({
          ...prev,
          wrongAttempts: prev.wrongAttempts + 1
        }));
      }
    } catch (err) {
      console.warn("Frame analysis loop catch:", err);
    } finally {
      setIsAnalyzing(false);
      isVerifyingRef.current = false;
    }
  }, [currentObject, config, isHindi, hasSuccessRound]);

  // Periodic frame verification loop during active play
  useEffect(() => {
    if (stage !== "playing" || hasSuccessRound) {
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
      return;
    }

    // Interval: analyze every 1000ms (1 frame/sec) for optimal performance and zero lag
    frameIntervalRef.current = setInterval(() => {
      processFrame();
    }, 1100);

    return () => {
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    };
  }, [stage, hasSuccessRound, processFrame]);

  // Optional Gentle Timer countdown
  useEffect(() => {
    if (stage !== "playing" || !config.timerEnabled || hasSuccessRound) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (prev <= 1) {
          // Gentle timeout notice, no penalty
          const timeoutMsg = isHindi
            ? "समय पूरा हुआ, लेकिन चिंता न करें! आप ढूंढते रह सकते हैं या आगे बढ़ सकते हैं।"
            : "Time is up, but no rush! Keep looking or feel free to skip.";
          setDetectionResult((d) => ({ ...d, message: timeoutMsg }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [stage, config.timerEnabled, hasSuccessRound, isHindi]);

  // Successfully detected target
  const handleTargetFound = (res) => {
    setHasSuccessRound(true);
    const searchSeconds = Math.round((Date.now() - roundStartTime) / 1000);

    // Confetti celebration
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    // Spoken feedback
    const praiseText = isHindi
      ? `शाबाश! आपने ${currentObject.hindiName} ढूंढ ली!`
      : `Excellent! You found the ${currentObject.name}!`;
    speakInstruction(praiseText);

    // Record finding
    setSessionResults((prev) => ({
      ...prev,
      found: [...prev.found, currentObject.name],
      timesPerObject: [...prev.timesPerObject, searchSeconds]
    }));

    // Advance to next object after pleasant celebration delay
    setTimeout(() => {
      advanceToNextObject();
    }, 2000);
  };

  // Skip Object handler (Non-punitive)
  const handleSkipObject = () => {
    const skipMsg = isHindi
      ? "कोई बात नहीं! आइए कुछ और ढूंढते हैं।"
      : "That's okay! Let's try something else.";
    speakInstruction(skipMsg);

    setSessionResults((prev) => ({
      ...prev,
      skipped: [...prev.skipped, currentObject?.name || "Object"]
    }));

    advanceToNextObject();
  };

  // Advance to next object in sequence or complete game
  const advanceToNextObject = () => {
    clearDetectionBox(canvasRef.current);
    setHasSuccessRound(false);

    const nextIndex = currentIndex + 1;
    if (nextIndex < sessionObjects.length) {
      setCurrentIndex(nextIndex);
      const nextObj = sessionObjects[nextIndex];
      setCurrentObject(nextObj);
      setAttemptsThisRound(1);
      setRoundStartTime(Date.now());
      setTimerSecondsLeft(config.timerSeconds || 45);
      setDetectionResult({
        status: "searching",
        detectedLabel: null,
        confidence: 0,
        message: isHindi
          ? `कृपया एक ${nextObj.hindiName} ढूंढें और कैमरे के सामने दिखाएं।`
          : `Please find a ${nextObj.name} and show it to the camera.`
      });

      // Speak instruction for new object
      setTimeout(() => {
        const spoken = isHindi
          ? `कृपया एक ${nextObj.hindiName} ढूंढें और कैमरे के सामने दिखाएं।`
          : `Please find a ${nextObj.name} and show it to the camera.`;
        speakInstruction(spoken);
      }, 400);
    } else {
      handleCompleteSession();
    }
  };

  // Complete session & save analytics
  const handleCompleteSession = () => {
    stopCamera();
    setStage("completed");

    const durationSec = Math.round((Date.now() - sessionStartTimeRef.current) / 1000);
    const avgSec = sessionResults.timesPerObject.length
      ? Math.round(
          sessionResults.timesPerObject.reduce((a, b) => a + b, 0) /
            sessionResults.timesPerObject.length
        )
      : 18;

    const savedRecord = saveFindItSession({
      totalRequested: sessionObjects.length,
      foundCount: sessionResults.found.length,
      skippedCount: sessionResults.skipped.length,
      incorrectCount: sessionResults.wrongAttempts,
      attemptsCount: sessionResults.found.length + sessionResults.wrongAttempts,
      averageSeconds: avgSec,
      durationSeconds: durationSec,
      difficulty: config.difficulty,
      foundObjects: sessionResults.found,
      skippedObjects: sessionResults.skipped
    });

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch (e) {}

    const completionSpoken = isHindi
      ? "बहुत बढ़िया! आपने आज की गतिविधि पूरी कर ली है।"
      : "Wonderful job! You have completed today's object hunting activity.";
    speakInstruction(completionSpoken);

    if (onComplete && savedRecord) {
      onComplete(savedRecord.id, Math.max(85, Math.round((sessionResults.found.length / sessionObjects.length) * 100)));
    }
  };

  // Manual one-click verification check
  const handleManualCheck = () => {
    processFrame();
  };

  // Replay instruction voice
  const handleReplayInstruction = () => {
    if (!currentObject) return;
    const spoken = isHindi
      ? `कृपया एक ${currentObject.hindiName} ढूंढें और कैमरे के सामने दिखाएं। ${currentObject.hindiTip || ""}`
      : `Please find a ${currentObject.name} and show it to the camera. ${currentObject.tip || ""}`;
    speakInstruction(spoken);
  };

  // ================= 1. START SCREEN =================
  if (stage === "start") {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 space-y-5 animate-fade-in">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 text-xs font-bold transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{isHindi ? "वापस जाएं" : "Back to Games"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsHindi(!isHindi)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer"
            >
              {isHindi ? "English" : "हिन्दी"}
            </button>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer"
              title="Caregiver Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-amber-50/40 border border-emerald-200 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-600 text-white text-4xl shadow-md mx-auto">
            🔎
          </div>

          <div className="space-y-1.5">
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full uppercase tracking-wider">
              {isHindi ? "वास्तविक वस्तु खोज खेल" : "Real-World Object Hunt"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isHindi ? "ढूंढो और दिखाओ! (FIND IT!)" : "FIND IT!"}
            </h1>
            <p className="text-sm sm:text-base font-bold text-emerald-800">
              {isHindi ? "अपने आस-पास रोज़मर्रा की वस्तुएं ढूंढें" : "Find everyday objects around you"}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            {isHindi
              ? "अपने कमरे या घर में चारों ओर देखें, स्क्रीन पर दिखाई गई वस्तु को ढूंढें, और उसे कैमरे के सामने दिखाएं।"
              : "Look around your surroundings, find the object shown on the screen, and show it to the camera."}
          </p>

          {/* Quick Features Preview */}
          <div className="grid grid-cols-3 gap-2 pt-2 max-w-md mx-auto text-left">
            <div className="p-2.5 bg-white/80 border border-emerald-100 rounded-2xl">
              <div className="text-base">🥄</div>
              <div className="text-[11px] font-bold text-slate-900 mt-1">
                {isHindi ? "सरल वस्तुएं" : "Simple Objects"}
              </div>
              <div className="text-[10px] text-slate-500">
                {isHindi ? "चम्मच, कप, किताब" : "Cups, spoons, books"}
              </div>
            </div>
            <div className="p-2.5 bg-white/80 border border-emerald-100 rounded-2xl">
              <div className="text-base">📷</div>
              <div className="text-[11px] font-bold text-slate-900 mt-1">
                {isHindi ? "कैमरा पहचान" : "AI Vision"}
              </div>
              <div className="text-[10px] text-slate-500">
                {isHindi ? "स्वचालित पहचान" : "Checks your object"}
              </div>
            </div>
            <div className="p-2.5 bg-white/80 border border-emerald-100 rounded-2xl">
              <div className="text-base">⏭️</div>
              <div className="text-[11px] font-bold text-slate-900 mt-1">
                {isHindi ? "कोई दबाव नहीं" : "Zero Pressure"}
              </div>
              <div className="text-[10px] text-slate-500">
                {isHindi ? "कभी भी छोड़ सकते हैं" : "Skip anytime safely"}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleStartGame}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-base shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isHindi ? "▶ खेल शुरू करें" : "▶ Start Game"}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="w-full sm:w-auto px-5 py-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-2xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>{isHindi ? "⚙ सेटिंग्स & घर की वस्तुएं" : "⚙ Settings & Home Objects"}</span>
            </button>
          </div>
        </div>

        {/* Privacy & Reassurance Banner */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
          <span>
            {isHindi
              ? "गोपनीयता सूचना: आपका कैमरा केवल ऑन-डिवाइस वस्तु पहचानने के लिए उपयोग किया जाता है। कोई वीडियो रिकॉर्डिंग कभी सहेजी नहीं जाती।"
              : "Privacy Assurance: Camera processing is performed strictly on-device to check the object you find. No footage is permanently recorded."}
          </span>
        </div>

        {/* Caregiver Settings Suite Modal */}
        <FindItCaregiverSuite
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSave={(newCfg) => setConfig(newCfg)}
        />
      </div>
    );
  }

  // ================= 2. CAMERA PERMISSION REQUEST SCREEN =================
  if (stage === "permission") {
    return (
      <div className="w-full max-w-lg mx-auto p-4 sm:p-6 space-y-5 animate-fade-in">
        <button
          type="button"
          onClick={() => setStage("start")}
          className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 text-xs font-bold transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{isHindi ? "वापस" : "Back"}</span>
        </button>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-700 flex items-center justify-center text-3xl mx-auto border border-teal-200">
            📷
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900">
              {isHindi ? "कैमरा अनुमति की आवश्यकता" : "Camera Access Needed"}
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-600">
              {isHindi
                ? "हमें आपके कैमरे की आवश्यकता है ताकि हम आपके द्वारा ढूंढी गई वस्तु की जांच कर सकें।"
                : "We need access to your camera so we can check the object you find."}
            </p>
          </div>

          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 text-left space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{isHindi ? "यह कैसे काम करता है:" : "How it works:"}</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {isHindi
                ? "1. कैमरा स्क्रीन पर चालू होगा। 2. आप वस्तु को कैमरे के सामने पकड़ें। 3. एआई उसे देखकर बता देगा कि सही वस्तु मिल गई है।"
                : "1. The camera will turn on. 2. Hold the requested object in front of the lens. 3. The AI verifies and celebrates your success!"}
            </p>
          </div>

          {cameraError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleGrantPermission}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              <span>{isHindi ? "कैमरा चालू करें और खेलें" : "Allow Camera & Begin"}</span>
            </button>

            <button
              type="button"
              onClick={() => setStage("start")}
              className="w-full py-2.5 text-xs text-slate-500 font-bold hover:text-slate-800 cursor-pointer"
            >
              {isHindi ? "बाद में करें" : "Not now"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= 3. ACTIVE GAME SCREEN =================
  if (stage === "playing" && currentObject) {
    const totalCount = sessionObjects.length;
    const progressPercent = Math.round(((currentIndex + 1) / totalCount) * 100);

    return (
      <div className="w-full max-w-2xl mx-auto p-3 sm:p-5 space-y-4 animate-fade-in pb-12">
        {/* Top Header & Progress */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onBack}
                className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                title="Exit Game"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                  {isHindi ? "ढूंढो और दिखाओ" : "FIND IT!"}
                </span>
                <h3 className="text-xs sm:text-sm font-black text-slate-900">
                  {isHindi
                    ? `वस्तु ${currentIndex + 1} / ${totalCount}`
                    : `Object ${currentIndex + 1} of ${totalCount}`}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Voice playback button */}
              <button
                type="button"
                onClick={handleReplayInstruction}
                className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition cursor-pointer"
                title="Hear instruction again"
              >
                <Volume2 className="w-4 h-4 text-teal-600" />
              </button>

              {/* Mute toggle */}
              <button
                type="button"
                onClick={() => setIsVoiceMuted(!isVoiceMuted)}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  isVoiceMuted
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
                title={isVoiceMuted ? "Unmute voice" : "Mute voice"}
              >
                {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Flip camera */}
              <button
                type="button"
                onClick={toggleCameraFacing}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition cursor-pointer"
                title="Switch Front/Back Camera"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Center Target Object Card */}
        <div className="bg-white border-2 border-emerald-300 rounded-3xl p-4 sm:p-5 shadow-sm text-center space-y-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold">
              <span>{currentObject.iconEmoji}</span>
              <span>{currentObject.category?.toUpperCase()}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isHindi
                ? `🔎 एक ${currentObject.hindiName} ढूंढें`
                : `🔎 Find a ${currentObject.name.toUpperCase()}`}
            </h1>
          </div>

          {/* Reference Image */}
          <div className="relative inline-block mx-auto">
            <img
              src={currentObject.imageUrl}
              alt={currentObject.name}
              className="w-36 h-36 sm:w-44 sm:h-44 object-cover rounded-2xl border-2 border-slate-200 shadow-xs mx-auto"
            />
            <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold rounded-md">
              Reference
            </span>
          </div>

          {/* Under image instruction */}
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-extrabold text-slate-800">
              {isHindi
                ? `एक ${currentObject.hindiName} ढूंढें और कैमरे के सामने दिखाएं।`
                : `Find a ${currentObject.name.toLowerCase()} and show it to the camera.`}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              {isHindi
                ? currentObject.hindiTip || "आराम से ढूंढें, कोई जल्दी नहीं है।"
                : currentObject.tip || "Take your time. There is no rush."}
            </p>
          </div>
        </div>

        {/* Live Camera View with Detection Overlay */}
        <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-md relative">
          <div className="relative aspect-video sm:aspect-4/3 w-full bg-black flex items-center justify-center">
            {/* Native Video Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Canvas overlay for drawing AI bounding boxes */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />

            {/* Subtle Viewfinder Guide */}
            <div className="absolute inset-6 sm:inset-10 border-2 border-dashed border-white/40 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
              <div className="flex justify-between text-[10px] text-white/70 font-bold bg-black/30 px-2 py-1 rounded w-fit">
                📷 {isHindi ? "वस्तु यहाँ दिखाएं" : "Show the object here"}
              </div>
              <div className="text-right text-[10px] text-white/70">
                {isAnalyzing && (
                  <span className="inline-flex items-center gap-1 bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    AI Analyzing
                  </span>
                )}
              </div>
            </div>

            {/* Status Flash Banner on Camera */}
            {hasSuccessRound && (
              <div className="absolute inset-0 bg-emerald-900/75 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-white text-center animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-3xl shadow-lg mb-2">
                  ✅
                </div>
                <h3 className="text-xl sm:text-2xl font-black">
                  {isHindi ? "शाबाश! आपने ढूंढ लिया!" : "CORRECT! GREAT JOB!"}
                </h3>
                <p className="text-sm font-semibold text-emerald-100 mt-1">
                  {detectionResult.message}
                </p>
              </div>
            )}
          </div>

          {/* Feedback bar directly below camera */}
          <div className="p-3 bg-slate-800 text-white flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              {detectionResult.status === "correct" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : detectionResult.status === "wrong" ? (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              ) : (
                <Eye className="w-5 h-5 text-teal-400 shrink-0" />
              )}
              <span className="font-bold truncate text-slate-200">
                {detectionResult.message}
              </span>
            </div>

            {/* Quick manual snapshot trigger button */}
            <button
              type="button"
              onClick={handleManualCheck}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-bold shrink-0 transition active:scale-95 cursor-pointer"
              title="Manually verify current camera view"
            >
              {isHindi ? "जांचें" : "Check Now"}
            </button>
          </div>
        </div>

        {/* Action Controls: Skip & Reassurances */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="text-xs text-slate-500 font-medium">
            {config.timerEnabled ? (
              <span className="inline-flex items-center gap-1 font-bold text-slate-700">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {timerSecondsLeft}s
              </span>
            ) : (
              <span>{isHindi ? "आराम से ढूंढें, कोई समय सीमा नहीं है।" : "Take your time. There's no rush."}</span>
            )}
          </div>

          {/* Skip Button - prominent, encouraging, non-punitive */}
          <button
            type="button"
            onClick={handleSkipObject}
            className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-2xl font-bold text-xs sm:text-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>⏭️ {isHindi ? "नहीं मिल रहा? आगे बढ़ें" : "Can't Find It? Skip"}</span>
          </button>
        </div>
      </div>
    );
  }

  // ================= 4. COMPLETION SCREEN =================
  if (stage === "completed") {
    const foundCount = sessionResults.found.length;
    const skippedCount = sessionResults.skipped.length;
    const totalAttempted = Math.max(1, foundCount + skippedCount);
    const scorePct = Math.max(65, Math.min(100, Math.round((foundCount / totalAttempted) * 100)));
    const totalElapsedSeconds = Math.max(
      1,
      Math.round((Date.now() - sessionStartTimeRef.current) / 1000)
    );

    return (
      <GameCompletedResultScreen
        gameTitle={task?.title || (isHindi ? "वस्तु खोज खेल (Find It)" : "Find It Object Hunt")}
        score={scorePct}
        maxScore={100}
        timeSeconds={totalElapsedSeconds}
        accuracy={scorePct}
        correctCount={foundCount}
        totalQuestions={totalAttempted}
        taskId={task?.id || "game-find-it"}
        profile={profile}
        onContinue={onContinue || onBackToGames || onBack}
        onReplay={() => {
          setStage("start");
          setSessionResults({ found: [], skipped: [], timesPerObject: [], wrongAttempts: 0 });
          setCurrentTargetIndex(0);
          setTimerSecondsLeft(config.timerDurationSeconds);
        }}
        onBackToGames={onBackToGames || onBack}
        customMessage={
          isHindi
            ? `शानदार अवलोकन! आपने ${foundCount} वस्तुएं पहचानीं। आपकी ध्यान और पहचान क्षमता आज बहुत मजबूत रही।`
            : undefined
        }
      />
    );
  }

  return null;
};
