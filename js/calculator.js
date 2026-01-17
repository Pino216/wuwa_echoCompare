// calculator.js
// 伤害计算引擎

// 全局图表变量
let dmgChart = null;

// 暴击率溢出转换功能
function applyCrOverflow(cr, cd) {
    const enable = document.getElementById('enable_cr_overflow')?.checked;
    if (!enable) {
        return { cr: cr, cd: cd };
    }
    
    const ratio = parseFloat(document.getElementById('cr_to_cd_ratio')?.value) || 2;
    const maxGain = parseFloat(document.getElementById('max_cd_gain')?.value) || 100;
    
    let overflowCr = Math.max(0, cr - 100);
    if (overflowCr <= 0) {
        return { cr: Math.min(cr, 100), cd: cd };
    }
    
    // 计算可获得的暴伤增益
    let cdGain = overflowCr * ratio;
    cdGain = Math.min(cdGain, maxGain);
    
    // 暴击率不能超过100%
    const finalCr = Math.min(cr, 100);
    const finalCd = cd + cdGain;
    
    return { cr: finalCr, cd: finalCd };
}

// 更新暴击率溢出设置面板的显示
function updateCrOverflowPanel() {
    const enableCheckbox = document.getElementById('enable_cr_overflow');
    const settingsPanel = document.getElementById('cr_overflow_settings');
    
    if (enableCheckbox && settingsPanel) {
        settingsPanel.style.display = enableCheckbox.checked ? 'block' : 'none';
    }
}

