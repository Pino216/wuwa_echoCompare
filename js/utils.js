// utils.js
// 工具函数

// 防抖定时器
let debounceTimer = null;

// 颜色转换工具
function hexToRgba(hex, alpha = 0.1) {
    // 移除#号
    hex = hex.replace('#', '');
    // 解析RGB值
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// 获取下一个可用的组颜色
function getNextAvailableColor() {
    const usedColors = buffGroups.map(g => g.color);
    for (const color of GROUP_COLORS) {
        if (!usedColors.includes(color)) {
            return color;
        }
    }
    // 如果所有颜色都被使用，随机生成一个颜色
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
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

// 获取词条名称
function getSubstatName(type) {
    for (const key in SUBSTAT_DATA) {
        if (SUBSTAT_DATA[key].type === type) {
            return SUBSTAT_DATA[key].name;
        }
    }
    return type;
}

// 计算伤害类型变化
function calculateTypeChanges(beforeDmg, afterDmg) {
    const changes = [];
    DAMAGE_TYPES.forEach(type => {
        if (type.id !== 'all') {
            const before = beforeDmg[type.id] || 0;
            const after = afterDmg[type.id] || 0;
            if (before > 0 || after > 0) {
                const change = after - before;
                const changePercent = before > 0 ? (change / before * 100) : (after > 0 ? 100 : 0);
                changes.push({
                    type: type.id,
                    typeName: type.name,
                    before: before,
                    after: after,
                    change: change,
                    changePercent: changePercent
                });
            }
        }
    });
    // 按变化量绝对值排序
    changes.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
    return changes;
}

// 防抖计算函数
function debouncedCalculate(delay = 300) {
    // 清除之前的定时器
    clearTimeout(debounceTimer);
    
    // 检查序列是否为空
    if (sequence.length === 0) {
        // 序列为空时，不进行计算，只更新UI状态
        updateEmptyState();
        return;
    }
    
    // 设置新的定时器
    debounceTimer = setTimeout(() => {
        // 再次检查序列是否为空（可能在延迟期间被清空）
        if (sequence.length > 0) {
            calculate();
        } else {
            updateEmptyState();
        }
    }, delay);
}

// 立即计算函数（用于关键操作）
function immediateCalculate() {
    clearTimeout(debounceTimer);
    if (sequence.length > 0) {
        calculate();
    } else {
        updateEmptyState();
    }
}

// 更新空状态UI
function updateEmptyState() {
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
}

// 确认删除自定义类型
function confirmDeleteCustomType(typeId, typeName) {
    const message = `确定要删除自定义伤害类型"${typeName}"吗？\n\n注意：删除后，使用此类型的配置将恢复为默认类型。`;
    confirmDelete(message, () => removeCustomDamageType(typeId));
}

// 确认删除函数，支持"不再提示"选项
function confirmDelete(message, callback) {
    // 检查是否已经选择"不再提示"
    const skipConfirm = sessionStorage.getItem('skipDeleteConfirm');
    if (skipConfirm === 'true') {
        callback();
        return;
    }
    
    // 创建确认弹窗
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        max-width: 400px;
        width: 90%;
        border: 2px solid #8B4513;
    `;
    
    const messageEl = document.createElement('div');
    messageEl.textContent = message;
    messageEl.style.marginBottom = '20px';
    messageEl.style.color = '#8B4513';
    messageEl.style.fontSize = '14px';
    messageEl.style.lineHeight = '1.5';
    messageEl.style.whiteSpace = 'pre-line';
    
    const checkboxContainer = document.createElement('div');
    checkboxContainer.style.marginBottom = '16px';
    checkboxContainer.style.display = 'flex';
    checkboxContainer.style.alignItems = 'center';
    checkboxContainer.style.gap = '8px';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'skipConfirmCheckbox';
    checkbox.style.width = '16px';
    checkbox.style.height = '16px';
    
    const checkboxLabel = document.createElement('label');
    checkboxLabel.htmlFor = 'skipConfirmCheckbox';
    checkboxLabel.textContent = '不再提示';
    checkboxLabel.style.fontSize = '12px';
    checkboxLabel.style.color = '#8b949e';
    checkboxLabel.style.cursor = 'pointer';
    
    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(checkboxLabel);
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'flex-end';
    buttonContainer.style.gap = '12px';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '取消';
    cancelBtn.style.cssText = `
        padding: 8px 16px;
        background: linear-gradient(135deg, #8b949e, #6e7681);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
    `;
    cancelBtn.onclick = function() {
        document.body.removeChild(overlay);
    };
    
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '确认删除';
    confirmBtn.style.cssText = `
        padding: 8px 16px;
        background: linear-gradient(135deg, #ff6b8b, #ff8ba3);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
    `;
    confirmBtn.onclick = function() {
        // 保存"不再提示"选项
        if (checkbox.checked) {
            sessionStorage.setItem('skipDeleteConfirm', 'true');
        }
        document.body.removeChild(overlay);
        callback();
    };
    
    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(confirmBtn);
    
    modal.appendChild(messageEl);
    modal.appendChild(checkboxContainer);
    modal.appendChild(buttonContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

// 获取自定义文件名
function getCustomFileName(defaultName, extension) {
    const userInput = prompt(`请输入文件名（不含扩展名）:\n\n默认: ${defaultName}`, defaultName);
    if (userInput === null) {
        // 用户取消
        return null;
    }
    const trimmed = userInput.trim();
    if (trimmed === '') {
        // 用户输入为空，使用默认
        return `${defaultName}.${extension}`;
    }
    // 确保文件名安全：移除非法字符
    const safeName = trimmed.replace(/[<>:"/\\|?*]/g, '_');
    return `${safeName}.${extension}`;
}