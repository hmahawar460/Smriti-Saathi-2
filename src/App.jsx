import { useState, useEffect, useRef } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { RealtimeTrackingProvider } from "./context/RealtimeTrackingContext";
import { AuthModal } from "./components/auth/AuthModal";
import { AuthHeroBanner } from "./components/auth/AuthHeroBanner";
import {
  initialPatientProfile,
  initialTasks,
  initialFreePlayGames,
  initialReminders,
  sevenDayPerformance,
  activeAlert,
  initialNotes,
  initialPhysicalActivities
} from "./data/initialData";
import { Header } from "./components/common/Header";
import { VoiceModal } from "./components/common/VoiceModal";
import { FloatingVoiceButton } from "./components/common/FloatingVoiceButton";
import { CallCaregiverModal } from "./components/common/CallCaregiverModal";
import { PatientHome } from "./components/patient/PatientHome";
import { PatientTasks } from "./components/patient/PatientTasks";
import { AllGamesEngine } from "./components/games/AllGamesEngine";
import { PhysicalMemoryEngine } from "./components/games/PhysicalMemoryEngine";
import { PatientProgress } from "./components/patient/PatientProgress";
import { PatientAIAnalysis } from "./components/patient/PatientAIAnalysis";
import { PatientFreePlay } from "./components/patient/PatientFreePlay";
import { PhysicalActivityEngine } from "./components/patient/PhysicalActivityEngine";
import { OfflineGamesCenter } from "./components/patient/OfflineGamesCenter";
import { FamilyDashboard } from "./components/family/FamilyDashboard";
import { CaregiverMemoriesManager } from "./components/family/CaregiverMemoriesManager";
import { MyMemoriesGameEngine } from "./components/games/MyMemoriesGameEngine";
import { FindItGameEngine } from "./components/games/FindItGameEngine";
import { DoctorDashboard } from "./components/doctor/DoctorDashboard";
import { DesktopLayout } from "./components/desktop/DesktopLayout";
import { MultiFrameShowcase } from "./components/showcase/MultiFrameShowcase";
import { LandingHome } from "./components/home/LandingHome";
import { HomeMemoryTestSection } from "./components/home/HomeMemoryTestSection";
import { allUnifiedGames } from "./data/unifiedGamesData";
import { translations } from "./data/translations";
import { Lock, User, Stethoscope, ArrowRight } from "lucide-react";

