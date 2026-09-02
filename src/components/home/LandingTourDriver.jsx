/**
 * LandingTourDriver.jsx — Guided onboarding tour for the Landing Home page.
 *
 * Works on the 6 category cards (#cat-1 … #cat-6) inside HomeCategories.
 * On Skip: marks step as pending and advances to next card.
 * On Start: marks step as done, launches the game, advances.
 * Calls onSkippedChange(stepIndex) and onCompletedChange(stepIndex) so
 * the parent can push skipped steps into the notification bell.
 *
 * Props:
 *   language           {string}   — "hi" | "en" | "as" | "mni" | "nag"
 *   onLaunchGame       {fn}       — (gameTitle: string) => void
 *   onSkippedChange    {fn}       — (skippedSet: Set<number>) => void
 *   onCompletedChange  {fn}       — (completedSet: Set<number>) => void
 *   onTourDone         {fn}       — () => void  called when all 6 steps done/skipped
 */

import { useEffect, useReducer, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Volume2, SkipForward, Play, X, PartyPopper } from "lucide-react";
import confetti from "canvas-confetti";
import { TOUR_INSTRUCTIONS, TASK_NAMES } from "../../data/tourData";
import "../patient/TourDriver.css";

// ─── Module-scoped lifecycle flag ─────────────────────────────────────────────
// Resets ONLY when the whole website is refreshed (full browser reload).
// Persists during client-side SPA navigation so switching pages does NOT re-trigger the tutorial.
let hasHandledHomeTourThisPageLoad = false;

const LANDING_SEEN_KEY     = "sih_landing_tour_seen";
const LANDING_PROGRESS_KEY = "sih_landing_tour_progress";
const LANDING_SKIPPED_KEY  = "sih_landing_tour_skipped";

function readStorage() {
  let progress = [], skipped = [];
  try {
    const p = localStorage.getItem(LANDING_PROGRESS_KEY);
    if (p) { const arr = JSON.parse(p); if (Array.isArray(arr)) progress = arr; }
  } catch (_) {}
  try {
    const s = localStorage.getItem(LANDING_SKIPPED_KEY);
    if (s) { const arr = JSON.parse(s); if (Array.isArray(arr)) skipped = arr; }
  } catch (_) {}
  return { progress, skipped };
}

function writeStorage(progress, skipped) {
  try {
    localStorage.setItem(LANDING_PROGRESS_KEY, JSON.stringify(progress));
    localStorage.setItem(LANDING_SKIPPED_KEY, JSON.stringify(skipped));
  } catch (_) {}
}

function findNext(progress) {
  for (let i = 1; i <= 6; i++) if (!progress.includes(i)) return i;
  return null;
}

// ─── BCP-47 map ────────────────────────────────────────────────────────────────
const LANG_BCP47 = { hi: "hi-IN", en: "en-US", as: "as-IN", mni: "bn-IN", nag: "en-IN" };

function speak(text, lang) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  // Strip emoji
  const clean = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{FE00}-\u{FEFF}]/gu, "").trim();
  const bcp47 = LANG_BCP47[lang] || "en-US";
  const utt = new SpeechSynthesisUtterance(clean);
  utt.lang = bcp47;
  utt.rate = 0.88;
  utt.pitch = 1.0;
  const voices = window.speechSynthesis.getVoices();
  const v = voices.find(v => v.lang === bcp47) || voices.find(v => v.lang.startsWith(bcp47.slice(0,2)));
  if (v) utt.voice = v;
  window.speechSynthesis.speak(utt);
}

function stopSpeak() { if (window.speechSynthesis) window.speechSynthesis.cancel(); }

function positionTooltip(stepIndex) {
  const W = 300, H = 220, M = 12, G = 8;
  const el = document.getElementById("cat-" + stepIndex);
  if (!el) return { top: 120, left: 16 };
  const r = el.getBoundingClientRect();
  const vH = window.innerHeight, vW = window.innerWidth;
  const scrollY = window.scrollY || 0;
  const top = r.bottom + H + M < vH
    ? r.bottom + M + scrollY
    : r.top - H - M + scrollY;
  const left = Math.max(G, Math.min(r.left + r.width / 2 - W / 2, vW - W - G));
  return { top, left };
}

function clearHighlights() {
  for (let i = 1; i <= 6; i++) {
    const el = document.getElementById("cat-" + i);
    if (el) el.classList.remove("tour-highlight");
  }
}

function getInstruction(step, lang) {
  const d = TOUR_INSTRUCTIONS[step];
  if (!d) return { title: "", desc: "" };
  return d[lang] ?? d["en"] ?? { title: "", desc: "" };
}

