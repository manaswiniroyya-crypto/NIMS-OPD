/* ================= GLOBAL STATE ================= */
let locationsData = [];
let currentLang = "en";
let searchQuery = "";
let openCategoryList = null; // tracks currently opened category list
let openLocationDetails = null; // tracks open location description

/* ================= SPEECH ================= */
function speakText(text, lang = "en-US"){
  const speech = new SpeechSynthesisUtterance();
  speech.text = text;
  speech.lang = lang;
  window.speechSynthesis.speak(speech);
}

const LANG_CODES = {
  en: "en-US",
  te: "te-IN",
  hi: "hi-IN",
  ta: "ta-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  ur: "ur-PK",
};

// ================= HISTORY INIT (iOS SUPPORT) =================
history.replaceState({ level: "home" }, "");

/* ================= STATIC UI TRANSLATIONS ================= */
const STATIC_TRANSLATIONS = {
  title: {
    en: "NIMS Hospital, Hyderabad",
    te: "నిమ్స్ ఆసుపత్రి, హైదరాబాద్",
    hi: "निम्स अस्पताल, हैदराबाद",
    ta: "நிம்ஸ் மருத்துவமனை, ஹைதராபாத்",
    kn: "ನಿಮ್ಸ್ ಆಸ್ಪತ್ರೆ, ಹೈದರಾಬಾದ್",
    ml: "നിംസ് ആശുപത്രി, ഹൈദരാബാദ്",
    ur: "نمز اسپتال، حیدرآباد",
  },
  subtitle: {
    en: "Select category → choose place → navigate",
    te: "వర్గాన్ని ఎంచుకోండి → స్థలాన్ని ఎంచుకోండి → నావిగేట్ చేయండి",
    hi: "श्रेणी चुनें → स्थान चुनें → नेविगेट करें",
    ta: "வகையைத் தேர்ந்தெடுக்கவும் → இடத்தைத் தேர்ந்தெடுக்கவும் → வழிகாட்டவும்",
    kn: "ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ → ಸ್ಥಳವನ್ನು ಆಯ್ಕೆಮಾಡಿ → ನ್ಯಾವಿಗೇಟ್ ಮಾಡಿ",
    ml: "വിഭാഗം തിരഞ്ഞെടുക്കുക → സ്ഥലം തിരഞ്ഞെടുക്കുക → നാവിഗേറ്റ് ചെയ്യുക",
    ur: "زمرہ منتخب کریں → جگہ منتخب کریں → رہنمائی حاصل کریں",
  },
  langLabel: {
    en: "Language:",
    te: "భాష:",
    hi: "भाषा:",
    ta: "மொழி:",
    kn: "ಭಾಷೆ:",
    ml: "ഭാഷ:",
    ur: "زبان",
  },
  searchPlaceholder: {
    en: "Search Departments, Facilities, Services...",
    te: "శాఖలు, సౌకర్యాలు, సేవలను వెతకండి...",
    hi: "विभाग, सुविधाएँ, सेवाएँ खोजें...",
    ta: "துறைகள், வசதிகள், சேவைகளைத் தேடுங்கள்...",
    kn: "ವಿಭಾಗಗಳು, ಸೌಲಭ್ಯಗಳು, ಸೇವೆಗಳನ್ನು ಹುಡುಕಿ...",
    ml: "വിഭാഗങ്ങൾ, സൗകര്യങ്ങൾ, സേവനങ്ങൾ തിരയുക...",
    ur: "شعبے، سہولیات، خدمات تلاش کریں...",
  },
  searchTitle: {
    en: "Search Results",
    te: "శోధన ఫలితాలు",
    hi: "खोज परिणाम",
    ta: "தேடல் முடிவுகள்",
    kn: "ಹುಡುಕಾಟ ಫಲಿತಾಂಶಗಳು",
    ml: "തിരയൽ ഫലങ്ങൾ",
    ur: "تلاش کے نتائج",
  },
};

