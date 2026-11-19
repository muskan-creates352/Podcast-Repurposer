"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Copy, 
  Download, 
  RefreshCw, 
  Edit3, 
  Save, 
  Languages, 
  FileText, 
  MessageCircle, 
  Share2, 
  Send, 
  Mail, 
  FileCode, 
  Video 
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { downloadFile } from "@/lib/utils";

type ContentFormat = 
  | "instagram_caption"
  | "reel_script"
  | "shorts_script"
  | "linkedin_post"
  | "blog_article"
  | "twitter_thread"
  | "show_notes"
  | "seo_titles"
  | "seo_descriptions"
  | "newsletter";

interface FormatDefinition {
  id: ContentFormat;
  name: string;
  category: "Social" | "Video Script" | "Long-Form" | "SEO & Email";
  icon: React.ElementType;
}

const FORMATS: FormatDefinition[] = [
  { id: "instagram_caption", name: "Instagram Caption", category: "Social", icon: MessageCircle },
  { id: "reel_script", name: "Instagram Reel Script", category: "Video Script", icon: Video },
  { id: "shorts_script", name: "YouTube Shorts Script", category: "Video Script", icon: Video },
  { id: "linkedin_post", name: "LinkedIn Authority Post", category: "Social", icon: Share2 },
  { id: "blog_article", name: "Full Blog Article", category: "Long-Form", icon: FileText },
  { id: "twitter_thread", name: "Twitter/X Thread", category: "Social", icon: Send },
  { id: "show_notes", name: "Podcast Show Notes", category: "Long-Form", icon: FileCode },
  { id: "seo_titles", name: "High-CTR SEO Titles", category: "SEO & Email", icon: Sparkles },
  { id: "seo_descriptions", name: "SEO Meta Descriptions", category: "SEO & Email", icon: Sparkles },
  { id: "newsletter", name: "Creator Newsletter", category: "SEO & Email", icon: Mail },
];

