/**
 * Inline translation of a post — the pipeline and the interface, ahead of the
 * provider.
 *
 * Translating arbitrary text needs a model or a translation API, and which one
 * is a cost decision still open (roadmap v3: a business-tier API against an
 * Indian-language specialist). What is real today:
 *   · the contract every surface calls — `translatePost(id, text, language)`;
 *   · reviewed Hindi for every seeded post, so the demo shows the behaviour on
 *     real words rather than on lorem;
 *   · an honest "unavailable" answer for anything else. It never returns the
 *     original dressed up as a translation.
 * The day a provider lands, only `fromProvider` changes.
 */

export type TranslateLang = { code: string; label: string; english: string; live: boolean };

export const TRANSLATE_LANGS: TranslateLang[] = [
  { code: "hi", label: "हिन्दी", english: "Hindi", live: true },
  { code: "mr", label: "मराठी", english: "Marathi", live: false },
  { code: "ta", label: "தமிழ்", english: "Tamil", live: false },
  { code: "te", label: "తెలుగు", english: "Telugu", live: false },
  { code: "kn", label: "ಕನ್ನಡ", english: "Kannada", live: false },
  { code: "bn", label: "বাংলা", english: "Bengali", live: false },
  { code: "gu", label: "ગુજરાતી", english: "Gujarati", live: false },
];

export type Translation =
  | { ok: true; text: string; lang: TranslateLang; from: "English" }
  | { ok: false; lang: TranslateLang; reason: string };

/* Reviewed Hindi for the seeded posts. **bold** markers are kept so the
   translated post renders with the same emphasis as the original. */