function updateStaticText() {
  const titleEl = document.getElementById("app-title");
  if (titleEl) titleEl.textContent = STATIC_TRANSLATIONS.title[currentLang] || STATIC_TRANSLATIONS.title.en;

  const subtitleEl = document.getElementById("app-subtitle");
  if (subtitleEl) subtitleEl.textContent = STATIC_TRANSLATIONS.subtitle[currentLang] || STATIC_TRANSLATIONS.subtitle.en;

  const langLabelEl = document.getElementById("lang-label");
  if (langLabelEl) langLabelEl.textContent = STATIC_TRANSLATIONS.langLabel[currentLang] || STATIC_TRANSLATIONS.langLabel.en;

  const searchInputEl = document.getElementById("searchInput");
  if (searchInputEl) searchInputEl.placeholder = STATIC_TRANSLATIONS.searchPlaceholder[currentLang] || STATIC_TRANSLATIONS.searchPlaceholder.en;

  const searchTitleEl = document.getElementById("search-title");
  if (searchTitleEl) searchTitleEl.textContent = STATIC_TRANSLATIONS.searchTitle[currentLang] || STATIC_TRANSLATIONS.searchTitle.en;
}

/* ================= LOAD DATA ================= */
fetch("locations.json")
  .then((res) => res.json())
  .then((data) => {
    locationsData = data;
    searchQuery = "";
    updateStaticText();
    document.getElementById("app").style.display = "block";
    document.getElementById("search-results").style.display = "none";
    renderApp();
  })
  .catch((err) => console.error("Failed to load locations.json", err));

/* ================= CATEGORY LABELS ================= */
const CATEGORY_LABELS = {
  FACILITY: { en: "Facilities", te: "సౌకర్యాలు", hi: "सुविधाएं", ta: "வசதிகள்", kn: "ಸೌಲಭ್ಯಗಳು", ml: "സൗകര്യങ്ങൾ", ur: "سہولیات" },
  TRANSPORT: { en: "Transport", te: "రవాణా", hi: "परिवहन", ta: "போக்குவரத்து", kn: "ಸಾರಿಗೆ", ml: "ഗതാഗതം", ur: "نقل و حمل" },
  UTILITY: { en: "Utilities", te: "సేవలు", hi: "सेवाएं", ta: "சேவைகள்", kn: "ಸೇವೆಗಳು", ml: "സേവനങ്ങൾ", ur: "خدمات" },
  DEPARTMENT: { en: "Departments", te: "విభాగాలు", hi: "विभाग", ta: "துறை", kn: "ವಿಭಾಗಗಳು", ml: "വകുപ്പുകൾ", ur: "محکمے" },
  OFFICE: { en: "Office", te: "కార్యాలయం", hi: "कार्यालय", ta: "அலுவலகம்", kn: "ಕಚೇರಿ", ml: "ഓഫീസ്", ur: "دفتر" },
};

/* ================= BUTTON LABELS ================= */
const BUTTON_LABELS = {
  openMaps: {
    en: "Open in Google Maps",
    te: "గూగుల్ మ్యాప్స్‌లో తెరవండి",
    hi: "गूगल मैप्स में खोलें",
    ta: "கூகுள் மேப்ஸில் திறக்கவும்",
    kn: "ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್‌ನಲ್ಲಿ ತೆರೆಯಿರಿ",
    ml: "ഗൂഗിൾ മാപ്സിൽ തുറക്കുക",
    ur: "گوگل میپس میں کھولیں",
  },
  navigate: {
    en: "Navigate",
    te: "నావిగేట్ చేయండి",
    hi: "नेविगेट करें",
    ta: "வழிகாட்டு",
    kn: "ನ್ಯಾವಿಗೇಟ್ ಮಾಡಿ",
    ml: "നാവിഗേറ്റ് ചെയ്യുക",
    ur: "رہنمائی کریں",
  },
  viewDetails: {
    en: "View Details",
    te: "వివరాలు చూడండి",
    hi: "विवरण देखें",
    ta: "விவரங்களை காண்க",
    kn: "ವಿವರಗಳನ್ನು ನೋಡಿ",
    ml: "വിശദാംശങ്ങൾ കാണുക",
    ur: "تفصیلات دیکھیں",
  },
};

