
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
        "hp_pct": { name: "百分比生命", type: "other", isPct: true, values: [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4] },
        "hp_flat": { name: "固定生命", type: "other", isPct: false, values: [580, 540, 510, 470, 430, 390, 360, 320] },
        "def_pct": { name: "百分比防御", type: "other", isPct: true, values: [14.7, 13.8, 12.8, 11.8, 10.9, 10.0, 9.0, 8.1] },
        "def_flat": { name: "固定防御", type: "other", isPct: false, values: [70, 60, 50, 40] }
    };

    // 统一的伤害类型配置
    let DAMAGE_TYPES = [
        { id: 'all', name: '通用' },
        { id: 'basic', name: '普攻' },
        { id: 'heavy', name: '重击' },
        { id: 'skill', name: '共鸣技能' },
        { id: 'ult', name: '共鸣解放' },
        { id: 'echo', name: '声骸技能' }
    ];

    // 自定义伤害类型管理
    function addCustomDamageType() {
        const customId = 'custom_' + Date.now();
        const customName = prompt('请输入自定义伤害类型名称：', '自定义类型');
        if (customName && customName.trim()) {
            DAMAGE_TYPES.push({ id: customId, name: customName.trim() });
            updateAllDamageTypeSelects();
            alert('已添加自定义伤害类型：' + customName.trim());
        }
    }

    function removeCustomDamageType(typeId) {
        if (typeId.startsWith('custom_')) {
            DAMAGE_TYPES = DAMAGE_TYPES.filter(t => t.id !== typeId);
            updateAllDamageTypeSelects();
            alert('已删除自定义伤害类型');
        } else {
            alert('系统默认类型不能删除');
        }
    }

    function showCustomTypes() {
        const customTypes = DAMAGE_TYPES.filter(t => t.id.startsWith('custom_'));
        if (customTypes.length === 0) {
            alert('暂无自定义伤害类型');
            return;
        }
        
        let message = '当前自定义伤害类型：\n\n';
        customTypes.forEach(t => {
            message += `• ${t.name} (ID: ${t.id})\n`;
        });
        message += '\n要删除某个类型，请复制其ID并在控制台中执行：removeCustomDamageType("ID")';
        alert(message);
    }

    function updateAllDamageTypeSelects() {
        // 更新静态加成选择器
        document.querySelectorAll('.s-type').forEach(select => {
            const currentValue = select.value;
            select.innerHTML = DAMAGE_TYPES.map(t => 
                `<option value="${t.id}" ${t.id === currentValue ? 'selected' : ''}>${t.name}</option>`
            ).join('');
        });
        
        // 更新动态Buff选择器
        document.querySelectorAll('.b-type').forEach(select => {
            const currentValue = select.value;
            select.innerHTML = DAMAGE_TYPES.map(t => 
                `<option value="${t.id}" ${t.id === currentValue ? 'selected' : ''}>${t.name}</option>`
            ).join('');
        });
        
        // 更新动作类型选择器
        const actTypeSelect = document.getElementById('act_type');
        if (actTypeSelect) {
            const currentValue = actTypeSelect.value;
            actTypeSelect.innerHTML = DAMAGE_TYPES.map(t => 
                `<option value="${t.id}" ${t.id === currentValue ? 'selected' : ''}>${t.name}</option>`
            ).join('');
        }
        
        // 重新渲染序列
        renderSequence();
        calculate();
    }

    // 添加页面加载时的视觉增强
    window.onload = () => {
        initEchoSelects('echo_a');
        initEchoSelects('echo_b');
        
        // 初始化伤害类型选择器
        updateAllDamageTypeSelects();
        
        sequence = [{ 
            name: "技能演示", 
            mult: 2.5, 
            type: "skill", 
            scaling: "atk",
            activeBuffs: [] 
        }];
        renderSequence();
        calculate();

        // 添加输入框动画效果
        document.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('focus', function() {
                this.style.transform = 'scale(1.02)';
            });
            el.addEventListener('blur', function() {
                this.style.transform = 'scale(1)';
            });
        });

        // 添加欢迎提示
        setTimeout(() => {
            console.log('🎮 鸣潮伤害分析工具已就绪！');
        }, 500);
    };

    let sequence = [];
    let buffPool = [];
    let dmgChart = null;

    function initEchoSelects(id) {
        const container = document.querySelector(`#${id} .substat-container`);
        for(let i=0; i<5; i++) {
            const row = document.createElement('div');
            row.className = 'substat-row';
            let nameSelect = `<select class="sub-name" onchange="updateSubValues(this)">`;
            for(let key in SUBSTAT_DATA) nameSelect += `<option value="${key}">${SUBSTAT_DATA[key].name}</option>`;
            nameSelect += `</select>`;
            row.innerHTML = nameSelect + `<select class="sub-val"><option value="0">0</option></select>`;
            container.appendChild(row);
        }
    }

    function updateSubValues(selectEl) {
        const valSelect = selectEl.parentElement.querySelector('.sub-val');
        const data = SUBSTAT_DATA[selectEl.value];
        valSelect.innerHTML = data.values.map(v => `<option value="${v}">${v}${data.isPct?'%':''}</option>`).join('');
        calculate();
    }

    // --- Buff 核心逻辑 ---
    function addNewBuff() {
        const fixedId = 'b_' + Date.now();
        const typeOptions = DAMAGE_TYPES.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
        const html = `
            <div class="buff-config" data-id="${fixedId}" style="border-left:4px solid #4a6bff; background:rgba(74, 107, 255, 0.1); padding:12px; margin-bottom:10px; border-radius:8px;">
                <div class="input-row">
                    <input type="text" class="b-name" value="新Buff" style="width:80px" oninput="syncBuffNames('${fixedId}', this.value)">
                    <select class="b-cat" onchange="calculate()">
                        <option value="bonus">伤害加成</option>
                        <option value="deepen">伤害加深</option>
                        <option value="atk_pct">攻击%</option>
                        <option value="cr">暴击率</option>
                        <option value="cd">暴击伤害</option>
                        <option value="hp_pct">生命%</option>
                        <option value="def_pct">防御%</option>
                    </select>
                </div>
                <div class="input-row">
                    <select class="b-type" onchange="calculate()">${typeOptions}</select>
                    <input type="number" class="b-val" value="10" style="width:40px" oninput="calculate()">%
                    <button onclick="this.parentElement.parentElement.remove(); renderSequence(); calculate();" style="color:#ff6b8b; background:none; border:none; cursor:pointer; font-size:16px; font-weight:bold;">×</button>
                </div>
            </div>`;
        document.getElementById('buff_pool').insertAdjacentHTML('beforeend', html);
        renderSequence();
    }

    function syncBuffNames(id, newName) {
        document.querySelectorAll(`.chip[data-bid="${id}"]`).forEach(chip => {
            chip.innerText = newName;
        });
        updateBuffPool();
    }

    function updateBuffPool() {
        buffPool = [];
        document.querySelectorAll('.buff-config').forEach(el => {
            buffPool.push({
                id: el.dataset.id,
                name: el.querySelector('.b-name').value,
                cat: el.querySelector('.b-cat').value,
                type: el.querySelector('.b-type').value,
                val: parseFloat(el.querySelector('.b-val').value) / 100
            });
        });
    }

    // --- 动作序列逻辑 ---
