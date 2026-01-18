// buffManager.js
// Buff系统管理

// 全局状态
let buffPool = [];
let buffGroups = [{id: DEFAULT_GROUP_ID, name: "默认组", color: GROUP_COLORS[0]}];
let currentGroupId = DEFAULT_GROUP_ID;
let buffFilterGroupId = '';
let groupCollapsedState = {};

// 获取组颜色
function getGroupColor(groupId) {
    const group = buffGroups.find(g => g.id === groupId);
    return group ? group.color : GROUP_COLORS[0];
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

// 更新组选择下拉菜单
function updateGroupSelect() {
    const select = document.getElementById('buff_group_select');
    if (!select) return;
    
    const currentValue = select.value;
    select.innerHTML = buffGroups.map(group => 
        `<option value="${group.id}" ${group.id === currentGroupId ? 'selected' : ''}>${group.name}</option>`
    ).join('');
    
    // 如果没有选中的组，选中第一个
    if (!currentGroupId && buffGroups.length > 0) {
        currentGroupId = buffGroups[0].id;
        select.value = currentGroupId;
    }
    
    // 同时更新BUFF筛选下拉菜单
    updateBuffFilterSelect();
}

// 更新所有BUFF的分组选择器
function updateAllBuffGroupSelects() {
    document.querySelectorAll('.buff-config .b-group').forEach(select => {
        const selectedGroupId = select.value || DEFAULT_GROUP_ID;
        const groupOptions = buffGroups.map(g => 
            `<option value="${g.id}" ${g.id === selectedGroupId ? 'selected' : ''}>${g.name}</option>`
        ).join('');
        select.innerHTML = groupOptions;
    });
}

// 创建新组
function createNewGroup() {
    const groupName = prompt('请输入新组名称：', '新组');
    if (!groupName || !groupName.trim()) return;
    
    const groupId = 'group_' + Date.now();
    const groupColor = getNextAvailableColor();
    
    buffGroups.push({
        id: groupId,
        name: groupName.trim(),
        color: groupColor
    });
    
    // 初始化折叠状态
    groupCollapsedState[groupId] = false;
    
    currentGroupId = groupId;
    updateGroupSelect();
    updateAllBuffGroupSelects();  // 更新所有BUFF的分组选择器
    
    // 重新渲染BUFF池以显示新的组
    renderBuffPagination();
    renderSequence();
    
    alert(`已创建新组: ${groupName.trim()}`);
}

// 重命名当前组
function renameCurrentGroup() {
    if (currentGroupId === DEFAULT_GROUP_ID) {
        alert('默认组不能重命名！');
        return;
    }
    
    const currentGroup = buffGroups.find(g => g.id === currentGroupId);
    if (!currentGroup) return;
    
    const newName = prompt('请输入新的组名称：', currentGroup.name);
    if (!newName || !newName.trim()) return;
    
    currentGroup.name = newName.trim();
    updateGroupSelect();
    updateAllBuffGroupSelects();  // 更新所有BUFF的分组选择器
    
    // 重新渲染BUFF池以更新组名显示
    renderBuffPagination();
    renderSequence();
    
    alert(`组已重命名为: ${newName.trim()}`);
}

// 删除当前组
function deleteCurrentGroup() {
    if (currentGroupId === DEFAULT_GROUP_ID) {
        alert('默认组不能删除！');
        return;
    }
    
    const groupToDelete = buffGroups.find(g => g.id === currentGroupId);
    if (!groupToDelete) return;
    
    // 检查该组是否包含BUFF
    const buffsInGroup = buffPool.filter(b => b.group === currentGroupId);
    if (buffsInGroup.length > 0) {
        if (!confirm(`组 "${groupToDelete.name}" 中包含 ${buffsInGroup.length} 个BUFF。删除组后，这些BUFF将被移动到默认组。确定要删除吗？`)) {
            return;
        }
        
        // 将组内的BUFF移动到默认组
        document.querySelectorAll(`.buff-config[data-group="${currentGroupId}"]`).forEach(el => {
            el.dataset.group = DEFAULT_GROUP_ID;
            // 更新选择器选中值
            const groupSelect = el.querySelector('.b-group');
            if (groupSelect) groupSelect.value = DEFAULT_GROUP_ID;
            const groupColor = getGroupColor(DEFAULT_GROUP_ID);
            const bgColor = hexToRgba(groupColor, 0.1);
            el.style.borderLeftColor = groupColor;
            el.style.backgroundColor = bgColor;
        });
        
        updateBuffPool(true);
    }
    
    // 删除组
    buffGroups = buffGroups.filter(g => g.id !== currentGroupId);
    
    // 删除折叠状态
    delete groupCollapsedState[currentGroupId];
    
    // 切换到默认组
    currentGroupId = DEFAULT_GROUP_ID;
    updateGroupSelect();
    updateAllBuffGroupSelects();  // 更新所有BUFF的分组选择器
    
    // 重新渲染
    renderBuffPagination();
    renderSequence();
    
    alert(`组 "${groupToDelete.name}" 已删除`);
}

// 切换当前组
function changeCurrentGroup(groupId) {
    currentGroupId = groupId;
    updateGroupSelect();
}

// 更改BUFF所属的组
function changeBuffGroup(buffId, newGroupId) {
    const buffElement = document.querySelector(`.buff-config[data-id="${buffId}"]`);
    if (!buffElement) return;
    
    const oldGroupId = buffElement.dataset.group;
    if (oldGroupId === newGroupId) return;
    
    // 更新DOM属性
    buffElement.dataset.group = newGroupId;
    
    // 更新选择器选中值
    const groupSelect = buffElement.querySelector('.b-group');
    if (groupSelect) groupSelect.value = newGroupId;
    
    // 更新颜色样式
    const newGroupColor = getGroupColor(newGroupId);
    const newBgColor = hexToRgba(newGroupColor, 0.1);
    buffElement.style.borderLeftColor = newGroupColor;
    buffElement.style.backgroundColor = newBgColor;
    
    // 更新数据模型
    updateBuffPool(true);
    
    // 重新渲染分页以反映分组变化
    renderBuffPagination();
}

// 切换组折叠状态
function toggleGroupCollapse(groupId) {
    const groupContainer = document.querySelector(`.buff-group-container[data-group-id="${groupId}"]`);
    if (!groupContainer) return;
    
    const isCollapsed = groupContainer.classList.contains('collapsed');
    const content = groupContainer.querySelector('.buff-group-content');
    
    if (isCollapsed) {
        groupContainer.classList.remove('collapsed');
        if (content) content.style.display = 'block';
        groupCollapsedState[groupId] = false;
    } else {
        groupContainer.classList.add('collapsed');
        if (content) content.style.display = 'none';
        groupCollapsedState[groupId] = true;
    }
}

// 应用整个组的BUFF到当前动作
function applyGroupBuffs(groupId, actionIndex = null) {
    const group = buffGroups.find(g => g.id === groupId);
    if (!group) return;
    
    const buffsInGroup = buffPool.filter(b => b.group === groupId);
    if (buffsInGroup.length === 0) return;
    
    if (actionIndex === null) {
        // 如果没有指定动作索引，应用到所有动作
        sequence.forEach((action, idx) => {
            buffsInGroup.forEach(buff => {
                if (!action.activeBuffs.includes(buff.id)) {
                    action.activeBuffs.push(buff.id);
                }
            });
        });
    } else {
        // 应用到指定动作
        const action = sequence[actionIndex];
        if (action) {
            buffsInGroup.forEach(buff => {
                if (!action.activeBuffs.includes(buff.id)) {
                    action.activeBuffs.push(buff.id);
                }
            });
        }
    }
    
    renderSequence();
    immediateCalculate();
    alert(`已应用组 "${group.name}" 的 ${buffsInGroup.length} 个BUFF`);
}

// 取消整个组的BUFF从当前动作
function removeGroupBuffs(groupId, actionIndex = null) {
    const group = buffGroups.find(g => g.id === groupId);
    if (!group) return;
    
    const buffsInGroup = buffPool.filter(b => b.group === groupId);
    if (buffsInGroup.length === 0) return;
    
    if (actionIndex === null) {
        // 如果没有指定动作索引，从所有动作中移除
        sequence.forEach(action => {
            buffsInGroup.forEach(buff => {
                const index = action.activeBuffs.indexOf(buff.id);
                if (index > -1) {
                    action.activeBuffs.splice(index, 1);
                }
            });
        });
    } else {
        // 从指定动作中移除
        const action = sequence[actionIndex];
        if (action) {
            buffsInGroup.forEach(buff => {
                const index = action.activeBuffs.indexOf(buff.id);
                if (index > -1) {
                    action.activeBuffs.splice(index, 1);
                }
            });
        }
    }
    
    renderSequence();
    immediateCalculate();
    alert(`已取消组 "${group.name}" 的 ${buffsInGroup.length} 个BUFF`);
}

// 更新BUFF筛选下拉菜单
function updateBuffFilterSelect() {
    const filterSelect = document.getElementById('buff_group_filter');
    if (!filterSelect) return;
    
    const currentValue = filterSelect.value;
    filterSelect.innerHTML = '<option value="">显示所有组</option>' + 
        buffGroups.map(group => 
            `<option value="${group.id}" ${group.id === buffFilterGroupId ? 'selected' : ''}>${group.name}</option>`
        ).join('');
    
    filterSelect.value = buffFilterGroupId || '';
}

// 按组筛选BUFF显示
function filterBuffsByGroup(groupId) {
    buffFilterGroupId = groupId || '';
    updateBuffFilterSelect();
    renderBuffPagination(); // 更新BUFF池显示
    renderSequence();
}

// 添加新Buff
function addNewBuff() {
    const fixedId = 'b_' + Date.now();
    const typeOptions = DAMAGE_TYPES.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    const groupOptions = buffGroups.map(g => `<option value="${g.id}" ${g.id === currentGroupId ? 'selected' : ''}>${g.name}</option>`).join('');
    const currentGroupColor = getGroupColor(currentGroupId);
    const backgroundColor = hexToRgba(currentGroupColor, 0.1);
    const html = `
        <div class="buff-config" data-id="${fixedId}" data-group="${currentGroupId}" style="border-left:4px solid ${currentGroupColor}; background:${backgroundColor}; padding:12px; margin-bottom:10px; border-radius:8px;">
            <div class="input-row">
                <input type="text" class="b-name" value="新Buff" style="width:80px" oninput="syncBuffNames('${fixedId}', this.value)">
                <select class="b-cat" onchange="debouncedCalculate()">
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
                <select class="b-group" onchange="changeBuffGroup('${fixedId}', this.value)" style="width:100px; font-size:11px;">
                    ${groupOptions}
                </select>
                <select class="b-type" onchange="debouncedCalculate()" style="width:100px;">${typeOptions}</select>
                <input type="number" class="b-val" value="10" style="width:40px" oninput="debouncedCalculate()">%
                <button onclick="confirmDelete('确定要删除这个Buff吗？', () => removeBuff('${fixedId}'))" style="color:#ff6b8b; background:none; border:none; cursor:pointer; font-size:16px; font-weight:bold;">×</button>
            </div>
        </div>`;
    
    // 添加到Buff池
    document.getElementById('buff_pool').insertAdjacentHTML('beforeend', html);
    
    // 更新Buff池数据
    updateBuffPool(true);
    
    // 重新渲染分页
    renderBuffPagination();
    
    // 渲染序列
    renderSequence();
}

// 删除Buff
function removeBuff(buffId) {
    const buffElement = document.querySelector(`.buff-config[data-id="${buffId}"]`);
    if (buffElement) {
        buffElement.remove();
        updateBuffPool(true);
        renderBuffPagination();
        renderSequence();
        calculate();
    }
}

// 渲染Buff显示（取消分页，改为滚动显示）
function renderBuffPagination() {
    const buffPoolContainer = document.getElementById('buff_pool');
    // 确保容器有滚动样式
    buffPoolContainer.style.maxHeight = '500px';
    buffPoolContainer.style.overflowY = 'auto';
    buffPoolContainer.style.paddingRight = '5px';
    const allBuffs = buffPoolContainer.querySelectorAll('.buff-config');
    
    // 根据筛选条件过滤BUFF
    const filteredBuffs = Array.from(allBuffs).filter(buff => {
        if (!buffFilterGroupId) return true;
        const groupId = buff.dataset.group || DEFAULT_GROUP_ID;
        return groupId === buffFilterGroupId;
    });
    
    const totalFilteredBuffs = filteredBuffs.length;
    
    // 按组分组所有过滤后的BUFF
    const buffsByGroup = {};
    filteredBuffs.forEach(buff => {
        const groupId = buff.dataset.group || DEFAULT_GROUP_ID;
        if (!buffsByGroup[groupId]) {
            buffsByGroup[groupId] = [];
        }
        buffsByGroup[groupId].push(buff);
    });
    
    // 清除现有的组容器（保留BUFF元素）
    const existingGroups = buffPoolContainer.querySelectorAll('.buff-group-container');
    existingGroups.forEach(group => {
        // 先提取组内的BUFF元素
        const groupBuffs = Array.from(group.querySelectorAll('.buff-config'));
        groupBuffs.forEach(buff => {
            if (!buff.parentNode.isSameNode(buffPoolContainer)) {
                // 如果BUFF不在根容器中，先移回根容器
                buffPoolContainer.appendChild(buff);
            }
        });
        group.remove();
    });
    
    // 为每个组创建折叠面板
    Object.keys(buffsByGroup).forEach(groupId => {
        const groupBuffs = buffsByGroup[groupId];
        const group = buffGroups.find(g => g.id === groupId) || buffGroups.find(g => g.id === DEFAULT_GROUP_ID);
        if (!group) return;
        
        // 创建组容器
        const groupContainer = document.createElement('div');
        groupContainer.className = 'buff-group-container';
        groupContainer.dataset.groupId = groupId;
        groupContainer.style.marginBottom = '15px';
        groupContainer.style.border = `1px solid ${group.color}`;
        groupContainer.style.borderRadius = '10px';
        groupContainer.style.overflow = 'hidden';
        groupContainer.style.background = 'rgba(255, 255, 255, 0.9)';
        
        // 组标题栏
        const groupHeader = document.createElement('div');
        groupHeader.style.display = 'flex';
        groupHeader.style.alignItems = 'center';
        groupHeader.style.justifyContent = 'space-between';
        groupHeader.style.padding = '8px 12px';
        groupHeader.style.background = hexToRgba(group.color, 0.15);
        groupHeader.style.cursor = 'pointer';
        groupHeader.style.borderBottom = `1px solid ${group.color}`;
        groupHeader.onclick = () => toggleGroupCollapse(groupId);
        
        // 左侧：组名和数量
        const headerLeft = document.createElement('div');
        headerLeft.style.display = 'flex';
        headerLeft.style.alignItems = 'center';
        headerLeft.style.gap = '8px';
        
        const toggleIcon = document.createElement('span');
        const isCollapsed = groupCollapsedState[groupId] === true;
        toggleIcon.innerHTML = isCollapsed ? '▶' : '▼';
        toggleIcon.style.fontSize = '12px';
        toggleIcon.style.transition = 'transform 0.2s';
        if (isCollapsed) {
            toggleIcon.style.transform = 'rotate(-90deg)';
        }
        
        const groupName = document.createElement('span');
        groupName.textContent = group.name;
        groupName.style.fontWeight = 'bold';
        groupName.style.color = group.color;
        groupName.style.fontSize = '13px';
        
        const buffCount = document.createElement('span');
        buffCount.textContent = `(${groupBuffs.length}个)`;
        buffCount.style.fontSize = '11px';
        buffCount.style.color = '#8b949e';
        
        headerLeft.appendChild(toggleIcon);
        headerLeft.appendChild(groupName);
        headerLeft.appendChild(buffCount);
        
        // 右侧：操作按钮
        const headerRight = document.createElement('div');
        headerRight.style.display = 'flex';
        headerRight.style.alignItems = 'center';
        headerRight.style.gap = '6px';
        
        const applyAllBtn = document.createElement('button');
        applyAllBtn.textContent = '应用全部';
        applyAllBtn.style.padding = '3px 8px';
        applyAllBtn.style.fontSize = '11px';
        applyAllBtn.style.background = hexToRgba(group.color, 0.2);
        applyAllBtn.style.border = `1px solid ${group.color}`;
        applyAllBtn.style.borderRadius = '4px';
        applyAllBtn.style.cursor = 'pointer';
        applyAllBtn.style.color = group.color;
        applyAllBtn.onclick = (e) => {
            e.stopPropagation();
            if (confirm(`确定要将组 "${group.name}" 的所有BUFF应用到当前动作吗？`)) {
                applyGroupBuffs(groupId);
            }
        };
        
        const removeAllBtn = document.createElement('button');
        removeAllBtn.textContent = '取消全部';
        removeAllBtn.style.padding = '3px 8px';
        removeAllBtn.style.fontSize = '11px';
        removeAllBtn.style.background = 'rgba(255, 107, 139, 0.1)';
        removeAllBtn.style.border = '1px solid #ff6b8b';
        removeAllBtn.style.borderRadius = '4px';
        removeAllBtn.style.cursor = 'pointer';
        removeAllBtn.style.color = '#ff6b8b';
        removeAllBtn.onclick = (e) => {
            e.stopPropagation();
            if (confirm(`确定要从当前动作取消组 "${group.name}" 的所有BUFF吗？`)) {
                removeGroupBuffs(groupId);
            }
        };
        
        headerRight.appendChild(applyAllBtn);
        headerRight.appendChild(removeAllBtn);
        
        groupHeader.appendChild(headerLeft);
        groupHeader.appendChild(headerRight);
        
        // 组内容区域
        const groupContent = document.createElement('div');
        groupContent.className = 'buff-group-content';
        groupContent.style.padding = '10px';
        
        // 应用保存的折叠状态
        if (isCollapsed) {
            groupContainer.classList.add('collapsed');
            groupContent.style.display = 'none';
        }
        
        // 将BUFF元素移动到内容区域
        groupBuffs.forEach(buff => {
            // 隐藏原始BUFF（通过移动位置，不需要设置display）
            buff.style.marginBottom = '8px';
            groupContent.appendChild(buff);
        });
        
        groupContainer.appendChild(groupHeader);
        groupContainer.appendChild(groupContent);
        buffPoolContainer.appendChild(groupContainer);
    });
    
    // 确保所有BUFF都显示（不再隐藏任何BUFF）
    allBuffs.forEach(buff => {
        buff.style.display = 'block';
        // 确保BUFF在DOM中
        if (!buff.parentNode) {
            buffPoolContainer.appendChild(buff);
        }
    });
    
    // 隐藏分页控件（如果存在）
    const paginationContainer = document.getElementById('buff_pagination');
    if (paginationContainer) {
        paginationContainer.style.display = 'none';
    }
}



// 同步Buff名称
function syncBuffNames(id, newName) {
    document.querySelectorAll(`.chip[data-bid="${id}"]`).forEach(chip => {
        chip.innerText = newName;
    });
    updateBuffPool(true); // 跳过分页重新渲染，防止失焦
}

// 更新Buff池数据
function updateBuffPool(skipRender = false) {
    buffPool = [];
    document.querySelectorAll('.buff-config').forEach(el => {
        buffPool.push({
            id: el.dataset.id,
            name: el.querySelector('.b-name').value,
            cat: el.querySelector('.b-cat').value,
            type: el.querySelector('.b-type').value,
            val: parseFloat(el.querySelector('.b-val').value) / 100,
            group: el.dataset.group || DEFAULT_GROUP_ID
        });
    });
    
    // 更新显示（可选跳过）
    if (!skipRender) {
        renderBuffPagination();
    }
}