function getItemLabel(l) {
  const cat = (l.category || "").trim().toUpperCase();
  return (cat === "DEPARTMENT" || cat === "OFFICE")
    ? BUTTON_LABELS.viewDetails[currentLang]
    : BUTTON_LABELS.navigate[currentLang];
}

/* ================= SMART SEARCH MATCH ================= */
function matchesSearch(l) {
  if (!searchQuery) return true;

  const query = searchQuery.toLowerCase();
  const allLanguages = ["en", "te", "hi", "ta", "kn", "ml", "ur"];

  let searchableText = "";
  searchableText += (l["display name"] || "").toLowerCase() + " ";

  allLanguages.forEach((lang) => {
    searchableText += (l["name_" + lang] || "").toLowerCase() + " ";
  });

  allLanguages.forEach((lang) => {
    const catLabel = CATEGORY_LABELS[(l.category || "").trim().toUpperCase()]?.[lang];
    if (catLabel) searchableText += catLabel.toLowerCase() + " ";
  });

  searchableText += (l.category || "").toLowerCase().replace(/_/g, " ") + " ";

  allLanguages.forEach((lang) => {
    searchableText += (l["description_" + lang] || "").toLowerCase() + " ";
  });

  return searchableText.includes(query);
}

/* ================= DETAILS PAGE ================= */
function openDetailsPage(item) {
  /* --- Hide every section except #app --- */
  const heroEl    = document.getElementById("hero-section");
  const nimsEl    = document.getElementById("Nims-Entrance-container");
  const opdEl     = document.getElementById("Opd-Entrance-container");
  const srEl      = document.getElementById("search-results");
  if (heroEl)  heroEl.style.display  = "none";
  if (nimsEl)  nimsEl.style.display  = "none";
  if (opdEl)   opdEl.style.display   = "none";
  if (srEl)    srEl.style.display    = "none";

  const app = document.getElementById("app");
  app.innerHTML = "";
  app.style.display = "block";

  /* Push history so the browser Back button works */
  history.pushState({ level: "details" }, "");

  const page = document.createElement("div");
  page.style.cssText = "display:flex;flex-direction:column;gap:16px;padding:16px;max-width:960px;margin:0 auto;";

  /* ---- BACK BUTTON ---- */
  const backBtn = document.createElement("button");
  backBtn.textContent = "← Back";
  backBtn.style.cssText = "align-self:flex-start;background:none;border:none;color:#1a73e8;font-size:15px;font-weight:600;cursor:pointer;padding:4px 0;";
  backBtn.onclick = () => {
    window.speechSynthesis.cancel();
    if (heroEl)  heroEl.style.display  = "";
    if (nimsEl)  nimsEl.style.display  = "";
    if (opdEl)   opdEl.style.display   = "";
    renderApp();
    history.back();
  };
  page.appendChild(backBtn);

  /* ---- IMAGE SECTION ---- */
  const hasLayout = item.image_layout;
  const hasReal   = item.image_real;

  function makeImgBox(src, caption, fitMode) {
    const box = document.createElement("div");
    box.style.cssText = "flex:1 1 240px;background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.10);overflow:hidden;display:flex;flex-direction:column;";
    const img = document.createElement("img");
    img.src = src;
    img.alt = caption;
    img.style.cssText = `width:100%;height:210px;object-fit:${fitMode};background:#f0f0f0;`;
    img.onerror = () => { box.style.display = "none"; };
    const cap = document.createElement("p");
    cap.textContent = caption;
    cap.style.cssText = "text-align:center;font-size:12px;color:#666;padding:6px 4px;margin:0;border-top:1px solid #eee;";
    box.appendChild(img);
    box.appendChild(cap);
    return box;
  }

  if (hasLayout && hasReal) {
    const row = document.createElement("div");
    row.style.cssText = "display:flex;flex-wrap:wrap;gap:12px;";
    row.appendChild(makeImgBox(item.image_layout, "Floor Layout Map", "contain"));
    row.appendChild(makeImgBox(item.image_real,   "Room Entrance Photo", "cover"));
    page.appendChild(row);
  } else if (hasReal) {
    const row = document.createElement("div");
    row.style.cssText = "display:flex;justify-content:center;";
    const box = document.createElement("div");
    box.style.cssText = "background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.10);overflow:hidden;max-width:520px;width:100%;";
    const img = document.createElement("img");
    img.src = item.image_real;
    img.alt = item["name_" + currentLang] || item["display name"] || "";
    img.style.cssText = "width:100%;max-height:300px;object-fit:cover;";
    img.onerror = () => { box.style.display = "none"; };
    box.appendChild(img);
    row.appendChild(box);
    page.appendChild(row);
  }

  /* ---- INFO CARD ---- */
  const card = document.createElement("div");
  card.style.cssText = "background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.10);padding:20px;";

  /* Title row */
  const titleRow = document.createElement("div");
  titleRow.style.cssText = "display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;margin-bottom:14px;";

  const title = document.createElement("h2");
  title.textContent = item["name_" + currentLang] || item["display name"] || "";
  title.style.cssText = "margin:0;font-size:20px;font-weight:700;flex:1 1 auto;";

  const readBtn = document.createElement("button");
  readBtn.innerHTML = "&#128266; Read Aloud";
  readBtn.style.cssText = "background:#e8f0fe;color:#1a73e8;border:none;border-radius:20px;padding:8px 16px;font-size:13px;cursor:pointer;white-space:nowrap;flex-shrink:0;";
  readBtn.onclick = () => {
    const parts = [
      item["name_" + currentLang] || item["display name"] || "",
      item["description_" + currentLang] || "",
      item["direction_" + currentLang] || item.direction_en || ""
    ].filter(Boolean).join(". ");
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(parts);
    utt.lang = LANG_CODES[currentLang] || "en-US";
    window.speechSynthesis.speak(utt);
  };

  titleRow.appendChild(title);
  titleRow.appendChild(readBtn);
  card.appendChild(titleRow);

  /* Description */
  const descText = item["description_" + currentLang] || item.description_en || "";
  if (descText) {
    const hr = document.createElement("hr");
    hr.style.cssText = "border:none;border-top:1px solid #eee;margin:0 0 12px;";
    const desc = document.createElement("p");
    desc.textContent = descText;
    desc.style.cssText = "margin:0 0 16px;color:#333;line-height:1.65;font-size:15px;";
    card.appendChild(hr);
    card.appendChild(desc);
  }

  /* Directions */
  const dirText = item["direction_" + currentLang] || item.direction_en || "";
  if (dirText) {
    const dirHr = document.createElement("hr");
    dirHr.style.cssText = "border:none;border-top:1px solid #eee;margin:0 0 12px;";
    const dirHead = document.createElement("div");
    dirHead.style.cssText = "display:flex;align-items:center;gap:6px;margin-bottom:6px;";
    const dirIcon = document.createElement("span");
    dirIcon.textContent = "🧭";
    const dirLabel = document.createElement("strong");
    dirLabel.textContent = "Directions";
    dirLabel.style.color = "#1a73e8";
    dirHead.appendChild(dirIcon);
    dirHead.appendChild(dirLabel);
    const dirPara = document.createElement("p");
    dirPara.textContent = dirText;
    dirPara.style.cssText = "margin:0;color:#333;line-height:1.65;font-size:15px;";
    card.appendChild(dirHr);
    card.appendChild(dirHead);
    card.appendChild(dirPara);
  }

  /* Block / Floor meta */
  const blockVal = item["block_" + currentLang] || item.block_en || "";
  const floorVal = item["floor_" + currentLang] || item.floor_en || "";
  if (blockVal || floorVal) {
    const meta = document.createElement("p");
    meta.style.cssText = "margin:14px 0 0;font-size:13px;color:#888;";
    meta.textContent = [blockVal && ("📍 " + blockVal), floorVal && ("🏢 " + floorVal)].filter(Boolean).join("  ·  ");
    card.appendChild(meta);
  }

  page.appendChild(card);
  app.appendChild(page);
}

