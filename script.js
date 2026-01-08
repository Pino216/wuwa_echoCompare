
    const SUBSTAT_DATA = {
        "none": { name: "(无)", values: [0] },
        "cr": { name: "暴击率", type: "cr", isPct: true, values: [10.5, 9.9, 9.3, 8.7, 8.1, 7.5, 6.9, 6.3] },
        "cd": { name: "暴击伤害", type: "cd", isPct: true, values: [21.0, 19.8, 18.6, 17.4, 16.2, 15.0, 13.8, 12.6] },
        "atk_pct": { name: "百分比攻击", type: "atk_pct", isPct: true, values: [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4] },
        "atk_flat": { name: "固定攻击", type: "atk_flat", isPct: false, values: [60, 50, 40, 30] },
        "basic": { name: "普攻加成", type: "basic", isPct: true, values: [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4] },
        "heavy": { name: "重击加成", type: "heavy", isPct: true, values: [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4] },
        "skill": { name: "技能加成", type: "skill", isPct: true, values: [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4] },
        "ult": { name: "解放加成", type: "ult", isPct: true, values: [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4] },
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
        container.innerHTML = sequence.map((a, i) => `
            <div class="action-card">
                <strong>${a.name}</strong> <span class="tag-type">${a.type}</span>
                <span>${(a.mult*100).toFixed(1)}% (${a.scaling === 'hp' ? '生命' : a.scaling === 'def' ? '防御' : '攻击'})</span>
                <div style="margin-top:6px;">
                    ${buffPool.map(b => `
                        <div class="chip ${a.activeBuffs.includes(b.id) ? 'active' : ''}"
                             data-bid="${b.id}" onclick="toggleBuff(${i}, '${b.id}')">
                            ${b.name}
                        </div>
                    `).join('')}
                </div>
                <span style="position:absolute; right:10px; top:10px; cursor:pointer; color:var(--accent)" onclick="sequence.splice(${i},1);renderSequence();calculate();">×</span>
            </div>
        `).join('');
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
    let staticBonusMap = { basic:0, heavy:0, skill:0, ult:0, echo:0, all:0 };
    document.querySelectorAll('.static-bonus-item').forEach(el => {
        staticBonusMap[el.querySelector('.s-type').value] += parseFloat(el.querySelector('.s-val').value)/100;
    });

    // 3. 处理副词条加成 (需增加生命和防御属性识别)
    let subValues = { atk_pct: 0, hp_pct: 0, def_pct: 0, cr: 0, cd: 0 };
    let subBonus = { basic:0, heavy:0, skill:0, ult:0, echo:0 };

    extraSubs.forEach(s => {
        const d = SUBSTAT_DATA[s.key];
        if(!d) return;
        const v = s.val / 100;
        if(subValues[d.type] !== undefined) subValues[d.type] += v;
        else if(subBonus[d.type] !== undefined) subBonus[d.type] += v;
    });

    let typeDmg = { basic:0, heavy:0, skill:0, ult:0, echo:0 };
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
    const labels = ['普攻', '重击', '技能', '解放', '声骸'];
    const dataValues = [typeDmg.basic, typeDmg.heavy, typeDmg.skill, typeDmg.ult, typeDmg.echo];

    dmgChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: ['#58a6ff', '#ff7b72', '#d29922', '#bc8cff', '#30363d'],
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

    function exportFullData() {
        updateBuffPool();
        const config = {
            base_atk: document.getElementById('base_atk').value,
            total_atk_now: document.getElementById('total_atk_now').value,
            base_cr: document.getElementById('base_cr').value,
            base_cd: document.getElementById('base_cd').value,
            buffs: buffPool,
            sequence: sequence
        };
        const blob = new Blob(["\ufeff" + JSON.stringify(config)], { type: 'application/json' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `鸣潮分析_${new Date().getTime()}.json`;
        link.click();
    }

    function importFullData(input) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = JSON.parse(e.target.result);
            document.getElementById('base_atk').value = data.base_atk;
            document.getElementById('total_atk_now').value = data.total_atk_now;
            document.getElementById('base_cr').value = data.base_cr;
            document.getElementById('base_cd').value = data.base_cd;
            sequence = data.sequence;
            renderSequence();
            calculate();
        };
        reader.readAsText(input.files[0]);
    }