function addAction() {
    const name = document.getElementById('act_name').value || "新动作";
    const mult = parseFloat(document.getElementById('act_mult').value) / 100 || 0;
    const type = document.getElementById('act_type').value;

    // 获取新增的基数选择
    const scaling = document.getElementById('act_scaling').value;

    // 将 scaling 存入动作对象中
    sequence.push({
        name,
        mult,
        type,
        scaling, // 存入此字段，runSim 才能读取
        activeBuffs: []
    });

    renderSequence();
    calculate();
}

    function renderSequence() {
        updateBuffPool();
        const container = document.getElementById('action_sequence');
        container.innerHTML = sequence.map((a, i) => {
            // 生成伤害类型选项
            const typeOptions = DAMAGE_TYPES.map(t => 
                `<option value="${t.id}" ${t.id === a.type ? 'selected' : ''}>${t.name}</option>`
            ).join('');
            
            return `
            <div class="action-card" data-index="${i}">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <input type="text" class="action-name" value="${a.name}" style="width: 100px; flex: 1;" 
                           onchange="updateActionName(${i}, this.value)">
                    <input type="number" class="action-mult" value="${(a.mult*100).toFixed(1)}" style="width: 60px;" 
                           onchange="updateActionMult(${i}, this.value)" step="0.1">%
                    <select class="action-type" style="width: 100px;" 
                            onchange="updateActionType(${i}, this.value)">
                        ${typeOptions}
                    </select>
                    <select class="action-scaling" style="width: 80px;" 
                            onchange="updateActionScaling(${i}, this.value)">
                        <option value="atk" ${a.scaling === 'atk' ? 'selected' : ''}>攻击力</option>
                        <option value="hp" ${a.scaling === 'hp' ? 'selected' : ''}>生命值</option>
                        <option value="def" ${a.scaling === 'def' ? 'selected' : ''}>防御力</option>
                    </select>
                    <span style="position:absolute; right:10px; top:10px; cursor:pointer; color:var(--accent)" 
                          onclick="sequence.splice(${i},1);renderSequence();calculate();">×</span>
                </div>
                <div style="margin-top:6px;">
                    ${buffPool.map(b => `
                        <div class="chip ${a.activeBuffs.includes(b.id) ? 'active' : ''}"
                             data-bid="${b.id}" onclick="toggleBuff(${i}, '${b.id}')">
                            ${b.name}
                        </div>
                    `).join('')}
                </div>
            </div>
        `}).join('');
    }

    function updateActionName(index, newName) {
        if (index >= 0 && index < sequence.length) {
            sequence[index].name = newName;
            renderSequence();
            calculate();
        }
    }

    function updateActionMult(index, newMult) {
        if (index >= 0 && index < sequence.length) {
            sequence[index].mult = parseFloat(newMult) / 100;
            renderSequence();
            calculate();
        }
    }

    function updateActionType(index, newType) {
        if (index >= 0 && index < sequence.length) {
            sequence[index].type = newType;
            renderSequence();
            calculate();
        }
    }

    function updateActionScaling(index, newScaling) {
        if (index >= 0 && index < sequence.length) {
            sequence[index].scaling = newScaling;
            renderSequence();
            calculate();
        }
    }

    function toggleBuff(actIdx, buffId) {
        const bIdx = sequence[actIdx].activeBuffs.indexOf(buffId);
        if(bIdx > -1) sequence[actIdx].activeBuffs.splice(bIdx, 1);
        else sequence[actIdx].activeBuffs.push(buffId);
        renderSequence();
        calculate();
    }

    // --- 计算逻辑 ---