const HI: Record<string, string> = {
  f1: "दूसरी तिमाही शानदार रही — आप सबकी ऊर्जा के लिए धन्यवाद। 💜 अगले हफ़्ते से **वेलबीइंग कैंपेन** शुरू हो रहा है: फ़ोकस वीक, बिना मीटिंग वाले बुधवार और नई बेनिफ़िट्स गाइड। थोड़ा समय अपने लिए निकालिए — आपने यह कमाया है।",
  f2: "ऑनबोर्डिंग फ़्लो को **समय से पहले** शिप करने के लिए पूरी टीम को शाबाशी — दबाव में भी शांत, और काम की गुणवत्ता पर कोई समझौता नहीं। 👏",
  f3: "नया सर्च शिप हो गया — बड़े वर्कस्पेस पर क़रीब **40% तेज़**। वीकेंड में इसे परखने वाले सभी साथियों का शुक्रिया। एक बार सर्च करके देखिए और बताइए क्या खटकता है।",
  f4: "इस तिमाही हम एक नई वेलबीइंग सुविधा जोड़ रहे हैं। **आप सबसे ज़्यादा किसका इस्तेमाल करेंगे?** आपका वोट तय करेगा कि शुरुआत किससे हो।",
  f5: "तारीख़ नोट कर लीजिए — **समर ऑफ़साइट** लौट आया है। दो दिन, एक समुद्र तट, और एक भी स्टैंडअप नहीं। साइन अप कीजिए ताकि हम कमरों की व्यवस्था कर सकें।",
  f6: "इंजीनियरिंग को बेहतर, शांत और तेज़ बनाते हुए तीन साल। अर्जुन के लिए दो शब्द ज़रूर लिखिए 👇",
  f6b: "**लाइन 2 पर 200 दिन, एक भी लॉस्ट-टाइम दुर्घटना नहीं।** यह क़िस्मत नहीं है — यह हर शिफ़्ट में, हर किसी की प्री-स्टार्ट जाँच का नतीजा है। इस टीम पर गर्व है। 🦺",
  f7: "तिमाही को लक्ष्य से 14% ऊपर बंद करने के लिए **वेस्ट टीम** का बहुत-बहुत धन्यवाद — लगातार मेहनत, और पूरे सलीक़े के साथ। 🏆",
  f8: "सालाना **एंगेजमेंट सर्वे** सोमवार से खुलेगा। सिर्फ़ 10 मिनट, पूरी तरह गोपनीय — आपकी राय अगली तिमाही की दिशा तय करती है। लिंक यहीं मिलेगा।",
  f9: "वीकेंड ऑन-कॉल टीम को शाबाशी — रिलीज़ के दौरान आपने हर SLA हरा रखा। 🙌 नए अलर्टिंग डैशबोर्ड ने इसी वीकेंड अपनी क़ीमत वसूल कर दी।",
  "f-ack-1": "**यात्रा और ख़र्च नीति — 1 अक्टूबर से क्या बदल रहा है।** मेट्रो शहरों में होटल की सीमा बढ़ रही है, और ₹500 से ज़्यादा के हर ख़र्च के लिए अब रसीद ज़रूरी होगी। पूरी नीति Knowledge में है। कृपया शुक्रवार तक पुष्टि करें कि आपने इसे पढ़ लिया है।",
  "f-ack-2": "**सोमवार से डॉक 3 पर फ़र्श पर नए निशान होंगे।** फ़ोर्कलिफ़्ट की लेन पीली है और पैदल रास्ता हरा — सिर्फ़ हरे रास्ते पर चलें, और तय जगहों से ही पार करें। अपनी अगली शिफ़्ट से पहले कृपया पुष्टि करें।",
  "f-q-1": "यहाँ मेरा पहला महीना है — घर के इंटरनेट बिल का पैसा वापस कैसे मिलता है? कोई फ़ॉर्म है, या बिल कहीं अटैच करना होता है?",
  f10: "तीसरी मंज़िल का नया कोल्ड ब्रू टैप ख़तरनाक रूप से अच्छा है। बस इतना ही। ☕",
  "fresh-1": "अभी-अभी **आरव** के साथ बिलिंग फ़िक्स शिप किया — साफ़ रोलबैक प्लान, ज़ीरो डाउनटाइम। 👏",
  "fresh-2": "याद रहे: वेलबीइंग सुविधा पर वोटिंग कल बंद हो रही है — अपनी पसंद दर्ज कर दीजिए। 🌿",
  "g-sr-1": "गुरुवार का डेमो: टाइपो टॉलरेंस आ गया है। अब **\"recieve\"** लिखने पर भी receive मिल जाता है, और p95 अब भी 120ms से कम है। रिकॉर्डिंग थ्रेड में है।",
  "g-sr-2": "बीटा ग्रुप के सामने हम कौन-सा रिज़ल्ट लेआउट रखें?",
  "g-sr-3": "फ़ैसला, लिखकर रख दिया है ताकि किसी को दोबारा पूछना न पड़े: हम इंडेक्स लिखते समय ही करेंगे, रात में नहीं। ट्रेड-ऑफ़ और आँकड़े डॉक में हैं।",
  "g-run-1": "शनिवार, सुबह 6 बजे, झील का गेट। हिम्मत वालों के लिए दो चक्कर, समझदारों के लिए एक। उसके बाद चाय। ☕",
  "g-run-2": "बिना रुके पहला 5 किमी। आठ हफ़्ते पहले मैं एक किलोमीटर भी नहीं दौड़ पाती थी। मेरे साथ धीमे दौड़ने वाले हर साथी का शुक्रिया। 🎉",
  "g-wh-1": "डॉक 3 की रैकिंग को मंज़ूरी मिल गई है। नाइट शिफ़्ट: आज रात से आइल C चालू है, स्कैनर चार्ज हैं और हर बे के हिसाब से लेबल लगे हैं।",
  "g-wh-2": "हैंडओवर की एक तरकीब जिसने हमारे बीस मिनट बचाए: शिफ़्ट ख़त्म करने से पहले पैलेट मैप की फ़ोटो ले लीजिए। अगली शिफ़्ट याददाश्त से नहीं, उसी फ़ोटो से शुरू करती है।",
  "g-bk-1": "अक्टूबर की किताब — वोटिंग शुक्रवार को बंद होगी।",
  "g-ft-1": "अगर स्कैनर मुड़े हुए लेबल को नहीं पढ़ रहा, तो उसे 30° झुकाइए और आधा क़दम पीछे हटिए। दस में से नौ बार काम करता है।",
  "g-ob-1": "पिछले बैच का फ़ीडबैक एक पंक्ति में: **लैपटॉप तैयार था, कैलेंडर नहीं।** अब से हम पहले हफ़्ते की 1:1 मीटिंगें पहले से बुक करेंगे।",
};

