import { useState, useEffect } from "react";
import {
  Settings,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Volume2,
  Clock,
  Sparkles,
  Shield,
  Layers,
  Search,
  Eye,
  RotateCcw,
  BarChart2,
  ChevronLeft,
  X,
  Upload,
  Info
} from "lucide-react";
import {
  DEFAULT_OBJECT_LIBRARY,
  getCaregiverConfig,
  saveCaregiverConfig,
  getCustomObjects,
  addCustomObject,
  getFindItAnalytics,
  getFindItSessions
} from "../../services/findItService";

export const FindItCaregiverSuite = ({ isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState("home_objects"); // 'home_objects' | 'settings' | 'custom_objects' | 'analytics'
  const [config, setConfig] = useState(getCaregiverConfig());
  const [customObjects, setCustomObjects] = useState(getCustomObjects());
  const [analytics, setAnalytics] = useState(getFindItAnalytics());
  const [sessions, setSessions] = useState(getFindItSessions());
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New custom object form
  const [newCustom, setNewCustom] = useState({
    name: "",
    hindiName: "",
    category: "personal",
    difficulty: "easy",
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
    caregiverNote: "",
    iconEmoji: "⭐"
  });

  useEffect(() => {
    if (isOpen) {
      setConfig(getCaregiverConfig());
      setCustomObjects(getCustomObjects());
      setAnalytics(getFindItAnalytics());
      setSessions(getFindItSessions());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleObject = (objId) => {
    const currentList = config.enabledObjectIds || DEFAULT_OBJECT_LIBRARY.map((o) => o.id);
    let updated;
    if (currentList.includes(objId)) {
      if (currentList.length <= 2) {
        alert("Please keep at least 2 objects enabled for the game.");
        return;
      }
      updated = currentList.filter((id) => id !== objId);
    } else {
      updated = [...currentList, objId];
    }
    const newConfig = { ...config, enabledObjectIds: updated };
    setConfig(newConfig);
  };

  const handleSelectAll = () => {
    const allIds = [...DEFAULT_OBJECT_LIBRARY, ...customObjects].map((o) => o.id);
    setConfig({ ...config, enabledObjectIds: allIds });
  };

  const handleSaveAll = () => {
    saveCaregiverConfig(config);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      if (onSave) onSave(config);
      onClose();
    }, 700);
  };

  const handleCreateCustomObject = (e) => {
    e.preventDefault();
    if (!newCustom.name.trim()) return;

    const created = addCustomObject(newCustom);
    if (created) {
      setCustomObjects(getCustomObjects());
      setConfig(getCaregiverConfig());
      setNewCustom({
        name: "",
        hindiName: "",
        category: "personal",
        difficulty: "easy",
        imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
        caregiverNote: "",
        iconEmoji: "⭐"
      });
      alert(`"${created.name}" added to patient's object hunt!`);
    }
  };

  const allAvailable = [...DEFAULT_OBJECT_LIBRARY, ...customObjects];

  return (
    <div className="fixed inset-0 z-[25000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-xl font-bold">
              🔎
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Caregiver Control — Find It!
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                Home objects availability, custom family items & cognitive trends
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab("home_objects")}
            className={`px-4 py-3 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition border-b-2 ${
              activeTab === "home_objects"
                ? "border-emerald-600 text-emerald-800 bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Objects at Home ({config.enabledObjectIds?.length || allAvailable.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-3 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition border-b-2 ${
              activeTab === "settings"
                ? "border-emerald-600 text-emerald-800 bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Game Settings</span>
          </button>

          <button
            onClick={() => setActiveTab("custom_objects")}
            className={`px-4 py-3 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition border-b-2 ${
              activeTab === "custom_objects"
                ? "border-emerald-600 text-emerald-800 bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-teal-600" />
            <span>Add Custom Object</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-3 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition border-b-2 ${
              activeTab === "analytics"
                ? "border-emerald-600 text-emerald-800 bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Activity Analytics</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* TAB 1: Objects Available at Home */}
          {activeTab === "home_objects" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-2xl">
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-900">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Select which everyday objects exist in the patient's room or home.
                    The AI will prioritize these during the hunt.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2.5 py-1 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold cursor-pointer transition"
                >
                  Select All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {allAvailable.map((obj) => {
                  const isEnabled = (config.enabledObjectIds || []).includes(obj.id);
                  return (
                    <div
                      key={obj.id}
                      onClick={() => handleToggleObject(obj.id)}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
                        isEnabled
                          ? "bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400/30"
                          : "bg-slate-50 border-slate-200 opacity-60 hover:opacity-80"
                      }`}
                    >
                      <img
                        src={obj.imageUrl}
                        alt={obj.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{obj.iconEmoji}</span>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {obj.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {obj.hindiName} • {obj.category}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => {}} // handled by parent div
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Game Settings */}
          {activeTab === "settings" && (
            <div className="space-y-4">
              {/* Difficulty */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block text-xs font-extrabold text-slate-800 mb-2">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "easy", label: "Easy", desc: "Common cups, spoons, books with large photos" },
                    { key: "medium", label: "Medium", desc: "Remotes, watches, bags, toothbrushes" },
                    { key: "advanced", label: "Advanced", desc: "Requires fine visual discrimination" }
                  ].map((level) => (
                    <button
                      key={level.key}
                      type="button"
                      onClick={() => setConfig({ ...config, difficulty: level.key })}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                        config.difficulty === level.key
                          ? "bg-emerald-100/70 border-emerald-500 font-black text-emerald-900"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="text-xs font-bold">{level.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{level.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Session Length */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block text-xs font-extrabold text-slate-800 mb-2">
                  Session Length (Objects per round)
                </label>
                <div className="flex gap-3">
                  {[5, 10, 15].map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setConfig({ ...config, sessionLength: len })}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition ${
                        config.sessionLength === len
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {len} Objects {len === 10 && "(Recommended)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timer Toggle */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Gentle Timer (Optional)</div>
                  <div className="text-[11px] text-slate-500">
                    Default is OFF so elderly patients feel zero rush.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, timerEnabled: !config.timerEnabled })}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    config.timerEnabled ? "bg-emerald-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                      config.timerEnabled ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* Language & Voice */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Instruction Voice Language</div>
                    <div className="text-[11px] text-slate-500">Speech instructions for elderly reassurance</div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, language: "en" })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                        config.language === "en"
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, language: "hi" })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                        config.language === "hi"
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      हिन्दी
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Object Association Bonus Question</div>
                    <div className="text-[11px] text-slate-500">
                      Fun secondary cognitive question after finding each item (e.g. "What do we use a spoon for?")
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.associationBonusEnabled !== false}
                    onChange={(e) =>
                      setConfig({ ...config, associationBonusEnabled: e.target.checked })
                    }
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Add Custom Object */}
          {activeTab === "custom_objects" && (
            <div className="space-y-4">
              <div className="bg-teal-50 border border-teal-200 p-3 rounded-2xl text-xs text-teal-900 font-medium">
                Add special personal objects familiar to the patient, like{" "}
                <span className="font-bold">“Dad's Favorite Tea Cup”</span> or{" "}
                <span className="font-bold">“Grandma's Reading Glasses”</span>.
              </div>

              <form onSubmit={handleCreateCustomObject} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Object Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dad's Morning Tea Mug"
                    value={newCustom.name}
                    onChange={(e) => setNewCustom({ ...newCustom, name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hindi Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. पिताजी का चाय का कप"
                    value={newCustom.hindiName}
                    onChange={(e) => setNewCustom({ ...newCustom, hindiName: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={newCustom.category}
                      onChange={(e) => setNewCustom({ ...newCustom, category: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="kitchen">Kitchen</option>
                      <option value="personal">Personal Item</option>
                      <option value="household">Household</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Target Vision Type
                    </label>
                    <select
                      value={newCustom.targetCocoClass || "cup"}
                      onChange={(e) => setNewCustom({ ...newCustom, targetCocoClass: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="cup">Cup / Mug</option>
                      <option value="bottle">Water Bottle</option>
                      <option value="book">Book / Diary</option>
                      <option value="cell phone">Phone</option>
                      <option value="chair">Chair</option>
                      <option value="clock">Clock / Watch</option>
                      <option value="spoon">Spoon</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Caregiver Context & Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. This is the ceramic blue mug Dad uses every morning."
                    value={newCustom.caregiverNote}
                    onChange={(e) => setNewCustom({ ...newCustom, caregiverNote: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Game Library</span>
                </button>
              </form>

              {customObjects.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-800">
                    Existing Custom Objects ({customObjects.length})
                  </h4>
                  <div className="space-y-1.5">
                    {customObjects.map((co) => (
                      <div
                        key={co.id}
                        className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span>{co.iconEmoji}</span>
                          <div>
                            <div className="font-bold text-slate-900">{co.name}</div>
                            <div className="text-[11px] text-slate-500">{co.caregiverNote}</div>
                          </div>
                        </div>
                        <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded">
                          {co.targetCocoClass}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Analytics */}
          {activeTab === "analytics" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                  <div className="text-xl font-black text-emerald-800">{analytics.totalFound}</div>
                  <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                    Objects Found
                  </div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-center">
                  <div className="text-xl font-black text-blue-800">{analytics.totalSkipped}</div>
                  <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                    Skipped (No Penalty)
                  </div>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-center">
                  <div className="text-xl font-black text-amber-800">{analytics.averageSearchTimeSec}s</div>
                  <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                    Avg Search Time
                  </div>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-center">
                  <div className="text-xl font-black text-purple-800">{analytics.totalSessions}</div>
                  <div className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">
                    Sessions Played
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Cognitive Performance Trends</span>
                </h4>
                <div className="text-xs text-slate-700">
                  <p>
                    <span className="font-bold text-slate-900">Most readily identified: </span>
                    {analytics.topRecognized.join(", ") || "Cups, Books, Phones"}
                  </p>
                  <p className="mt-1">
                    <span className="font-bold text-slate-900">Items needing gentler lighting: </span>
                    {analytics.needsPractice.join(", ")}
                  </p>
                </div>
              </div>

              {sessions.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-800">Recent Hunt Sessions</h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {sessions.slice(0, 5).map((s) => (
                      <div
                        key={s.id}
                        className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{s.dateFormatted}</span>
                          <span className="text-slate-400 text-[10px] ml-2">{s.timeFormatted}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            {s.foundCount} Found
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[10px]">
                            {s.skippedCount} Skipped
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  No sessions recorded yet. Patient results will appear here automatically.
                </div>
              )}

              <p className="text-[10px] text-slate-400 italic text-center pt-2">
                * Note: These metrics are cognitive engagement & visual attention tracking data, not clinical medical diagnoses.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            {saveSuccess ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Settings saved!
              </span>
            ) : (
              <span>Personalized for Lakshmiji</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer transition active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
