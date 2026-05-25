const toxicPatterns = [
  { label: "idiot", pattern: /\bidiot(s)?\b/i, weight: 24, category: "Insult" },
  { label: "stupid", pattern: /\bstupid\b/i, weight: 22, category: "Insult" },
  { label: "dumb", pattern: /\bdumb\b/i, weight: 18, category: "Insult" },
  { label: "moron", pattern: /\bmoron(s)?\b/i, weight: 24, category: "Insult" },
  { label: "loser", pattern: /\bloser(s)?\b/i, weight: 20, category: "Insult" },
  { label: "clown", pattern: /\bclown(s)?\b/i, weight: 13, category: "Insult" },
  { label: "pathetic", pattern: /\bpathetic\b/i, weight: 24, category: "Insult" },
  { label: "worthless", pattern: /\bworthless\b/i, weight: 35, category: "Degrading" },
  { label: "useless", pattern: /\buseless\b/i, weight: 28, category: "Degrading" },
  { label: "trash", pattern: /\b(trash|garbage)\b/i, weight: 22, category: "Degrading" },
  { label: "failure", pattern: /\b(failure|failures)\b/i, weight: 17, category: "Degrading" },
  { label: "hate you", pattern: /\b(i\s+)?hate\s+(you|u|them|him|her)\b/i, weight: 36, category: "Hostility" },
  { label: "shut up", pattern: /\bshut\s+up\b/i, weight: 24, category: "Hostility" },
  { label: "go away", pattern: /\b(go\s+away|leave\s+me\s+alone|get\s+lost)\b/i, weight: 16, category: "Hostility" },
  { label: "nobody likes you", pattern: /\bnobody\s+(likes|cares\s+about)\s+you\b/i, weight: 42, category: "Bullying" },
  { label: "kill threat", pattern: /\b(kill|murder|stab|shoot|hurt|beat)\s+(you|u|them|him|her)\b/i, weight: 65, category: "Threat" },
  { label: "violent wish", pattern: /\bhope\s+(you|u|they|he|she)\s+(die|suffer|get\s+hurt)\b/i, weight: 62, category: "Threat" },
  { label: "self-harm", pattern: /\b(kill\s+myself|hurt\s+myself|end\s+my\s+life|suicide|self\s*harm)\b/i, weight: 70, category: "Self-harm" },
  { label: "die", pattern: /\b(go\s+die|die\s+already|drop\s+dead)\b/i, weight: 64, category: "Threat" },
  { label: "ugly", pattern: /\bugly\b/i, weight: 18, category: "Harassment" },
  { label: "disgusting", pattern: /\bdisgusting\b/i, weight: 22, category: "Harassment" },
  { label: "crazy", pattern: /\b(crazy|psycho|insane)\b/i, weight: 16, category: "Harassment" },
  { label: "mocking", pattern: /\b(no\s+one\s+asked|cry\s+about\s+it|skill\s+issue)\b/i, weight: 18, category: "Mocking" },
  { label: "profanity", pattern: /\b(fuck|fucking|shit|bullshit|asshole|bitch|bastard|damn)\b/i, weight: 22, category: "Profanity" }
];

const sarcasmPatterns = [
  { label: "yeah right", pattern: /\byeah\s+right\b/i, weight: 30 },
  { label: "sure", pattern: /\bsure\b(?=.*\b(because|totally|obviously|you did)\b)/i, weight: 18 },
  { label: "obviously", pattern: /\bobviously\b/i, weight: 16 },
  { label: "great job", pattern: /\b(great|nice|amazing|brilliant)\s+(job|work|going)\b/i, weight: 28 },
  { label: "as if", pattern: /\bas\s+if\b/i, weight: 28 },
  { label: "totally", pattern: /\btotally\b/i, weight: 14 },
  { label: "what a surprise", pattern: /\bwhat\s+a\s+surprise\b/i, weight: 26 },
  { label: "thanks a lot", pattern: /\bthanks\s+a\s+lot\b/i, weight: 18 },
  { label: "ellipsis", pattern: /\.{3,}/, weight: 12 },
  { label: "air quotes", pattern: /"[^"]+"/, weight: 8 }
];

const expandedInsultWords = [
  "annoying",
  "awful",
  "bad",
  "broken",
  "careless",
  "childish",
  "clueless",
  "cruel",
  "delusional",
  "dense",
  "embarrassing",
  "fake",
  "foolish",
  "gross",
  "hopeless",
  "ignorant",
  "immature",
  "incompetent",
  "lazy",
  "mean",
  "messy",
  "nasty",
  "obnoxious",
  "rude",
  "selfish",
  "terrible",
  "toxic",
  "unbearable",
  "unwanted",
  "weak"
];

const expandedNouns = [
  "person",
  "friend",
  "teammate",
  "student",
  "worker",
  "classmate",
  "partner",
  "kid",
  "adult",
  "human",
  "user",
  "member"
];