const SEEDED: Record<string, Record<string, string>> = { hi: HI };

/** Swap this for the provider call. Returns null when there is nothing to call. */
function fromProvider(text: string, lang: TranslateLang): string | null {
  void text; void lang; // the provider call goes here
  return null;
}

export function translatePost(postId: string, text: string, code: string): Translation {
  const lang = TRANSLATE_LANGS.find((l) => l.code === code) ?? TRANSLATE_LANGS[0];
  const seeded = SEEDED[lang.code]?.[postId];
  if (seeded) return { ok: true, text: seeded, lang, from: "English" };
  const live = fromProvider(text, lang);
  if (live) return { ok: true, text: live, lang, from: "English" };
  return {
    ok: false, lang,
    reason: lang.live
      ? "New posts are translated once the translation provider is connected. Seeded posts are translated in this demo."
      : `${lang.english} arrives with the translation provider.`,
  };
}

/* ── beyond the feed: surveys, learning, summaries ─────────────────
   Same contract as posts: seeded Hindi where the demo has it, an honest
   "unavailable" everywhere else. Survey answers are always stored against the
   English question and choice, so results in any language stay comparable. */

/** Hindi for survey questions, choices and the answer scales, keyed by the English. */
const HI_SURVEY: Record<string, string> = {
  // September pulse
  "How has this week been?": "यह हफ़्ता कैसा रहा?",
  "How manageable was your workload?": "आपका काम का बोझ कितना संभालने लायक था?",
  "What got in your way most?": "सबसे ज़्यादा रुकावट किस चीज़ से आई?",
  "Workload": "काम का बोझ",
  "Equipment or tools": "उपकरण या टूल",
  "Unclear priorities": "प्राथमिकताएँ साफ़ नहीं थीं",
  "Support from my manager": "मैनेजर से सहयोग",
  "Something else": "कुछ और",
  "Anything you'd want changed about that?": "इसमें आप क्या बदलना चाहेंगे?",
  "Did you get the support you needed?": "क्या आपको ज़रूरत के मुताबिक़ सहयोग मिला?",
  "Anything that went well worth sharing?": "कुछ अच्छा हुआ जो आप बताना चाहें?",
  // Onboarding check-ins
  "How settled do you feel so far?": "अब तक आप कितना सहज महसूस कर रहे हैं?",
  "Do you know what's expected of you in your first month?": "क्या आपको पता है कि पहले महीने में आपसे क्या अपेक्षा है?",
  "What's been missing?": "किस चीज़ की कमी रही?",
  "A clear plan": "एक साफ़ योजना",
  "Time with my manager": "मैनेजर के साथ समय",
  "Access or equipment": "एक्सेस या उपकरण",
  "Knowing who to ask": "यह पता होना कि किससे पूछें",
  "Tell us a bit more — People will follow up.": "थोड़ा और बताइए — पीपल टीम आपसे संपर्क करेगी।",
  "Anything your buddy or team did that made a difference?": "आपके बडी या टीम ने ऐसा क्या किया जिससे फ़र्क़ पड़ा?",
  // Scales and moods
  "Rough": "बहुत मुश्किल", "Not great": "ठीक नहीं", "Okay": "ठीक-ठाक", "Good": "अच्छा", "Great": "बहुत अच्छा",
  "Strongly disagree": "बिल्कुल असहमत", "Disagree": "असहमत", "Neutral": "न सहमत, न असहमत", "Agree": "सहमत", "Strongly agree": "पूरी तरह सहमत",
  "Not at all": "बिल्कुल नहीं", "A little": "थोड़ा", "Somewhat": "कुछ हद तक", "Mostly": "ज़्यादातर", "Completely": "पूरी तरह",
  // Controls
  "Next": "आगे", "Skip": "छोड़ें", "In your own words — optional": "अपने शब्दों में — ज़रूरी नहीं",
};

