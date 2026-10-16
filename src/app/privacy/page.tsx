import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/logo";

export const metadata: Metadata = {
  title: "Privacy & data — Nova AI",
  description: "How Nova AI handles browser storage, conversation data and provider requests.",
};

const sections = [
  {
    lang: "English",
    items: [
      "Conversation history is stored in your browser's localStorage on this device only. It is not uploaded to any Nova AI server database and is not synced across devices.",
      "Anyone with access to this browser profile can read the stored conversations. Clearing site data (or using “Clear history” in settings) permanently deletes them.",
      "When you send a message, the conversation context is transmitted to the configured AI provider (Hugging Face Inference Providers) to generate a response. The provider's own privacy policy applies to that processing.",
      "Nova AI does not require an account, does not collect personal information, and keeps provider API tokens exclusively on the server. Tokens are never exposed to the browser.",
      "Rate limiting is applied per IP address in server memory to protect against abuse. Server logs avoid recording message content.",
    ],
  },
  {
    lang: "සිංහල",
    items: [
      "කතාබහ ඉතිහාසය ඔබේ බ්‍රව්සරයේ localStorage එකේ, මෙම උපාංගයේ පමණක් ගබඩා වේ. එය කිසිදු Nova AI සේවාදායක දත්ත සමුදායකට උඩුගත නොවන අතර උපාංග අතර සමමුහුර්ත නොවේ.",
      "මෙම බ්‍රව්සර් පැතිකඩට ප්‍රවේශය ඇත෕ෙන් ඕනෑම කෙනෙකුට ගබඩා කළ කතාබහ කියවිය හැක. අඩවි දත්ත මැකීම (හෝ සැකසුම්වල “ඉතිහාසය මකන්න” භාවිතා කිරීම) ඒවා ස්ථිරවම මකා දමයි.",
      "ඔබ පණිවිඩයක් යවන විට, පිළිතුර උත්පාදනය කිරීමට සංවාද සන්දර්භය වින්‍යාස කළ AI සැපයුම්කරු (Hugging Face Inference Providers) වෙත සම්ප්‍රේෂණය වේ. එම සැකසුමට සැපයුම්කරුගේ පෞද්ගලිකත්ව ප්‍රතිපත්තිය අදාළ වේ.",
      "Nova AI ගිණුමක් අවශ්‍ය නොකරයි, පුද්ගලික තොරතුරු එකතු නොකරයි, සහ සැපයුම්කරුගේ API token සේවාදායකයේ පමණක් තබා ගනී. Token කිසිවිටෙක බ්‍රව්සරයට නිරාවරණය නොවේ.",
      "අනිසි භාවිතය වැළැක්වීමට IP ලිපිනයකට අනුව සේවාදායක මතකයේ rate limiting ක්‍රියාත්මක වේ. සේවාදායක ලොගවලට පණිවිඩ අන්තර්ගතය සටහන් නොවේ.",
    ],
  },
  {
    lang: "தமிழ்",
    items: [
      "உரையாடல் வரலாறு உங்கள் உலாவியின் localStorage இல், இந்த சாதனத்தில் மட்டுமே சேமிக்கப்படுகிறது. இது எந்த Nova AI சேவையக தரவுத்தளத்திற்கும் பதிவேற்றப்படுவதில்லை, சாதனங்களுக்கு இடையே ஒத்திசைக்கப்படுவதில்லை.",
      "இந்த உலாவி சுயவிவரத்தை அணுகக்கூடிய யார் வேண்டுமானாலும் சேமிக்கப்பட்ட உரையாடல்களைப் படிக்க முடியும். தள தரவை அழிப்பது (அல்லது அமைப்புகளில் “வரலாற்றை அழி”) அவற்றை நிரந்தரமாக நீக்கும்.",
      "நீங்கள் செய்தி அனுப்பும்போது, பதில் உருவாக்க உரையாடல் சூழல் கட்டமைக்கப்பட்ட AI வழங்குநருக்கு (Hugging Face Inference Providers) அனுப்பப்படுகிறது. அந்த செயலாக்கத்திற்கு வழங்குநரின் தனியுரிமைக் கொள்கை பொருந்தும்.",
      "Nova AI கணக்கு தேவையில்லை, தனிப்பட்ட தகவல்களைச் சேகரிப்பதில்லை, வழங்குநரின் API token ஐ சேவையகத்தில் மட்டும் வைத்திருக்கிறது. token உலாவிக்கு ஒருபோதும் வெளிப்படுத்தப்படுவதில்லை.",
      "துஷ்பிரயோகத்தைத் தடுக்க IP முகவரியின் அடிப்படையில் சேவையக நினைவகத்தில் rate limiting பயன்படுத்தப்படுகிறது. சேவையக பதிவுகள் செய்தி உள்ளடக்கத்தைப் பதிவு செய்வதில்லை.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="cosmic-bg min-h-dvh">
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <header className="flex items-center gap-3">
          <LogoMark size={36} />
          <h1 className="text-2xl font-semibold tracking-tight text-gradient-nova">
            Privacy &amp; data
          </h1>
        </header>
        <p className="mt-4 text-sm leading-relaxed text-mist">
          Nova AI keeps conversations in your browser and talks to a configured AI
          provider to generate answers. This page states exactly what that means.
        </p>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.lang}>
              <h2 className="text-lg font-semibold text-ink">{section.lang}</h2>
              <ul className="mt-4 space-y-3">
                {section.items.map((item) => (
                  <li
                    key={item.slice(0, 32)}
                    className="glass rounded-xl px-4 py-3.5 text-sm leading-relaxed text-mist"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-xl bg-accent-2 px-4 text-sm font-medium text-white hover:bg-accent transition-colors"
          >
            Back to chat
          </Link>
          <Link
            href="/usage"
            className="inline-flex h-10 items-center rounded-xl border border-hairline-strong px-4 text-sm font-medium text-ink hover:border-accent-2 transition-colors"
          >
            Usage &amp; limits
          </Link>
        </div>
      </div>
    </main>
  );
}
