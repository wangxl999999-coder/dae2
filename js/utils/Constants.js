const ITEM_TYPES = {
  FRUITS: [
    { id: 'apple', name: '苹果', emoji: '🍎' },
    { id: 'banana', name: '香蕉', emoji: '🍌' },
    { id: 'orange', name: '橙子', emoji: '🍊' },
    { id: 'grape', name: '葡萄', emoji: '🍇' },
    { id: 'watermelon', name: '西瓜', emoji: '🍉' },
    { id: 'strawberry', name: '草莓', emoji: '🍓' },
    { id: 'peach', name: '桃子', emoji: '🍑' },
    { id: 'cherry', name: '樱桃', emoji: '🍒' }
  ],
  ANIMALS: [
    { id: 'cat', name: '猫咪', emoji: '🐱' },
    { id: 'dog', name: '狗狗', emoji: '🐶' },
    { id: 'rabbit', name: '兔子', emoji: '🐰' },
    { id: 'bear', name: '小熊', emoji: '🐻' },
    { id: 'panda', name: '熊猫', emoji: '🐼' },
    { id: 'fox', name: '狐狸', emoji: '🦊' },
    { id: 'lion', name: '狮子', emoji: '🦁' },
    { id: 'tiger', name: '老虎', emoji: '🐯' }
  ],
  TOYS: [
    { id: 'ball', name: '皮球', emoji: '⚽' },
    { id: 'car', name: '汽车', emoji: '🚗' },
    { id: 'robot', name: '机器人', emoji: '🤖' },
    { id: 'doll', name: '娃娃', emoji: '🎎' },
    { id: 'block', name: '积木', emoji: '🧱' },
    { id: 'kite', name: '风筝', emoji: '🪁' },
    { id: 'puzzle', name: '拼图', emoji: '🧩' },
    { id: 'train', name: '火车', emoji: '🚂' }
  ]
};

const ALL_ITEM_TYPES = [
  ...ITEM_TYPES.FRUITS,
  ...ITEM_TYPES.ANIMALS,
  ...ITEM_TYPES.TOYS
];

const LEVELS = [
  {
    id: 1,
    name: '新手入门',
    description: '欢迎来到一起抓大鹅！点击物品放入卡槽，三个相同物品会自动消除。',
    itemCount: 18,
    itemTypes: 6,
    layers: 2,
    showGuide: true,
    targetScore: 100
  },
  {
    id: 2,
    name: '挑战开始',
    description: '难度提升！试试摇晃手机，让底部的物品露出来吧！',
    itemCount: 42,
    itemTypes: 8,
    layers: 4,
    showGuide: false,
    targetScore: 300
  }
];

const PROP_TYPES = {
  REMOVE: {
    id: 'remove',
    name: '移除',
    description: '移除卡槽内1个物品',
    icon: '🗑️',
    count: 2
  },
  SHUFFLE: {
    id: 'shuffle',
    name: '打乱',
    description: '重新排列场景物品',
    icon: '🔄',
    count: 1
  },
  COMPLETE: {
    id: 'complete',
    name: '凑齐',
    description: '自动补齐卡槽内物品为三个并消除',
    icon: '✨',
    count: 1
  }
};

function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export {
  ITEM_TYPES,
  ALL_ITEM_TYPES,
  LEVELS,
  PROP_TYPES,
  shuffleArray,
  deepClone
};