// Step badge label by language
function stepLabel(lang) {
  if (lang === "hi") return "चरण";
  if (lang === "as") return "পদক্ষেপ";
  return "Step";
}
function voiceBtnLabel(lang) {
  if (lang === "hi") return "आवाज़ लें";
  if (lang === "as") return "শুনক";
  return "Listen";
}
function skipLabel(lang) {
  if (lang === "hi") return "छोड़ें";
  if (lang === "as") return "এৰক";
  return "Skip";
}
function startLabel(lang) {
  if (lang === "hi") return "शुरू करें";
  if (lang === "as") return "আৰম্ভ কৰক";
  return "Start Activity";
}

// ─── Reducer ─────────────────────────────────────────────────────────────────
const init = {
  activeStep: null,
  progress: [],
  skipped: [],
  visible: false,
  showCelebration: false,
  tooltipStyle: { top: 120, left: 16 },
  panelOpen: true,
};

function reducer(s, a) {
  switch (a.type) {
    case "INIT": return { ...s, ...a.payload };
    case "TOOLTIP": return { ...s, tooltipStyle: a.style };
    case "ADVANCE": return {
      ...s,
      activeStep: a.nextStep,
      progress: a.progress,
      skipped: a.skipped,
      visible: a.nextStep !== null,
      showCelebration: a.nextStep === null && a.allDone,
      panelOpen: true,
    };
    case "DISMISS": return { ...s, visible: false, activeStep: null, panelOpen: false, showCelebration: false };
    case "CLOSE_CELEBRATION": return { ...s, showCelebration: false, panelOpen: false };
    case "CLOSE_PANEL": return { ...s, panelOpen: false };
    default: return s;
  }
}