function runSim(extraSubs = []) {
    updateBuffPool();

    // 1. 获取基础面板数据
    const baseAtk = parseFloat(document.getElementById('base_atk').value) || 0;
    const totalAtkNow = parseFloat(document.getElementById('total_atk_now').value) || 0;
    const baseHp = parseFloat(document.getElementById('base_hp')?.value) || 0;
    const totalHpNow = parseFloat(document.getElementById('total_hp_now')?.value) || 0;
    const baseDef = parseFloat(document.getElementById('base_def')?.value) || 0;
    const totalDefNow = parseFloat(document.getElementById('total_def_now')?.value) || 0;

    const panelCr = parseFloat(document.getElementById('base_cr').value) / 100 || 0;
    const panelCd = parseFloat(document.getElementById('base_cd').value) / 100 || 0;

    // 2. 固定加成 (来自静态列表)
    // 初始化staticBonusMap，包含所有DAMAGE_TYPES
    let staticBonusMap = { all:0 };
    DAMAGE_TYPES.forEach(t => {
        staticBonusMap[t.id] = 0;
    });
    document.querySelectorAll('.static-bonus-item').forEach(el => {
        const type = el.querySelector('.s-type').value;
        const value = parseFloat(el.querySelector('.s-val').value)/100;
        if (staticBonusMap.hasOwnProperty(type)) {
            staticBonusMap[type] += value;
        } else {
            staticBonusMap[type] = value;
        }
    });

    // 3. 处理副词条加成 (需增加生命和防御属性识别)
    let subValues = { atk_pct: 0, hp_pct: 0, def_pct: 0, cr: 0, cd: 0 };
    // 初始化subBonus，包含所有DAMAGE_TYPES中除了'all'的类型
    // 注意：声骸副词条只包含普攻、重击、共鸣技能、共鸣解放四种类型
    let subBonus = {};
    DAMAGE_TYPES.forEach(t => {
        if (t.id !== 'all') {
            subBonus[t.id] = 0;
        }
    });

    extraSubs.forEach(s => {
        const d = SUBSTAT_DATA[s.key];
        if(!d) return;
        const v = s.val / 100;
        if(subValues[d.type] !== undefined) subValues[d.type] += v;
        else if(subBonus[d.type] !== undefined) subBonus[d.type] += v;
    });

    // 动态初始化typeDmg，包含所有DAMAGE_TYPES中除了'all'的类型
    let typeDmg = {};
    // 初始化typeDmg
    DAMAGE_TYPES.forEach(t => {
        if (t.id !== 'all') {
            typeDmg[t.id] = 0;
        }
    });
    let totalDmg = 0;

    // 4. 遍历动作序列计算
    sequence.forEach(a => {
        // 根据动作设定的基数(scaling)初始化基础值
        let baseStat = baseAtk;
        let currentTotalStat = totalAtkNow;
        let scalingAttrKey = 'atk_pct'; // 对应的百分比Buff分类

        if (a.scaling === 'hp') {
            baseStat = baseHp;
            currentTotalStat = totalHpNow;
            scalingAttrKey = 'hp_pct';
        } else if (a.scaling === 'def') {
            baseStat = baseDef;
            currentTotalStat = totalDefNow;
            scalingAttrKey = 'def_pct';
        }

        let curAttrPct = subValues[scalingAttrKey]; // 当前动作对应属性的副词条加成
        let curCr = panelCr + subValues.cr;
        let curCd = panelCd + subValues.cd;
        let curBonus = 1 + staticBonusMap.all + staticBonusMap[a.type] + (subBonus[a.type] || 0);
        let curDeepen = 1;

        // 5. 应用动态 Buff
        a.activeBuffs.forEach(bid => {
            const b = buffPool.find(x => x.id === bid);
            if(b && (b.type === 'all' || b.type === a.type)) {
                if(b.cat === 'bonus') curBonus += b.val;
                else if(b.cat === 'deepen') curDeepen += b.val;
                else if(b.cat === scalingAttrKey) curAttrPct += b.val; // 仅应用匹配基数的属性Buff
                else if(b.cat === 'cr') curCr += b.val;
                else if(b.cat === 'cd') curCd += b.val;
            }
        });

        // 最终属性计算：当前面板 + (基础属性 * 额外百分比加成)
        const finalScalingValue = currentTotalStat + (baseStat * curAttrPct);
        const critExp = 1 + Math.min(1, curCr) * (curCd - 1);

        // 核心伤害公式
        const dmg = finalScalingValue * a.mult * curBonus * curDeepen * critExp;

        typeDmg[a.type] += dmg;
        totalDmg += dmg;
    });

    return { totalDmg, typeDmg };
}

