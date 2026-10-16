/**
 * UI translations: English (en), Sinhala (si), Tamil (ta).
 * Technical strings stay in English; user-facing copy is localized.
 */
import type { Locale } from "@/lib/types";

export type TranslationKey =
  | "appTagline"
  | "newChat"
  | "chatHistory"
  | "noChatsYet"
  | "rename"
  | "delete"
  | "clearHistory"
  | "settings"
  | "close"
  | "cancel"
  | "confirm"
  | "theme"
  | "themeDark"
  | "themeLight"
  | "themeSystem"
  | "language"
  | "modelSection"
  | "modelLabel"
  | "modelNotConfigured"
  | "modelNotConfiguredHint"
  | "about"
  | "aboutText"
  | "privacyLink"
  | "usageLink"
  | "composerPlaceholder"
  | "send"
  | "stop"
  | "retry"
  | "regenerate"
  | "copyMessage"
  | "copied"
  | "copyCode"
  | "codeCopied"
  | "you"
  | "assistant"
  | "emptyTitle"
  | "emptySubtitle"
  | "suggestion1"
  | "suggestion2"
  | "suggestion3"
  | "suggestion4"
  | "loading"
  | "thinking"
  | "confirmDeleteTitle"
  | "confirmDeleteBody"
  | "confirmClearTitle"
  | "confirmClearBody"
  | "errorTitle"
  | "errorNetwork"
  | "errorBadRequest"
  | "errorRateLimited"
  | "errorNotConfigured"
  | "errorProviderAuth"
  | "errorProviderRateLimited"
  | "errorProviderUnavailable"
  | "errorProviderError"
  | "errorTimeout"
  | "errorInternal"
  | "historyCleared"
  | "storageWarning"
  | "stoppedNotice"
  | "charCount"
  | "mobileMenu"
  | "sidebarToggle"
  | "messagesLabel"
  | "poweredBy"
  | "privacyTitle"
  | "usageTitle"
  | "backToChat";

type Dictionary = Record<TranslationKey, string>;

const en: Dictionary = {
  appTagline: "Your cosmic AI assistant",
  newChat: "New chat",
  chatHistory: "Chats",
  noChatsYet: "No conversations yet",
  rename: "Rename",
  delete: "Delete",
  clearHistory: "Clear history",
  settings: "Settings",
  close: "Close",
  cancel: "Cancel",
  confirm: "Confirm",
  theme: "Theme",
  themeDark: "Cosmic dark",
  themeLight: "Light",
  themeSystem: "System",
  language: "Language",
  modelSection: "AI model",
  modelLabel: "Model",
  modelNotConfigured: "AI provider not configured",
  modelNotConfiguredHint:
    "The server needs HF_TOKEN and HF_MODEL environment variables to answer messages.",
  about: "About",
  aboutText:
    "Nova AI is a multilingual AI chat application (English · සිංහල · தமிழ்) powered by open-weight language models through Hugging Face Inference Providers.",
  privacyLink: "Privacy",
  usageLink: "Usage & limits",
  composerPlaceholder: "Message Nova AI… (Enter to send, Shift+Enter for a new line)",
  send: "Send",
  stop: "Stop",
  retry: "Retry",
  regenerate: "Regenerate",
  copyMessage: "Copy",
  copied: "Copied",
  copyCode: "Copy code",
  codeCopied: "Copied",
  you: "You",
  assistant: "Nova AI",
  emptyTitle: "How can I help you today?",
  emptySubtitle: "Ask anything in Sinhala, Tamil or English.",
  suggestion1: "Explain how neural networks learn — with a simple analogy",
  suggestion2: "Write a Python script that renames files in a folder",
  suggestion3: "Draft a polite email requesting a meeting",
  suggestion4: "සිංහලෙන්: අද දවස සඳහා සැලසුමක් සකස් කරන්න",
  loading: "Loading…",
  thinking: "Nova AI is thinking…",
  confirmDeleteTitle: "Delete conversation?",
  confirmDeleteBody: "This conversation will be permanently removed from this browser.",
  confirmClearTitle: "Clear all conversations?",
  confirmClearBody:
    "Every saved conversation will be permanently removed from this browser. This cannot be undone.",
  errorTitle: "Something went wrong",
  errorNetwork:
    "Network error — check your connection and try again.",
  errorBadRequest: "The request was invalid. Please adjust your message and try again.",
  errorRateLimited: "Too many requests. Please wait a moment and try again.",
  errorNotConfigured:
    "The AI provider is not configured on this server. Add HF_TOKEN and HF_MODEL to the server environment.",
  errorProviderAuth:
    "The server could not authenticate with the AI provider. Please contact the administrator.",
  errorProviderRateLimited:
    "The AI provider is currently rate limited. Please try again shortly.",
  errorProviderUnavailable:
    "The AI provider is currently unavailable. Please try again shortly.",
  errorProviderError: "The AI provider returned an unexpected error. Please try again.",
  errorTimeout: "The AI provider took too long to respond. Please try again.",
  errorInternal: "An unexpected error occurred. Please try again.",
  historyCleared: "Conversation history cleared",
  storageWarning:
    "Browser storage is unavailable or full — new conversations may not survive a refresh.",
  stoppedNotice: "Stopped",
  charCount: "characters",
  mobileMenu: "Open menu",
  sidebarToggle: "Toggle sidebar",
  messagesLabel: "Conversation messages",
  poweredBy: "Powered by open-weight models via Hugging Face Inference Providers",
  privacyTitle: "Privacy & data",
  usageTitle: "Usage & limits",
  backToChat: "Back to chat",
};