const CONTENT_BODIES: Record<ContentFormat, Record<"en" | "hi" | "hinglish", string>> = {
  instagram_caption: {
    en: `Stop treating AI prompts like magic spells. 🪄

If your agentic pipeline fails when processing a 45-minute audio recording, you don't need a longer prompt. You need deterministic state machines.

In our latest podcast episode, we broke down:
✨ Why LangGraph cyclical graphs outscore naive prompts
✨ How to anchor every generated bullet to audio timestamps
✨ The 1-click human-in-the-loop review workflow

Drop a "PODCAST" in the comments and I'll DM you the full show notes! 👇

#AIArchitecture #LangGraph #PodcastRepurposing #CreatorEconomy #TechFounders`,
    hi: `AI प्रॉम्प्ट्स को जादुई मंत्र समझना बंद करें। 🪄

यदि आपका AI पाइपलाइन 45 मिनट के पॉडकास्ट को प्रोसेस करते समय फेल हो रहा है, तो आपको बड़े प्रॉम्प्ट की नहीं, बल्कि डिटर्मिनिस्टिक स्टेट मशीन की जरूरत है।

हमारे नए एपिसोड में हमने समझाया:
✨ सिंगल प्रॉम्प्ट की तुलना में स्टेट मशीन 95% क्यों बेहतर है
✨ हर बुलेट पॉइंट को ऑडियो टाइमस्टैम्प से कैसे लिंक करें
✨ एडिटर्स के लिए 1-क्लिक रिव्यू स्टूडियो

कमेंट में "PODCAST" लिखें, मैं पूरा नोट्स भेज दूँगी! 👇`,
    hinglish: `AI prompts ko jaadu samajhna band karo! 🪄

Agar aapka pipeline lambe podcast par fail hota hai, toh issue prompt me nahi, state management me hai.

Episode me humne cover kiya:
✨ LangGraph 60% se 95% reliability kaise badhata hai
✨ Har generated quote ke sath exact audio timestamp ka link
✨ Review studio jahan human editor 1-click me approve kare

Comment "PODCAST" karo, direct link DM kar dungi! 👇`,
  },
  reel_script: {
    en: `[VISUAL: Fast-paced text overlay with audio waveform]
[HOOK - 00:00 - 00:03]: "Here is why 90% of AI startups fail at audio repurposing."

[BODY - 00:03 - 00:20]:
"They take a 10,000-word transcript and dump it into one giant prompt. The LLM hallucinates timestamps and invents quotes.
Instead, use a 4-agent LangGraph pipeline:
Agent 1 handles Whisper transcription.
Agent 2 scores viral hooks.
Agent 3 writes multi-format content.
And Agent 4 verifies every quote against real audio."

[CTA - 00:20 - 00:30]:
"Save this reel and build grounded AI systems. Link in bio for the blueprint."`,
    hi: `[दृश्य: स्क्रीन पर वेवफॉर्म और बड़ा टेक्स्ट]
[हुक - 00:00 - 00:03]: "90% AI टूल्स पॉडकास्ट रीपर्पस करते समय क्यों फेल होते हैं?"

[बॉडी - 00:03 - 00:20]:
"क्योंकि वो 10,000 शब्दों का ट्रांसक्रिप्ट एक ही प्रॉम्प्ट में डाल देते हैं।
असली तरीका है 4-एजेंट स्टेट मशीन:
पहला एजेंट ऑडियो ट्रांसक्राइब करता है,
दूसरा वायरल क्लिप्स ढूंढता है,
और तीसरा टाइमस्टैम्प्स को असली आवाज़ से चेक करता है।"

[कॉल टू एक्शन - 00:20 - 00:30]:
"इस रील को सेव करें और कमेंट में लिंक चेक करें!"`,
    hinglish: `[VISUAL: Fast cuts + Waveform animation]
[HOOK]: "Yeh galti 90% AI creators karte hain jab wo podcast repurpose karte hain!"

[BODY]:
"Pure 1 ghante ke transcript ko ek prompt me daal dete hain, aur AI fake timestamps banane lagta hai.
Pro developers LangGraph multi-agent architecture use karte hain jahan har quote verifiable audio timestamp se grounded hota hai."

[CTA]:
"Reel save kar lo, full architecture blueprint bio me hai!"`,
  },
  shorts_script: {
    en: `[YOUTUBE SHORTS SCRIPT - 45s]
[00:00 - 00:05] Hook: "Is single-prompt engineering officially dead in 2026?"
[00:05 - 00:25] Core Takeaway: "When handling multi-speaker podcast recordings, state graphs beat prompt chaining by a mile. You get 95%+ deterministic execution."
[00:25 - 00:45] CTA: "Subscribe to AI Podcast Repurposer for full production code."`,
    hi: `[यूट्यूब शॉर्ट्स स्क्रिप्ट - 45 सेकंड]
[00:00 - 00:05] हुक: "क्या 2026 में सिंगल प्रॉम्प्ट इंजीनियरिंग खत्म हो चुकी है?"
[00:05 - 00:25] टेकअवे: "जब मल्टी-स्पीकर ऑडियो होता है, तो स्टेट ग्राफ्स प्रॉम्प्ट चेनिंग से कई गुना बेहतर काम करते हैं।"
[00:25 - 00:45] सीटीए: "पूरा कोड देखने के लिए सब्सक्राइब करें।"`,
    hinglish: `[YOUTUBE SHORTS SCRIPT - 45s]
[00:00 - 00:05] Hook: "Kya single prompt AI sach me outdated ho chuka hai?"
[00:05 - 00:25] Insight: "Long-form podcast me agar aap LangGraph use karte ho, toh reliability 60% se 95% jumps karti hai."
[00:25 - 00:45] CTA: "Channel ko subscribe karo aur repo check karo!"`,
  },
  linkedin_post: {
    en: `The era of single-prompt AI workflows is over.

Last week on Ep. 42 of the podcast, our guests dropped a hard truth:

"The reason why single-prompt LLMs fail in complex workflows is state management. Once you introduce a deterministic graph like LangGraph with clear state cycles, reliability jumps from 60% to over 95%."

Here are 3 rules we use when building production AI media studios:

1. Never present a claim without an exact second-level timestamp.
2. Run highlight extraction and long-form drafting in parallel state nodes.
3. Keep human-in-the-loop review at the center before social distribution.

How are you approaching multi-agent orchestration in your team? Let's discuss in the comments.`,
    hi: `सिंगल प्रॉम्प्ट AI का दौर अब खत्म हो चुका है।

पॉडकास्ट एपिसोड 42 में हमने एक महत्वपूर्ण सच्चाई पर चर्चा की:
जब आप स्टेट मशीन (LangGraph) का उपयोग करते हैं, तो विश्वसनीयता 60% से बढ़कर 95% से अधिक हो जाती है।

3 मुख्य सिद्धांत:
1. हर दावे के साथ सटीक सेकंड-लेवल टाइमस्टैम्प दें।
2. हाइलाइट्स और ब्लॉग्स को पैरेलल स्टेट्स में प्रोसेस करें।
3. पब्लिश करने से पहले ह्यूमन रिव्यू अनिवार्य रखें।`,
    hinglish: `Single-prompt AI workflows ka zamaana ja chuka hai.

Episode 42 me guest ne ek solid reality check diya:
"Jab aap state management introduce karte ho LangGraph ke sath, toh system ki reliability 60% se 95% ho jaati hai."

Hamare 3 golden rules:
1. Exact timestamp citation ke bina koi summary approve mat karo.
2. Parallel multi-agents se 1 ghante ka kaam 60 second me complete karo.
3. Human editor ko 1-click review studio do.`,
  },
  blog_article: {
    en: `# Why State Machines are Replacing Simple Prompts in Production AI

In Episode 42 of the Podcast, we sat down with AI systems architects to uncover why deterministic state machines outperform naive prompt chaining for long-form audio processing.

## 1. Deterministic State Cycles
Single-shot prompts fail when audio spans more than 30 minutes. By decomposing the workload into discrete state nodes—ASR transcription, highlight scoring, and format drafting—errors become localized and repairable.

## 2. Provenance & Factual Grounding
AI trust is built on citations. When an editor reviews a suggested quote, clicking the timestamp citation must instantly seek the original audio for instant human verification.

## 3. The Future of Content Repurposing
Instead of spending 6 hours scrubbing through an audio file, creators can generate blogs, social threads, and short-form scripts within 2 minutes while maintaining editorial integrity.`,
    hi: `# प्रोडक्शन AI में स्टेट मशीनें सरल प्रॉम्प्ट्स की जगह क्यों ले रही हैं

पॉडकास्ट के एपिसोड 42 में हमने चर्चा की कि लम्बी ऑडियो रिकॉर्डिंग्स के लिए स्टेट मशीनें प्रॉम्प्ट चेनिंग से बेहतर क्यों हैं।

## 1. स्टेट साइकल्स और विश्वसनीयता
जब ऑडियो 30 मिनट से अधिक का होता है, तो अलग-अलग एजेंट्स (ट्रांसक्रिप्शन, हाइलाइट्स, ब्लॉग्स) में काम बांटने से एक्यूरेसी 95% तक बढ़ जाती है।

## 2. टाइमस्टैम्प ग्राउंडिंग
हर जेनरेटेड पॉइंट के साथ असली ऑडियो का सेकंड जुड़ा होना चाहिए ताकि एडिटर उसे सुनकर तुरंत वेरिफाई कर सके।`,
    hinglish: `# Production AI me State Machines Simple Prompts ko replace kyun kar rahi hain

Episode 42 me humne dekha ki LangGraph multi-agent workflows long-form podcast repurposing ke liye game-changer kyun hain.

## 1. High Reliability (95%+)
Ek bada prompt likhne ke badle alag-alag specialist agents run karne se reliability maximize hoti hai.

## 2. Timestamp Verification
Editor ko direct clickable timestamps milte hain jisse wo original voice sunkar verify kar sakta hai.`,
  },
  twitter_thread: {
    en: `Most AI repurposing tools hallucinate because they have no anchor to reality. 🎙️

Here is how we built an enterprise multi-agent repurposer using LangGraph & Groq: 🧵👇

1/7 Single prompts fail on 60-min audio files. You need deterministic graphs.
2/7 Agent 1 transcribes with Whisper Large v3 Turbo.
3/7 Agent 2 evaluates viral density and scores hooks 0-100.
4/7 Agent 3 drafts 10 distinct content formats simultaneously.
5/7 Agent 4 verifies every quote against exact audio timestamps.
6/7 Human editors review and approve in a 1-click studio.
7/7 Result: 1 podcast -> 15 distribution assets in under 90 seconds.`,
    hi: `ज़्यादातर AI टूल्स फेक कोट्स बना देते हैं क्योंकि उनके पास ऑडियो का सीधा सबूत नहीं होता। 🎙️

यहाँ जाने हमने LangGraph और Groq से मजबूत सिस्टम कैसे बनाया: 🧵👇

1/5 लम्बे ऑडियो के लिए अलग-अलग एजेंट्स बनाएं।
2/5 हर बात के साथ सही टाइमस्टैम्प जोड़ें।
3/5 1 घंटे का काम 90 सेकंड में पूरा करें।`,
    hinglish: `Zyada tar AI tools hallucinate karte hain kyunki unke paas real timestamps nahi hote. 🎙️

Humne LangGraph aur Groq use karke grounded studio banaya: 🧵👇

1/5 Single prompt fail hota hai, deterministic state machine win karti hai.
2/5 Whisper Turbo se millisecond timestamps milte hain.
3/5 Har quote par click karne se audio us second par jump karti hai.`,
  },
  show_notes: {
    en: `Episode 42: Building Autonomous Multi-Agent AI Systems with LangGraph

Episode Summary:
In this session, we break down why deterministic state machines outperform naive prompt chaining for long-form audio processing.

Timestamps:
[00:00] Intro & Guest Welcome
[04:12] Why Single-Prompt LLM Chains Fail & State Graphs Win
[18:45] Hallucination Control, Provenance & Source Grounding
[32:10] Turning Podcast Archives into Vector Search Engines
[45:30] Wrap-up & Creator Takeaways

Resources Mentioned:
- LangGraph Orchestration Framework
- Groq Cloud API & Whisper Large v3
- AI Podcast Repurposer Production Spec`,
    hi: `एपिसोड 42: ऑटोनॉमस मल्टी-एजेंट AI सिस्टम्स

एपिसोड सारांश:
इस सत्र में हम समझते हैं कि लम्बी बातचीत को रीपर्पस करने के लिए मल्टी-एजेंट सिस्टम क्यों जरूरी है।

महत्वपूर्ण टाइमस्टैम्प्स:
[00:00] परिचय
[04:12] सिंगल प्रॉम्प्ट की सीमाएं
[18:45] टाइमस्टैम्प ग्राउंडिंग और सत्यता
[32:10] वेक्टर सर्च और आर्काइव इंटेलिजेंस`,
    hinglish: `Episode 42: Building Autonomous Multi-Agent AI Systems with LangGraph

Timestamps:
[00:00] Introduction
[04:12] Why Single-Prompt LLM Chains Fail
[18:45] Hallucination Control & Source Grounding
[32:10] Turning Podcast Archives into Vector Search Engines
[45:30] Wrap-up & Creator Takeaways`,
  },
  seo_titles: {
    en: `1. Why State Machines are Replacing Simple Prompts in Production AI
2. How to Build Autonomous Multi-Agent Podcast Repurposing Systems (2026 Guide)
3. 1 Podcast into 10 Assets: The Complete Multi-Agent AI Blueprint
4. Stop Prompt Chaining: How LangGraph Delivers 95% Deterministic AI Output
5. Vector Search for Creators: Turn 2 Years of Audio into Searchable Intelligence`,
    hi: `1. प्रोडक्शन AI में स्टेट मशीनें क्यों जरूरी हैं
2. 1 पॉडकास्ट से 10 वायरल एसेट्स कैसे बनाएं
3. LangGraph और Groq AI का कम्पलीट ब्लूप्रिंट`,
    hinglish: `1. Why State Machines are Replacing Prompts in Production AI
2. 1 Podcast se 10 Viral Assets kaise banayein
3. LangGraph Multi-Agent Architecture for Creators`,
  },
  seo_descriptions: {
    en: `Discover how modern creators repurpose long-form podcast recordings into viral video clips, LinkedIn threads, and SEO blogs using LangGraph multi-agent state machines and Groq Cloud Whisper transcription. Learn how timestamp grounding eliminates AI hallucinations.`,
    hi: `जानिए कैसे आधुनिक क्रिएटर्स LangGraph और Groq AI का उपयोग करके 1 घंटे के पॉडकास्ट को वायरल क्लिप्स, लिंक्डइन पोस्ट्स और ब्लॉग्स में बदलते हैं।`,
    hinglish: `Seekhein kaise creators 1 podcast ko viral clips, LinkedIn posts aur SEO blogs me convert karte hain with exact audio timestamps.`,
  },
  newsletter: {
    en: `Subject: Why we stopped using single AI prompts for our podcast studio

Hey Creators,

If you have ever tried copying a full podcast transcript into ChatGPT and asking for clips and a blog post, you know the pain:
Fake quotes, incorrect timestamps, and generic fluff.

In Episode 42, we dove into the solution:
Deterministic State Graphs (LangGraph).

3 Key Lessons:
1. Break tasks into specialized agents (Transcription, Highlight, Content, Grounding).
2. Never publish a claim without an exact audio timestamp.
3. Keep the editor in control with 1-click approvals.

Check out the full episode studio here: [Link]

Until next week,
The Podcast Repurposer Team`,
    hi: `विषय: हमने अपने पॉडकास्ट के लिए सिंगल AI प्रॉम्प्ट्स का उपयोग क्यों बंद किया

नमस्ते क्रिएटर्स,

यदि आपने कभी पूरे ट्रांसक्रिप्ट को एक साथ AI में डालकर समरी मांगी है, तो आपको पता होगा कि AI गलत टाइमस्टैम्प्स बना देता है।

समाधान:
मल्टी-एजेंट आर्किटेक्चर जहां हर एजेंट की अपनी अलग ज़िम्मेदारी होती है और हर बात को असली ऑडियो से परखा जाता है।

पूरा एपिसोड यहाँ देखें: [लिंक]`,
    hinglish: `Subject: Why single-prompt AI failed for our podcast studio

Hey Creators,

Podcast transcript ko ek single prompt me daal kar viral clips maangna sabse badi galti hai.

Episode 42 me humne dekha ki kaise specialist multi-agents 95% accuracy deliver karte hain with exact audio timestamps.

Studio me check karein: [Link]`,
  },
};