// --- 伤害组成表格显示 ---
function updateDamageComposition(typeDmg) {
    const container = document.getElementById('damageComposition');
    if (!container) return;
    
    // 计算总伤害
    const total = Object.values(typeDmg).reduce((a, b) => a + b, 0);
    
    // 过滤掉伤害为0的类型
    const damageTypesForTable = DAMAGE_TYPES.filter(t => t.id !== 'all' && (typeDmg[t.id] || 0) > 0);
    
    // 按伤害值降序排序
    damageTypesForTable.sort((a, b) => (typeDmg[b.id] || 0) - (typeDmg[a.id] || 0));
    
    if (damageTypesForTable.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#8b949e; padding:20px;">暂无伤害数据</div>';
        return;
    }
    
    // 创建表格HTML
    let html = `
        <div style="margin-top:20px; border-top:1px solid rgba(139, 69, 19, 0.3); padding-top:15px;">
            <h3 style="margin-top:0; color:#8B4513; font-size:1em;">伤害组成详情</h3>
            <div style="overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; font-size:12px;">
                    <thead>
                        <tr style="background:rgba(139, 69, 19, 0.1);">
                            <th style="padding:8px; text-align:left; border-bottom:2px solid rgba(139, 69, 19, 0.3);">伤害类型</th>
                            <th style="padding:8px; text-align:right; border-bottom:2px solid rgba(139, 69, 19, 0.3);">伤害值</th>
                            <th style="padding:8px; text-align:right; border-bottom:2px solid rgba(139, 69, 19, 0.3);">占比</th>
                            <th style="padding:8px; text-align:right; border-bottom:2px solid rgba(139, 69, 19, 0.3);">累计占比</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    let cumulativePercentage = 0;
    damageTypesForTable.forEach((type, index) => {
        const damage = typeDmg[type.id] || 0;
        const percentage = total > 0 ? (damage / total * 100) : 0;
        cumulativePercentage += percentage;
        
        // 交替行背景色
        const rowBg = index % 2 === 0 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(210, 180, 140, 0.1)';
        
        html += `
            <tr style="background:${rowBg};">
                <td style="padding:8px; border-bottom:1px solid rgba(139, 69, 19, 0.1);">
                    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:6px; background:${getColorForType(type.id)};"></span>
                    ${type.name}
                </td>
                <td style="padding:8px; text-align:right; border-bottom:1px solid rgba(139, 69, 19, 0.1); font-weight:bold;">
                    ${damage.toFixed(0)}
                </td>
                <td style="padding:8px; text-align:right; border-bottom:1px solid rgba(139, 69, 19, 0.1);">
                    ${percentage.toFixed(2)}%
                </td>
                <td style="padding:8px; text-align:right; border-bottom:1px solid rgba(139, 69, 19, 0.1);">
                    ${cumulativePercentage.toFixed(2)}%
                </td>
            </tr>
        `;
    });
    
    // 总计行
    html += `
                        <tr style="background:rgba(139, 69, 19, 0.2); font-weight:bold;">
                            <td style="padding:10px; border-top:2px solid rgba(139, 69, 19, 0.3);">总计</td>
                            <td style="padding:10px; text-align:right; border-top:2px solid rgba(139, 69, 19, 0.3); color:#8B4513;">
                                ${total.toFixed(0)}
                            </td>
                            <td style="padding:10px; text-align:right; border-top:2px solid rgba(139, 69, 19, 0.3);">100.00%</td>
                            <td style="padding:10px; text-align:right; border-top:2px solid rgba(139, 69, 19, 0.3);">100.00%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// 获取伤害类型对应的颜色
function getColorForType(typeId) {
    const colorMap = {
        'basic': '#58a6ff',
        'heavy': '#ff7b72',
        'skill': '#d29922',
        'ult': '#bc8cff',
        'echo': '#30363d',
        'all': '#8b949e'
    };
    
    // 为自定义类型生成稳定颜色
    if (typeId.startsWith('custom_')) {
        const hash = typeId.split('_')[1] || '0';
        const colors = ['#7ee787', '#ffa657', '#79c0ff', '#d2a8ff', '#ff7b72', '#56d364', '#f0b72f', '#6e7681', '#ffa198'];
        const index = parseInt(hash) % colors.length;
        return colors[index];
    }
    
    return colorMap[typeId] || '#8b949e';
}

    function calculate() {
        const getEchoSubs = (id) => {
            const subs = [];
            document.querySelectorAll(`#${id} .substat-row`).forEach(row => {
                subs.push({ key: row.querySelector('.sub-name').value, val: parseFloat(row.querySelector('.sub-val').value) || 0 });
            });
            return subs;
        };

        const resBase = runSim([]);
        const resA = runSim(getEchoSubs('echo_a'));
        const resB = runSim(getEchoSubs('echo_b'));

        updateChart(resBase.typeDmg);
        updateDamageComposition(resBase.typeDmg); // 新增：更新伤害组成表格

        const gainA = (resA.totalDmg / resBase.totalDmg - 1) * 100;
        const gainB = (resB.totalDmg / resBase.totalDmg - 1) * 100;
        const diff = gainA - gainB;

        document.getElementById('compare_res').innerHTML = `
            <div style="margin-bottom:5px;">声骸 A 提升: <span class="diff-pos">+${gainA.toFixed(2)}%</span></div>
            <div style="margin-bottom:8px;">声骸 B 提升: <span class="diff-pos">+${gainB.toFixed(2)}%</span></div>
            <div style="border-top:1px dashed #555; padding-top:8px; font-weight:bold; font-size:1.1em;">
                结论: ${diff > 0 ? `声骸 A 强 <span class="diff-pos">${diff.toFixed(2)}%</span>` : `声骸 B 强 <span class="diff-neg">${Math.abs(diff).toFixed(2)}%</span>`}
            </div>
        `;
    }

    // --- 通用辅助 ---
function updateChart(typeDmg) {
    const ctx = document.getElementById('dmgChart').getContext('2d');
    if (dmgChart) dmgChart.destroy();

    // 计算总伤害，用于计算百分比
    const total = Object.values(typeDmg).reduce((a, b) => a + b, 0);
    
    // 创建标签和数据值的映射
    // 我们需要按照DAMAGE_TYPES的顺序来组织，但排除'all'类型
    const damageTypesForChart = DAMAGE_TYPES.filter(t => t.id !== 'all');
    const labels = damageTypesForChart.map(t => t.name);
    const dataValues = damageTypesForChart.map(t => typeDmg[t.id] || 0);

    // 生成足够的颜色
    const colorPalette = [
        '#58a6ff', '#ff7b72', '#d29922', '#bc8cff', '#30363d',
        '#8b949e', '#7ee787', '#ffa657', '#79c0ff', '#d2a8ff',
        '#ff7b72', '#56d364', '#f0b72f', '#6e7681', '#ffa198'
    ];
    
    const backgroundColor = labels.map((_, i) => colorPalette[i % colorPalette.length]);

    dmgChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: backgroundColor,
                borderWidth: 0
            }]
        },