/* ================= NIMS ENTRANCE (STANDALONE) ================= */
function renderNimsEntrance() {
  const container = document.getElementById("Nims-Entrance-container");
  container.innerHTML = "";
  const free = locationsData.find((l) => l.category === "NIMS  ENTRANCE");
  if (!free) return;

  const btn = document.createElement("button");
  btn.textContent = free["name_" + currentLang] || free["display name"];

  btn.onclick = () => {
    let placeName = free["name_" + currentLang] || free["display name"];
    let message = "Navigation started. Please follow directions to " + placeName;

    if (currentLang === "te") message = placeName + " కు దారి చూపబడుతోంది. దయచేసి మార్గాన్ని అనుసరించండి";
    else if (currentLang === "hi") message = placeName + " के लिए मार्गदर्शन शुरू हो गया है। कृपया निर्देशों का पालन करें";
    else if (currentLang === "ta") message = placeName + " செல்ல வழிகாட்டல் தொடங்கியுள்ளது. தயவுசெய்து வழியை பின்பற்றவும்";
    else if (currentLang === "kn") message = placeName + " ಕಡೆ ಮಾರ್ಗದರ್ಶನ ಪ್ರಾರಂಭವಾಗಿದೆ. ದಯವಿಟ್ಟು ದಾರಿಯನ್ನು ಅನುಸರಿಸಿ";
    else if (currentLang === "ml") message = placeName + " ലേക്ക് നാവിഗേഷൻ ആരംഭിച്ചു. ദയവായി വഴിയെ പിന്തുടരുക";
    else if (currentLang === "ur") message = placeName + " کے لیے رہنمائی شروع ہو گئی ہے۔ براہ کرم ہدایات پر عمل کریں";

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = LANG_CODES[currentLang];
    speech.onend = () => {
      window.location.href =
        `https://www.google.com/maps/search/?api=1&query=${free.latitude},${free.longitude}`;
    };

    window.speechSynthesis.speak(speech);
  };

  btn.style.padding = "12px 16px";
  btn.style.fontSize = "16px";
  btn.style.fontWeight = "bold";
  btn.style.cursor = "pointer";

  container.appendChild(btn);
}

