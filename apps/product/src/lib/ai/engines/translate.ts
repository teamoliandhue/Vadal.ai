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