export default function ContentStudioPage() {
  const { showToast } = useToast();

  const [selectedFormat, setSelectedFormat] = useState<ContentFormat>("instagram_caption");
  const [tone, setTone] = useState<"professional" | "engaging" | "provocative" | "casual">("engaging");
  const [language, setLanguage] = useState<"en" | "hi" | "hinglish">("en");
  const [isEditing, setIsEditing] = useState(false);
  const [customText, setCustomText] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const activeFormatDef = FORMATS.find((f) => f.id === selectedFormat) || FORMATS[0];
  const defaultText = CONTENT_BODIES[selectedFormat][language];
  const displayText = customText !== null ? customText : defaultText;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayText);
    showToast("Content copied to clipboard!", "success");
  };

  const handleDownloadMd = () => {
    downloadFile(`${selectedFormat}_${language}.md`, displayText, "text/markdown");
    showToast(`Downloaded ${selectedFormat}.md`, "success");
  };

  const handleDownloadTxt = () => {
    downloadFile(`${selectedFormat}_${language}.txt`, displayText, "text/plain");
    showToast(`Downloaded ${selectedFormat}.txt`, "success");
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
      setCustomText(null);
      showToast(`Regenerated ${activeFormatDef.name} with ${tone} tone (${language.toUpperCase()})`, "success");
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-slide-up pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <span>AI Multi-Format Content Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Generate 10 distribution-ready formats from one podcast episode with customized tone, language, and grounding.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadTxt}
            className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Export .TXT
          </button>
          <button
            type="button"
            onClick={handleDownloadMd}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .MD</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 10 Content Formats Selector (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
            Output Formats (10 Available)
          </span>

          <div className="bg-white dark:bg-[#171E35] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2 space-y-1 shadow-sm">
            {FORMATS.map((fmt) => {
              const Icon = fmt.icon;
              const isSelected = fmt.id === selectedFormat;

              return (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => {
                    setSelectedFormat(fmt.id);
                    setCustomText(null);
                    setIsEditing(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                    isSelected
                      ? "bg-brand-500/15 text-brand-600 dark:text-brand-400 font-semibold shadow-sm ring-1 ring-brand-500/30"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0 text-brand-500" />
                    <span className="truncate">{fmt.name}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 shrink-0 uppercase font-mono">
                    {fmt.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Content Editor & Controls (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Controls Bar: Tone, Language, Actions */}
          <div className="bg-white dark:bg-[#171E35] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
            {/* Tone Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium">Tone:</span>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as typeof tone)}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="engaging">Engaging & Viral</option>
                <option value="professional">Professional & Technical</option>
                <option value="provocative">Contrarian & Provocative</option>
                <option value="casual">Casual & Conversational</option>
              </select>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <Languages className="w-3.5 h-3.5 text-brand-500" />
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl text-xs">
                {(["en", "hi", "hinglish"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setLanguage(lang);
                      setCustomText(null);
                    }}
                    className={`px-2 py-0.5 rounded-lg uppercase font-mono text-[11px] font-medium transition-colors ${
                      language === lang
                        ? "bg-brand-600 text-white font-bold shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {lang === "en" ? "EN" : lang === "hi" ? "HI" : "Hinglish"}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions: Edit, Regenerate, Copy */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`p-2 rounded-xl border text-xs font-medium transition-colors ${
                  isEditing
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                    : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850"
                }`}
                title={isEditing ? "Save Edits" : "Edit Text"}
              >
                {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                disabled={isRegenerating}
                onClick={handleRegenerate}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-brand-500 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors"
                title="Regenerate with Groq AI"
              >
                <RefreshCw className={`w-4 h-4 ${isRegenerating ? "animate-spin text-brand-500" : ""}`} />
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-brand-500 hover:text-white text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            </div>
          </div>

          {/* Main Content Workspace Body */}
          <div className="bg-white dark:bg-[#171E35] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-850">
              <div className="flex items-center gap-2">
                <activeFormatDef.icon className="w-4 h-4 text-brand-500" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {activeFormatDef.name}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                Word Count: ~{displayText.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            {isEditing ? (
              <textarea
                value={displayText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={16}
                className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-sans text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            ) : (
              <div className="p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/60 font-sans text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed select-text">
                {displayText}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
