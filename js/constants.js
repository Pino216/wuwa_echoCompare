// constants.js
// 常量定义

// 声骸词条数据
const SUBSTAT_DATA = {
    "none": { name: "(无)", values: [0] },
    "cr": { name: "暴击率", type: "cr", isPct: true, values: [10.5, 9.9, 9.3, 8.7, 8.1, 7.5, 6.9, 6.3] },
    "cd": { name: "暴击伤害", type: "cd", isPct: true, values: [21.0, 19.8, 18.6, 17.4, 16.2, 15.0, 13.8, 12.6] },
    "atk_pct": { name: "百分比攻击", type: "atk_pct", isPct: true, values: [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4] },
    "atk_flat": { name: "固定攻击", type: "atk_flat", isPct: false, values: [60, 50, 40, 30] },
    "basic": { name: "普攻加成", type: "basic", isPct: true, values: [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4] },
    "heavy": { name: "重击加成", type: "heavy", isPct: true, values: [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4] },
    "skill": { name: "共鸣技能加成", type: "skill", isPct: true, values: [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4] },
    "ult": { name: "共鸣解放加成", type: "ult", isPct: true, values: [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4] },
    "eff": { name: "共鸣效率", type: "other", isPct: true, values: [12.4, 11.6, 10.8, 10.0, 9.2, 8.4, 7.6, 6.8] },
    "hp_pct": { name: "百分比生命", type: "hp_pct", isPct: true, values: [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4] },
    "hp_flat": { name: "固定生命", type: "hp_flat", isPct: false, values: [580, 540, 510, 470, 430, 390, 360, 320] },
    "def_pct": { name: "百分比防御", type: "def_pct", isPct: true, values: [14.7, 13.8, 12.8, 11.8, 10.9, 10.0, 9.0, 8.1] },
    "def_flat": { name: "固定防御", type: "def_flat", isPct: false, values: [70, 60, 50, 40] }
};

// 初始伤害类型配置
const INITIAL_DAMAGE_TYPES = [
    { id: 'all', name: '通用' },
    { id: 'basic', name: '普攻' },
    { id: 'heavy', name: '重击' },
    { id: 'skill', name: '共鸣技能' },
    { id: 'ult', name: '共鸣解放' },
    { id: 'echo', name: '声骸技能' }
];

// BUFF分组颜色调色板（6种颜色）
const GROUP_COLORS = ["#4a6bff", "#ff6b8b", "#4caf50", "#ff9800", "#9c27b0", "#00bcd4"];
const DEFAULT_GROUP_ID = "default";