/* ================= OPD BLOCK ================= */
function renderOpdBlock() {
  const container = document.getElementById("Opd-Entrance-container");
  container.innerHTML = "";

  const opd = locationsData.find((l) => l.category === "OPD BLOCK");
  if (!opd) return;

  const btn = document.createElement("button");
  btn.textContent = opd["name_" + currentLang] || opd["display name"];

  btn.onclick = () => {
    let text = "";

    if (currentLang === "en") {
      text = "Navigation started. Please follow directions to " + opd.name_en;
    } else if (currentLang === "te") {
      text = opd.name_te + "కు దారి చూపబడుతోంది. దయచేసి మార్గాన్ని అనుసరించండి";
    } else if (currentLang === "hi") {
      text = opd.name_hi + " के लिए मार्गदर्शन शुरू हो गया है। कृपया निर्देशों का पालन करें";
    } else if (currentLang === "ta") {
      text = opd.name_ta + " செல்ல வழிகாட்டல் தொடங்கியுள்ளது. தயவுசெய்து வழியை பின்பற்றவும்";
    } else if (currentLang === "ml") {
      text = opd.name_ml + " ലേക്ക് നാവിഗേഷൻ ആരംഭിച്ചു. ദയവായി വഴിയെ പിന്തുടരുക";
    } else if (currentLang === "kn") {
      text = opd.name_kn + " ಕಡೆ ಮಾರ್ಗದರ್ಶನ ಪ್ರಾರಂಭವಾಗಿದೆ. ದಯವಿಟ್ಟು ದಾರಿಯನ್ನು ಅನುಸರಿಸಿ";
    } else if (currentLang === "ur") {
      text = opd.name_ur + " کے لیے رہنمائی شروع ہو گئی ہے۔ براہ کرم ہدایات پر عمل کریں";
    } else {
      text = "Navigating to " + opd.name_en;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang =
      currentLang === "te" ? "te-IN" :
      currentLang === "hi" ? "hi-IN" :
      currentLang === "ta" ? "ta-IN" :
      currentLang === "ml" ? "ml-IN" :
      currentLang === "kn" ? "kn-IN" :
      currentLang === "ur" ? "ur-PK" :
      "en-IN";

    utterance.onend = () => {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${opd.latitude},${opd.longitude}`,
        "_self"
      );
    };

    speechSynthesis.speak(utterance);
  };

  btn.style.padding = "12px 16px";
  btn.style.fontSize = "16px";
  btn.style.fontWeight = "bold";
  btn.style.cursor = "pointer";

  container.appendChild(btn);
}

/* ================= BROWSE MODE ================= */
function renderApp() {
  renderNimsEntrance();
  renderOpdBlock();

  const app = document.getElementById("app");
  app.innerHTML = "";
  app.style.display = "block";
  document.getElementById("search-results").style.display = "none";

  const CATEGORY_ICONS = {
    FACILITY: "🏥",
    TRANSPORT: "🚌",
    UTILITY: "🔧",
    DEPARTMENT: "⚕️",
    OFFICE: "🖥️"
  };

  const grouped = {};
  locationsData
    .filter(l => l.category !== "NIMS  ENTRANCE" && l.category !== "OPD BLOCK")
    .forEach(l => (grouped[l.category] ||= []).push(l));

  for (const cat in grouped) {
    const section = document.createElement("section");
    const h = document.createElement("h2");

    const iconSpan = document.createElement("span");
    iconSpan.textContent = CATEGORY_ICONS[cat] || "📍";
    iconSpan.style.fontSize = "24px";
    iconSpan.style.marginRight = "12px";
    h.appendChild(iconSpan);

    const textNode = document.createTextNode(CATEGORY_LABELS[cat]?.[currentLang] || cat);
    h.appendChild(textNode);

    h.style.cursor = "pointer";

    const ul = document.createElement("ul");
    ul.style.display = "none";

    h.onclick = () => {
      const isOpen = ul.style.display === "block";
      document.querySelectorAll("#app ul").forEach(u => u.style.display = "none");
      document.querySelectorAll("#app ul div").forEach(d => d.style.display = "none");

      if (!isOpen) {
        ul.style.display = "block";
        history.pushState({ level: "category" }, "");
      } else {
        ul.style.display = "none";
      }
    };

    grouped[cat].forEach(l => {
      const li = document.createElement("li");

      const name = document.createElement("strong");
      name.textContent = l["name_" + currentLang] || l["display name"];
      name.style.cursor = "pointer";

      const details = document.createElement("div");
      details.style.display = "none";

      if (l["description_" + currentLang]) {
        const desc = document.createElement("p");
        desc.textContent = l["description_" + currentLang];
        desc.style.margin = "6px 0";
        details.append(desc);
      }

      const btn = document.createElement("button");
      if ((l.category || "").trim().toUpperCase() === "DEPARTMENT" || (l.category || "").trim().toUpperCase() === "OFFICE") {
        btn.textContent = BUTTON_LABELS.viewDetails[currentLang];
      } else {
        btn.textContent = BUTTON_LABELS.navigate[currentLang];
      }

      btn.onclick = () => {
        if ((l.category || "").trim().toUpperCase() === "DEPARTMENT" || (l.category || "").trim().toUpperCase() === "OFFICE") {
          openDetailsPage(l);
          return;
        }

        let placeName = l["name_" + currentLang] || l["display name"];
        let message = "Navigation started. Please follow directions to " + placeName;

        if (currentLang === "te") message = placeName + " కు దారి చూపబడుతోంది. దయచేసి మార్గాన్ని అనుసరించండి";
        else if (currentLang === "hi") message = placeName + " के लिए मार्गदर्शन शुरू हो गया है। कृपया निर्देशों का पालन करें";
        else if (currentLang === "ta") message = placeName + " செல்ல வழிகாட்டல் தொடங்கியுள்ளது. தயவுசெய்து வழியை பின்பற்றவும்";
        else if (currentLang === "kn") message = placeName + " ಕಡೆ ಮಾರ್ಗದರ್ಶನ ಪ್ರಾರಂಭವಾಗಿದೆ. ದಯವಿಟ್ಟು ದಾರಿಯನ್ನು ಅನುಸರಿಸಿ";
        else if (currentLang === "ml") message = placeName + " ലേക്ക് നാവിഗേഷൻ ആരംഭിച്ചു. ദയവായി വഴിയെ പിന്തുടരുക";
        else if (currentLang === "ur") message = placeName + " کے لیے رہنمائی شروع ہو گئی ہے۔ براہ کرم ہدایات پر عمل کریں";

        window.speechSynthesis.cancel();

        const speech = new SpeechSynthesisUtterance(message);
        speech.lang = LANG_CODES[currentLang];

        speech.onend = () => {
          window.location.href =
            `https://www.google.com/maps/search/?api=1&query=${l.latitude},${l.longitude}`;
        };

        window.speechSynthesis.speak(speech);
      };

      details.append(btn);

      name.onclick = () => {
        const isOpen = details.style.display === "block";
        ul.querySelectorAll("div").forEach(d => d.style.display = "none");

        if (!isOpen) {
          details.style.display = "block";
          history.pushState({ level: "location" }, "");
        } else {
          details.style.display = "none";
        }
      };

      li.append(name, details);
      ul.append(li);
    });

    section.append(h, ul, document.createElement("hr"));
    app.append(section);
  }
}

