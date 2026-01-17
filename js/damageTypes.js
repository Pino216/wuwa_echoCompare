// damageTypes.js
// 伤害类型管理

// 伤害类型数组（可变，包含自定义类型）
let DAMAGE_TYPES = [...INITIAL_DAMAGE_TYPES];

// 从本地存储加载自定义伤害类型
function loadCustomDamageTypesFromStorage() {
    try {
        const saved = localStorage.getItem('mingchao_damage_calc_v1.4');
        if (saved) {
            const data = JSON.parse(saved);
            if (data.damage_types && Array.isArray(data.damage_types)) {
                // 移除现有的自定义类型
                DAMAGE_TYPES = DAMAGE_TYPES.filter(t => !t.id.startsWith('custom_'));
                // 添加导入的自定义类型
                data.damage_types.forEach(t => {
                    // 确保自定义类型ID以'custom_'开头
                    const typeId = t.id.startsWith('custom_') ? t.id : 'custom_' + t.id;
                    DAMAGE_TYPES.push({
                        id: typeId,
                        name: t.name
                    });
                });
                return true;
            }
        }
    } catch (error) {
        console.warn('加载自定义伤害类型失败:', error);
    }
    return false;
}

// 添加自定义伤害类型
function addCustomDamageType() {
    const customId = 'custom_' + Date.now();
    const customName = prompt('请输入自定义伤害类型名称：', '自定义类型');
    if (customName && customName.trim()) {
        DAMAGE_TYPES.push({ id: customId, name: customName.trim() });
        updateAllDamageTypeSelects();
        alert('已添加自定义伤害类型：' + customName.trim());
    }
}

// 删除自定义伤害类型
function removeCustomDamageType(typeId) {
    if (typeId.startsWith('custom_')) {
        // 查找要删除的类型名称
        const typeToDelete = DAMAGE_TYPES.find(t => t.id === typeId);
        const typeName = typeToDelete ? typeToDelete.name : '未知类型';

        if (confirm(`确定要删除自定义伤害类型"${typeName}"吗？\n\n注意：删除后，所有使用此类型的配置（面板加成、动态Buff、动作序列）都将被安全删除。`)) {
            // 1. 从DAMAGE_TYPES中删除
            DAMAGE_TYPES = DAMAGE_TYPES.filter(t => t.id !== typeId);
        
            // 2. 删除使用该类型的静态加成
            const staticBonusItems = document.querySelectorAll('.static-bonus-item');
            staticBonusItems.forEach(item => {
                const typeSelect = item.querySelector('.s-type');
                if (typeSelect && typeSelect.value === typeId) {
                    item.remove();
                }
            });
        
            // 3. 删除使用该类型的动态Buff
            const buffConfigs = document.querySelectorAll('.buff-config');
            buffConfigs.forEach(buff => {
                const typeSelect = buff.querySelector('.b-type');
                if (typeSelect && typeSelect.value === typeId) {
                    buff.remove();
                }
            });
        
            // 4. 删除使用该类型的动作序列
            sequence = sequence.filter(action => action.type !== typeId);
        
            // 5. 更新界面
            updateBuffPool(true);
            updateAllDamageTypeSelects();
            renderSequence();
            renderBuffPagination();
        
            // 6. 重新计算
            if (sequence.length > 0) {
                calculate(false);
            }
    
            // 7. 关闭管理面板
            closeCustomTypesPanel();
        
            // 8. 显示成功消息
            alert('✅ 已删除自定义伤害类型及其相关配置');
        }
    } else {
        alert('❌ 系统默认类型不能删除');
    }
}