// 核心模拟函数
function runSim(extraSubs = [], removeSubs = []) {
    updateBuffPool(true);

    // 1. 获取基础面板数据
    const baseAtk = parseFloat(document.getElementById('base_atk').value) || 0;
    const totalAtkNow = parseFloat(document.getElementById('total_atk_now').value) || 0;
    const baseHp = parseFloat(document.getElementById('base_hp')?.value) || 0;
    const totalHpNow = parseFloat(document.getElementById('total_hp_now')?.value) || 0;
    const baseDef = parseFloat(document.getElementById('base_def').value) || 0;
    const totalDefNow = parseFloat(document.getElementById('total_def_now')?.value) || 0;

    let panelCr = parseFloat(document.getElementById('base_cr').value) / 100 || 0;
    let panelCd = parseFloat(document.getElementById('base_cd').value) / 100 || 0;
        
    // 应用暴击率溢出转换
    const crOverflowResult = applyCrOverflow(panelCr * 100, panelCd * 100);
    panelCr = crOverflowResult.cr / 100;
    panelCd = crOverflowResult.cd / 100;

    // 2. 固定加成 (来自静态列表)
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

    // 3. 处理副词条加成
    let subValues = { atk_pct: 0, hp_pct: 0, def_pct: 0, cr: 0, cd: 0 };
    let subFlatValues = { atk_flat: 0, hp_flat: 0, def_flat: 0 };
    let subBonus = {};
    DAMAGE_TYPES.forEach(t => {
        if (t.id !== 'all') {
            subBonus[t.id] = 0;
        }
    });

    // 处理要添加的词条
    extraSubs.forEach(s => {
        const d = SUBSTAT_DATA[s.key];
        if(!d) return;
        
        if (d.isPct) {
            const v = s.val / 100;
            if(subValues[d.type] !== undefined) subValues[d.type] += v;
            else if(subBonus[d.type] !== undefined) subBonus[d.type] += v;
        } else {
            if(subFlatValues[d.type] !== undefined) subFlatValues[d.type] += s.val;
        }
    });

    // 处理要移除的词条（减去它们的值）
    removeSubs.forEach(s => {
        const d = SUBSTAT_DATA[s.key];
        if(!d) return;
        
        if (d.isPct) {
            const v = s.val / 100;
            if(subValues[d.type] !== undefined) subValues[d.type] -= v;
            else if(subBonus[d.type] !== undefined) subBonus[d.type] -= v;
        } else {
            if(subFlatValues[d.type] !== undefined) subFlatValues[d.type] -= s.val;
        }
    });

    // 计算面板已经包含的百分比加成
    // 面板总属性 = 基础属性 * (1 + 面板已有百分比加成) + 面板已有固定值
    // 我们需要从面板总属性中反推出面板已有百分比加成
    // 但为了简化，我们假设面板总属性已经包含了所有装备、圣遗物等的加成
    // 而extraSubs只包含声骸词条和buff的额外加成
    
    let typeDmg = {};
    DAMAGE_TYPES.forEach(t => {
        if (t.id !== 'all') {
            typeDmg[t.id] = 0;
        }
    });
    let totalDmg = 0;
    
    let detailedInfo = [];

    // 4. 遍历动作序列计算
    sequence.forEach((a, index) => {
        // 跳过未启用的动作
        if (a.enabled === false) {
            return;
        }
        // 根据动作设定的基数(scaling)初始化基础值
        let baseStat = baseAtk;
        let currentTotalStat = totalAtkNow;
        let scalingAttrKey = 'atk_pct';

        if (a.scaling === 'hp') {
            baseStat = baseHp;
            currentTotalStat = totalHpNow;
            scalingAttrKey = 'hp_pct';
        } else if (a.scaling === 'def') {
            baseStat = baseDef;
            currentTotalStat = totalDefNow;
            scalingAttrKey = 'def_pct';
        }

        // 当前面板总属性已经包含了所有装备、圣遗物等的加成
        // 我们需要计算额外加成（来自声骸词条和buff）
        // 初始时，curAttrPct只包含extraSubs中的百分比加成
        let curAttrPct = subValues[scalingAttrKey];
        let curCr = panelCr + subValues.cr;
        let curCd = panelCd + subValues.cd;
        
        // 应用暴击率溢出转换（针对每个动作的最终暴击率）
        // 注意：这里需要将百分比转换为实际值
        const actionCrOverflow = applyCrOverflow(curCr * 100, curCd * 100);
        curCr = actionCrOverflow.cr / 100;
        curCd = actionCrOverflow.cd / 100;
        let curBonus = 1 + staticBonusMap.all + staticBonusMap[a.type] + (subBonus[a.type] || 0);
        let curDeepen = 1;

        // 固定值加成
        let curFlatValue = 0;
        if (a.scaling === 'atk') {
            curFlatValue = subFlatValues.atk_flat;
        } else if (a.scaling === 'hp') {
            curFlatValue = subFlatValues.hp_flat;
        } else if (a.scaling === 'def') {
            curFlatValue = subFlatValues.def_flat;
        }

        // 记录初始值
        const initialAttrPct = curAttrPct;
        const initialBonus = curBonus - 1;
        const initialDeepen = curDeepen - 1;
        
        let appliedBuffs = [];

        // 5. 应用动态 Buff
        a.activeBuffs.forEach(bid => {
            const b = buffPool.find(x => x.id === bid);
            if(b && (b.type === 'all' || b.type === a.type)) {
                if(b.cat === 'bonus') {
                    curBonus += b.val;
                    appliedBuffs.push({name: b.name, type: '伤害加成', value: b.val * 100});
                }
                else if(b.cat === 'deepen') {
                    curDeepen += b.val;
                    appliedBuffs.push({name: b.name, type: '伤害加深', value: b.val * 100});
                }
                else if(b.cat === scalingAttrKey) {
                    curAttrPct += b.val;
                    appliedBuffs.push({name: b.name, type: '属性加成', value: b.val * 100});
                }
                else if(b.cat === 'cr') {
                    curCr += b.val;
                    appliedBuffs.push({name: b.name, type: '暴击率', value: b.val * 100});
                }
                else if(b.cat === 'cd') {
                    curCd += b.val;
                    appliedBuffs.push({name: b.name, type: '暴击伤害', value: b.val * 100});
                }
            }
        });
        
        // 应用暴击率溢出转换（在所有加成之后）
        const finalCrOverflow = applyCrOverflow(curCr * 100, curCd * 100);
        curCr = finalCrOverflow.cr / 100;
        curCd = finalCrOverflow.cd / 100;

        // 最终属性计算：
        // 面板总属性已经包含了基础加成，我们只需要加上额外加成
        // 额外加成包括：声骸词条百分比、buff百分比、固定值
        // 注意：面板总属性 = 基础属性 * (1 + 面板已有百分比) + 面板已有固定值
        // 最终属性 = 基础属性 * (1 + 面板已有百分比 + 额外百分比) + (面板已有固定值 + 额外固定值)
        // 但面板已有固定值未知，所以我们需要从面板总属性中推导
        
        // 计算面板已有百分比加成（从面板总属性和基础属性推导）
        // 面板总属性 = 基础属性 * (1 + 面板已有百分比) + 面板已有固定值
        // 假设面板已有固定值为0，则面板已有百分比 = (面板总属性 / 基础属性) - 1
        let panelExistingPct = 0;
        let panelExistingFlat = 0;
        if (baseStat > 0) {
            // 尝试估算面板已有百分比和固定值
            // 假设面板已有百分比是使得面板总属性大于基础属性的主要因素
            // 简单处理：假设面板已有固定值为0，计算百分比
            panelExistingPct = (currentTotalStat / baseStat) - 1;
            // 如果计算出的百分比不合理（比如负数），则调整
            if (panelExistingPct < 0) {
                panelExistingPct = 0;
                panelExistingFlat = currentTotalStat - baseStat;
            }
        } else {
            // 如果基础属性为0，则面板已有固定值就是当前总属性
            panelExistingFlat = currentTotalStat;
        }
        
        // 总百分比 = 面板已有百分比 + 额外百分比
        const totalPct = panelExistingPct + curAttrPct;
        // 总固定值 = 面板已有固定值 + 额外固定值
        const totalFlat = panelExistingFlat + curFlatValue;
        
        // 最终属性
        const finalScalingValue = baseStat * (1 + totalPct) + totalFlat;
        
        const critExp = 1 + Math.min(1, curCr) * (curCd - 1);
        const dmg = finalScalingValue * a.mult * curBonus * curDeepen * critExp;

        typeDmg[a.type] += dmg;
        totalDmg += dmg;
        
        // 收集详细加成信息
        detailedInfo.push({
            actionName: a.name,
            actionIndex: index,
            attrBonusPct: (curAttrPct - initialAttrPct) * 100,
            totalAttrBonusPct: curAttrPct * 100,
            // 注意：这里显示的是额外加成，不是总加成
            // 总加成百分比 = 面板已有百分比 + 额外百分比
            panelExistingPct: panelExistingPct * 100,
            damageBonusPct: (curBonus - 1 - initialBonus) * 100,
            totalDamageBonusPct: (curBonus - 1) * 100,
            damageDeepenPct: (curDeepen - 1 - initialDeepen) * 100,
            totalDamageDeepenPct: (curDeepen - 1) * 100,
            appliedBuffs: appliedBuffs,
            scalingType: a.scaling,
            damageType: a.type,
            critRate: curCr * 100,
            critDamage: curCd * 100,
            critMultiplier: critExp,
            // 新增：最终属性计算相关信息
            finalScalingValue: finalScalingValue,
            baseStat: baseStat,
            totalPct: totalPct * 100,
            totalFlat: totalFlat
        });
    });

    return { 
        totalDmg, 
        typeDmg,
        detailedInfo
    };
}