// ─── Component ───────────────────────────────────────────────────────────────
export function LandingTourDriver({
  language = "en",
  onLaunchGame,
  onSkippedChange,
  onCompletedChange,
  onTourDone,
  showTour = false,
}) {
  const [state, dispatch] = useReducer(reducer, init);
  const roRef = useRef(null);
  const timerRef = useRef(null);

  // Mount logic:
  // - Resets only on full website refresh (browser reload) because hasHandledHomeTourThisPageLoad is an in-memory flag
  // - Does NOT re-trigger when switching pages/tabs
  // - Re-runs if showTour prop is explicitly passed as true (e.g. user clicked App Tutorial button)
  useEffect(() => {
    // Clear legacy localStorage key if present
    try {
      localStorage.removeItem(LANDING_SEEN_KEY);
    } catch (_) {}

    // If tour was already handled/dismissed in this page load and user didn't explicitly request via showTour, stay hidden
    if (hasHandledHomeTourThisPageLoad && !showTour) {
      dispatch({
        type: "INIT",
        payload: {
          progress: [],
          skipped: [],
          activeStep: null,
          showCelebration: false,
          visible: false,
        },
      });
      return;
    }

    const { progress, skipped } = readStorage();
    onCompletedChange?.(new Set(progress));
    onSkippedChange?.(new Set(skipped));

    // Show tutorial starting at step 1 on fresh page load or explicit trigger
    const nextStep = 1;
    dispatch({
      type: "INIT",
      payload: {
        progress,
        skipped,
        activeStep: nextStep,
        showCelebration: false,
        visible: true,
      },
    });
  }, [showTour]);

  // Step change → highlight + tooltip + voice
  useEffect(() => {
    if (!state.activeStep) return;
    clearHighlights();
    const el = document.getElementById("cat-" + state.activeStep);
    if (el) {
      el.classList.add("tour-highlight");
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    const style = positionTooltip(state.activeStep);
    dispatch({ type: "TOOLTIP", style });

    // ResizeObserver
    if (roRef.current) roRef.current.disconnect();
    const ro = new ResizeObserver(() => {
      dispatch({ type: "TOOLTIP", style: positionTooltip(state.activeStep) });
    });
    ro.observe(document.body);
    roRef.current = ro;

    // Speak after 350ms
    clearTimeout(timerRef.current);
    if (state.visible) {
      const { title, desc } = getInstruction(state.activeStep, language);
      timerRef.current = setTimeout(() => speak(title + ". " + desc, language), 350);
    }
    return () => clearTimeout(timerRef.current);
  }, [state.activeStep, state.visible, language]);

  // Confetti on celebration
  useEffect(() => {
    if (!state.showCelebration) return;
    hasHandledHomeTourThisPageLoad = true;
    clearHighlights();
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.55 },
      colors: ["#0d9488", "#14b8a6", "#fbbf24", "#f472b6", "#60a5fa"] });
    onTourDone?.();
  }, [state.showCelebration, onTourDone]);

  // Unmount: Mark tour as handled for this page load so navigating to other pages/roles
  // and coming back to Home will NOT trigger the tutorial again!
  useEffect(() => {
    return () => {
      hasHandledHomeTourThisPageLoad = true;
      stopSpeak();
      clearTimeout(timerRef.current);
      if (roRef.current) roRef.current.disconnect();
      clearHighlights();
    };
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────
  // Skip Entire Tutorial (Dismiss completely)
  const handleSkipAll = useCallback(() => {
    hasHandledHomeTourThisPageLoad = true;
    stopSpeak();
    clearHighlights();
    dispatch({ type: "DISMISS" });
    onTourDone?.();
  }, [onTourDone]);

  const handleStart = useCallback((stepIndex) => {
    hasHandledHomeTourThisPageLoad = true;
    const newProgress = state.progress.includes(stepIndex)
      ? state.progress : [...state.progress, stepIndex];
    clearHighlights();
    stopSpeak();
    writeStorage(newProgress, state.skipped);
    onCompletedChange?.(new Set(newProgress));

    const nextStep = stepIndex < 6 ? stepIndex + 1 : null;
    const allDone = nextStep === null;
    dispatch({ type: "ADVANCE", nextStep, progress: newProgress, skipped: state.skipped, allDone });

    // Launch the game
    const gameMap = {
      1: "Memory Cards Recall", 2: "Attention Color Matching",
      3: "Daily Routine Sequencing", 4: "Pattern Puzzle Match",
      5: "Object Identification", 6: "Emotional Music Reminiscence",
    };
    onLaunchGame?.(gameMap[stepIndex]);
  }, [state.progress, state.skipped, onLaunchGame, onCompletedChange]);

  // Skip Step: advances to next category (1 -> 2 -> 3 -> 4 -> 5 -> 6 -> finishes)
  const handleSkip = useCallback((stepIndex) => {
    const newSkipped = state.skipped.includes(stepIndex)
      ? state.skipped : [...state.skipped, stepIndex];
    
    // If on the last step (6), finish the tutorial!
    if (stepIndex >= 6) {
      hasHandledHomeTourThisPageLoad = true;
      clearHighlights();
      stopSpeak();
      writeStorage(state.progress, newSkipped);
      onSkippedChange?.(new Set(newSkipped));

      dispatch({
        type: "ADVANCE",
        nextStep: null,
        progress: state.progress,
        skipped: newSkipped,
        allDone: true,
      });
      onTourDone?.();
      return;
    }

    const advanceTo = stepIndex + 1;
    clearHighlights();
    stopSpeak();
    writeStorage(state.progress, newSkipped);
    onSkippedChange?.(new Set(newSkipped));

    dispatch({
      type: "ADVANCE",
      nextStep: advanceTo,
      progress: state.progress,
      skipped: newSkipped,
      allDone: false,
    });
  }, [state.progress, state.skipped, onSkippedChange, onTourDone]);

  const handleBackdrop = useCallback(() => {
    hasHandledHomeTourThisPageLoad = true;
    stopSpeak();
    clearHighlights();
    dispatch({ type: "DISMISS" });
    onTourDone?.();
  }, [onTourDone]);

  const handleVoice = useCallback(() => {
    if (!state.activeStep) return;
    const { title, desc } = getInstruction(state.activeStep, language);
    speak(title + ". " + desc, language);
  }, [state.activeStep, language]);

  const handleCloseCelebration = useCallback(() => {
    hasHandledHomeTourThisPageLoad = true;
    stopSpeak();
    clearHighlights();
    dispatch({ type: "CLOSE_CELEBRATION" });
    onTourDone?.();
  }, [onTourDone]);

  const handleClosePanel = useCallback(() => {
    dispatch({ type: "CLOSE_PANEL" });
  }, []);

  // Pending items: skipped but not completed
  const pendingItems = state.skipped.filter(n => !state.progress.includes(n));

  // Nothing to render
  if (!state.showCelebration && !state.visible && pendingItems.length === 0 && state.activeStep === null) {
    return null;
  }

  const instr = state.activeStep ? getInstruction(state.activeStep, language) : { title: "", desc: "" };
  const progressPct = state.activeStep ? Math.round(((state.activeStep - 1) / 6) * 100) : 100;
  const sl = stepLabel(language);
  const vl = voiceBtnLabel(language);
  const sk = skipLabel(language);
  const st = startLabel(language);

  return (
    <>
      {/* ── TourOverlay ──────────────────────────────────────────── */}
      {state.visible && createPortal(
        <div id="landingTourOverlay" className="tour-overlay" role="dialog" aria-modal="true"
          aria-label={`Tour step ${state.activeStep} of 6`}>
          <div id="landingTourBackdrop" className="tour-backdrop" onClick={handleBackdrop} />
          <div className="tour-tooltip"
            style={{ top: state.tooltipStyle.top, left: state.tooltipStyle.left }}>
            {/* Top row */}
            <div className="tour-tooltip__top-row">
              <span className="tour-tooltip__step-badge">
                {sl} {state.activeStep} / 6
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <button
                  type="button"
                  id="landing-tour-voice-btn"
                  className="tour-voice-btn"
                  onClick={handleVoice}
                  title={vl}
                  aria-label={vl}
                >
                  <Volume2 size={13} />
                  <span>{vl}</span>
                </button>
                <button
                  type="button"
                  id="landing-tour-close-btn"
                  className="tour-close-btn"
                  onClick={handleSkipAll}
                  title={language === "hi" ? "ट्यूटोरियल छोड़ें" : "Skip Tutorial"}
                  aria-label="Skip Tutorial"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
            {/* Title */}
            <h3 className="tour-tooltip__title">
              🧠 {instr.title}
            </h3>
            {/* Desc */}
            <p className="tour-tooltip__desc">{instr.desc}</p>
            {/* Progress row */}
            <div className="tour-progress-row">
              <span className="tour-progress-label">{state.activeStep}/6</span>
              <div className="tour-progress-bar">
                <div className="tour-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
            {/* Buttons */}
            <div className="tour-btn-row">
              {/* Skip Entire Tutorial */}
              <button
                type="button"
                id="landing-tour-skip-all-btn"
                className="tour-skip-all-btn"
                onClick={handleSkipAll}
                title={language === "hi" ? "पूरा ट्यूटोरियल छोड़ें" : "Skip Entire Tutorial"}
                aria-label="Skip Entire Tutorial"
              >
                <X size={13} />
                <span>{language === "hi" ? "ट्यूटोरियल छोड़ें" : "Skip Tour"}</span>
              </button>

              {/* Skip Step / Next */}
              <button
                type="button"
                id="landing-tour-skip-step-btn"
                className="tour-skip-btn"
                onClick={() => handleSkip(state.activeStep)}
                aria-label={state.activeStep === 6 ? (language === "hi" ? "समाप्त" : "Finish") : sk}
                title={state.activeStep === 6 ? (language === "hi" ? "ट्यूटोरियल समाप्त करें" : "Finish Tutorial") : (language === "hi" ? "अगला चरण" : "Next Step")}
              >
                <SkipForward size={13} />
                <span>
                  {state.activeStep === 6
                    ? (language === "hi" ? "समाप्त" : "Finish")
                    : (language === "hi" ? "अगला" : "Skip Step")}
                </span>
              </button>

              {/* Start Activity */}
              <button
                type="button"
                id="landing-tour-start-step-btn"
                className="tour-start-btn"
                onClick={() => handleStart(state.activeStep)}
                aria-label={st}
              >
                <Play size={13} style={{ fill: "currentColor" }} />
                <span>{st}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── PendingPanel ────────────────────────────────────────── */}
      {pendingItems.length > 0 && state.panelOpen && createPortal(
        <div className="pending-panel" role="complementary" aria-label="Skipped tasks">
          <div className="pending-panel__header">
            <span className="pending-panel__header-title">
              {language === "hi" ? "लंबित कार्य" : language === "as" ? "বাকী কাম" : "Pending"} ({pendingItems.length})
            </span>
            <button className="pending-panel__close" onClick={handleClosePanel}
              aria-label="Close pending panel">
              <X size={14} />
            </button>
          </div>
          <ul className="pending-panel__list">
            {pendingItems.map(n => (
              <li key={n} className="pending-panel__item">
                <span className="pending-panel__item-name">{TASK_NAMES[n]}</span>
                <button className="pending-panel__item-link" onClick={() => handleStart(n)}
                  aria-label={`Start ${TASK_NAMES[n]}`}>
                  {st} →
                </button>
              </li>
            ))}
          </ul>
        </div>,
        document.body
      )}

      {/* ── CelebrationModal ─────────────────────────────────────── */}
      {state.showCelebration && createPortal(
        <div className="tour-celebration" role="dialog" aria-modal="true" aria-label="Tour completed">
          <div className="celebration-content">
            <div className="celebration-content__icon">🎉</div>
            <h2 className="celebration-content__title">
              {language === "hi" ? "शाबाश! सभी 6 गतिविधियाँ पूरी हुईं!" :
               language === "as" ? "অভিনন্দন! সকলো ৬টো কার্য সম্পন্ন!" :
               "All 6 Activities Explored!"}
            </h2>
            <p className="celebration-content__desc">
              {language === "hi"
                ? "आपने सभी 6 संज्ञानात्मक श्रेणियाँ देखीं। रोज़ अभ्यास करते रहें!"
                : "Wonderful! You have explored all 6 cognitive training categories. Keep practising every day!"}
            </p>
            <button className="celebration-close-btn" onClick={handleCloseCelebration}
              aria-label="Close celebration">
              <PartyPopper size={16} />
              {language === "hi" ? "जारी रखें" : "Continue"}
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default LandingTourDriver;
