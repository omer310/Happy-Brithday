// Story text, dialogue, and minigame configuration for the birthday adventure.
// Tone: warm, respectful, playful Sudanese Arabic — this is early days between
// two people who are getting to know each other, not a declaration of love.

export const INTRO_LINES = [
  'يا ساتر... الليلة عيد ميلاد آية!',
  'مشوار كدا عشان نسيت',
]

export const LOCATIONS = [
  {
    id: 'flowers',
    title: 'محل الورد',
    mapLabel: 'الورد',
    npcName: 'الحاجة زينب',
    npcPos: { x: 565, y: 362 },
    imageKey: 'flowerNpc',
    thought: 'داير وردة بتنفع مع آية',
    dialogue: [
      { speaker: 'player', text: 'عندي زولة عيد ميلادها الليلة داير وردة تنفع معاها' },
      { speaker: 'npc', text: 'اختار الوردة البتناسبها' },
 
    ],
    minigame: {
      type: 'choose',
      prompt: 'اختاري... اختار الوردة المناسبة ليها',
      options: [
        { id: 'purple', label: 'بنفسجي', color: '#7c70c2', preview: { kind: 'flower', variant: 'purple' } },
        { id: 'white', label: 'أبيض', color: '#f6f1df', preview: { kind: 'flower', variant: 'white' } },
        { id: 'yellow', label: 'أصفر', color: '#f0c65d', preview: { kind: 'flower', variant: 'yellow' } },
      ],
    },
    thankYou: 'امشي الفرن عشان تشيل الكيكة',
    itemsAwarded: ['flowers'],
  },
  {
    id: 'bakery',
    title: 'الفرن',
    mapLabel: 'الكيكة',
    npcName: 'عمو بتاع الفرن',
    npcPos: { x: 565, y: 362 },
    imageKey: 'bakeryNpc',
    thought: 'همم آية بتحب ياتو كيكة',
    dialogue: [
      { speaker: 'player', text: 'داير كيكة' },
      { speaker: 'npc', text: 'اختار الطعم والزينة' },
    ],
    minigame: {
      type: 'twoStep',
      stepA: {
        prompt: 'اختار الطعمة',
        options: [
          { id: 'chocolate', label: 'شوكولاتة', color: '#7a4b3a', preview: { kind: 'cake', flavor: 'chocolate' } },
          { id: 'vanilla', label: 'فانيلا', color: '#f3e4c2', preview: { kind: 'cake', flavor: 'vanilla' } },
          { id: 'dates', label: 'تمر', color: '#8a5a34', preview: { kind: 'cake', flavor: 'dates' } },
        ],
      },
      stepB: {
        prompt: 'اختار الزينة',
        options: [
          { id: 'candles', label: 'شمعات', color: '#f2cb73', preview: { kind: 'cake', decoration: 'candles' } },
          { id: 'fruit', label: 'فواكه', color: '#e98c98', preview: { kind: 'cake', decoration: 'fruit' } },
          { id: 'nuts', label: 'مكسرات', color: '#c79a5b', preview: { kind: 'cake', decoration: 'nuts' } },
        ],
      },
    },
    thankYou: 'الكيكة جاهزة باقي الهدية بس',
    itemsAwarded: ['cake'],
  },
  {
    id: 'giftstall',
    title: 'محل الهدايا',
    mapLabel: 'الهدية',
    npcName: 'ود الحلة',
    npcPos: { x: 565, y: 362 },
    imageKey: 'giftNpc',
    dialogue: [
      { speaker: 'player', text: 'داير تغليف حق هدية' },
 
      { speaker: 'npc', text: 'اختار لون التغليف الدايرو' },
 
 
    ],
    minigame: {
      type: 'choose',
      prompt: 'اختار لون التغليف',
      options: [
        { id: 'gold', label: 'دهبي', color: '#e6c25c', preview: { kind: 'gift', variant: 'gold' } },
        { id: 'rose', label: 'روز', color: '#e98c98', preview: { kind: 'gift', variant: 'rose' } },
        { id: 'teal', label: 'فيروزي', color: '#3f8d8a', preview: { kind: 'gift', variant: 'teal' } },
      ],
    },
    thankYou: 'الهدية خلاص جاهزة',
    itemsAwarded: ['gift'],
  },
]

export const ITEM_META = {
  flowers: { label: 'الوردة', icon: '✿' },
  cake: { label: 'الكيكة', icon: '♨' },
  gift: { label: 'الهدية', icon: '♡' },
}

export const COURTYARD = {
  id: 'courtyard',
  title: 'الفريج - عند آية',
  mapLabel: 'آية',
  npcName: 'آية',
  npcPos: { x: 640, y: 390 },
  thought: 'كل حاجة جاهزة... نرتبها هنا',
  deliverySlots: [
    { id: 'flowers', x: 465, y: 330 },
    { id: 'cake', x: 527, y: 330 },
    { id: 'gift', x: 589, y: 330 },
  ],
}