// 数据验证函数
function validateInputs(showAlert = true) {
    // 验证基础攻击力
    const baseAtk = parseFloat(document.getElementById('base_atk').value);
    if (isNaN(baseAtk) || baseAtk <= 0) {
        if (showAlert) {
            alert('❌ 基础攻击力必须为正数');
            document.getElementById('base_atk').focus();
        }
        return false;
    }
    
    // 验证当前攻击力
    const totalAtkNow = parseFloat(document.getElementById('total_atk_now').value);
    if (isNaN(totalAtkNow) || totalAtkNow <= 0) {
        if (showAlert) {
            alert('❌ 当前面板总攻击必须为正数');
            document.getElementById('total_atk_now').focus();
        }
        return false;
    }
    
    // 验证暴击率
    const baseCr = parseFloat(document.getElementById('base_cr').value);
    if (isNaN(baseCr) || baseCr < 0 || baseCr > 100) {
        if (showAlert) {
            alert('❌ 暴击率必须在0-100%之间');
            document.getElementById('base_cr').focus();
        }
        return false;
    }
    
    // 验证暴击伤害
    const baseCd = parseFloat(document.getElementById('base_cd').value);
    if (isNaN(baseCd) || baseCd < 0) {
        if (showAlert) {
            alert('❌ 暴击伤害必须为非负数');
            document.getElementById('base_cd').focus();
        }
        return false;
    }
    
    // 验证动作序列
    if (sequence.length === 0) {
        if (showAlert) {
            alert('⚠️ 动作序列为空，请至少添加一个动作');
        }
        return false;
    }
    
    // 验证动作倍率（只验证启用的动作）
    for (let i = 0; i < sequence.length; i++) {
        const action = sequence[i];
        // 跳过未启用的动作
        if (action.enabled === false) {
            continue;
        }
        if (isNaN(action.mult) || action.mult <= 0) {
            if (showAlert) {
                alert(`❌ 动作"${action.name}"的倍率必须为正数`);
            }
            return false;
        }
    }
    
    return true;
}

// 主计算函数
function calculate(showValidationAlert = true) {
    // 首先检查序列是否为空
    if (sequence.length === 0) {
        if (showValidationAlert) {
            alert('⚠️ 动作序列为空，请至少添加一个动作');
        }
        // 清空结果显示区域
        document.getElementById('compare_res').innerHTML = '<div style="text-align:center; color:#8b949e; padding:20px;">请添加动作序列后点击"执行全量化分析"</div>';
        // 隐藏详细加成信息
        const bonusContainer = document.getElementById('detailed_bonus_info');
        if (bonusContainer) {
            bonusContainer.style.display = 'none';
        }
        // 清空图表
        const ctx = document.getElementById('dmgChart').getContext('2d');
        if (dmgChart) dmgChart.destroy();
        // 清空伤害组成表格
        document.getElementById('damageComposition').innerHTML = '<div style="text-align:center; color:#8b949e; padding:20px;">暂无伤害数据</div>';
        return;
    }
    
    // 执行数据验证，但可以控制是否显示警告
    if (!validateInputs(showValidationAlert)) {
        return;
    }
    
    const getEchoSubs = (id) => {
        const subs = [];
        document.querySelectorAll(`#${id} .substat-row`).forEach(row => {
            subs.push({ key: row.querySelector('.sub-name').value, val: parseFloat(row.querySelector('.sub-val').value) || 0 });
        });
        return subs;
    };

    // 声骸A总是已装备：基础伤害已经包含声骸A的词条（体现在面板中）
    const echoASubs = getEchoSubs('echo_a');
    const echoBSubs = getEchoSubs('echo_b');
    // 基础伤害：使用当前面板（包含声骸A的词条）
    // 这里传递空数组，因为声骸A的词条已经在面板中
    const resBase = runSim([], []);
    // 声骸B的伤害：移除声骸A的词条，添加声骸B的词条
    const resB = runSim(echoBSubs, echoASubs);

    updateChart(resBase.typeDmg);
    updateDamageComposition(resBase.typeDmg);

    // 计算声骸B相对于声骸A的提升
    const gainB = (resB.totalDmg / resBase.totalDmg - 1) * 100;

    // 显示详细的变化分析
    document.getElementById('compare_res').innerHTML = generateDamageChangeAnalysis(
        resBase, null, resB, 
        echoASubs, echoBSubs,
        0, gainB, gainB,
        true
    );
    
    // 新增：显示详细加成信息
    displayDetailedBonusInfo(resBase.detailedInfo);
}

