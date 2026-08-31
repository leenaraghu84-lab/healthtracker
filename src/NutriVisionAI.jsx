import { useState, useCallback, useEffect, createContext, useContext } from "react";

const T = {
  bg: "#0A0C10", surface: "#111318", card: "#161A22", border: "#1E2330",
  teal: "#00E5C8", tealDim: "#00E5C820", orange: "#FF6B35", violet: "#8B5CF6",
  amber: "#F59E0B", red: "#EF4444", green: "#22C55E", lime: "#84CC16",
  sky: "#38BDF8", pink: "#EC4899",
  textPrimary: "#F0F4FF", textSecondary: "#6B7A99", textMuted: "#3A4259",
};

// Round to at most one decimal place, dropping a trailing ".0".
const d1 = (n) => Math.round((Number(n) || 0) * 10) / 10;


// ─── Internationalisation ─────────────────────────────────────────────────────
// Hindi uses Devanagari. Food names keep familiar Hindi terms where they exist
// (दाल, पनीर) rather than transliterating English.
const STRINGS = {
  en: {
    appName: "NUTRIVISION AI",
    // Tabs
    tab_today: "Today", tab_meals: "Meals", tab_plan: "Plan",
    tab_micros: "Micros", tab_history: "History", tab_weight: "Weight",
    title_today: "Today's Nutrition", title_meals: "Meal Log",
    title_plan: "Eat This Today", title_micros: "Micronutrients",
    title_history: "14-Day History", title_weight: "Weight",
    // Profile
    profile_title: "Your profile", profile_edit_title: "Edit your profile",
    profile_sub: "Fill in your details to get personalised daily targets.",
    profile_edit_sub: "Update any detail — your daily targets will be recalculated.",
    body_stats: "BODY STATS", age: "AGE", weight: "WEIGHT", height: "HEIGHT",
    years: "years", kg: "kg", cm: "cm",
    gender: "GENDER", male: "Male", female: "Female",
    activity: "ACTIVITY", sedentary: "Sedentary", light: "Light",
    moderate: "Moderate", active: "Active", vactive: "Very Active",
    goal: "GOAL", goal_loss: "Lose Weight", goal_maintain: "Maintain",
    goal_gain: "Gain Weight", goal_muscle: "Build Muscle",
    calculate: "Calculate my goals →", save_changes: "Save changes →",
    fill_required: "Enter age, weight & height to continue",
    cancel: "Cancel", current_targets: "CURRENT TARGETS",
    // BMI
    bmi_title: "BODY MASS INDEX",
    bmi_under: "Underweight", bmi_healthy: "Healthy",
    bmi_over: "Overweight", bmi_obese: "Obese",
    bmi_range_note: "A healthy BMI at {h}cm is roughly {lo}–{hi} kg.",
    bmi_caveat: "These are WHO cut-offs. Indian and other South Asian populations tend to carry higher body fat and cardiometabolic risk at the same BMI, so many Indian guidelines use lower thresholds — overweight from 23 and obese from 25. BMI also can't distinguish muscle from fat. Treat it as a rough signal, not a diagnosis.",
    // Safety
    warn_minor_title: "This app isn't suitable under 18",
    warn_minor_body: "Calorie and macro targets for children and teenagers depend on growth stage, and generic adult formulas can be actively harmful. Please speak to a paediatrician or a registered dietitian instead.",
    warn_low_title: "Your BMI is in a range that needs medical input",
    warn_low_body: "At {bmi}, a weight-loss or maintenance target set by an app isn't appropriate. Please see a doctor before using calorie targets — this is worth proper assessment rather than an algorithm.",
    warn_loss_title: "A weight-loss goal isn't advisable here",
    warn_loss_body: "Your BMI is {bmi}, which is already below the healthy range (18.5–25). A deficit on top of that risks muscle loss, hormonal disruption and nutrient deficiency. Consider \"Gain Weight\" or \"Build Muscle\" instead, or talk to a dietitian.",
    warn_under_title: "You're below the healthy BMI range",
    warn_under_body: "At {bmi}, your targets will lean toward gaining. If you're unintentionally losing weight, that's worth raising with a doctor.",
    go_back_change: "Go back and change my details",
    go_back: "Go back", continue_anyway: "Continue",
    // Nutrients
    calories: "Calories", protein: "Protein", carbs: "Carbs", fat: "Fat",
    fiber: "Fiber", calcium: "Calcium", b12: "B12", water: "Water",
    kcal: "kcal", consumed: "consumed", required: "required",
    of_daily_goal: "OF DAILY GOAL", kcal_consumed_required: "kcal consumed / required",
    day_completion: "DAY COMPLETION", targets_met: "{n} of 5 targets met",
    left: "{n} left", over: "{n} over",
    // Meals
    breakfast: "Breakfast", lunch: "Lunch", snacks: "Snacks", dinner: "Dinner",
    add: "+ Add", items: "items", item: "item",
    // Scanner
    log_food: "📷 Log Food", analyzing: "🔍 Analyzing...", detected: "✅ Food Detected",
    choose_photo: "Choose a food photo",
    drag_drop: "You can also drag & drop, or paste an image here",
    or_type: "or type it",
    search_placeholder: "e.g. chiken tika, 2 roti, daal",
    did_you_mean: "DID YOU MEAN — tap to add instantly",
    not_listed: "Not listed? Press → to let AI estimate it.",
    identifying: "Identifying calories, macros & micronutrients...",
    meal: "MEAL", portion: "PORTION",
    auto_set: "Auto-set from the time ({t})", changed_from: "Changed from {m}",
    add_item: "+ Add item", meal_total: "MEAL TOTAL",
    add_to: "Add to {m} →",
    // Plan
    your_diet: "YOUR DIET", vegetarian: "Vegetarian", eggetarian: "Eggetarian",
    nonveg: "Non-veg", mixed: "Mixed",
    log_to_meal: "LOG TO MEAL", matches_time: "matches current time",
    auto_was: "auto was {m}",
    still_needed: "STILL NEEDED TODAY", calories_left: "calories left",
    all_met: "✅ All targets close to met. Anything below is optional.",
    biggest_gap: "Biggest gap:", then_x: " — then {x}",
    suggested: "SUGGESTED FOR YOU", all_foods: "ALL FOODS",
    search_results: "SEARCH RESULTS", browse_all: "Browse all {n}",
    show_top: "Show top picks", best_match: "BEST MATCH",
    plan_btn: "+ Plan", log_btn: "Log", your_plan: "YOUR PLAN ({n})",
    clear: "Clear", if_you_eat: "IF YOU EAT THIS, YOU'LL BE AT",
    add_n_to: "Add {n} {items} to {m} →",
    added_to: "Added to {m}",
    logged_updated: "{n} {items} logged — your rings and remaining targets have updated.",
    search_foods: "Search foods — dal, paneer, fish...",
    plan_disclaimer: "Values are averages for typical home preparation. Oil, portion size and recipe vary widely — adjust after logging.",
    // Water / recent / weekly
    water_of: "{n} of {goal} glasses · ~{l}L",
    water_extra: "{n} extra — well hydrated",
    quick_add: "QUICK ADD — RECENT",
    this_week: "THIS WEEK · {n} {days} logged", day: "day", days: "days",
    avg_vs_goal: "avg / day vs {goal}{unit} goal",
    hit_target: "hit target {n}/{total} days",
    weekly_empty: "Log a few days and a weekly summary with averages and trends will appear here.",
    protein_up: "Protein is up {n}% on last week — that's the direction you want if you're training.",
    protein_down: "Protein is down {n}% on last week. Worth a look if you're in a deficit, since protein is what protects muscle.",
    protein_steady: "Protein is holding steady week to week.",
    // History
    no_history: "No history yet",
    no_history_body: "Log meals for a few days and your calorie balance, averages and trends will build up here.",
    days_n: "{n} days", all: "All", deficit: "Deficit", surplus: "Surplus",
    avg_daily: "Avg. Daily", on_target: "On Target",
    total_deficit: "Total Deficit", total_surplus: "Total Surplus",
    of_days: "of {n} days", kcal_under: "kcal under", kcal_over: "kcal over",
    under_goal: "▲ under goal", over_goal: "▼ over goal",
    goal_kcal: "Goal: {n} kcal", daily_breakdown: "DAILY BREAKDOWN",
    today_badge: "TODAY", export_csv: "⬇️ Export all data as CSV",
    on_target_pm: "On target ±100",
    // Weight
    weight_tracking: "WEIGHT TRACKING", no_weight: "No weight logged yet",
    no_weight_body: "Log weekly at the same time of day. Daily readings swing 1–2kg from water alone, so the trend matters far more than any single number.",
    weight_kg: "Weight (kg)", log: "Log",
    kg_over: "{n} kg over {c} entries",
    // Drawer
    guides_settings: "Guides & Settings", guides_header: "NUTRITION & FITNESS GUIDES",
    settings: "SETTINGS", edit_profile: "Edit Profile & Goals",
    recalc: "Recalculate your daily targets",
    export_data: "Export data as CSV", export_sub: "Download your full log",
    clear_data: "Clear saved data", clear_sub: "Remove profile and today's log",
    clear_confirm: "This deletes your profile and meal log from this device. It can't be undone.",
    keep_it: "Keep it", delete: "Delete",
    device_only: "Your data is stored on this device only — nothing is uploaded to a server.",
    disclaimer: "Guidance is general and educational. Consult a qualified professional for personal medical advice.",
    sections: "{n} sections", back_to_menu: "← Back to menu",
    guide_disclaimer: "General guidance only. For medical conditions, pregnancy, or medication interactions, consult a doctor or registered dietitian.",
    language: "Language", lang_sub: "English / हिंदी",
    // Coach
    ai_coach: "AI COACH",
    csv_done: "CSV downloaded",
    csv_fail: "Export blocked by your browser — try a different one",
    added_toast: "{name} added to {m}",
    good_sources: "GOOD SOURCES (Indian)",
    macros: "MACROS", micronutrients: "MICRONUTRIENTS",
    daily_targets: "YOUR DAILY TARGETS", based_on: "Based on:",
  },

  hi: {
    appName: "न्यूट्रिविज़न AI",
    tab_today: "आज", tab_meals: "भोजन", tab_plan: "योजना",
    tab_micros: "सूक्ष्म", tab_history: "इतिहास", tab_weight: "वज़न",
    title_today: "आज का पोषण", title_meals: "भोजन रिकॉर्ड",
    title_plan: "आज क्या खाएँ", title_micros: "सूक्ष्म पोषक तत्व",
    title_history: "14-दिन का इतिहास", title_weight: "वज़न",
    profile_title: "आपकी प्रोफ़ाइल", profile_edit_title: "प्रोफ़ाइल बदलें",
    profile_sub: "व्यक्तिगत दैनिक लक्ष्य पाने के लिए अपनी जानकारी भरें।",
    profile_edit_sub: "कोई भी जानकारी बदलें — आपके दैनिक लक्ष्य फिर से गिने जाएँगे।",
    body_stats: "शारीरिक जानकारी", age: "उम्र", weight: "वज़न", height: "ऊँचाई",
    years: "वर्ष", kg: "कि.ग्रा.", cm: "से.मी.",
    gender: "लिंग", male: "पुरुष", female: "महिला",
    activity: "गतिविधि स्तर", sedentary: "बहुत कम", light: "हल्की",
    moderate: "मध्यम", active: "अधिक", vactive: "बहुत अधिक",
    goal: "लक्ष्य", goal_loss: "वज़न घटाना", goal_maintain: "बनाए रखना",
    goal_gain: "वज़न बढ़ाना", goal_muscle: "मांसपेशी बढ़ाना",
    calculate: "मेरे लक्ष्य गिनें →", save_changes: "बदलाव सहेजें →",
    fill_required: "जारी रखने के लिए उम्र, वज़न और ऊँचाई भरें",
    cancel: "रद्द करें", current_targets: "मौजूदा लक्ष्य",
    bmi_title: "बॉडी मास इंडेक्स (BMI)",
    bmi_under: "कम वज़न", bmi_healthy: "स्वस्थ",
    bmi_over: "अधिक वज़न", bmi_obese: "मोटापा",
    bmi_range_note: "{h} से.मी. ऊँचाई पर स्वस्थ वज़न लगभग {lo}–{hi} कि.ग्रा. है।",
    bmi_caveat: "ये WHO के मानक हैं। भारतीय और दक्षिण एशियाई लोगों में समान BMI पर शरीर की चर्बी और हृदय-रोग का जोखिम अधिक होता है, इसलिए कई भारतीय दिशानिर्देश कम सीमा रखते हैं — 23 से अधिक वज़न और 25 से मोटापा। BMI मांसपेशी और चर्बी में अंतर नहीं कर सकता। इसे संकेत मानें, निदान नहीं।",
    warn_minor_title: "यह ऐप 18 वर्ष से कम उम्र के लिए उपयुक्त नहीं है",
    warn_minor_body: "बच्चों और किशोरों के लिए कैलोरी लक्ष्य उनकी वृद्धि अवस्था पर निर्भर करते हैं, और वयस्कों के सामान्य फ़ॉर्मूले हानिकारक हो सकते हैं। कृपया बाल रोग विशेषज्ञ या पंजीकृत आहार विशेषज्ञ से सलाह लें।",
    warn_low_title: "आपका BMI ऐसी सीमा में है जिसमें चिकित्सकीय सलाह ज़रूरी है",
    warn_low_body: "{bmi} पर, किसी ऐप द्वारा तय किया गया लक्ष्य उपयुक्त नहीं है। कैलोरी लक्ष्य अपनाने से पहले कृपया डॉक्टर से मिलें — इसमें उचित जाँच ज़रूरी है, एल्गोरिद्म नहीं।",
    warn_loss_title: "यहाँ वज़न घटाने का लक्ष्य उचित नहीं है",
    warn_loss_body: "आपका BMI {bmi} है, जो पहले से ही स्वस्थ सीमा (18.5–25) से नीचे है। इस पर कैलोरी घटाने से मांसपेशी की हानि, हार्मोन असंतुलन और पोषक तत्वों की कमी का ख़तरा है। इसके बजाय \"वज़न बढ़ाना\" या \"मांसपेशी बढ़ाना\" चुनें, या आहार विशेषज्ञ से बात करें।",
    warn_under_title: "आप स्वस्थ BMI सीमा से नीचे हैं",
    warn_under_body: "{bmi} पर, आपके लक्ष्य वज़न बढ़ाने की ओर होंगे। यदि आपका वज़न बिना कोशिश के घट रहा है, तो डॉक्टर से बात करें।",
    go_back_change: "वापस जाकर जानकारी बदलें",
    go_back: "वापस जाएँ", continue_anyway: "जारी रखें",
    calories: "कैलोरी", protein: "प्रोटीन", carbs: "कार्ब्स", fat: "वसा",
    fiber: "फ़ाइबर", calcium: "कैल्शियम", b12: "बी12", water: "पानी",
    kcal: "कैलोरी", consumed: "लिया गया", required: "आवश्यक",
    of_daily_goal: "दैनिक लक्ष्य का", kcal_consumed_required: "कैलोरी ली गई / आवश्यक",
    day_completion: "दिन की प्रगति", targets_met: "5 में से {n} लक्ष्य पूरे",
    left: "{n} शेष", over: "{n} अधिक",
    breakfast: "नाश्ता", lunch: "दोपहर का भोजन", snacks: "स्नैक्स", dinner: "रात का भोजन",
    add: "+ जोड़ें", items: "चीज़ें", item: "चीज़",
    log_food: "📷 भोजन दर्ज करें", analyzing: "🔍 जाँच हो रही है...", detected: "✅ भोजन पहचाना गया",
    choose_photo: "भोजन की फ़ोटो चुनें",
    drag_drop: "आप फ़ोटो खींचकर छोड़ भी सकते हैं",
    or_type: "या टाइप करें",
    search_placeholder: "जैसे चिकन टिक्का, 2 रोटी, दाल",
    did_you_mean: "क्या आपका मतलब — तुरंत जोड़ने के लिए दबाएँ",
    not_listed: "सूची में नहीं? → दबाकर AI से अनुमान लगवाएँ।",
    identifying: "कैलोरी और पोषक तत्वों की पहचान हो रही है...",
    meal: "भोजन", portion: "मात्रा",
    auto_set: "समय के अनुसार ({t})", changed_from: "{m} से बदला गया",
    add_item: "+ चीज़ जोड़ें", meal_total: "कुल",
    add_to: "{m} में जोड़ें →",
    your_diet: "आपका आहार", vegetarian: "शाकाहारी", eggetarian: "अंडाहारी",
    nonveg: "मांसाहारी", mixed: "मिश्रित",
    log_to_meal: "किस भोजन में दर्ज करें", matches_time: "वर्तमान समय अनुसार",
    auto_was: "स्वतः {m} था",
    still_needed: "आज अभी बाकी", calories_left: "कैलोरी शेष",
    all_met: "✅ सभी लक्ष्य लगभग पूरे। नीचे दिए विकल्प वैकल्पिक हैं।",
    biggest_gap: "सबसे बड़ी कमी:", then_x: " — फिर {x}",
    suggested: "आपके लिए सुझाव", all_foods: "सभी भोजन",
    search_results: "खोज परिणाम", browse_all: "सभी {n} देखें",
    show_top: "मुख्य सुझाव दिखाएँ", best_match: "सर्वोत्तम",
    plan_btn: "+ योजना", log_btn: "दर्ज", your_plan: "आपकी योजना ({n})",
    clear: "हटाएँ", if_you_eat: "यह खाने पर आप होंगे",
    add_n_to: "{n} {items} {m} में जोड़ें →",
    added_to: "{m} में जोड़ा गया",
    logged_updated: "{n} {items} दर्ज — आपके लक्ष्य अपडेट हो गए।",
    search_foods: "भोजन खोजें — दाल, पनीर, मछली...",
    plan_disclaimer: "ये मान सामान्य घरेलू पकवान के औसत हैं। तेल, मात्रा और विधि अलग-अलग होती है — दर्ज करने के बाद समायोजित करें।",
    water_of: "{goal} में से {n} गिलास · लगभग {l} लीटर",
    water_extra: "{n} अतिरिक्त — अच्छी तरह हाइड्रेटेड",
    quick_add: "तुरंत जोड़ें — हाल के",
    this_week: "इस सप्ताह · {n} {days} दर्ज", day: "दिन", days: "दिन",
    avg_vs_goal: "औसत / दिन, लक्ष्य {goal}{unit}",
    hit_target: "{total} में से {n} दिन लक्ष्य पूरा",
    weekly_empty: "कुछ दिन दर्ज करें और यहाँ साप्ताहिक औसत व रुझान दिखेंगे।",
    protein_up: "पिछले सप्ताह से प्रोटीन {n}% बढ़ा — व्यायाम कर रहे हैं तो यही सही दिशा है।",
    protein_down: "पिछले सप्ताह से प्रोटीन {n}% घटा। कैलोरी कम कर रहे हैं तो ध्यान दें, प्रोटीन ही मांसपेशी बचाता है।",
    protein_steady: "प्रोटीन सप्ताह-दर-सप्ताह स्थिर है।",
    no_history: "अभी कोई इतिहास नहीं",
    no_history_body: "कुछ दिन भोजन दर्ज करें, फिर यहाँ आपका कैलोरी संतुलन, औसत और रुझान दिखेंगे।",
    days_n: "{n} दिन", all: "सभी", deficit: "कमी", surplus: "अधिकता",
    avg_daily: "दैनिक औसत", on_target: "लक्ष्य पर",
    total_deficit: "कुल कमी", total_surplus: "कुल अधिकता",
    of_days: "{n} दिनों में", kcal_under: "कैलोरी कम", kcal_over: "कैलोरी अधिक",
    under_goal: "▲ लक्ष्य से कम", over_goal: "▼ लक्ष्य से अधिक",
    goal_kcal: "लक्ष्य: {n} कैलोरी", daily_breakdown: "दैनिक विवरण",
    today_badge: "आज", export_csv: "⬇️ सारा डेटा CSV में निर्यात करें",
    on_target_pm: "लक्ष्य पर ±100",
    weight_tracking: "वज़न रिकॉर्ड", no_weight: "अभी कोई वज़न दर्ज नहीं",
    no_weight_body: "हर सप्ताह एक ही समय पर दर्ज करें। रोज़ का वज़न सिर्फ़ पानी से 1–2 कि.ग्रा. बदलता है, इसलिए किसी एक आँकड़े से रुझान ज़्यादा मायने रखता है।",
    weight_kg: "वज़न (कि.ग्रा.)", log: "दर्ज",
    kg_over: "{c} रिकॉर्ड में {n} कि.ग्रा.",
    guides_settings: "गाइड और सेटिंग्स", guides_header: "पोषण और फ़िटनेस गाइड",
    settings: "सेटिंग्स", edit_profile: "प्रोफ़ाइल और लक्ष्य बदलें",
    recalc: "अपने दैनिक लक्ष्य फिर से गिनें",
    export_data: "डेटा CSV में निर्यात करें", export_sub: "अपना पूरा रिकॉर्ड डाउनलोड करें",
    clear_data: "सहेजा डेटा मिटाएँ", clear_sub: "प्रोफ़ाइल और आज का रिकॉर्ड हटाएँ",
    clear_confirm: "इससे इस डिवाइस से आपकी प्रोफ़ाइल और भोजन रिकॉर्ड मिट जाएगा। यह वापस नहीं आएगा।",
    keep_it: "रहने दें", delete: "मिटाएँ",
    device_only: "आपका डेटा सिर्फ़ इसी डिवाइस पर है — कहीं अपलोड नहीं होता।",
    disclaimer: "यह सामान्य और शैक्षिक जानकारी है। व्यक्तिगत चिकित्सकीय सलाह के लिए योग्य विशेषज्ञ से मिलें।",
    sections: "{n} भाग", back_to_menu: "← मेन्यू पर वापस",
    guide_disclaimer: "यह सामान्य मार्गदर्शन है। किसी बीमारी, गर्भावस्था या दवा के प्रभाव के लिए डॉक्टर या आहार विशेषज्ञ से सलाह लें।",
    language: "भाषा", lang_sub: "English / हिंदी",
    ai_coach: "AI सलाहकार",
    csv_done: "CSV डाउनलोड हो गया",
    csv_fail: "ब्राउज़र ने निर्यात रोका — दूसरा ब्राउज़र आज़माएँ",
    added_toast: "{name} {m} में जोड़ा गया",
    good_sources: "अच्छे स्रोत (भारतीय)",
    macros: "मुख्य पोषक तत्व", micronutrients: "सूक्ष्म पोषक तत्व",
    daily_targets: "आपके दैनिक लक्ष्य", based_on: "आधार:",
  }
};