/* ================= SEARCH MODE ================= */
function renderSearchResults() {
  const list = document.getElementById("search-list");
  list.innerHTML = "";

  const results = locationsData
    .filter(l => l.category !== "NIMS  ENTRANCE")
    .filter(matchesSearch);

  if (results.length === 0) {
    list.innerHTML = "<li>No matching locations found</li>";
  } else {
    results.forEach(l => {
      const li = document.createElement("li");

      const name = document.createElement("strong");
      name.textContent = l["name_" + currentLang] || l["display name"];
      name.style.cursor = "pointer";

      const details = document.createElement("div");
      details.style.display = "none";

      if (l["description_" + currentLang]) {
        const desc = document.createElement("p");
        desc.textContent = l["description_" + currentLang];
        desc.style.margin = "6px 0";
        details.append(desc);
      }

      const btn = document.createElement("button");
      if ((l.category || "").trim().toUpperCase() === "DEPARTMENT" || (l.category || "").trim().toUpperCase() === "OFFICE") {
        btn.textContent = BUTTON_LABELS.viewDetails[currentLang];
      } else {
        btn.textContent = BUTTON_LABELS.navigate[currentLang];
      }

      btn.onclick = () => {
        if ((l.category || "").trim().toUpperCase() === "DEPARTMENT" || (l.category || "").trim().toUpperCase() === "OFFICE") {
          openDetailsPage(l);
          return;
        }

        let placeName = l["name_" + currentLang] || l["display name"];
        let message = "Navigation started. Please follow directions to " + placeName;

        if (currentLang === "te") message = placeName + " కు దారి చూపబడుతోంది. దయచేసి మార్గాన్ని అనుసరించండి";
        else if (currentLang === "hi") message = placeName + " के लिए मार्गदर्शन शुरू हो गया है। कृपया निर्देशों का पालन करें";
        else if (currentLang === "ta") message = placeName + " செல்ல வழிகாட்டல் தொடங்கியுள்ளது. தயவுசெய்து வழியை பின்பற்றவும்";
        else if (currentLang === "kn") message = placeName + " ಕಡೆ ಮಾರ್ಗದರ್ಶನ ಪ್ರಾರಂಭವಾಗಿದೆ. ದಯವಿಟ್ಟು ದಾರಿಯನ್ನು ಅನುಸರಿಸಿ";
        else if (currentLang === "ml") message = placeName + " ലേക്ക് നാവിഗേഷൻ ആരംഭിച്ചു. ദയവായി വഴിയെ പിന്തുടരുക";
        else if (currentLang === "ur") message = placeName + " کے لیے رہنمائی شروع ہو گئی ہے۔ براہ کرم ہدایات پر عمل کریں";

        window.speechSynthesis.cancel();

        const speech = new SpeechSynthesisUtterance(message);
        speech.lang = LANG_CODES[currentLang];

        speech.onend = () => {
          window.location.href =
            `https://www.google.com/maps/search/?api=1&query=${l.latitude},${l.longitude}`;
        };

        window.speechSynthesis.speak(speech);
      };

      details.append(btn);

      name.onclick = () => {
        const isOpen = details.style.display === "block";
        document.querySelectorAll("#search-list div").forEach(d => d.style.display = "none");
        details.style.display = isOpen ? "none" : "block";
      };

      li.append(name, details);
      list.append(li);
    });
  }

  document.getElementById("app").style.display = "none";
  document.getElementById("search-results").style.display = "block";
}

