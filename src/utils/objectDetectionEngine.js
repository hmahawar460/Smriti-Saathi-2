/**
 * objectDetectionEngine.js
 * 
 * On-device computer vision engine for "FIND IT!"
 * Powered by TensorFlow.js and COCO-SSD object detection.
 * Performs real-time frame classification, bounding box tracking,
 * clarity/distance heuristics, and supportive elderly-friendly feedback.
 */

let cocoModelPromise = null;
let cachedModel = null;
let isLoadingModel = false;

/**
 * Lazy load COCO-SSD model once
 */
export async function loadCocoModel() {
  if (cachedModel) return cachedModel;
  if (cocoModelPromise) return cocoModelPromise;

  cocoModelPromise = (async () => {
    try {
      isLoadingModel = true;
      // Load tfjs and coco-ssd
      const tf = await import("@tensorflow/tfjs");
      await tf.ready();
      const cocoSsd = await import("@tensorflow-models/coco-ssd");
      const model = await cocoSsd.load({ base: "lite_mobilenet_v2" });
      cachedModel = model;
      isLoadingModel = false;
      return model;
    } catch (err) {
      console.error("Failed to load COCO-SSD model:", err);
      isLoadingModel = false;
      return null;
    }
  })();

  return cocoModelPromise;
}

export function isModelLoading() {
  return isLoadingModel;
}

/**
 * Friendly label translations and pronunciations
 */
export const COCO_FRIENDLY_NAMES = {
  spoon: { en: "Spoon", hi: "चम्मच" },
  fork: { en: "Fork", hi: "कांटा" },
  knife: { en: "Knife", hi: "चाकू" },
  cup: { en: "Cup / Mug", hi: "कप" },
  bowl: { en: "Bowl", hi: "कटोरी" },
  bottle: { en: "Bottle", hi: "बोतल" },
  "cell phone": { en: "Mobile Phone", hi: "मोबाइल फोन" },
  book: { en: "Book", hi: "किताब" },
  clock: { en: "Clock", hi: "घड़ी" },
  toothbrush: { en: "Toothbrush", hi: "टूथब्रश" },
  remote: { en: "Remote Control", hi: "रिमोट" },
  chair: { en: "Chair", hi: "कुर्सी" },
  couch: { en: "Sofa / Cushion", hi: "सोफा / तकिया" },
  bed: { en: "Bed / Pillow", hi: "बिस्तर" },
  scissors: { en: "Scissors", hi: "कैंची" },
  backpack: { en: "Backpack", hi: "बैग" },
  handbag: { en: "Handbag", hi: "पर्स / बैग" },
  suitcase: { en: "Suitcase", hi: "सूटकेस" },
  laptop: { en: "Laptop", hi: "लैपटॉप" },
  mouse: { en: "Computer Mouse", hi: "माउस" },
  keyboard: { en: "Keyboard", hi: "कीबोर्ड" },
  apple: { en: "Apple", hi: "सेब" },
  banana: { en: "Banana", hi: "केला" },
  orange: { en: "Orange", hi: "संतरा" },
  umbrella: { en: "Umbrella", hi: "छाता" }
};

/**
 * Analyze a video frame against target object
 * @param {HTMLVideoElement} videoElement
 * @param {Object} targetObject
 * @param {Object} options
 * @returns {Promise<Object>} Detection evaluation
 */
