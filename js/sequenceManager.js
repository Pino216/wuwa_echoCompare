// sequenceManager.js
// 动作序列管理

// 全局状态
let sequence = [];

// 添加动作
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
        activeBuffs: [],
        enabled: true // 默认启用
    });

    renderSequence();
    // 添加动作后立即计算（关键操作，函数内部会检查序列是否为空）
    immediateCalculate();
}

// 渲染动作序列
function renderSequence() {
    updateBuffPool(true);
    const container = document.getElementById('action_sequence');
    container.innerHTML = sequence.map((a, i) => {
        // 检查动作类型是否在DAMAGE_TYPES中，如果不在（可能是已删除的自定义类型），则跳过渲染
        // 但实际上，这些动作应该已经在removeCustomDamageType中被过滤掉了
        const typeExists = DAMAGE_TYPES.some(t => t.id === a.type);
        if (!typeExists) {
            // 如果类型不存在，使用默认类型
            a.type = 'skill';
        }
        
        // 生成伤害类型选项
        const typeOptions = DAMAGE_TYPES.map(t => 
            `<option value="${t.id}" ${t.id === a.type ? 'selected' : ''}>${t.name}</option>`
        ).join('');
        
        // 转义动作名称，防止破坏HTML属性
        const escapedName = a.name.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        // 用于确认消息的动作名称（需要转义JavaScript字符串中的特殊字符）
        const jsEscapedName = a.name.replace(/'/g, "\\'").replace(/"/g, '\\"');
        
        // 添加启用复选框
        const enabledChecked = a.enabled !== false ? 'checked' : '';
        
        return `
        <div class="action-card" data-index="${i}" style="${a.enabled === false ? 'opacity:0.6; background:rgba(0,0,0,0.05);' : ''}">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <div style="display:flex; align-items:center; gap:4px;">
                    <input type="checkbox" class="action-enabled" ${enabledChecked} 
                           onchange="toggleActionEnabled(${i}, this.checked)" 
                           style="width:16px; height:16px; cursor:pointer;">
                    <span style="font-size:11px; color:#8B4513; white-space:nowrap;">启用</span>
                </div>
                <input type="text" class="action-name" value="${escapedName}" style="width: 100px; flex: 1;" 
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
                <span style="position:absolute; right:10px; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--accent); font-size:1.2em; font-weight:bold;" 
                      onclick="confirmDelete('确定要删除动作${jsEscapedName}吗？', () => { sequence.splice(${i},1); renderSequence(); calculate(); })">×</span>
            </div>
            <div style="margin-top:6px;">
                ${(() => {
                    const filteredBuffs = buffFilterGroupId ? 
                        buffPool.filter(b => b.group === buffFilterGroupId) : 
                        buffPool;
                    return filteredBuffs.map(b => `
                        <div class="chip ${a.activeBuffs.includes(b.id) ? 'active' : ''}"
                             data-bid="${b.id}" onclick="toggleBuff(${i}, '${b.id}')">
                            ${b.name}
                        </div>
                    `).join('');
                })()}
            </div>
        </div>
    `}).join('');
}

// 更新动作名称
function updateActionName(index, newName) {
    if (index >= 0 && index < sequence.length) {
        sequence[index].name = newName;
        renderSequence();
        // 使用防抖计算，函数内部会检查序列是否为空
        debouncedCalculate();
    }
}

// 更新动作倍率
function updateActionMult(index, newMult) {
    if (index >= 0 && index < sequence.length) {
        sequence[index].mult = parseFloat(newMult) / 100;
        renderSequence();
        // 使用防抖计算，函数内部会检查序列是否为空
        debouncedCalculate();
    }
}

// 更新动作类型
function updateActionType(index, newType) {
    if (index >= 0 && index < sequence.length) {
        sequence[index].type = newType;
        renderSequence();
        // 使用防抖计算，函数内部会检查序列是否为空
        debouncedCalculate();
    }
}

// 更新动作基数
function updateActionScaling(index, newScaling) {
    if (index >= 0 && index < sequence.length) {
        sequence[index].scaling = newScaling;
        renderSequence();
        // 使用防抖计算，函数内部会检查序列是否为空
        debouncedCalculate();
    }
}

// 切换动作启用状态
function toggleActionEnabled(index, enabled) {
    if (index >= 0 && index < sequence.length) {
        sequence[index].enabled = enabled;
        renderSequence();
        // 立即重新计算
        immediateCalculate();
    }
}

// 切换Buff关联
function toggleBuff(actIdx, buffId) {
    const bIdx = sequence[actIdx].activeBuffs.indexOf(buffId);
    if(bIdx > -1) sequence[actIdx].activeBuffs.splice(bIdx, 1);
    else sequence[actIdx].activeBuffs.push(buffId);
    renderSequence();
    // 关键操作，立即计算（函数内部会检查序列是否为空）
    immediateCalculate();
}