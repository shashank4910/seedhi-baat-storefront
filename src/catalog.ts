export type Language = "Hinglish" | "Hindi";

export interface Book {
  id: string;
  topic: string;
  title: string;
  language: Language;
  description: string;
  accent: string;
  pages: number;
  fileName: string;
  objectKey: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  kind: "single" | "bundle";
  language: Language | "Both";
  badge?: string;
  amount: number;
  currency: "INR";
  bookIds: string[];
}

interface PriceEnv {
  PRICE_SINGLE_PAISE?: string;
  PRICE_LANGUAGE_BUNDLE_PAISE?: string;
  PRICE_COMPLETE_BUNDLE_PAISE?: string;
}

const topics = [
  {
    slug: "manipulation",
    topic: "Boundaries",
    roman: "Manipulation Se Kaise Bachein",
    hindi: "मैनिपुलेशन से कैसे बचें",
    description: "Pressure, guilt, gaslighting aur unfair demands ko pehchaan kar seedha jawab dena.",
    hindiDescription: "दबाव, अपराधबोध, गैसलाइटिंग और अनुचित माँगों को पहचानकर साफ़ जवाब देना।",
    accent: "#c94f6d",
    fileName: "01_Manipulation_Se_Kaise_Bachein.pdf",
    hinglishPages: 19,
    hindiPages: 19,
  },
  {
    slug: "conversation",
    topic: "Conversation",
    roman: "Baat Karna Seekho",
    hindi: "बात करना सीखो",
    description: "Awkward silence se thoughtful sawaal, listening aur natural conversation tak.",
    hindiDescription: "झिझक से आगे बढ़कर अच्छे सवाल, ध्यान से सुनना और सहज बातचीत करना।",
    accent: "#168b83",
    fileName: "02_Baat_Karna_Seekho.pdf",
    hinglishPages: 18,
    hindiPages: 17,
  },
  {
    slug: "people",
    topic: "People",
    roman: "Logon Ko Samajhna Seekho",
    hindi: "लोगों को समझना सीखो",
    description: "Ek incident par nahi, repeated behaviour aur context par logon ko samajhna.",
    hindiDescription: "एक घटना नहीं, बार-बार दिखने वाले व्यवहार और परिस्थिति से लोगों को समझना।",
    accent: "#5965ad",
    fileName: "03_Logon_Ko_Samajhna_Seekho.pdf",
    hinglishPages: 19,
    hindiPages: 19,
  },
  {
    slug: "attraction",
    topic: "Connection",
    roman: "Attraction Aur Connection",
    hindi: "आकर्षण और कनेक्शन",
    description: "Mutual interest, pace, consent aur healthy connection ko practical nazar se dekhna.",
    hindiDescription: "आपसी रुचि, सही रफ़्तार, सहमति और स्वस्थ जुड़ाव को व्यावहारिक नज़र से देखना।",
    accent: "#bd6546",
    fileName: "04_Attraction_Aur_Connection.pdf",
    hinglishPages: 18,
    hindiPages: 17,
  },
  {
    slug: "office",
    topic: "Workplace",
    roman: "Office Mein Apni Baat Kaise Rakhein",
    hindi: "ऑफ़िस में अपनी बात कैसे रखें",
    description: "Meetings, feedback, workload aur difficult colleagues ke liye ready scripts.",
    hindiDescription: "मीटिंग, फीडबैक, काम के बोझ और मुश्किल सहकर्मियों के लिए तैयार वाक्य।",
    accent: "#337053",
    fileName: "05_Office_Mein_Apni_Baat_Kaise_Rakhein.pdf",
    hinglishPages: 19,
    hindiPages: 19,
  },
] as const;

export const BOOKS: Book[] = topics.flatMap((topic) => [
  {
    id: `${topic.slug}-hinglish`,
    topic: topic.topic,
    title: topic.roman,
    language: "Hinglish" as const,
    description: topic.description,
    accent: topic.accent,
    pages: topic.hinglishPages,
    fileName: topic.fileName,
    objectKey: `hinglish/${topic.fileName}`,
  },
  {
    id: `${topic.slug}-hindi`,
    topic: topic.topic,
    title: topic.hindi,
    language: "Hindi" as const,
    description: topic.hindiDescription,
    accent: topic.accent,
    pages: topic.hindiPages,
    fileName: topic.fileName,
    objectKey: `hindi/${topic.fileName}`,
  },
]);

function positivePrice(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function productsFor(env: PriceEnv): Product[] {
  const single = positivePrice(env.PRICE_SINGLE_PAISE, 19_900);
  const languageBundle = positivePrice(env.PRICE_LANGUAGE_BUNDLE_PAISE, 69_900);
  const completeBundle = positivePrice(env.PRICE_COMPLETE_BUNDLE_PAISE, 99_900);
  const hinglishIds = BOOKS.filter((book) => book.language === "Hinglish").map((book) => book.id);
  const hindiIds = BOOKS.filter((book) => book.language === "Hindi").map((book) => book.id);

  return [
    ...BOOKS.map((book) => ({
      id: book.id,
      name: book.title,
      description: book.description,
      kind: "single" as const,
      language: book.language,
      amount: single,
      currency: "INR" as const,
      bookIds: [book.id],
    })),
    {
      id: "bundle-hinglish",
      name: "Hinglish Complete Set",
      description: "Saare 5 practical guides — 500 real-life situations, one library.",
      kind: "bundle",
      language: "Hinglish",
      badge: "Save ₹296",
      amount: languageBundle,
      currency: "INR",
      bookIds: hinglishIds,
    },
    {
      id: "bundle-hindi",
      name: "संपूर्ण हिंदी संग्रह",
      description: "सभी 5 व्यावहारिक गाइड — रोज़मर्रा की 500 स्थितियाँ, एक साथ।",
      kind: "bundle",
      language: "Hindi",
      badge: "₹296 की बचत",
      amount: languageBundle,
      currency: "INR",
      bookIds: hindiIds,
    },
    {
      id: "bundle-complete",
      name: "Complete 10-book Library",
      description: "Every guide in Hinglish and Hindi. Buy once, choose either language anytime.",
      kind: "bundle",
      language: "Both",
      badge: "Best value · Save ₹991",
      amount: completeBundle,
      currency: "INR",
      bookIds: [...hinglishIds, ...hindiIds],
    },
  ];
}

export function findBook(bookId: string): Book | undefined {
  return BOOKS.find((book) => book.id === bookId);
}

export function findProduct(productId: string, env: PriceEnv): Product | undefined {
  return productsFor(env).find((product) => product.id === productId);
}