const si: Dictionary = {
  appTagline: "ඔබේ විශ්වීය AI සහායකයා",
  newChat: "නව කතාබහක්",
  chatHistory: "කතාබහ",
  noChatsYet: "තවම කතාබහක් නැත",
  rename: "නම වෙනස් කරන්න",
  delete: "මකන්න",
  clearHistory: "ඉතිහාසය මකන්න",
  settings: "සැකසුම්",
  close: "වසන්න",
  cancel: "අවලංගු කරන්න",
  confirm: "තහවුරු කරන්න",
  theme: "තේමාව",
  themeDark: "කොස්මික් අඳුරු",
  themeLight: "ආලෝක",
  themeSystem: "පද්ධතිය",
  language: "භාෂාව",
  modelSection: "AI ආකෘතිය",
  modelLabel: "ආකෘතිය",
  modelNotConfigured: "AI සැපයුම්කරු වින්‍යාස කර නැත",
  modelNotConfiguredHint:
    "පණිවිඩවලට පිළිතුරු දීමට සේවාදායකයේ HF_TOKEN සහ HF_MODEL පරිසර විචල්‍යයන් අවශ්‍ය වේ.",
  about: "පිළිබඳව",
  aboutText:
    "Nova AI යනු Hugging Face Inference Providers හරහා විවෘත-බර භාෂා ආකෘති භාවිතා කරන, බහුභාෂා (English · සිංහල · தமிழ்) AI කතාබහ යෙදුමකි.",
  privacyLink: "පෞද්ගලිකත්වය",
  usageLink: "භාවිතය සහ සීමා",
  composerPlaceholder: "Nova AI වෙත පණිවිඩයක්… (යැවීමට Enter, නව පේළියකට Shift+Enter)",
  send: "යවන්න",
  stop: "නවත්වන්න",
  retry: "නැවත උත්සාහ කරන්න",
  regenerate: "නැවත උත්පාදනය",
  copyMessage: "පිටපත් කරන්න",
  copied: "පිටපත් විය",
  copyCode: "කේතය පිටපත් කරන්න",
  codeCopied: "පිටපත් විය",
  you: "ඔබ",
  assistant: "Nova AI",
  emptyTitle: "අද මම ඔබට කෙසේ උදව් කරමුද?",
  emptySubtitle: "සිංහල, දෙමළ හෝ ඉංග්‍රීසි භාෂාවෙන් ඕනෑම දෙයක් අසන්න.",
  suggestion1: "නියුරල් ජාල ඉගෙන ගන්නේ කෙසේදැයි සරල උපමාවකින් පැහැදිලි කරන්න",
  suggestion2: "ෆෝල්ඩරයක ගොනු නැවත නම් කරන Python විධානයක් ලියන්න",
  suggestion3: "රැස්වීමක් ඉල්ලා සිටින ආචාරශීලී විද්‍යුත් තැපෑලක් ලියන්න",
  suggestion4: "අද දවස සඳහා වැඩ සැලසුමක් සකස් කරන්න",
  loading: "පූරණය වෙමින්…",
  thinking: "Nova AI සිතමින්…",
  confirmDeleteTitle: "කතාබහ මකන්නද?",
  confirmDeleteBody: "මෙම කතාබහ මෙම බ්‍රව්සරයෙන් ස්ථිරවම ඉවත් වේ.",
  confirmClearTitle: "සියලු කතාබහ මකන්නද?",
  confirmClearBody:
    "සුරකින ලද සෑම කතාබහක්ම මෙම බ්‍රව්සරයෙන් ස්ථිරවම ඉවත් වේ. මෙය ආපසු හැරවිය නොහැක.",
  errorTitle: "යම් දෝෂයක් සිදු විය",
  errorNetwork: "ජාල දෝෂයක් — සම්බන්ධතාවය පරීක්ෂා කර නැවත උත්සාහ කරන්න.",
  errorBadRequest: "ඉල්ලීම වලංගු නැත. ඔබේ පණිවිඩය සකසා නැවත උත්සාහ කරන්න.",
  errorRateLimited: "ඉල්ලීම් ඕනෑවට වඩා. මොහොතක් රැඳී සිට නැවත උත්සාහ කරන්න.",
  errorNotConfigured:
    "සේවාදායකයේ AI සැපයුම්කරු වින්‍යාස කර නැත. සේවාදායක පරිසරයට HF_TOKEN සහ HF_MODEL එකතු කරන්න.",
  errorProviderAuth:
    "AI සැපයුම්කරු සමඟ සත්‍යාපනය කිරීමට සේවාදායකයට නොහැකි විය. පරිපාලක අමතන්න.",
  errorProviderRateLimited: "AI සැපයුම්කරු මේ වන විට සීමා කර ඇත. ඉක්මනින් නැවත උත්සාහ කරන්න.",
  errorProviderUnavailable: "AI සැපයුම්කරු මේ වන විට නොමැත. ඉක්මනින් නැවත උත්සාහ කරන්න.",
  errorProviderError: "AI සැපයුම්කරු අනපේක්ෂිත දෝෂයක් ලබා දුන්නේය. නැවත උත්සාහ කරන්න.",
  errorTimeout: "AI සැපයුම්කරු ප්‍රතිචාර දැක්වීමට ගත වූ කාලය දිගය. නැවත උත්සාහ කරන්න.",
  errorInternal: "අනපේක්ෂිත දෝෂයක් සිදු විය. නැවත උත්සාහ කරන්න.",
  historyCleared: "කතාබහ ඉතිහාසය මකා දැමිණි",
  storageWarning:
    "බ්‍රව්සර ගබඩාව නොමැත හෝ පිරී ඇත — නව කතාබහ refresh කිරීමෙන් පසු නොපවතිනු ඇත.",
  stoppedNotice: "නතර කළා",
  charCount: "අක්ෂර",
  mobileMenu: "මෙනුව විවෘත කරන්න",
  sidebarToggle: "පැති තීරුව මාරු කරන්න",
  messagesLabel: "සංවාද පණිවිඩ",
  poweredBy: "Hugging Face Inference Providers හරහා විවෘත-බර ආකෘති මගින් බලගැන්වේ",
  privacyTitle: "පෞද්ගලිකත්වය සහ දත්ත",
  usageTitle: "භාවිතය සහ සීමා",
  backToChat: "කතාබහට ආපසු",
};

