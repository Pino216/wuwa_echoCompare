// echoManager.js
// 声骸管理模块

// 初始化声骸选择器
function initEchoSelects(id) {
    const container = document.querySelector(`#${id} .substat-container`);
    // 首先清空容器，确保只有5行
    container.innerHTML = '';
    for(let i=0; i<5; i++) {
        const row = document.createElement('div');
        row.className = 'substat-row';
        let nameSelect = `<select class="sub-name" onchange="updateSubValues(this)">`;
        for(let key in SUBSTAT_DATA) nameSelect += `<option value="${key}">${SUBSTAT_DATA[key].name}</option>`;
        nameSelect += `</select>`;
        row.innerHTML = nameSelect + `<select class="sub-val" onchange="calculate(false)"><option value="0">0</option></select>`;
        container.appendChild(row);
    }
}

// 更新声骸词条值选项
function updateSubValues(selectEl) {
    const valSelect = selectEl.parentElement.querySelector('.sub-val');
    const data = SUBSTAT_DATA[selectEl.value];
    valSelect.innerHTML = data.values.map(v => `<option value="${v}">${v}${data.isPct?'%':''}</option>`).join('');
    // 添加onchange事件到新创建的选项
    valSelect.setAttribute('onchange', 'debouncedCalculate()');
    // 只有在序列不为空时才触发计算
    if (sequence.length > 0) {
        debouncedCalculate();
    }
}

// 获取声骸配置
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

// 设置声骸配置
function setEchoConfig(id, subs) {
    const container = document.querySelector(`#${id} .substat-container`);
    if (!container || !subs) return;
        
    // 首先清空容器
    container.innerHTML = '';
        
    // 确保有足够的行，最多5行
    const numRows = Math.min(subs.length, 5);
    for (let i = 0; i < numRows; i++) {
        const row = document.createElement('div');
        row.className = 'substat-row';
        let nameSelect = `<select class="sub-name" onchange="updateSubValues(this)">`;
        for(let key in SUBSTAT_DATA) nameSelect += `<option value="${key}">${SUBSTAT_DATA[key].name}</option>`;
        nameSelect += `</select>`;
        row.innerHTML = nameSelect + `<select class="sub-val" onchange="if(sequence.length>0)debouncedCalculate()"><option value="0">0</option></select>`;
        container.appendChild(row);
    }
        
    // 如果subs少于5行，添加剩余的空行
    for (let i = numRows; i < 5; i++) {
        const row = document.createElement('div');
        row.className = 'substat-row';
        let nameSelect = `<select class="sub-name" onchange="updateSubValues(this)">`;
        for(let key in SUBSTAT_DATA) nameSelect += `<option value="${key}">${SUBSTAT_DATA[key].name}</option>`;
        nameSelect += `</select>`;
        row.innerHTML = nameSelect + `<select class="sub-val" onchange="if(sequence.length>0)debouncedCalculate()"><option value="0">0</option></select>`;
        container.appendChild(row);
    }
            
    // 更新值
    const updatedRows = container.querySelectorAll('.substat-row');
    subs.forEach((sub, i) => {
        if (i < 5 && i < updatedRows.length) {
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
                // 确保有onchange事件
                valSelect.setAttribute('onchange', 'if(sequence.length>0)debouncedCalculate()');
            }
        }
    });
}