import React, { useState } from "react";

type Lang = "en" | "ne";

type ContentSection = {
  heading: string;
  paragraphs: string[];
};

type LanguageContent = {
  title: string;
  intro: string;
  summaryTitle: string;
  summaryBullets: string[];
  detailsTitle: string;
  sections: ContentSection[];
  kundaliTitle: string;
  kundaliBullets: string[];
  networkTitle: string;
  networkParagraphs: string[];
  accuracyTitle: string;
  accuracyParagraphs: string[];
  securityTitle: string;
  securityParagraphs: string[];
  choicesTitle: string;
  choicesBullets: string[];
  childrenTitle: string;
  openSourceTitle: string;
  openSourceParagraph: string;
  changesTitle: string;
  changesParagraph: string;
  contactTitle: string;
  contactParagraph: string;
  githubLabel: string;
  siteLabel: string;
};

const content: Record<Lang, LanguageContent> = {
  en: {
    title: "Privacy Policy for Nepdate",
    intro:
      "This Privacy Policy explains what Nepdate (the “app”) does with information you provide or that is created while using the app, where that information lives, and the choices you have. Nepdate is free and open source: https://github.com/khumnath/nepdate-web and https://nepdate.khumnath.com.np.",
    summaryTitle: "Core commitments",
    summaryBullets: [
      "No remote collection: Nepdate does not collect analytics, telemetry, crash reports, or any personal or usage data to our servers.",
      "Local-first: All user data created or entered in Nepdate is stored on your device only unless you explicitly export or share it.",
      "Optional web interactions: When you open external web content (for example a streaming radio or map tile), your browser or that third-party service may exchange data directly with that service. Nepdate does not control those exchanges.",
      "Local cache: Nepdate uses a local cache for convenience and faster loading; cached items remain on your device until you clear them or uninstall the app.",
    ],
    detailsTitle: "Details",
    sections: [
      {
        heading: "What data exists and where it lives",
        paragraphs: [
          "User-created data: Calendar events, reminders, notes, preferences, and any profile-like values you enter are stored on your device only.",
          "Temporary/cache data: Images, downloaded calendar files, and transient data used for quick loading are cached locally for convenience and may persist until you clear the cache or uninstall the app.",
          "Network interactions: If you choose to open or play online content (for example, streaming radio), your device or browser will contact the external service and may send standard request information such as IP address and user-agent. Nepdate does not forward, log, or retain that information.",
        ],
      },
    ],
    kundaliTitle: "Kundali page — what we use and why",
    kundaliBullets: [
      "Fields used: If you provide a name, birth date, birth time, and location on the Kundali page, Nepdate uses those inputs only to generate the Kundali display for your device.",
      "Location sources: You may enter location manually or pick it via the app’s map service. The app’s MAO does not have location permission.",
      "Storage: Kundali inputs are saved on your device for convenience so you do not need to re-enter them each time.",
      "Algorithms: Kundali calculations use standard astronomical algorithms to compute planetary positions and produce charts. These algorithms are implemented in the app and run locally on your device.",
    ],
    networkTitle: "Network and third‑party content",
    networkParagraphs: [
      "Browser and third‑party services: Opening external content (radio streams, embedded pages, map tiles) causes your device or browser to contact those services directly. Those services may receive standard network request information such as IP address and user-agent. Nepdate does not forward or retain that information.",
      "Third‑party policies: Review the privacy policies of any third-party service you access from the app before using it.",
    ],
    accuracyTitle: "Data accuracy and liability disclaimer",
    accuracyParagraphs: [
      "Displayed content: Nepdate displays Bikram Sambat dates, Panchanga, and Kundali charts computed from standard astronomical algorithms.",
      "No guarantee of correctness: While we follow established algorithms, Nepdate cannot guarantee 100 percent accuracy. Errors in input data, algorithmic limitations, or external data sources may produce incorrect results.",
      "No responsibility: Nepdate and its developers are not responsible for decisions you make or actions you take based on information displayed by the app. Use the app for informational purposes only and verify important details with qualified experts when appropriate.",
    ],
    securityTitle: "Security and limitations",
    securityParagraphs: [
      "Device security: Your data’s security depends largely on your device protections such as screen lock, OS updates, and device encryption.",
      "No absolute guarantee: We adopt reasonable local storage practices, but no software or device can be guaranteed fully secure.",
    ],
    choicesTitle: "Your choices and controls",
    choicesBullets: [
      "Edit and delete: You can edit or delete Kundali inputs, calendar entries, and cached data inside the app. Uninstalling the app removes its local storage unless your device or backup service preserves it.",
      "Exporting: Any export or share action sends the exported data to the destination you choose; Nepdate does not retain exported copies on our servers.",
      "Notifications: Control reminders and alerts through the app settings and your device settings.",
      "Third‑party content: When you use map or web features, you control whether to proceed and which services to engage.",
    ],
    childrenTitle: "Children",
    openSourceTitle: "Open source and transparency",
    openSourceParagraph:
      "Nepdate is open source and available at https://github.com/khumnath/nepdate-web. You can review the source code to confirm how input, storage, caching, and Kundali calculations are implemented.",
    changesTitle: "Changes to this policy",
    changesParagraph:
      "We may update this policy to reflect technical, legal, or product changes. If changes materially affect how user data is handled we will notify users within the app.",
    contactTitle: "Contact",
    contactParagraph:
      "For questions about this policy, how to clear local data, or to report issues, contact the support address shown in Nepdate’s About screen, use the project page at https://github.com/khumnath/nepdate-web, or email us at mail@khumnath.com.np. Include app version and device model to help us respond.",
    githubLabel: "GitHub",
    siteLabel: "Website",
  },
  ne: {
    title: "Nepdate गोपनीयता नीति",
    intro:
      "यो गोपनीयता नीतिले Nepdate (\"एप\") ले तपाईँले दिएका वा एप प्रयोग गर्दा सिर्जना भएका जानकारीहरू कसरी प्रयोग गर्छ, ती जानकारीहरू कहाँ राखिन्छन्, र तपाईँसँग रहेका विकल्पहरूलाई व्याख्या गर्छ। Nepdate निशुल्क र खुल्ला स्रोत अप्लिकेशन हो: https://github.com/khumnath/nepdate-web र https://nepdate.khumnath.com.np।",
    summaryTitle: "मुख्य प्रतिबद्धताहरु",
    summaryBullets: [
      "रिमोट सङ्कलन नगर्ने: Nepdate ले एनालिटिक्स, टेलिमेट्री, क्र्यास रिपोर्ट, वा कुनै पनि व्यक्तिगत वा प्रयोग डेटा हाम्रो सर्भरहरूमा सङ्कलन गर्दैन।",
      "लोकल–प्रथम: Nepdate मा सिर्जना वा प्रविष्ट गरिएका सबै प्रयोगकर्ता डेटा केवल तपाईँको उपकरणमा मात्र सञ्चालित हुन्छ जबसम्म तपाईँले स्पष्ट रूपमा निर्यात वा साझेदारी गर्नुहुन्न।",
      "वैकल्पिक वेब अन्तरक्रियाहरू: जब तपाईँ बाह्य वेब सामग्री (उदाहरण: स्ट्रिमिङ रेडियो वा नक्सा टाइल) खोल्नुहुन्छ, तपाईँको ब्राउजर वा तेस्रो–पार्टी सेवा सो सेवा सँग प्रत्यक्ष रूपमा डाटा साटासाट गर्न सक्छ। Nepdate यी आदानप्रदानहरू नियन्त्रण गर्दैन।",
      "लोकल क्याश: Nepdate ले छिटो लोड र सुविधाका लागि स्थानीय क्याश प्रयोग गर्छ; क्याश गरिएका वस्तुहरू तपाईँले क्याश मेटाउने वा एप अनइन्स्टल नगरेसम्म तपाईँको उपकरणमै रहन्छ।",
    ],
    detailsTitle: "विवरणहरू",
    sections: [
      {
        heading: "कुन डाटा हुन्छ र कहाँ रहन्छ",
        paragraphs: [
          "प्रयोगकर्ताले बनाएको डाटा: क्यालेन्डर घटनाहरू, रिमाइन्डरहरू, नोटहरू, प्राथमिकताहरू, र तपाईँले प्रविष्ट गर्ने प्रोफाइल–जस्तै मानहरू केवल तपाईँको उपकरणमा मात्र सञ्चित गरिन्छ।",
          "अस्थायी/क्याश डाटा: छविहरू, डाउनलोड गरिएका क्यालेन्डर फाइलहरू, र द्रुत लोडका लागि प्रयोग गरिने अस्थायी डाटाहरू स्थानीय रूपमा क्याश गरिन्छन् र तपाईँले क्याश मेटाउनुहुँदासम्म वा एप अनइन्स्टल नगरेसम्म रहन सक्छन्।",
          "नेटवर्क अन्तरक्रियाहरू: यदि तपाईँ अनलाइन सामग्री (उदाहरण: स्ट्रिमिङ रेडियो) खोल्ने वा प्ले गर्ने छनौट गर्नुहुन्छ भने तपाईँको उपकरण वा ब्राउजरले बाह्य सेवालाई सम्पर्क गर्दा आईपी ठेगाना र युजर–एजेण्ट जस्ता सामान्य अनुरोध जानकारी पठाउन सक्छ। Nepdate त्यो जानकारी अग्रेषित, लग, वा सञ्चित गर्दैन।",
        ],
      },
    ],
    kundaliTitle: "कुण्डली पृष्ठ — हामी के प्रयोग गर्छौ र किन",
    kundaliBullets: [
      "प्रयोग गरिएका फिल्डहरू: यदि तपाईँले नाम, जन्म मिति, जन्म समय, र स्थान कुण्डली पृष्ठमा दिनुहुन्छ भने Nepdate ті इनपुटहरू मात्र तपाईँको उपकरणमा कुण्डली देखाउन प्रयोग गर्छ।",
      "स्थान स्रोतहरू: स्थान तपाईँले म्यानुअल रूपमा प्रविष्ट गर्न सक्नुहुन्छ वा एपको नक्सा सेवाबाट छान्न सक्नुहुन्छ। एपको MAO लाई स्थान अनुमति छैन।",
      "सञ्चयन: सुविधा का लागि कुण्डली इनपुटहरू तपाईँको उपकरणमा सुरक्षित गरिन्छ जसले बारम्बार प्रविष्टि आवश्यक नपरोस्।",
      "एल्गोरिद्महरू: कुण्डली गणनाहरू ग्रहहरूको स्थितिहरू गणना गर्न मानक खगोलीय एल्गोरिद्महरू प्रयोग गर्छन् र ती एल्गोरिद्महरू एपमा कार्यान्वयन गरिएका छन् र स्थानीय रूपमा तपाईँको उपकरणमा चल्छन्।",
    ],
    networkTitle: "नेटवर्क र तेस्रो–पक्ष सामग्री",
    networkParagraphs: [
      "ब्राउजर र तेस्रो–पक्ष सेवाहरू: बाह्य सामग्री (रेडियो स्ट्रिम, एम्बेड गरिएको पेज, नक्सा टाइल) खोल्दा तपाईँको उपकरण वा ब्राउजरले ती सेवाहरूलाई प्रत्यक्ष रूपमा सम्पर्क गर्छ। ती सेवाहरूले आईपी ठेगाना र युजर–एजेण्ट जस्ता सामान्य अनुरोध जानकारी प्राप्त गर्न सक्छन्। Nepdate त्यो जानकारी अग्रेषित वा सञ्चित गर्दैन।",
      "तेस्रो–पक्ष नीतिहरू: एपबाट पहुँच गरिने कुनै पनि तेस्रो–पक्ष सेवाको गोपनीयता नीतिलाई प्रयोग गर्नु अघि समीक्षा गर्नुहोस्।",
    ],
    accuracyTitle: "डाटा सठिकता र दायित्व अस्वीकरण",
    accuracyParagraphs: [
      "प्रदर्शित सामग्री: Nepdate ले बिक्रम संवत मिति, पन्चाङ्ग, र कुण्डली चार्टहरू मानक खगोलीय एल्गोरिद्मबाट गणना गरेर देखाउँछ।",
      "पूर्ण शुद्धताको ग्यारेन्टी छैन: हामी स्थापित एल्गोरिद्महरू अनुसरण गर्छौं भने पनि Nepdate ले १००% शुद्धता ग्यारेन्टी गर्दैन। इनपुट त्रुटि, एल्गोरिद्मिक सीमाहरू, वा बाह्य डाटा स्रोतहरूले गलत परिणाम दिन सक्दछन्।",
      "दायित्व छैन: Nepdate र यसको विकासकर्ताहरू एपले देखाएको जानकारीमा आधारित निर्णयहरू वा कार्यहरूको लागि जिम्मेवार छैनन्। महत्त्वपूर्ण तथ्यहरू योग्य विशेषज्ञसँग जाँच गर्नुहोस्।",
    ],
    securityTitle: "सुरक्षा र सीमाहरू",
    securityParagraphs: [
      "उपकरण सुरक्षा: तपाईँको डाटाको सुरक्षा प्रायः तपाईँको उपकरण सुरक्षाहरू जस्तै स्क्रिन लक, OS अपडेटहरू, र उपकरण इन्क्रिप्शनमा निर्भर गर्दछ।",
      "पूर्ण ग्यारेन्टी छैन: हामीले स्थानीय भण्डारणका लागि समुचित अभ्यास अपनाउँछौं, तर कुनै पनि सफ्टवेयर वा उपकरण पूर्ण रूपमा सुरक्षित हुने ग्यारेन्टी दिइँदैन।",
    ],
    choicesTitle: "तपाईँका विकल्पहरू र नियन्त्रणहरू",
    choicesBullets: [
      "सम्पादन र मेटाउने: तपाईँ एप भित्र कुण्डली इनपुट, क्यालेन्डर प्रविष्टिहरू, र क्याश डाटा सम्पादन वा मेटाउन सक्नुहुन्छ। एप अनइन्स्टल गर्दा यसको स्थानीय भण्डारण हट्छ जबसम्म तपाईँको उपकरण वा ब्याकअप सेवा यसलाई राख्दैन।",
      "निर्यात: कुनै पनि निर्यात वा साझेदारी क्रिया तपाईँले चयन गरेको लक्ष्यतिर पठाइन्छ; Nepdate ले निर्यात गरिएका प्रतिहरू हाम्रो सर्भरमा राख्दैन।",
      "सूचना: रिमाइन्डर र अलर्टहरू एप सेटिङ र तपाईँको उपकरण सेटिङबाट नियन्त्रण गर्नुहोस्।",
      "तेस्रो–पक्ष सामग्री: नक्सा वा वेब सुविधाहरू प्रयोग गर्दा अगाडि बढ्न र कुन सेवाहरूलाई संलग्न गर्ने तपाईँले नियन्त्रण गर्नुहुन्छ।",
    ],
    childrenTitle: "बालबच्चाहरू",
    openSourceTitle: "खुला स्रोत र पारदर्शिता",
    openSourceParagraph:
      "Nepdate खुला स्रोत हो र https://github.com/khumnath/nepdate-web मा उपलब्ध छ। इनपुट, सञ्चयन, क्याशिंग र कुण्डली गणनाहरू कसरी कार्यान्वयन गरिएको छ भनेर स्रोत कोडमा समीक्षा गर्न सक्नुहुन्छ।",
    changesTitle: "नीतिमा हुने परिवर्तनहरू",
    changesParagraph:
      "हामी प्राविधिक, कानूनी, वा उत्पादन परिवर्तनहरू परावर्तित गर्न यो नीति अद्यावधिक गर्न सक्छौँ। यदि परिवर्तनहरूले प्रयोगकर्ता डाटाको ह्यान्डलिङमा महत्वपूर्ण प्रभाव पार्छ भने हामीले प्रयोगकर्ताहरूलाई एप भित्र सूचित गर्नेछौँ।",
    contactTitle: "सम्पर्क",
    contactParagraph:
      "यस नीतिसँग सम्बन्धित प्रश्नहरू, स्थानीय डाटा कसरी मेट्ने, वा समस्याहरू रिपोर्ट गर्न, Nepdate को About स्क्रीनमा देखिने समर्थन ठेगाना प्रयोग गर्नुहोस्, प्रोजेक्ट पृष्ठ https://github.com/khumnath/nepdate-web मा सन्देश पठाउनुहोस्, वा हामीलाई mail@khumnath.com.np मा इमेल गर्नुहोस्। जवाफमा मद्दतका लागि एप भर्सन र डिभाइस मोडेल समावेश गर्नुहोस्।",
    githubLabel: "GitHub",
    siteLabel: "वेबसाइट",
  },
};