const ta: Dictionary = {
  appTagline: "உங்கள் அண்ட AI உதவியாளர்",
  newChat: "புதிய உரையாடல்",
  chatHistory: "உரையாடல்கள்",
  noChatsYet: "இதுவரை உரையாடல்கள் இல்லை",
  rename: "பெயர் மாற்று",
  delete: "நீக்கு",
  clearHistory: "வரலாற்றை அழி",
  settings: "அமைப்புகள்",
  close: "மூடு",
  cancel: "ரத்து செய்",
  confirm: "உறுதிப்படுத்து",
  theme: "தீம்",
  themeDark: "காஸ்மிக் இருள்",
  themeLight: "வெளிச்சம்",
  themeSystem: "கணினி",
  language: "மொழி",
  modelSection: "AI மாதிரி",
  modelLabel: "மாதிரி",
  modelNotConfigured: "AI வழங்குநர் கட்டமைக்கப்படவில்லை",
  modelNotConfiguredHint:
    "செய்திகளுக்கு பதிலளிக்க சேவையகத்தில் HF_TOKEN மற்றும் HF_MODEL சூழல் மாறிகள் தேவை.",
  about: "பற்றி",
  aboutText:
    "Nova AI என்பது Hugging Face Inference Providers மூலம் திறந்த-எடை மொழி மாதிரிகளைப் பயன்படுத்தும் பன்மொழி (English · සිංහල · தமிழ்) AI அரட்டை பயன்பாடு.",
  privacyLink: "தனியுரிமை",
  usageLink: "பயன்பாடு & வரம்புகள்",
  composerPlaceholder: "Nova AI க்கு செய்தி… (அனுப்ப Enter, புதிய வரி Shift+Enter)",
  send: "அனுப்பு",
  stop: "நிறுத்து",
  retry: "மீண்டும் முயற்சி",
  regenerate: "மீண்டும் உருவாக்கு",
  copyMessage: "நகலெடு",
  copied: "நகலெடுக்கப்பட்டது",
  copyCode: "குறியீட்டை நகலெடு",
  codeCopied: "நகலெடுக்கப்பட்டது",
  you: "நீங்கள்",
  assistant: "Nova AI",
  emptyTitle: "இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
  emptySubtitle: "சிங்களம், தமிழ் அல்லது ஆங்கிலத்தில் எதையும் கேளுங்கள்.",
  suggestion1: "நியூரல் நெட்வொர்க்குகள் எப்படி கற்கின்றன என்பதை எளிய உவமையுடன் விளக்கு",
  suggestion2: "கோப்புறையில் உள்ள கோப்புகளை மறுபெயரிடும் Python ஸ்கிரிப்ட் எழுது",
  suggestion3: "கூட்டம் கோரும் மரியாதையான மின்னஞ்சல் வரை",
  suggestion4: "இன்றைய நாளுக்கான வேலைத் திட்டம் தயாரி",
  loading: "ஏற்றுகிறது…",
  thinking: "Nova AI சிந்திக்கிறது…",
  confirmDeleteTitle: "உரையாடலை நீக்கவா?",
  confirmDeleteBody: "இந்த உரையாடல் இந்த உலாவியிலிருந்து நிரந்தரமாக அகற்றப்படும்.",
  confirmClearTitle: "அனைத்து உரையாடல்களையும் அழிக்கவா?",
  confirmClearBody:
    "சேமிக்கப்பட்ட ஒவ்வொரு உரையாடலும் இந்த உலாவியிலிருந்து நிரந்தரமாக அகற்றப்படும். இதைச் செயல்தவிர்க்க முடியாது.",
  errorTitle: "ஏதோ தவறு நடந்தது",
  errorNetwork: "நெட்வொர்க் பிழை — இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
  errorBadRequest: "கோரிக்கை தவறானது. உங்கள் செய்தியைச் சரிசெய்து மீண்டும் முயற்சிக்கவும்.",
  errorRateLimited: "அதிக கோரிக்கைகள். சிறிது நேரம் காத்திருந்து மீண்டும் முயற்சிக்கவும்.",
  errorNotConfigured:
    "சேவையகத்தில் AI வழங்குநர் கட்டமைக்கப்படவில்லை. சேவையக சூழலில் HF_TOKEN மற்றும் HF_MODEL சேர்க்கவும்.",
  errorProviderAuth:
    "AI வழங்குநருடன் அங்கீகரிக்க சேவையகத்தால் முடியவில்லை. நிர்வாகியைத் தொடர்புகொள்ளவும்.",
  errorProviderRateLimited:
    "AI வழங்குநர் தற்போது வரம்பிடப்பட்டுள்ளது. விரைவில் மீண்டும் முயற்சிக்கவும்.",
  errorProviderUnavailable: "AI வழங்குநர் தற்போது கிடைக்கவில்லை. விரைவில் மீண்டும் முயற்சிக்கவும்.",
  errorProviderError: "AI வழங்குநர் எதிர்பாராத பிழையைத் தந்தது. மீண்டும் முயற்சிக்கவும்.",
  errorTimeout: "AI வழங்குநர் பதிலளிக்க அதிக நேரம் எடுத்தது. மீண்டும் முயற்சிக்கவும்.",
  errorInternal: "எதிர்பாராத பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.",
  historyCleared: "உரையாடல் வரலாறு அழிக்கப்பட்டது",
  storageWarning:
    "உலாவி சேமிப்பு கிடைக்கவில்லை அல்லது நிரம்பியுள்ளது — புதிய உரையாடல்கள் புதுப்பித்தலுக்குப் பிறகு நீடிக்காமல் போகலாம்.",
  stoppedNotice: "நிறுத்தப்பட்டது",
  charCount: "எழுத்துகள்",
  mobileMenu: "மெனுவைத் திற",
  sidebarToggle: "பக்கப்பட்டியை மாற்று",
  messagesLabel: "உரையாடல் செய்திகள்",
  poweredBy: "Hugging Face Inference Providers வழியாக திறந்த-எடை மாதிரிகளால் இயக்கப்படுகிறது",
  privacyTitle: "தனியுரிமை & தரவு",
  usageTitle: "பயன்பாடு & வரம்புகள்",
  backToChat: "உரையாடலுக்குத் திரும்பு",
};

const dictionaries: Record<Locale, Dictionary> = { en, si, ta };

export const LOCALES: Array<{ value: Locale; label: string }> = [
  { value: "en", label: "English" },
  { value: "si", label: "සිංහල" },
  { value: "ta", label: "தமிழ்" },
];

export function translate(locale: Locale, key: TranslationKey): string {
  return dictionaries[locale]?.[key] ?? en[key];
}
