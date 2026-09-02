import React from "react";
import {
  Brain,
  Play,
  LayoutDashboard,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  Puzzle,
  TrendingUp,
  ArrowRight
} from "lucide-react";

export const HomeHero = ({ onSelectRole, onOpenMemoryTest, t, tasks = [], profile = {}, onStartTour }) => {
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const totalGoalCount = Math.max(tasks.length, 4);
  const goalPercent = Math.min(100, Math.round((completedCount / totalGoalCount) * 100));
  const currentTask = tasks.find((t) => t.status !== "completed") || tasks[0] || { title: "Memory Match", description: "Improve recall and focus" };
  const userStreak = profile?.streakDays || 5;

  return (
    <div className="relative pt-6 pb-12 sm:pb-16 bg-[#F8FAFC] overflow-hidden" id="hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 2-Column Hero Partition */}
        <section className="flex flex-col lg:flex-row items-center justify-between w-full gap-12">
          
          {/* Left Column: Assessment Banner, Title, CTAs, Social Proof */}
          <div className="w-full lg:w-1/2 flex flex-col items-start text-left space-y-8 relative z-10">
            
            {/* Cognitive & Motor Assessment Banner */}
            <div className="flex items-center justify-between w-full max-w-lg bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-2 pr-4 border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="bg-[#001A4C] text-white p-3 rounded-xl shadow-xs">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    Cognitive & Motor Assessment
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    Test Your Memory & Cross-Body Agility
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenMemoryTest && onOpenMemoryTest()}
                className="bg-[#001A4C] text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-blue-900 transition flex items-center space-x-2 cursor-pointer active:scale-95 shadow-xs"
              >
                <span>Take Memory Test</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            {/* Title & Description */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-extrabold text-[#001A4C] tracking-tight leading-tight">
                {t?.hero?.t1 || "Your Elder's"} <br />
                <span className="text-blue-700">{t?.hero?.t2 || "AI Cognitive Companion"}</span>
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed max-w-md">
                {t?.hero?.desc ||
                  "Smriti Saathi combines engaging activities, real-life memories, and cultural relevance to support better brain health and independence — while keeping families connected and doctors informed."}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                id="heroMainCta"
                onClick={() => onSelectRole && onSelectRole("patient")}
                className="bg-[#001A4C] text-white px-8 py-3.5 rounded-xl font-semibold flex items-center space-x-3 hover:bg-blue-900 transition shadow-lg shadow-blue-900/20 cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4 fill-white text-white" />
                <span>{t?.hero?.cta1 || "Start Therapy"}</span>
              </button>
              <button
                onClick={() => onSelectRole && onSelectRole("family")}
                className="bg-white text-[#001A4C] border border-gray-300 px-8 py-3.5 rounded-xl font-semibold flex items-center space-x-3 hover:bg-gray-50 transition cursor-pointer active:scale-95 shadow-xs"
              >
                <LayoutDashboard className="w-4 h-4 text-[#001A4C]" />
                <span>{t?.hero?.cta2 || "Caregiver Dashboard"}</span>
              </button>
              {onStartTour && (
                <button
                  type="button"
                  id="heroStartTourBtn"
                  onClick={() => onStartTour()}
                  className="bg-blue-50 hover:bg-blue-100 text-[#001A4C] border border-blue-200 px-6 py-3.5 rounded-xl font-semibold flex items-center space-x-2 transition cursor-pointer active:scale-95 shadow-xs"
                  title="Tutorial"
                >
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>{profile?.language === "hi" ? "ट्यूटोरियल" : "App Tutorial"}</span>
                </button>
              )}
            </div>

            {/* Trust Social Proof */}
            <div className="flex items-center space-x-4 pt-4 border-t border-gray-200 w-full max-w-md">
              <div className="flex -space-x-2">
                <img
                  className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 object-cover"
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80"
                  alt="User"
                />
                <img
                  className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                  alt="User"
                />
                <img
                  className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 object-cover"
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
                  alt="User"
                />
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                  2K+
                </div>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                {t?.hero?.trust || "Trusted by 2,000+ families & clinicians"}
              </p>
            </div>

          </div>

          {/* Right Column: Illustration & Floating Metric Cards */}
          <div className="hidden lg:flex w-full lg:w-1/2 relative justify-center lg:justify-end mt-12 lg:mt-0">
            
            <img
              src={`${import.meta.env.BASE_URL}images/hero_elder_tablet.svg`}
              alt="Elderly man using tablet"
              className="hidden lg:block w-full max-w-lg object-contain rounded-2xl relative z-0 min-h-[450px] bg-[#e2e8f0]/40 p-4"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = `${import.meta.env.BASE_URL}images/hero_bento_elder.svg`;
              }}
            />
            
            {/* Card 1: Today's Progress */}
            <div className="hidden lg:block absolute top-4 -left-8 lg:-left-12 bg-white p-4 rounded-xl shadow-lg border border-gray-50 w-56 z-20">
              <h3 className="text-xs font-bold text-gray-700 mb-3">Today's Progress</h3>
              <div className="w-full h-12 mb-3 relative">
                <svg viewBox="0 0 100 40" className="w-full h-full stroke-blue-700 fill-none" preserveAspectRatio="none">
                  <path d="M0,30 L20,25 L40,28 L60,15 L80,20 L100,5" strokeWidth="2" />
                  <circle cx="0" cy="30" r="3" className="fill-blue-700" />
                  <circle cx="20" cy="25" r="3" className="fill-blue-700" />
                  <circle cx="40" cy="28" r="3" className="fill-blue-700" />
                  <circle cx="60" cy="15" r="3" className="fill-blue-700" />
                  <circle cx="80" cy="20" r="3" className="fill-blue-700" />
                  <circle cx="100" cy="5" r="3" className="fill-blue-700" />
                </svg>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Score</p>
                  <p className="font-bold text-gray-800 text-lg">
                    {tasks.filter((t) => t.status === "completed").length > 0
                      ? `${Math.round(
                          tasks
                            .filter((t) => t.status === "completed")
                            .reduce((acc, curr) => acc + (curr.score || 90), 0) /
                            tasks.filter((t) => t.status === "completed").length
                        )}%`
                      : "90%"}
                  </p>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Streak</p>
                  <p className="font-bold text-gray-800 text-lg">{userStreak} Days</p>
                </div>
              </div>
            </div>

            {/* Card 2: Daily Goal */}
            <div 
              onClick={() => onSelectRole && onSelectRole("patient")}
              className="hidden lg:flex absolute top-1/2 -translate-y-1/2 -left-12 lg:-left-16 bg-white p-4 rounded-xl shadow-lg border border-gray-50 w-36 z-20 flex-col items-center cursor-pointer hover:shadow-xl transition"
              title="Click to view Daily Tasks & Goals"
            >
              <h3 className="text-xs font-bold text-gray-700 mb-4 self-start">Daily Goal</h3>
              <div className="w-20 h-20 relative mb-3 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-700 transition-all duration-700"
                    strokeDasharray={`${goalPercent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center z-10 font-bold text-xl text-[#001A4C]">
                  {completedCount}/{totalGoalCount}
                </div>
              </div>
              <p className="text-[10px] font-medium text-gray-500 text-center leading-tight">
                Activities<br />Completed
              </p>
            </div>

            {/* Card 3: Current Activity */}
            <div 
              onClick={() => onSelectRole && onSelectRole("patient")}
              className="hidden lg:flex absolute bottom-10 -left-6 lg:-left-10 bg-white p-4 rounded-xl shadow-lg border border-gray-50 w-64 z-20 items-center justify-between cursor-pointer hover:shadow-xl transition"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-blue-50 text-blue-700 p-2.5 rounded-lg text-xl flex items-center justify-center">
                  <Puzzle className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-semibold mb-0.5">Current Activity</p>
                  <p className="text-sm font-bold text-gray-800 leading-tight truncate max-w-[150px]">{currentTask.title}</p>
                  <p className="text-[10px] text-gray-500 truncate max-w-[150px]">{currentTask.description}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

          </div>

        </section>

        {/* 5 Feature Benefit Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 mt-14 sm:mt-16 pt-6 border-t border-slate-200/80">
          
          {/* Card 1: Daily Cognitive Workouts */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-[#001A4C]/30 hover:shadow-md transition group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#001A4C] flex items-center justify-center group-hover:bg-[#001A4C] group-hover:text-white transition">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-[#0F172A] text-sm sm:text-base leading-snug">
                  {t?.hero?.b1Title || "Daily Cognitive Workouts"}
                </h4>
                <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
                  {t?.hero?.b1Desc || "Science-backed games for memory, pattern recall, and speed."}
                </p>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center text-[11px] font-bold text-[#001A4C] group-hover:translate-x-1 transition">
              <span>Explore exercises</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 2: Cultural Memory Lane */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-[#001A4C]/30 hover:shadow-md transition group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-[#0F172A] text-sm sm:text-base leading-snug">
                  {t?.hero?.b2Title || "Cultural Memory Lane"}
                </h4>
                <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
                  {t?.hero?.b2Desc || "Old songs, classic recipes, historical landmarks, and memories."}
                </p>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center text-[11px] font-bold text-[#001A4C] group-hover:translate-x-1 transition">
              <span>View nostalgic recall</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 3: Caregiver Insights */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-[#001A4C]/30 hover:shadow-md transition group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:bg-[#001A4C] group-hover:text-white transition">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-[#0F172A] text-sm sm:text-base leading-snug">
                  {t?.hero?.b3Title || "Caregiver Insights"}
                </h4>
                <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
                  {t?.hero?.b3Desc || "Cognitive trends, adherence alerts, and doctor-ready reports."}
                </p>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center text-[11px] font-bold text-[#001A4C] group-hover:translate-x-1 transition">
              <span>Open dashboard</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 4: Daily Routine Support */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-[#001A4C]/30 hover:shadow-md transition group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-[#0F172A] text-sm sm:text-base leading-snug">
                  {t?.hero?.b4Title || "Daily Routine Support"}
                </h4>
                <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
                  {t?.hero?.b4Desc || "Gentle voice reminders for hydration, meds, and walks."}
                </p>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center text-[11px] font-bold text-[#001A4C] group-hover:translate-x-1 transition">
              <span>See daily support</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 5: Clinician Connected */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-[#001A4C]/30 hover:shadow-md transition group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-[#0F172A] text-sm sm:text-base leading-snug">
                  {t?.hero?.b5Title || "Clinician Connected"}
                </h4>
                <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
                  {t?.hero?.b5Desc || "Share longitudinal cognitive health metrics with your doctor."}
                </p>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center text-[11px] font-bold text-[#001A4C] group-hover:translate-x-1 transition">
              <span>Clinical export</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
