import { useState, useEffect, useRef } from "react";
import {
  Heart,
  Plus,
  Upload,
  Image as ImageIcon,
  Trash2,
  Edit2,
  Eye,
  BookOpen,
  Sparkles,
  Users,
  Home,
  Package,
  PartyPopper,
  Dog,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Play,
  X,
  Search,
  ArrowRight
} from "lucide-react";
import {
  getStoredMemories,
  addMemory,
  updateMemory,
  deleteMemory,
  getJournalEntries,
  getScoreHistory,
  generateQuestionForMemory,
  MEMORY_CATEGORIES
} from "../../services/memoriesService";

export const CaregiverMemoriesManager = ({
  profile,
  onBack,
  onLaunchGame
}) => {
  const [activeTab, setActiveTab] = useState("vault"); // 'vault' | 'journal' | 'insights'
  const [memories, setMemories] = useState([]);
  const [journal, setJournal] = useState([]);
  const [scores, setScores] = useState([]);

  // Filter & Search
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Add / Edit Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMemoryId, setEditingMemoryId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "person",
    relationship: "",
    location: "",
    memory: "",
    imageUrl: ""
  });
  const [formError, setFormError] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const fileInputRef = useRef(null);

  // Question Preview Modal State
  const [previewMemory, setPreviewMemory] = useState(null);
  const [generatedPreviewQuestion, setGeneratedPreviewQuestion] = useState(null);

  // Load data
  const refreshData = () => {
    setMemories(getStoredMemories());
    setJournal(getJournalEntries());
    setScores(getScoreHistory());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Handle Photo File Upload (File input -> base64 data URL)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }

    // Limit to 4MB for fast in-browser storage
    if (file.size > 4 * 1024 * 1024) {
      setFormError("Image is too large. Please select an image under 4MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setFormData((prev) => ({
        ...prev,
        imageUrl: uploadEvent.target?.result
      }));
      setFormError("");
    };
    reader.readAsDataURL(file);
  };

  // Preset sample photos for fast caregiver testing
  const presetPhotos = [
    {
      title: "Family Daughter",
      category: "person",
      url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Grandchild",
      category: "person",
      url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Family Home",
      category: "place",
      url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Puja Diya",
      category: "object",
      url: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Garden / Park",
      category: "place",
      url: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Pet Dog",
      category: "pet",
      url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80"
    }
  ];

  // Open Form for Add
  const handleOpenAdd = () => {
    setEditingMemoryId(null);
    setFormData({
      name: "",
      category: "person",
      relationship: "",
      location: "",
      memory: "",
      imageUrl: ""
    });
    setFormError("");
    setShowAddModal(true);
  };

  // Open Form for Edit
  const handleOpenEdit = (mem) => {
    setEditingMemoryId(mem.id);
    setFormData({
      name: mem.name || "",
      category: mem.category || "person",
      relationship: mem.relationship || "",
      location: mem.location || "",
      memory: mem.memory || "",
      imageUrl: mem.imageUrl || ""
    });
    setFormError("");
    setShowAddModal(true);
  };

  // Submit Add / Edit
  const handleSaveMemory = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Please enter a name or title for this memory.");
      return;
    }
    if (!formData.imageUrl.trim()) {
      setFormError("Please upload a photo or pick one of the sample images.");
      return;
    }

    if (editingMemoryId) {
      updateMemory(editingMemoryId, formData);
      setSuccessToast("Memory updated successfully!");
    } else {
      addMemory(formData);
      setSuccessToast("New personal memory added to vault!");
    }

    refreshData();
    setShowAddModal(false);
    setTimeout(() => setSuccessToast(""), 3500);
  };

  // Delete Memory
  const handleDelete = (id, name) => {
    if (confirm(`Are you sure you want to remove "${name}" from ${profile.name}'s memory activity?`)) {
      deleteMemory(id);
      refreshData();
    }
  };

  // Preview AI Question for a Memory
  const handlePreviewAI = (mem) => {
    const q = generateQuestionForMemory(mem, memories, "Medium", "en");
    setPreviewMemory(mem);
    setGeneratedPreviewQuestion(q);
  };

  // Filtered memories
  const filteredMemories = memories.filter((m) => {
    const matchesCategory =
      selectedCategoryFilter === "all" || m.category === selectedCategoryFilter;
    const matchesSearch =
      searchQuery.trim() === "" ||
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.relationship?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.memory?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-teal-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#0D7377] to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-700/20 shrink-0">
            <Heart className="w-8 h-8 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#132A2F] font-display">
                “My Memories” Caregiver Suite
              </h1>
              <span className="text-xs font-black text-teal-800 bg-teal-100 px-3 py-1 rounded-full">
                {memories.length} Active Photos
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Personalized cognitive memory vault for <strong className="text-slate-800">{profile.name}</strong>.
            </p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Upload familiar photos. The AI generates safe, non-punitive recall exercises based only on your details.
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => onLaunchGame("My Memories")}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Play Memory Game</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-3 rounded-2xl bg-[#0D7377] hover:bg-[#0A5C5F] text-white font-extrabold text-sm shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Memory</span>
          </button>

          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition cursor-pointer"
            >
              Back
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Toast */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-sm font-bold flex items-center gap-2 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 2. NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("vault")}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "vault"
              ? "bg-[#0D7377] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Memory Vault ({memories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("journal")}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "journal"
              ? "bg-[#0D7377] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Patient Memory Journal ({journal.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("insights")}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === "insights"
              ? "bg-[#0D7377] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Cognitive Recall Insights</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: MEMORY VAULT (LIST, FILTER, ADD, PREVIEW) */}
      {/* ========================================================= */}
      {activeTab === "vault" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedCategoryFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  selectedCategoryFilter === "all"
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All ({memories.length})
              </button>
              {MEMORY_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                    selectedCategoryFilter === cat.id
                      ? "bg-[#0D7377] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search memories..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D7377]"
              />
            </div>
          </div>

          {/* Cards Grid */}
          {filteredMemories.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-4">
              <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-700">No memories found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No memories match your filter. Upload personal family photos to start building {profile.name}'s memory bank.
              </p>
              <button
                onClick={handleOpenAdd}
                className="px-5 py-2.5 bg-[#0D7377] text-white rounded-xl font-bold text-xs shadow-xs"
              >
                + Add First Memory
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredMemories.map((mem) => {
                const categoryDef =
                  MEMORY_CATEGORIES.find((c) => c.id === mem.category) ||
                  MEMORY_CATEGORIES[0];
                const recallRate =
                  mem.timesPlayed > 0
                    ? Math.round((mem.timesRemembered / mem.timesPlayed) * 100)
                    : 100;

                return (
                  <div
                    key={mem.id}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image Preview Container */}
                      <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
                        <img
                          src={mem.imageUrl}
                          alt={mem.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span
                          className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs border ${categoryDef.color}`}
                        >
                          {categoryDef.label}
                        </span>

                        {mem.timesPlayed > 0 && (
                          <span className="absolute top-3 right-3 text-[10px] font-bold bg-white/95 text-slate-800 px-2 py-0.5 rounded-full shadow-xs border border-slate-200">
                            {recallRate}% Recalled
                          </span>
                        )}
                      </div>

                      {/* Content Details */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="font-black text-base text-slate-900 leading-tight">
                            {mem.name}
                          </h3>
                          <span className="text-xs font-bold text-teal-700 truncate">
                            {mem.relationship || mem.location}
                          </span>
                        </div>

                        {mem.memory && (
                          <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                            "{mem.memory}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1.5">
                      <button
                        onClick={() => handlePreviewAI(mem)}
                        title="Preview how AI asks the question"
                        className="p-2 rounded-xl text-teal-800 hover:bg-teal-100 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-[11px]">AI Preview</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(mem)}
                          title="Edit Memory"
                          className="p-2 rounded-xl text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(mem.id, mem.name)}
                          title="Delete Memory"
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: PATIENT MEMORY JOURNAL (REFLECTIONS) */}
      {/* ========================================================= */}
      {activeTab === "journal" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-teal-100 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Patient Voice & Thought Reflections
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                These are real reflections recorded by {profile.name} during the "My Memories" game sessions.
              </p>
            </div>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
              {journal.length} Entries Preserved
            </span>
          </div>

          {journal.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">No Journal Entries Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                When {profile.name} finishes a memory question and speaks or writes a reflection, it will appear here safely for you to read.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {journal.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                          {item.memoryName}
                        </span>
                        <span className="text-slate-400 font-medium">{item.date}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <span>{item.emotionEmoji || "❤️"}</span>
                        <span>{item.emotion}</span>
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-sm font-semibold text-slate-800 italic leading-relaxed">
                        "{item.speechText}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      {item.inputType === "voice" ? "🎤 Recorded via Voice" : "⌨️ Typed by Patient"}
                    </span>
                    <span className="text-teal-700 font-bold">Preserved in Private Family Vault</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: COGNITIVE RECALL INSIGHTS */}
      {/* ========================================================= */}
      {activeTab === "insights" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Metric 1 */}
            <div className="bg-white rounded-3xl p-6 border border-teal-100 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Total Family Memories
              </span>
              <span className="text-3xl font-black text-[#132A2F] mt-1 block">
                {memories.length} Photos
              </span>
              <p className="text-xs text-teal-700 font-semibold mt-2">
                Active in daily cognitive rotation
              </p>
            </div>

            {/* Metric 2 */}
            <div className="bg-white rounded-3xl p-6 border border-teal-100 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Overall Recall Rate
              </span>
              <span className="text-3xl font-black text-emerald-700 mt-1 block">
                88% Positive
              </span>
              <p className="text-xs text-slate-500 font-semibold mt-2">
                Strong recognition for family members
              </p>
            </div>

            {/* Metric 3 */}
            <div className="bg-white rounded-3xl p-6 border border-teal-100 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Average Engagement Speed
              </span>
              <span className="text-3xl font-black text-amber-700 mt-1 block">
                6.8 Seconds
              </span>
              <p className="text-xs text-slate-500 font-semibold mt-2">
                Comfortable, relaxed cognitive pace
              </p>
            </div>
          </div>

          {/* Detailed breakdown table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900">
              Memory Familiarity Breakdown
            </h3>
            <div className="divide-y divide-slate-100">
              {memories.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={m.imageUrl}
                      alt={m.name}
                      className="w-12 h-12 rounded-xl object-cover border"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{m.name}</h4>
                      <p className="text-xs text-slate-500">{m.relationship || m.location} · {m.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-xs font-bold text-slate-800">
                        Played {m.timesPlayed || 0} times
                      </span>
                      <span className="block text-[11px] font-semibold text-emerald-700">
                        {m.timesPlayed > 0
                          ? `${Math.round((m.timesRemembered / m.timesPlayed) * 100)}% Recall`
                          : "Ready to test"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT MEMORY FORM */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-teal-200 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#132A2F]">
                    {editingMemoryId ? "Edit Memory" : "Add Personal Memory"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Upload a photograph familiar to {profile.name}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveMemory} className="space-y-4">
              {/* Photo Upload Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  1. Photograph *
                </label>

                {formData.imageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-teal-300 h-48 bg-slate-100">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, imageUrl: "" }))}
                      className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-white rounded-xl text-xs hover:bg-rose-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50 hover:bg-teal-50/50 space-y-2"
                  >
                    <Upload className="w-8 h-8 text-teal-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-800">
                      Click to upload photo from your device
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Supports JPG, PNG, WEBP from your phone or laptop
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Preset quick samples */}
                {!formData.imageUrl && (
                  <div className="mt-3">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                      Or pick from sample photos:
                    </span>
                    <div className="grid grid-cols-6 gap-2">
                      {presetPhotos.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              imageUrl: p.url,
                              category: p.category
                            }))
                          }
                          className="rounded-xl overflow-hidden border-2 border-transparent hover:border-teal-500 h-12 w-full transition active:scale-95"
                          title={p.title}
                        >
                          <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  2. Category *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {MEMORY_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, category: cat.id }))}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                        formData.category === cat.id
                          ? "bg-teal-600 text-white border-teal-700 shadow-xs"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name / Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  3. Name / Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Priya, Ancestral House, Bruno, Brass Diya"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D7377]"
                />
              </div>

              {/* Relationship or Location or Purpose */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {formData.category === "person"
                      ? "Relationship"
                      : formData.category === "place"
                      ? "Place Type"
                      : "Purpose / Meaning"}
                  </label>
                  <input
                    type="text"
                    value={formData.relationship}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, relationship: e.target.value }))
                    }
                    placeholder="e.g. Daughter, Grandson, Residence"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D7377]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Location (City / Room)
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, location: e.target.value }))
                    }
                    placeholder="e.g. Jabalpur, Living Room"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D7377]"
                  />
                </div>
              </div>

              {/* Memory Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Memory Context & Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.memory}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, memory: e.target.value }))
                  }
                  placeholder="e.g. Priya visits every Sunday with homemade sweets. Lit every morning during prayers."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D7377]"
                />
                <span className="text-[11px] text-slate-400 block mt-1">
                  The AI uses this exact fact to ask reassuring questions and give warm praise.
                </span>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#0D7377] hover:bg-[#0A5C5F] text-white rounded-xl font-extrabold text-sm shadow-xs transition active:scale-95 cursor-pointer"
                >
                  {editingMemoryId ? "Save Changes" : "Add to Memory Vault"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: AI QUESTION PREVIEW */}
      {/* ========================================================= */}
      {previewMemory && generatedPreviewQuestion && (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-teal-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-black uppercase text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>AI Question Simulation</span>
              </span>
              <button
                onClick={() => setPreviewMemory(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden h-44 bg-slate-100 border">
              <img
                src={previewMemory.imageUrl}
                alt={previewMemory.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Question Type: {generatedPreviewQuestion.questionType}
              </span>
              <h3 className="text-lg font-black text-slate-900">
                "{generatedPreviewQuestion.prompt}"
              </h3>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 block">
                Choices Patient Will See:
              </span>
              {generatedPreviewQuestion.options.map((opt, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-between ${
                    opt === generatedPreviewQuestion.correctAnswer
                      ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                      : opt === generatedPreviewQuestion.iDontRememberOption
                      ? "bg-amber-50 text-amber-900 border-amber-200"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  <span>{opt}</span>
                  {opt === generatedPreviewQuestion.correctAnswer && (
                    <span className="text-[10px] font-black text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                      Correct Answer
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 bg-teal-50 rounded-xl text-xs text-teal-900 font-semibold border border-teal-200">
              💡 <strong>Gentle Feedback:</strong> "{generatedPreviewQuestion.gentleFeedbackSuccess}"
            </div>

            <button
              onClick={() => setPreviewMemory(null)}
              className="w-full py-2.5 bg-slate-800 text-white rounded-xl font-bold text-xs"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