options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'right',
            labels: {
                color: '#ff9800', // 改为橙色
                font: { size: 12, weight: 'bold' },
                generateLabels: function(chart) {
                    const data = chart.data;
                    const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                    if (data.labels.length && data.datasets.length) {
                        return data.labels.map((label, i) => {
                            const value = data.datasets[0].data[i];
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
                            return {
                                text: `${label}: ${percentage}%`,
                                fillStyle: data.datasets[0].backgroundColor[i],
                                fontColor: '#ff9800', // 改为橙色
                                color: '#ff9800', // 改为橙色
                                hidden: isNaN(data.datasets[0].data[i]) || chart.getDatasetMeta(0).data[i].hidden,
                                index: i
                            };
                        });
                    }
                    return [];
                }
            }
        },
        tooltip: {
            titleColor: '#ff9800', // 工具提示标题也改为橙色
            bodyColor: '#ffffff',
            callbacks: {
                label: function(context) {
                    const value = context.raw;
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    return `伤害: ${value.toFixed(0)} (${percentage}%)`;
                }
            }
        }
    }
}
    });
}

    function addStaticBonus() {
        const options = DAMAGE_TYPES.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
        const html = `<div class="static-bonus-item input-row">
            <select class="s-type" onchange="calculate()">${options}</select>
            <input type="number" class="s-val" value="30" style="width:40px" oninput="calculate()">%
            <button onclick="this.parentElement.remove(); calculate();" style="color:var(--accent); background:none; border:none;">×</button>
        </div>`;
        document.getElementById('static_bonus_list').insertAdjacentHTML('beforeend', html);
        calculate();
    }

    // 获取声骸配置的辅助函数
    function getEchoConfig(id) {
        const subs = [];
        document.querySelectorAll(`#${id} .substat-row`).forEach(row => {
            const nameSelect = row.querySelector('.sub-name');
            const valSelect = row.querySelector('.sub-val');
            if (nameSelect && valSelect) {
                subs.push({
                    key: nameSelect.value,
                    val: parseFloat(valSelect.value) || 0
                });
            }
        });
        return subs;
    }

    // 设置声骸配置的辅助函数
    function setEchoConfig(id, subs) {
        const container = document.querySelector(`#${id} .substat-container`);
        if (!container || !subs) return;
        
        // 确保有足够的行
        const rows = container.querySelectorAll('.substat-row');
        for (let i = 0; i < Math.max(subs.length, 5); i++) {
            if (i >= rows.length) {
                // 添加新行
                const row = document.createElement('div');
                row.className = 'substat-row';
                let nameSelect = `<select class="sub-name" onchange="updateSubValues(this)">`;
                for(let key in SUBSTAT_DATA) nameSelect += `<option value="${key}">${SUBSTAT_DATA[key].name}</option>`;
                nameSelect += `</select>`;
                row.innerHTML = nameSelect + `<select class="sub-val"><option value="0">0</option></select>`;
                container.appendChild(row);
            }
        }
        
        // 更新值
        const updatedRows = container.querySelectorAll('.substat-row');
        subs.forEach((sub, i) => {
            if (i < updatedRows.length) {
                const row = updatedRows[i];
                const nameSelect = row.querySelector('.sub-name');
                const valSelect = row.querySelector('.sub-val');
                
                if (nameSelect && valSelect) {
                    nameSelect.value = sub.key;
                    // 更新值选项
                    const data = SUBSTAT_DATA[sub.key];
                    if (data) {
                        valSelect.innerHTML = data.values.map(v => 
                            `<option value="${v}" ${Math.abs(v - sub.val) < 0.01 ? 'selected' : ''}>${v}${data.isPct?'%':''}</option>`
                        ).join('');
                    }
                    // 确保值被设置
                    valSelect.value = sub.val;
                }
            }
        });
    }

    // 获取静态加成配置
    function getStaticBonusConfig() {
        const items = [];
        document.querySelectorAll('.static-bonus-item').forEach(el => {
            const typeSelect = el.querySelector('.s-type');
            const valInput = el.querySelector('.s-val');
            if (typeSelect && valInput) {
                items.push({
                    type: typeSelect.value,
                    value: valInput.value
                });
            }
        });
        return items;
    }

    // 设置静态加成配置
    function setStaticBonusConfig(items) {
        const container = document.getElementById('static_bonus_list');
        if (!container) return;
        
        // 清空现有项
        container.innerHTML = '';
        
        // 添加新项
        items.forEach(item => {
            const options = DAMAGE_TYPES.map(t => 
                `<option value="${t.id}" ${t.id === item.type ? 'selected' : ''}>${t.name}</option>`
            ).join('');
            const html = `<div class="static-bonus-item input-row">
                <select class="s-type" onchange="calculate()">${options}</select>
                <input type="number" class="s-val" value="${item.value}" style="width:40px" oninput="calculate()">%
                <button onclick="this.parentElement.remove(); calculate();" style="color:var(--accent); background:none; border:none;">×</button>
            </div>`;
            container.insertAdjacentHTML('beforeend', html);
        });
    }

    // 导出菜单控制
    let exportMenuVisible = false;
    
    function toggleExportMenu() {
        const menu = document.getElementById('exportMenu');
        if (!menu) return;
        
        if (exportMenuVisible) {
            menu.style.display = 'none';
        } else {
            // 隐藏其他可能打开的菜单
            menu.style.display = 'block';
            // 点击页面其他地方时关闭菜单
            setTimeout(() => {
                document.addEventListener('click', closeExportMenuOnClickOutside);
            }, 10);
        }
        exportMenuVisible = !exportMenuVisible;
    }
    
    function closeExportMenuOnClickOutside(event) {
        const menu = document.getElementById('exportMenu');
        const button = document.querySelector('.export-btn');
        
        if (menu && button && 
            !menu.contains(event.target) && 
            !button.contains(event.target)) {
            menu.style.display = 'none';
            exportMenuVisible = false;
            document.removeEventListener('click', closeExportMenuOnClickOutside);
        }
    }
    
    function selectExportFormat(format) {
        // 隐藏菜单
        const menu = document.getElementById('exportMenu');
        if (menu) {
            menu.style.display = 'none';
            exportMenuVisible = false;
            document.removeEventListener('click', closeExportMenuOnClickOutside);
        }
        
        // 根据选择执行导出
        if (format === 'json') {
            exportToJSON();
        } else if (format === 'xlsx') {
            exportToXLSX();
        }
    }
    
    // 导出数据（支持JSON和XLSX格式）- 现在通过点击菜单选择
    function exportFullData() {
        // 默认导出JSON格式，以保持向后兼容性
        exportToJSON();
    }

    // 导出为JSON格式
    function exportToJSON() {
        try {
            updateBuffPool();
            
            // 收集所有配置数据
            const config = {
                // 元数据
                meta: {
                    version: "1.4",
                    tool_name: "鸣潮伤害分析与声骸词条对比工具",
                    export_time: new Date().toISOString(),
                    data_version: 2
                },
                
                // 基础面板数据
                character: {
                    base_hp: document.getElementById('base_hp').value,
                    total_hp_now: document.getElementById('total_hp_now').value,
                    base_atk: document.getElementById('base_atk').value,
                    total_atk_now: document.getElementById('total_atk_now').value,
                    base_def: document.getElementById('base_def').value,
                    total_def_now: document.getElementById('total_def_now').value,
                    base_cr: document.getElementById('base_cr').value,
                    base_cd: document.getElementById('base_cd').value
                },
                
                // 静态加成配置
                static_bonus: getStaticBonusConfig(),
                
                // 动态Buff池
                buffs: buffPool,
                
                // 动作序列
                sequence: sequence,
                
                // 声骸配置
                echoes: {
                    echo_a: getEchoConfig('echo_a'),
                    echo_b: getEchoConfig('echo_b')
                },
                
                // 伤害类型配置（用于兼容性）
                damage_types: DAMAGE_TYPES.filter(t => t.id.startsWith('custom_'))
            };
            
            // 验证数据完整性
            const requiredFields = [
                'character.base_hp', 'character.base_atk', 'character.base_def',
                'character.base_cr', 'character.base_cd'
            ];
            
            let isValid = true;
            requiredFields.forEach(field => {
                const keys = field.split('.');
                let value = config;
                keys.forEach(key => value = value?.[key]);
                if (value === undefined || value === null || value === '') {
                    console.warn(`导出数据缺少字段: ${field}`);
                    isValid = false;
                }
            });
            
            if (!isValid) {
                alert('警告：部分数据可能不完整，但导出将继续进行。');
            }
            
            // 创建并下载文件
            const jsonStr = JSON.stringify(config, null, 2);
            const blob = new Blob(["\ufeff" + jsonStr], { 
                type: 'application/json;charset=utf-8' 
            });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            link.download = `鸣潮分析_${timestamp}.json`;
            link.click();
            
            // 清理URL对象
            setTimeout(() => URL.revokeObjectURL(link.href), 100);
            
            console.log('导出成功:', config);
            return true;
            
        } catch (error) {
            console.error('导出失败:', error);
            alert(`导出失败: ${error.message}`);
            return false;
        }
    }

    // 导出为XLSX格式
    function exportToXLSX() {
        try {
            updateBuffPool();
            
            // 收集所有配置数据
            const config = {
                meta: {
                    version: "1.4",
                    tool_name: "鸣潮伤害分析与声骸词条对比工具",
                    export_time: new Date().toISOString()
                },
                character: {
                    base_hp: document.getElementById('base_hp').value,
                    total_hp_now: document.getElementById('total_hp_now').value,
                    base_atk: document.getElementById('base_atk').value,
                    total_atk_now: document.getElementById('total_atk_now').value,
                    base_def: document.getElementById('base_def').value,
                    total_def_now: document.getElementById('total_def_now').value,
                    base_cr: document.getElementById('base_cr').value,
                    base_cd: document.getElementById('base_cd').value
                },
                static_bonus: getStaticBonusConfig(),
                buffs: buffPool,
                sequence: sequence,
                echoes: {
                    echo_a: getEchoConfig('echo_a'),
                    echo_b: getEchoConfig('echo_b')
                },
                damage_types: DAMAGE_TYPES.filter(t => t.id.startsWith('custom_'))
            };
            
            // 创建工作簿
            const wb = XLSX.utils.book_new();
            
            // 1. 基础面板数据工作表
            const characterData = [
                ["属性", "基础值", "当前面板值"],
                ["生命值", config.character.base_hp, config.character.total_hp_now],
                ["攻击力", config.character.base_atk, config.character.total_atk_now],
                ["防御力", config.character.base_def, config.character.total_def_now],
                ["暴击率(%)", config.character.base_cr, ""],
                ["暴击伤害(%)", config.character.base_cd, ""]
            ];
            const ws1 = XLSX.utils.aoa_to_sheet(characterData);
            XLSX.utils.book_append_sheet(wb, ws1, "基础面板");
            
            // 2. 静态加成工作表
            const staticBonusData = [
                ["伤害类型", "加成值(%)"]
            ];
            config.static_bonus.forEach(item => {
                const typeName = DAMAGE_TYPES.find(t => t.id === item.type)?.name || item.type;
                staticBonusData.push([typeName, item.value]);
            });
            const ws2 = XLSX.utils.aoa_to_sheet(staticBonusData);
            XLSX.utils.book_append_sheet(wb, ws2, "静态加成");
            
            // 3. 动态Buff工作表
            const buffData = [
                ["Buff名称", "类型", "分类", "数值(%)"]
            ];
            config.buffs.forEach(buff => {
                const typeName = DAMAGE_TYPES.find(t => t.id === buff.type)?.name || buff.type;
                buffData.push([buff.name, typeName, buff.cat, (buff.val * 100).toFixed(1)]);
            });
            const ws3 = XLSX.utils.aoa_to_sheet(buffData);
            XLSX.utils.book_append_sheet(wb, ws3, "动态Buff");
            
            // 4. 动作序列工作表
            const sequenceData = [
                ["动作名称", "倍率(%)", "伤害类型", "基数", "激活Buff"]
            ];
            config.sequence.forEach(action => {
                const typeName = DAMAGE_TYPES.find(t => t.id === action.type)?.name || action.type;
                const buffNames = action.activeBuffs.map(bid => {
                    const buff = config.buffs.find(b => b.id === bid);
                    return buff ? buff.name : bid;
                }).join(", ");
                sequenceData.push([
                    action.name, 
                    (action.mult * 100).toFixed(1), 
                    typeName, 
                    action.scaling || "atk",
                    buffNames
                ]);
            });
            const ws4 = XLSX.utils.aoa_to_sheet(sequenceData);
            XLSX.utils.book_append_sheet(wb, ws4, "动作序列");
            
            // 5. 声骸配置工作表
            const echoData = [
                ["声骸", "词条类型", "数值"]
            ];
            // 声骸A
            config.echoes.echo_a.forEach(sub => {
                const subInfo = SUBSTAT_DATA[sub.key];
                const name = subInfo ? subInfo.name : sub.key;
                echoData.push(["声骸A", name, sub.val]);
            });
            // 声骸B
            config.echoes.echo_b.forEach(sub => {
                const subInfo = SUBSTAT_DATA[sub.key];
                const name = subInfo ? subInfo.name : sub.key;
                echoData.push(["声骸B", name, sub.val]);
            });
            const ws5 = XLSX.utils.aoa_to_sheet(echoData);
            XLSX.utils.book_append_sheet(wb, ws5, "声骸词条");
            
            // 6. 元数据工作表
            const metaData = [
                ["导出工具", config.meta.tool_name],
                ["版本", config.meta.version],
                ["导出时间", config.meta.export_time],
                ["数据版本", "2"],
                ["备注", "鸣潮伤害分析工具导出数据"]
            ];
            const ws6 = XLSX.utils.aoa_to_sheet(metaData);
            XLSX.utils.book_append_sheet(wb, ws6, "元数据");
            
            // 生成并下载文件
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            XLSX.writeFile(wb, `鸣潮分析_${timestamp}.xlsx`);
            
            console.log('XLSX导出成功');
            return true;
            
        } catch (error) {
            console.error('XLSX导出失败:', error);
            alert(`XLSX导出失败: ${error.message}\n请确保已加载xlsx库。`);
            return false;
        }
    }

    // 完整导入功能（支持JSON和XLSX格式）
    function importFullData(input) {
        if (!input.files || input.files.length === 0) {
            alert('请选择要导入的文件');
            return;
        }
        
        const file = input.files[0];
        const isJSON = file.name.endsWith('.json');
        const isXLSX = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
        
        if (!isJSON && !isXLSX) {
            alert('请选择JSON或Excel格式的文件（.json, .xlsx, .xls）');
            return;
        }
        
        const reader = new FileReader();
        
        if (isJSON) {
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    importFromJSON(data);
                    alert(`JSON导入成功！\n\n版本: ${data.meta?.version || '未知'}`);
                    input.value = '';
                } catch (error) {
                    console.error('JSON导入失败:', error);
                    alert(`JSON导入失败: ${error.message}`);
                    input.value = '';
                }
            };
            reader.readAsText(file);
        } else if (isXLSX) {
            reader.onload = function(e) {
                try {
                    const data = e.target.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    importFromXLSX(workbook);
                    alert('Excel文件导入成功！');
                    input.value = '';
                } catch (error) {
                    console.error('XLSX导入失败:', error);
                    alert(`Excel导入失败: ${error.message}`);
                    input.value = '';
                }
            };
            reader.readAsBinaryString(file);
        }
    }

    // 从JSON数据导入
    function importFromJSON(data) {
        // 验证数据格式和版本
        if (!data.meta || !data.meta.version) {
            throw new Error('无效的数据格式：缺少元数据');
        }
        
        // 检查版本兼容性
        const version = data.meta.version;
        if (!version.startsWith('1.')) {
            if (!confirm(`数据版本 ${version} 可能不兼容当前版本 1.4。是否继续导入？`)) {
                return;
            }
        }
        
        // 恢复基础面板数据
        if (data.character) {
            document.getElementById('base_hp').value = data.character.base_hp || '';
            document.getElementById('total_hp_now').value = data.character.total_hp_now || '';
            document.getElementById('base_atk').value = data.character.base_atk || '';
            document.getElementById('total_atk_now').value = data.character.total_atk_now || '';
            document.getElementById('base_def').value = data.character.base_def || '';
            document.getElementById('total_def_now').value = data.character.total_def_now || '';
            document.getElementById('base_cr').value = data.character.base_cr || '';
            document.getElementById('base_cd').value = data.character.base_cd || '';
        }
        
        // 恢复静态加成
        if (data.static_bonus && Array.isArray(data.static_bonus)) {
            setStaticBonusConfig(data.static_bonus);
        }
        
        // 恢复动态Buff池
        if (data.buffs && Array.isArray(data.buffs)) {
            // 清空现有Buff池
            document.getElementById('buff_pool').innerHTML = '';
            // 添加Buff
            data.buffs.forEach(buff => {
                const typeOptions = DAMAGE_TYPES.map(t => 
                    `<option value="${t.id}" ${t.id === buff.type ? 'selected' : ''}>${t.name}</option>`
                ).join('');
                const html = `
                    <div class="buff-config" data-id="${buff.id}" style="border-left:4px solid #4a6bff; background:rgba(74, 107, 255, 0.1); padding:12px; margin-bottom:10px; border-radius:8px;">
                        <div class="input-row">
                            <input type="text" class="b-name" value="${buff.name || '新Buff'}" style="width:80px" oninput="syncBuffNames('${buff.id}', this.value)">
                            <select class="b-cat" onchange="calculate()">
                                <option value="bonus" ${buff.cat === 'bonus' ? 'selected' : ''}>伤害加成</option>
                                <option value="deepen" ${buff.cat === 'deepen' ? 'selected' : ''}>伤害加深</option>
                                <option value="atk_pct" ${buff.cat === 'atk_pct' ? 'selected' : ''}>攻击%</option>
                                <option value="cr" ${buff.cat === 'cr' ? 'selected' : ''}>暴击率</option>
                                <option value="cd" ${buff.cat === 'cd' ? 'selected' : ''}>暴击伤害</option>
                                <option value="hp_pct" ${buff.cat === 'hp_pct' ? 'selected' : ''}>生命%</option>
                                <option value="def_pct" ${buff.cat === 'def_pct' ? 'selected' : ''}>防御%</option>
                            </select>
                        </div>
                        <div class="input-row">
                            <select class="b-type" onchange="calculate()">${typeOptions}</select>
                            <input type="number" class="b-val" value="${(buff.val * 100) || 10}" style="width:40px" oninput="calculate()">%
                            <button onclick="this.parentElement.parentElement.remove(); renderSequence(); calculate();" style="color:#ff6b8b; background:none; border:none; cursor:pointer; font-size:16px; font-weight:bold;">×</button>
                        </div>
                    </div>`;
                document.getElementById('buff_pool').insertAdjacentHTML('beforeend', html);
            });
        }
        
        // 恢复动作序列
        if (data.sequence && Array.isArray(data.sequence)) {
            sequence = data.sequence;
        }
        
        // 恢复声骸配置
        if (data.echoes) {
            if (data.echoes.echo_a) {
                setEchoConfig('echo_a', data.echoes.echo_a);
            }
            if (data.echoes.echo_b) {
                setEchoConfig('echo_b', data.echoes.echo_b);
            }
        }
        
        // 恢复自定义伤害类型
        if (data.damage_types && Array.isArray(data.damage_types)) {
            // 移除现有的自定义类型
            DAMAGE_TYPES = DAMAGE_TYPES.filter(t => !t.id.startsWith('custom_'));
            // 添加导入的自定义类型
            data.damage_types.forEach(t => {
                DAMAGE_TYPES.push(t);
            });
        }
        
        // 更新界面
        updateBuffPool();
        updateAllDamageTypeSelects();
        renderSequence();
        calculate();
    }

    // 从XLSX工作簿导入
    function importFromXLSX(workbook) {
        // 注意：由于XLSX导出主要是为了便于查看，导入功能可能无法完全恢复所有数据
        // 这里我们主要尝试恢复基础面板数据
        
        // 1. 读取基础面板数据
        const baseSheet = workbook.Sheets["基础面板"];
        if (baseSheet) {
            const baseData = XLSX.utils.sheet_to_json(baseSheet, { header: 1 });
            // 简单解析：第一列是属性名，第二列是基础值，第三列是当前值
            for (let i = 1; i < baseData.length; i++) {
                const row = baseData[i];
                if (row && row.length >= 2) {
                    const prop = row[0];
                    const baseVal = row[1];
                    const currentVal = row[2] || '';
                    
                    if (prop === "生命值") {
                        document.getElementById('base_hp').value = baseVal;
                        document.getElementById('total_hp_now').value = currentVal;
                    } else if (prop === "攻击力") {
                        document.getElementById('base_atk').value = baseVal;
                        document.getElementById('total_atk_now').value = currentVal;
                    } else if (prop === "防御力") {
                        document.getElementById('base_def').value = baseVal;
                        document.getElementById('total_def_now').value = currentVal;
                    } else if (prop === "暴击率(%)") {
                        document.getElementById('base_cr').value = baseVal;
                    } else if (prop === "暴击伤害(%)") {
                        document.getElementById('base_cd').value = baseVal;
                    }
                }
            }
        }
        
        // 2. 读取静态加成（简化处理）
        const staticSheet = workbook.Sheets["静态加成"];
        if (staticSheet) {
            const staticData = XLSX.utils.sheet_to_json(staticSheet, { header: 1 });
            // 清空现有静态加成
            document.getElementById('static_bonus_list').innerHTML = '';
            // 从第二行开始（跳过标题行）
            for (let i = 1; i < staticData.length; i++) {
                const row = staticData[i];
                if (row && row.length >= 2) {
                    const typeName = row[0];
                    const value = row[1];
                    // 查找对应的伤害类型ID
                    const damageType = DAMAGE_TYPES.find(t => t.name === typeName);
                    if (damageType) {
                        const options = DAMAGE_TYPES.map(t => 
                            `<option value="${t.id}" ${t.id === damageType.id ? 'selected' : ''}>${t.name}</option>`
                        ).join('');
                        const html = `<div class="static-bonus-item input-row">
                            <select class="s-type" onchange="calculate()">${options}</select>
                            <input type="number" class="s-val" value="${value}" style="width:40px" oninput="calculate()">%
                            <button onclick="this.parentElement.remove(); calculate();" style="color:var(--accent); background:none; border:none;">×</button>
                        </div>`;
                        document.getElementById('static_bonus_list').insertAdjacentHTML('beforeend', html);
                    }
                }
            }
        }
        
        // 3. 更新计算
        updateAllDamageTypeSelects();
        calculate();
        
        // 提示用户
        alert('Excel文件已导入基础面板和静态加成数据。\n\n注意：动态Buff、动作序列和声骸配置需要手动恢复，建议同时使用JSON格式进行完整备份。');
    }

    // 添加本地存储支持（可选功能）
    function saveToLocalStorage() {
        try {
            updateBuffPool();
            const config = {
                meta: {
                    version: "1.4",
                    save_time: new Date().toISOString()
                },
                character: {
                    base_hp: document.getElementById('base_hp').value,
                    total_hp_now: document.getElementById('total_hp_now').value,
                    base_atk: document.getElementById('base_atk').value,
                    total_atk_now: document.getElementById('total_atk_now').value,
                    base_def: document.getElementById('base_def').value,
                    total_def_now: document.getElementById('total_def_now').value,
                    base_cr: document.getElementById('base_cr').value,
                    base_cd: document.getElementById('base_cd').value
                },
                static_bonus: getStaticBonusConfig(),
                buffs: buffPool,
                sequence: sequence,
                echoes: {
                    echo_a: getEchoConfig('echo_a'),
                    echo_b: getEchoConfig('echo_b')
                }
            };
            
            localStorage.setItem('mingchao_damage_calc_v1.4', JSON.stringify(config));
            alert('配置已保存到本地存储！');
            return true;
        } catch (error) {
            console.error('保存到本地存储失败:', error);
            alert('保存失败: ' + error.message);
            return false;
        }
    }

    function loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('mingchao_damage_calc_v1.4');
            if (!saved) {
                alert('本地存储中没有找到保存的配置');
                return false;
            }
            
            // 模拟文件导入流程
            const data = JSON.parse(saved);
            
            // 使用与文件导入相同的恢复逻辑
            // （这里可以重构为共享函数，但为保持简单，直接调用相关函数）
            if (confirm('是否从本地存储加载上次保存的配置？')) {
                // 创建虚拟事件对象来复用导入逻辑
                const virtualInput = {
                    files: [{
                        name: 'local_storage_backup.json'
                    }]
                };
                // 由于不能直接调用importFullData，我们手动触发恢复
                // 这里简化处理，实际应该复用代码
                alert('本地存储加载功能需要进一步实现，建议使用导入导出文件功能。');
            }
            return true;
        } catch (error) {
            console.error('从本地存储加载失败:', error);
            alert('加载失败: ' + error.message);
            return false;
        }
    }