function MainAppContent() {
  const { currentUser } = useAuth();
  const [currentRole, setCurrentRole] = useState("home");
  const [profile, setProfile] = useState(initialPatientProfile);
  const [tasks, setTasks] = useState(initialTasks);
  const [physicalActivities, setPhysicalActivities] = useState(initialPhysicalActivities);
  const [freePlayGames, setFreePlayGames] = useState(initialFreePlayGames);
  const [reminders, setReminders] = useState(initialReminders);
  const [performance, setPerformance] = useState(sevenDayPerformance);
  const [alertData, setAlertData] = useState(activeAlert);
  const [notes, setNotes] = useState(initialNotes);
  const [activeTask, setActiveTask] = useState(null);
  const [activePhysicalActivity, setActivePhysicalActivity] = useState(null);
  const [patientTab, setPatientTab] = useState("home");
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isCaregiverCallOpen, setIsCaregiverCallOpen] = useState(false);

  // Landing page tour state
  const [showLandingTour, setShowLandingTour] = useState(false);
  const [tourPendingSteps, setTourPendingSteps] = useState([]); // skipped-not-done steps

  // Auth modal state
  const [authModalConfig, setAuthModalConfig] = useState({
    isOpen: false,
    mode: "login",
    initialRole: "patient"
  });

  // Sync profile when currentUser changes
  useEffect(() => {
    if (currentUser?.profile) {
      setProfile((prev) => ({
        ...prev,
        ...currentUser.profile,
        name: currentUser.name || prev.name,
        patientCode: currentUser.patientCode || prev.patientCode,
        phone: currentUser.phone || prev.phone
      }));
    } else if (currentUser?.role === "doctor") {
      setProfile((prev) => ({
        ...prev,
        doctorName: currentUser.name,
        doctorHospital: currentUser.hospital || prev.doctorHospital
      }));
    }
  }, [currentUser]);

  // Trigger landing tour when a patient logs in
  const prevUserIdRef = useRef(null);
  useEffect(() => {
    const prevId = prevUserIdRef.current;
    prevUserIdRef.current = currentUser?.id ?? null;
    // A new patient login (not just a re-render with same user)
    if (currentUser?.role === "patient" && currentUser.id !== prevId) {
      setShowLandingTour(true);
      setCurrentRole("home"); // send them to home page where the tour runs
    }
  }, [currentUser]);

  // Detect if user is currently playing a game or active physical activity
  const isPlayingGame = Boolean(activeTask || activePhysicalActivity);

  // When playing game only, ensure voice assistant is closed, speech is cancelled, and voice assist is removed
  useEffect(() => {
    if (isPlayingGame) {
      setIsVoiceOpen(false);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isPlayingGame]);

  // Cancel any ongoing speech synthesis & clear highlights whenever switching roles/tabs
  useEffect(() => {
    setShowLandingTour(false);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (typeof document !== "undefined") {
      document.querySelectorAll(".tour-highlight").forEach((el) => {
        el.classList.remove("tour-highlight");
      });
    }
  }, [currentRole, patientTab]);

  const TASK_NAMES_MAP = {
    1: "Memory Enhancement", 2: "Attention & Focus", 3: "Daily Routines",
    4: "Pattern Recognition", 5: "Object Identification", 6: "Emotional Engagement",
  };

  // Tour skipped steps → shown in notification bell as pending tasks
  const handleTourSkippedChange = (skippedSet) => {
    setTourPendingSteps(Array.from(skippedSet));
  };

  // Directly skipped category tasks from the front page
  const [skippedCategoryTasks, setSkippedCategoryTasks] = useState([]);

  const handleToggleSkipCategory = (cat, willBeSkipped) => {
    setSkippedCategoryTasks((prev) => {
      const taskId = `cat-task-${cat.id}`;
      const filtered = prev.filter((t) => t.id !== taskId);
      if (willBeSkipped) {
        return [
          ...filtered,
          {
            id: taskId,
            categoryId: cat.id,
            title: cat.title,
            gameTitle: cat.gameTitle || "Memory Cards Recall",
            domain: cat.title,
            difficulty: "Gentle",
            durationMinutes: 5,
            doctorAssigned: false,
            status: "pending",
            iconName: "Brain",
            description: cat.desc,
            isSkippedTask: true,
            required: false,
          },
        ];
      }
      return filtered;
    });
  };

  // Merge tour pending steps and skipped category tasks into tasks for the notification dropdown
  const tourPendingAsTasks = tourPendingSteps.map(n => ({
    id: `tour-step-${n}`,
    title: TASK_NAMES_MAP[n] || `Step ${n}`,
    domain: "Guided Tour",
    durationMinutes: 5,
    doctorAssigned: false,
    status: "pending",
    iconName: "Brain",
    description: `Cognitive tour step ${n} — tap Start to explore this category.`,
    required: false,
    isTourStep: true,
    tourStepIndex: n,
  }));
  const allTasksForNotification = [
    ...tasks,
    ...tourPendingAsTasks,
    ...skippedCategoryTasks.filter(st => !tourPendingSteps.includes(st.categoryId))
  ];

  const handleUpdateProfile = (updated) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  const handleCompleteGame = (taskId, score, accuracy, timeSpentSeconds, errors) => {
    setTasks((prev) => {
      const cleanId = String(taskId ?? "").toLowerCase();
      const matchIndex = prev.findIndex((t) => {
        if (!t) return false;
        const tTitle = String(t.title ?? "").toLowerCase();
        const tId = String(t.id ?? "").toLowerCase();
        return (
          (tId && tId === cleanId) ||
          (tTitle && tTitle === cleanId) ||
          (tId && cleanId.includes(tId)) ||
          (tTitle && cleanId.includes(tTitle)) ||
          (tTitle && cleanId.replace(/^game-|^task-/, '').replace(/-/g, ' ') && tTitle.includes(cleanId.replace(/^game-|^task-/, '').replace(/-/g, ' ')))
        );
      });

      if (matchIndex >= 0) {
        return prev.map((t, idx) =>
          idx === matchIndex
            ? {
                ...t,
                status: "completed",
                score: score || t.score || 95,
                accuracy: accuracy || t.accuracy || 95,
                timeSpentSeconds: timeSpentSeconds || t.timeSpentSeconds || 240,
                errors: errors ?? t.errors ?? 0
              }
            : t
        );
      } else {
        const newTask = {
          id: taskId,
          title: String(taskId ?? "").replace(/^game-|^task-/, '').replace(/-/g, ' ').toUpperCase(),
          domain: "Cognitive Focus",
          difficulty: "Easy",
          durationMinutes: Math.max(1, Math.round((timeSpentSeconds || 240) / 60)),
          doctorAssigned: false,
          status: "completed",
          score: score || 95,
          accuracy: accuracy || 95,
          timeSpentSeconds: timeSpentSeconds || 240,
          errors: errors ?? 0,
          iconName: "Brain",
          description: "Completed cognitive exercise session.",
          required: false
        };
        return [...prev, newTask];
      }
    });

    // Clear tour / skipped items matching this completed game
    setTourPendingSteps((prev) => prev.filter((n) => !String(taskId ?? "").includes(String(n))));
    setSkippedCategoryTasks((prev) =>
      prev.filter((st) => !String(taskId ?? "").toLowerCase().includes(String(st?.title ?? "").toLowerCase()))
    );

    setProfile((prev) => ({
      ...prev,
      activitiesCompletedThisWeek: (prev.activitiesCompletedThisWeek || 14) + 1,
      streakDays: prev.streakDays || 5
    }));
  };

  const handleContinueToNextGame = () => {
    // 1. Find next pending task in patient tasks
    const pendingTask = tasks.find(
      (t) => t.status !== "completed" && t.id !== activeTask?.id
    );
    if (pendingTask) {
      setActiveTask(pendingTask);
      setCurrentRole("patient");
      return;
    }

    // 2. If all assigned tasks completed, find next game from allUnifiedGames
    if (activeTask) {
      const currentIndex = allUnifiedGames.findIndex(
        (g) => g.id === activeTask.id || g.title?.toLowerCase() === activeTask.title?.toLowerCase()
      );
      if (currentIndex >= 0 && currentIndex < allUnifiedGames.length - 1) {
        const nextGame = allUnifiedGames[currentIndex + 1];
        setActiveTask(nextGame);
        setCurrentRole("patient");
        return;
      }
    }

    // 3. Otherwise return to games list
    setActiveTask(null);
    setCurrentRole("patient");
    setPatientTab("games");
  };

  const handleCompletePhysicalActivity = (activityId, durationSeconds, reps) => {
    const mins = Math.max(1, Math.round(durationSeconds / 60));
    setPhysicalActivities((prev) =>
      prev.map((act) =>
        act.id === activityId
          ? {
              ...act,
              status: "completed",
              completedAt: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              }),
              durationMinutes: mins,
              repetitions: reps || act.repetitions
            }
          : act
      )
    );
    setProfile((prev) => ({
      ...prev,
      activitiesCompletedThisWeek: (prev.activitiesCompletedThisWeek || 14) + 1
    }));
  };

  const handleLaunchGameByTitle = (title) => {
    setCurrentRole("patient");
    setActivePhysicalActivity(null);
    const searchTitle = String(title ?? "").toLowerCase();
    const matched = tasks.find((t) =>
      String(t?.title ?? "").toLowerCase().includes(searchTitle)
    ) || {
      id: `task-${searchTitle.replace(/\s+/g, "-")}`,
      title: String(title ?? "").toUpperCase(),
      domain: "Memory",
      difficulty: "Easy",
      durationMinutes: 5,
      doctorAssigned: true,
      status: "pending",
      iconName: "Brain",
      description: `Play and enjoy ${title} at a gentle, soothing pace.`,
      required: true
    };
    setActiveTask(matched);
  };

  const handleToggleReminder = (id) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const handleAddReminder = (newReminder) => {
    const created = {
      id: `rem-${Date.now()}`,
      completed: false,
      ...newReminder
    };
    setReminders((prev) => [created, ...prev]);
  };

  const handleMarkAllRemindersDone = () => {
    setReminders((prev) => prev.map((r) => ({ ...r, completed: true })));
  };

  const handleStartTaskFromNotification = (task) => {
    if (task.isSkippedTask || task.gameTitle) {
      handleLaunchGameByTitle(task.gameTitle || task.title);
      return;
    }
    if (task.isTourStep) {
      const tourGameMap = {
        1: "Memory Cards Recall",
        2: "Attention Color Matching",
        3: "Daily Routine Sequencing",
        4: "Pattern Puzzle Match",
        5: "Object Identification",
        6: "Emotional Music Reminiscence",
      };
      const gameTitle = tourGameMap[task.tourStepIndex] || task.title;
      handleLaunchGameByTitle(gameTitle);
      return;
    }
    setCurrentRole("patient");
    setActivePhysicalActivity(null);
    setActiveTask(task);
  };

  const handleAddObservation = (newNote) => {
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleAddDoctorNote = (newNote) => {
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleAcknowledgeAlert = (alertId) => {
    setAlertData((prev) => ({ ...prev, isAcknowledged: true }));
  };

  const handleVoiceCommand = (command) => {
    if (!command || typeof command !== "string") return;
    const cmd = command.toLowerCase().trim();

    // 1. Physical Wellness / Exercises
    if (
      cmd.includes("walk") ||
      cmd.includes("stretch") ||
      cmd.includes("exercise") ||
      cmd.includes("sit to stand") ||
      cmd.includes("breathe") ||
      cmd.includes("wellness") ||
      cmd.includes("vyayam") ||
      cmd.includes("kasrat") ||
      cmd.includes("yoga") ||
      cmd.includes("tahalna")
    ) {
      setIsVoiceOpen(false);
      setCurrentRole("patient");
      setPatientTab("physical");
      setActiveTask(null);
      const matchedAct =
        physicalActivities.find(
          (p) =>
            (cmd.includes("walk") && p.id === "phys-walk") ||
            (cmd.includes("stand") && p.id === "phys-stand") ||
            (cmd.includes("hand") && p.id === "phys-hand") ||
            (cmd.includes("breath") && p.id === "phys-breath") ||
            (cmd.includes("stretch") && p.id === "phys-stretch")
        ) || physicalActivities[0];
      setActivePhysicalActivity(matchedAct);
      return;
    }

    // 2. Offline Games Center
    if (
      cmd.includes("offline") ||
      cmd.includes("bina internet") ||
      cmd.includes("sudoku") ||
      cmd.includes("word search")
    ) {
      setIsVoiceOpen(false);
      setCurrentRole("patient");
      setActiveTask(null);
      setPatientTab("offline_games");
      return;
    }

    // 3. Clinical Memory Assessment / Cognitive Screening
    if (
      cmd.includes("memory test") ||
      cmd.includes("take test") ||
      cmd.includes("assessment") ||
      cmd.includes("parikshan") ||
      cmd.includes("motor test") ||
      cmd.includes("screening") ||
      cmd.includes("cognitive test") ||
      cmd.includes("dimag ka test") ||
      cmd.includes("test")
    ) {
      setIsVoiceOpen(false);
      setActiveTask(null);
      setCurrentRole("memory_test");
      return;
    }

    // 4. Daily Tasks / Routine Schedule
    if (
      cmd.includes("routine") ||
      cmd.includes("schedule") ||
      cmd.includes("today's task") ||
      cmd.includes("my tasks") ||
      cmd.includes("dincharya") ||
      cmd.includes("kaam") ||
      cmd.includes("todo") ||
      cmd.includes("remind")
    ) {
      setIsVoiceOpen(false);
      setCurrentRole("patient");
      setActiveTask(null);
      setPatientTab("tasks");
      return;
    }

    // 4.5 Personal Recall / My Memories
    if (
      cmd.includes("my memories") ||
      cmd.includes("memories") ||
      cmd.includes("yaadein") ||
      cmd.includes("photo game") ||
      cmd.includes("tasveer") ||
      cmd.includes("family photo") ||
      cmd.includes("parivar")
    ) {
      setIsVoiceOpen(false);
      setCurrentRole("patient");
      setPatientTab("home");
      handleLaunchGameByTitle("My Memories");
      return;
    }

    // 4.6 Find It! Real-World Object Hunting
    if (
      cmd.includes("find it") ||
      cmd.includes("find object") ||
      cmd.includes("object hunt") ||
      cmd.includes("camera game") ||
      cmd.includes("dhoondo") ||
      cmd.includes("dhundo") ||
      cmd.includes("vastu") ||
      cmd.includes("spoon") ||
      cmd.includes("cup")
    ) {
      setIsVoiceOpen(false);
      setCurrentRole("patient");
      setPatientTab("home");
      handleLaunchGameByTitle("FIND IT! Real-World Object Hunt");
      return;
    }

    // 5. Cognitive Games / Play Game / Start Game
    if (
      cmd.includes("start") ||
      cmd.includes("game") ||
      cmd.includes("play") ||
      cmd.includes("khel") ||
      cmd.includes("puzzle") ||
      cmd.includes("shuru") ||
      cmd.includes("meditation")
    ) {
      setIsVoiceOpen(false);
      setCurrentRole("patient");
      setPatientTab("home");
      const nextPending = tasks.find((t) => t.status !== "completed") || tasks[0];
      setActiveTask(nextPending);
      return;
    }

    // 6. Progress / AI Clinical Analysis / Scores
    if (
      cmd.includes("analysis") ||
      cmd.includes("progress") ||
      cmd.includes("score") ||
      cmd.includes("pragati") ||
      cmd.includes("report") ||
      cmd.includes("graph")
    ) {
      setIsVoiceOpen(false);
      setCurrentRole("patient");
      setActiveTask(null);
      setPatientTab("analysis");
      return;
    }

    // 7. Caregiver Emergency / SOS Call
    if (
      cmd.includes("caregiver") ||
      cmd.includes("call") ||
      cmd.includes("help") ||
      cmd.includes("emergency") ||
      cmd.includes("sos") ||
      cmd.includes("madad") ||
      cmd.includes("sahayata") ||
      cmd.includes("bachao")
    ) {
      setIsVoiceOpen(false);
      setIsCaregiverCallOpen(true);
      return;
    }

    // 8. Navigation: Home / Main Screen
    if (
      cmd.includes("home") ||
      cmd.includes("ghar") ||
      cmd.includes("landing") ||
      cmd.includes("main page")
    ) {
      setIsVoiceOpen(false);
      setActiveTask(null);
      setCurrentRole("home");
      return;
    }

    // 9. Doctor Portal
    if (
      cmd.includes("doctor") ||
      cmd.includes("clinical") ||
      cmd.includes("hospital") ||
      cmd.includes("physician")
    ) {
      setIsVoiceOpen(false);
      setActiveTask(null);
      setCurrentRole("doctor");
      return;
    }

    // 10. Family Dashboard
    if (
      cmd.includes("family") ||
      cmd.includes("parivar") ||
      cmd.includes("relative")
    ) {
      setIsVoiceOpen(false);
      setActiveTask(null);
      setCurrentRole("family");
      return;
    }

    // Default fallback: close modal
    setIsVoiceOpen(false);
  };

  const openAuthModal = (options = {}) => {
    setAuthModalConfig({
      isOpen: true,
      mode: options.mode || "login",
      initialRole: options.initialRole || "patient"
    });
  };

  // Role Access Guard Component
  const renderAccessGuardedSection = (roleRequired, sectionName, icon) => {
    const isDoctorPortal =
      sectionName.toLowerCase().includes("doctor") ||
      roleRequired.toLowerCase().includes("doctor");
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl shadow-xl border border-slate-200 text-center animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-2">
          {isDoctorPortal
            ? "Doctor Portal Access Restricted"
            : "Role-Restricted Portal"}
        </h2>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {isDoctorPortal ? (
            <>
              Patients are <span className="font-bold text-rose-600">not permitted</span> to view the Doctor Dashboard. This portal contains clinical diagnostic records, MoCA cognitive assessments, EEG telemetry trends, and prescription management tools strictly reserved for verified <span className="font-bold text-teal-700">Doctors and Clinicians</span>.
            </>
          ) : (
            <>
              You are currently signed in as a{" "}
              <span className="font-bold text-blue-700 capitalize">
                {currentUser?.role || "Guest"}
              </span>
              . The <span className="font-bold text-slate-900">{sectionName}</span> is
              strictly reserved for{" "}
              <span className="font-bold text-teal-700">{roleRequired}</span> accounts
              to safeguard patient confidentiality and clinical workflows.
            </>
          )}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setCurrentRole("patient")}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4 text-blue-600" />
            <span>Go to Patient Dashboard</span>
          </button>
          <button
            onClick={() => openAuthModal({ mode: "login", initialRole: "doctor" })}
            className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctor Sign In</span>
          </button>
          <button
            onClick={() => setCurrentRole("home")}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer"
          >
            Home
          </button>
        </div>
      </div>
    );
  };

  const fontScaleClass =
    profile.fontSizeScale === "extra-large"
      ? "text-[19px]"
      : profile.fontSizeScale === "large"
      ? "text-[17px]"
      : "text-[15px]";

  return (
    <div
      className={`min-h-screen flex flex-col bg-gradient-to-b from-[#FDFAF5] via-[#F8FAFC] to-[#EFF6FF] ${fontScaleClass} font-sans transition-all`}
    >
      {/* Top Universal Navbar */}
      <Header
        currentRole={currentRole}
        onRoleChange={(role) => {
          setActiveTask(null);
          setShowLandingTour(false);
          setCurrentRole(role);
        }}
        profile={profile}
        onProfileUpdate={handleUpdateProfile}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenCaregiverCall={() => setIsCaregiverCallOpen(true)}
        onOpenAuthModal={() => openAuthModal({ mode: "login" })}
        reminders={reminders}
        tasks={allTasksForNotification}
        onToggleReminder={handleToggleReminder}
        onStartTask={handleStartTaskFromNotification}
        onAddReminder={handleAddReminder}
        onMarkAllRemindersDone={handleMarkAllRemindersDone}
      />

      {/* Main Role Content View */}
      <main className="flex-1">
        {/* ================= 0. HOME LANDING PORTAL ================= */}
        {currentRole === "home" && (
          <LandingHome
            onSelectRole={(role) => {
              setActiveTask(null);
              setShowLandingTour(false);
              setCurrentRole(role);
            }}
            onLaunchGame={(title) => {
              handleLaunchGameByTitle(title);
            }}
            onOpenVoice={() => setIsVoiceOpen(true)}
            onOpenCaregiverCall={() => setIsCaregiverCallOpen(true)}
            profile={profile}
            onProfileUpdate={handleUpdateProfile}
            tasks={tasks}
            reminders={reminders}
            performance={performance}
            showTour={showLandingTour}
            onTourDone={() => setShowLandingTour(false)}
            onTourSkippedChange={handleTourSkippedChange}
            onTourCompletedChange={(completedSet) => {
              // when a tour step is completed, remove it from pending
              setTourPendingSteps(prev => prev.filter(n => !completedSet.has(n)));
            }}
            onToggleSkipCategory={handleToggleSkipCategory}
            onOpenMemoryTest={() => setCurrentRole("memory_test")}
          />
        )}

        {/* ================= 0.1 DEDICATED MEMORY & MOTOR TEST ASSESSMENT PAGE ================= */}
        {currentRole === "memory_test" && (
          <HomeMemoryTestSection
            t={profile ? (translations[profile?.language] || translations.hi || translations.en) : translations.en}
            isStandalonePage={true}
            onBack={() => setCurrentRole("home")}
            onLaunchGame={(title) => {
              handleLaunchGameByTitle(title);
            }}
            onSelectRole={(role) => {
              setActiveTask(null);
              setCurrentRole(role);
            }}
          />
        )}

        {/* ================= 1. MULTI-FRAME SHOWCASE ================= */}
        {currentRole === "showcase" && (
          <MultiFrameShowcase
            onSelectRole={(role) => {
              setActiveTask(null);
              setCurrentRole(role);
            }}
            onLaunchGame={(title) => {
              handleLaunchGameByTitle(title);
            }}
          />
        )}

        {/* ================= 2. PATIENT VIEW ================= */}
        {currentRole === "patient" && (
          <>
            {activePhysicalActivity ? (
              <PhysicalActivityEngine
                activity={activePhysicalActivity}
                profile={profile}
                onComplete={(...args) => {
                  handleCompletePhysicalActivity(...args);
                  setActivePhysicalActivity(null);
                  setCurrentRole("patient");
                  setPatientTab("home");
                }}
                onBack={() => {
                  setActivePhysicalActivity(null);
                  setCurrentRole("patient");
                  setPatientTab("home");
                }}
              />
            ) : activeTask ? (
                activeTask.id === "game-find-it" ||
                activeTask.title.toLowerCase().includes("find it") ||
                activeTask.title.toLowerCase().includes("object hunt") ? (
                  <FindItGameEngine
                    task={activeTask}
                    profile={profile}
                    onComplete={handleCompleteGame}
                    onContinue={handleContinueToNextGame}
                    onBackToGames={() => {
                      setActiveTask(null);
                      setCurrentRole("patient");
                      setPatientTab("games");
                    }}
                    onBack={() => {
                      setActiveTask(null);
                      setCurrentRole("patient");
                      setPatientTab("home");
                    }}
                  />
                ) : activeTask.id === "game-my-memories" ||
                activeTask.title.toLowerCase().includes("my memories") ||
                activeTask.title.toLowerCase().includes("personal recall") ? (
                  <MyMemoriesGameEngine
                    task={activeTask}
                    profile={profile}
                    onComplete={handleCompleteGame}
                    onContinue={handleContinueToNextGame}
                    onBackToGames={() => {
                      setActiveTask(null);
                      setCurrentRole("patient");
                      setPatientTab("games");
                    }}
                    onBack={() => {
                      setActiveTask(null);
                      setCurrentRole("patient");
                      setPatientTab("home");
                    }}
                    onOpenCaregiverManager={() => {
                      setActiveTask(null);
                      setCurrentRole("family_memories");
                    }}
                  />
                ) : activeTask.id.startsWith("pm-") ||
                ["Coordination", "Rhythm", "Sequencing"].includes(
                  activeTask.domain
                ) ||
                activeTask.title.toLowerCase().includes("touch the body") ||
                activeTask.title.toLowerCase().includes("remember & move") ||
                activeTask.title.toLowerCase().includes("simon says") ||
                activeTask.title.toLowerCase().includes("cross-body") ||
                activeTask.title.toLowerCase().includes("count & touch") ||
                activeTask.title.toLowerCase().includes("left or right") ||
                activeTask.title.toLowerCase().includes("finger sequence") ||
                activeTask.title.toLowerCase().includes("clap pattern") ||
                activeTask.title.toLowerCase().includes("foot tap") ||
                activeTask.title.toLowerCase().includes("movement sequence") ||
                activeTask.title.toLowerCase().includes("color movement") ||
                activeTask.title.toLowerCase().includes("freeze & move") ||
                activeTask.title.toLowerCase().includes("rhythm copy") ||
                activeTask.title.toLowerCase().includes("mirror me") ||
                activeTask.title.toLowerCase().includes("reverse sequence") ? (
                  <PhysicalMemoryEngine
                    game={activeTask}
                    profile={profile}
                    onComplete={handleCompleteGame}
                    onContinue={handleContinueToNextGame}
                    onBackToGames={() => {
                      setActiveTask(null);
                      setCurrentRole("patient");
                      setPatientTab("games");
                    }}
                    onBack={() => {
                      setActiveTask(null);
                      setCurrentRole("patient");
                      setPatientTab("home");
                    }}
                  />
                ) : (
                  <AllGamesEngine
                    task={activeTask}
                    profile={profile}
                    onComplete={handleCompleteGame}
                    onContinue={handleContinueToNextGame}
                    onBackToGames={() => {
                      setActiveTask(null);
                      setCurrentRole("patient");
                      setPatientTab("games");
                    }}
                    onBack={() => {
                      setActiveTask(null);
                      setCurrentRole("patient");
                      setPatientTab("home");
                    }}
                  />
                )
              ) : patientTab === "offline_games" ? (
                <OfflineGamesCenter
                  profile={profile}
                  onBack={() => setPatientTab("home")}
                  onRecordPerformance={() => {}}
                />
              ) : patientTab === "tasks" ? (
                <PatientTasks
                  tasks={tasks}
                  profile={profile}
                  onStartTask={(task) => setActiveTask(task)}
                  onBack={() => setPatientTab("home")}
                />
              ) : patientTab === "games" ? (
                <PatientFreePlay
                  games={freePlayGames}
                  profile={profile}
                  onStartGame={(task) => setActiveTask(task)}
                  onBack={() => setPatientTab("home")}
                />
              ) : patientTab === "progress" ? (
                <PatientProgress
                  profile={profile}
                  performance={performance}
                  onBack={() => setPatientTab("home")}
                />
              ) : patientTab === "analysis" ? (
                <PatientAIAnalysis
                  profile={profile}
                  onBack={() => setPatientTab("home")}
                  onNavigateTab={(tab) => {
                    if (tab === "help") setIsCaregiverCallOpen(true);
                    else setPatientTab(tab);
                  }}
                />
              ) : (
                <PatientHome
                  profile={profile}
                  tasks={tasks}
                  physicalActivities={physicalActivities}
                  freePlayGames={freePlayGames}
                  reminders={reminders}
                  performance={performance}
                  onStartTask={(task) => setActiveTask(task)}
                  onStartPhysicalActivity={(act) =>
                    setActivePhysicalActivity(act)
                  }
                  onOpenOfflineCenter={() => setPatientTab("offline_games")}
                  onOpenVoice={() => setIsVoiceOpen(true)}
                  onOpenCaregiverCall={() => setIsCaregiverCallOpen(true)}
                  onToggleReminder={handleToggleReminder}
                  onOpenDoctorPortal={() => setCurrentRole("doctor")}
                  onOpenAuthModal={(opts) => openAuthModal(opts || { mode: "login", initialRole: "doctor" })}
                  onNavigateTab={(tab) => {
                    if (tab === "help") setIsCaregiverCallOpen(true);
                    else if (
                      tab === "offline_games" ||
                      tab === "physical"
                    )
                      setPatientTab(tab);
                    else setPatientTab(tab);
                  }}
                />
              )}
          </>
        )}

        {/* ================= 3. DESKTOP VIEW ================= */}
        {currentRole === "desktop" && (
          <DesktopLayout
            profile={profile}
            tasks={tasks}
            freePlayGames={freePlayGames}
            reminders={reminders}
            performance={performance}
            onStartTask={(task) => setActiveTask(task)}
            onOpenVoice={() => setIsVoiceOpen(true)}
            onOpenCaregiverCall={() => setIsCaregiverCallOpen(true)}
            onClose={() => setCurrentRole("home")}
          />
        )}

        {/* ================= 4. FAMILY VIEW ================= */}
        {currentRole === "family" && (
          <FamilyDashboard
            profile={profile}
            tasks={tasks}
            reminders={reminders}
            performance={performance}
            alert={alertData}
            notes={notes}
            onAddObservation={handleAddObservation}
            onOpenMemoriesManager={() => setCurrentRole("family_memories")}
            onLaunchGame={(title) => {
              handleLaunchGameByTitle(title || "My Memories");
            }}
            onContactDoctor={() => {
              alert(
                `Connecting to ${profile.doctorName} at ${profile.doctorHospital}...`
              );
            }}
          />
        )}

        {/* ================= 4.1 CAREGIVER MEMORIES VAULT & JOURNAL ================= */}
        {currentRole === "family_memories" && (
          <CaregiverMemoriesManager
            profile={profile}
            onBack={() => setCurrentRole("family")}
            onLaunchGame={(title) => {
              handleLaunchGameByTitle(title || "My Memories");
            }}
          />
        )}

        {/* ================= 5. DOCTOR VIEW ================= */}
        {currentRole === "doctor" && (
          currentUser?.role !== "doctor" ? (
            renderAccessGuardedSection(
              "Clinicians & Doctors",
              "Doctor Hub & Clinical Portal",
              <Stethoscope className="w-6 h-6" />
            )
          ) : (
            <DoctorDashboard
              profile={profile}
              tasks={tasks}
              reminders={reminders}
              performance={performance}
              alert={alertData}
              notes={notes}
              onUpdateTasks={setTasks}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onAddClinicalNote={handleAddDoctorNote}
            />
          )
        )}

        {/* Active game when launched from any non-patient view */}
        {currentRole !== "patient" && activeTask && (
          <div className="fixed inset-0 z-[20000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-gradient-to-b from-[#FDFAF5] to-[#EFF6FF] border border-[#E8E2D9] rounded-3xl w-full max-w-lg p-2 max-h-[95vh] overflow-y-auto shadow-2xl">
              <AllGamesEngine
                task={activeTask}
                profile={profile}
                onComplete={handleCompleteGame}
                onContinue={() => setActiveTask(null)}
                onBackToGames={() => setActiveTask(null)}
                onBack={() => setActiveTask(null)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Voice Assistant Floating Action Button & Modal (Removed when in playing game only) */}
      {!isPlayingGame && (
        <>
          <FloatingVoiceButton
            isOpen={isVoiceOpen}
            onClick={() => setIsVoiceOpen((prev) => !prev)}
            profile={profile}
            currentRole={currentRole}
          />

          <VoiceModal
            isOpen={isVoiceOpen}
            onClose={() => setIsVoiceOpen(false)}
            profile={profile}
            onCommandTrigger={handleVoiceCommand}
          />
        </>
      )}

      {/* Direct Caregiver Call Modal */}
      <CallCaregiverModal
        isOpen={isCaregiverCallOpen}
        onClose={() => setIsCaregiverCallOpen(false)}
        profile={profile}
      />

      {/* Auth Modal (Sign In / Register) */}
      <AuthModal
        isOpen={authModalConfig.isOpen}
        onClose={() =>
          setAuthModalConfig((prev) => ({ ...prev, isOpen: false }))
        }
        defaultMode={authModalConfig.mode}
        initialRole={authModalConfig.initialRole}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RealtimeTrackingProvider>
        <MainAppContent />
      </RealtimeTrackingProvider>
    </AuthProvider>
  );
}
