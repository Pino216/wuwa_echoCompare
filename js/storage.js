// storage.js
// 存储和配置管理模块

// 自动加载上次保存的配置
function autoLoadLastConfig() {
    try {
        const saved = localStorage.getItem('mingchao_damage_calc_v1.4');
        if (saved) {
            const data = JSON.parse(saved);
            // 检查是否在24小时内保存的
            const saveTime = new Date(data.meta?.save_time || 0);
            const now = new Date();
            const hoursDiff = (now - saveTime) / (1000 * 60 * 60);
            
            if (hoursDiff < 24) {
                // 24小时内的配置，静默加载，抑制计算
                importFromJSON(data, true);
                console.log('✅ 自动加载了上次保存的配置（抑制计算）');
                return true;
            }
        }
    } catch (error) {
        console.warn('自动加载配置失败:', error);
    }
    return false;
}

// 重置声骸配置
function resetEchoConfig(id) {
    const container = document.querySelector(`#${id} .substat-container`);
    if (!container) return;
    
    container.innerHTML = '';
    
    // 重新初始化5行
    for(let i = 0; i < 5; i++) {
        const row = document.createElement('div');
        row.className = 'substat-row';
        let nameSelect = `<select class="sub-name" onchange="updateSubValues(this)">`;
        for(let key in SUBSTAT_DATA) nameSelect += `<option value="${key}">${SUBSTAT_DATA[key].name}</option>`;
        nameSelect += `</select>`;
        row.innerHTML = nameSelect + `<select class="sub-val" onchange="if(sequence.length>0)debouncedCalculate()"><option value="0">0</option></select>`;
        container.appendChild(row);
    }
}

// 重置所有设置到默认值
function resetToDefaults() {
    if (!confirm('确定要重置所有设置到默认值吗？这将清除当前的所有配置。')) {
        return;
    }
    
    // 重置基础面板
    document.getElementById('base_hp').value = '10000';
    document.getElementById('total_hp_now').value = '20000';
    document.getElementById('base_atk').value = '1000';
    document.getElementById('total_atk_now').value = '2500';
    document.getElementById('base_def').value = '1000';
    document.getElementById('total_def_now').value = '1500';
    document.getElementById('base_cr').value = '60';
    document.getElementById('base_cd').value = '200';
    
    // 重置分组折叠状态
    groupCollapsedState = {};
    
    // 重置静态加成
    document.getElementById('static_bonus_list').innerHTML = '';
    
    // 重置动态Buff池
    document.getElementById('buff_pool').innerHTML = '';
    buffPool = [];
    
    // 重置动作序列
    sequence = [];
    renderSequence();
    
    // 重置声骸配置
    resetEchoConfig('echo_a');
    resetEchoConfig('echo_b');
    
    // 重置声骸A装备状态
    const echoACheckbox = document.getElementById('echo_a_equipped');
    if (echoACheckbox) {
        echoACheckbox.checked = true;
    }
    
    // 重置自定义伤害类型（只保留默认类型）
    // 但保留可能已从本地存储加载的自定义类型
    const defaultTypes = [
        { id: 'all', name: '通用' },
        { id: 'basic', name: '普攻' },
        { id: 'heavy', name: '重击' },
        { id: 'skill', name: '共鸣技能' },
        { id: 'ult', name: '共鸣解放' },
        { id: 'echo', name: '声骸技能' }
    ];
    // 尝试从本地存储加载自定义类型
    loadCustomDamageTypesFromStorage();
    // 确保默认类型存在
    const customTypes = DAMAGE_TYPES.filter(t => t.id.startsWith('custom_'));
    DAMAGE_TYPES = [...defaultTypes, ...customTypes];
    
    // 更新所有选择器
    updateAllDamageTypeSelects();
    
    // 重置图表和结果
    const ctx = document.getElementById('dmgChart').getContext('2d');
    if (dmgChart) dmgChart.destroy();
    
    // 清空结果显示区域
    document.getElementById('compare_res').innerHTML = '<div style="text-align:center; color:#8b949e; padding:20px;">等待计算...</div>';
    
    // 清空伤害组成表格
    document.getElementById('damageComposition').innerHTML = '<div style="text-align:center; color:#8b949e; padding:20px;">暂无伤害数据</div>';
    
    // 隐藏详细加成信息
    const bonusContainer = document.getElementById('detailed_bonus_info');
    if (bonusContainer) {
        bonusContainer.style.display = 'none';
    }
    
    // 重新初始化声骸选择器
    setTimeout(() => {
        initEchoSelects('echo_a');
        initEchoSelects('echo_b');
    }, 100);
    
    // 重新渲染Buff分页
    renderBuffPagination();
    
    alert('✅ 已重置所有设置到默认值！');
}