// --- 伤害组成表格显示 ---
function updateDamageComposition(typeDmg) {
    const container = document.getElementById('damageComposition');
    if (!container) return;
    
    // 计算总伤害 - 包括所有伤害类型（包括自定义类型）
    // 首先，我们需要收集所有伤害类型的伤害值
    let total = 0;
    
    // 收集所有伤害类型（包括自定义类型）的伤害值
    const allDamageEntries = [];
    
    // 处理默认伤害类型
    DAMAGE_TYPES.forEach(type => {
        if (type.id !== 'all') {
            const damage = typeDmg[type.id] || 0;
            if (damage > 0) {
                allDamageEntries.push({
                    id: type.id,
                    name: type.name,
                    damage: damage
                });
                total += damage;
            }
        }
    });
    
    // 另外，还需要检查typeDmg中是否有DAMAGE_TYPES中没有包含的自定义类型
    // 这可能在导入时发生，自定义类型被添加到typeDmg但还没有添加到DAMAGE_TYPES
    for (const typeId in typeDmg) {
        if (typeId !== 'all') {
            const damage = typeDmg[typeId];
            if (damage > 0) {
                // 检查这个类型是否已经在allDamageEntries中
                const existingEntry = allDamageEntries.find(entry => entry.id === typeId);
                if (!existingEntry) {
                    // 查找类型名称
                    const typeInfo = DAMAGE_TYPES.find(t => t.id === typeId);
                    const typeName = typeInfo ? typeInfo.name : `自定义类型(${typeId})`;
                    
                    allDamageEntries.push({
                        id: typeId,
                        name: typeName,
                        damage: damage
                    });
                    total += damage;
                }
            }
        }
    }
    
    // 按伤害值降序排序
    allDamageEntries.sort((a, b) => b.damage - a.damage);
    
    if (allDamageEntries.length === 0) {
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
    allDamageEntries.forEach((entry, index) => {
        const damage = entry.damage;
        const percentage = total > 0 ? (damage / total * 100) : 0;
        cumulativePercentage += percentage;
        
        // 交替行背景色
        const rowBg = index % 2 === 0 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(210, 180, 140, 0.1)';
        
        html += `
            <tr style="background:${rowBg};">
                <td style="padding:8px; border-bottom:1px solid rgba(139, 69, 19, 0.1);">
                    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:6px; background:${getColorForType(entry.id)};"></span>
                    ${entry.name}
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

// --- 图表更新 ---
function updateChart(typeDmg) {
    const ctx = document.getElementById('dmgChart').getContext('2d');
    if (dmgChart) dmgChart.destroy();

    // 计算总伤害，用于计算百分比
    const total = Object.values(typeDmg).reduce((a, b) => a + b, 0);
    
    // 收集所有有伤害值的类型，包括自定义类型
    const allDamageEntries = [];
    
    // 首先从DAMAGE_TYPES中获取
    DAMAGE_TYPES.forEach(type => {
        if (type.id !== 'all') {
            const damage = typeDmg[type.id] || 0;
            if (damage > 0) {
                allDamageEntries.push({
                    id: type.id,
                    name: type.name,
                    damage: damage
                });
            }
        }
    });
    
    // 检查typeDmg中是否有不在DAMAGE_TYPES中的类型
    for (const typeId in typeDmg) {
        if (typeId !== 'all' && typeDmg[typeId] > 0) {
            const existingEntry = allDamageEntries.find(entry => entry.id === typeId);
            if (!existingEntry) {
                // 查找类型名称
                const typeInfo = DAMAGE_TYPES.find(t => t.id === typeId);
                const typeName = typeInfo ? typeInfo.name : `自定义类型(${typeId})`;
                
                allDamageEntries.push({
                    id: typeId,
                    name: typeName,
                    damage: typeDmg[typeId]
                });
            }
        }
    }
    
    // 按伤害值降序排序
    allDamageEntries.sort((a, b) => b.damage - a.damage);
    
    const labels = allDamageEntries.map(entry => entry.name);
    const dataValues = allDamageEntries.map(entry => entry.damage);

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
                        color: '#ff9800',
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
                                        fontColor: '#ff9800',
                                        color: '#ff9800',
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
                    titleColor: '#ff9800',
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

// --- 声骸词条详情函数 ---
function getEchoSubDetails(subs) {
    const details = {};
    subs.forEach(sub => {
        const data = SUBSTAT_DATA[sub.key];
        if (data && data.isPct) {
            const type = data.type;
            details[type] = (details[type] || 0) + sub.val;
        }
    });
    return details;
}

// 获取完整的声骸词条详情（包括百分比和固定值）
function getEchoSubDetailsFull(subs) {
    const details = {};
    // 获取基础属性值，用于将固定值转换为百分比
    const baseAtk = parseFloat(document.getElementById('base_atk').value) || 0;
    const baseHp = parseFloat(document.getElementById('base_hp')?.value) || 0;
    const baseDef = parseFloat(document.getElementById('base_def')?.value) || 0;
    
    subs.forEach(sub => {
        const data = SUBSTAT_DATA[sub.key];
        if (data) {
            const type = data.type;
            let value = sub.val;
            let isPct = data.isPct;
            
            // 如果是固定值，转换为百分比格式
            if (!data.isPct) {
                if (type === 'atk_flat' && baseAtk > 0) {
                    value = (sub.val / baseAtk) * 100;
                    isPct = true;
                } else if (type === 'hp_flat' && baseHp > 0) {
                    value = (sub.val / baseHp) * 100;
                    isPct = true;
                } else if (type === 'def_flat' && baseDef > 0) {
                    value = (sub.val / baseDef) * 100;
                    isPct = true;
                }
            }
            
            // 存储值和是否为百分比
            if (details[type]) {
                details[type].value += value;
            } else {
                details[type] = {
                    value: value,
                    isPct: isPct
                };
            }
        }
    });
    return details;
}

// --- 伤害变化分析函数 ---
function generateDamageChangeAnalysis(resBase, resA, resB, echoASubs, echoBSubs, gainA, gainB, diff, isEchoAEquipped) {
    // 获取声骸词条详情
    const echoADetails = getEchoSubDetails(echoASubs);
    const echoBDetails = getEchoSubDetails(echoBSubs);
    
    // 计算伤害类型变化
    const typeChanges = calculateTypeChanges(resBase.typeDmg, resB.typeDmg);
    
    let html = `
        <div style="margin-bottom:15px;">
            <h3 style="margin-top:0; color:#8B4513; font-size:1.1em; border-bottom:2px solid rgba(139, 69, 19, 0.3); padding-bottom:5px;">
                声骸替换影响分析
            </h3>
    `;
    
    html += `
            <div style="margin-bottom:10px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <span>当前装备: <strong style="color:#8B4513;">声骸 A</strong></span>
                    <span style="font-weight:bold;">${resBase.totalDmg.toFixed(0)}</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <span>替换为: <strong style="color:#A0522D;">声骸 B</strong></span>
                    <span style="font-weight:bold;">${resB.totalDmg.toFixed(0)}</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:10px; padding-top:8px; border-top:1px dashed rgba(139, 69, 19, 0.3);">
                    <span><strong>变化:</strong></span>
                    <span class="${gainB >= 0 ? 'diff-pos' : 'diff-neg'}" style="font-weight:bold; font-size:1.1em;">
                        ${gainB >= 0 ? '+' : ''}${gainB.toFixed(2)}%
                    </span>
                </div>
            </div>
        `;
    
    // 声骸词条对比表格（区分百分比和固定值）
    html += `
        <div style="margin-bottom:15px;">
            <h4 style="margin:10px 0 5px 0; color:#8B4513; font-size:0.95em;">声骸词条对比</h4>
            <div style="overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; font-size:11px;">
                    <thead>
                        <tr style="background:rgba(139, 69, 19, 0.1);">
                            <th style="padding:6px; text-align:left; border-bottom:1px solid rgba(139, 69, 19, 0.3);">词条类型</th>
                            <th style="padding:6px; text-align:right; border-bottom:1px solid rgba(139, 69, 19, 0.3);">声骸 A</th>
                            <th style="padding:6px; text-align:right; border-bottom:1px solid rgba(139, 69, 19, 0.3);">声骸 B</th>
                            <th style="padding:6px; text-align:right; border-bottom:1px solid rgba(139, 69, 19, 0.3);">差值</th>
                            <th style="padding:6px; text-align:center; border-bottom:1px solid rgba(139, 69, 19, 0.3);">单位</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    // 获取所有词条数据（包括百分比和固定值）
    const echoADetailsFull = getEchoSubDetailsFull(echoASubs);
    const echoBDetailsFull = getEchoSubDetailsFull(echoBSubs);
    
    // 合并所有词条类型
    const allSubTypes = new Set([...Object.keys(echoADetailsFull), ...Object.keys(echoBDetailsFull)]);
    let hasRows = false;
    
    // 转换为数组并排序
    const sortedSubTypes = Array.from(allSubTypes).sort();
    
    sortedSubTypes.forEach(subType => {
        const aData = echoADetailsFull[subType] || { value: 0, isPct: true };
        const bData = echoBDetailsFull[subType] || { value: 0, isPct: true };
        
        const aVal = aData.value;
        const bVal = bData.value;
        const isPct = aData.isPct || bData.isPct; // 优先显示百分比单位
        
        const diffVal = bVal - aVal;
        
        // 显示所有词条，包括A为0但B不为0的情况
        if (aVal !== 0 || bVal !== 0) {
            hasRows = true;
            const diffClass = diffVal > 0 ? 'diff-pos' : (diffVal < 0 ? 'diff-neg' : '');
            const diffSign = diffVal > 0 ? '+' : '';
            const unit = isPct ? '%' : '';
            
            html += `
                <tr style="border-bottom:1px solid rgba(139, 69, 19, 0.1);">
                    <td style="padding:6px;">${getSubstatName(subType)}</td>
                    <td style="padding:6px; text-align:right;">${aVal.toFixed(isPct ? 1 : 0)}${unit}</td>
                    <td style="padding:6px; text-align:right;">${bVal.toFixed(isPct ? 1 : 0)}${unit}</td>
                    <td style="padding:6px; text-align:right; ${diffClass ? `class="${diffClass}"` : ''}">
                        ${diffVal !== 0 ? `${diffSign}${diffVal.toFixed(isPct ? 1 : 0)}${unit}` : `0${unit}`}
                    </td>
                    <td style="padding:6px; text-align:center; color:#8b949e; font-size:10px;">
                        ${isPct ? '百分比' : '固定值'}
                    </td>
                </tr>
            `;
        }
    });
    
    // 如果没有词条数据，显示提示
    if (!hasRows) {
        html += `
            <tr>
                <td colspan="5" style="padding:10px; text-align:center; color:#8b949e;">
                    无有效词条数据
                </td>
            </tr>
        `;
    }
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    // 伤害类型变化表格
    if (typeChanges.length > 0) {
        html += `
            <div style="margin-bottom:15px;">
                <h4 style="margin:10px 0 5px 0; color:#8B4513; font-size:0.95em;">各伤害类型变化</h4>
                <div style="overflow-x:auto;">
                    <table style="width:100%; border-collapse:collapse; font-size:11px;">
                        <thead>
                            <tr style="background:rgba(139, 69, 19, 0.1);">
                                <th style="padding:6px; text-align:left; border-bottom:1px solid rgba(139, 69, 19, 0.3);">伤害类型</th>
                                <th style="padding:6px; text-align:right; border-bottom:1px solid rgba(139, 69, 19, 0.3);">变化前</th>
                                <th style="padding:6px; text-align:right; border-bottom:1px solid rgba(139, 69, 19, 0.3);">变化后</th>
                                <th style="padding:6px; text-align:right; border-bottom:1px solid rgba(139, 69, 19, 0.3);">变化量</th>
                                <th style="padding:6px; text-align:right; border-bottom:1px solid rgba(139, 69, 19, 0.3);">变化率</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        typeChanges.forEach(change => {
            const changeClass = change.changePercent > 0 ? 'diff-pos' : (change.changePercent < 0 ? 'diff-neg' : '');
            const changeSign = change.changePercent > 0 ? '+' : '';
            
            html += `
                <tr style="border-bottom:1px solid rgba(139, 69, 19, 0.1);">
                    <td style="padding:6px;">
                        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:6px; background:${getColorForType(change.type)};"></span>
                        ${change.typeName}
                    </td>
                    <td style="padding:6px; text-align:right;">${change.before.toFixed(0)}</td>
                    <td style="padding:6px; text-align:right;">${change.after.toFixed(0)}</td>
                    <td style="padding:6px; text-align:right; ${changeClass ? `class="${changeClass}"` : ''}">
                        ${change.change !== 0 ? `${changeSign}${change.change.toFixed(0)}` : '0'}
                    </td>
                    <td style="padding:6px; text-align:right; ${changeClass ? `class="${changeClass}"` : ''}">
                        ${change.changePercent !== 0 ? `${changeSign}${change.changePercent.toFixed(2)}%` : '0%'}
                    </td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    // 结论部分
    html += `
        <div style="border-top:2px solid rgba(139, 69, 19, 0.3); padding-top:10px; margin-top:10px;">
            <div style="font-weight:bold; font-size:1.1em; margin-bottom:5px; color:#8B4513;">
                结论: ${isEchoAEquipped ? 
                    (gainB > 0 ? `声骸 B 更强 <span class="diff-pos">${gainB.toFixed(2)}%</span>` : `声骸 A 更强 <span class="diff-neg">${Math.abs(gainB).toFixed(2)}%</span>`) :
                    (diff > 0 ? `声骸 A 强 <span class="diff-pos">${diff.toFixed(2)}%</span>` : `声骸 B 强 <span class="diff-neg">${Math.abs(diff).toFixed(2)}%</span>`)
                }
            </div>
            <div style="font-size:11px; color:#8b949e; background:rgba(139, 69, 19, 0.1); padding:8px; border-radius:6px; margin-top:8px;">
                💡 ${isEchoAEquipped ? 
                    '假设声骸A已装备在角色身上，计算替换为声骸B后的伤害变化' :
                    '对比声骸A和声骸B相对于无任何声骸的提升效果'
                }
            </div>
        </div>
    `;
    
    return html;
}

// --- 详细加成信息显示函数 ---
function displayDetailedBonusInfo(detailedInfo) {
    // 获取中间面板的伤害组成容器
    let damageCompositionContainer = document.getElementById('damageComposition');
    if (!damageCompositionContainer) {
        console.error('找不到伤害组成容器');
        return;
    }

    if (detailedInfo.length === 0) {
        // 如果已经有伤害组成表格，不要覆盖它
        if (!damageCompositionContainer.innerHTML.includes('伤害组成详情')) {
            damageCompositionContainer.innerHTML = '<div style="text-align:center; color:#8b949e; padding:20px;">暂无加成信息</div>';
        }
        return;
    }

    // 保存原有的伤害组成表格
    const originalDamageComposition = damageCompositionContainer.innerHTML;
    
    let html = `
        <div style="margin-top:20px; border-top:1px solid rgba(139, 69, 19, 0.3); padding-top:15px;">
            <h3 style="margin-top:0; color:#8B4513; font-size:1.1em; border-bottom:2px solid rgba(139, 69, 19, 0.3); padding-bottom:5px;">
                详细加成分析（按伤害类型分类）
            </h3>
            <div style="font-size:11px; color:#8b949e; margin-bottom:10px;">
                按伤害类型统计平均加成倍率，未涉及的伤害类型不显示
            </div>
    `;

    // 1. 按伤害类型分组统计
    const damageTypeGroups = {};
    
    // 初始化分组
    DAMAGE_TYPES.forEach(type => {
        if (type.id !== 'all') {
            damageTypeGroups[type.id] = {
                typeName: type.name,
                actions: [],
                scalingTypes: new Set(), // 记录涉及的基数类型
                totalAttrBonusPct: 0,
                totalDamageBonusPct: 0,
                totalDamageDeepenPct: 0,
                totalCritRate: 0,
                totalCritDamage: 0,
                totalCritMultiplier: 0,
                totalPanelExistingPct: 0,
                count: 0
            };
        }
    });
    
    // 填充分组数据（只处理启用的动作）
    detailedInfo.forEach(info => {
        // 获取对应的动作，检查是否启用
        const action = sequence[info.actionIndex];
        if (action && action.enabled === false) {
            return; // 跳过未启用的动作
        }
        const group = damageTypeGroups[info.damageType];
        if (group) {
            group.actions.push(info.actionName);
            group.scalingTypes.add(info.scalingType);
            group.totalAttrBonusPct += info.totalAttrBonusPct;
            group.totalDamageBonusPct += info.totalDamageBonusPct;
            group.totalDamageDeepenPct += info.totalDamageDeepenPct;
            group.totalCritRate += info.critRate;
            group.totalCritDamage += info.critDamage;
            group.totalCritMultiplier += info.critMultiplier;
            group.totalPanelExistingPct += (info.panelExistingPct || 0);
            group.count++;
        }
    });
    
    // 2. 只显示有数据的伤害类型
    const validDamageTypes = Object.keys(damageTypeGroups).filter(typeId => 
        damageTypeGroups[typeId].count > 0
    );
    
    if (validDamageTypes.length === 0) {
        html += `
            <div style="text-align:center; color:#8b949e; padding:20px;">
                暂无有效的伤害类型数据
            </div>
        `;
    } else {
        // 3. 为每个有数据的伤害类型创建统计表格
        validDamageTypes.forEach(typeId => {
            const group = damageTypeGroups[typeId];
            const avgAttrBonusPct = group.totalAttrBonusPct / group.count;
            const avgDamageBonusPct = group.totalDamageBonusPct / group.count;
            const avgDamageDeepenPct = group.totalDamageDeepenPct / group.count;
            const avgCritRate = group.totalCritRate / group.count;
            const avgCritDamage = group.totalCritDamage / group.count;
            const avgCritMultiplier = group.totalCritMultiplier / group.count;
            const avgPanelExistingPct = group.totalPanelExistingPct / group.count;
            
            // 计算实际倍率
            const totalAttrPct = avgPanelExistingPct + avgAttrBonusPct;
            const attrMultiplier = 1 + totalAttrPct / 100;
            const damageBonusMultiplier = 1 + avgDamageBonusPct / 100;
            const damageDeepenMultiplier = 1 + avgDamageDeepenPct / 100;
            
            // 基数类型描述
            const scalingTypesArray = Array.from(group.scalingTypes);
            const scalingDesc = scalingTypesArray.map(type => {
                const names = { 'atk': '攻击力', 'hp': '生命值', 'def': '防御力' };
                return names[type] || type;
            }).join('、');
            
            // 动作列表（最多显示3个）
            const actionList = group.actions.length > 3 
                ? group.actions.slice(0, 3).join('、') + ` 等${group.actions.length}个动作`
                : group.actions.join('、');
            
            html += `
                <div style="margin-bottom:20px; border:2px solid ${getColorForType(typeId)}; border-radius:12px; padding:15px; background:rgba(255, 255, 255, 0.95);">
                    <div style="display:flex; align-items:center; margin-bottom:12px;">
                        <span style="display:inline-block; width:12px; height:12px; border-radius:50%; margin-right:8px; background:${getColorForType(typeId)};"></span>
                        <div style="font-weight:bold; color:#8B4513; font-size:1.1em;">
                            ${group.typeName} 伤害统计
                        </div>
                        <div style="margin-left:auto; font-size:11px; color:#8b949e;">
                            共 ${group.count} 个动作
                        </div>
                    </div>
                    
                    <div style="font-size:11px; color:#8b949e; margin-bottom:10px; padding:8px; background:rgba(139, 69, 19, 0.05); border-radius:6px;">
                        <div><strong>涉及动作：</strong>${actionList}</div>
                        <div><strong>基数类型：</strong>${scalingDesc || '无'}</div>
                    </div>
                    
                    <table style="width:100%; border-collapse:collapse; font-size:11px;">
                        <thead>
                            <tr style="background:rgba(139, 69, 19, 0.1);">
                                <th style="padding:8px; text-align:left; border-bottom:2px solid rgba(139, 69, 19, 0.3);">加成类型</th>
                                <th style="padding:8px; text-align:right; border-bottom:2px solid rgba(139, 69, 19, 0.3);">面板已有</th>
                                <th style="padding:8px; text-align:right; border-bottom:2px solid rgba(139, 69, 19, 0.3);">额外加成</th>
                                <th style="padding:8px; text-align:right; border-bottom:2px solid rgba(139, 69, 19, 0.3);">总加成</th>
                                <th style="padding:8px; text-align:right; border-bottom:2px solid rgba(139, 69, 19, 0.3);">实际倍率</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding:8px;">属性加成</td>
                                <td style="padding:8px; text-align:right; color:#8b949e;">
                                    ${avgPanelExistingPct.toFixed(2)}%
                                </td>
                                <td style="padding:8px; text-align:right; color:#4a6bff; font-weight:bold;">
                                    ${avgAttrBonusPct > 0 ? '+' : ''}${avgAttrBonusPct.toFixed(2)}%
                                </td>
                                <td style="padding:8px; text-align:right; color:#4a6bff; font-weight:bold;">
                                    ${totalAttrPct.toFixed(2)}%
                                </td>
                                <td style="padding:8px; text-align:right; color:#4a6bff; font-weight:bold;">
                                    ${attrMultiplier.toFixed(3)}倍
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:8px;">伤害加成</td>
                                <td style="padding:8px; text-align:right; color:#8b949e;">-</td>
                                <td style="padding:8px; text-align:right; color:#ff9800; font-weight:bold;">
                                    ${avgDamageBonusPct > 0 ? '+' : ''}${avgDamageBonusPct.toFixed(2)}%
                                </td>
                                <td style="padding:8px; text-align:right; color:#ff9800; font-weight:bold;">
                                    ${avgDamageBonusPct.toFixed(2)}%
                                </td>
                                <td style="padding:8px; text-align:right; color:#ff9800; font-weight:bold;">
                                    ${damageBonusMultiplier.toFixed(3)}倍
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:8px;">伤害加深</td>
                                <td style="padding:8px; text-align:right; color:#8b949e;">-</td>
                                <td style="padding:8px; text-align:right; color:#4caf50; font-weight:bold;">
                                    ${avgDamageDeepenPct > 0 ? '+' : ''}${avgDamageDeepenPct.toFixed(2)}%
                                </td>
                                <td style="padding:8px; text-align:right; color:#4caf50; font-weight:bold;">
                                    ${avgDamageDeepenPct.toFixed(2)}%
                                </td>
                                <td style="padding:8px; text-align:right; color:#4caf50; font-weight:bold;">
                                    ${damageDeepenMultiplier.toFixed(3)}倍
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div style="margin-top:12px; font-size:11px; color:#8b949e; background:rgba(139, 69, 19, 0.05); padding:10px; border-radius:6px;">
                        <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px;">
                            <div>
                                <span>平均暴击率：</span>
                                <strong style="color:#ff4081;">${avgCritRate.toFixed(1)}%</strong>
                            </div>
                            <div>
                                <span>平均暴击伤害：</span>
                                <strong style="color:#ff4081;">${avgCritDamage.toFixed(1)}%</strong>
                            </div>
                            <div>
                                <span>平均暴击期望倍率：</span>
                                <strong style="color:#ff4081;">${avgCritMultiplier.toFixed(3)}倍</strong>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    // 添加总计信息 - 分别统计不同基数的属性加成
    // 分别统计攻击、生命、防御的加成
    // 首先获取面板基础数据
    const baseAtk = parseFloat(document.getElementById('base_atk').value) || 0;
    const totalAtkNow = parseFloat(document.getElementById('total_atk_now').value) || 0;
    const baseHp = parseFloat(document.getElementById('base_hp')?.value) || 0;
    const totalHpNow = parseFloat(document.getElementById('total_hp_now')?.value) || 0;
    const baseDef = parseFloat(document.getElementById('base_def').value) || 0;
    const totalDefNow = parseFloat(document.getElementById('total_def_now')?.value) || 0;
    
    // 计算面板已有百分比加成
    const panelAtkPct = baseAtk > 0 ? ((totalAtkNow / baseAtk) - 1) * 100 : 0;
    const panelHpPct = baseHp > 0 ? ((totalHpNow / baseHp) - 1) * 100 : 0;
    const panelDefPct = baseDef > 0 ? ((totalDefNow / baseDef) - 1) * 100 : 0;
    
    let totalAtkBonus = 0;
    let totalHpBonus = 0;
    let totalDefBonus = 0;
    let atkCount = 0, hpCount = 0, defCount = 0;
    
    // 只统计启用的动作
    const enabledDetailedInfo = detailedInfo.filter((info, idx) => {
        const action = sequence[info.actionIndex];
        return !(action && action.enabled === false);
    });
    
    // 注意：info.damageBonusPct 和 info.damageDeepenPct 只包含额外加成
    // 但用户可能更关心总加成效果，所以使用 totalDamageBonusPct 和 totalDamageDeepenPct
    const totalDamageBonus = enabledDetailedInfo.reduce((sum, info) => sum + info.totalDamageBonusPct, 0);
    const totalDamageDeepen = enabledDetailedInfo.reduce((sum, info) => sum + info.totalDamageDeepenPct, 0);
    
    // 分别统计不同基数的属性加成
    // 注意：info.attrBonusPct 只包含声骸和Buff带来的额外加成
    // 我们需要加上面板已有加成
    enabledDetailedInfo.forEach(info => {
        if (info.scalingType === 'atk') {
            // 总加成 = 面板已有加成 + 额外加成
            totalAtkBonus += panelAtkPct + info.attrBonusPct;
            atkCount++;
        } else if (info.scalingType === 'hp') {
            totalHpBonus += panelHpPct + info.attrBonusPct;
            hpCount++;
        } else if (info.scalingType === 'def') {
            totalDefBonus += panelDefPct + info.attrBonusPct;
            defCount++;
        }
    });
    
    // 计算平均实际倍率
    const avgAtkMultiplier = atkCount > 0 ? 1 + (totalAtkBonus / atkCount) / 100 : 1;
    const avgHpMultiplier = hpCount > 0 ? 1 + (totalHpBonus / hpCount) / 100 : 1;
    const avgDefMultiplier = defCount > 0 ? 1 + (totalDefBonus / defCount) / 100 : 1;
    
    // 注意：totalDamageBonus 和 totalDamageDeepen 只包含额外加成
    // 伤害加成和伤害加深没有"面板已有"的概念，所以直接计算平均值
    const avgDamageBonusPct = enabledDetailedInfo.length > 0 ? 
        (totalDamageBonus / enabledDetailedInfo.length) : 0;
    const avgDamageDeepenPct = enabledDetailedInfo.length > 0 ? 
        (totalDamageDeepen / enabledDetailedInfo.length) : 0;
        
    const avgDamageBonusMultiplier = 1 + avgDamageBonusPct / 100;
    const avgDamageDeepenMultiplier = 1 + avgDamageDeepenPct / 100;
    
    // 计算平均暴击信息（只统计启用的动作）
    const avgCritRate = enabledDetailedInfo.reduce((sum, info) => sum + info.critRate, 0) / enabledDetailedInfo.length;
    const avgCritDamage = enabledDetailedInfo.reduce((sum, info) => sum + info.critDamage, 0) / enabledDetailedInfo.length;
    const avgCritMultiplier = enabledDetailedInfo.reduce((sum, info) => sum + info.critMultiplier, 0) / enabledDetailedInfo.length;

    html += `
        <div style="margin-top:15px; border-top:2px solid rgba(139, 69, 19, 0.3); padding-top:10px;">
            <div style="font-weight:bold; color:#8B4513; margin-bottom:5px;">总计加成（所有动作平均）</div>
    `;
    
    // 显示不同基数的属性加成
    if (atkCount > 0) {
        const avgAtkBonus = totalAtkBonus / atkCount;
        html += `
            <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                <span>平均攻击加成（总）：</span>
                <span style="color:#4a6bff; font-weight:bold;">${avgAtkBonus.toFixed(2)}% (${avgAtkMultiplier.toFixed(3)}倍)</span>
            </div>
        `;
        // 显示面板已有加成和额外加成的细分
        html += `
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:2px; padding-left:10px; color:#8b949e;">
                <span>├─ 面板已有：${panelAtkPct.toFixed(2)}%</span>
                <span>额外：${(avgAtkBonus - panelAtkPct).toFixed(2)}%</span>
            </div>
        `;
    } else {
        html += `
            <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; color:#8b949e;">
                <span>平均攻击加成：</span>
                <span>无基于攻击的动作</span>
            </div>
        `;
    }
    if (hpCount > 0) {
        const avgHpBonus = totalHpBonus / hpCount;
        html += `
            <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                <span>平均生命加成（总）：</span>
                <span style="color:#4a6bff; font-weight:bold;">${avgHpBonus.toFixed(2)}% (${avgHpMultiplier.toFixed(3)}倍)</span>
            </div>
        `;
        // 显示面板已有加成和额外加成的细分
        html += `
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:2px; padding-left:10px; color:#8b949e;">
                <span>├─ 面板已有：${panelHpPct.toFixed(2)}%</span>
                <span>额外：${(avgHpBonus - panelHpPct).toFixed(2)}%</span>
            </div>
        `;
    } else {
        html += `
            <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; color:#8b949e;">
                <span>平均生命加成：</span>
                <span>无基于生命的动作</span>
            </div>
        `;
    }
    if (defCount > 0) {
        const avgDefBonus = totalDefBonus / defCount;
        html += `
            <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                <span>平均防御加成（总）：</span>
                <span style="color:#4a6bff; font-weight:bold;">${avgDefBonus.toFixed(2)}% (${avgDefMultiplier.toFixed(3)}倍)</span>
            </div>
        `;
        // 显示面板已有加成和额外加成的细分
        html += `
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:2px; padding-left:10px; color:#8b949e;">
                <span>├─ 面板已有：${panelDefPct.toFixed(2)}%</span>
                <span>额外：${(avgDefBonus - panelDefPct).toFixed(2)}%</span>
            </div>
        `;
    } else {
        html += `
            <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; color:#8b949e;">
                <span>平均防御加成：</span>
                <span>无基于防御的动作</span>
            </div>
        `;
    }
    
    html += `
            <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                <span>平均伤害加成（总）：</span>
                <span style="color:#ff9800; font-weight:bold;">${avgDamageBonusPct.toFixed(2)}% (${avgDamageBonusMultiplier.toFixed(3)}倍)</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                <span>平均伤害加深（总）：</span>
                <span style="color:#4caf50; font-weight:bold;">${avgDamageDeepenPct.toFixed(2)}% (${avgDamageDeepenMultiplier.toFixed(3)}倍)</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; padding-top:4px; border-top:1px dashed rgba(139, 69, 19, 0.2);">
                <span>平均暴击率：</span>
                <span style="color:#ff4081; font-weight:bold;">${avgCritRate.toFixed(1)}%</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                <span>平均暴击伤害：</span>
                <span style="color:#ff4081; font-weight:bold;">${avgCritDamage.toFixed(1)}%</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                <span>平均暴击期望倍率：</span>
                <span style="color:#ff4081; font-weight:bold;">${avgCritMultiplier.toFixed(3)}倍</span>
            </div>
            <div style="margin-top:8px; padding-top:8px; border-top:1px dashed rgba(139, 69, 19, 0.2); font-size:11px; color:#8b949e;">
                💡 实际倍率 = 1 + 总加成百分比/100。例如：50%加成 = 1.5倍<br>
                💡 暴击期望倍率 = 1 + 暴击率 × (暴击伤害 - 1)<br>
                💡 属性加成按基数类型（攻击/生命/防御）分别统计<br>
                💡 属性"总加成"包括面板已有加成（基础→当前面板）和声骸、Buff等带来的额外提升<br>
                💡 伤害加成和伤害加深统计总加成（包括静态加成和动态Buff）
            </div>
        </div>
        </div>
    `;

    // 将详细加成信息添加到伤害组成容器中
    // 注意：这里我们保留原有的伤害组成表格，将详细加成信息添加在后面
    damageCompositionContainer.innerHTML = originalDamageComposition + html;
    
    // 隐藏声骸区下方的详细加成信息容器
    const bonusContainer = document.getElementById('detailed_bonus_info');
    if (bonusContainer) {
        bonusContainer.style.display = 'none';
    }
}