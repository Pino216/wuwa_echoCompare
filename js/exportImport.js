// exportImport.js
// 导入导出功能模块

// 导出数据（支持JSON和XLSX格式）- 现在通过点击菜单选择
function exportFullData() {
    // 默认导出JSON格式，以保持向后兼容性
    exportToJSON();
}

// 导出为JSON格式（可接受外部config参数）
function exportToJSON(externalConfig = null) {
    try {
        let config;
        if (externalConfig) {
            config = externalConfig;
        } else {
            updateBuffPool(true);
            config = {
                meta: {
                    version: "1.4",
                    tool_name: "鸣潮伤害分析与声骸词条对比工具",
                    export_time: new Date().toISOString(),
                    data_version: 2
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
                damage_types: DAMAGE_TYPES.filter(t => t.id.startsWith('custom_')).map(t => ({
                    id: t.id,
                    name: t.name
                })),
                buff_groups: buffGroups,
                current_group_id: currentGroupId,
                cr_overflow: {
                    enabled: document.getElementById('enable_cr_overflow')?.checked || false,
                    ratio: document.getElementById('cr_to_cd_ratio')?.value || 2,
                    max_gain: document.getElementById('max_cd_gain')?.value || 100
                }
            };
        }
        
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
        
        // 获取自定义文件名
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const defaultName = `鸣潮分析_${timestamp}`;
        const fileName = getCustomFileName(defaultName, 'json');
        
        if (fileName === null) {
            // 用户取消
            console.log('用户取消导出');
            return false;
        }
        
        // 创建并下载文件
        const jsonStr = JSON.stringify(config, null, 2);
        const blob = new Blob(["\ufeff" + jsonStr], { 
            type: 'application/json;charset=utf-8' 
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
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

// 导出为XLSX格式（可接受外部config参数）
function exportToXLSX(externalConfig = null) {
    try {
        let config;
        if (externalConfig) {
            config = externalConfig;
        } else {
            updateBuffPool(true);
            config = {
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
                damage_types: DAMAGE_TYPES.filter(t => t.id.startsWith('custom_')).map(t => ({
                    id: t.id,
                    name: t.name
                })),
                buff_groups: buffGroups,
                current_group_id: currentGroupId,
                cr_overflow: {
                    enabled: document.getElementById('enable_cr_overflow')?.checked || false,
                    ratio: document.getElementById('cr_to_cd_ratio')?.value || 2,
                    max_gain: document.getElementById('max_cd_gain')?.value || 100
                }
            };
        }
        
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
            ["动作名称", "倍率(%)", "伤害类型", "基数", "启用状态", "激活Buff"]
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
                action.enabled !== false ? "启用" : "禁用",
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
        
        // 6. 计算总伤害和声骸对比（需要重新计算）
        // 首先确保有动作序列
        let totalDamageData = [];
        let echoComparisonData = [];
        
        if (config.sequence && config.sequence.length > 0) {
            // 保存当前状态
            const originalSequence = sequence;
            const originalBuffPool = buffPool;
            
            // 临时设置状态以进行计算
            sequence = config.sequence;
            buffPool = config.buffs;
            
            // 获取声骸词条
            const echoASubs = config.echoes.echo_a;
            const echoBSubs = config.echoes.echo_b;
            
            // 检查是否已装备声骸A
            const isEchoAEquipped = document.getElementById('echo_a_equipped')?.checked ?? true;
            
            // 计算基础伤害
            const resBase = runSim([], []);
            
            // 计算总伤害数据
            totalDamageData.push(["伤害类型", "伤害值", "占比(%)"]);
            const totalDmg = resBase.totalDmg;
            DAMAGE_TYPES.forEach(type => {
                if (type.id !== 'all') {
                    const dmg = resBase.typeDmg[type.id] || 0;
                    if (dmg > 0) {
                        const percentage = totalDmg > 0 ? ((dmg / totalDmg) * 100).toFixed(2) : "0.00";
                        totalDamageData.push([type.name, dmg.toFixed(0), percentage]);
                    }
                }
            });
            
            // 计算声骸B的伤害
            const resB = runSim(echoBSubs, echoASubs);
            const gainB = (resB.totalDmg / resBase.totalDmg - 1) * 100;
            
            // 声骸对比数据
            echoComparisonData.push(["对比项", "声骸A", "声骸B", "变化(%)"]);
            echoComparisonData.push(["总伤害", resBase.totalDmg.toFixed(0), resB.totalDmg.toFixed(0), gainB.toFixed(2) + "%"]);
            
            // 恢复原始状态
            sequence = originalSequence;
            buffPool = originalBuffPool;
        }
        
        // 如果没有伤害数据，创建空的伤害工作表
        if (totalDamageData.length === 0) {
            totalDamageData.push(["伤害类型", "伤害值", "占比(%)"]);
            totalDamageData.push(["请先添加动作序列并计算伤害", "", ""]);
        }
        const ws6 = XLSX.utils.aoa_to_sheet(totalDamageData);
        XLSX.utils.book_append_sheet(wb, ws6, "总伤害组成");
        
        // 声骸对比工作表
        if (echoComparisonData.length === 0) {
            echoComparisonData.push(["对比项", "声骸A", "声骸B", "变化(%)"]);
            echoComparisonData.push(["请先添加动作序列并计算伤害", "", "", ""]);
        }
        const ws7 = XLSX.utils.aoa_to_sheet(echoComparisonData);
        XLSX.utils.book_append_sheet(wb, ws7, "声骸对比");
        
        // 获取自定义文件名
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const defaultName = `鸣潮分析_${timestamp}`;
        const fileName = getCustomFileName(defaultName, 'xlsx');
        
        if (fileName === null) {
            // 用户取消
            console.log('用户取消导出');
            return false;
        }
        
        // 导出文件
        XLSX.writeFile(wb, fileName);
        
        console.log('导出成功:', config);
        return true;
        
    } catch (error) {
        console.error('导出失败:', error);
        alert(`导出失败: ${error.message}`);
        return false;
    }
}

// 从JSON数据导入配置
function importFromJSON(data, suppressCalculate = false) {
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
    
    // 恢复自定义伤害类型（必须在恢复其他配置之前）
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
    }
    
    // 过滤掉使用不存在的自定义伤害类型的配置
    // 1. 过滤静态加成
    if (data.static_bonus && Array.isArray(data.static_bonus)) {
        data.static_bonus = data.static_bonus.filter(item => {
            // 检查类型是否在DAMAGE_TYPES中
            return DAMAGE_TYPES.some(t => t.id === item.type);
        });
    }
    
    // 2. 过滤动态Buff
    if (data.buffs && Array.isArray(data.buffs)) {
        data.buffs = data.buffs.filter(buff => {
            // 检查类型是否在DAMAGE_TYPES中
            return DAMAGE_TYPES.some(t => t.id === buff.type);
        });
        
        // 确保每个BUFF都有group字段（旧版本数据兼容性）
        data.buffs.forEach(buff => {
            if (buff.group === undefined) {
                buff.group = DEFAULT_GROUP_ID;  // 显式设置默认组
            }
        });
    }
    
    // 3. 过滤动作序列
    if (data.sequence && Array.isArray(data.sequence)) {
        data.sequence = data.sequence.filter(action => {
            // 检查类型是否在DAMAGE_TYPES中
            return DAMAGE_TYPES.some(t => t.id === action.type);
        });
    }
    
    // 恢复BUFF分组数据
    if (data.buff_groups && Array.isArray(data.buff_groups)) {
        buffGroups = data.buff_groups;
        // 移除重复的默认组（确保有且仅有一个默认组）
        const defaultGroups = buffGroups.filter(g => g.id === DEFAULT_GROUP_ID);
        if (defaultGroups.length > 1) {
            // 保留第一个默认组，移除其他
            let foundFirst = false;
            buffGroups = buffGroups.filter(g => {
                if (g.id === DEFAULT_GROUP_ID) {
                    if (!foundFirst) {
                        foundFirst = true;
                        return true; // 保留第一个
                    }
                    return false; // 移除重复
                }
                return true; // 保留其他组
            });
        }
        // 确保至少有一个默认组
        if (!buffGroups.some(g => g.id === DEFAULT_GROUP_ID)) {
            buffGroups.unshift({id: DEFAULT_GROUP_ID, name: "默认组", color: GROUP_COLORS[0]});
        }
    } else {
        // 旧配置，使用默认组
        buffGroups = [{id: DEFAULT_GROUP_ID, name: "默认组", color: GROUP_COLORS[0]}];
    }
    
    // 恢复当前选中的组
    currentGroupId = data.current_group_id || DEFAULT_GROUP_ID;
    // 确保currentGroupId存在于buffGroups中
    if (!buffGroups.some(g => g.id === currentGroupId)) {
        currentGroupId = DEFAULT_GROUP_ID;
    }
    
    // 初始化所有分组的折叠状态（默认展开）
    groupCollapsedState = {};
    buffGroups.forEach(group => {
        groupCollapsedState[group.id] = false; // 默认展开
    });
    
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
    
    // 立即更新所有选择器，确保后续配置能正确引用自定义类型
    updateAllDamageTypeSelects();
    
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
            let groupId = buff.group || DEFAULT_GROUP_ID;
            // 验证分组ID是否存在
            if (!buffGroups.some(g => g.id === groupId)) {
                groupId = DEFAULT_GROUP_ID;
            }
            const groupColor = getGroupColor(groupId);
            const bgColor = hexToRgba(groupColor, 0.1);
            const groupOptions = buffGroups.map(g => `<option value="${g.id}" ${g.id === groupId ? 'selected' : ''}>${g.name}</option>`).join('');
            const html = `
                <div class="buff-config" data-id="${buff.id}" data-group="${groupId}" style="border-left:4px solid ${groupColor}; background:${bgColor}">
                    <div class="input-row">
                        <input type="text" class="b-name" value="${buff.name || '新Buff'}" style="width:80px" oninput="syncBuffNames('${buff.id}', this.value)">
                        <select class="b-cat" onchange="if(sequence.length>0)calculate(false)">
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
                        <select class="b-group" onchange="changeBuffGroup('${buff.id}', this.value)">
                            ${groupOptions}
                        </select>
                        <select class="b-type" onchange="if(sequence.length>0)calculate(false)">${typeOptions}</select>
                        <input type="number" class="b-val" value="${(buff.val * 100) || 10}" style="width:40px" oninput="if(sequence.length>0)calculate(false)">%
                        <button onclick="confirmDelete('确定要删除这个Buff吗？', () => removeBuff('${buff.id}'))" class="buff-delete-btn">×</button>
                    </div>
                </div>`;
            document.getElementById('buff_pool').insertAdjacentHTML('beforeend', html);
        });
    }
    
    // 恢复动作序列
    if (data.sequence && Array.isArray(data.sequence)) {
        sequence = data.sequence.map(action => ({
            ...action,
            enabled: action.enabled !== false // 如果enabled字段不存在，默认为true
        }));
    }
    
    // 恢复暴击率溢出转换设置
    if (data.cr_overflow) {
        const enableCheckbox = document.getElementById('enable_cr_overflow');
        const ratioInput = document.getElementById('cr_to_cd_ratio');
        const maxGainInput = document.getElementById('max_cd_gain');
        
        if (enableCheckbox) enableCheckbox.checked = data.cr_overflow.enabled || false;
        if (ratioInput) ratioInput.value = data.cr_overflow.ratio || 2;
        if (maxGainInput) maxGainInput.value = data.cr_overflow.max_gain || 100;
        
        // 更新面板显示
        updateCrOverflowPanel();
    } else {
        // 如果没有保存的暴击转换设置，使用默认值
        const enableCheckbox = document.getElementById('enable_cr_overflow');
        if (enableCheckbox) enableCheckbox.checked = false;
        updateCrOverflowPanel();
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
    
    // 更新界面
    updateBuffPool(true);
    updateAllDamageTypeSelects();
    renderSequence();
    
    // 渲染分页
    renderBuffPagination();
    
    // 更新分组选择器
    updateGroupSelect();
    updateBuffFilterSelect();
    updateAllBuffGroupSelects();  // 确保所有BUFF的分组选择器选项最新
    
    // 只有在不抑制计算时才调用calculate
    if (!suppressCalculate && sequence.length > 0) {
        calculate(false);
    }
}

// 从XLSX工作簿导入 - 完整版
function importFromXLSX(workbook) {
    try {
        // 创建导入确认对话框
        const importData = {
            character: {},
            static_bonus: [],
            buffs: [],
            sequence: [],
            echoes: { echo_a: [], echo_b: [] },
            damage_types: [],
            hasData: {
                character: false,
                static_bonus: false,
                buffs: false,
                sequence: false,
                echoes: false,
                damage_types: false
            }
        };
        
        // 1. 读取基础面板数据
        const baseSheet = workbook.Sheets["基础面板"];
        if (baseSheet) {
            const baseData = XLSX.utils.sheet_to_json(baseSheet, { header: 1 });
            for (let i = 1; i < baseData.length; i++) {
                const row = baseData[i];
                if (row && row.length >= 2) {
                    const prop = row[0];
                    const baseVal = row[1];
                    const currentVal = row[2] || '';
                    
                    if (prop === "生命值") {
                        importData.character.base_hp = baseVal;
                        importData.character.total_hp_now = currentVal;
                        importData.hasData.character = true;
                    } else if (prop === "攻击力") {
                        importData.character.base_atk = baseVal;
                        importData.character.total_atk_now = currentVal;
                        importData.hasData.character = true;
                    } else if (prop === "防御力") {
                        importData.character.base_def = baseVal;
                        importData.character.total_def_now = currentVal;
                        importData.hasData.character = true;
                    } else if (prop === "暴击率(%)") {
                        importData.character.base_cr = baseVal;
                        importData.hasData.character = true;
                    } else if (prop === "暴击伤害(%)") {
                        importData.character.base_cd = baseVal;
                        importData.hasData.character = true;
                    }
                }
            }
        }
        
        // 2. 读取静态加成
        const staticSheet = workbook.Sheets["静态加成"];
        if (staticSheet) {
            const staticData = XLSX.utils.sheet_to_json(staticSheet, { header: 1 });
            for (let i = 1; i < staticData.length; i++) {
                const row = staticData[i];
                if (row && row.length >= 2) {
                    const typeName = row[0];
                    const value = row[1];
                    // 查找对应的伤害类型ID
                    const damageType = DAMAGE_TYPES.find(t => t.name === typeName);
                    if (damageType) {
                        importData.static_bonus.push({
                            type: damageType.id,
                            value: value
                        });
                        importData.hasData.static_bonus = true;
                    }
                }
            }
        }
        
        // 3. 读取动态Buff
        const buffSheet = workbook.Sheets["动态Buff"];
        if (buffSheet) {
            const buffData = XLSX.utils.sheet_to_json(buffSheet, { header: 1 });
            for (let i = 1; i < buffData.length; i++) {
                const row = buffData[i];
                if (row && row.length >= 4) {
                    const buffName = row[0];
                    const typeName = row[1];
                    const category = row[2];
                    const value = row[3];
                    
                    // 查找对应的伤害类型ID
                    const damageType = DAMAGE_TYPES.find(t => t.name === typeName);
                    if (damageType && value) {
                        importData.buffs.push({
                            id: 'b_' + Date.now() + '_' + i,
                            name: buffName || '新Buff',
                            cat: category || 'bonus',
                            type: damageType.id,
                            val: parseFloat(value) / 100 || 0.1
                        });
                        importData.hasData.buffs = true;
                    }
                }
            }
        }
        
        // 4. 读取动作序列
        const sequenceSheet = workbook.Sheets["动作序列"];
        if (sequenceSheet) {
            const sequenceData = XLSX.utils.sheet_to_json(sequenceSheet, { header: 1 });
            for (let i = 1; i < sequenceData.length; i++) {
                const row = sequenceData[i];
                if (row && row.length >= 5) {
                    const actionName = row[0];
                    const multValue = row[1];
                    const typeName = row[2];
                    const scalingType = row[3];
                    const enabledStatus = row[4];
                    const buffNames = row[5];
                    
                    // 查找对应的伤害类型ID
                    const damageType = DAMAGE_TYPES.find(t => t.name === typeName);
                    if (damageType && multValue) {
                        const action = {
                            name: actionName || '新动作',
                            mult: parseFloat(multValue) / 100 || 0,
                            type: damageType.id,
                            scaling: scalingType || 'atk',
                            activeBuffs: [],
                            // 根据启用状态设置，默认为启用
                            enabled: enabledStatus !== "禁用"
                        };
                        
                        // 处理激活的Buff（需要与导入的Buff匹配）
                        if (buffNames && importData.buffs.length > 0) {
                            const buffNameList = buffNames.split(',').map(name => name.trim());
                            buffNameList.forEach(buffName => {
                                const matchedBuff = importData.buffs.find(b => b.name === buffName);
                                if (matchedBuff) {
                                    action.activeBuffs.push(matchedBuff.id);
                                }
                            });
                        }
                        
                        importData.sequence.push(action);
                        importData.hasData.sequence = true;
                    }
                }
            }
        }
        
        // 5. 读取声骸配置
        const echoSheet = workbook.Sheets["声骸词条"];
        if (echoSheet) {
            const echoData = XLSX.utils.sheet_to_json(echoSheet, { header: 1 });
            for (let i = 1; i < echoData.length; i++) {
                const row = echoData[i];
                if (row && row.length >= 3) {
                    const echoType = row[0];
                    const substatName = row[1];
                    const value = row[2];
                    
                    if (echoType && substatName && value !== undefined) {
                        // 查找对应的词条key
                        let substatKey = null;
                        for (const key in SUBSTAT_DATA) {
                            if (SUBSTAT_DATA[key].name === substatName) {
                                substatKey = key;
                                break;
                            }
                        }
                        
                        if (substatKey) {
                            const substatVal = parseFloat(value) || 0;
                            if (echoType === "声骸A") {
                                importData.echoes.echo_a.push({ key: substatKey, val: substatVal });
                                importData.hasData.echoes = true;
                            } else if (echoType === "声骸B") {
                                importData.echoes.echo_b.push({ key: substatKey, val: substatVal });
                                importData.hasData.echoes = true;
                            }
                        }
                    }
                }
            }
        }
        
        // 6. 读取自定义伤害类型
        const damageTypeSheet = workbook.Sheets["自定义伤害类型"];
        if (damageTypeSheet) {
            const damageTypeData = XLSX.utils.sheet_to_json(damageTypeSheet, { header: 1 });
            for (let i = 1; i < damageTypeData.length; i++) {
                const row = damageTypeData[i];
                if (row && row.length >= 2) {
                    const typeId = row[0];
                    const typeName = row[1];
                    if (typeId && typeName) {
                        importData.damage_types.push({
                            id: typeId,
                            name: typeName
                        });
                        importData.hasData.damage_types = true;
                    }
                }
            }
        }
        
        // 显示导入确认对话框
        const confirmationMsg = `确认导入以下数据：
        ${importData.hasData.character ? '✅ 基础面板数据\n' : '❌ 基础面板数据（缺失）\n'}
        ${importData.hasData.static_bonus ? '✅ 静态加成\n' : '❌ 静态加成（缺失）\n'}
        ${importData.hasData.buffs ? '✅ 动态Buff\n' : '❌ 动态Buff（缺失）\n'}
        ${importData.hasData.sequence ? '✅ 动作序列\n' : '❌ 动作序列（缺失）\n'}
        ${importData.hasData.echoes ? '✅ 声骸配置\n' : '❌ 声骸配置（缺失）\n'}
        ${importData.hasData.damage_types ? '✅ 自定义伤害类型\n' : '❌ 自定义伤害类型（缺失）\n'}
        
        注意：导入将覆盖当前所有配置。`;
        
        if (confirm(confirmationMsg)) {
            // 构建完整的配置对象
            const fullConfig = {
                meta: {
                    version: "1.4",
                    tool_name: "鸣潮伤害分析与声骸词条对比工具",
                    import_time: new Date().toISOString()
                },
                character: importData.character,
                static_bonus: importData.static_bonus,
                buffs: importData.buffs,
                sequence: importData.sequence,
                echoes: importData.echoes,
                damage_types: importData.damage_types
            };
            
            // 使用JSON导入功能
            importFromJSON(fullConfig);
        }
        
    } catch (error) {
        console.error('导入失败:', error);
        alert(`导入失败: ${error.message}`);
    }
}

// 完整的文件导入函数（被HTML中的文件输入元素调用）
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