import React, { useEffect, useState } from "react";
import {
  Trophy,
  Clock,
  CheckCircle2,
  Award,
  ArrowRight,
  RotateCcw,
  LayoutGrid,
  Star,
  Sparkles
} from "lucide-react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { RobotAvatar } from "../common/GraphicAssets";

/**
 * Dedicated Game Completed Result Screen
 * Designed specifically for elderly players:
 * - Clear, calm, rewarding visual celebration with checkmark
 * - Large readable typography and prominent metrics
 * - Displays Final Score, Time Taken, Accuracy / Correct Answers, Best Score
 * - Encouraging messages tailored to performance
 * - Large, separated action buttons: Continue →, Replay ↻, Back to Games
 */
export const GameCompletedResultScreen = ({
  gameTitle = "Game",
  score = 90,
  maxScore = 100,
  timeSeconds = 60,
  accuracy = 95,
  correctCount = null,
  totalQuestions = null,
  errorsCount = 0,
  taskId = null,
  profile = {},
  hasNextTask = true,
  onContinue,
  onReplay,
  onBackToGames,
  customMessage = null
}) => {
  const isHindi = profile?.language === "hi";

  // Calculate previous best score from localStorage before updating
  const [previousBest, setPreviousBest] = useState(() => {
    try {
      const storageKey = taskId ? `smriti_best_score_${taskId}` : null;
      return storageKey ? parseInt(localStorage.getItem(storageKey) || "0", 10) : 0;
    } catch {
      return 0;
    }
  });

  const [bestScore, setBestScore] = useState(() => {
    try {
      const storageKey = taskId ? `smriti_best_score_${taskId}` : null;
      const prevStored = storageKey ? parseInt(localStorage.getItem(storageKey) || "0", 10) : 0;
      return Math.max(prevStored, score);
    } catch {
      return score;
    }
  });

  const [isNewBest, setIsNewBest] = useState(() => {
    try {
      const storageKey = taskId ? `smriti_best_score_${taskId}` : null;
      const prevStored = storageKey ? parseInt(localStorage.getItem(storageKey) || "0", 10) : 0;
      return prevStored > 0 && score > prevStored;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    // Fire gentle celebration once
    try {
      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#0D7377", "#14FFEC", "#10B981", "#F59E0B"]
      });
    } catch {
      // ignore
    }

    // Best Score & History persistence
    if (taskId) {
      try {
        const storageKey = `smriti_best_score_${taskId}`;
        const prevStored = parseInt(localStorage.getItem(storageKey) || "0", 10);
        setPreviousBest(prevStored);
        if (prevStored > 0 && score > prevStored) {
          setIsNewBest(true);
        }
        const newBest = Math.max(prevStored, score);
        setBestScore(newBest);
        localStorage.setItem(storageKey, String(newBest));

        // Save session history
        const rawHistory = localStorage.getItem("smriti_game_history");
        const history = rawHistory ? JSON.parse(rawHistory) : [];
        history.unshift({
          taskId,
          gameTitle,
          score,
          accuracy,
          timeSeconds,
          completedAt: new Date().toISOString()
        });
        localStorage.setItem("smriti_game_history", JSON.stringify(history.slice(0, 50)));

        // Update overall player statistics
        const rawStats = localStorage.getItem("smriti_player_stats");
        const stats = rawStats ? JSON.parse(rawStats) : { gamesPlayed: 0, totalScore: 0, bestOverall: 0, totalTimeSec: 0 };
        stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
        stats.totalScore = (stats.totalScore || 0) + score;
        stats.bestOverall = Math.max(stats.bestOverall || 0, score);
        stats.totalTimeSec = (stats.totalTimeSec || 0) + timeSeconds;
        stats.lastPlayed = new Date().toISOString();
        localStorage.setItem("smriti_player_stats", JSON.stringify(stats));
      } catch (err) {
        console.warn("Could not save game history", err);
      }
    }
  }, [taskId, score, accuracy, timeSeconds, gameTitle]);

  // Format Time display
  const formatTime = (totalSec) => {
    const s = Math.max(0, Math.round(totalSec));
    const mins = Math.floor(s / 60);
    const remainder = s % 60;
    if (mins > 0) {
      return `${mins}m ${remainder}s`;
    }
    return `${remainder}s`;
  };

  // Dynamic encouraging messages based on performance
  const getEncouragement = (val) => {
    if (val >= 90) {
      return {
        badge: isHindi ? "अद्भुत प्रदर्शन" : "Outstanding",
        title: isHindi ? "शाबाश! बहुत बढ़िया!" : "Well Done!",
        subtitle: isHindi ? "खेल सफलतापूर्वक पूरा हुआ" : "Game Completed!",
        message: isHindi ? "आपने बहुत ही शानदार प्रदर्शन किया!" : "You did wonderfully!",
        detail: isHindi
          ? "आज आपकी याददाश्त और एकाग्रता उत्कृष्ट रही।"
          : "Your memory, speed, and focus were exceptional today."
      };
    } else if (val >= 75) {
      return {
        badge: isHindi ? "सराहनीय काम" : "Great Job",
        title: isHindi ? "बहुत अच्छा काम!" : "Well Done!",
        subtitle: isHindi ? "खेल पूरा हुआ" : "Game Completed!",
        message: isHindi ? "बहुत अच्छा काम किया!" : "Great job!",
        detail: isHindi
          ? "आपकी संज्ञानात्मक क्षमता बहुत अच्छी तरह से सक्रिय है। अभ्यास जारी रखें।"
          : "You showed wonderful attention and memory recall throughout the game."
      };
    } else if (val >= 60) {
      return {
        badge: isHindi ? "अच्छा प्रयास" : "Nice Work",
        title: isHindi ? "अच्छा काम!" : "Well Done!",
        subtitle: isHindi ? "खेल पूरा हुआ" : "Game Completed!",
        message: isHindi ? "अच्छा काम! अभ्यास जारी रखें।" : "Nice work! Keep practicing.",
        detail: isHindi
          ? "प्रत्येक सत्र के साथ आपकी याददाश्त और पहचान गति में सुधार हो रहा है।"
          : "Every session strengthens your memory recall and focus."
      };
    } else {
      return {
        badge: isHindi ? "प्रयास जारी रखें" : "Good Effort",
        title: isHindi ? "सराहनीय प्रयास!" : "Game Completed!",
        subtitle: isHindi ? "खेल पूरा हुआ" : "Game Completed!",
        message: isHindi
          ? "अच्छा प्रयास! अपना स्कोर सुधारने के लिए फिर से प्रयास करें।"
          : "Good effort! Try again to improve your score.",
        detail: isHindi
          ? "थोड़ा विश्राम लें और जब भी आप तैयार हों, फिर से खेलें।"
          : "Take a deep breath and feel free to replay anytime to improve."
      };
    }
  };

  const encouragement = getEncouragement(score);

  return (
    <div
      id="game-completed-screen"
      className="w-full max-w-xl mx-auto px-4 py-6 sm:py-10 animate-fade-in text-center"
      role="region"
      aria-label="Game Results"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-9 shadow-xl border border-[#0D7377]/20 relative overflow-hidden">
        {/* Soft background glow decoration */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-teal-50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-emerald-50 rounded-full blur-2xl pointer-events-none" />

        {/* 1. Friendly Success Animation / Checkmark */}
        <div className="relative mb-5 flex justify-center">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-100/90 border-4 border-emerald-300 flex items-center justify-center text-emerald-700 shadow-lg relative"
          >
            <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 stroke-[2.4] text-emerald-600" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 16, ease: "linear" }}
              className="absolute -inset-1.5 rounded-full border-2 border-dashed border-emerald-400/40 pointer-events-none"
            />
          </motion.div>
        </div>

        {/* 2. Clear Header Message */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs sm:text-sm font-extrabold uppercase tracking-wide bg-[#EAF6F4] text-[#0D7377] mb-2 border border-[#0D7377]/20">
            <Sparkles className="w-4 h-4 text-[#0D7377]" />
            {encouragement.subtitle}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#132A2F] tracking-tight mb-1 font-display">
            {encouragement.title}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium max-w-md mx-auto">
            {gameTitle}
          </p>
        </div>

        {/* 3. Core Performance Metrics Grid (Score, Time, Accuracy, Best Score) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-6">
          {/* Final Score */}
          <div className="bg-[#F3F8F7] p-3.5 sm:p-4 rounded-2xl border border-[#0D7377]/15 flex flex-col items-center justify-center text-center shadow-xs">
            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>{isHindi ? "अंतिम स्कोर" : "Final Score"}</span>
            </div>
            <span className="text-2xl sm:text-3xl font-black text-[#0D7377]">
              {score}%
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-teal-700 mt-0.5">
              {score >= 90 ? "⭐⭐⭐" : score >= 75 ? "⭐⭐" : "⭐"}
            </span>
          </div>

          {/* Time Taken */}
          <div className="bg-[#F3F8F7] p-3.5 sm:p-4 rounded-2xl border border-[#0D7377]/15 flex flex-col items-center justify-center text-center shadow-xs">
            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>{isHindi ? "समय लिया" : "Time Taken"}</span>
            </div>
            <span className="text-2xl sm:text-3xl font-black text-[#132A2F]">
              {formatTime(timeSeconds)}
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 mt-0.5">
              {isHindi ? "सत्र समय" : "Duration"}
            </span>
          </div>

          {/* Accuracy / Correct Answers */}
          <div className="bg-[#F3F8F7] p-3.5 sm:p-4 rounded-2xl border border-[#0D7377]/15 flex flex-col items-center justify-center text-center shadow-xs">
            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isHindi ? "सटीकता" : "Accuracy"}</span>
            </div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">
              {accuracy}%
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-600 mt-0.5">
              {correctCount !== null && totalQuestions !== null
                ? `${correctCount}/${totalQuestions} ${isHindi ? "सही" : "Correct"}`
                : errorsCount === 0
                ? isHindi ? "0 त्रुटि" : "No errors"
                : `${errorsCount} ${isHindi ? "त्रुटि" : "mistakes"}`}
            </span>
          </div>

          {/* Best Score */}
          <div className="bg-[#F3F8F7] p-3.5 sm:p-4 rounded-2xl border border-[#0D7377]/15 flex flex-col items-center justify-center text-center relative shadow-xs">
            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>{isHindi ? "सर्वश्रेष्ठ" : "Best Score"}</span>
            </div>
            <span className="text-2xl sm:text-3xl font-black text-amber-700">
              {bestScore}%
            </span>
            <span className="text-[10px] sm:text-[11px] font-extrabold mt-0.5">
              {isNewBest ? (
                <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full font-bold">
                  {isHindi
                    ? previousBest > 0
                      ? `नया रिकॉर्ड! (पिछला ${previousBest}%)`
                      : "नया रिकॉर्ड! ⭐"
                    : previousBest > 0
                    ? `New Best! (Prev: ${previousBest}%)`
                    : "New Best! ⭐"}
                </span>
              ) : previousBest > 0 ? (
                <span className="text-slate-600 font-bold">
                  {isHindi ? `पिछला बेस्ट: ${previousBest}%` : `Prev Best: ${previousBest}%`}
                </span>
              ) : (
                <span className="text-amber-700 font-bold">
                  {isHindi ? "व्यक्तिगत रिकॉर्ड" : "Personal Best"}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* 4. Encouraging Message from AI Companion */}
        <div className="bg-[#EAF6F4] rounded-2xl p-4 sm:p-5 border border-[#0D7377]/25 text-left mb-7 flex items-start gap-3.5 shadow-xs">
          <RobotAvatar size="w-11 h-11" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-black text-[#0D7377] uppercase tracking-wider">
                {isHindi ? "स्मृति साथी AI प्रोत्साहन" : "Smriti Saathi Companion"}
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-sm sm:text-base text-[#132A2F] font-medium leading-relaxed">
              "{customMessage || encouragement.message}"
            </p>
          </div>
        </div>

        {/* 5. Action Buttons (Large, clearly separated, elderly-friendly) */}
        <div className="space-y-3">
          {/* 1. Continue → (Takes player to next activity or back to games) */}
          <button
            id="game-btn-continue"
            type="button"
            onClick={onContinue || onBackToGames}
            className="w-full py-4 px-6 rounded-2xl bg-[#0D7377] hover:bg-[#0A5C5F] active:scale-[0.98] text-white font-extrabold text-lg shadow-md transition flex items-center justify-center gap-3 cursor-pointer min-h-[54px]"
          >
            <span>
              {hasNextTask
                ? isHindi
                  ? "अगली गतिविधि → (Continue)"
                  : "Continue to Next Activity →"
                : isHindi
                ? "आगे बढ़ें → (Continue)"
                : "Continue →"}
            </span>
            <ArrowRight className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Row of Replay ↻ and Back to Games */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 2. Replay ↻ (Immediately restarts the same game from beginning) */}
            <button
              id="game-btn-replay"
              type="button"
              onClick={onReplay}
              className="w-full py-3.5 px-5 rounded-2xl bg-white border-2 border-[#0D7377]/35 hover:bg-[#EAF6F4] hover:border-[#0D7377] active:scale-[0.98] text-[#0D7377] font-extrabold text-base shadow-xs transition flex items-center justify-center gap-2.5 cursor-pointer min-h-[48px]"
            >
              <RotateCcw className="w-5 h-5 stroke-[2.3]" />
              <span>{isHindi ? "फिर से खेलें ↻ (Replay)" : "Replay ↻"}</span>
            </button>

            {/* 3. Back to Games (Returns to main Games screen) */}
            <button
              id="game-btn-back-to-games"
              type="button"
              onClick={onBackToGames}
              className="w-full py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 active:scale-[0.98] text-slate-800 font-extrabold text-base shadow-xs transition flex items-center justify-center gap-2.5 cursor-pointer min-h-[48px]"
            >
              <LayoutGrid className="w-5 h-5 text-slate-600 stroke-[2.2]" />
              <span>{isHindi ? "खेल सूची (Back to Games)" : "Back to Games"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