/* ================= EVENTS ================= */
document.getElementById("lang").addEventListener("change", e => {
  currentLang = e.target.value;
  updateStaticText();
  searchQuery ? renderSearchResults() : renderApp();
});

const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearSearch");

searchInput.addEventListener("input", e => {
  searchQuery = e.target.value.trim().toLowerCase();
  clearBtn.style.display = searchQuery ? "flex" : "none";

  const hero = document.getElementById("hero-section");

  if (searchQuery) {
    if (hero) hero.style.display = "none";
    renderSearchResults();
  } else {
    if (hero) hero.style.display = "block";
    renderApp();
  }
});

clearBtn.addEventListener("click", () => {
  const hero = document.getElementById("hero-section");

  searchInput.value = "";
  searchQuery = "";
  clearBtn.style.display = "none";

  if (hero) hero.style.display = "block";
  renderApp();
  searchInput.focus();
});

/* ================= BACK TO TOP VISIBILITY ================= */
document.addEventListener("DOMContentLoaded", () => {
  const backToTopBtn = document.getElementById("back-to-top");
  if (!backToTopBtn) return;
  backToTopBtn.style.display = "none";
  window.addEventListener("scroll", () => {
    if (window.scrollY > 150) {
      backToTopBtn.style.display = "flex";
    } else {
      backToTopBtn.style.display = "none";
    }
  });
});