// Hindi names for the food database, keyed by the English name.
const FOOD_HI = {
  "Toor dal (arhar)":"तूर दाल (अरहर)", "Moong dal":"मूंग दाल", "Masoor dal":"मसूर दाल",
  "Chana dal":"चना दाल", "Urad dal (kali dal)":"उड़द दाल (काली दाल)", "Dal makhani":"दाल मखनी",
  "Mixed dal (panchmel)":"पंचमेल दाल", "Rajma masala":"राजमा मसाला", "Chhole masala":"छोले मसाला",
  "Sprouts bowl":"अंकुरित अनाज", "Sprouted moong salad":"अंकुरित मूंग सलाद",
  "Soya chunk curry":"सोया चंक करी", "Lobia (black eyed pea)":"लोबिया",
  "Paneer bhurji":"पनीर भुर्जी", "Paneer tikka":"पनीर टिक्का", "Palak paneer":"पालक पनीर",
  "Curd / dahi":"दही", "Glass of milk":"एक गिलास दूध", "Lassi (unsweetened)":"लस्सी (बिना चीनी)",
  "Cheese cubes":"चीज़ क्यूब", "Tofu stir-fry":"टोफू भुना",
  "Paneer paratha":"पनीर पराठा", "Aloo paratha":"आलू पराठा", "Mix veg paratha":"मिक्स वेज पराठा",
  "Methi thepla":"मेथी थेपला", "Ragi roti":"रागी रोटी", "Whole wheat roti":"गेहूँ की रोटी",
  "Masala dosa":"मसाला डोसा", "Plain dosa":"सादा डोसा", "Idli with sambar":"इडली सांभर",
  "Uttapam (onion)":"उत्तपम (प्याज़)", "Rava upma":"रवा उपमा", "Poha":"पोहा", "Dhokla":"ढोकला",
  "Broccoli stir-fry":"ब्रोकली भुजिया", "Cabbage sabzi":"पत्तागोभी सब्ज़ी",
  "Cauliflower (gobi) sabzi":"गोभी सब्ज़ी", "Aloo gobi":"आलू गोभी", "Palak sabzi":"पालक सब्ज़ी",
  "Bhindi masala":"भिंडी मसाला", "Baingan bharta":"बैंगन भर्ता", "Mixed veg curry":"मिक्स वेज करी",
  "Lauki / turai sabzi":"लौकी / तुरई सब्ज़ी",
  "Kachumber salad":"कचूमर सलाद", "Tomato-cucumber salad":"टमाटर-खीरा सलाद",
  "Sprout & veg salad":"अंकुरित सब्ज़ी सलाद", "Cabbage-capsicum slaw":"पत्तागोभी-शिमला मिर्च सलाद",
  "Mixed veg salad":"मिक्स वेज सलाद",
  "Oats with milk":"दूध के साथ ओट्स", "Ragi porridge":"रागी दलिया", "Bajra khichdi":"बाजरा खिचड़ी",
  "Chia pudding":"चिया पुडिंग", "Roasted chana":"भुना चना", "Peanut chaat":"मूंगफली चाट",
  "Almonds":"बादाम", "Makhana (roasted)":"भुना मखाना", "Sesame (til) laddu":"तिल लड्डू",
  "Guava":"अमरूद", "Banana":"केला", "Apple":"सेब",
  "Boiled eggs":"उबले अंडे", "Egg bhurji":"अंडा भुर्जी", "Egg curry":"अंडा करी",
  "Egg white omelette":"अंडे की सफ़ेदी का ऑमलेट", "Masala omelette":"मसाला ऑमलेट",
  "Anda paratha":"अंडा पराठा", "Egg bhurji roll":"अंडा भुर्जी रोल",
  "Chicken tikka":"चिकन टिक्का", "Afghani chicken":"अफ़ग़ानी चिकन",
  "Tandoori chicken":"तंदूरी चिकन", "Grilled chicken breast":"ग्रिल्ड चिकन ब्रेस्ट",
  "Chicken curry":"चिकन करी", "Butter chicken":"बटर चिकन", "Chicken keema":"चिकन कीमा",
  "Chicken seekh kebab":"चिकन सीख कबाब", "Chicken biryani":"चिकन बिरयानी",
  "Chicken soup":"चिकन सूप",
  "Mutton curry":"मटन करी", "Mutton rogan josh":"मटन रोगन जोश",
  "Mutton keema":"मटन कीमा", "Mutton seekh kebab":"मटन सीख कबाब",
  "Grilled fish":"ग्रिल्ड मछली", "Rohu fish curry":"रोहू मछली करी",
  "Pomfret fry":"पॉम्फ्रेट फ्राई", "Surmai (kingfish) fry":"सुरमई फ्राई",
  "Grilled salmon":"ग्रिल्ड सैल्मन", "Tuna (canned in water)":"टूना (डिब्बाबंद)",
  "Sardines / small fish":"सार्डिन / छोटी मछली", "Fish fingers":"फ़िश फ़िंगर",
  "Fish tikka":"मछली टिक्का", "Prawns masala":"झींगा मसाला", "Grilled prawns":"ग्रिल्ड झींगा",
};

const SERVING_HI = {
  "1 cup cooked":"1 कप पका हुआ", "1 cup":"1 कप", "1 bowl":"1 कटोरी",
  "1 large bowl":"1 बड़ी कटोरी", "1 bowl (150g)":"1 कटोरी (150 ग्राम)",
  "1 glass":"1 गिलास", "250ml full-fat":"250 मि.ली. फुल क्रीम",
  "1 piece":"1 पीस", "2 pieces":"2 पीस", "3 pieces":"3 पीस", "4 pieces":"4 पीस",
  "5 pieces":"5 पीस", "2 rotis":"2 रोटी", "3 idlis + sambar":"3 इडली + सांभर",
  "1 large":"1 बड़ा", "1 medium":"1 मध्यम", "1 small":"1 छोटा", "1 roll":"1 रोल",
  "1 plate":"1 प्लेट", "2 whole":"2 पूरे", "3 eggs":"3 अंडे", "2 eggs":"2 अंडे",
  "4 whites":"4 सफ़ेदी", "2 eggs in gravy":"ग्रेवी में 2 अंडे",
  "150g (6 pieces)":"150 ग्राम (6 पीस)", "2 tbsp chia":"2 बड़े चम्मच चिया",
  "25g (~20)":"25 ग्राम (~20)", "30g":"30 ग्राम", "40g":"40 ग्राम",
  "50g peanuts":"50 ग्राम मूंगफली", "50g dry soya":"50 ग्राम सूखा सोया",
  "50g ragi flour":"50 ग्राम रागी आटा", "40g oats":"40 ग्राम ओट्स",
  "100g":"100 ग्राम", "100g paneer":"100 ग्राम पनीर", "120g":"120 ग्राम",
  "150g":"150 ग्राम", "150g tofu":"150 ग्राम टोफू", "150g chicken":"150 ग्राम चिकन",
  "150g fish":"150 ग्राम मछली", "200g":"200 ग्राम", "1 cup (200g)":"1 कप (200 ग्राम)",
  "1 cup (150g)":"1 कप (150 ग्राम)",
};

// Translate with {placeholder} substitution.
function makeT(lang) {
  return (key, vars) => {
    let str = STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.split(`{${k}}`).join(String(v));
      });
    }
    return str;
  };
}

const LangCtx = createContext({ lang: "en", t: makeT("en"), setLang: () => {} });
const useLang = () => useContext(LangCtx);

const foodName = (name, lang) => (lang === "hi" ? FOOD_HI[name] || name : name);
const servingName = (s, lang) => (lang === "hi" ? SERVING_HI[s] || s : s);

// ─── Language toggle ──────────────────────────────────────────────────────────
function LanguageToggle({ compact }) {
  const { lang, setLang } = useLang();
  return (
    <div style={{
      display:"flex", gap:0, background:T.card, border:`1px solid ${T.border}`,
      borderRadius:9, overflow:"hidden",
      ...(compact ? {} : { position:"absolute", top:18, right:18, zIndex:10 })
    }}>
      {[["en","EN"],["hi","हिं"]].map(([code,label]) => (
        <button key={code} onClick={() => setLang(code)} style={{
          background: lang===code ? T.teal : "transparent",
          border:"none", color: lang===code ? T.bg : T.textSecondary,
          fontSize:11, fontWeight:800, padding:"6px 12px", cursor:"pointer"
        }}>{label}</button>
      ))}
    </div>
  );
}

// ─── Ring ─────────────────────────────────────────────────────────────────────
function Ring({ value, max, color, size = 80, stroke = 7, label, sub, icon }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const dash = circ * pct, gap = circ - dash;
  const over = value > max;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke={over ? T.red : color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1), stroke 0.4s" }} />
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          {icon && <span style={{ fontSize: 10 }}>{icon}</span>}
          <span style={{ fontSize: 12, fontWeight: 700, color: over ? T.red : color, fontFamily: "monospace", lineHeight: 1 }}>
            {Math.round(pct * 100)}%
          </span>
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: T.textPrimary }}>{label}</div>
        <div style={{ fontSize: 9, color: T.textSecondary, fontFamily: "monospace" }}>{sub}</div>
      </div>
    </div>
  );
}

// ─── Hero Calorie Ring ────────────────────────────────────────────────────────
function CalorieRing({ consumed, goal }) {
  const size = 180, stroke = 14;
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  const rawPct = goal > 0 ? consumed / goal : 0;
  const pct = Math.min(rawPct, 1);
  const dash = circ * pct, gap = circ - dash;
  const over = consumed > goal;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={over ? T.red : pct > 0.85 ? T.orange : T.teal}
          strokeWidth={stroke} strokeDasharray={`${dash} ${gap}`} strokeLinecap="round"
          style={{ transition:"stroke-dasharray 1s cubic-bezier(.4,0,.2,1)", filter:`drop-shadow(0 0 8px ${over?T.red:T.teal}60)` }} />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:1 }}>
        {/* Percentage of the day's requirement */}
        <div style={{
          fontSize:30, fontWeight:800, fontFamily:"monospace", lineHeight:1,
          color: over ? T.red : rawPct > 0.85 ? T.orange : T.teal
        }}>
          {Math.round(rawPct * 100)}<span style={{ fontSize:16 }}>%</span>
        </div>
        <div style={{ fontSize:9, color:T.textMuted, fontWeight:600, letterSpacing:1, marginTop:1 }}>{t("of_daily_goal")}</div>

        <div style={{ width:64, height:1, background:T.border, margin:"7px 0 6px" }} />

        {/* Consumed against requirement */}
        <div style={{ fontSize:14, fontWeight:800, color:T.textPrimary, fontFamily:"monospace", lineHeight:1 }}>
          {consumed.toLocaleString()}
          <span style={{ color:T.textMuted, fontWeight:400 }}> / </span>
          {goal.toLocaleString()}
        </div>
        <div style={{ fontSize:9.5, color:T.textSecondary, marginTop:2 }}>kcal consumed / required</div>

        <div style={{ marginTop:5, fontSize:10, color: over ? T.red : T.teal, fontWeight:700 }}>
          {over ? `${consumed-goal} over` : `${goal-consumed} left`}
        </div>
      </div>
    </div>
  );
}

// ─── Macro Pill (bar) ─────────────────────────────────────────────────────────
function MacroPill({ label, value, goal, color, unit = "g" }) {
  const pct = Math.min(value / goal, 1);
  return (
    <div style={{ flex: 1, background: T.card, borderRadius: 12, padding: "10px 8px", border:`1px solid ${T.border}`, minWidth: 0 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontSize:10, color:T.textSecondary, fontWeight:600 }}>{label}</span>
        <span style={{ fontSize:10, color, fontFamily:"monospace", fontWeight:700 }}>{value}{unit}</span>
      </div>
      <div style={{ background:T.border, borderRadius:4, height:4, overflow:"hidden" }}>
        <div style={{ width:`${pct*100}%`, height:"100%", background:color, borderRadius:4, transition:"width 0.8s cubic-bezier(.4,0,.2,1)" }} />
      </div>
      <div style={{ marginTop:4, fontSize:9, color:T.textMuted, fontFamily:"monospace" }}>/{goal}{unit}</div>
    </div>
  );
}

// ─── Micronutrient Bar Card ───────────────────────────────────────────────────
function MicroCard({ icon, label, value, goal, color, unit }) {
  const pct = Math.min(value / goal, 1);
  const over = value > goal;
  return (
    <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:"14px 16px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:18 }}>{icon}</span>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:T.textPrimary }}>{label}</div>
            <div style={{ fontSize:10, color:T.textSecondary }}>Daily target: {goal}{unit}</div>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:16, fontWeight:800, color: over ? T.red : color, fontFamily:"monospace" }}>{value}<span style={{ fontSize:10, fontWeight:400 }}>{unit}</span></div>
          <div style={{ fontSize:10, color:T.textSecondary }}>{Math.round(pct*100)}%</div>
        </div>
      </div>
      <div style={{ background:T.border, borderRadius:6, height:6, overflow:"hidden" }}>
        <div style={{
          width:`${pct*100}%`, height:"100%", borderRadius:6,
          background: over ? T.red : pct > 0.85 ? T.green : color,
          transition:"width 0.8s cubic-bezier(.4,0,.2,1)",
          boxShadow: `0 0 6px ${color}60`
        }} />
      </div>
      {over && <div style={{ marginTop:6, fontSize:10, color:T.red }}>Exceeded by {Math.round(value-goal)}{unit}</div>}
      {!over && pct < 0.4 && value > 0 && <div style={{ marginTop:6, fontSize:10, color:T.amber }}>Only {Math.round(pct*100)}% reached — aim for more</div>}
    </div>
  );
}

