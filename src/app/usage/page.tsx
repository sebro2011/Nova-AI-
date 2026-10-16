import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/logo";
import {
  MAX_MESSAGE_CHARS,
  MAX_MESSAGES,
  MAX_TOTAL_CHARS,
} from "@/lib/validation/chat";

export const metadata: Metadata = {
  title: "Usage & limits — Nova AI",
  description: "Usage information, request limits and provider notes for Nova AI.",
};

export default function UsagePage() {
  const limits = [
    { label: "Message length", value: `${MAX_MESSAGE_CHARS.toLocaleString()} characters` },
    { label: "Messages per request", value: String(MAX_MESSAGES) },
    { label: "Conversation context size", value: `${MAX_TOTAL_CHARS.toLocaleString()} characters` },
    { label: "Rate limit (default)", value: "20 requests / minute / IP" },
    { label: "Provider timeout (default)", value: "60 seconds" },
  ];

  return (
    <main className="cosmic-bg min-h-dvh">
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <header className="flex items-center gap-3">
          <LogoMark size={36} />
          <h1 className="text-2xl font-semibold tracking-tight text-gradient-nova">
            Usage &amp; limits
          </h1>
        </header>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-ink">English</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-mist">
            <li className="glass rounded-xl px-4 py-3.5">
              Nova AI generates answers with open-weight language models through
              Hugging Face Inference Providers. Availability, pricing and usage
              limits depend on the model and provider the server operator has
              configured — check the current terms on huggingface.co before
              deploying.
            </li>
            <li className="glass rounded-xl px-4 py-3.5">
              Do not rely on model output for medical, legal or financial
              decisions without professional verification. Models can make
              mistakes.
            </li>
            <li className="glass rounded-xl px-4 py-3.5">
              Do not send sensitive personal data (passwords, ID numbers, private
              keys) in messages — conversation context is forwarded to the AI
              provider to produce responses.
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-ink">සිංහල</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-mist">
            <li className="glass rounded-xl px-4 py-3.5">
              Nova AI, Hugging Face Inference Providers හරහා විවෘත-බර භාෂා
              ආකෘති භාවිතා කර පිළිතුරු උත්පාදනය කරයි. ප්‍රවේශ්‍යතාව, මිල ගණන් සහ
              භාවිත සීමා සේවාදායක ක්‍රියාකරු වින්‍යාස කළ ආකෘතිය සහ සැපයුම්කරා මත
              රඳා පවතී — යෙදවීමට පෙර huggingface.co හි වර්තමාන කොන්දේසි පරීක්ෂා කරන්න.
            </li>
            <li className="glass rounded-xl px-4 py-3.5">
              වෛද්‍ය, නීතිමය හෝ මූල්‍ය තීරණ සඳහා වෘත්තීය තහවුරු කිරීමකින් තොරව
              ආකෘති ප්‍රතිදානය මත විශ්වාසය නොතබන්න. ආකෘතිවලට වැරදි සිදු විය හැක.
            </li>
            <li className="glass rounded-xl px-4 py-3.5">
              පණිවිඩවලට සංවේදී පුද්ගලික දත්ත (මුරපද, හැඳුනුම්පත් අංක, පෞද්ගලික
              යතුරු) නොයවන්න — පිළිතුරු සෑදීමට සංවාද සන්දර්භය AI සැපයුම්කරු වෙත
              යොමු වේ.
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-ink">தமிழ்</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-mist">
            <li className="glass rounded-xl px-4 py-3.5">
              Nova AI, Hugging Face Inference Providers வழியாக திறந்த-எடை மொழி
              மாதிரிகளால் பதில்களை உருவாக்குகிறது. கிடைக்கும் தன்மை, விலை மற்றும்
              பயன்பாட்டு வரம்புகள் சேவையக நிர்வாகி கட்டமைத்த மாதிரி மற்றும்
              வழங்குநரைப் பொறுத்தது — வரிசைப்படுத்துவதற்கு முன் huggingface.co இல்
              உள்ள தற்போதைய விதிமுறைகளைச் சரிபார்க்கவும்.
            </li>
            <li className="glass rounded-xl px-4 py-3.5">
              மருத்துவ, சட்ட அல்லது நிதி முடிவுகளுக்கு தொழில்முறை சரிபார்ப்பு
              இல்லாமல் மாதிரி வெளியீட்டை நம்ப வேண்டாம். மாதிரிகள் தவறு செய்யலாம்.
            </li>
            <li className="glass rounded-xl px-4 py-3.5">
              செய்திகளில் முக்கியமான தனிப்பட்ட தரவுகளை (கடவுச்சொற்கள், அடையாள
              எண்கள், தனிப்பட்ட விசைகள்) அனுப்ப வேண்டாம் — பதில்கள் உருவாக
              உரையாடல் சூழல் AI வழங்குநருக்கு அனுப்பப்படுகிறது.
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-ink">Request limits</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-hairline">
            <table className="w-full text-sm">
              <tbody>
                {limits.map((row, index) => (
                  <tr
                    key={row.label}
                    className={index % 2 === 0 ? "bg-surface/40" : ""}
                  >
                    <td className="px-4 py-3 text-mist">{row.label}</td>
                    <td className="px-4 py-3 text-right font-medium text-ink">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-mist-dim">
            Limits are enforced on the server and can be adjusted through
            environment variables (see README). Message content and provider
            tokens are never exposed to the browser.
          </p>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-xl bg-accent-2 px-4 text-sm font-medium text-white hover:bg-accent transition-colors"
          >
            Back to chat
          </Link>
          <Link
            href="/privacy"
            className="inline-flex h-10 items-center rounded-xl border border-hairline-strong px-4 text-sm font-medium text-ink hover:border-accent-2 transition-colors"
          >
            Privacy &amp; data
          </Link>
        </div>
      </div>
    </main>
  );
}