// 显示自定义类型管理面板
function showCustomTypes() {
    const customTypes = DAMAGE_TYPES.filter(t => t.id.startsWith('custom_'));

    // 创建管理面板
    const panel = document.createElement('div');
    panel.className = 'custom-types-panel';
    panel.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        z-index: 10000;
        min-width: 400px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        border: 2px solid #8B4513;
    `;

    let html = `
        <h3 style="margin-top:0; color:#8B4513; border-bottom:2px solid rgba(139, 69, 19, 0.3); padding-bottom:10px;">
            管理自定义伤害类型
        </h3>
    `;

    if (customTypes.length === 0) {
        html += `
            <div style="text-align:center; padding:20px; color:#8b949e;">
                暂无自定义伤害类型
            </div>
        `;
    } else {
        html += `
            <div style="margin-bottom:15px;">
                <table style="width:100%; border-collapse:collapse;">
                    <thead>
                        <tr style="background:rgba(139, 69, 19, 0.1);">
                            <th style="padding:8px; text-align:left; border-bottom:2px solid rgba(139, 69, 19, 0.3);">类型名称</th>
                            <th style="padding:8px; text-align:center; border-bottom:2px solid rgba(139, 69, 19, 0.3); width:120px;">操作</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
    
        customTypes.forEach(t => {
            html += `
                <tr style="border-bottom:1px solid rgba(139, 69, 19, 0.1);">
                    <td style="padding:8px;">
                        <span style="display:inline-block; width:12px; height:12px; border-radius:50%; margin-right:8px; background:${getColorForType(t.id)};"></span>
                        ${t.name}
                    </td>
                    <td style="padding:8px; text-align:center;">
                        <button onclick="editCustomType('${t.id}')" style="
                            background:linear-gradient(135deg, #4a6bff, #6a8bff);
                            color:white;
                            border:none;
                            padding:4px 10px;
                            border-radius:6px;
                            cursor:pointer;
                            font-size:11px;
                            margin-right:5px;
                        ">编辑</button>
                        <button onclick="confirmDeleteCustomType('${t.id}', '${t.name.replace(/'/g, "\\'")}')" style="
                            background:linear-gradient(135deg, #ff6b8b, #ff8ba3);
                            color:white;
                            border:none;
                            padding:4px 10px;
                            border-radius:6px;
                            cursor:pointer;
                            font-size:11px;
                        ">删除</button>
                    </td>
                </tr>
            `;
        });
    
        html += `
                    </tbody>
                </table>
            </div>
        `;
    }

    html += `
        <div style="margin-top:20px; display:flex; justify-content:space-between; gap:10px;">
            <button onclick="closeCustomTypesPanel()" style="
                flex:1;
                background:linear-gradient(135deg, #8b949e, #6e7681);
                color:white;
                border:none;
                padding:10px;
                border-radius:8px;
                cursor:pointer;
                font-weight:bold;
            ">关闭</button>
            <button onclick="addCustomDamageTypeFromPanel()" style="
                flex:1;
                background:linear-gradient(135deg, #4caf50, #66bb6a);
                color:white;
                border:none;
                padding:10px;
                border-radius:8px;
                cursor:pointer;
                font-weight:bold;
            ">+ 添加新类型</button>
        </div>
    `;

    panel.innerHTML = html;

    // 添加遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'custom-types-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
    `;
    overlay.onclick = function() {
        closeCustomTypesPanel();
    };

    document.body.appendChild(overlay);
    document.body.appendChild(panel);
}

// 从面板添加自定义伤害类型
function addCustomDamageTypeFromPanel() {
    const customName = prompt('请输入自定义伤害类型名称：', '自定义类型');
    if (customName && customName.trim()) {
        const customId = 'custom_' + Date.now();
        DAMAGE_TYPES.push({ id: customId, name: customName.trim() });
        updateAllDamageTypeSelects();
    
        // 关闭当前面板
        closeCustomTypesPanel();
    
        // 重新计算
        if (sequence.length > 0) {
            calculate(false);
        }
    
        // 重新打开管理面板
        setTimeout(showCustomTypes, 100);
    }
}

// 关闭自定义类型管理面板
function closeCustomTypesPanel() {
    // 使用类名精确查找并移除元素
    const overlay = document.querySelector('.custom-types-overlay');
    const panel = document.querySelector('.custom-types-panel');
    
    if (overlay && overlay.parentNode === document.body) {
        document.body.removeChild(overlay);
    }
    if (panel && panel.parentNode === document.body) {
        document.body.removeChild(panel);
    }
    
    // 如果通过类名找不到，尝试通过内容查找作为备用方案
    if (!overlay || !panel) {
        // 查找遮罩层
        const overlays = document.querySelectorAll('body > div');
        overlays.forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.position === 'fixed' && 
                style.top === '0px' && 
                style.left === '0px' && 
                style.width === '100%' && 
                style.height === '100%' && 
                (style.backgroundColor === 'rgba(0, 0, 0, 0.5)' || style.background === 'rgba(0, 0, 0, 0.5)') &&
                style.zIndex === '9999') {
                if (el.parentNode === document.body) {
                    document.body.removeChild(el);
                }
            }
        });
        
        // 查找面板
        const panels = document.querySelectorAll('body > div');
        panels.forEach(el => {
            if (el.innerHTML && el.innerHTML.includes('管理自定义伤害类型')) {
                const style = window.getComputedStyle(el);
                if (style.position === 'fixed' && 
                    style.top === '50%' && 
                    style.left === '50%' && 
                    style.transform === 'translate(-50%, -50%)') {
                    if (el.parentNode === document.body) {
                        document.body.removeChild(el);
                    }
                }
            }
        });
    }
    
    // 额外清理：确保没有残留的遮罩层
    // 查找所有固定定位且背景为半透明的元素
    const allFixedElements = document.querySelectorAll('body > div');
    allFixedElements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.position === 'fixed') {
            // 检查是否是遮罩层（半透明黑色背景）
            const bgColor = style.backgroundColor;
            if (bgColor.includes('rgba(0, 0, 0, 0.5)') || 
                bgColor === 'rgba(0, 0, 0, 0.5)' ||
                (style.background && style.background.includes('rgba(0, 0, 0, 0.5)'))) {
                if (el.parentNode === document.body) {
                    document.body.removeChild(el);
                }
            }
            // 检查是否是管理面板
            else if (el.innerHTML && el.innerHTML.includes('管理自定义伤害类型')) {
                if (el.parentNode === document.body) {
                    document.body.removeChild(el);
                }
            }
        }
    });
}

// 编辑自定义类型
function editCustomType(typeId) {
    const type = DAMAGE_TYPES.find(t => t.id === typeId);
    if (!type) return;

    const newName = prompt('请输入新的类型名称：', type.name);
    if (newName && newName.trim() && newName.trim() !== type.name) {
        type.name = newName.trim();
        updateAllDamageTypeSelects();
    
        // 关闭当前面板
        closeCustomTypesPanel();
    
        // 重新计算
        if (sequence.length > 0) {
            calculate(false);
        }
    
        // 重新打开管理面板
        setTimeout(showCustomTypes, 100);
    }
}

// 更新所有伤害类型选择器
function updateAllDamageTypeSelects() {
    // 更新静态加成选择器
    document.querySelectorAll('.s-type').forEach(select => {
        const currentValue = select.value;
        // 如果当前值不在DAMAGE_TYPES中（可能是已删除的自定义类型），则使用默认值
        const validCurrentValue = DAMAGE_TYPES.some(t => t.id === currentValue) ? currentValue : 'all';
        select.innerHTML = DAMAGE_TYPES.map(t => 
            `<option value="${t.id}" ${t.id === validCurrentValue ? 'selected' : ''}>${t.name}</option>`
        ).join('');
    });
    
    // 更新动态Buff选择器
    document.querySelectorAll('.b-type').forEach(select => {
        const currentValue = select.value;
        // 如果当前值不在DAMAGE_TYPES中（可能是已删除的自定义类型），则使用默认值
        const validCurrentValue = DAMAGE_TYPES.some(t => t.id === currentValue) ? currentValue : 'all';
        select.innerHTML = DAMAGE_TYPES.map(t => 
            `<option value="${t.id}" ${t.id === validCurrentValue ? 'selected' : ''}>${t.name}</option>`
        ).join('');
    });
    
    // 更新动作类型选择器
    const actTypeSelect = document.getElementById('act_type');
    if (actTypeSelect) {
        const currentValue = actTypeSelect.value;
        // 如果是首次加载（currentValue为空），默认选择'skill'类型
        const defaultValue = currentValue || 'skill';
        // 确保默认值在DAMAGE_TYPES中
        const validDefaultValue = DAMAGE_TYPES.some(t => t.id === defaultValue) ? defaultValue : 'skill';
        actTypeSelect.innerHTML = DAMAGE_TYPES.map(t => 
            `<option value="${t.id}" ${t.id === validDefaultValue ? 'selected' : ''}>${t.name}</option>`
        ).join('');
    }
    
    // 重新渲染序列
    renderSequence();
    // 注意：这里不调用calculate，由调用者决定是否计算
}