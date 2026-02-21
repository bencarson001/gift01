const BASE_QUESTIONS = [
  {
    id: "recipient_name",
    label: "Who is this magical book for?",
    emoji: "🎁",
    placeholder: "e.g. Sarah, Grandad Jim, little Theo...",
    type: "text",
    hint: "Their first name (or nickname!) works best",
  },
  {
    id: "sender_name",
    label: "And who is it from?",
    emoji: "💌",
    placeholder: "e.g. From Emily, The whole family, Your best mate...",
    type: "text",
  },
  {
    id: "relationship",
    label: "What's your relationship to them?",
    emoji: "🤝",
    type: "select",
    options: [
      { value: "partner", label: "Partner / Spouse", emoji: "💑" },
      { value: "parent", label: "Parent", emoji: "👨‍👩‍👧" },
      { value: "child", label: "Son / Daughter", emoji: "👶" },
      { value: "friend", label: "Best Friend", emoji: "🤝" },
      { value: "sibling", label: "Brother / Sister", emoji: "👫" },
      { value: "colleague", label: "Colleague / Boss", emoji: "💼" },
      { value: "grandparent", label: "Grandparent", emoji: "👴" },
      { value: "teacher", label: "Teacher / Mentor", emoji: "📚" },
    ],
  },
  {
    id: "personality",
    label: "How would you describe their personality?",
    emoji: "✨",
    type: "textarea",
    placeholder: "e.g. Always cracking jokes, loves a cuppa, obsessed with gardening, secretly a massive nerd...",
    hint: "The more quirky details, the more magical the book!",
  },
  {
    id: "memories",
    label: "Share a favourite memory or inside joke with them",
    emoji: "💭",
    type: "textarea",
    placeholder: "e.g. That time we got lost in Cornwall and ended up at a llama farm...",
    hint: "These golden details make the book truly personal",
  },
];

const OCCASION_SPECIFIC = {
  birthday: [
    {
      id: "age",
      label: "How old are they turning?",
      emoji: "🎂",
      placeholder: "e.g. 30, 50, 7...",
      type: "text",
    },
    {
      id: "birthday_vibe",
      label: "What vibe should the book have?",
      emoji: "🎭",
      type: "select",
      options: [
        { value: "heartfelt", label: "Heartfelt & emotional", emoji: "🥹" },
        { value: "funny", label: "Funny & cheeky", emoji: "😂" },
        { value: "inspiring", label: "Inspiring & uplifting", emoji: "🌟" },
        { value: "nostalgic", label: "Nostalgic trip down memory lane", emoji: "📷" },
      ],
    },
  ],
  roast: [
    {
      id: "embarrassing_moments",
      label: "Spill the beans — any embarrassing moments?",
      emoji: "😳",
      type: "textarea",
      placeholder: "e.g. Still can't parallel park after 20 years, that karaoke incident in Magaluf...",
      hint: "Don't hold back! The funnier the better 🔥",
    },
    {
      id: "bad_habits",
      label: "Any loveable bad habits worth roasting?",
      emoji: "🔥",
      type: "textarea",
      placeholder: "e.g. Takes 3 hours to get ready, eats crisps like a squirrel hoarding nuts...",
    },
  ],
  kids_adventure: [
    {
      id: "child_age",
      label: "How old is the little adventurer?",
      emoji: "🧒",
      placeholder: "e.g. 4, 7, 10...",
      type: "text",
    },
    {
      id: "favourite_things",
      label: "What do they love? (animals, dinosaurs, space, etc.)",
      emoji: "🦕",
      type: "textarea",
      placeholder: "e.g. Obsessed with unicorns, wants to be an astronaut, loves their pet hamster Mr Whiskers...",
    },
  ],
  couples_love_story: [
    {
      id: "how_met",
      label: "How did you two meet?",
      emoji: "💕",
      type: "textarea",
      placeholder: "e.g. Bumped into each other at a rainy bus stop in Leeds...",
    },
    {
      id: "special_moments",
      label: "What are your most special moments together?",
      emoji: "✨",
      type: "textarea",
      placeholder: "e.g. Our first holiday to Italy, that surprise picnic in the park...",
    },
  ],
  wedding: [
    {
      id: "couple_names",
      label: "What are the couple's names?",
      emoji: "💒",
      placeholder: "e.g. Emma & Jack",
      type: "text",
    },
    {
      id: "wedding_details",
      label: "Any special wedding details to include?",
      emoji: "🌸",
      type: "textarea",
      placeholder: "e.g. Getting married at a vineyard in the Cotswolds, been together since uni...",
    },
  ],
};

const ART_STYLE_QUESTION = {
  id: "art_style",
  label: "Pick an art style for the illustrations",
  emoji: "🎨",
  type: "select",
  options: [
    { value: "watercolour", label: "Watercolour", emoji: "🎨" },
    { value: "cartoon", label: "Fun Cartoon", emoji: "🖍️" },
    { value: "realistic", label: "Realistic", emoji: "📸" },
    { value: "storybook", label: "Classic Storybook", emoji: "📚" },
    { value: "minimalist", label: "Minimalist", emoji: "⚪" },
    { value: "vintage", label: "Vintage", emoji: "🕰️" },
  ],
};

const DEDICATION_QUESTION = {
  id: "dedication",
  label: "Add a personal dedication message (optional)",
  emoji: "✍️",
  type: "textarea",
  placeholder: "e.g. To the most wonderful mum in the world — this one's for you. With all my love, forever and always. x",
  hint: "This will appear on the dedication page at the start of the book",
};

export function getQuestionsForOccasion(occasion) {
  const specificQs = OCCASION_SPECIFIC[occasion] || [];
  return [
    ...BASE_QUESTIONS,
    ...specificQs,
    ART_STYLE_QUESTION,
    DEDICATION_QUESTION,
  ];
}

export { BASE_QUESTIONS, OCCASION_SPECIFIC, ART_STYLE_QUESTION, DEDICATION_QUESTION };