/** Hindi for the equipment-handling practice questions. */
const HI_QUIZ: Record<string, { text: string; options: string[]; source: string }> = {
  q1: {
    text: "मशीन चालू करने से पहले, प्री-स्टार्ट सूची में कितनी जाँचें होती हैं?",
    options: ["3", "5", "7", "9"],
    source: "प्री-स्टार्ट सूची में पाँच जाँचें हैं, और मशीन चलाने से पहले पाँचों पूरी होनी चाहिए।",
  },
  q2: {
    text: "सही या ग़लत: कोई भी ऑपरेटर फ़ॉल्ट कोड ख़ुद हटा सकता है।",
    options: ["सही", "ग़लत"],
    source: "फ़ॉल्ट कोड सिर्फ़ योग्य टेक्नीशियन ही हटा सकता है, और वह भी वजह दर्ज करने के बाद।",
  },
  q3: {
    text: "मशीन चलते समय आपको कोई अजीब आवाज़ सुनाई देती है। सबसे पहले क्या करेंगे?",
    options: ["बैच पूरा करें", "लाइन रोकें और रिपोर्ट करें", "शिफ़्ट के अंत में नोट करें", "जाँचने के लिए स्पीड बढ़ाएँ"],
    source: "लाइन तुरंत रोकें और ख़राबी की रिपोर्ट करें; चलती मशीन में ख़ुद वजह ढूँढने की कोशिश न करें।",
  },
};

/** Hindi summaries of the most-read policies — Indian-language summaries ship first. */
const HI_SUMMARY: Record<string, string> = {
  "leave-policy": "हर फ़ुल-टाइम कर्मचारी को साल में 18 सवेतन छुट्टियाँ मिलती हैं — हर महीने 1.5 दिन। सिक लीव (साल में 12) और कैज़ुअल लीव अलग गिनी जाती हैं। छुट्टी Home से या Vadal से पूछकर लें; मंज़ूरी आपके मैनेजर देते हैं। 6 तक बची सवेतन छुट्टियाँ अगले साल जुड़ जाती हैं, बाक़ी 31 दिसंबर को ख़त्म हो जाती हैं। सिक लीव आगे नहीं जुड़ती।",
  "onboarding-week1": "पहला हफ़्ता लोगों और माहौल को समझने का है, काम की रफ़्तार का नहीं। आपको एक बडी मिलेगा, आप अपनी टीम से मिलेंगे और अकाउंट सेट करेंगे। करने के काम: प्रोफ़ाइल और पेरोल की जानकारी भरें, बडी और मैनेजर से 1:1 मिलें, और टीम के काम करने के तरीक़े पढ़ लें।",
  eap: "हमारा EAP मुफ़्त और गोपनीय काउंसलिंग देता है, 24 घंटे हेल्पलाइन के साथ। साल में 4 मेंटल-हेल्थ डे भी मिलते हैं, बिना कोई सवाल पूछे — इन्हें आम छुट्टी की तरह बुक करें।",
};

const langFor = (code: string) => TRANSLATE_LANGS.find((l) => l.code === code) ?? TRANSLATE_LANGS[0];

/** A survey string in the reader's language, or the English when there isn't one. */
export function surveyText(english: string, code: string): { text: string; translated: boolean } {
  const hit = code === "hi" ? HI_SURVEY[english] : undefined;
  return hit ? { text: hit, translated: true } : { text: english, translated: false };
}

/** Whether a whole survey bank has a translation in this language. */
export function surveyAvailable(strings: string[], code: string): boolean {
  return code === "hi" && strings.every((s) => Boolean(HI_SURVEY[s]));
}

export function quizIn(id: string, code: string): { text: string; options: string[]; source: string } | null {
  return code === "hi" ? HI_QUIZ[id] ?? null : null;
}

export function summaryIn(docId: string, code: string): Translation {
  const lang = langFor(code);
  const hit = code === "hi" ? HI_SUMMARY[docId] : undefined;
  if (hit) return { ok: true, text: hit, lang, from: "English" };
  return {
    ok: false, lang,
    reason: lang.live
      ? "A summary of this document is written once the translation provider is connected."
      : `${lang.english} summaries arrive with the translation provider.`,
  };
}
