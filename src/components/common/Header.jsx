import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { translations } from "../../data/translations";
import { BrandBrainIcon } from "./BrandLogo";
import { realtimeTracker } from "../../services/realtimeTrackingService";
import {
  Brain,
  Wifi,
  WifiOff,
  Globe,
  ChevronDown,
  Check,
  MoreVertical,
  X,
  ChevronRight,
  Home,
  User,
  Users,
  Stethoscope,
  PhoneCall,
  LogIn,
  UserPlus,
  Bell,
  Clock,
  Lock,
  Sparkles,
  RefreshCw,
  LogOut
} from "lucide-react";
import { NotificationDropdown } from "./NotificationDropdown";

export const Header = ({
  currentRole = "home",
  onRoleChange,
  profile,
  onProfileUpdate,
  onOpenVoice,
  onOpenCaregiverCall,
  onOpenAuthModal,
  reminders = [],
  tasks = [],
  onToggleReminder,
  onStartTask,
  onAddReminder,
  onMarkAllRemindersDone
}) => {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const { currentUser, logout } = useAuth();
  const isDoctor = currentUser?.role === "doctor";

  // Sync listener for network connectivity
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (typeof realtimeTracker !== "undefined") {
        realtimeTracker.handleNetworkChange(true);
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      if (typeof realtimeTracker !== "undefined") {
        realtimeTracker.handleNetworkChange(false);
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSyncToggle = () => {
    if (!isOnline) {
      // In Yellow "Sync" state: syncing transitions to Green "Synced"
      setIsSyncing(true);
      if (typeof realtimeTracker !== "undefined") {
        realtimeTracker.handleNetworkChange(true);
        realtimeTracker.syncOfflineQueue();
      }
      setTimeout(() => {
        setIsOnline(true);
        setIsSyncing(false);
        setSyncSuccess(true);
        setTimeout(() => setSyncSuccess(false), 2000);
      }, 800);
    } else {
      // In Green "Synced" state: toggle to Yellow "Sync" (offline mode)
      setIsOnline(false);
      if (typeof realtimeTracker !== "undefined") {
        realtimeTracker.handleNetworkChange(false);
      }
    }
  };

  const handleSync = () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    if (typeof realtimeTracker !== "undefined") {
      realtimeTracker.syncOfflineQueue();
    }
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);
      setIsOnline(true);
      setTimeout(() => setSyncSuccess(false), 2000);
    }, 800);
  };

  const t = translations[profile?.language] || translations.en;

  const pendingReminders = reminders.filter((r) => !r.completed);
  const pendingTasks = tasks.filter((t) => t.status !== "completed");
  const totalPending = pendingReminders.length + pendingTasks.length;

  const langOptions = [
    { code: "en", label: "English", flag: "🌐" },
    { code: "hi", label: "हिंदी", flag: "🇮🇳" },
    { code: "as", label: "অসমীয়া", flag: "🇮🇳" },
    { code: "bn", label: "বাংলা", flag: "🇮🇳" },
    { code: "mni", label: "মৈতৈলোন্", flag: "🇮🇳" },
    { code: "lus", label: "Mizo ṭawng", flag: "🇮🇳" }
  ];

  // Close dropdowns on outside click or Esc key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest("#header-three-dots-btn")
      ) {
        setMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setLangDropdownOpen(false);
        setUserDropdownOpen(false);
        setMobileMenuOpen(false);
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const brandName =
    profile?.language === "hi"
      ? "स्मृति साथी"
      : profile?.language === "as"
      ? "স্মৃতি সংগী"
      : profile?.language === "bn"
      ? "স্মৃতি সঙ্গী"
      : profile?.language === "mni"
      ? "স্মৃতি সংগী"
      : profile?.language === "lus"
      ? "SMRITI SATHI"
      : "SMRITI SATHI";

  const brandTagline =
    profile?.language === "hi"
      ? "AI संज्ञानात्मक साथी"
      : profile?.language === "as"
      ? "AI ज्ञानীয় সংগী"
      : profile?.language === "bn"
      ? "AI কগনিটিভ সঙ্গী"
      : profile?.language === "mni"
      ? "AI ৱাখলগী সংগী"
      : profile?.language === "lus"
      ? "AI Cognitive Companion"
      : "AI Cognitive Companion";

  // Subtitle in header: Show the name of the logged-in doctor, patient, or caregiver
  const userTagline = currentUser
    ? currentUser.role === "doctor"
      ? (currentUser.name?.startsWith("Dr.") ? currentUser.name : `Dr. ${currentUser.name}`)
      : currentUser.role === "patient"
      ? (currentUser.name?.startsWith("Patient:") ? currentUser.name : `Patient: ${currentUser.name}`)
      : currentUser.role === "family"
      ? `Caregiver: ${currentUser.name}`
      : currentUser.name
    : brandTagline;

  const navLinks = [
    { id: "home", label: t?.nav?.home || "Home", icon: Home },
    { id: "patient", label: t?.nav?.patient || "Patient", icon: User },
    { id: "family", label: t?.nav?.caregiver || "Caregiver", icon: Users },
    { id: "doctor", label: t?.nav?.doctor || "Doctor", icon: Stethoscope }
  ];

  return (
    <header className="sticky top-0 z-[10050] bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18 gap-1.5 sm:gap-2.5 lg:gap-3">
          
          {/* Left Cluster: Logo & Navigation shifted left */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4 shrink-0">
            {/* Logo & Brand Identity - smaller and sleeker */}
            <button
              onClick={() => onRoleChange("home")}
              className="flex items-center gap-1.5 sm:gap-2 text-left group transition cursor-pointer shrink-0"
              title="Go to Home"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-8.5 lg:h-8.5 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 drop-shadow-xs">
                <BrandBrainIcon className="w-full h-full" />
              </div>
              <div className="shrink-0">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="font-bold text-sm sm:text-base lg:text-lg text-[#001F54] tracking-[0.03em] whitespace-nowrap font-serif leading-none">
                    {brandName}
                  </span>
                </div>
                <span
                  className="text-[10px] font-semibold text-slate-500 hidden xl:block whitespace-nowrap mt-0.5"
                  title={brandTagline}
                >
                  {brandTagline}
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 text-xs lg:text-sm font-semibold shrink-0">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = currentRole === item.id;
                const isLockedForUser = item.id === "doctor" && !isDoctor;
                return (
                  <button
                    key={item.id}
                    id={`header-nav-${item.id}`}
                    onClick={() => onRoleChange(item.id)}
                    title={isLockedForUser ? "Doctor Portal (Doctor Login Required)" : item.label}
                    className={`relative flex items-center gap-1 lg:gap-1.5 px-2 lg:px-2.5 py-1.5 lg:py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "text-[#1D4ED8] font-bold bg-[#EFF6FF] border border-[#DBEAFE]/80 shadow-xs"
                        : "text-slate-600 hover:text-[#1D4ED8] hover:bg-slate-50 font-medium"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? "text-[#2563EB]" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#2563EB] rounded-full"></span>
                    )}
                    {isLockedForUser && (
                      <Lock className="w-3 h-3 text-slate-400 opacity-75 shrink-0" />
                    )}
                  </button>
                );
              })}

              {/* Reminders with notification counter */}
              <button
                id="header-notification-btn"
                onClick={() => setNotificationOpen(!notificationOpen)}
                className={`relative flex items-center gap-1 lg:gap-1.5 px-2 lg:px-2.5 py-1.5 lg:py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  notificationOpen
                    ? "bg-blue-50 text-[#1D4ED8] font-bold"
                    : "text-slate-600 hover:text-[#1D4ED8] hover:bg-slate-50 font-medium"
                }`}
                title="Your Reminders & Daily Tasks"
              >
                <div className="relative flex items-center">
                  <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
                  {totalPending > 0 ? (
                    <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-white font-extrabold text-[10px] ring-2 ring-white">
                      {totalPending}
                    </span>
                  ) : (
                    <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white font-black text-[9px] ring-2 ring-white" title="All Completed">
                      ✓
                    </span>
                  )}
                </div>
                <span>Reminders</span>
              </button>
            </nav>
          </div>

          {/* Right Header Actions - Compact and shifted left */}
          <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 shrink-0 pl-1 md:pl-2 md:border-l md:border-slate-200/80">
            
            {/* Contact Caregiver Action Button */}
            <button
              onClick={() => {
                if (onOpenCaregiverCall) onOpenCaregiverCall();
              }}
              className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-800 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 whitespace-nowrap"
              title="Call Family Caregiver / Emergency Contact"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
              <span>Contact</span>
            </button>

            {/* Single Combined Button: Green "Synced" or Yellow "Sync" with Wifi Logo */}
            <button
              id="header-sync-btn"
              type="button"
              onClick={handleSyncToggle}
              disabled={isSyncing}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 whitespace-nowrap border ${
                isOnline
                  ? "bg-emerald-50 hover:bg-emerald-100/90 border-emerald-300 text-emerald-800"
                  : "bg-amber-50 hover:bg-amber-100/90 border-amber-300 text-amber-900"
              }`}
              title={
                isOnline
                  ? "Green: Synced (Click to switch to yellow Sync)"
                  : "Yellow: Sync (Click to sync and switch to green Synced)"
              }
            >
              <span className="relative flex items-center shrink-0">
                <Wifi
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isOnline ? "text-emerald-600" : "text-amber-600"
                  }`}
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
                    isOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                  }`}
                />
              </span>
              <RefreshCw
                className={`w-3 h-3 shrink-0 ${
                  isSyncing
                    ? "animate-spin text-blue-600"
                    : isOnline
                    ? "text-emerald-700"
                    : "text-amber-700"
                }`}
              />
              <span>
                {isSyncing ? "Syncing..." : isOnline ? "Synced" : "Sync"}
              </span>
            </button>

            {/* Auth Button: When NO user is signed in, show Sign In button on desktop. When signed in, show compact user button with integrated Logout inside */}
            {!currentUser ? (
              <button
                id="header-signin-btn"
                onClick={() => {
                  if (onOpenAuthModal) onOpenAuthModal({ mode: "login" });
                }}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg bg-[#001A4C] hover:bg-[#002466] text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
                title="Sign In / Register"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            ) : (
              /* When user IS signed in, show compact profile button on navbar; logout is placed inside the dropdown */
              <div className="relative hidden md:block shrink-0" ref={userDropdownRef}>
                <button
                  id="header-user-profile-btn"
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg bg-[#001A4C] hover:bg-[#002466] text-white text-xs font-bold transition shadow-xs border border-[#002466] cursor-pointer active:scale-95"
                  title={`Logged in as ${currentUser.name} (${currentUser.role || "User"}). Click for options.`}
                >
                  <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-extrabold uppercase shrink-0">
                    {currentUser.name ? currentUser.name.charAt(0) : "U"}
                  </div>
                  <span className="max-w-[90px] lg:max-w-[130px] truncate leading-tight">
                    {currentUser.name}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 text-white/70 transition-transform ${
                      userDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* User Dropdown with Profile details & Sign Out option */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-slate-800">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] text-slate-500 capitalize flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                        <span>{currentUser.role || "User"}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        if (onOpenAuthModal) onOpenAuthModal({ mode: "profile" });
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>My Profile</span>
                    </button>
                    <div className="my-1 border-t border-slate-100"></div>
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        if (logout) logout();
                        if (onRoleChange) onRoleChange("home");
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-bold flex items-center gap-2 hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Language Selector Dropdown (Desktop & Tablet) */}
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button
                id="header-lang-toggle"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700 transition cursor-pointer"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden lg:inline">
                  {langOptions.find((l) => l.code === (profile?.language || "en"))?.label || "English"}
                </span>
                <span className="lg:hidden uppercase font-bold text-[11px]">
                  {(profile?.language || "en")}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Language
                  </div>
                  {langOptions.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => {
                        if (onProfileUpdate) onProfileUpdate({ language: opt.code });
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between hover:bg-blue-50 transition cursor-pointer ${
                        (profile?.language || "en") === opt.code
                          ? "text-blue-600 font-bold bg-blue-50/70"
                          : "text-slate-700"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{opt.flag}</span>
                        <span>{opt.label}</span>
                      </span>
                      {(profile?.language || "en") === opt.code && (
                        <Check className="w-3.5 h-3.5 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Reminder Bell Icon Button */}
            <div className="md:hidden flex items-center shrink-0">
              <button
                id="header-mobile-notification-btn"
                type="button"
                onClick={() => setNotificationOpen(!notificationOpen)}
                className={`p-2 sm:p-2.5 rounded-xl transition cursor-pointer flex items-center justify-center border shadow-xs relative ${
                  notificationOpen
                    ? "bg-blue-50 border-blue-200 text-blue-600 ring-2 ring-blue-100"
                    : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
                }`}
                aria-label="Your Reminders & Daily Tasks"
                title="Reminders & Notifications"
              >
                <Bell className="w-5 h-5 text-slate-700" />
                {totalPending > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-white font-extrabold text-[10px] ring-2 ring-white animate-pulse">
                    {totalPending}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Three Dots Menu Button - ALWAYS visible on mobile whether logged in or not */}
            <div className="md:hidden flex items-center shrink-0">
              <button
                id="header-three-dots-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 sm:p-2.5 rounded-xl text-slate-700 transition cursor-pointer flex items-center justify-center border shadow-xs ${
                  mobileMenuOpen
                    ? "bg-blue-50 border-blue-200 text-blue-600 ring-2 ring-blue-100"
                    : "bg-slate-100 border-slate-200 hover:bg-slate-200"
                }`}
                aria-label="Toggle navigation menu"
                title="Open Menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <MoreVertical className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu (Accessible for ALL users, logged in or guests) */}
        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden mt-1 pb-5 pt-3 border-t border-slate-200 space-y-4 max-h-[82vh] overflow-y-auto overscroll-contain animate-in fade-in slide-in-from-top-2 duration-150 rounded-b-2xl bg-white shadow-xl px-3"
          >
            {/* Header bar of the mobile dropdown */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Menu & Navigation
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition flex items-center gap-1 cursor-pointer"
              >
                <span className="text-[11px] font-bold">Close</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Auth Section: When NOT logged in, show prominent Sign In card inside navbar menu */}
            {!currentUser ? (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50/90 to-indigo-50/70 border border-blue-100 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-full bg-[#001A4C] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#001A4C] truncate">
                      Welcome, Guest
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      Sign in for games, reports & sync
                    </div>
                  </div>
                </div>
                <button
                  id="mobile-menu-signin-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenAuthModal) onOpenAuthModal({ mode: "login" });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg bg-[#001A4C] hover:bg-[#002466] text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
                  title="Sign In / Register"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            ) : (
              /* Mobile User Info Section when logged in */
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2">
                <div
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenAuthModal) {
                      onOpenAuthModal({ mode: "profile" });
                    }
                  }}
                  className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                  title="View Profile"
                >
                  <div className="w-9 h-9 rounded-full bg-[#001A4C] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#0F172A] truncate flex items-center gap-1.5">
                      <span>{currentUser.name}</span>
                      {currentUser?.role && (
                        <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded uppercase">
                          {currentUser.role}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {currentUser.role === "doctor"
                        ? "Doctor Account"
                        : currentUser.role === "patient"
                        ? "Patient Account"
                        : "Caregiver Account"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (logout) logout();
                    if (onRoleChange) onRoleChange("home");
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer shadow-xs bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 active:scale-95"
                >
                  Sign Out
                </button>
              </div>
            )}

            <div>
              <div className="px-1 py-1 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                Navigation
              </div>
              <div className="space-y-1 mt-1">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentRole === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onRoleChange(item.id);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-between transition cursor-pointer ${
                        isActive
                          ? "bg-blue-50 text-[#1D4ED8] font-bold border border-blue-100"
                          : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-1.5 rounded-lg ${
                            isActive
                              ? "bg-[#2563EB] text-white shadow-xs"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 ${
                          isActive ? "text-blue-600" : "text-slate-300"
                        }`}
                      />
                    </button>
                  );
                })}

                {/* Mobile Reminders Button */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setNotificationOpen(true);
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-between text-slate-700 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500">
                      <Bell className="w-4 h-4" />
                    </div>
                    <span>Reminders</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold">
                    {totalPending}
                  </span>
                </button>

                {/* Mobile Contact Caregiver Button */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenCaregiverCall) onOpenCaregiverCall();
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-between text-slate-700 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <span>Contact Caregiver</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Call
                  </span>
                </button>

                {/* Mobile Single Combined Button: Green "Synced" or Yellow "Sync" with Wifi Logo */}
                <button
                  type="button"
                  onClick={handleSyncToggle}
                  disabled={isSyncing}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-between transition cursor-pointer border shadow-xs active:scale-98 ${
                    isOnline
                      ? "bg-emerald-50/90 hover:bg-emerald-100/80 border-emerald-300 text-emerald-950"
                      : "bg-amber-50/90 hover:bg-amber-100/80 border-amber-300 text-amber-950"
                  }`}
                  title={
                    isOnline
                      ? "Green: Synced (Tap to switch to yellow Sync)"
                      : "Yellow: Sync (Tap to sync data and switch to green Synced)"
                  }
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-lg relative flex items-center justify-center shrink-0 ${
                        isOnline
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      <Wifi className="w-4 h-4" />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${
                          isOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                        }`}
                      />
                    </div>
                    <span className="font-bold">Sync Data</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition shadow-2xs ${
                      isSyncing
                        ? "bg-blue-600 text-white border-blue-700"
                        : isOnline
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700"
                        : "bg-amber-500 hover:bg-amber-600 text-white border-amber-600"
                    }`}
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`}
                    />
                    <span>
                      {isSyncing
                        ? "Syncing..."
                        : isOnline
                        ? "Synced"
                        : "Sync"}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Mobile Language Selector */}
            <div className="pt-2 border-t border-slate-100">
              <div className="px-3 py-1 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Language</span>
              </div>
              <div className="grid grid-cols-2 gap-2 px-1 pt-1.5">
                {langOptions.map((opt) => {
                  const isSelected = (profile?.language || "en") === opt.code;
                  return (
                    <button
                      key={opt.code}
                      onClick={() => {
                        if (onProfileUpdate) onProfileUpdate({ language: opt.code });
                        setMobileMenuOpen(false);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between border transition cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 border-blue-300 text-blue-700 font-bold shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{opt.flag}</span>
                        <span>{opt.label}</span>
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Explicit Sign Out or Return / Sign In Action */}
            <div className="pt-2 border-t border-slate-100">
              {currentUser ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (logout) logout();
                    if (onRoleChange) onRoleChange("home");
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 shadow-xs"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Sign Out of Smriti Saathi</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenAuthModal) onOpenAuthModal({ mode: "login" });
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#001A4C] hover:bg-[#002466] text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 shadow-xs"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In / Register</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reminders & Daily Tasks Notification Modal */}
      <NotificationDropdown
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        reminders={reminders}
        tasks={tasks}
        onToggleReminder={onToggleReminder}
        onStartTask={(task) => {
          if (onStartTask) onStartTask(task);
        }}
        onAddReminder={onAddReminder}
        onMarkAllDone={onMarkAllRemindersDone}
        profile={profile}
      />
    </header>
  );
};