// ================= FINAL BACK / SWIPE HANDLING =================
window.addEventListener("popstate", (e) => {
  /* Coming back from the details page — restore all hidden sections */
  const heroEl  = document.getElementById("hero-section");
  const nimsEl  = document.getElementById("Nims-Entrance-container");
  const opdEl   = document.getElementById("Opd-Entrance-container");

  /* If #app has the details page content (no <ul> inside), it's the details view */
  const isDetailsView = !document.querySelector("#app ul");
  if (isDetailsView) {
    window.speechSynthesis.cancel();
    if (heroEl)  heroEl.style.display  = "";
    if (nimsEl)  nimsEl.style.display  = "";
    if (opdEl)   opdEl.style.display   = "";
    renderApp();
    return;
  }

  const openLocation = document.querySelector('#app ul li div[style*="block"]');
  if (openLocation) {
    openLocation.style.display = "none";
    return;
  }

  const openCategory = document.querySelector('#app ul[style*="block"]');
  if (openCategory) {
    openCategory.style.display = "none";
    return;
  }
});

/* ================= BASIC INSPECT BLOCKING (DESKTOP ONLY) ================= */
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

document.addEventListener("keydown", function (e) {
  if (
    e.key === "F12" ||
    (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
    (e.ctrlKey && e.key === "U")
  ) {
    e.preventDefault();
  }
});