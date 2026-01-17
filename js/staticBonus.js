// staticBonus.js
// 静态加成管理模块

// 添加静态加成项
function addStaticBonus() {
    const options = DAMAGE_TYPES.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    const html = `<div class="static-bonus-item input-row">
        <select class="s-type" onchange="debouncedCalculate()">${options}</select>
        <input type="number" class="s-val" value="30" style="width:40px" oninput="debouncedCalculate()">%
        <button onclick="confirmDelete('确定要删除这个静态加成吗？', () => { this.parentElement.remove(); debouncedCalculate(); })" style="color:var(--accent); background:none; border:none; cursor:pointer;">×</button>
    </div>`;
    document.getElementById('static_bonus_list').insertAdjacentHTML('beforeend', html);
    // 只有在序列不为空时才触发计算
    if (sequence.length > 0) {
        debouncedCalculate();
    }
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
            <select class="s-type" onchange="if(sequence.length>0)debouncedCalculate()">${options}</select>
            <input type="number" class="s-val" value="${item.value}" style="width:40px" oninput="if(sequence.length>0)debouncedCalculate()">%
            <button onclick="confirmDelete('确定要删除这个静态加成吗？', () => { this.parentElement.remove(); if(sequence.length>0)debouncedCalculate(); })" style="color:var(--accent); background:none; border:none; cursor:pointer;">×</button>
        </div>`;
        container.insertAdjacentHTML('beforeend', html);
    });
}