export async function analyzeFrameForTarget(
  videoElement,
  targetObject,
  { difficulty = "easy", minConfidence = 0.5, lang = "en" } = {}
) {
  if (!videoElement || videoElement.readyState < 2) {
    return {
      status: "searching",
      detectedLabel: null,
      confidence: 0,
      bbox: null,
      message: lang === "hi" ? "कैमरा लोड हो रहा है..." : "Camera is readying...",
      predictions: []
    };
  }

  // Adjust confidence threshold based on difficulty level
  const threshold =
    difficulty === "advanced"
      ? Math.max(0.62, minConfidence)
      : difficulty === "medium"
      ? Math.max(0.52, minConfidence)
      : Math.max(0.42, minConfidence);

  const isHindi = lang === "hi";
  const targetLabel = (targetObject.targetCocoClass || targetObject.name || "").toLowerCase();
  const allowedClasses = (targetObject.cocoClasses || [targetLabel]).map((c) => c.toLowerCase());

  try {
    const model = await loadCocoModel();
    if (!model) {
      // Fallback if model fails to load
      return {
        status: "searching",
        detectedLabel: null,
        confidence: 0,
        bbox: null,
        message: isHindi ? "वस्तु को कैमरे के सामने रखें" : "Show the object to the camera",
        predictions: []
      };
    }

    const predictions = await model.detect(videoElement, 6);

    if (!predictions || predictions.length === 0) {
      return {
        status: "unclear",
        detectedLabel: null,
        confidence: 0,
        bbox: null,
        message: isHindi
          ? "वस्तु दिखाई नहीं दे रही। कृपया इसे कैमरे के थोड़ा और पास लाएं।"
          : "I can't see the object clearly. Please bring it closer to the camera.",
        predictions: []
      };
    }

    // Filter out human 'person' detection if searching for a non-person object
    const nonPersonPreds = predictions.filter((p) => p.class.toLowerCase() !== "person");
    const activePreds = nonPersonPreds.length > 0 ? nonPersonPreds : predictions;

    // Check if target object is detected with sufficient confidence
    const match = activePreds.find((p) => {
      const pClass = p.class.toLowerCase();
      const isAllowed = allowedClasses.includes(pClass) || pClass === targetLabel;
      return isAllowed && p.score >= threshold;
    });

    if (match) {
      const friendlyName = COCO_FRIENDLY_NAMES[match.class.toLowerCase()]?.en || targetObject.name;
      const friendlyHindi = COCO_FRIENDLY_NAMES[match.class.toLowerCase()]?.hi || targetObject.hindiName;

      return {
        status: "correct",
        detectedLabel: friendlyName,
        confidence: Math.round(match.score * 100),
        bbox: match.bbox,
        message: isHindi
          ? `शाबाश! आपने ${friendlyHindi} ढूंढ ली!`
          : `Great! You found the ${friendlyName}!`,
        predictions: activePreds
      };
    }

    // Target not found. Check if another distinct object is detected with high confidence
    const dominantWrong = activePreds.find((p) => {
      const pClass = p.class.toLowerCase();
      return (
        pClass !== "person" &&
        !allowedClasses.includes(pClass) &&
        p.score >= 0.55
      );
    });

    if (dominantWrong) {
      const wrongName =
        COCO_FRIENDLY_NAMES[dominantWrong.class.toLowerCase()]?.en ||
        dominantWrong.class;
      const wrongHindi =
        COCO_FRIENDLY_NAMES[dominantWrong.class.toLowerCase()]?.hi ||
        dominantWrong.class;

      const targetDisplayName = targetObject.name;
      const targetDisplayHindi = targetObject.hindiName;

      return {
        status: "wrong",
        detectedLabel: wrongName,
        confidence: Math.round(dominantWrong.score * 100),
        bbox: dominantWrong.bbox,
        message: isHindi
          ? `यह ${wrongHindi} लग रही है। आइए ${targetDisplayHindi} ढूंढते हैं।`
          : `That looks like a ${wrongName}. Try finding a ${targetDisplayName}.`,
        predictions: activePreds
      };
    }

    // If objects are present but below confidence or too small
    const bestPred = activePreds[0];
    const isTooSmall =
      bestPred &&
      videoElement.videoWidth &&
      (bestPred.bbox[2] * bestPred.bbox[3]) /
        (videoElement.videoWidth * videoElement.videoHeight) <
        0.03;

    if (isTooSmall) {
      return {
        status: "unclear",
        detectedLabel: bestPred.class,
        confidence: Math.round((bestPred?.score || 0.3) * 100),
        bbox: bestPred?.bbox || null,
        message: isHindi
          ? "वस्तु बहुत दूर लग रही है। कृपया इसे कैमरे के करीब लाएं।"
          : "The object seems a bit far. Try bringing it a little closer.",
        predictions: activePreds
      };
    }

    return {
      status: "unclear",
      detectedLabel: null,
      confidence: Math.round((bestPred?.score || 0.2) * 100),
      bbox: null,
      message: isHindi
        ? "वस्तु स्पष्ट नहीं दिख रही। कृपया पूरी वस्तु को अच्छी रोशनी में दिखाएं।"
        : "I can't see the object clearly. Please show the whole object in good light.",
      predictions: activePreds
    };
  } catch (err) {
    console.error("Frame analysis error:", err);
    return {
      status: "searching",
      detectedLabel: null,
      confidence: 0,
      bbox: null,
      message: isHindi
        ? "कैमरे में वस्तु दिखाएं..."
        : "Show the object to the camera...",
      predictions: []
    };
  }
}

/**
 * Draw bounding box and label on overlay canvas
 */
export function drawDetectionBox(canvas, bbox, label, status = "searching") {
  if (!canvas || !bbox) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const [x, y, width, height] = bbox;

  // Choose styling based on status
  let strokeColor = "#3B82F6"; // blue
  let fillColor = "rgba(59, 130, 246, 0.15)";
  if (status === "correct") {
    strokeColor = "#10B981"; // emerald
    fillColor = "rgba(16, 185, 129, 0.25)";
  } else if (status === "wrong") {
    strokeColor = "#F59E0B"; // amber / warm orange
    fillColor = "rgba(245, 158, 11, 0.2)";
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Rounded rectangle
  ctx.save();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 4;
  ctx.fillStyle = fillColor;

  const radius = 12;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();

  // Label tag above box
  if (label) {
    ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const textWidth = ctx.measureText(label).width;
    const padding = 8;
    const tagHeight = 26;
    const tagY = Math.max(0, y - tagHeight - 4);

    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, tagY, textWidth + padding * 2, tagHeight, 6) : ctx.rect(x, tagY, textWidth + padding * 2, tagHeight);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(label, x + padding, tagY + 18);
  }
  ctx.restore();
}

/**
 * Clear overlay canvas
 */
export function clearDetectionBox(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
}