export default function PrivacyPage(): JSX.Element {
  const [lang, setLang] = useState<Lang>("en");
  const isNe: boolean = lang === "ne";
  const currentContent: LanguageContent = content[lang];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-start gap-4 sm:items-center sm:justify-between mb-6 flex-col sm:flex-row">
          <div className="w-full sm:w-auto">
            {/* Use currentContent */}
            <h1 className="text-slate-900 text-2xl font-semibold">{currentContent.title}</h1>
            <p className="mt-2 text-sm text-slate-600">{currentContent.intro}</p>
          </div>

          <div className="mt-4 sm:mt-0 flex gap-3">
            <button
              onClick={() => setLang((l: Lang) => (l === "en" ? "ne" : "en"))}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 hover:shadow-sm transition"
              aria-pressed={isNe}
            >
              {isNe ? "English" : "नेपाली"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <article className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="text-lg font-medium text-slate-900">{currentContent.summaryTitle}</h2>
              <ul className="mt-3 space-y-2 list-disc list-inside text-sm text-slate-700">
                {currentContent.summaryBullets.map((b: string, i: number) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </section>

            <section className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="text-lg font-medium text-slate-900">{currentContent.detailsTitle}</h3>
              <div className="mt-3 space-y-4 text-sm text-slate-700">
                {currentContent.sections.map((s: ContentSection, i: number) => (
                  <div key={i}>
                    <h4 className="font-semibold text-slate-800">{s.heading}</h4>
                    <div className="mt-2 space-y-2">
                      {s.paragraphs.map((p: string, j: number) => (
                        <p key={j}>{p}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-slate-100 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-slate-900">{currentContent.kundaliTitle}</h3>
                <ul className="mt-3 space-y-2 list-disc list-inside text-sm text-slate-700">
                  {currentContent.kundaliBullets.map((b: string, i: number) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-slate-900">{currentContent.networkTitle}</h3>
                <div className="mt-3 text-sm text-slate-700 space-y-2">
                  {currentContent.networkParagraphs.map((p: string, i: number) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="text-lg font-medium text-slate-900">{currentContent.accuracyTitle}</h3>
              <div className="mt-3 text-sm text-slate-700 space-y-2">
                {currentContent.accuracyParagraphs.map((p: string, i: number) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-slate-100 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-slate-900">{currentContent.securityTitle}</h3>
                <div className="mt-3 text-sm text-slate-700 space-y-2">
                  {currentContent.securityParagraphs.map((p: string, i: number) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-slate-900">{currentContent.choicesTitle}</h3>
                <ul className="mt-3 space-y-2 list-disc list-inside text-sm text-slate-700">
                  {currentContent.choicesBullets.map((b: string, i: number) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
              <div>
                <h3 className="text-lg font-medium text-slate-900">{currentContent.childrenTitle}</h3>
              </div>

              <div>
                <h3 className="text-lg font-medium text-slate-900">{currentContent.openSourceTitle}</h3>
                <p className="mt-2 text-sm text-slate-700">{currentContent.openSourceParagraph}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-slate-900">{currentContent.changesTitle}</h3>
                <p className="mt-2 text-sm text-slate-700">{currentContent.changesParagraph}</p>
              </div>
            </section>
          </article>

          <aside className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h4 className="text-base font-semibold text-slate-900">{currentContent.contactTitle}</h4>
              <p className="mt-3 text-sm text-slate-700">{currentContent.contactParagraph}</p>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <a
                  href="https://github.com/khumnath/nepdate-web"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-sky-600 hover:bg-sky-50 transition"
                >
                  {currentContent.githubLabel}
                </a>

                <a
                  href="https://nepdate.khumnath.com.np"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-sky-600 hover:bg-sky-50 transition"
                >
                  {currentContent.siteLabel}
                </a>
              </div>

              <div className="mt-3">
                <a
                  href="mailto:mail@khumnath.com.np"
                  className="text-sm text-sky-600 hover:underline"
                >
                  mail@khumnath.com.np
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 text-sm text-slate-600">
              <p>
                {isNe
                  ? "नीति अन्तर्गत कुनै पनि शंका वा सुझावको लागि माथिको सम्पर्क प्रयोग गर्नुहोस्।"
                  : "For any questions or suggestions about this policy, use the contact methods above."}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}