const directAttackTemplates = [
  "you are {word}",
  "you are so {word}",
  "you are really {word}",
  "you sound {word}",
  "you look {word}",
  "you act {word}",
  "you seem {word}",
  "you became {word}",
  "you make everything {word}",
  "your idea is {word}",
  "your work is {word}",
  "your message is {word}",
  "that was {word}",
  "this is {word}",
  "stop being {word}",
  "why are you {word}",
  "how are you this {word}",
  "such a {word} {noun}",
  "what a {word} {noun}",
  "nobody wants a {word} {noun}",
  "everyone thinks you are {word}",
  "i cannot stand how {word} you are",
  "i am tired of your {word} behavior",
  "you always act {word}",
  "you never stop being {word}",
  "you are completely {word}",
  "you are extremely {word}",
  "you are painfully {word}",
  "you are unbelievably {word}",
  "you are the most {word} {noun}",
  "your behavior is {word}",
  "your attitude is {word}",
  "your response is {word}",
  "your face looks {word}",
  "your voice sounds {word}"
];

const hostilityPhrases = [
  "leave me alone",
  "get lost",
  "go away",
  "do not talk to me",
  "stop talking",
  "nobody asked",
  "nobody cares",
  "you ruin everything",
  "you make things worse",
  "you are not welcome",
  "you do not belong",
  "everyone is better without you",
  "i wish you were gone",
  "i regret knowing you",
  "i cannot stand you",
  "you are a problem",
  "you are the problem",
  "you should be ashamed",
  "you embarrass everyone",
  "you are impossible"
];

const threatVerbs = ["hurt", "hit", "beat", "kick", "punch", "attack", "fight", "smash", "break", "destroy"];
const threatTargets = ["you", "u", "them", "him", "her", "your stuff", "your phone", "your work", "your project", "your things"];
const threatTemplates = [
  "i will {verb} {target}",
  "i want to {verb} {target}",
  "i am going to {verb} {target}",
  "someone should {verb} {target}",
  "you deserve to be {verb}",
  "i hope someone will {verb} {target}",
  "keep talking and i will {verb} {target}",
  "say that again and i will {verb} {target}"
];