// ─── Meal Card ────────────────────────────────────────────────────────────────
function MealCard({ meal, onAdd }) {
  const { t, lang } = useLang();
  const zero = { kcal:0, protein:0, carbs:0, fat:0, fiber:0, calcium:0, b12:0 };
  const total = meal.items.reduce((a,b) => ({
    kcal: a.kcal+b.kcal, protein: a.protein+b.protein,
    carbs: a.carbs+b.carbs, fat: a.fat+b.fat,
    fiber: a.fiber+(b.fiber||0), calcium: a.calcium+(b.calcium||0), b12: a.b12+(b.b12||0)
  }), zero);

  return (
    <div style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}`, overflow:"hidden" }}>
      <div style={{ padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:T.textPrimary }}>{meal.icon} {t(meal.name.toLowerCase())}</div>
          <div style={{ fontSize:11, color:T.textSecondary, marginTop:2 }}>
            {meal.items.length} {t("items")} · <span style={{ color:T.teal, fontFamily:"monospace" }}>{total.kcal} kcal</span>
          </div>
        </div>
        <button onClick={() => onAdd(meal.name)} style={{
          background:T.tealDim, border:`1px solid ${T.teal}40`, borderRadius:8,
          color:T.teal, fontSize:11, fontWeight:700, padding:"6px 12px", cursor:"pointer"
        }}>{t("add")}</button>
      </div>
      {meal.items.length > 0 && (
        <div style={{ borderTop:`1px solid ${T.border}` }}>
          {meal.items.map((item, i) => (
            <div key={i} style={{
              padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center",
              borderBottom: i < meal.items.length-1 ? `1px solid ${T.border}` : "none"
            }}>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:T.textPrimary }}>{foodName(item.name, lang)}</div>
                <div style={{ fontSize:10, color:T.textSecondary }}>{item.weight}g</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:12, fontFamily:"monospace", color:T.textPrimary, fontWeight:700 }}>{item.kcal} kcal</div>
                <div style={{ fontSize:10, color:T.textSecondary }}>P:{d1(item.protein)}g C:{d1(item.carbs)}g F:{d1(item.fat)}g</div>
                <div style={{ fontSize:9, color:T.textMuted }}>
                  Fib:{d1(item.fiber)}g Ca:{d1(item.calcium)}mg B12:{d1(item.b12)}μg
                </div>
              </div>
            </div>
          ))}
          <div style={{ padding:"10px 16px", background:T.surface, display:"flex", flexWrap:"wrap", gap:10 }}>
            {[[t("protein"),d1(total.protein),"g",T.orange],[t("carbs"),d1(total.carbs),"g",T.violet],[t("fat"),d1(total.fat),"g",T.amber],
              [t("fiber"),d1(total.fiber),"g",T.lime],[t("calcium"),d1(total.calcium),"mg",T.sky],[t("b12"),d1(total.b12),"μg",T.pink]
            ].map(([l,v,u,c]) => (
              <div key={l} style={{ fontSize:10, color:T.textSecondary }}>
                {l}: <span style={{ color:c, fontFamily:"monospace", fontWeight:700 }}>{v}{u}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Scanner Modal ────────────────────────────────────────────────────────────
const FOOD_DB = [
  // ═══ VEGETARIAN — Dals ═══
  { name:"Toor dal (arhar)",     serving:"1 cup cooked",    diet:"veg", kcal:200, protein:12, carbs:35, fat:1,  fiber:11,  calcium:48,  b12:0,   tags:["protein","fiber"] },
  { name:"Moong dal",            serving:"1 cup cooked",    diet:"veg", kcal:212, protein:14, carbs:39, fat:1,  fiber:15,  calcium:55,  b12:0,   tags:["protein","fiber"] },
  { name:"Masoor dal",           serving:"1 cup cooked",    diet:"veg", kcal:230, protein:18, carbs:40, fat:1,  fiber:16,  calcium:38,  b12:0,   tags:["protein","fiber"] },
  { name:"Chana dal",            serving:"1 cup cooked",    diet:"veg", kcal:270, protein:15, carbs:45, fat:4,  fiber:13,  calcium:70,  b12:0,   tags:["protein","fiber"] },
  { name:"Urad dal (kali dal)",  serving:"1 cup cooked",    diet:"veg", kcal:240, protein:15, carbs:38, fat:3,  fiber:12,  calcium:80,  b12:0,   tags:["protein","fiber"] },
  { name:"Dal makhani",          serving:"1 cup",           diet:"veg", kcal:330, protein:14, carbs:35, fat:16, fiber:11,  calcium:120, b12:0.3, tags:["protein","fiber","calorie-dense"] },
  { name:"Mixed dal (panchmel)", serving:"1 cup cooked",    diet:"veg", kcal:220, protein:14, carbs:37, fat:2,  fiber:13,  calcium:60,  b12:0,   tags:["protein","fiber"] },

  // ═══ VEGETARIAN — Legumes & sprouts ═══
  { name:"Rajma masala",         serving:"1 cup",           diet:"veg", kcal:280, protein:15, carbs:42, fat:6,  fiber:13,  calcium:80,  b12:0,   tags:["protein","fiber"] },
  { name:"Chhole masala",        serving:"1 cup",           diet:"veg", kcal:300, protein:15, carbs:45, fat:8,  fiber:12,  calcium:85,  b12:0,   tags:["protein","fiber"] },
  { name:"Sprouts bowl",         serving:"1 bowl (150g)",   diet:"veg", kcal:140, protein:11, carbs:24, fat:1,  fiber:9,   calcium:55,  b12:0,   tags:["protein","fiber","light"] },
  { name:"Sprouted moong salad", serving:"1 cup",           diet:"veg", kcal:110, protein:9,  carbs:19, fat:1,  fiber:8,   calcium:44,  b12:0,   tags:["protein","fiber","light"] },
  { name:"Soya chunk curry",     serving:"50g dry soya",    diet:"veg", kcal:170, protein:26, carbs:14, fat:1,  fiber:6,   calcium:120, b12:0,   tags:["protein","fiber"] },
  { name:"Lobia (black eyed pea)", serving:"1 cup",         diet:"veg", kcal:200, protein:13, carbs:36, fat:1,  fiber:11,  calcium:41,  b12:0,   tags:["protein","fiber"] },

  // ═══ VEGETARIAN — Paneer & dairy ═══
  { name:"Paneer bhurji",        serving:"100g paneer",     diet:"veg", kcal:265, protein:18, carbs:4,  fat:20, fiber:0,   calcium:208, b12:0.9, tags:["protein","calcium","b12"] },
  { name:"Paneer tikka",         serving:"100g",            diet:"veg", kcal:250, protein:18, carbs:5,  fat:18, fiber:1,   calcium:208, b12:0.9, tags:["protein","calcium","b12"] },
  { name:"Palak paneer",         serving:"1 cup",           diet:"veg", kcal:280, protein:15, carbs:10, fat:20, fiber:4,   calcium:350, b12:0.8, tags:["protein","calcium","b12"] },
  { name:"Curd / dahi",          serving:"1 cup (200g)",    diet:"veg", kcal:120, protein:9,  carbs:12, fat:4,  fiber:0,   calcium:300, b12:1.1, tags:["calcium","b12","protein"] },
  { name:"Glass of milk",        serving:"250ml full-fat",  diet:"veg", kcal:150, protein:8,  carbs:12, fat:8,  fiber:0,   calcium:300, b12:1.2, tags:["calcium","b12","calorie-dense"] },
  { name:"Lassi (unsweetened)",  serving:"1 glass",         diet:"veg", kcal:130, protein:7,  carbs:11, fat:6,  fiber:0,   calcium:250, b12:0.9, tags:["calcium","b12"] },
  { name:"Cheese cubes",         serving:"30g",             diet:"veg", kcal:120, protein:7,  carbs:1,  fat:10, fiber:0,   calcium:220, b12:0.4, tags:["calcium","b12"] },
  { name:"Tofu stir-fry",        serving:"150g tofu",       diet:"veg", kcal:180, protein:17, carbs:5,  fat:11, fiber:2,   calcium:525, b12:0,   tags:["protein","calcium"] },

  // ═══ VEGETARIAN — Parathas & breads ═══
  { name:"Paneer paratha",       serving:"1 piece",         diet:"veg", kcal:300, protein:12, carbs:33, fat:14, fiber:4,   calcium:200, b12:0.6, tags:["protein","calcium","b12","calorie-dense"] },
  { name:"Aloo paratha",         serving:"1 piece",         diet:"veg", kcal:290, protein:6,  carbs:42, fat:11, fiber:4,   calcium:45,  b12:0,   tags:["calorie-dense"] },
  { name:"Mix veg paratha",      serving:"1 piece",         diet:"veg", kcal:250, protein:7,  carbs:36, fat:9,  fiber:6,   calcium:70,  b12:0,   tags:["fiber","calorie-dense"] },
  { name:"Methi thepla",         serving:"2 pieces",        diet:"veg", kcal:200, protein:6,  carbs:30, fat:7,  fiber:6,   calcium:130, b12:0,   tags:["fiber","calcium"] },
  { name:"Ragi roti",            serving:"2 rotis",         diet:"veg", kcal:180, protein:5,  carbs:38, fat:1,  fiber:7,   calcium:200, b12:0,   tags:["calcium","fiber"] },
  { name:"Whole wheat roti",     serving:"2 rotis",         diet:"veg", kcal:160, protein:6,  carbs:32, fat:2,  fiber:5,   calcium:40,  b12:0,   tags:["fiber"] },

  // ═══ VEGETARIAN — South Indian ═══
  { name:"Masala dosa",          serving:"1 large",         diet:"veg", kcal:290, protein:7,  carbs:45, fat:9,  fiber:4,   calcium:60,  b12:0,   tags:["calorie-dense"] },
  { name:"Plain dosa",           serving:"1 large",         diet:"veg", kcal:170, protein:5,  carbs:29, fat:4,  fiber:2,   calcium:40,  b12:0,   tags:["light"] },
  { name:"Idli with sambar",     serving:"3 idlis + sambar", diet:"veg", kcal:250, protein:10, carbs:46, fat:3,  fiber:7,   calcium:80,  b12:0,   tags:["protein","fiber","light"] },
  { name:"Uttapam (onion)",      serving:"1 large",         diet:"veg", kcal:230, protein:7,  carbs:38, fat:6,  fiber:4,   calcium:55,  b12:0,   tags:["fiber"] },
  { name:"Rava upma",            serving:"1 cup",           diet:"veg", kcal:230, protein:6,  carbs:36, fat:7,  fiber:3,   calcium:40,  b12:0,   tags:[] },
  { name:"Poha",                 serving:"1 cup",           diet:"veg", kcal:250, protein:5,  carbs:44, fat:6,  fiber:3,   calcium:30,  b12:0,   tags:[] },
  { name:"Dhokla",               serving:"4 pieces",        diet:"veg", kcal:160, protein:7,  carbs:24, fat:4,  fiber:3,   calcium:45,  b12:0,   tags:["light","protein"] },

  // ═══ VEGETARIAN — Vegetables ═══
  { name:"Broccoli stir-fry",    serving:"1 cup (150g)",    diet:"veg", kcal:90,  protein:5,  carbs:11, fat:4,  fiber:5,   calcium:70,  b12:0,   tags:["fiber","light","protein"] },
  { name:"Cabbage sabzi",        serving:"1 cup",           diet:"veg", kcal:85,  protein:3,  carbs:12, fat:4,  fiber:5,   calcium:60,  b12:0,   tags:["fiber","light"] },
  { name:"Cauliflower (gobi) sabzi", serving:"1 cup",       diet:"veg", kcal:100, protein:4,  carbs:12, fat:5,  fiber:5,   calcium:45,  b12:0,   tags:["fiber","light"] },
  { name:"Aloo gobi",            serving:"1 cup",           diet:"veg", kcal:180, protein:5,  carbs:26, fat:7,  fiber:6,   calcium:55,  b12:0,   tags:["fiber"] },
  { name:"Palak sabzi",          serving:"1 cup",           diet:"veg", kcal:80,  protein:4,  carbs:8,  fat:4,  fiber:5,   calcium:190, b12:0,   tags:["fiber","calcium","light"] },
  { name:"Bhindi masala",        serving:"1 cup",           diet:"veg", kcal:90,  protein:3,  carbs:11, fat:4,  fiber:5,   calcium:82,  b12:0,   tags:["fiber","light"] },
  { name:"Baingan bharta",       serving:"1 cup",           diet:"veg", kcal:130, protein:3,  carbs:14, fat:8,  fiber:6,   calcium:40,  b12:0,   tags:["fiber"] },
  { name:"Mixed veg curry",      serving:"1 cup",           diet:"veg", kcal:150, protein:5,  carbs:18, fat:7,  fiber:6,   calcium:75,  b12:0,   tags:["fiber"] },
  { name:"Lauki / turai sabzi",  serving:"1 cup",           diet:"veg", kcal:70,  protein:2,  carbs:9,  fat:3,  fiber:3,   calcium:35,  b12:0,   tags:["light"] },

  // ═══ VEGETARIAN — Salads ═══
  { name:"Kachumber salad",      serving:"1 bowl",          diet:"veg", kcal:60,  protein:2,  carbs:11, fat:1,  fiber:4,   calcium:45,  b12:0,   tags:["fiber","light"] },
  { name:"Tomato-cucumber salad", serving:"1 bowl",         diet:"veg", kcal:55,  protein:2,  carbs:10, fat:1,  fiber:3,   calcium:35,  b12:0,   tags:["fiber","light"] },
  { name:"Sprout & veg salad",   serving:"1 large bowl",    diet:"veg", kcal:160, protein:11, carbs:26, fat:2,  fiber:10,  calcium:80,  b12:0,   tags:["protein","fiber","light"] },
  { name:"Cabbage-capsicum slaw", serving:"1 bowl",         diet:"veg", kcal:70,  protein:2,  carbs:12, fat:2,  fiber:5,   calcium:55,  b12:0,   tags:["fiber","light"] },
  { name:"Mixed veg salad",      serving:"1 large bowl",    diet:"veg", kcal:70,  protein:3,  carbs:14, fat:1,  fiber:6,   calcium:60,  b12:0,   tags:["fiber","light"] },

  // ═══ VEGETARIAN — Grains, snacks & fruit ═══
  { name:"Oats with milk",       serving:"40g oats",        diet:"veg", kcal:220, protein:10, carbs:32, fat:5,  fiber:5,   calcium:180, b12:0.6, tags:["fiber","protein","b12"] },
  { name:"Ragi porridge",        serving:"50g ragi flour",  diet:"veg", kcal:170, protein:4,  carbs:36, fat:1,  fiber:6,   calcium:172, b12:0,   tags:["calcium","fiber"] },
  { name:"Bajra khichdi",        serving:"1 cup",           diet:"veg", kcal:250, protein:8,  carbs:45, fat:4,  fiber:8,   calcium:60,  b12:0,   tags:["fiber"] },
  { name:"Chia pudding",         serving:"2 tbsp chia",     diet:"veg", kcal:140, protein:5,  carbs:12, fat:9,  fiber:10,  calcium:180, b12:0,   tags:["fiber","calcium"] },
  { name:"Roasted chana",        serving:"40g",             diet:"veg", kcal:150, protein:8,  carbs:22, fat:3,  fiber:6,   calcium:45,  b12:0,   tags:["protein","fiber","light"] },
  { name:"Peanut chaat",         serving:"50g peanuts",     diet:"veg", kcal:285, protein:13, carbs:9,  fat:23, fiber:4,   calcium:46,  b12:0,   tags:["protein","calorie-dense"] },
  { name:"Almonds",              serving:"25g (~20)",       diet:"veg", kcal:150, protein:5,  carbs:5,  fat:13, fiber:3,   calcium:66,  b12:0,   tags:["calorie-dense","calcium"] },
  { name:"Makhana (roasted)",    serving:"30g",             diet:"veg", kcal:105, protein:3,  carbs:23, fat:0,  fiber:2,   calcium:18,  b12:0,   tags:["light"] },
  { name:"Sesame (til) laddu",   serving:"1 small",         diet:"veg", kcal:130, protein:3,  carbs:12, fat:8,  fiber:2,   calcium:180, b12:0,   tags:["calcium","calorie-dense"] },
  { name:"Guava",                serving:"1 medium",        diet:"veg", kcal:60,  protein:2,  carbs:14, fat:1,  fiber:5,   calcium:20,  b12:0,   tags:["fiber","light"] },
  { name:"Banana",               serving:"1 medium",        diet:"veg", kcal:105, protein:1,  carbs:27, fat:0,  fiber:3,   calcium:6,   b12:0,   tags:["fiber","light"] },
  { name:"Apple",                serving:"1 medium",        diet:"veg", kcal:95,  protein:0,  carbs:25, fat:0,  fiber:4,   calcium:11,  b12:0,   tags:["fiber","light"] },

  // ═══ EGGETARIAN ═══
  { name:"Boiled eggs",          serving:"2 whole",         diet:"egg", kcal:155, protein:13, carbs:1,  fat:11, fiber:0,   calcium:50,  b12:1.1, tags:["protein","b12"] },
  { name:"Egg bhurji",           serving:"3 eggs",          diet:"egg", kcal:270, protein:19, carbs:3,  fat:20, fiber:0,   calcium:75,  b12:1.6, tags:["protein","b12","calorie-dense"] },
  { name:"Egg curry",            serving:"2 eggs in gravy", diet:"egg", kcal:290, protein:15, carbs:8,  fat:22, fiber:2,   calcium:90,  b12:1.2, tags:["protein","b12"] },
  { name:"Egg white omelette",   serving:"4 whites",        diet:"egg", kcal:70,  protein:14, carbs:1,  fat:0,  fiber:0,   calcium:25,  b12:0.3, tags:["protein","light"] },
  { name:"Masala omelette",      serving:"2 eggs",          diet:"egg", kcal:200, protein:13, carbs:4,  fat:15, fiber:1,   calcium:60,  b12:1.1, tags:["protein","b12"] },
  { name:"Anda paratha",         serving:"1 piece",         diet:"egg", kcal:320, protein:13, carbs:35, fat:14, fiber:3,   calcium:80,  b12:0.9, tags:["protein","b12","calorie-dense"] },
  { name:"Egg bhurji roll",      serving:"1 roll",          diet:"egg", kcal:340, protein:16, carbs:34, fat:16, fiber:3,   calcium:90,  b12:1.2, tags:["protein","b12","calorie-dense"] },

  // ═══ NON-VEG — Chicken ═══
  { name:"Chicken tikka",        serving:"150g (6 pieces)", diet:"nonveg", kcal:265, protein:34, carbs:5,  fat:12, fiber:1, calcium:70,  b12:0.6, tags:["protein"] },
  { name:"Afghani chicken",      serving:"150g",            diet:"nonveg", kcal:340, protein:30, carbs:6,  fat:22, fiber:1, calcium:130, b12:0.8, tags:["protein","calcium","calorie-dense"] },
  { name:"Tandoori chicken",     serving:"2 pieces",        diet:"nonveg", kcal:280, protein:35, carbs:3,  fat:14, fiber:0, calcium:60,  b12:0.6, tags:["protein"] },
  { name:"Grilled chicken breast", serving:"150g",          diet:"nonveg", kcal:250, protein:46, carbs:0,  fat:6,  fiber:0, calcium:15,  b12:0.5, tags:["protein","light"] },
  { name:"Chicken curry",        serving:"150g chicken",    diet:"nonveg", kcal:320, protein:32, carbs:6,  fat:19, fiber:2, calcium:40,  b12:0.5, tags:["protein"] },
  { name:"Butter chicken",       serving:"150g chicken",    diet:"nonveg", kcal:420, protein:30, carbs:10, fat:29, fiber:2, calcium:120, b12:0.7, tags:["protein","calorie-dense"] },
  { name:"Chicken keema",        serving:"150g",            diet:"nonveg", kcal:300, protein:28, carbs:4,  fat:19, fiber:1, calcium:35,  b12:0.7, tags:["protein","b12"] },
  { name:"Chicken seekh kebab",  serving:"3 pieces",        diet:"nonveg", kcal:270, protein:26, carbs:5,  fat:16, fiber:1, calcium:45,  b12:0.7, tags:["protein"] },
  { name:"Chicken biryani",      serving:"1 plate",         diet:"nonveg", kcal:490, protein:26, carbs:58, fat:17, fiber:3, calcium:70,  b12:0.6, tags:["protein","calorie-dense"] },
  { name:"Chicken soup",         serving:"1 bowl",          diet:"nonveg", kcal:120, protein:14, carbs:6,  fat:4,  fiber:1, calcium:30,  b12:0.4, tags:["protein","light"] },

  // ═══ NON-VEG — Mutton & red meat ═══
  { name:"Mutton curry",         serving:"150g",            diet:"nonveg", kcal:380, protein:30, carbs:5,  fat:26, fiber:1, calcium:30,  b12:2.7, tags:["protein","b12","calorie-dense"] },
  { name:"Mutton rogan josh",    serving:"150g",            diet:"nonveg", kcal:400, protein:29, carbs:7,  fat:28, fiber:2, calcium:40,  b12:2.6, tags:["protein","b12","calorie-dense"] },
  { name:"Mutton keema",         serving:"150g",            diet:"nonveg", kcal:360, protein:28, carbs:4,  fat:26, fiber:1, calcium:35,  b12:2.8, tags:["protein","b12","calorie-dense"] },
  { name:"Mutton seekh kebab",   serving:"3 pieces",        diet:"nonveg", kcal:310, protein:24, carbs:4,  fat:22, fiber:1, calcium:40,  b12:2.4, tags:["protein","b12"] },

  // ═══ NON-VEG — Fish & seafood ═══
  { name:"Grilled fish",         serving:"150g",            diet:"nonveg", kcal:220, protein:32, carbs:0,  fat:10, fiber:0, calcium:40,  b12:2.5, tags:["protein","b12","light"] },
  { name:"Rohu fish curry",      serving:"150g fish",       diet:"nonveg", kcal:230, protein:30, carbs:4,  fat:10, fiber:1, calcium:90,  b12:2.4, tags:["protein","b12"] },
  { name:"Pomfret fry",          serving:"150g",            diet:"nonveg", kcal:280, protein:28, carbs:5,  fat:17, fiber:0, calcium:60,  b12:2.8, tags:["protein","b12"] },
  { name:"Surmai (kingfish) fry", serving:"150g",           diet:"nonveg", kcal:260, protein:33, carbs:3,  fat:13, fiber:0, calcium:50,  b12:3.2, tags:["protein","b12"] },
  { name:"Grilled salmon",       serving:"120g",            diet:"nonveg", kcal:250, protein:28, carbs:0,  fat:15, fiber:0, calcium:15,  b12:3.8, tags:["protein","b12"] },
  { name:"Tuna (canned in water)", serving:"100g",          diet:"nonveg", kcal:130, protein:29, carbs:0,  fat:1,  fiber:0, calcium:12,  b12:2.2, tags:["protein","b12","light"] },
  { name:"Sardines / small fish", serving:"100g",           diet:"nonveg", kcal:210, protein:25, carbs:0,  fat:11, fiber:0, calcium:380, b12:8.9, tags:["protein","calcium","b12"] },
  { name:"Fish fingers",         serving:"5 pieces",        diet:"nonveg", kcal:290, protein:16, carbs:26, fat:14, fiber:2, calcium:45,  b12:1.2, tags:["protein","b12","calorie-dense"] },
  { name:"Fish tikka",           serving:"150g",            diet:"nonveg", kcal:240, protein:31, carbs:4,  fat:11, fiber:1, calcium:65,  b12:2.6, tags:["protein","b12"] },
  { name:"Prawns masala",        serving:"150g",            diet:"nonveg", kcal:200, protein:28, carbs:5,  fat:7,  fiber:1, calcium:110, b12:1.7, tags:["protein","b12","calcium"] },
  { name:"Grilled prawns",       serving:"150g",            diet:"nonveg", kcal:170, protein:30, carbs:1,  fat:5,  fiber:0, calcium:100, b12:1.6, tags:["protein","b12","light"] },
];

// ─── Fuzzy food matching ──────────────────────────────────────────────────────
// Typo-tolerant search over FOOD_DB so "chiken tika" still finds Chicken Tikka.

// Common Indian-English spelling variants mapped to canonical terms.
const SPELLING_ALIASES = {
  chiken:"chicken", chikan:"chicken", chikken:"chicken", chikn:"chicken",
  tika:"tikka", tikkha:"tikka", teeka:"tikka",
  matan:"mutton", muton:"mutton", mtton:"mutton",
  panir:"paneer", pneer:"paneer", panner:"paneer",
  daal:"dal", dhal:"dal", dail:"dal",
  raajma:"rajma", rajmah:"rajma",
  chole:"chhole", chana:"chhole", channa:"chhole",
  roti:"roti", chapati:"roti", chapatti:"roti",
  parantha:"paratha", pratha:"paratha", parotha:"paratha",
  dosaa:"dosa", dhosa:"dosa",
  idly:"idli", iddli:"idli",
  brokelly:"broccoli", brocoli:"broccoli", brocolli:"broccoli",
  cauliflour:"cauliflower", gobhi:"cauliflower", gobi:"cauliflower",
  cabage:"cabbage", kabbage:"cabbage",
  curd:"curd", dahi:"curd", yoghurt:"curd", yogurt:"curd",
  aalo:"aloo", alu:"aloo", potato:"aloo",
  egg:"egg", anda:"egg", ande:"egg",
  fisch:"fish", fih:"fish",
  prawn:"prawns", jhinga:"prawns",
  moong:"moong", mung:"moong", mungh:"moong",
  tuwar:"toor", tur:"toor", arhar:"toor",
  palak:"palak", spinach:"palak",
  bhindi:"bhindi", okra:"bhindi",
  baigan:"baingan", brinjal:"baingan", eggplant:"baingan",
  milk:"milk", doodh:"milk",
  sprout:"sprouts", sprot:"sprouts",
};

function normalise(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(w => SPELLING_ALIASES[w] || w)
    .join(" ");
}

// Levenshtein distance, capped early for speed.
function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 3) return 99;
  const prev = Array(b.length + 1).fill(0).map((_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}

// Score how well a query matches a food name. Higher is better; 0 means no match.
function matchScore(query, foodName) {
  const q = normalise(query);
  const n = normalise(foodName);
  if (!q) return 0;

  if (n === q) return 100;
  if (n.startsWith(q)) return 90;
  if (n.includes(q)) return 80;

  const qWords = q.split(" ");
  const nWords = n.split(" ");
  let score = 0;

  for (const qw of qWords) {
    if (qw.length < 2) continue;
    let best = 0;
    for (const nw of nWords) {
      if (nw === qw) { best = Math.max(best, 30); continue; }
      if (nw.startsWith(qw) || qw.startsWith(nw)) { best = Math.max(best, 24); continue; }
      if (nw.includes(qw)) { best = Math.max(best, 18); continue; }
      // Allow typos proportional to word length
      const tolerance = qw.length <= 4 ? 1 : qw.length <= 7 ? 2 : 3;
      const dist = editDistance(qw, nw);
      if (dist <= tolerance) best = Math.max(best, 20 - dist * 4);
    }
    score += best;
  }
  return score;
}

function searchFoods(query, limit = 6) {
  if (!query || query.trim().length < 2) return [];
  return FOOD_DB
    .map(f => ({ food: f, score: matchScore(query, f.name) }))
    .filter(x => x.score >= 15)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.food);
}


// ─── Meal slot from clock time ────────────────────────────────────────────────
// 04:00–11:00 Breakfast · 11:01–15:00 Lunch · 15:01–18:00 Snacks
// 18:01–23:30 Dinner · 23:31–03:59 falls back to Snacks (late-night eating)
function mealSlotForTime(date = new Date()) {
  const mins = date.getHours() * 60 + date.getMinutes();
  if (mins >= 240 && mins <= 660)   return "Breakfast";  // 04:00–11:00
  if (mins > 660 && mins <= 900)    return "Lunch";      // 11:01–15:00
  if (mins > 900 && mins <= 1080)   return "Snacks";     // 15:01–18:00
  if (mins > 1080 && mins <= 1410)  return "Dinner";     // 18:01–23:30
  return "Snacks";                                       // 23:31–03:59
}

function ScannerModal({ onClose, onAddMeal }) {
  const { t, lang } = useLang();
  const [phase, setPhase] = useState("upload");
  const [image, setImage] = useState(null);
  const [editItems, setEditItems] = useState([]);
  // Default to whichever meal the current time falls in.
  const [mealType, setMealType] = useState(() => mealSlotForTime());
  const [autoSlot] = useState(() => mealSlotForTime());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualFood, setManualFood] = useState("");
  const [showMatches, setShowMatches] = useState(false);

  // Local typo-tolerant matches — instant, no API call needed.
  const matches = searchFoods(manualFood, 5);

  // Adding a known food skips the AI round trip entirely.
  const pickKnownFood = (f) => {
    setEditItems([{
      id: Date.now(), name: f.name, weight: 100,
      kcal: f.kcal, protein: f.protein, carbs: f.carbs, fat: f.fat,
      fiber: f.fiber, calcium: f.calcium, b12: f.b12
    }]);
    setManualFood("");
    setShowMatches(false);
    setPhase("result");
  };

  const ITEM_SCHEMA = `{ "name": "Food Name", "weight": 150, "kcal": 200, "protein": 8, "carbs": 30, "fat": 5, "fiber": 3, "calcium": 40, "b12": 0.5 }`;

  const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || "/api/analyze";

  const callClaude = async (messages, maxTokens = 1000) => {
    const res = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ max_tokens: maxTokens, messages })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Request failed (${res.status})`);
    }
    const data = await res.json();
    const text = data.content?.map(b => b.text || "").join("") || "";
    return text.replace(/```json|```/g, "").trim();
  };

  const analyzeImage = async (base64Data, mediaType = "image/jpeg") => {
    setPhase("scanning"); setLoading(true); setError(null);
    try {
      const clean = await callClaude([{
        role: "user",
        content: [
          { type:"image", source:{ type:"base64", media_type: mediaType, data: base64Data } },
          { type:"text", text:`You are a nutrition AI. Analyze this food image. Return ONLY valid JSON, no markdown:
{"items": [${ITEM_SCHEMA}], "confidence": "high"}
Rules: estimate realistic Indian/global portions, all numbers integers, fiber in grams, calcium in mg, b12 in micrograms (μg). If no food visible return {"items":[],"confidence":"low"}` }
        ]
      }]);
      const parsed = JSON.parse(clean);
      if (parsed.items?.length > 0) {
        setEditItems(parsed.items.map((it,i) => ({ fiber:0,calcium:0,b12:0,...it, id:i })));
        setPhase("result");
      } else { setError("Could not detect food. Try a clearer image or use manual entry."); setPhase("upload"); }
    } catch(e) { setError("Analysis failed: " + (e.message || "Try again.")); setPhase("upload"); }
    setLoading(false);
  };

  const analyzeManual = async () => {
    if (!manualFood.trim()) return;
    setLoading(true); setError(null);
    try {
      const clean = await callClaude([{
        role: "user",
        content: `Nutrition AI. Estimate for: "${manualFood}". Return ONLY valid JSON, no markdown:
{"items": [${ITEM_SCHEMA}]}`
      }], 800);
      const parsed = JSON.parse(clean);
      setEditItems(parsed.items.map((it,i) => ({ fiber:0,calcium:0,b12:0,...it, id:i })));
      setPhase("result");
    } catch { setError("Could not look up that food. Try being more specific."); }
    setLoading(false);
  };

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
      const base64 = e.target.result.split(",")[1];
      // Determine media type; default to jpeg if unknown
      const mediaType = file.type && file.type.startsWith("image/") ? file.type : "image/jpeg";
      analyzeImage(base64, mediaType);
    };
    reader.readAsDataURL(file);
  };

  const totals = editItems.reduce((a,b) => ({
    kcal:a.kcal+b.kcal, protein:a.protein+b.protein, carbs:a.carbs+b.carbs, fat:a.fat+b.fat,
    fiber:a.fiber+(b.fiber||0), calcium:a.calcium+(b.calcium||0), b12:a.b12+(b.b12||0)
  }), { kcal:0, protein:0, carbs:0, fat:0, fiber:0, calcium:0, b12:0 });

  const updateItem = (i, key, val) => setEditItems(prev => prev.map((it,j) => j===i ? {...it,[key]:val} : it));

  // Portion multiplier — always applied to the original detected values so
  // repeated taps don't compound (×2 then ×0.5 returns to the original).
  const setPortion = (i, mult) => setEditItems(prev => prev.map((it, j) => {
    if (j !== i) return it;
    const base = it._base || {
      weight: it.weight, kcal: it.kcal, protein: it.protein, carbs: it.carbs,
      fat: it.fat, fiber: it.fiber, calcium: it.calcium, b12: it.b12
    };
    return {
      ...it,
      _base: base,
      portion: mult,
      weight:  Math.round(base.weight  * mult),
      kcal:    Math.round(base.kcal    * mult),
      protein: d1(base.protein * mult),
      carbs:   d1(base.carbs   * mult),
      fat:     d1(base.fat     * mult),
      fiber:   d1(base.fiber   * mult),
      calcium: Math.round(base.calcium * mult),
      b12:     d1(base.b12     * mult),
    };
  }));

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:100, display:"flex", alignItems:"flex-end", backdropFilter:"blur(4px)" }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:T.surface, borderRadius:"24px 24px 0 0", width:"100%", maxHeight:"92vh", overflow:"auto", border:`1px solid ${T.border}`, borderBottom:"none" }}>
        <div style={{ padding:"12px 0 0", display:"flex", justifyContent:"center" }}>
          <div style={{ width:36, height:4, borderRadius:2, background:T.border }} />
        </div>
        <div style={{ padding:"16px 20px 32px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <div style={{ fontSize:18, fontWeight:800, color:T.textPrimary }}>
              {phase==="scanning" ? t("analyzing") : phase==="result" ? t("detected") : t("log_food")}
            </div>
            <button onClick={onClose} style={{ background:T.border, border:"none", borderRadius:8, color:T.textSecondary, fontSize:12, padding:"6px 10px", cursor:"pointer" }}>✕</button>
          </div>

          {phase==="upload" && (
            <div>
              {error && <div style={{ background:"#EF444420", border:`1px solid ${T.red}40`, borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:12, color:T.red }}>{error}</div>}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                onPaste={e => {
                  const item = [...(e.clipboardData?.items || [])].find(x => x.type.startsWith("image/"));
                  if (item) handleFile(item.getAsFile());
                }}
                style={{ border:`2px dashed ${T.teal}60`, borderRadius:16, padding:"24px 16px", textAlign:"center", marginBottom:16, background:T.card }}>
                <div style={{ fontSize:36, marginBottom:10 }}>📸</div>
                <div style={{ fontSize:15, fontWeight:700, color:T.textPrimary, marginBottom:12 }}>{t("choose_photo")}</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => { if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]); }}
                  style={{ width:"100%", color:T.textSecondary, fontSize:12, cursor:"pointer" }}
                />
                <div style={{ fontSize:11, color:T.textMuted, marginTop:12 }}>{t("drag_drop")}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:12, margin:"16px 0" }}>
                <div style={{ flex:1, height:1, background:T.border }} /><span style={{ fontSize:11, color:T.textMuted }}>{t("or_type")}</span><div style={{ flex:1, height:1, background:T.border }} />
              </div>
              <div style={{ position:"relative" }}>
                <div style={{ display:"flex", gap:10 }}>
                  <input
                    value={manualFood}
                    onChange={e => { setManualFood(e.target.value); setShowMatches(true); }}
                    onFocus={() => setShowMatches(true)}
                    onKeyDown={e => {
                      if (e.key === "Enter") { setShowMatches(false); analyzeManual(); }
                      if (e.key === "Escape") setShowMatches(false);
                    }}
                    placeholder={t("search_placeholder")}
                    style={{ flex:1, background:T.card, border:`1px solid ${matches.length ? `${T.teal}50` : T.border}`, borderRadius:10, color:T.textPrimary, fontSize:13, padding:"12px 14px", outline:"none" }}
                  />
                  <button onClick={() => { setShowMatches(false); analyzeManual(); }} disabled={loading} style={{ background:T.teal, border:"none", borderRadius:10, color:T.bg, fontSize:13, fontWeight:700, padding:"12px 16px", cursor:"pointer" }}>
                    {loading ? "..." : "→"}
                  </button>
                </div>

                {/* Typo-tolerant suggestions from the local food database */}
                {showMatches && matches.length > 0 && (
                  <div style={{
                    marginTop:8, background:T.card, border:`1px solid ${T.border}`,
                    borderRadius:12, overflow:"hidden"
                  }}>
                    <div style={{ padding:"8px 13px", fontSize:9.5, fontWeight:700, color:T.textMuted, letterSpacing:0.8, borderBottom:`1px solid ${T.border}` }}>
                      {t("did_you_mean")}
                    </div>
                    {matches.map(f => (
                      <button
                        key={f.name}
                        onClick={() => pickKnownFood(f)}
                        style={{
                          width:"100%", background:"none", border:"none",
                          borderBottom:`1px solid ${T.border}`, padding:"11px 13px",
                          cursor:"pointer", display:"flex", justifyContent:"space-between",
                          alignItems:"center", gap:10, textAlign:"left"
                        }}
                      >
                        <div style={{ minWidth:0, flex:1 }}>
                          <div style={{ fontSize:12.5, fontWeight:700, color:T.textPrimary }}>{foodName(f.name, lang)}</div>
                          <div style={{ fontSize:10, color:T.textSecondary, marginTop:2 }}>{servingName(f.serving, lang)}</div>
                        </div>
                        <div style={{ textAlign:"right", flexShrink:0 }}>
                          <div style={{ fontSize:12, fontFamily:"monospace", fontWeight:700, color:T.teal }}>{f.kcal} kcal</div>
                          <div style={{ fontSize:9.5, color:T.textMuted }}>P{f.protein} F{f.fiber} B12 {f.b12}</div>
                        </div>
                      </button>
                    ))}
                    <div style={{ padding:"9px 13px", fontSize:10, color:T.textMuted }}>
                      {t("not_listed")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {phase==="scanning" && (
            <div style={{ textAlign:"center", padding:"40px 0" }}>
              {image && <img src={image} alt="" style={{ width:"100%", maxHeight:180, objectFit:"cover", borderRadius:12, marginBottom:24, opacity:0.7 }} />}
              <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:16 }}>
                {[0,1,2].map(i => <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:T.teal, animation:`pulse 1.2s ${i*0.2}s infinite` }} />)}
              </div>
              <div style={{ fontSize:14, color:T.textSecondary }}>{t("identifying")}</div>
              <style>{`@keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}`}</style>
            </div>
          )}

          {phase==="result" && (
            <div>
              {image && <img src={image} alt="" style={{ width:"100%", maxHeight:140, objectFit:"cover", borderRadius:12, marginBottom:14 }} />}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
                <span style={{ fontSize:9.5, fontWeight:700, color:T.textMuted, letterSpacing:0.8 }}>{t("meal")}</span>
                <span style={{ fontSize:9.5, color:T.textMuted }}>
                  {mealType === autoSlot
                    ? t("auto_set", { t: new Date().toLocaleTimeString([], { hour:"numeric", minute:"2-digit" }) })
                    : t("changed_from", { m: t(autoSlot.toLowerCase()) })}
                </span>
              </div>
              <div style={{ display:"flex", gap:8, marginBottom:14, overflowX:"auto", paddingBottom:2 }}>
                {["Breakfast","Lunch","Snacks","Dinner"].map(m => (
                  <button key={m} onClick={() => setMealType(m)} style={{
                    position:"relative",
                    background:mealType===m ? T.teal : T.card, border:`1px solid ${mealType===m?T.teal:T.border}`,
                    borderRadius:8, color:mealType===m?T.bg:T.textSecondary, fontSize:11, fontWeight:700, padding:"6px 12px", cursor:"pointer", whiteSpace:"nowrap"
                  }}>
                    {t(m.toLowerCase())}
                    {m === autoSlot && mealType !== m && (
                      <span style={{
                        position:"absolute", top:-3, right:-3, width:6, height:6,
                        borderRadius:"50%", background:T.teal
                      }} />
                    )}
                  </button>
                ))}
              </div>

              {editItems.map((item, i) => (
                <div key={item.id} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"12px 14px", marginBottom:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <div style={{ flex:1 }}>
                      <input value={item.name} onChange={e => updateItem(i,"name",e.target.value)}
                        style={{ background:"transparent", border:"none", color:T.textPrimary, fontSize:13, fontWeight:600, outline:"none", width:"100%" }} />
                      <div style={{ fontSize:10, color:T.textSecondary }}>
                        <input type="number" value={item.weight} onChange={e => updateItem(i,"weight",+e.target.value)}
                          style={{ background:"transparent", border:"none", color:T.textSecondary, fontSize:10, width:40, outline:"none" }} />g
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:13, fontFamily:"monospace", color:T.teal, fontWeight:700 }}>{item.kcal} kcal</div>
                      <div style={{ fontSize:10, color:T.textSecondary }}>P:{d1(item.protein)} C:{d1(item.carbs)} F:{d1(item.fat)}</div>
                    </div>
                    <button onClick={() => setEditItems(prev => prev.filter((_,j) => j!==i))}
                      style={{ background:"none", border:"none", color:T.textMuted, fontSize:16, cursor:"pointer", marginLeft:8 }}>×</button>
                  </div>
                  {/* Portion stepper */}
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                    <span style={{ fontSize:9.5, color:T.textMuted, fontWeight:700, letterSpacing:0.5, marginRight:2 }}>{t("portion")}</span>
                    {[0.5, 1, 1.5, 2].map(m => {
                      const active = (item.portion || 1) === m;
                      return (
                        <button key={m} onClick={() => setPortion(i, m)} style={{
                          flex:1, background: active ? T.teal : T.surface,
                          border:`1px solid ${active ? T.teal : T.border}`,
                          borderRadius:7, color: active ? T.bg : T.textSecondary,
                          fontSize:11, fontWeight:800, padding:"6px 0", cursor:"pointer"
                        }}>×{m}</button>
                      );
                    })}
                  </div>

                  {/* Micronutrient fields */}
                  <div style={{ display:"flex", gap:8, borderTop:`1px solid ${T.border}`, paddingTop:8 }}>
                    {[["🌿 Fiber","fiber","g",T.lime],["🦴 Calcium","calcium","mg",T.sky],["💊 B12","b12","μg",T.pink]].map(([lbl,key,unit,color]) => (
                      <div key={key} style={{ flex:1, background:T.surface, borderRadius:8, padding:"6px 8px" }}>
                        <div style={{ fontSize:9, color:T.textSecondary, marginBottom:2 }}>{lbl}</div>
                        <div style={{ display:"flex", alignItems:"center", gap:2 }}>
                          <input type="number" step="0.1" value={item[key]||0} onChange={e => updateItem(i,key,parseFloat(e.target.value)||0)}
                            style={{ background:"transparent", border:"none", color, fontFamily:"monospace", fontSize:11, fontWeight:700, width:36, outline:"none" }} />
                          <span style={{ fontSize:9, color:T.textMuted }}>{unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button onClick={() => setEditItems(prev => [...prev, { id:Date.now(), name:"Custom item", weight:100, kcal:100, protein:5, carbs:15, fat:3, fiber:1, calcium:20, b12:0 }])}
                style={{ background:"none", border:`1px dashed ${T.border}`, borderRadius:10, color:T.textSecondary, fontSize:12, padding:"10px 16px", cursor:"pointer", width:"100%", marginBottom:16 }}>
                {t("add_item")}
              </button>

              {/* Totals summary */}
              <div style={{ background:T.tealDim, border:`1px solid ${T.teal}30`, borderRadius:12, padding:"14px 16px", marginBottom:20 }}>
                <div style={{ fontSize:11, fontWeight:700, color:T.teal, marginBottom:10 }}>{t("meal_total")}</div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:20, fontWeight:800, color:T.textPrimary, fontFamily:"monospace" }}>{totals.kcal}</div>
                    <div style={{ fontSize:10, color:T.textSecondary }}>kcal</div>
                  </div>
                  {[["P",totals.protein,"g",T.orange],["C",totals.carbs,"g",T.violet],["F",totals.fat,"g",T.amber]].map(([l,v,u,c]) => (
                    <div key={l} style={{ textAlign:"center" }}>
                      <div style={{ fontSize:18, fontWeight:800, color:c, fontFamily:"monospace" }}>{v}{u}</div>
                      <div style={{ fontSize:10, color:T.textSecondary }}>{l==="P"?"Protein":l==="C"?"Carbs":"Fat"}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", gap:10, borderTop:`1px solid ${T.teal}30`, paddingTop:10 }}>
                  {[["🌿 Fiber",totals.fiber,"g",T.lime],["🦴 Calcium",totals.calcium,"mg",T.sky],["💊 B12",totals.b12,"μg",T.pink]].map(([l,v,u,c]) => (
                    <div key={l} style={{ flex:1, textAlign:"center" }}>
                      <div style={{ fontSize:14, fontWeight:800, color:c, fontFamily:"monospace" }}>{v}{u}</div>
                      <div style={{ fontSize:9, color:T.textSecondary }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => { onAddMeal(mealType, editItems); onClose(); }} style={{
                background:T.teal, border:"none", borderRadius:14, color:T.bg,
                fontSize:15, fontWeight:800, padding:"16px", cursor:"pointer", width:"100%"
              }}>{t("add_to", { m: t(mealType.toLowerCase()) })}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Persistence ──────────────────────────────────────────────────────────────
// Two backends: window.storage (sandboxed artifact) and localStorage (real
// deployment). Whichever exists is used; if neither does, the app still runs,
// it just won't remember between sessions.
const STORE_KEY = "nutrivision:profile";
const MEALS_KEY = "nutrivision:meals";
const WEIGHTS_KEY = "nutrivision:weights";
const HISTORY_KEY = "nutrivision:history";   // { "YYYY-M-D": { kcal, protein, ... } }
const WATER_KEY   = "nutrivision:water";     // { date, glasses }
const RECENT_KEY  = "nutrivision:recent";    // [ item, ... ] most-recent-first
const LANG_KEY    = "nutrivision:lang";      // "en" | "hi"

const store = {
  async get(key) {
    try {
      if (typeof window !== "undefined" && window.storage?.get) {
        const r = await window.storage.get(key);
        return r?.value ? JSON.parse(r.value) : null;
      }
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  async set(key, value) {
    try {
      const payload = JSON.stringify(value);
      if (typeof window !== "undefined" && window.storage?.set) {
        await window.storage.set(key, payload);
        return true;
      }
      localStorage.setItem(key, payload);
      return true;
    } catch {
      return false;
    }
  },
  async remove(key) {
    try {
      if (typeof window !== "undefined" && window.storage?.delete) {
        await window.storage.delete(key);
        return true;
      }
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};

// Meals are per-day, so a stored log from a previous day shouldn't carry over.
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}


// ─── Derived nutrition helpers ────────────────────────────────────────────────
const ZERO = { kcal:0, protein:0, carbs:0, fat:0, fiber:0, calcium:0, b12:0 };

function sumItems(items) {
  return items.reduce((a, it) => ({
    kcal:    a.kcal    + (it.kcal    || 0),
    protein: a.protein + (it.protein || 0),
    carbs:   a.carbs   + (it.carbs   || 0),
    fat:     a.fat     + (it.fat     || 0),
    fiber:   a.fiber   + (it.fiber   || 0),
    calcium: a.calcium + (it.calcium || 0),
    b12:     a.b12     + (it.b12     || 0),
  }), { ...ZERO });
}

function totalsFromMeals(meals) {
  return sumItems(Object.values(meals).flatMap(m => m.items));
}

function dateKey(d) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// Last n calendar days, oldest first.
function lastNDays(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d);
  }
  return out;
}

function shortLabel(d) {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function fullLabel(d) {
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

// ─── CSV export ───────────────────────────────────────────────────────────────
function buildCSV(history, goals, weights) {
  const rows = [[
    "Date","Calories","Calorie Goal","Deficit/Surplus",
    "Protein (g)","Protein Goal","Carbs (g)","Fat (g)",
    "Fiber (g)","Fiber Goal","Calcium (mg)","Calcium Goal",
    "B12 (mcg)","B12 Goal","Water (glasses)","Weight (kg)"
  ]];

  const weightByDate = {};
  (weights || []).forEach(w => { if (w.key) weightByDate[w.key] = w.w; });

  Object.keys(history).sort().forEach(k => {
    const h = history[k];
    rows.push([
      k,
      Math.round(h.kcal || 0), goals.tdee, Math.round((h.kcal || 0) - goals.tdee),
      d1(h.protein), goals.protein,
      d1(h.carbs), d1(h.fat),
      d1(h.fiber), goals.fiber,
      Math.round(h.calcium || 0), goals.calcium,
      d1(h.b12), goals.b12,
      h.water ?? "",
      weightByDate[k] ?? ""
    ]);
  });

  return rows
    .map(r => r.map(cell => {
      const v = String(cell ?? "");
      return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
    }).join(","))
    .join("\n");
}

function downloadCSV(csv, filename) {
  try {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}

// ─── Profile Setup ────────────────────────────────────────────────────────────
// NumField/ToggleGroup are module-level so React keeps the same component
// identity across renders — defining them inside ProfileSetup remounts the
// <input> on every keystroke and steals focus after a single character.
function NumField({ label, field, unit, placeholder, min, max, value, onChange }) {
  return (
    <div style={{ flex:1, background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"10px 8px 8px", textAlign:"center", minWidth:0 }}>
      <div style={{ fontSize:9, fontWeight:700, color:T.textSecondary, letterSpacing:0.8, marginBottom:6 }}>{label}</div>
      <input
        type="number" inputMode="decimal" value={value}
        onChange={e => onChange(field, e.target.value)}
        placeholder={placeholder} min={min} max={max}
        style={{ width:"100%", background:"transparent", border:"none", color:T.teal, fontFamily:"monospace", fontSize:22, fontWeight:800, textAlign:"center", outline:"none", padding:0, boxSizing:"border-box" }}
      />
      <div style={{ fontSize:10, color:T.textMuted, marginTop:2 }}>{unit}</div>
    </div>
  );
}

function ToggleGroup({ label, field, opts, value, onChange }) {
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ fontSize:10, fontWeight:700, color:T.textSecondary, letterSpacing:0.8, marginBottom:6 }}>{label}</div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {opts.map(([val,lbl]) => (
          <button key={val} type="button" onClick={() => onChange(field,val)} style={{
            flex:"1 1 auto",
            background: value===val ? T.teal : T.card,
            border:`1px solid ${value===val ? T.teal : T.border}`,
            borderRadius:8, color: value===val ? T.bg : T.textSecondary,
            fontSize:11, fontWeight:700, padding:"8px 6px", cursor:"pointer", whiteSpace:"nowrap"
          }}>{lbl}</button>
        ))}
      </div>
    </div>
  );
}

function ProfileSetup({ onComplete, existing, onCancel }) {
  const { t, lang } = useLang();
  // When editing, prefill from the saved profile rather than starting blank.
  const [form, setForm] = useState(() => ({
    age: existing?.age ?? "",
    weight: existing?.weight ?? "",
    height: existing?.height ?? "",
    gender: existing?.gender ?? "male",
    activity: existing?.activity ?? "moderate",
    goal: existing?.goal ?? "maintenance"
  }));
  const set = useCallback((k,v) => setForm(f => ({...f,[k]:v})), []);
  const isEdit = Boolean(existing);
  const [warning, setWarning] = useState(null);

  const w = +form.weight, h = +form.height, a = +form.age;
  const bmi = w > 0 && h > 0 ? w / Math.pow(h / 100, 2) : null;

  // Safety checks before a target is generated. A calorie-tracking app can do
  // real harm if it hands someone already underweight a deficit to chase.
  const safetyIssue = (() => {
    if (!bmi) return null;
    if (a && a < 18) return {
      title: t("warn_minor_title"),
      body: t("warn_minor_body"),
      block: true
    };
    if (bmi < 16) return {
      title: t("warn_low_title"),
      body: t("warn_low_body", { bmi: bmi.toFixed(1) }),
      block: true
    };
    if (bmi < 18.5 && (form.goal === "loss")) return {
      title: t("warn_loss_title"),
      body: t("warn_loss_body", { bmi: bmi.toFixed(1) }),
      block: true
    };
    if (bmi < 18.5) return {
      title: t("warn_under_title"),
      body: t("warn_under_body", { bmi: bmi.toFixed(1) }),
      block: false
    };
    return null;
  })();

  const calculate = () => {
    const { age, weight, height, gender, activity, goal } = form;
    const w=+weight, h=+height, a=+age;
    const bmr = gender==="male" ? 10*w+6.25*h-5*a+5 : 10*w+6.25*h-5*a-161;
    const actMult = {sedentary:1.2,light:1.375,moderate:1.55,active:1.725,vactive:1.9}[activity];
    let tdee = bmr * actMult;
    if (goal==="loss") tdee-=500; if (goal==="gain") tdee+=300; if (goal==="muscle") tdee+=200;
    const protein = Math.round(w*1.8), fat = Math.round(tdee*0.25/9);
    const carbs = Math.round((tdee-protein*4-fat*9)/4);
    const fiber = 30, calcium = 1000, b12 = 2.4;

    // Never let the target fall below BMR — that's the floor for basic organ
    // function, and apps that allow lower are how people get into trouble.
    const floored = Math.max(Math.round(tdee), Math.round(bmr));

    onComplete({ ...form, tdee:floored, protein, fat, carbs, fiber, calcium, b12, bmi:bmi ? +bmi.toFixed(1) : null });
  };

  const attemptSave = () => {
    if (safetyIssue) { setWarning(safetyIssue); return; }
    calculate();
  };

  const valid = form.age && form.weight && form.height;

  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <div style={{ padding:"24px 20px 12px", flexShrink:0 }}>
        <div style={{ fontSize:10, fontWeight:700, color:T.teal, letterSpacing:2, marginBottom:6 }}>{t("appName")}</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:22, fontWeight:800, color:T.textPrimary }}>
              {isEdit ? t("profile_edit_title") : t("profile_title")}
            </div>
            <div style={{ fontSize:12, color:T.textSecondary, marginTop:4 }}>
{isEdit ? t("profile_edit_sub") : t("profile_sub")}
            </div>
          </div>
          {isEdit && onCancel && (
            <button onClick={onCancel} style={{
              background:T.card, border:`1px solid ${T.border}`, borderRadius:9,
              color:T.textSecondary, fontSize:11, fontWeight:700, padding:"7px 12px",
              cursor:"pointer", flexShrink:0
            }}>{t("cancel")}</button>
          )}
        </div>

        {isEdit && (
          <div style={{
            marginTop:14, background:T.card, border:`1px solid ${T.border}`,
            borderRadius:12, padding:"11px 14px"
          }}>
            <div style={{ fontSize:9.5, fontWeight:700, color:T.textMuted, letterSpacing:0.8, marginBottom:7 }}>{t("current_targets")}</div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              {[["Cal", existing.tdee, T.teal], ["Protein", existing.protein + "g", T.orange],
                ["Carbs", existing.carbs + "g", T.violet], ["Fat", existing.fat + "g", T.amber]].map(([l,v,c]) => (
                <div key={l} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:13, fontWeight:800, color:c, fontFamily:"monospace" }}>{v}</div>
                  <div style={{ fontSize:9, color:T.textSecondary }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"0 20px 20px" }}>
        <div style={{ fontSize:10, fontWeight:700, color:T.textSecondary, letterSpacing:0.8, marginBottom:6 }}>{t("body_stats")}</div>
        <div style={{ display:"flex", gap:8, marginBottom:14 }}>
          <NumField label={t("age")}    field="age"    unit={t("years")} placeholder="28"  min={10}  max={100} value={form.age}    onChange={set} />
          <NumField label={t("weight")} field="weight" unit={t("kg")} placeholder="70"  min={20}  max={250} value={form.weight} onChange={set} />
          <NumField label={t("height")} field="height" unit={t("cm")} placeholder="170" min={100} max={230} value={form.height} onChange={set} />
        </div>

        {bmi && (() => {
          // WHO classification. Asian populations carry cardiometabolic risk at
          // lower thresholds, so the Asian-Indian cut-offs are noted alongside.
          // Scale runs 15–40. Band flex weights and the marker position must use
          // this same range, or the marker lands in the wrong band.
          const SCALE_MIN = 15, SCALE_MAX = 40, SPAN = SCALE_MAX - SCALE_MIN;
          const bands = [
            { label:t("bmi_under"), from:SCALE_MIN, to:18.5, display:"<18.5", color:T.amber },
            { label:t("bmi_healthy"), from:18.5, to:25, display:"18.5–25", color:T.green },
            { label:t("bmi_over"), from:25, to:30, display:"25–30", color:T.amber },
            { label:t("bmi_obese"), from:30, to:SCALE_MAX, display:"30+", color:T.red },
          ];
          const current = bmi < 18.5 ? bands[0] : bmi < 25 ? bands[1] : bmi < 30 ? bands[2] : bands[3];
          const pos = Math.max(0, Math.min((bmi - SCALE_MIN) / SPAN, 1)) * 100;
          const healthyLow  = (18.5 * Math.pow(h/100, 2)).toFixed(1);
          const healthyHigh = (24.9 * Math.pow(h/100, 2)).toFixed(1);

          return (
            <div style={{
              background:T.card,
              border:`1px solid ${current.color === T.green ? T.border : `${current.color}40`}`,
              borderRadius:12, padding:"13px 14px", marginBottom:14
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:11 }}>
                <span style={{ fontSize:10, fontWeight:700, color:T.textSecondary, letterSpacing:0.8 }}>{t("bmi_title")}</span>
                <span style={{ fontSize:15, fontFamily:"monospace", fontWeight:800, color:current.color }}>
                  {bmi.toFixed(1)}
                  <span style={{ fontSize:10, fontWeight:600, marginLeft:6 }}>{current.label}</span>
                </span>
              </div>

              {/* Scale with marker */}
              <div style={{ position:"relative", marginBottom:7 }}>
                <div style={{ display:"flex", height:7, borderRadius:4, overflow:"hidden" }}>
                  {bands.map(b => (
                    <div key={b.label} style={{
                      flex: b.to - b.from,
                      background: b.color,
                      opacity: b.label === current.label ? 1 : 0.28
                    }} />
                  ))}
                </div>
                <div style={{
                  position:"absolute", left:`${pos}%`, top:-3, transform:"translateX(-50%)",
                  width:3, height:13, borderRadius:2, background:T.textPrimary,
                  boxShadow:"0 0 4px rgba(0,0,0,0.6)", transition:"left 0.4s"
                }} />
              </div>

              {/* Range labels */}
              <div style={{ display:"flex", marginBottom:11 }}>
                {bands.map(b => (
                  <div key={b.label} style={{ flex: b.to - b.from, textAlign:"center" }}>
                    <div style={{
                      fontSize:8, fontWeight:700,
                      color: b.label === current.label ? b.color : T.textMuted
                    }}>{b.label}</div>
                    <div style={{ fontSize:7.5, color:T.textMuted, fontFamily:"monospace", marginTop:1 }}>
                      {b.display}
                    </div>
                  </div>
                ))}
              </div>

              {/* Target weight for this height */}
              <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:9, fontSize:10.5, color:T.textSecondary, lineHeight:1.5 }}>
{t("bmi_range_note", { h, lo: healthyLow, hi: healthyHigh })}
              </div>

              <div style={{ fontSize:9.5, color:T.textMuted, lineHeight:1.5, marginTop:7 }}>
{t("bmi_caveat")}
              </div>
            </div>
          );
        })()}

        <ToggleGroup label={t("gender")} field="gender" value={form.gender} onChange={set} opts={[["male",t("male")],["female",t("female")]]} />
        <ToggleGroup label={t("activity")} field="activity" value={form.activity} onChange={set} opts={[["sedentary",t("sedentary")],["light",t("light")],["moderate",t("moderate")],["active",t("active")],["vactive",t("vactive")]]} />
        <ToggleGroup label={t("goal")} field="goal" value={form.goal} onChange={set} opts={[["loss",t("goal_loss")],["maintenance",t("goal_maintain")],["gain",t("goal_gain")],["muscle",t("goal_muscle")]]} />
      </div>

      <div style={{ padding:"12px 20px 24px", flexShrink:0, borderTop:`1px solid ${T.border}`, background:T.bg }}>
        <button onClick={attemptSave} disabled={!valid} style={{
          background:valid ? T.teal : T.border, border:"none", borderRadius:14,
          color:valid ? T.bg : T.textMuted, fontSize:15, fontWeight:800,
          padding:"15px", cursor:valid ? "pointer" : "not-allowed", width:"100%"
        }}>
{!valid ? t("fill_required") : isEdit ? t("save_changes") : t("calculate")}
        </button>
      </div>

      {/* Safety warning */}
      {warning && (
        <div style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:500,
          display:"flex", alignItems:"center", justifyContent:"center", padding:20,
          backdropFilter:"blur(4px)"
        }}>
          <div style={{
            background:T.surface, border:`1px solid ${T.amber}40`, borderRadius:18,
            padding:"22px 20px", maxWidth:360, width:"100%"
          }}>
            <div style={{ fontSize:30, marginBottom:12 }}>⚠️</div>
            <div style={{ fontSize:16, fontWeight:800, color:T.textPrimary, marginBottom:10, lineHeight:1.35 }}>
              {warning.title}
            </div>
            <p style={{ fontSize:13, color:T.textSecondary, lineHeight:1.6, margin:"0 0 20px" }}>
              {warning.body}
            </p>

            {warning.block ? (
              <button onClick={() => setWarning(null)} style={{
                width:"100%", background:T.teal, border:"none", borderRadius:12,
                color:T.bg, fontSize:14, fontWeight:800, padding:"13px", cursor:"pointer"
              }}>{t("go_back_change")}</button>
            ) : (
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => setWarning(null)} style={{
                  flex:1, background:T.card, border:`1px solid ${T.border}`, borderRadius:11,
                  color:T.textSecondary, fontSize:13, fontWeight:700, padding:"12px", cursor:"pointer"
                }}>{t("go_back")}</button>
                <button onClick={() => { setWarning(null); calculate(); }} style={{
                  flex:1, background:T.teal, border:"none", borderRadius:11,
                  color:T.bg, fontSize:13, fontWeight:800, padding:"12px", cursor:"pointer"
                }}>{t("continue_anyway")}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Insights ─────────────────────────────────────────────────────────────────
function Insights({ nutrition, goals }) {
  const { t, lang } = useLang();
  const hints = [];
  const pctP = nutrition.protein/goals.protein, pctC = nutrition.carbs/goals.carbs;
  const pctK = nutrition.kcal/goals.tdee, pctFib = nutrition.fiber/goals.fiber;
  const pctCa = nutrition.calcium/goals.calcium, pctB12 = nutrition.b12/goals.b12;

  if (pctP < 0.5) hints.push({ icon:"🥩", color:T.orange, text:"Protein intake is low. Add eggs, paneer, dal or whey to hit your target." });
  if (pctP >= 1.1) hints.push({ icon:"✅", color:T.green, text:"Great protein intake! You're well on track for muscle recovery." });
  if (pctC > 1.15) hints.push({ icon:"⚠️", color:T.red, text:`Carbs exceeded by ${Math.round((pctC-1)*100)}%. Consider lighter snacks for the rest of today.` });
  if (pctK < 0.4 && nutrition.kcal > 0) hints.push({ icon:"🍽️", color:T.teal, text:`${goals.tdee-nutrition.kcal} calories still available today. Make sure to eat enough!` });
  if (pctK > 0.95 && pctK <= 1.05) hints.push({ icon:"🎯", color:T.green, text:"Almost at your calorie goal — great discipline today!" });
  if (pctFib < 0.5 && nutrition.kcal > 0) hints.push({ icon:"🌿", color:T.lime, text:"Fiber is low. Add vegetables, whole grains, rajma or methi to boost it." });
  if (pctCa < 0.5 && nutrition.kcal > 0) hints.push({ icon:"🦴", color:T.sky, text:"Calcium intake is low. Include milk, curd, paneer or ragi in your next meal." });
  if (pctB12 < 0.5 && nutrition.kcal > 0) hints.push({ icon:"💊", color:T.pink, text:"B12 is very low today. Eggs, dairy, paneer, or a supplement can help — especially important for vegetarians." });
  if (nutrition.kcal === 0) hints.push({ icon:"📸", color:T.teal, text:"Log your first meal by tapping the camera button below." });
  if (hints.length === 0) hints.push({ icon:"🌟", color:T.teal, text:"All nutrients on track today! Keep it up." });

  return (
    <div style={{ marginBottom:24 }}>
      <div style={{ fontSize:12, fontWeight:700, color:T.textSecondary, letterSpacing:1, marginBottom:12 }}>{t("ai_coach")}</div>
      {hints.map((h,i) => (
        <div key={i} style={{ background:T.card, border:`1px solid ${h.color}25`, borderRadius:12, padding:"12px 14px", marginBottom:10, display:"flex", gap:12, alignItems:"flex-start" }}>
          <span style={{ fontSize:18, lineHeight:1.2 }}>{h.icon}</span>
          <p style={{ margin:0, fontSize:13, color:T.textPrimary, lineHeight:1.5 }}>{h.text}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Weight Tracker ───────────────────────────────────────────────────────────
function WeightTracker({ weights, setWeights }) {
  const { t, lang } = useLang();
  const [newW, setNewW] = useState("");
  const add = () => {
    const v = parseFloat(newW);
    if (!v || v < 20 || v > 300) return;
    const d = new Date();
    const key = dateKey(d);
    const label = d.toLocaleDateString("en-IN",{month:"short",day:"numeric"});
    setWeights(prev => {
      // Replace today's entry if one exists, otherwise append.
      const without = prev.filter(x => x.key !== key);
      return [...without, { key, date: label, w: v }].slice(-30);
    });
    setNewW("");
  };

  if (!weights.length) {
    return (
      <div>
        <div style={{ textAlign:"center", padding:"36px 24px 24px" }}>
          <div style={{ fontSize:36, marginBottom:14 }}>⚖️</div>
          <div style={{ fontSize:15, fontWeight:800, color:T.textPrimary, marginBottom:7 }}>{t("no_weight")}</div>
          <p style={{ fontSize:12.5, color:T.textSecondary, lineHeight:1.6, margin:0 }}>
{t("no_weight_body")}
          </p>
        </div>
        <div style={{ display:"flex", gap:10, padding:"0 4px" }}>
          <input type="number" value={newW} onChange={e=>setNewW(e.target.value)} placeholder={t("weight_kg")}
            style={{ flex:1, background:T.card, border:`1px solid ${T.border}`, borderRadius:10, color:T.textPrimary, fontSize:13, padding:"12px 14px", outline:"none" }} />
          <button onClick={add} style={{ background:T.teal, border:"none", borderRadius:10, color:T.bg, fontSize:13, fontWeight:700, padding:"12px 20px", cursor:"pointer" }}>{t("log")}</button>
        </div>
      </div>
    );
  }
  const shown = weights.slice(-10);
  const max=Math.max(...shown.map(w=>w.w)), min=Math.min(...shown.map(w=>w.w)), range=max-min||1, chartH=80;
  const change = shown.length > 1 ? shown[shown.length-1].w - shown[0].w : 0;
  return (
    <div>
      <div style={{ fontSize:12, fontWeight:700, color:T.textSecondary, letterSpacing:1, marginBottom:12 }}>{t("weight_tracking")}</div>
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"16px" }}>
        {shown.length > 1 && (
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:10 }}>
            <div>
              <span style={{ fontSize:20, fontWeight:800, color:T.textPrimary, fontFamily:"monospace" }}>
                {shown[shown.length-1].w}
              </span>
              <span style={{ fontSize:11, color:T.textSecondary, marginLeft:4 }}>kg</span>
            </div>
            <span style={{ fontSize:11.5, fontWeight:700, color: change < 0 ? T.teal : change > 0 ? T.orange : T.textSecondary }}>
{change > 0 ? "▲" : change < 0 ? "▼" : "–"} {t("kg_over", { n: Math.abs(change).toFixed(1), c: shown.length })}
            </span>
          </div>
        )}
        <svg width="100%" height={chartH+20} viewBox={`0 0 ${Math.max(shown.length,2)*40} ${chartH+20}`} preserveAspectRatio="none" style={{ display:"block", marginBottom:8 }}>
          <polyline points={shown.map((w,i)=>`${i*40+20},${chartH-((w.w-min)/range)*(chartH-10)+5}`).join(" ")}
            fill="none" stroke={T.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {shown.map((w,i) => (
            <g key={i}>
              <circle cx={i*40+20} cy={chartH-((w.w-min)/range)*(chartH-10)+5} r="3" fill={T.teal} />
              <text x={i*40+20} y={chartH+16} textAnchor="middle" fill={T.textMuted} fontSize="7">{w.date.split(" ")[1]}</text>
              <text x={i*40+20} y={chartH-((w.w-min)/range)*(chartH-10)-4} textAnchor="middle" fill={T.textSecondary} fontSize="7">{w.w}</text>
            </g>
          ))}
        </svg>
        <div style={{ display:"flex", gap:10, marginTop:12 }}>
          <input type="number" value={newW} onChange={e=>setNewW(e.target.value)} placeholder={t("weight_kg")}
            style={{ flex:1, background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, color:T.textPrimary, fontSize:13, padding:"10px 12px", outline:"none" }} />
          <button onClick={add} style={{ background:T.teal, border:"none", borderRadius:8, color:T.bg, fontSize:13, fontWeight:700, padding:"10px 16px", cursor:"pointer" }}>{t("log")}</button>
        </div>
      </div>
    </div>
  );
}

// ─── 14-Day Calorie History Tab ───────────────────────────────────────────────
function CalendarTab({ goals, history, todayNutrition, weights, onExport }) {
  const { t, lang } = useLang();
  const [filter, setFilter] = useState("all");
  const [range, setRange] = useState(14);

  const GOAL = goals.tdee;
  const tKey = todayKey();

  // Real logged data — today comes from live state, past days from storage.
  const days = lastNDays(range).map(d => {
    const k = dateKey(d);
    const isToday = k === tKey;
    const rec = isToday ? todayNutrition : history[k];
    const logged = isToday ? todayNutrition.kcal > 0 : Boolean(rec);
    return {
      key: k, date: d, isToday, logged,
      label: fullLabel(d), shortLabel: shortLabel(d),
      consumed: logged ? Math.round(rec.kcal) : null,
      protein: logged ? rec.protein : null,
      delta: logged ? Math.round(rec.kcal) - GOAL : null,
    };
  });

  const withData = days.filter(d => d.logged);

  const filtered = filter === "deficit" ? days.filter(d => d.delta != null && d.delta < 0)
    : filter === "surplus" ? days.filter(d => d.delta != null && d.delta > 0)
    : days;

  if (withData.length === 0) {
    return (
      <div style={{ textAlign:"center", padding:"48px 24px" }}>
        <div style={{ fontSize:40, marginBottom:16 }}>📅</div>
        <div style={{ fontSize:16, fontWeight:800, color:T.textPrimary, marginBottom:8 }}>{t("no_history")}</div>
        <p style={{ fontSize:13, color:T.textSecondary, lineHeight:1.6, margin:0 }}>
{t("no_history_body")}
        </p>
      </div>
    );
  }

  const maxAbs = Math.max(...withData.map(d => Math.abs(d.delta)), 1);
  const totalDeficit = withData.filter(d => d.delta < 0).reduce((a,b) => a + b.delta, 0);
  const totalSurplus = withData.filter(d => d.delta > 0).reduce((a,b) => a + b.delta, 0);
  const avgConsumed = Math.round(withData.reduce((a,b) => a + b.consumed, 0) / withData.length);
  const daysOnTarget = withData.filter(d => Math.abs(d.delta) <= 100).length;

  const BAR_MAX_H = 80;

  return (
    <div>
      {/* Range selector */}
      <div style={{ display:"flex", gap:6, marginBottom:14 }}>
        {[7, 14, 30].map(n => (
          <button key={n} onClick={() => setRange(n)} style={{
            flex:1, background: range===n ? T.teal : T.card,
            border:`1px solid ${range===n ? T.teal : T.border}`,
            borderRadius:8, color: range===n ? T.bg : T.textSecondary,
            fontSize:11, fontWeight:700, padding:"8px 0", cursor:"pointer"
          }}>{t("days_n", { n })}</button>
        ))}
      </div>

      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
        {[
          [t("avg_daily"), `${avgConsumed}`, t("kcal"), T.teal, "📊"],
          [t("on_target"), `${daysOnTarget}`, t("of_days", { n: withData.length }), T.green, "🎯"],
          [t("total_deficit"), `${Math.abs(totalDeficit)}`, t("kcal_under"), T.teal, "📉"],
          [t("total_surplus"), `${totalSurplus}`, t("kcal_over"), T.orange, "📈"],
        ].map(([lbl, val, sub, color, icon]) => (
          <div key={lbl} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:"12px 14px" }}>
            <div style={{ fontSize:15, marginBottom:4 }}>{icon}</div>
            <div style={{ fontSize:19, fontWeight:800, color, fontFamily:"monospace" }}>{val}</div>
            <div style={{ fontSize:9.5, color:T.textMuted }}>{sub}</div>
            <div style={{ fontSize:10, color:T.textSecondary, marginTop:3 }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {[["all",t("all")],["deficit",t("deficit")],["surplus",t("surplus")]].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            background: filter===v ? T.teal : T.card,
            border:`1px solid ${filter===v?T.teal:T.border}`,
            borderRadius:8, color:filter===v?T.bg:T.textSecondary,
            fontSize:11, fontWeight:700, padding:"6px 14px", cursor:"pointer"
          }}>{l}</button>
        ))}
      </div>

      {/* Diverging bars */}
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:"18px 12px 12px", marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
          <span style={{ fontSize:10, color:T.teal }}>{t("under_goal")}</span>
          <span style={{ fontSize:9.5, color:T.textMuted }}>{t("goal_kcal", { n: GOAL })}</span>
          <span style={{ fontSize:10, color:T.orange }}>{t("over_goal")}</span>
        </div>

        <div style={{ display:"flex", alignItems:"flex-end", gap:2, overflowX:"auto" }}>
          {filtered.map((day, i) => {
            const barH = day.delta != null
              ? Math.max(Math.round((Math.abs(day.delta) / maxAbs) * BAR_MAX_H), 4) : 0;
            const isDeficit = day.delta != null && day.delta < 0;
            const color = day.delta == null ? T.textMuted
              : Math.abs(day.delta) <= 100 ? T.green : isDeficit ? T.teal : T.orange;

            return (
              <div key={i} style={{ flex:"1 0 22px", display:"flex", flexDirection:"column", alignItems:"center", minWidth:22 }}>
                <div style={{ height:BAR_MAX_H, display:"flex", alignItems:"flex-end", justifyContent:"center", width:"100%" }}>
                  {day.delta != null && !isDeficit && day.delta !== 0 && (
                    <div style={{ width:"72%", height:barH, borderRadius:"3px 3px 0 0",
                      background: day.isToday ? T.orange : `${T.orange}99`,
                      transition:"height 0.6s cubic-bezier(.4,0,.2,1)" }} />
                  )}
                </div>
                <div style={{ width:"100%", height:2, background: day.isToday ? T.teal : T.border }} />
                <div style={{ height:BAR_MAX_H, display:"flex", alignItems:"flex-start", justifyContent:"center", width:"100%" }}>
                  {isDeficit && (
                    <div style={{ width:"72%", height:barH, borderRadius:"0 0 3px 3px",
                      background: day.isToday ? T.teal : `${T.teal}88`,
                      transition:"height 0.6s cubic-bezier(.4,0,.2,1)" }} />
                  )}
                </div>
                <div style={{ fontSize:6.5, color, fontFamily:"monospace", fontWeight:700, marginTop:3 }}>
                  {day.delta == null ? "–" : day.delta > 0 ? `+${day.delta}` : day.delta}
                </div>
                <div style={{ fontSize:6.5, color: day.isToday ? T.teal : T.textMuted, textAlign:"center", lineHeight:1.2, marginTop:1 }}>
                  {day.shortLabel.split(" ").map((w,j) => <div key={j}>{w}</div>)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day list */}
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden", marginBottom:14 }}>
        <div style={{ padding:"13px 16px", borderBottom:`1px solid ${T.border}`, fontSize:11, fontWeight:700, color:T.textSecondary, letterSpacing:1 }}>
          {t("daily_breakdown")}
        </div>
        {[...filtered].reverse().filter(d => d.logged).map((day, i, arr) => {
          const isDeficit = day.delta < 0;
          const color = Math.abs(day.delta) <= 100 ? T.green : isDeficit ? T.teal : T.orange;
          const pct = Math.min(day.consumed / GOAL, 1.5);
          return (
            <div key={day.key} style={{
              padding:"12px 16px",
              borderBottom: i < arr.length-1 ? `1px solid ${T.border}` : "none",
              background: day.isToday ? `${T.teal}08` : "transparent"
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <div>
                  <span style={{ fontSize:12, fontWeight:700, color: day.isToday ? T.teal : T.textPrimary }}>{day.label}</span>
                  {day.isToday && <span style={{ marginLeft:6, fontSize:8.5, background:`${T.teal}20`, color:T.teal, borderRadius:4, padding:"2px 5px", fontWeight:800 }}>{t("today_badge")}</span>}
                </div>
                <div style={{ textAlign:"right" }}>
                  <span style={{ fontSize:12.5, fontFamily:"monospace", fontWeight:800, color }}>{day.consumed}</span>
                  <span style={{ marginLeft:7, fontSize:10.5, fontFamily:"monospace", color, fontWeight:700 }}>
                    {day.delta > 0 ? `+${day.delta}` : day.delta}
                  </span>
                </div>
              </div>
              <div style={{ background:T.border, borderRadius:3, height:5, overflow:"hidden", position:"relative" }}>
                <div style={{ position:"absolute", left:`${(1/1.5)*100}%`, top:0, bottom:0, width:1, background:T.textMuted, zIndex:2 }} />
                <div style={{ width:`${(pct/1.5)*100}%`, height:"100%", borderRadius:3, background:color, transition:"width 0.6s" }} />
              </div>
              {day.protein != null && (
                <div style={{ fontSize:9.5, color:T.textMuted, marginTop:4 }}>
{t("protein")} {d1(day.protein)}g / {goals.protein}g
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Export */}
      <button onClick={onExport} style={{
        width:"100%", background:T.card, border:`1px solid ${T.border}`, borderRadius:12,
        color:T.textPrimary, fontSize:13, fontWeight:700, padding:"13px", cursor:"pointer",
        display:"flex", alignItems:"center", justifyContent:"center", gap:8
      }}>
        {t("export_csv")}
      </button>

      <div style={{ display:"flex", gap:14, justifyContent:"center", marginTop:14 }}>
        {[[T.teal,t("deficit")],[T.orange,t("surplus")],[T.green,t("on_target_pm")]].map(([c,l]) => (
          <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:9, height:9, borderRadius:2, background:c }} />
            <span style={{ fontSize:9, color:T.textSecondary }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const GUIDE_TITLES_HI = {
  exercise: "रोज़ का व्यायाम",
  healthy:  "स्वस्थ भारतीय भोजन",
  avoid:    "किनसे बचें",
  loss:     "वज़न घटाने के सुझाव",
  gain:     "वज़न बढ़ाने के सुझाव",
  maintain: "वज़न बनाए रखने के सुझाव",
};

// ─── Guide Content ────────────────────────────────────────────────────────────
const GUIDES = {
  exercise: {
    icon: "🏃", title: "Daily Exercise", color: T.teal,
    intro: "WHO recommends 150–300 min of moderate activity weekly, plus strength training twice a week. Here's a practical structure.",
    sections: [
      { h: "Weekly Template", items: [
        "Mon — Strength (upper body): push-ups, dumbbell rows, shoulder press",
        "Tue — Cardio 30–40 min: brisk walk, cycling, jogging",
        "Wed — Strength (lower body): squats, lunges, calf raises",
        "Thu — Active recovery: yoga, stretching, slow walk",
        "Fri — Strength (full body) or circuit training",
        "Sat — Longer cardio 45–60 min or a sport you enjoy",
        "Sun — Rest or light walk",
      ]},
      { h: "No-Equipment Home Routine", items: [
        "Surya Namaskar — 8–12 rounds (full body warm-up + cardio)",
        "Bodyweight squats — 3 sets of 15",
        "Push-ups (knee version is fine) — 3 sets of 10",
        "Plank — 3 sets of 30–45 sec",
        "Glute bridges — 3 sets of 15",
        "Mountain climbers — 3 sets of 20",
      ]},
      { h: "Steps & NEAT", items: [
        "Target 8,000–10,000 steps daily",
        "Take stairs instead of the lift",
        "Walk 10–15 min after each main meal — blunts blood sugar spikes",
        "Stand or walk during phone calls",
      ]},
      { h: "Common Mistakes", items: [
        "Doing only cardio while cutting calories — you lose muscle along with fat",
        "Skipping warm-up and cool-down",
        "Going too hard in week one and burning out by week three",
        "Not progressing load or reps over time",
      ]},
    ],
  },
  healthy: {
    icon: "🥗", title: "Healthy Indian Foods", color: T.green,
    intro: "Traditional Indian cuisine has excellent nutrition built in. Organised by nutrient, with approximate amounts per typical serving.",
    sections: [
      { h: "🥩 Protein", items: [
        "Soya chunks — 52g per 100g dry, the cheapest protein available",
        "Paneer — 18g per 100g, plus calcium and B12",
        "Dal (moong, masoor, toor, chana) — 12–18g per cooked cup",
        "Rajma & chhole — 15g per cup, with 12–13g fiber alongside",
        "Sprouted moong — 9g per cup, and easier to digest than cooked",
        "Eggs — 6g each, complete protein with all amino acids",
        "Curd — 9g per cup, plus probiotics",
        "Chicken breast — 31g per 100g, the leanest animal source",
        "Fish (rohu, surmai) — 20–22g per 100g, plus B12",
        "Peanuts — 26g per 100g, though calorie-dense at 567 kcal",
      ]},
      { h: "🌿 Fiber — target 30g daily", items: [
        "Chia seeds — 34g per 100g, the densest source available",
        "Rajma — 13g per cooked cup",
        "Chhole — 12g per cup",
        "Moong dal — 15g per cooked cup",
        "Bajra & jowar — 8–11g per 100g, far above wheat",
        "Guava — 5g per fruit, highest among common Indian fruits",
        "Flaxseed — 27g per 100g, plus omega-3",
        "Broccoli, cabbage, cauliflower — 3–5g per cup",
        "Bhindi — 5g per cup, and helps blood sugar control",
        "Whole wheat atta — 11g per 100g; maida has almost none",
        "Amla — 3.4g per fruit, plus exceptional vitamin C",
      ]},
      { h: "🦴 Calcium — target 1000mg daily", items: [
        "Sesame (til) seeds — 975mg per 100g, the richest plant source",
        "Ragi (nachni) — 344mg per 100g, unmatched among grains",
        "Paneer — 208mg per 100g",
        "Milk — 300mg per glass (250ml)",
        "Curd — 300mg per cup",
        "Tofu — 350mg per 100g if set with calcium sulphate",
        "Small fish with bones (sardines) — 380mg per 100g",
        "Amaranth (rajgira) — 159mg per 100g",
        "Drumstick (moringa) leaves — 440mg per 100g",
        "Almonds — 264mg per 100g",
        "Til laddu and chikki — traditional winter calcium sources",
      ]},
      { h: "💊 Vitamin B12 — target 2.4μg daily", items: [
        "This is the one nutrient plants genuinely cannot supply",
        "Milk — 1.2μg per glass",
        "Curd — 1.1μg per cup",
        "Paneer — 0.9μg per 100g",
        "Eggs — 0.6μg each",
        "Fish (rohu) — 2.4μg per 100g, a full day's requirement",
        "Sardines — 8.9μg per 100g",
        "Mutton — 2.7μg per 100g",
        "Fortified cereals and plant milks — check the label",
        "Vegans need a supplement; food sources alone won't suffice",
        "Deficiency is common in Indian vegetarians and often goes unnoticed for years",
      ]},
      { h: "🩸 Iron", items: [
        "Absorption differs sharply by source: heme iron from meat absorbs at 15–35%, plant (non-heme) iron at only 2–20%",
        "Palak and other greens — 2.7mg per 100g",
        "Bajra — 8mg per 100g",
        "Rajma — 5mg per cup",
        "Dates and raisins — 1–2mg per serving",
        "Jaggery — 11mg per 100g",
        "Pair with vitamin C (lemon, amla, tomato) to boost absorption substantially",
        "Avoid tea or coffee within an hour of iron-rich meals — tannins block uptake",
        "Cooking in an iron kadhai genuinely adds measurable iron",
      ]},
      { h: "🐟 Omega-3", items: [
        "Flaxseed (alsi) — 22g per 100g, ground rather than whole",
        "Chia seeds — 17g per 100g",
        "Walnuts — 9g per 100g",
        "Mustard oil — a traditional and underrated source",
        "Fatty fish (surmai, bangda, salmon) — the most usable form",
        "Plant omega-3 (ALA) converts to EPA/DHA poorly, at roughly 5–10%",
      ]},
      { h: "🍊 Vitamins A, C & D", items: [
        "Vitamin C — amla (600mg per 100g, twenty times an orange), guava, lemon, capsicum",
        "Vitamin A — carrot, sweet potato, papaya, spinach, drumstick leaves",
        "Vitamin D — sunlight remains the primary source; 15–20 min on arms and face",
        "Dietary vitamin D — egg yolk, fortified milk, mushrooms sun-dried before use",
        "Deficiency is widespread in India despite abundant sunshine, largely from indoor work and covered clothing",
      ]},
      { h: "⚡ Other minerals", items: [
        "Magnesium — pumpkin seeds, almonds, spinach, whole grains",
        "Zinc — pumpkin seeds, chana, cashew, curd; supports immunity and healing",
        "Potassium — banana, coconut water, sweet potato, rajma",
        "Selenium — one Brazil nut covers a full day; also in eggs and fish",
        "Iodine — iodised salt, which is why the fortification programme exists",
      ]},
      { h: "🌾 Smart everyday swaps", items: [
        "Ragi or bajra roti in place of some wheat — more calcium and fiber",
        "Brown or hand-pounded rice over polished white",
        "Whole wheat atta rather than maida",
        "Buttermilk instead of soft drinks",
        "Roasted chana or makhana instead of fried namkeen",
        "Til or peanut chikki instead of chocolate",
        "Amla juice or murabba through winter for vitamin C",
      ]},
    ],
  },
  avoid: {
    icon: "🚫", title: "Things to Avoid", color: T.red,
    intro: "Not a ban list — these are the items that quietly derail progress when they become routine rather than occasional.",
    sections: [
      { h: "Limit Heavily", items: [
        "Sugary drinks — cola, packaged juice, sweetened iced tea",
        "Deep-fried snacks daily — samosa, kachori, pakora, vada",
        "Bakery items — pastries, cream biscuits, white bread",
        "Packaged namkeen and chips",
        "Instant noodles as a meal replacement",
        "Sweets in large quantity — barfi, jalebi, gulab jamun",
      ]},
      { h: "Hidden Calorie Traps", items: [
        "Restaurant gravies — often 3–4 tbsp oil per serving",
        "Butter naan and cheese-laden dishes",
        "Sugar in chai — 2 cups × 2 tsp = ~130 kcal daily, ~1kg fat over a year",
        "Malai, cream, excessive ghee on top of dal or roti",
        "Salad dressings and mayonnaise-heavy sandwiches",
      ]},
      { h: "Habits That Undo Effort", items: [
        "Skipping breakfast then overeating at night",
        "Eating while watching a screen — poor portion awareness",
        "Sleeping under 6 hours — raises hunger hormones significantly",
        "Drinking calories instead of eating them",
        "Weighing yourself daily and reacting to normal fluctuation",
      ]},
      { h: "A Note on Balance", items: [
        "Nothing here needs total elimination",
        "Weekly occasional consumption is not the problem",
        "Daily consumption is what creates the deficit or surplus that matters",
        "Restrictive all-or-nothing thinking tends to fail over months",
      ]},
    ],
  },
  loss: {
    icon: "📉", title: "Weight Loss Tips", color: T.orange,
    intro: "Fat loss requires a sustained calorie deficit. Everything below serves that one mechanism.",
    sections: [
      { h: "The Core Principle", items: [
        "Aim for a 400–500 kcal daily deficit",
        "That yields roughly 0.4–0.5 kg loss per week",
        "Faster than 1 kg/week usually means muscle loss too",
        "Consistency over 12 weeks beats intensity over 2 weeks",
      ]},
      { h: "Practical Tactics", items: [
        "Protein at every meal — keeps you full and preserves muscle",
        "Fill half the plate with vegetables before adding grains",
        "Use a smaller plate — genuinely changes portion perception",
        "Drink a glass of water before meals",
        "Eat slowly; fullness signals take about 20 minutes",
        "Log everything for the first 3 weeks, even the small things",
      ]},
      { h: "Indian-Specific Swaps", items: [
        "Roti instead of rice at dinner, or reduce rice portion by a third",
        "Curd instead of raita made with cream",
        "Roasted chana or makhana instead of fried namkeen",
        "Steamed idli or dhokla instead of fried breakfast items",
        "Reduce cooking oil to 2–3 tsp per person per day",
        "Chai without sugar, or with half the usual amount",
      ]},
      { h: "Protect Your Muscle", items: [
        "Strength train 2–3 times weekly while in deficit",
        "Keep protein at 1.6–2g per kg bodyweight",
        "Don't cut calories below your BMR",
        "Take a maintenance week every 8–10 weeks",
      ]},
      { h: "When Progress Stalls", items: [
        "Plateaus after 6–8 weeks are normal, not failure",
        "Recheck portions — they drift upward without noticing",
        "Increase daily steps before cutting more food",
        "Weigh weekly at the same time, not daily",
      ]},
    ],
  },
  gain: {
    icon: "📈", title: "Weight Gain Tips", color: T.violet,
    intro: "Gaining well means adding muscle rather than only fat. That needs surplus plus stimulus.",
    sections: [
      { h: "The Core Principle", items: [
        "Aim for a 300–500 kcal daily surplus",
        "Target 0.25–0.5 kg gain per week",
        "Faster gain is mostly fat, not muscle",
        "Without resistance training, surplus becomes fat almost entirely",
      ]},
      { h: "Eating More Without Feeling Stuffed", items: [
        "Eat 5–6 smaller meals instead of 3 large ones",
        "Choose calorie-dense foods over bulky ones",
        "Drink your calories — milk, banana shakes, lassi",
        "Add ghee or oil to dal and sabzi — 1 tsp adds 45 kcal invisibly",
        "Nuts and seeds as snacks between meals",
        "Don't fill up on salad before the main meal",
      ]},
      { h: "Indian High-Calorie Staples", items: [
        "Full-fat milk — 150 kcal per glass, drink 2–3 daily",
        "Banana shake with milk, dates, and nuts — 400+ kcal",
        "Paneer paratha with ghee",
        "Peanut butter or homemade chikki",
        "Rajma-chawal, chhole-chawal — protein plus carbs together",
        "Dry fruits — dates, figs, raisins soaked overnight",
        "Curd with jaggery after meals",
      ]},
      { h: "Training for Size", items: [
        "Compound lifts: squat, deadlift, bench, row, overhead press",
        "3–4 sessions weekly, 6–12 rep range",
        "Progressive overload — add weight or reps every week or two",
        "Protein 1.6–2.2g per kg bodyweight",
        "Sleep 7–8 hours; muscle grows during rest, not training",
      ]},
      { h: "If You Can't Gain", items: [
        "You're likely eating less than you think — track for a week",
        "Add 200 kcal, hold for two weeks, reassess",
        "Rule out thyroid issues or parasites with a doctor if truly stuck",
        "Reduce excessive cardio while bulking",
      ]},
    ],
  },
  maintain: {
    icon: "⚖️", title: "Maintenance Tips", color: T.sky,
    intro: "Maintenance is the hardest phase because there's no visible progress to motivate you. Systems matter more than willpower here.",
    sections: [
      { h: "Finding Your Level", items: [
        "Eat at your calculated TDEE and hold for 3 weeks",
        "Weigh weekly; adjust by 100–150 kcal if trending up or down",
        "Weight fluctuates 1–2 kg daily from water and food volume — ignore it",
        "Judge by the 4-week trend, not any single reading",
      ]},
      { h: "The 80/20 Structure", items: [
        "80% of meals from whole, minimally processed foods",
        "20% flexible — festivals, restaurants, sweets, whatever you enjoy",
        "This is sustainable for years; strict eating rarely is",
        "One heavy meal doesn't undo a week of consistency",
      ]},
      { h: "Habits That Hold", items: [
        "Keep protein high even at maintenance",
        "Continue strength training 2–3 times weekly",
        "Maintain your step count — this is what quietly drifts down",
        "Weekly weigh-in on a fixed day and time",
        "Log food occasionally — a check-in week every month or two",
      ]},
      { h: "Handling Festivals & Travel", items: [
        "Expect a 1–2 kg rise during Diwali or a wedding season — it's mostly water and food volume",
        "Return to normal eating immediately after, no compensatory starving",
        "Keep exercising even at reduced volume",
        "Prioritise protein and vegetables at buffets before anything else",
      ]},
      { h: "The Long View", items: [
        "Most regain happens because people return to old habits after reaching a goal",
        "Whatever got you here needs to become permanent, in a lighter form",
        "Small corrections early beat large corrections later",
        "Fitness is maintained, not achieved once",
      ]},
    ],
  },
};

// ─── Guide Detail View ────────────────────────────────────────────────────────
function GuideView({ guide, onBack, guideKey }) {
  const { t, lang } = useLang();
  return (
    <div>
      <button onClick={onBack} style={{
        background:T.card, border:`1px solid ${T.border}`, borderRadius:10,
        color:T.textSecondary, fontSize:12, padding:"8px 14px", cursor:"pointer", marginBottom:16
      }}>{t("back_to_menu")}</button>

      <div style={{ background:T.card, border:`1px solid ${guide.color}30`, borderRadius:16, padding:"18px 16px", marginBottom:16 }}>
        <div style={{ fontSize:32, marginBottom:8 }}>{guide.icon}</div>
        <div style={{ fontSize:20, fontWeight:800, color:guide.color, marginBottom:8 }}>{lang === "hi" ? (GUIDE_TITLES_HI[guideKey] || guide.title) : guide.title}</div>
        <p style={{ margin:0, fontSize:13, color:T.textSecondary, lineHeight:1.6 }}>{guide.intro}</p>
      </div>

      {guide.sections.map((sec, i) => (
        <div key={i} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"16px", marginBottom:12 }}>
          <div style={{ fontSize:13, fontWeight:800, color:guide.color, marginBottom:12, letterSpacing:0.3 }}>{sec.h}</div>
          {sec.items.map((item, j) => (
            <div key={j} style={{ display:"flex", gap:10, marginBottom:10, alignItems:"flex-start" }}>
              <div style={{ width:5, height:5, borderRadius:"50%", background:guide.color, marginTop:6, flexShrink:0 }} />
              <p style={{ margin:0, fontSize:12.5, color:T.textPrimary, lineHeight:1.55 }}>{item}</p>
            </div>
          ))}
        </div>
      ))}

      <div style={{ fontSize:11, color:T.textMuted, textAlign:"center", padding:"8px 20px 0", lineHeight:1.5 }}>
{t("guide_disclaimer")}
      </div>
    </div>
  );
}

// ─── Hamburger Drawer ─────────────────────────────────────────────────────────
function Drawer({ open, onClose, onSelect, onEditProfile, onReset, onExport, profile }) {
  const { t, lang } = useLang();
  const [confirmReset, setConfirmReset] = useState(false);
  if (!open) return null;
  const entries = Object.entries(GUIDES);
  return (
    <div onClick={e => e.target===e.currentTarget && onClose()} style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:200,
      display:"flex", backdropFilter:"blur(3px)"
    }}>
      <div style={{
        width:"84%", maxWidth:330, background:T.surface, height:"100%",
        borderRight:`1px solid ${T.border}`, overflowY:"auto", padding:"24px 0"
      }}>
        <div style={{ padding:"0 20px 20px", borderBottom:`1px solid ${T.border}` }}>
          <div style={{ fontSize:10, fontWeight:700, color:T.teal, letterSpacing:2 }}>{t("appName")}</div>
          <div style={{ fontSize:18, fontWeight:800, color:T.textPrimary, marginTop:4 }}>{t("guides_settings")}</div>
          {profile && (
            <div style={{ fontSize:11, color:T.textSecondary, marginTop:6 }}>
              {profile.weight}kg · {profile.height}cm · Goal: {profile.tdee} kcal
            </div>
          )}
        </div>

        <div style={{ padding:"14px 20px 8px", fontSize:10, fontWeight:700, color:T.textMuted, letterSpacing:1 }}>
          {t("guides_header")}
        </div>

        {entries.map(([key, g]) => (
          <button key={key} onClick={() => { onSelect(key); onClose(); }} style={{
            width:"100%", background:"none", border:"none", borderBottom:`1px solid ${T.border}`,
            padding:"14px 20px", cursor:"pointer", display:"flex", alignItems:"center", gap:14, textAlign:"left"
          }}>
            <span style={{ fontSize:22 }}>{g.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13.5, fontWeight:700, color:T.textPrimary }}>{lang === "hi" ? (GUIDE_TITLES_HI[key] || g.title) : g.title}</div>
              <div style={{ fontSize:10.5, color:T.textSecondary, marginTop:2 }}>{t("sections", { n: g.sections.length })}</div>
            </div>
            <span style={{ color:T.textMuted, fontSize:16 }}>›</span>
          </button>
        ))}

        <div style={{ padding:"18px 20px 8px", fontSize:10, fontWeight:700, color:T.textMuted, letterSpacing:1 }}>
          {t("settings")}
        </div>
        <button onClick={() => { onEditProfile(); onClose(); }} style={{
          width:"100%", background:"none", border:"none", borderBottom:`1px solid ${T.border}`,
          padding:"14px 20px", cursor:"pointer", display:"flex", alignItems:"center", gap:14, textAlign:"left"
        }}>
          <span style={{ fontSize:22 }}>👤</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13.5, fontWeight:700, color:T.textPrimary }}>{t("edit_profile")}</div>
            <div style={{ fontSize:10.5, color:T.textSecondary, marginTop:2 }}>{t("recalc")}</div>
          </div>
          <span style={{ color:T.textMuted, fontSize:16 }}>›</span>
        </button>

        <div style={{
          padding:"13px 20px", borderBottom:`1px solid ${T.border}`,
          display:"flex", alignItems:"center", gap:14
        }}>
          <span style={{ fontSize:22 }}>🌐</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13.5, fontWeight:700, color:T.textPrimary }}>{t("language")}</div>
            <div style={{ fontSize:10.5, color:T.textSecondary, marginTop:2 }}>{t("lang_sub")}</div>
          </div>
          <LanguageToggle compact />
        </div>

        <button onClick={() => { onExport(); onClose(); }} style={{
          width:"100%", background:"none", border:"none", borderBottom:`1px solid ${T.border}`,
          padding:"14px 20px", cursor:"pointer", display:"flex", alignItems:"center", gap:14, textAlign:"left"
        }}>
          <span style={{ fontSize:22 }}>⬇️</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13.5, fontWeight:700, color:T.textPrimary }}>{t("export_data")}</div>
            <div style={{ fontSize:10.5, color:T.textSecondary, marginTop:2 }}>{t("export_sub")}</div>
          </div>
          <span style={{ color:T.textMuted, fontSize:16 }}>›</span>
        </button>

        <button
          onClick={() => setConfirmReset(true)}
          style={{
            width:"100%", background:"none", border:"none", borderBottom:`1px solid ${T.border}`,
            padding:"14px 20px", cursor:"pointer", display:"flex", alignItems:"center", gap:14, textAlign:"left"
          }}>
          <span style={{ fontSize:22 }}>🗑️</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13.5, fontWeight:700, color:T.textPrimary }}>{t("clear_data")}</div>
            <div style={{ fontSize:10.5, color:T.textSecondary, marginTop:2 }}>{t("clear_sub")}</div>
          </div>
          <span style={{ color:T.textMuted, fontSize:16 }}>›</span>
        </button>

        {confirmReset && (
          <div style={{ padding:"14px 20px", background:`${T.red}10`, borderBottom:`1px solid ${T.border}` }}>
            <div style={{ fontSize:12, color:T.textPrimary, lineHeight:1.5, marginBottom:12 }}>
{t("clear_confirm")}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => setConfirmReset(false)} style={{
                flex:1, background:T.card, border:`1px solid ${T.border}`, borderRadius:9,
                color:T.textSecondary, fontSize:12, fontWeight:700, padding:"10px", cursor:"pointer"
              }}>{t("keep_it")}</button>
              <button onClick={() => { setConfirmReset(false); onReset(); onClose(); }} style={{
                flex:1, background:T.red, border:"none", borderRadius:9,
                color:"#fff", fontSize:12, fontWeight:700, padding:"10px", cursor:"pointer"
              }}>{t("delete")}</button>
            </div>
          </div>
        )}

        <div style={{ padding:"20px", fontSize:10, color:T.textMuted, lineHeight:1.5 }}>
{t("device_only")}
          <br /><br />
          {t("disclaimer")}
        </div>
      </div>
    </div>
  );
}

// ─── Food Database for Meal Planning ──────────────────────────────────────────
// Per-serving nutrition for common Indian foods.
// diet: veg | egg | nonveg  — "egg" items are fine for eggetarians and above.

const DIET_TYPES = [
  { id:"veg",     label:"vegetarian",  icon:"🥬", allows:["veg"] },
  { id:"egg",     label:"eggetarian",  icon:"🥚", allows:["veg","egg"] },
  { id:"nonveg",  label:"nonveg",     icon:"🍗", allows:["veg","egg","nonveg"] },
  { id:"mix",     label:"mixed",       icon:"🍽️", allows:["veg","egg","nonveg"] },
];

// ─── Meal Plan Tab ────────────────────────────────────────────────────────────
function MealPlanTab({ nutrition, goals, onAddMeal }) {
  const { t, lang } = useLang();
  const [diet, setDiet] = useState("veg");
  const [added, setAdded] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState("");
  // Which meal the plan gets logged under — defaults to the current time slot.
  const [logTo, setLogTo] = useState(() => mealSlotForTime());
  const [justLogged, setJustLogged] = useState(null);

  const allowed = DIET_TYPES.find(d => d.id === diet).allows;

  // What's still missing today
  const gaps = {
    kcal:    Math.max(goals.tdee    - nutrition.kcal,    0),
    protein: Math.max(goals.protein - nutrition.protein, 0),
    fiber:   Math.max(goals.fiber   - nutrition.fiber,   0),
    calcium: Math.max(goals.calcium - nutrition.calcium, 0),
    b12:     Math.max(goals.b12     - nutrition.b12,     0),
  };

  // Which nutrient is proportionally most behind — drives what we recommend
  const shortfalls = [
    { key:"protein", label:t("protein"), unit:"g",  gap:gaps.protein, goal:goals.protein, color:T.orange, tag:"protein", icon:"🥩" },
    { key:"fiber",   label:t("fiber"),   unit:"g",  gap:gaps.fiber,   goal:goals.fiber,   color:T.lime,   tag:"fiber",   icon:"🌿" },
    { key:"calcium", label:t("calcium"), unit:"mg", gap:gaps.calcium, goal:goals.calcium, color:T.sky,    tag:"calcium", icon:"🦴" },
    { key:"b12",     label:t("b12"),     unit:"μg", gap:gaps.b12,     goal:goals.b12,     color:T.pink,   tag:"b12",     icon:"💊" },
  ].map(s => ({ ...s, pctMissing: s.goal > 0 ? s.gap / s.goal : 0 }))
   .sort((a,b) => b.pctMissing - a.pctMissing);

  const priority = shortfalls.filter(s => s.pctMissing > 0.15);

  // Score each candidate food against remaining needs
  const candidates = FOOD_DB
    .filter(f => allowed.includes(f.diet))
    .filter(f => added.every(a => a.name !== f.name))
    .filter(f => !query.trim() || f.name.toLowerCase().includes(query.trim().toLowerCase()))
    .map(f => {
      let score = 0;
      priority.forEach((s, rank) => {
        const weight = priority.length - rank;
        const contribution = Math.min(f[s.key] / (s.gap || 1), 1);
        score += contribution * weight;
      });
      // Penalise foods that would blow the remaining calorie budget
      if (gaps.kcal > 0 && f.kcal > gaps.kcal) score -= 1.5;
      // Slight bonus for light foods when calorie room is tight
      if (gaps.kcal < 400 && f.tags.includes("light")) score += 0.6;
      // Bonus for dense foods when there's a lot of room left
      if (gaps.kcal > 900 && f.tags.includes("calorie-dense")) score += 0.5;
      return { ...f, score };
    })
    .sort((a,b) => b.score - a.score);

  const suggestions = candidates.slice(0, showAll ? 30 : 6);

  const plannedTotal = added.reduce((a,f) => ({
    kcal:a.kcal+f.kcal, protein:a.protein+f.protein, fiber:a.fiber+f.fiber,
    calcium:a.calcium+f.calcium, b12:a.b12+f.b12
  }), { kcal:0, protein:0, fiber:0, calcium:0, b12:0 });

  const allMet = priority.length === 0;

  return (
    <div>
      {/* Diet selector */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:10, fontWeight:700, color:T.textSecondary, letterSpacing:1, marginBottom:8 }}>{t("your_diet")}</div>
        <div style={{ display:"flex", gap:6 }}>
          {DIET_TYPES.map(d => (
            <button key={d.id} onClick={() => { setDiet(d.id); setAdded([]); }} style={{
              flex:1, background: diet===d.id ? T.teal : T.card,
              border:`1px solid ${diet===d.id ? T.teal : T.border}`,
              borderRadius:10, color: diet===d.id ? T.bg : T.textSecondary,
              fontSize:10, fontWeight:700, padding:"10px 4px", cursor:"pointer",
              display:"flex", flexDirection:"column", alignItems:"center", gap:4
            }}>
              <span style={{ fontSize:16 }}>{d.icon}</span>
              {t(d.label)}
            </button>
          ))}
        </div>
      </div>

      {/* Which meal anything logged from here goes into */}
      <div style={{ marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <span style={{ fontSize:10, fontWeight:700, color:T.textSecondary, letterSpacing:1 }}>{t("log_to_meal")}</span>
          <span style={{ fontSize:9.5, color:T.textMuted }}>
            {logTo === mealSlotForTime() ? t("matches_time") : t("auto_was", { m: t(mealSlotForTime().toLowerCase()) })}
          </span>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {["Breakfast","Lunch","Snacks","Dinner"].map(m => (
            <button key={m} onClick={() => setLogTo(m)} style={{
              flex:1, background: logTo===m ? T.teal : T.card,
              border:`1px solid ${logTo===m ? T.teal : T.border}`,
              borderRadius:8, color: logTo===m ? T.bg : T.textSecondary,
              fontSize:10, fontWeight:700, padding:"8px 4px", cursor:"pointer"
            }}>{t(m.toLowerCase())}</button>
          ))}
        </div>
      </div>

      {/* Remaining today */}
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"16px", marginBottom:16 }}>
        <div style={{ fontSize:10, fontWeight:700, color:T.textSecondary, letterSpacing:1, marginBottom:12 }}>{t("still_needed")}</div>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
          <div>
            <div style={{ fontSize:26, fontWeight:800, color: gaps.kcal>0 ? T.teal : T.green, fontFamily:"monospace", lineHeight:1 }}>
              {gaps.kcal}
            </div>
            <div style={{ fontSize:10, color:T.textSecondary, marginTop:3 }}>{t("calories_left")}</div>
          </div>
          <div style={{ display:"flex", gap:14 }}>
            {shortfalls.map(s => (
              <div key={s.key} style={{ textAlign:"center" }}>
                <div style={{ fontSize:14, fontWeight:800, color: s.gap>0 ? s.color : T.green, fontFamily:"monospace" }}>
                  {s.gap > 0 ? `${Math.round(s.gap*10)/10}` : "✓"}
                </div>
                <div style={{ fontSize:9, color:T.textMuted }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {allMet ? (
          <div style={{ background:`${T.green}15`, border:`1px solid ${T.green}30`, borderRadius:10, padding:"10px 12px", fontSize:12, color:T.green }}>
{t("all_met")}
          </div>
        ) : (
          <div style={{ fontSize:11.5, color:T.textSecondary, lineHeight:1.5 }}>
            {t("biggest_gap")} <span style={{ color:priority[0].color, fontWeight:700 }}>{priority[0].label}</span>
            {priority.length > 1 && <>{t("then_x", { x: priority[1].label })}</>}
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <div style={{ fontSize:10, fontWeight:700, color:T.textSecondary, letterSpacing:1 }}>
          {query.trim() ? t("search_results") : showAll ? t("all_foods") : t("suggested")}
        </div>
        <button onClick={() => setShowAll(v => !v)} style={{
          background:"none", border:"none", color:T.teal, fontSize:11, fontWeight:700, cursor:"pointer", padding:0
        }}>{showAll ? t("show_top") : t("browse_all", { n: candidates.length })}</button>
      </div>

      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={t("search_foods")}
        style={{
          width:"100%", background:T.card, border:`1px solid ${T.border}`, borderRadius:10,
          color:T.textPrimary, fontSize:12.5, padding:"10px 13px", outline:"none",
          marginBottom:12, boxSizing:"border-box"
        }}
      />

      {suggestions.map((f, i) => (
        <div key={f.name} style={{
          background:T.card, border:`1px solid ${i===0 && !allMet ? `${T.teal}40` : T.border}`,
          borderRadius:14, padding:"14px 16px", marginBottom:10
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                <span style={{ fontSize:13.5, fontWeight:700, color:T.textPrimary }}>{foodName(f.name, lang)}</span>
                {i===0 && !allMet && (
                  <span style={{ fontSize:8.5, background:`${T.teal}20`, color:T.teal, borderRadius:4, padding:"2px 6px", fontWeight:800 }}>{t("best_match")}</span>
                )}
              </div>
              <div style={{ fontSize:10.5, color:T.textSecondary, marginTop:3 }}>{servingName(f.serving, lang)}</div>
            </div>
            <div style={{ display:"flex", gap:6, flexShrink:0, marginLeft:8 }}>
              <button onClick={() => setAdded(prev => [...prev, f])} style={{
                background:"none", border:`1px solid ${T.border}`, borderRadius:8,
                color:T.textSecondary, fontSize:11, fontWeight:700, padding:"6px 10px", cursor:"pointer"
              }}>{t("plan_btn")}</button>
              <button
                onClick={() => {
                  onAddMeal(logTo, [{
                    name: f.name, weight: 100,
                    kcal: f.kcal, protein: f.protein, carbs: f.carbs, fat: f.fat,
                    fiber: f.fiber, calcium: f.calcium, b12: f.b12
                  }]);
                  setJustLogged({ count: 1, meal: logTo });
                  setTimeout(() => setJustLogged(null), 4000);
                }}
                style={{
                  background:`${T.teal}18`, border:`1px solid ${T.teal}40`, borderRadius:8,
                  color:T.teal, fontSize:11, fontWeight:700, padding:"6px 10px", cursor:"pointer"
                }}>{t("log_btn")}</button>
            </div>
          </div>

          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {[["kcal",f.kcal,"",T.teal],["P",f.protein,"g",T.orange],["Fib",f.fiber,"g",T.lime],["Ca",f.calcium,"mg",T.sky],["B12",f.b12,"μg",T.pink]].map(([l,v,u,c]) => (
              <div key={l} style={{ fontSize:10, color:T.textSecondary }}>
                {l} <span style={{ color: v>0 ? c : T.textMuted, fontFamily:"monospace", fontWeight:700 }}>{v}{u}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Planned basket */}
      {added.length > 0 && (
        <div style={{ background:T.tealDim, border:`1px solid ${T.teal}30`, borderRadius:16, padding:"16px", marginTop:6 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div style={{ fontSize:11, fontWeight:800, color:T.teal, letterSpacing:0.5 }}>{t("your_plan", { n: added.length })}</div>
            <button onClick={() => setAdded([])} style={{
              background:"none", border:"none", color:T.textSecondary, fontSize:10.5, cursor:"pointer", textDecoration:"underline"
            }}>{t("clear")}</button>
          </div>

          {added.map((f, i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:`1px solid ${T.teal}18` }}>
              <div style={{ fontSize:12, color:T.textPrimary }}>{foodName(f.name, lang)}</div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:11, fontFamily:"monospace", color:T.textSecondary }}>{f.kcal} kcal</span>
                <button onClick={() => setAdded(prev => prev.filter((_,j) => j!==i))} style={{
                  background:"none", border:"none", color:T.textMuted, fontSize:15, cursor:"pointer", padding:0, lineHeight:1
                }}>×</button>
              </div>
            </div>
          ))}

          {/* Projected result */}
          <div style={{ marginTop:14, paddingTop:12, borderTop:`1px solid ${T.teal}30` }}>
            <div style={{ fontSize:10, color:T.textSecondary, marginBottom:10 }}>{t("if_you_eat")}</div>
            {[
              [t("calories"), nutrition.kcal + plannedTotal.kcal, goals.tdee, "", T.teal],
              [t("protein"),  nutrition.protein + plannedTotal.protein, goals.protein, "g", T.orange],
              [t("fiber"),    nutrition.fiber + plannedTotal.fiber, goals.fiber, "g", T.lime],
              [t("calcium"),  nutrition.calcium + plannedTotal.calcium, goals.calcium, "mg", T.sky],
              [t("b12"),      Math.round((nutrition.b12 + plannedTotal.b12)*10)/10, goals.b12, "μg", T.pink],
            ].map(([label, val, goal, unit, color]) => {
              const pct = Math.min(val/goal, 1);
              const met = val >= goal * 0.95;
              return (
                <div key={label} style={{ marginBottom:9 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:11, color:T.textSecondary }}>{label}</span>
                    <span style={{ fontSize:11, fontFamily:"monospace", fontWeight:700, color: met ? T.green : color }}>
                      {val}{unit} / {goal}{unit} {met && "✓"}
                    </span>
                  </div>
                  <div style={{ background:T.border, borderRadius:3, height:4, overflow:"hidden" }}>
                    <div style={{ width:`${pct*100}%`, height:"100%", background: met ? T.green : color, borderRadius:3, transition:"width 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Log the planned foods into an actual meal */}
          <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${T.teal}30` }}>
            <button
              onClick={() => {
                const items = added.map(f => ({
                  name: f.name,
                  weight: 100,
                  kcal: f.kcal, protein: f.protein, carbs: f.carbs, fat: f.fat,
                  fiber: f.fiber, calcium: f.calcium, b12: f.b12
                }));
                onAddMeal(logTo, items);
                setJustLogged({ count: added.length, meal: logTo });
                setAdded([]);
                setTimeout(() => setJustLogged(null), 4000);
              }}
              style={{
                width:"100%", background:T.teal, border:"none", borderRadius:12,
                color:T.bg, fontSize:14, fontWeight:800, padding:"14px", cursor:"pointer"
              }}>
              {t("add_n_to", { n: added.length, items: added.length === 1 ? t("item") : t("items"), m: t(logTo.toLowerCase()) })}
            </button>
          </div>
        </div>
      )}

      {/* Confirmation after logging */}
      {justLogged && (
        <div style={{
          background:`${T.green}15`, border:`1px solid ${T.green}40`, borderRadius:14,
          padding:"14px 16px", marginTop:6, display:"flex", alignItems:"center", gap:12
        }}>
          <span style={{ fontSize:20 }}>✅</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:700, color:T.green }}>
{t("added_to", { m: t(justLogged.meal.toLowerCase()) })}
            </div>
            <div style={{ fontSize:11, color:T.textSecondary, marginTop:2 }}>
{t("logged_updated", { n: justLogged.count, items: justLogged.count === 1 ? t("item") : t("items") })}
            </div>
          </div>
        </div>
      )}

      <div style={{ fontSize:10.5, color:T.textMuted, textAlign:"center", padding:"16px 12px 0", lineHeight:1.5 }}>
{t("plan_disclaimer")}
      </div>
    </div>
  );
}

// ─── Water tracking ───────────────────────────────────────────────────────────
function WaterCard({ glasses, onChange, goal = 8 }) {
  const { t, lang } = useLang();
  const pct = Math.min(glasses / goal, 1);
  return (
    <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"16px", marginBottom:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:T.textPrimary }}>💧 {t("water")}</div>
          <div style={{ fontSize:10, color:T.textSecondary, marginTop:2 }}>
{t("water_of", { n: glasses, goal, l: (glasses * 0.25).toFixed(2) })}
          </div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={() => onChange(Math.max(glasses - 1, 0))} style={{
            background:T.surface, border:`1px solid ${T.border}`, borderRadius:8,
            color:T.textSecondary, fontSize:16, fontWeight:700, width:34, height:34, cursor:"pointer", lineHeight:1
          }}>−</button>
          <button onClick={() => onChange(glasses + 1)} style={{
            background:`${T.sky}20`, border:`1px solid ${T.sky}50`, borderRadius:8,
            color:T.sky, fontSize:16, fontWeight:700, width:34, height:34, cursor:"pointer", lineHeight:1
          }}>+</button>
        </div>
      </div>

      {/* Glass row */}
      <div style={{ display:"flex", gap:4, marginBottom:10 }}>
        {Array.from({ length: goal }, (_, i) => (
          <button key={i} onClick={() => onChange(i + 1 === glasses ? i : i + 1)} style={{
            flex:1, height:26, borderRadius:5, cursor:"pointer",
            background: i < glasses ? T.sky : T.surface,
            border:`1px solid ${i < glasses ? T.sky : T.border}`,
            fontSize:11, padding:0, lineHeight:1
          }}>{i < glasses ? "💧" : ""}</button>
        ))}
      </div>

      <div style={{ background:T.border, borderRadius:3, height:4, overflow:"hidden" }}>
        <div style={{ width:`${pct*100}%`, height:"100%", background: glasses >= goal ? T.green : T.sky, borderRadius:3, transition:"width 0.4s" }} />
      </div>
      {glasses > goal && (
        <div style={{ fontSize:10, color:T.green, marginTop:6 }}>{t("water_extra", { n: glasses - goal })}</div>
      )}
    </div>
  );
}

// ─── Recently logged ──────────────────────────────────────────────────────────
function RecentRow({ recent, onLog, mealTarget }) {
  const { t, lang } = useLang();
  if (!recent.length) return null;
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:9 }}>
        <span style={{ fontSize:10, fontWeight:700, color:T.textSecondary, letterSpacing:1 }}>{t("quick_add")}</span>
        <span style={{ fontSize:9.5, color:T.textMuted }}>→ {t(mealTarget.toLowerCase())}</span>
      </div>
      <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
        {recent.slice(0, 10).map((f, i) => (
          <button key={i} onClick={() => onLog(f)} style={{
            flexShrink:0, background:T.card, border:`1px solid ${T.border}`,
            borderRadius:11, padding:"10px 13px", cursor:"pointer", textAlign:"left", minWidth:110
          }}>
            <div style={{ fontSize:11.5, fontWeight:700, color:T.textPrimary, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:130 }}>
{foodName(f.name, lang)}
            </div>
            <div style={{ fontSize:10, fontFamily:"monospace", color:T.teal, marginTop:3 }}>{f.kcal} kcal</div>
            <div style={{ fontSize:9, color:T.textMuted, marginTop:1 }}>P{d1(f.protein)} · {f.weight}g</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Weekly summary ───────────────────────────────────────────────────────────
function WeeklySummary({ history, goals, todayNutrition }) {
  const { t, lang } = useLang();
  const tKey = todayKey();

  const collect = (offsetWeeks) => lastNDays(14)
    .slice(offsetWeeks === 0 ? 7 : 0, offsetWeeks === 0 ? 14 : 7)
    .map(d => {
      const k = dateKey(d);
      const rec = k === tKey ? todayNutrition : history[k];
      return rec && rec.kcal > 0 ? rec : null;
    })
    .filter(Boolean);

  const thisWeek = collect(0);
  const lastWeek = collect(1);

  if (thisWeek.length === 0) {
    return (
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"20px 16px", marginBottom:20, textAlign:"center" }}>
        <div style={{ fontSize:22, marginBottom:8 }}>📈</div>
        <div style={{ fontSize:12.5, color:T.textSecondary, lineHeight:1.55 }}>
{t("weekly_empty")}
        </div>
      </div>
    );
  }

  const avg = (arr, key) => arr.length ? arr.reduce((a,b) => a + (b[key] || 0), 0) / arr.length : 0;

  const metrics = [
    { key:"kcal",    label:t("calories"), goal:goals.tdee,    unit:"",   color:T.teal   },
    { key:"protein", label:t("protein"),  goal:goals.protein, unit:"g",  color:T.orange },
    { key:"fiber",   label:t("fiber"),    goal:goals.fiber,   unit:"g",  color:T.lime   },
    { key:"calcium", label:t("calcium"),  goal:goals.calcium, unit:"mg", color:T.sky    },
    { key:"b12",     label:t("b12"),      goal:goals.b12,     unit:"μg", color:T.pink   },
  ].map(m => {
    const now = avg(thisWeek, m.key);
    const prev = avg(lastWeek, m.key);
    const change = prev > 0 ? ((now - prev) / prev) * 100 : null;
    const daysMet = thisWeek.filter(d => (d[m.key] || 0) >= m.goal * 0.9).length;
    return { ...m, now, prev, change, daysMet };
  });

  const proteinTrend = metrics.find(m => m.key === "protein");

  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:10, fontWeight:700, color:T.textSecondary, letterSpacing:1, marginBottom:10 }}>
{t("this_week", { n: thisWeek.length, days: thisWeek.length === 1 ? t("day") : t("days") })}
      </div>

      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"16px" }}>
        {metrics.map((m, i) => (
          <div key={m.key} style={{
            paddingBottom: i < metrics.length-1 ? 13 : 0,
            marginBottom: i < metrics.length-1 ? 13 : 0,
            borderBottom: i < metrics.length-1 ? `1px solid ${T.border}` : "none"
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:5 }}>
              <span style={{ fontSize:12, fontWeight:700, color:T.textPrimary }}>{m.label}</span>
              <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                <span style={{ fontSize:13, fontFamily:"monospace", fontWeight:800, color:m.color }}>
                  {m.key === "kcal" || m.key === "calcium" ? Math.round(m.now) : d1(m.now)}{m.unit}
                </span>
                {m.change != null && Math.abs(m.change) >= 3 && (
                  <span style={{
                    fontSize:10, fontWeight:700,
                    color: m.change > 0 ? T.green : T.orange
                  }}>
                    {m.change > 0 ? "▲" : "▼"} {Math.abs(Math.round(m.change))}%
                  </span>
                )}
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:9.5, color:T.textMuted }}>
              <span>{t("avg_vs_goal", { goal: m.goal, unit: m.unit })}</span>
              <span>{t("hit_target", { n: m.daysMet, total: thisWeek.length })}</span>
            </div>
            <div style={{ background:T.border, borderRadius:3, height:4, overflow:"hidden", marginTop:5 }}>
              <div style={{
                width:`${Math.min(m.now / m.goal, 1) * 100}%`, height:"100%",
                background: m.now >= m.goal * 0.95 ? T.green : m.color,
                borderRadius:3, transition:"width 0.6s"
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Plain-language takeaway */}
      {lastWeek.length >= 3 && proteinTrend.change != null && (
        <div style={{
          background:T.card, border:`1px solid ${proteinTrend.change > 0 ? T.green : T.amber}30`,
          borderRadius:12, padding:"12px 14px", marginTop:10,
          display:"flex", gap:10, alignItems:"flex-start"
        }}>
          <span style={{ fontSize:16 }}>{proteinTrend.change > 0 ? "📈" : "📉"}</span>
          <p style={{ margin:0, fontSize:12, color:T.textPrimary, lineHeight:1.5 }}>
            {proteinTrend.change > 5
              ? t("protein_up", { n: Math.round(proteinTrend.change) })
              : proteinTrend.change < -5
              ? t("protein_down", { n: Math.abs(Math.round(proteinTrend.change)) })
              : t("protein_steady")}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
const EMPTY_MEALS = {
  Breakfast: { icon:"🌅", name:"Breakfast", items:[] },
  Lunch:     { icon:"☀️", name:"Lunch",     items:[] },
  Snacks:    { icon:"🍎", name:"Snacks",    items:[] },
  Dinner:    { icon:"🌙", name:"Dinner",    items:[] },
};

export default function NutriVisionAI() {
  const [profile, setProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [scanner, setScanner] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeGuide, setActiveGuide] = useState(null);
  const [meals, setMeals] = useState(EMPTY_MEALS);
  const [history, setHistory] = useState({});
  const [water, setWater] = useState(0);
  const [recent, setRecent] = useState([]);
  const [weights, setWeights] = useState([]);
  const [toast, setToast] = useState(null);
  const [lang, setLang] = useState("en");
  const t = makeT(lang);

  // Restore saved profile and today's meals on first load.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await store.get(STORE_KEY);
      const savedMeals = await store.get(MEALS_KEY);
      const savedHistory = await store.get(HISTORY_KEY);
      const savedWater = await store.get(WATER_KEY);
      const savedRecent = await store.get(RECENT_KEY);
      const savedWeights = await store.get(WEIGHTS_KEY);
      const savedLang = await store.get(LANG_KEY);
      if (cancelled) return;

      if (saved) setProfile(saved);
      if (savedHistory) setHistory(savedHistory);
      if (savedRecent) setRecent(savedRecent);
      if (savedWeights) setWeights(savedWeights);
      if (savedLang === "hi" || savedLang === "en") setLang(savedLang);

      const tKey = todayKey();

      // Meals and water only carry over within the same day.
      if (savedMeals?.date === tKey && savedMeals.meals) {
        setMeals(savedMeals.meals);
      } else if (savedMeals?.date && savedMeals.meals) {
        // A previous day is closing out — fold its totals into history so the
        // record survives even though the live log resets.
        const totals = totalsFromMeals(savedMeals.meals);
        if (totals.kcal > 0) {
          setHistory(h => ({ ...(savedHistory || h), [savedMeals.date]: { ...totals, water: savedWater?.glasses || 0 } }));
        }
      }

      if (savedWater?.date === tKey) setWater(savedWater.glasses || 0);

      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, []);

  // Persist profile whenever it changes.
  useEffect(() => {
    if (!loaded || !profile) return;
    store.set(STORE_KEY, profile);
  }, [profile, loaded]);

  // Persist today's meal log.
  useEffect(() => {
    if (!loaded) return;
    store.set(MEALS_KEY, { date: todayKey(), meals });
  }, [meals, loaded]);

  // Keep today's entry in history current, so the chart reflects live logging.
  useEffect(() => {
    if (!loaded) return;
    const totals = totalsFromMeals(meals);
    if (totals.kcal === 0 && water === 0) return;
    setHistory(prev => {
      const next = { ...prev, [todayKey()]: { ...totals, water } };
      store.set(HISTORY_KEY, next);
      return next;
    });
  }, [meals, water, loaded]);

  useEffect(() => {
    if (!loaded) return;
    store.set(WATER_KEY, { date: todayKey(), glasses: water });
  }, [water, loaded]);

  useEffect(() => {
    if (!loaded) return;
    store.set(RECENT_KEY, recent);
  }, [recent, loaded]);

  useEffect(() => {
    if (!loaded) return;
    store.set(WEIGHTS_KEY, weights);
  }, [weights, loaded]);

  useEffect(() => {
    if (!loaded) return;
    store.set(LANG_KEY, lang);
  }, [lang, loaded]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const addMeal = (mealType, items) => {
    setMeals(prev => ({
      ...prev, [mealType]: { ...prev[mealType], items:[...prev[mealType].items, ...items] }
    }));
    // Track recents, most recent first, de-duplicated by name.
    setRecent(prev => {
      const merged = [...items, ...prev.filter(p => !items.some(i => i.name === p.name))];
      return merged.slice(0, 20);
    });
  };

  const exportCSV = () => {
    if (!profile) return;
    const csv = buildCSV(history, profile, weights);
    const ok = downloadCSV(csv, `nutrivision-export-${todayKey()}.csv`);
    showToast(ok ? t("csv_done") : t("csv_fail"));
  };

  const saveProfile = (p) => {
    setProfile(p);
    setEditingProfile(false);
  };

  const resetEverything = async () => {
    await store.remove(STORE_KEY);
    await store.remove(MEALS_KEY);
    await store.remove(WEIGHTS_KEY);
    await store.remove(HISTORY_KEY);
    await store.remove(WATER_KEY);
    await store.remove(RECENT_KEY);
    setMeals(EMPTY_MEALS);
    setHistory({});
    setWater(0);
    setRecent([]);
    setWeights([]);
    setProfile(null);
    setEditingProfile(false);
  };

  const nutrition = Object.values(meals).reduce((acc, meal) => {
    meal.items.forEach(item => {
      acc.kcal += item.kcal; acc.protein += item.protein; acc.carbs += item.carbs; acc.fat += item.fat;
      acc.fiber += (item.fiber||0); acc.calcium += (item.calcium||0); acc.b12 += (item.b12||0);
    });
    return acc;
  }, { kcal:0, protein:0, carbs:0, fat:0, fiber:0, calcium:0, b12:0 });

  const goals = profile || { tdee:2200, protein:140, carbs:220, fat:65, fiber:30, calcium:1000, b12:2.4 };

  // Brief hold while we check storage — avoids flashing the setup screen
  // at a returning user whose profile is about to load.
  if (!loaded) return (
    <div style={{
      fontFamily:"system-ui,-apple-system,sans-serif", background:T.bg,
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center"
    }}>
      <div style={{ textAlign:"center" }}>
        <div style={{
          width:44, height:44, margin:"0 auto 14px", borderRadius:"50%",
          border:`4px solid ${T.border}`, borderTopColor:T.teal,
          animation:"nvspin 0.9s linear infinite"
        }} />
        <div style={{ fontSize:10, fontWeight:700, color:T.teal, letterSpacing:2 }}>{t("appName")}</div>
      </div>
      <style>{`@keyframes nvspin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!profile || editingProfile) return (
    <LangCtx.Provider value={{ lang, t, setLang }}>
    <div style={{ fontFamily:"system-ui,-apple-system,sans-serif", background:T.bg, minHeight:"100vh" }}>
      <LanguageToggle />
      <ProfileSetup
        onComplete={saveProfile}
        existing={editingProfile ? profile : null}
        onCancel={editingProfile ? () => setEditingProfile(false) : null}
      />
    </div>
    </LangCtx.Provider>
  );

  const tabs = [
    { id:"home",     icon:"⚡",  label:t("tab_today")   },
    { id:"meals",    icon:"🍽️", label:t("tab_meals")   },
    { id:"plan",     icon:"🎯",  label:t("tab_plan")    },
    { id:"micros",   icon:"🔬",  label:t("tab_micros")  },
    { id:"history",  icon:"📅",  label:t("tab_history") },
    { id:"weight",   icon:"⚖️",  label:t("tab_weight")  },
  ];

  return (
    <LangCtx.Provider value={{ lang, t, setLang }}>
    <div style={{ fontFamily:"system-ui,-apple-system,sans-serif", background:T.bg, minHeight:"100vh", color:T.textPrimary, maxWidth:430, margin:"0 auto", position:"relative" }}>
      <div style={{ padding:"20px 20px 0", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
        <button onClick={() => setDrawerOpen(true)} style={{
          background:T.card, border:`1px solid ${T.border}`, borderRadius:10,
          color:T.textPrimary, fontSize:18, padding:"7px 11px", cursor:"pointer", lineHeight:1, flexShrink:0
        }}>☰</button>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:11, fontWeight:700, color:T.teal, letterSpacing:1.5 }}>{t("appName")}</div>
          <div style={{ fontSize:18, fontWeight:800, color:T.textPrimary, marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {activeGuide ? (lang === "hi" ? GUIDE_TITLES_HI[activeGuide] || GUIDES[activeGuide].title : GUIDES[activeGuide].title)
              : activeTab==="home"?t("title_today"):activeTab==="meals"?t("title_meals"):activeTab==="plan"?t("title_plan"):activeTab==="micros"?t("title_micros"):activeTab==="history"?t("title_history"):t("title_weight")}
          </div>
        </div>
      </div>

      <div style={{ padding:"20px 20px 110px", overflowY:"auto" }}>

        {activeGuide && <GuideView guide={GUIDES[activeGuide]} guideKey={activeGuide} onBack={() => setActiveGuide(null)} />}

        {!activeGuide && activeTab==="home" && (
          <>
            <div style={{ display:"flex", justifyContent:"center", margin:"8px 0 16px" }}>
              <CalorieRing consumed={nutrition.kcal} goal={goals.tdee} />
            </div>

            {/* Day completion across every tracked nutrient */}
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"14px 16px", marginBottom:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:12 }}>
                <span style={{ fontSize:10, fontWeight:700, color:T.textSecondary, letterSpacing:1 }}>{t("day_completion")}</span>
                <span style={{ fontSize:10, color:T.textMuted }}>
                  {t("targets_met", { n: [
                    nutrition.kcal    >= goals.tdee    * 0.95,
                    nutrition.protein >= goals.protein * 0.95,
                    nutrition.fiber   >= goals.fiber   * 0.95,
                    nutrition.calcium >= goals.calcium * 0.95,
                    nutrition.b12     >= goals.b12     * 0.95,
                  ].filter(Boolean).length })}
                </span>
              </div>

              {[
                [t("calories"), nutrition.kcal,    goals.tdee,    "kcal", T.teal],
                [t("protein"),  nutrition.protein, goals.protein, "g",    T.orange],
                [t("carbs"),    nutrition.carbs,   goals.carbs,   "g",    T.violet],
                [t("fat"),      nutrition.fat,     goals.fat,     "g",    T.amber],
                [t("fiber"),    nutrition.fiber,   goals.fiber,   "g",    T.lime],
                [t("calcium"),  nutrition.calcium, goals.calcium, "mg",   T.sky],
                [t("b12"),      nutrition.b12,     goals.b12,     "μg",   T.pink],
              ].map(([label, val, goal, unit, color], i, arr) => {
                const raw = goal > 0 ? val / goal : 0;
                const over = raw > 1.05;
                const met = raw >= 0.95;
                return (
                  <div key={label} style={{ marginBottom: i < arr.length - 1 ? 10 : 0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:4 }}>
                      <span style={{ fontSize:11, color:T.textSecondary, fontWeight:600 }}>{label}</span>
                      <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                        <span style={{ fontSize:10, fontFamily:"monospace", color:T.textMuted }}>
                          {unit === "kcal" || unit === "mg" ? Math.round(val) : d1(val)} / {goal}{unit === "kcal" ? "" : unit}
                        </span>
                        <span style={{
                          fontSize:12, fontFamily:"monospace", fontWeight:800, minWidth:38, textAlign:"right",
                          color: over ? T.red : met ? T.green : color
                        }}>
                          {Math.round(raw * 100)}%
                        </span>
                      </div>
                    </div>
                    <div style={{ background:T.border, borderRadius:3, height:4, overflow:"hidden" }}>
                      <div style={{
                        width:`${Math.min(raw, 1) * 100}%`, height:"100%", borderRadius:3,
                        background: over ? T.red : met ? T.green : color,
                        transition:"width 0.7s cubic-bezier(.4,0,.2,1)"
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Macro rings — 3 col */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, background:T.card, borderRadius:20, padding:"18px 10px", border:`1px solid ${T.border}`, marginBottom:16 }}>
              <Ring value={nutrition.protein} max={goals.protein} color={T.orange} label={t("protein")} sub={`${d1(nutrition.protein)}/${goals.protein}g`} icon="🥩" />
              <Ring value={nutrition.carbs} max={goals.carbs} color={T.violet} label={t("carbs")} sub={`${d1(nutrition.carbs)}/${goals.carbs}g`} icon="🌾" />
              <Ring value={nutrition.fat} max={goals.fat} color={T.amber} label={t("fat")} sub={`${d1(nutrition.fat)}/${goals.fat}g`} icon="🫒" />
            </div>

            {/* Micro rings — 3 col */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, background:T.card, borderRadius:20, padding:"18px 10px", border:`1px solid ${T.border}`, marginBottom:20 }}>
              <Ring value={nutrition.fiber} max={goals.fiber} color={T.lime} label={t("fiber")} sub={`${d1(nutrition.fiber)}/${goals.fiber}g`} icon="🌿" />
              <Ring value={nutrition.calcium} max={goals.calcium} color={T.sky} label={t("calcium")} sub={`${Math.round(nutrition.calcium)}/${goals.calcium}mg`} icon="🦴" />
              <Ring value={nutrition.b12} max={goals.b12} color={T.pink} label={t("b12")} sub={`${d1(nutrition.b12)}/${goals.b12}μg`} icon="💊" />
            </div>

            {/* Macro bars */}
            <div style={{ display:"flex", gap:8, marginBottom:20 }}>
              <MacroPill label="Protein" value={nutrition.protein} goal={goals.protein} color={T.orange} />
              <MacroPill label="Carbs"   value={nutrition.carbs}   goal={goals.carbs}   color={T.violet} />
              <MacroPill label="Fat"     value={nutrition.fat}     goal={goals.fat}     color={T.amber}  />
            </div>

            <WaterCard glasses={water} onChange={setWater} />

            <RecentRow
              recent={recent}
              mealTarget={mealSlotForTime()}
              onLog={(f) => { addMeal(mealSlotForTime(), [f]); showToast(t("added_toast", { name: foodName(f.name, lang), m: t(mealSlotForTime().toLowerCase()) })); }}
            />

            <WeeklySummary history={history} goals={goals} todayNutrition={nutrition} />

            <Insights nutrition={nutrition} goals={goals} />
          </>
        )}

        {!activeGuide && activeTab==="meals" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {Object.values(meals).map(meal => <MealCard key={meal.name} meal={meal} onAdd={() => setScanner(true)} />)}
          </div>
        )}

        {!activeGuide && activeTab==="plan" && (
          <MealPlanTab nutrition={nutrition} goals={goals} onAddMeal={addMeal} />
        )}

        {!activeGuide && activeTab==="micros" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <MicroCard icon="🌿" label="Fiber"   value={nutrition.fiber}   goal={goals.fiber}   color={T.lime} unit="g"  />
            <MicroCard icon="🦴" label="Calcium" value={nutrition.calcium} goal={goals.calcium} color={T.sky}  unit="mg" />
            <MicroCard icon="💊" label="Vitamin B12" value={nutrition.b12} goal={goals.b12}     color={T.pink} unit="μg" />

            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"16px", marginTop:4 }}>
              <div style={{ fontSize:12, fontWeight:700, color:T.textSecondary, letterSpacing:1, marginBottom:14 }}>{t("good_sources")}</div>
              {[
                ["🌿 Fiber",   T.lime, ["Whole wheat roti","Rajma, chhole","Vegetables","Oats, dalia"]],
                ["🦴 Calcium", T.sky,  ["Milk, curd, paneer","Ragi (nachni)","Sesame seeds","Green leafy veggies"]],
                ["💊 B12",     T.pink, ["Milk & dairy","Eggs","Fortified cereals","B12 supplement (for vegans)"]],
              ].map(([label, color, items]) => (
                <div key={label} style={{ marginBottom:14 }}>
                  <div style={{ fontSize:12, fontWeight:700, color, marginBottom:6 }}>{label}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {items.map(s => (
                      <span key={s} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:6, fontSize:11, color:T.textSecondary, padding:"4px 8px" }}>{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!activeGuide && activeTab==="history" && (
          <CalendarTab
            goals={goals}
            history={history}
            todayNutrition={nutrition}
            weights={weights}
            onExport={exportCSV}
          />
        )}

        {activeTab==="progress_disabled" && (
          <div>
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:20, marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:T.textSecondary, letterSpacing:1, marginBottom:16 }}>{t("macros")}</div>
              <div style={{ display:"flex", justifyContent:"space-around", marginBottom:20 }}>
                <Ring value={nutrition.kcal}    max={goals.tdee}    color={T.teal}   size={90} label="Calories" sub={`${nutrition.kcal}/${goals.tdee}`}         icon="🔥" />
                <Ring value={nutrition.protein} max={goals.protein} color={T.orange} size={90} label="Protein"  sub={`${nutrition.protein}/${goals.protein}g`}   icon="💪" />
              </div>
              <div style={{ display:"flex", justifyContent:"space-around" }}>
                <Ring value={nutrition.carbs} max={goals.carbs} color={T.violet} size={90} label="Carbs" sub={`${nutrition.carbs}/${goals.carbs}g`} icon="🌾" />
                <Ring value={nutrition.fat}   max={goals.fat}   color={T.amber}  size={90} label="Fat"   sub={`${nutrition.fat}/${goals.fat}g`}     icon="🫒" />
              </div>
            </div>
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:20, marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:T.textSecondary, letterSpacing:1, marginBottom:16 }}>{t("micronutrients")}</div>
              <div style={{ display:"flex", justifyContent:"space-around" }}>
                <Ring value={nutrition.fiber}   max={goals.fiber}   color={T.lime} size={90} label="Fiber"   sub={`${nutrition.fiber}/${goals.fiber}g`}       icon="🌿" />
                <Ring value={nutrition.calcium} max={goals.calcium} color={T.sky}  size={90} label="Calcium" sub={`${nutrition.calcium}/${goals.calcium}mg`}   icon="🦴" />
                <Ring value={nutrition.b12}     max={goals.b12}     color={T.pink} size={90} label="B12"     sub={`${nutrition.b12}/${goals.b12}μg`}           icon="💊" />
              </div>
            </div>
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"16px" }}>
              <div style={{ fontSize:12, fontWeight:700, color:T.textSecondary, letterSpacing:1, marginBottom:14 }}>{t("daily_targets")}</div>
              {[
                ["🔥 Calories",`${goals.tdee} kcal`,T.teal],["🥩 Protein",`${goals.protein}g`,T.orange],
                ["🌾 Carbs",`${goals.carbs}g`,T.violet],["🫒 Fat",`${goals.fat}g`,T.amber],
                ["🌿 Fiber",`${goals.fiber}g`,T.lime],["🦴 Calcium",`${goals.calcium}mg`,T.sky],["💊 B12",`${goals.b12}μg`,T.pink],
              ].map(([label,val,color]) => (
                <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${T.border}` }}>
                  <span style={{ fontSize:13, color:T.textPrimary }}>{label}</span>
                  <span style={{ fontSize:13, fontFamily:"monospace", fontWeight:700, color }}>{val}</span>
                </div>
              ))}
              <div style={{ marginTop:12, fontSize:11, color:T.textMuted }}>
                Based on: {profile.weight}kg · {profile.height}cm · {profile.age}y · {profile.activity} · {profile.goal}
              </div>
            </div>
          </div>
        )}

        {!activeGuide && activeTab==="weight" && <WeightTracker weights={weights} setWeights={setWeights} />}
      </div>

      {/* FAB */}
      {!activeGuide && <button onClick={() => setScanner(true)} style={{
        position:"fixed", bottom:80, left:"50%", transform:"translateX(-50%)",
        background:T.teal, border:"none", borderRadius:50, width:60, height:60,
        fontSize:24, cursor:"pointer", boxShadow:`0 0 24px ${T.teal}60`,
        display:"flex", alignItems:"center", justifyContent:"center", zIndex:50
      }}>📷</button>}

      {/* Bottom nav */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:T.surface, borderTop:`1px solid ${T.border}`, display:"flex", zIndex:40 }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setActiveGuide(null); }} style={{ flex:1, background:"none", border:"none", padding:"9px 0 13px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, minWidth:0 }}>
            <span style={{ fontSize:15 }}>{tab.icon}</span>
            <span style={{ fontSize:7.5, fontWeight:700, letterSpacing:0.2, color:(!activeGuide && activeTab===tab.id)?T.teal:T.textMuted }}>{tab.label}</span>
          </button>
        ))}
      </div>

      {scanner && <ScannerModal onClose={() => setScanner(false)} onAddMeal={addMeal} />}

      {toast && (
        <div style={{
          position:"fixed", bottom:88, left:"50%", transform:"translateX(-50%)",
          background:T.surface, border:`1px solid ${T.teal}40`, borderRadius:12,
          padding:"11px 18px", zIndex:250, maxWidth:340, textAlign:"center",
          boxShadow:"0 6px 24px rgba(0,0,0,0.5)"
        }}>
          <span style={{ fontSize:12.5, color:T.textPrimary }}>{toast}</span>
        </div>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSelect={key => setActiveGuide(key)}
        onEditProfile={() => setEditingProfile(true)}
        onReset={resetEverything}
        onExport={exportCSV}
        profile={profile}
      />
    </div>
    </LangCtx.Provider>
  );
}