const bullyingPhrases = [
  "no one likes you",
  "nobody likes you",
  "everyone hates you",
  "you have no friends",
  "you are alone",
  "you are a joke",
  "people laugh at you",
  "everyone laughs at you",
  "you should quit",
  "you are not good enough",
  "you will never be good enough",
  "you always fail",
  "you ruin the group",
  "you make us look bad",
  "we do not want you here",
  "nobody wants you here",
  "you are not invited",
  "you are excluded",
  "go sit alone",
  "stop trying"
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function phraseToPattern(phrase) {
  return new RegExp(`\\b${escapeRegExp(phrase).replace(/\\ /g, "\\s+")}\\b`, "i");
}

function buildExpandedToxicPatterns() {
  const generated = [];

  expandedInsultWords.forEach((word) => {
    generated.push({ label: word, pattern: phraseToPattern(word), weight: 11, category: "Insult" });
    directAttackTemplates.forEach((template) => {
      expandedNouns.forEach((noun) => {
        const phrase = template.replace("{word}", word).replace("{noun}", noun);
        generated.push({ label: phrase, pattern: phraseToPattern(phrase), weight: 24, category: "Harassment" });
      });
    });
  });

  hostilityPhrases.forEach((phrase) => {
    generated.push({ label: phrase, pattern: phraseToPattern(phrase), weight: 28, category: "Hostility" });
  });

  bullyingPhrases.forEach((phrase) => {
    generated.push({ label: phrase, pattern: phraseToPattern(phrase), weight: 42, category: "Bullying" });
  });

  threatVerbs.forEach((verb) => {
    threatTargets.forEach((target) => {
      threatTemplates.forEach((template) => {
        const phrase = template.replace("{verb}", verb).replace("{target}", target);
        generated.push({ label: `${verb} threat`, pattern: phraseToPattern(phrase), weight: 58, category: "Threat" });
      });
    });
  });

  return generated;
}

const expandedToxicPatterns = buildExpandedToxicPatterns();
const allToxicPatterns = [...toxicPatterns, ...expandedToxicPatterns];
export const expandedToxicPatternCount = expandedToxicPatterns.length;

const complexWords = {
  nevertheless: "still",
  consequently: "so",
  approximately: "about",
  utilize: "use",
  facilitate: "help",
  demonstrate: "show",
  commence: "start",
  terminate: "end",
  sufficient: "enough",
  inadequate: "not enough",
  substantial: "large",
  assistance: "help",
  comprehend: "understand",
  purchase: "buy",
  obtain: "get",
  malicious: "mean",
  hostile: "angry",
  incompetent: "not able to do this well"
};

const safeReplacements = [
  [/\bidiot(s)?|moron(s)?|stupid|dumb|loser(s)?|clown(s)?\b/gi, "person"],
  [/\bworthless|useless|pathetic|trash|garbage|disgusting\b/gi, "not helpful"],
  [/\bshut\s+up\b/gi, "please stop talking for now"],
  [/\b(i\s+)?hate\s+(you|u|them|him|her)\b/gi, "I am very upset"],
  [/\bnobody\s+(likes|cares\s+about)\s+you\b/gi, "I feel ignored"],
  [/\b(kill|murder|stab|shoot|hurt|beat)\s+(you|u|them|him|her)\b/gi, "harm someone"],
  [/\b(go\s+die|die\s+already|drop\s+dead)\b/gi, "please leave me alone"],
  [/\b(i\s+)?(might\s+|may\s+|will\s+|want\s+to\s+)?(kill\s+myself|hurt\s+myself|end\s+my\s+life|self\s*harm)\b/gi, "I may need immediate help"],
  [/\bsuicide\b/gi, "I may need immediate help"],
  [/\b(fuck|fucking|shit|bullshit|asshole|bitch|bastard|damn)\b/gi, ""],
  [/\byeah right,?/gi, "I do not think that is true."],
  [/\bsure,?\s*because/gi, "I disagree because"],
  [/\b(great|nice|amazing|brilliant)\s+(job|work|going)\b/gi, "That did not go well"],
  [/\bobviously\b/gi, "clearly"],
  [/\bas if\b/gi, "I do not think so"],
  [/\btotally\b/gi, ""],
  [/\bwhat a surprise\b/gi, "I expected this"]
];

function normalizeText(input) {
  return input
    .normalize("NFKD")
    .replace(/[@]/g, "a")
    .replace(/[!1|]/g, "i")
    .replace(/[$5]/g, "s")
    .replace(/[0]/g, "o")
    .replace(/[3]/g, "e")
    .replace(/[7]/g, "t")
    .replace(/\s+/g, " ")
    .trim();
}

function compactText(input) {
  return normalizeText(input).replace(/[^a-zA-Z]/g, "").toLowerCase();
}

function spacedPattern(word) {
  return new RegExp(`\\b${word.split("").join("[\\\\W_]*")}\\b`, "i");
}

function findPatternHits(input, patterns) {
  const normalized = normalizeText(input);
  const compact = compactText(input);
  return patterns.filter((item) => {
    if (item.pattern.test(normalized)) return true;
    const simpleLabel = item.label.replace(/[^a-z]/gi, "").toLowerCase();
    return simpleLabel.length > 4 && (compact.includes(simpleLabel) || spacedPattern(simpleLabel).test(normalized));
  });
}

function sentenceCase(text) {
  const trimmed = text.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function unique(items) {
  return [...new Set(items)];
}

export function analyzeTone(input) {
  const normalized = normalizeText(input);
  const toxicHits = findPatternHits(normalized, allToxicPatterns);
  const sarcasmHits = findPatternHits(normalized, sarcasmPatterns);
  const exclamationScore = (input.match(/!/g) ?? []).length;
  const uppercaseWords = input.split(/\s+/).filter((word) => word.length > 2 && word === word.toUpperCase()).length;
  const directYou = /\byou\b/i.test(normalized) ? 8 : 0;
  const repeatedNegatives = (normalized.match(/\b(no|never|always|hate|awful|terrible|bad)\b/gi) ?? []).length * 4;

  const toxicity = Math.min(
    100,
    toxicHits.reduce((sum, item) => sum + item.weight, 0) + exclamationScore * 5 + uppercaseWords * 7 + directYou + repeatedNegatives
  );
  const sarcasm = Math.min(100, sarcasmHits.reduce((sum, item) => sum + item.weight, 0) + (toxicity > 35 ? 8 : 0));
  const categories = unique(toxicHits.map((item) => item.category));
  const highRisk = categories.includes("Threat") || categories.includes("Self-harm");

  return {
    toxicity,
    sarcasm,
    highRisk,
    categories,
    toxicityHits: unique(toxicHits.map((item) => item.label)),
    sarcasmHits: unique(sarcasmHits.map((item) => item.label)),
    label: highRisk
      ? "High-risk harmful language"
      : toxicity > 65
        ? "Harmful or toxic"
        : toxicity > 10
          ? "Possibly harmful"
          : sarcasm > 45
            ? "Possibly sarcastic"
            : "Likely literal"
  };
}

export function simplifyText(input) {
  if (!input.trim()) return "";
  let output = normalizeText(input);
  Object.entries(complexWords).forEach(([complex, simple]) => {
    output = output.replace(new RegExp(`\\b${complex}\\b`, "gi"), simple);
  });

  safeReplacements.forEach(([pattern, replacement]) => {
    output = output.replace(pattern, replacement);
  });

  output = output
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?])/g, "$1")
    .replace(/([.!?]){2,}/g, "$1")
    .trim();

  const sentences = output
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => {
      const words = sentence.split(/\s+/);
      if (words.length <= 18) return sentenceCase(sentence);
      return sentenceCase(`${words.slice(0, 18).join(" ")}.`);
    })
    .filter(Boolean);

  return sentences.join(" ") || "This message may be harmful. Please rewrite it in a calmer and clearer way.";
}
