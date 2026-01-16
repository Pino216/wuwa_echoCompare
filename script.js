
    const SUBSTAT_DATA = {
        "none": { name: "(无)", values: [0] },
        "cr": { name: "暴击率", type: "cr", isPct: true, values: [10.5, 9.9, 9.3, 8.7, 8.1, 7.5, 6.9, 6.3] },
        "cd": { name: "暴击伤害", type: "cd", isPct: true, values: [21.0, 19.8, 18.6, 17.4, 16.2, 15.0, 13.8, 12.6] },
        "atk_pct": { name: "百分比攻击", type: "atk_pct", isPct: true, values: [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4] },
        "atk_flat": { name: "固定攻击", type: "atk_flat", isPct: false, values: [60, 50, 40, 30] },
        "basic": { name: "普攻加成", type: "basic", isPct: true, values: [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4] },
        "heavy": { name: "重击加成", type: "heavy", isPct: true, values: [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4] },
        "skill": { name: "共鸣技能加成", type: "skill", isPct: true, values: [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4] },
        "ult": { name: "共鸣解放加成", type: "ult", isPct: true, values: [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4] },
        "eff": { name: "共鸣效率", type: "other", isPct: true, values: [12.4, 11.6, 10.8, 10.0, 9.2, 8.4, 7.6, 6.8] },
        "hp_pct": { name: "百分比生命", type: "hp_pct", isPct: true, values: [11.6, 10.9, 10.1, 9.4, 8.6, 7.9, 7.1, 6.4] },
        "hp_flat": { name: "固定生命", type: "hp_flat", isPct: false, values: [580, 540, 510, 470, 430, 390, 360, 320] },
        "def_pct": { name: "百分比防御", type: "def_pct", isPct: true, values: [14.7, 13.8, 12.8, 11.8, 10.9, 10.0, 9.0, 8.1] },
        "def_flat": { name: "固定防御", type: "def_flat", isPct: false, values: [70, 60, 50, 40] }
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
            // 查找要删除的类型名称
            const typeToDelete = DAMAGE_TYPES.find(t => t.id === typeId);
            const typeName = typeToDelete ? typeToDelete.name : '未知类型';
        
            if (confirm(`确定要删除自定义伤害类型"${typeName}"吗？\n\n注意：删除后，使用此类型的配置将恢复为默认类型。`)) {
                DAMAGE_TYPES = DAMAGE_TYPES.filter(t => t.id !== typeId);
                updateAllDamageTypeSelects();
            
                // 重新计算
                if (sequence.length > 0) {
                    calculate(false);
                }
            
                // 如果管理面板是打开的，刷新它
                const panel = document.querySelector('div[style*="min-width: 400px"]');
                if (panel) {
                    // 关闭当前面板并重新打开
                    const overlay = document.querySelector('div[style*="background: rgba(0,0,0,0.5)"]');
                    if (overlay) document.body.removeChild(overlay);
                    document.body.removeChild(panel);
                    setTimeout(showCustomTypes, 100);
                } else {
                    alert('✅ 已删除自定义伤害类型');
                }
            }
        } else {
            alert('❌ 系统默认类型不能删除');
        }
    }

    function showCustomTypes() {
        const customTypes = DAMAGE_TYPES.filter(t => t.id.startsWith('custom_'));
    
        // 创建管理面板
        const panel = document.createElement('div');
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
    
        panel.setAttribute('data-custom-types-panel', 'true');
        panel.innerHTML = html;
    
        // 添加遮罩层，添加自定义属性以便更容易识别
        const overlay = document.createElement('div');
        overlay.setAttribute('data-custom-types-overlay', 'true');
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

    function addCustomDamageTypeFromPanel() {
        const customName = prompt('请输入自定义伤害类型名称：', '自定义类型');
        if (customName && customName.trim()) {
            const customId = 'custom_' + Date.now();
            DAMAGE_TYPES.push({ id: customId, name: customName.trim() });
            updateAllDamageTypeSelects();
        
            // 关闭当前面板并重新打开以刷新列表
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
        // 方法1：使用自定义属性查找
        const overlayByAttr = document.querySelector('div[data-custom-types-overlay="true"]');
        const panelByAttr = document.querySelector('div[data-custom-types-panel="true"]');
        
        if (overlayByAttr && overlayByAttr.parentNode === document.body) {
            document.body.removeChild(overlayByAttr);
        }
        if (panelByAttr && panelByAttr.parentNode === document.body) {
            document.body.removeChild(panelByAttr);
        }
        
        // 方法2：如果自定义属性方法失败，使用样式查找
        if (!overlayByAttr) {
            const overlays = document.querySelectorAll('div');
            overlays.forEach(el => {
                const style = el.style;
                if (style.position === 'fixed' && 
                    style.top === '0px' && 
                    style.left === '0px' && 
                    style.width === '100%' && 
                    style.height === '100%' && 
                    style.background === 'rgba(0, 0, 0, 0.5)' &&
                    style.zIndex === '9999') {
                    if (el.parentNode === document.body) {
                        document.body.removeChild(el);
                    }
                }
            });
        }
        
        if (!panelByAttr) {
            const panels = document.querySelectorAll('div');
            panels.forEach(el => {
                const style = el.style;
                if (style.position === 'fixed' && 
                    style.top === '50%' && 
                    style.left === '50%' && 
                    style.transform === 'translate(-50%, -50%)' &&
                    el.innerHTML.includes('管理自定义伤害类型')) {
                    if (el.parentNode === document.body) {
                        document.body.removeChild(el);
                    }
                }
            });
        }
        
        // 方法3：作为最后的手段，移除所有可能相关的元素
        // 查找所有固定定位且背景为半透明的元素
        const allElements = document.querySelectorAll('body > div');
        allElements.forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.position === 'fixed') {
                // 检查是否是遮罩层
                if (style.background === 'rgba(0, 0, 0, 0.5)' || 
                    style.backgroundColor === 'rgba(0, 0, 0, 0.5)') {
                    if (el.parentNode === document.body) {
                        document.body.removeChild(el);
                    }
                }
                // 检查是否是面板
                else if (el.innerHTML.includes('管理自定义伤害类型')) {
                    if (el.parentNode === document.body) {
                        document.body.removeChild(el);
                    }
                }
            }
        });
    }

    function editCustomType(typeId) {
        const type = DAMAGE_TYPES.find(t => t.id === typeId);
        if (!type) return;
    
        const newName = prompt('请输入新的类型名称：', type.name);
        if (newName && newName.trim() && newName.trim() !== type.name) {
            type.name = newName.trim();
            updateAllDamageTypeSelects();
        
            // 关闭当前面板并重新打开以刷新列表
            closeCustomTypesPanel();
        
            // 重新计算
            if (sequence.length > 0) {
                calculate(false);
            }
        
            // 重新打开管理面板
            setTimeout(showCustomTypes, 100);
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
            // 如果是首次加载（currentValue为空），默认选择'skill'类型
            const defaultValue = currentValue || 'skill';
            actTypeSelect.innerHTML = DAMAGE_TYPES.map(t => 
                `<option value="${t.id}" ${t.id === defaultValue ? 'selected' : ''}>${t.name}</option>`
            ).join('');
        }
        
        // 重新渲染序列
        renderSequence();
        // 注意：这里不调用calculate，由调用者决定是否计算
    }

    // 自动加载上次配置
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

    // 添加页面加载时的视觉增强
    window.onload = () => {
        initEchoSelects('echo_a');
        initEchoSelects('echo_b');
        
        // 初始化伤害类型选择器
        updateAllDamageTypeSelects();
        
        // 尝试自动加载上次保存的配置（抑制计算）
        const hasLoaded = autoLoadLastConfig();
        
        // 只有在没有加载到配置时才使用默认配置
        if (!hasLoaded) {
            // 检查sequence是否为空（可能是加载失败或没有保存的配置）
            if (sequence.length === 0) {
                sequence = [{ 
                    name: "技能演示", 
                    mult: 2.5, 
                    type: "skill", 
                    scaling: "atk",
                    activeBuffs: [] 
                }];
                renderSequence();
            }
        }
        
        // 只有在序列不为空时才进行计算
        if (sequence.length > 0) {
            // 页面初始化时不显示验证警告
            calculate(false);
        } else {
            // 如果序列为空，只更新界面但不计算
            console.log('⚠️ 序列为空，跳过初始计算');
            // 清空结果显示区域
            document.getElementById('compare_res').innerHTML = '<div style="text-align:center; color:#8b949e; padding:20px;">请添加动作序列后点击"执行全量化分析"</div>';
            // 清空图表
            const ctx = document.getElementById('dmgChart').getContext('2d');
            if (dmgChart) dmgChart.destroy();
            // 清空伤害组成表格
            document.getElementById('damageComposition').innerHTML = '<div style="text-align:center; color:#8b949e; padding:20px;">暂无伤害数据</div>';
        }

        // 添加输入框动画效果
        document.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('focus', function() {
                this.style.transform = 'scale(1.02)';
            });
            el.addEventListener('blur', function() {
                this.style.transform = 'scale(1)';
            });
        });

        // 为声骸A装备复选框添加事件监听
        const echoACheckbox = document.getElementById('echo_a_equipped');
        if (echoACheckbox) {
            echoACheckbox.addEventListener('change', function() {
                // 使用防抖计算，函数内部会检查序列是否为空
                debouncedCalculate();
            });
        }

        // 为所有现有的声骸数值选择器添加事件监听器
        document.querySelectorAll('.sub-val').forEach(select => {
            select.addEventListener('change', function() {
                // 使用防抖计算，函数内部会检查序列是否为空
                debouncedCalculate();
            });
        });

        // 添加键盘快捷键支持
        document.addEventListener('keydown', function(e) {
            // Ctrl+S 保存配置
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                saveConfig();
            }
            // Ctrl+Shift+S 保存并导出
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                saveConfig(true, 'json');
            }
            // Ctrl+L 加载配置
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                loadConfig();
            }
            // Ctrl+R 重新计算
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                // 使用防抖计算，函数内部会检查序列是否为空
                debouncedCalculate(0); // 0延迟，立即执行
            }
        });

        // 创建小型提示元素
        function createAutoSaveToast() {
            const toast = document.createElement('div');
            toast.id = 'autoSaveToast';
            toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(139, 69, 19, 0.9);
                color: white;
                padding: 10px 16px;
                border-radius: 8px;
                font-size: 12px;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.3s ease, transform 0.3s ease;
                pointer-events: none;
                max-width: 300px;
                backdrop-filter: blur(5px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            `;
            document.body.appendChild(toast);
            return toast;
        }

        // 显示自动保存提示
        function showAutoSaveToast(message) {
            let toast = document.getElementById('autoSaveToast');
            if (!toast) {
                toast = createAutoSaveToast();
            }
            
            toast.textContent = message;
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
            
            // 3秒后自动隐藏
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(20px)';
            }, 3000);
        }

        // 添加自动保存定时器（每5分钟自动保存一次）
        setInterval(() => {
            const lastSave = localStorage.getItem('mingchao_damage_calc_last_auto_save');
            const now = Date.now();
            // 如果超过5分钟没有保存，自动保存
            if (!lastSave || (now - parseInt(lastSave)) > 5 * 60 * 1000) {
                // 自动保存时不显示弹窗，只显示小型提示
                saveConfig(false, 'json', false);
                localStorage.setItem('mingchao_damage_calc_last_auto_save', now.toString());
                console.log('🔄 配置已自动保存');
                // 显示小型提示
                showAutoSaveToast('✅ 配置已自动保存');
            }
        }, 60 * 1000); // 每分钟检查一次

        // 初始化分页
        setTimeout(() => {
            renderBuffPagination();
        }, 100);

        // 项目完整性检查
        function checkProjectIntegrity() {
            console.log('🔍 正在检查项目完整性...');
        
            // 检查必要的DOM元素
            const requiredElements = [
                'base_atk', 'total_atk_now', 'base_cr', 'base_cd',
                'act_type', 'act_name', 'act_mult', 'act_scaling',
                'static_bonus_list', 'buff_pool', 'action_sequence',
                'echo_a', 'echo_b', 'compare_res', 'dmgChart'
            ];
        
            let allElementsExist = true;
            requiredElements.forEach(id => {
                const element = document.getElementById(id);
                if (!element) {
                    console.error(`❌ 缺少必要元素: #${id}`);
                    allElementsExist = false;
                }
            });
        
            // 检查DAMAGE_TYPES数组
            if (!DAMAGE_TYPES || !Array.isArray(DAMAGE_TYPES) || DAMAGE_TYPES.length === 0) {
                console.error('❌ DAMAGE_TYPES数组未正确初始化');
                allElementsExist = false;
            } else {
                console.log(`✅ DAMAGE_TYPES数组包含 ${DAMAGE_TYPES.length} 个伤害类型`);
            }
        
            // 检查SUBSTAT_DATA对象
            if (!SUBSTAT_DATA || typeof SUBSTAT_DATA !== 'object' || Object.keys(SUBSTAT_DATA).length === 0) {
                console.error('❌ SUBSTAT_DATA对象未正确初始化');
                allElementsExist = false;
            } else {
                console.log(`✅ SUBSTAT_DATA对象包含 ${Object.keys(SUBSTAT_DATA).length} 个词条类型`);
            }
        
            if (allElementsExist) {
                console.log('✅ 项目完整性检查通过！');
            } else {
                console.warn('⚠️ 项目完整性检查发现一些问题，某些功能可能无法正常工作');
            }
        
            return allElementsExist;
        }

        // 添加欢迎提示
        setTimeout(() => {
            console.log('🎮 鸣潮伤害分析工具已就绪！');
            console.log('📋 快捷键：Ctrl+S保存，Ctrl+Shift+S导出，Ctrl+L加载，Ctrl+R计算');
            console.log('📊 声骸词条修改实时计算已启用');
            console.log('💾 自动保存功能已启用（每5分钟）');
            console.log('📄 Buff列表分页功能已启用（每页8个）');
        
            // 运行完整性检查
            checkProjectIntegrity();
        
            if (sequence.length === 0) {
                console.log('⚠️ 当前动作序列为空，请添加动作后进行计算');
                // 隐藏详细加成信息容器
                const bonusContainer = document.getElementById('detailed_bonus_info');
                if (bonusContainer) {
                    bonusContainer.style.display = 'none';
                }
            }
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
            row.innerHTML = nameSelect + `<select class="sub-val" onchange="calculate(false)"><option value="0">0</option></select>`;
            container.appendChild(row);
        }
    }

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

    // 分页相关变量
    let buffPage = 1;
    const BUFFS_PER_PAGE = 8;
    let totalBuffPages = 1;

    // --- Buff 核心逻辑 ---
    function addNewBuff() {
        const fixedId = 'b_' + Date.now();
        const typeOptions = DAMAGE_TYPES.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
        const html = `
            <div class="buff-config" data-id="${fixedId}" style="border-left:4px solid #4a6bff; background:rgba(74, 107, 255, 0.1); padding:12px; margin-bottom:10px; border-radius:8px;">
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
                    <select class="b-type" onchange="debouncedCalculate()">${typeOptions}</select>
                    <input type="number" class="b-val" value="10" style="width:40px" oninput="debouncedCalculate()">%
                    <button onclick="confirmDelete('确定要删除这个Buff吗？', () => removeBuff('${fixedId}'))" style="color:#ff6b8b; background:none; border:none; cursor:pointer; font-size:16px; font-weight:bold;">×</button>
                </div>
            </div>`;
        
        // 添加到Buff池
        document.getElementById('buff_pool').insertAdjacentHTML('beforeend', html);
        
        // 更新Buff池数据
        updateBuffPool();
        
        // 重新渲染分页
        renderBuffPagination();
        
        // 渲染序列
        renderSequence();
    }

    function removeBuff(buffId) {
        const buffElement = document.querySelector(`.buff-config[data-id="${buffId}"]`);
        if (buffElement) {
            buffElement.remove();
            updateBuffPool();
            renderBuffPagination();
            renderSequence();
            calculate();
        }
    }

    function renderBuffPagination() {
        const buffPoolContainer = document.getElementById('buff_pool');
        const allBuffs = buffPoolContainer.querySelectorAll('.buff-config');
        const totalBuffs = allBuffs.length;
        
        // 计算总页数
        totalBuffPages = Math.ceil(totalBuffs / BUFFS_PER_PAGE);
        
        // 如果当前页大于总页数，回到第一页
        if (buffPage > totalBuffPages && totalBuffPages > 0) {
            buffPage = totalBuffPages;
        }
        
        // 隐藏所有Buff
        allBuffs.forEach(buff => {
            buff.style.display = 'none';
        });
        
        // 显示当前页的Buff
        const startIndex = (buffPage - 1) * BUFFS_PER_PAGE;
        const endIndex = startIndex + BUFFS_PER_PAGE;
        
        for (let i = startIndex; i < endIndex && i < totalBuffs; i++) {
            allBuffs[i].style.display = 'block';
        }
        
        // 创建或更新分页控件
        let paginationContainer = document.getElementById('buff_pagination');
        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.id = 'buff_pagination';
            paginationContainer.style.marginTop = '10px';
            paginationContainer.style.display = 'flex';
            paginationContainer.style.justifyContent = 'center';
            paginationContainer.style.alignItems = 'center';
            paginationContainer.style.gap = '8px';
            buffPoolContainer.parentNode.insertBefore(paginationContainer, buffPoolContainer.nextSibling);
        }
        
        // 更新分页控件
        if (totalBuffPages > 1) {
            let paginationHTML = '';
            
            // 上一页按钮
            paginationHTML += `<button class="pagination-btn" onclick="changeBuffPage(${buffPage - 1})" ${buffPage === 1 ? 'disabled' : ''}>◀</button>`;
            
            // 页码显示
            paginationHTML += `<span style="font-size:12px; color:#8B4513; font-weight:bold;">${buffPage} / ${totalBuffPages}</span>`;
            
            // 下一页按钮
            paginationHTML += `<button class="pagination-btn" onclick="changeBuffPage(${buffPage + 1})" ${buffPage === totalBuffPages ? 'disabled' : ''}>▶</button>`;
            
            // 添加Buff数量显示
            paginationHTML += `<span style="margin-left:10px; font-size:11px; color:#8b949e;">共 ${totalBuffs} 个Buff</span>`;
            
            paginationContainer.innerHTML = paginationHTML;
            paginationContainer.style.display = 'flex';
        } else {
            paginationContainer.style.display = 'none';
        }
    }

    function changeBuffPage(newPage) {
        if (newPage >= 1 && newPage <= totalBuffPages) {
            buffPage = newPage;
            renderBuffPagination();
        }
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
        
        // 更新分页显示
        renderBuffPagination();
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
    // 添加动作后立即计算（关键操作，函数内部会检查序列是否为空）
    immediateCalculate();
}

    function renderSequence() {
        updateBuffPool();
        const container = document.getElementById('action_sequence');
        container.innerHTML = sequence.map((a, i) => {
            // 生成伤害类型选项
            const typeOptions = DAMAGE_TYPES.map(t => 
                `<option value="${t.id}" ${t.id === a.type ? 'selected' : ''}>${t.name}</option>`
            ).join('');
            
            // 转义动作名称，防止破坏HTML属性
            const escapedName = a.name.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            // 用于确认消息的动作名称（需要转义JavaScript字符串中的特殊字符）
            const jsEscapedName = a.name.replace(/'/g, "\\'").replace(/"/g, '\\"');
            
            return `
            <div class="action-card" data-index="${i}">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
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
                    ${buffPool.map(b => `
                        <div class="chip ${a.activeBuffs.includes(b.id) ? 'active' : ''}"
                             data-bid="${b.id}" onclick="toggleBuff(${i}, '${b.id}')">
                            ${b.name}
                        </div>
                    `).join('')}
                </div>
            </div>
        `}).join('');
    }

    function updateActionName(index, newName) {
        if (index >= 0 && index < sequence.length) {
            sequence[index].name = newName;
            renderSequence();
            // 使用防抖计算，函数内部会检查序列是否为空
            debouncedCalculate();
        }
    }

    function updateActionMult(index, newMult) {
        if (index >= 0 && index < sequence.length) {
            sequence[index].mult = parseFloat(newMult) / 100;
            renderSequence();
            // 使用防抖计算，函数内部会检查序列是否为空
            debouncedCalculate();
        }
    }

    function updateActionType(index, newType) {
        if (index >= 0 && index < sequence.length) {
            sequence[index].type = newType;
            renderSequence();
            // 使用防抖计算，函数内部会检查序列是否为空
            debouncedCalculate();
        }
    }

    function updateActionScaling(index, newScaling) {
        if (index >= 0 && index < sequence.length) {
            sequence[index].scaling = newScaling;
            renderSequence();
            // 使用防抖计算，函数内部会检查序列是否为空
            debouncedCalculate();
        }
    }

    function toggleBuff(actIdx, buffId) {
        const bIdx = sequence[actIdx].activeBuffs.indexOf(buffId);
        if(bIdx > -1) sequence[actIdx].activeBuffs.splice(bIdx, 1);
        else sequence[actIdx].activeBuffs.push(buffId);
        renderSequence();
        // 关键操作，立即计算（函数内部会检查序列是否为空）
        immediateCalculate();
    }

    // 防抖计时器
    let debounceTimer = null;
    
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
    
    // --- 计算逻辑 ---
function runSim(extraSubs = [], removeSubs = []) {
    updateBuffPool();

    // 1. 获取基础面板数据
    const baseAtk = parseFloat(document.getElementById('base_atk').value) || 0;
    const totalAtkNow = parseFloat(document.getElementById('total_atk_now').value) || 0;
    const baseHp = parseFloat(document.getElementById('base_hp')?.value) || 0;
    const totalHpNow = parseFloat(document.getElementById('total_hp_now')?.value) || 0;
    const baseDef = parseFloat(document.getElementById('base_def').value) || 0;
    const totalDefNow = parseFloat(document.getElementById('total_def_now')?.value) || 0;

    const panelCr = parseFloat(document.getElementById('base_cr').value) / 100 || 0;
    const panelCd = parseFloat(document.getElementById('base_cd').value) / 100 || 0;

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

// --- 伤害组成表格显示 ---
function updateDamageComposition(typeDmg) {
    const container = document.getElementById('damageComposition');
    if (!container) return;
    
    // 计算总伤害
    const total = Object.values(typeDmg).reduce((a, b) => a + b, 0);
    
    // 过滤掉伤害为0的类型
    const damageTypesForTable = DAMAGE_TYPES.filter(t => t.id !== 'all' && (typeDmg[t.id] || 0) > 0);
    
    // 按伤害值降序排序
    damageTypesForTable.sort((a, b) => (typeDmg[b.id] || 0) - (typeDmg[a.id] || 0));
    
    if (damageTypesForTable.length === 0) {
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
    damageTypesForTable.forEach((type, index) => {
        const damage = typeDmg[type.id] || 0;
        const percentage = total > 0 ? (damage / total * 100) : 0;
        cumulativePercentage += percentage;
        
        // 交替行背景色
        const rowBg = index % 2 === 0 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(210, 180, 140, 0.1)';
        
        html += `
            <tr style="background:${rowBg};">
                <td style="padding:8px; border-bottom:1px solid rgba(139, 69, 19, 0.1);">
                    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:6px; background:${getColorForType(type.id)};"></span>
                    ${type.name}
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
        
        // 验证动作倍率
        for (let i = 0; i < sequence.length; i++) {
            const action = sequence[i];
            if (isNaN(action.mult) || action.mult <= 0) {
                if (showAlert) {
                    alert(`❌ 动作"${action.name}"的倍率必须为正数`);
                }
                return false;
            }
        }
        
        return true;
    }

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

        // 修复：正确获取声骸A装备状态
        const echoACheckbox = document.getElementById('echo_a_equipped');
        const isEchoAEquipped = echoACheckbox ? echoACheckbox.checked : true;
        
        let resBase, resB;
        let echoASubs, echoBSubs;
        
        if (isEchoAEquipped) {
            // 声骸A已装备：基础伤害已经包含声骸A的词条（体现在面板中）
            echoASubs = getEchoSubs('echo_a');
            echoBSubs = getEchoSubs('echo_b');
            // 基础伤害：使用当前面板（包含声骸A的词条）
            // 这里传递空数组，因为声骸A的词条已经在面板中
            resBase = runSim([], []);
            // 声骸B的伤害：移除声骸A的词条，添加声骸B的词条
            resB = runSim(echoBSubs, echoASubs);
        } else {
            // 声骸A未装备：基础伤害不包含任何声骸词条
            echoASubs = getEchoSubs('echo_a');
            echoBSubs = getEchoSubs('echo_b');
            resBase = runSim([], []);
            // 分别计算声骸A和B的提升
            const resA = runSim(echoASubs, []);
            const resBWithA = runSim(echoBSubs, []);
            
            const gainA = (resA.totalDmg / resBase.totalDmg - 1) * 100;
            const gainB = (resBWithA.totalDmg / resBase.totalDmg - 1) * 100;
            const diff = gainA - gainB;
            
            updateChart(resBase.typeDmg);
            updateDamageComposition(resBase.typeDmg);
            
            // 显示详细的变化分析
            document.getElementById('compare_res').innerHTML = generateDamageChangeAnalysis(
                resBase, resA, resBWithA, 
                echoASubs, echoBSubs,
                gainA, gainB, diff,
                false
            );
            
            // 新增：显示详细加成信息（基于无任何声骸的情况）
            displayDetailedBonusInfo(resBase.detailedInfo);
            return;
        }

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

    // 生成伤害变化分析表格
    function generateDamageChangeAnalysis(resBase, resA, resB, echoASubs, echoBSubs, gainA, gainB, diff, isEchoAEquipped) {
        // 获取声骸词条详情
        const echoADetails = getEchoSubDetails(echoASubs);
        const echoBDetails = getEchoSubDetails(echoBSubs);
        
        // 计算伤害类型变化
        const typeChanges = calculateTypeChanges(resBase.typeDmg, resB.typeDmg);
        
        let html = `
            <div style="margin-bottom:15px;">
                <h3 style="margin-top:0; color:#8B4513; font-size:1.1em; border-bottom:2px solid rgba(139, 69, 19, 0.3); padding-bottom:5px;">
                    ${isEchoAEquipped ? '声骸替换影响分析' : '声骸提升对比分析'}
                </h3>
        `;
        
        if (isEchoAEquipped) {
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
        } else {
            html += `
                <div style="margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <span>无任何声骸:</span>
                        <span style="font-weight:bold;">${resBase.totalDmg.toFixed(0)}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <span>装备声骸 A:</span>
                        <span style="font-weight:bold;">${resA.totalDmg.toFixed(0)} <span class="diff-pos">(+${gainA.toFixed(2)}%)</span></span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <span>装备声骸 B:</span>
                        <span style="font-weight:bold;">${resB.totalDmg.toFixed(0)} <span class="diff-pos">(+${gainB.toFixed(2)}%)</span></span>
                    </div>
                </div>
            `;
        }
        
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

    // 获取声骸词条详情（包括百分比和固定值）
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

    // 显示详细加成信息到中间面板 - 按伤害类型分类统计
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
        
        // 填充分组数据
        detailedInfo.forEach(info => {
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
        
        const totalDamageBonus = detailedInfo.reduce((sum, info) => sum + info.damageBonusPct, 0);
        const totalDamageDeepen = detailedInfo.reduce((sum, info) => sum + info.damageDeepenPct, 0);
    
        // 分别统计不同基数的属性加成
        // 注意：info.attrBonusPct 只包含声骸和Buff带来的额外加成
        // 我们需要加上面板已有加成
        detailedInfo.forEach(info => {
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
        const avgDamageBonusMultiplier = 1 + (totalDamageBonus / detailedInfo.length) / 100;
        const avgDamageDeepenMultiplier = 1 + (totalDamageDeepen / detailedInfo.length) / 100;
    
        // 计算平均暴击信息
        const avgCritRate = detailedInfo.reduce((sum, info) => sum + info.critRate, 0) / detailedInfo.length;
        const avgCritDamage = detailedInfo.reduce((sum, info) => sum + info.critDamage, 0) / detailedInfo.length;
        const avgCritMultiplier = detailedInfo.reduce((sum, info) => sum + info.critMultiplier, 0) / detailedInfo.length;

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
                    <span>平均伤害加成：</span>
                    <span style="color:#ff9800; font-weight:bold;">${(totalDamageBonus / detailedInfo.length).toFixed(2)}% (${avgDamageBonusMultiplier.toFixed(3)}倍)</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                    <span>平均伤害加深：</span>
                    <span style="color:#4caf50; font-weight:bold;">${(totalDamageDeepen / detailedInfo.length).toFixed(2)}% (${avgDamageDeepenMultiplier.toFixed(3)}倍)</span>
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
                    💡 "总加成"包括面板已有加成（基础→当前面板）和声骸、Buff等带来的额外提升
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

    // --- 通用辅助 ---
function updateChart(typeDmg) {
    const ctx = document.getElementById('dmgChart').getContext('2d');
    if (dmgChart) dmgChart.destroy();

    // 计算总伤害，用于计算百分比
    const total = Object.values(typeDmg).reduce((a, b) => a + b, 0);
    
    // 创建标签和数据值的映射
    // 我们需要按照DAMAGE_TYPES的顺序来组织，但排除'all'类型
    const damageTypesForChart = DAMAGE_TYPES.filter(t => t.id !== 'all');
    const labels = damageTypesForChart.map(t => t.name);
    const dataValues = damageTypesForChart.map(t => typeDmg[t.id] || 0);

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

    // 获取声骸配置的辅助函数
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

    // 设置声骸配置的辅助函数
    function setEchoConfig(id, subs) {
        const container = document.querySelector(`#${id} .substat-container`);
        if (!container || !subs) return;
            
        // 确保有足够的行
        const rows = container.querySelectorAll('.substat-row');
        for (let i = 0; i < Math.max(subs.length, 5); i++) {
            if (i >= rows.length) {
                // 添加新行
                const row = document.createElement('div');
                row.className = 'substat-row';
                let nameSelect = `<select class="sub-name" onchange="updateSubValues(this)">`;
                for(let key in SUBSTAT_DATA) nameSelect += `<option value="${key}">${SUBSTAT_DATA[key].name}</option>`;
                nameSelect += `</select>`;
                row.innerHTML = nameSelect + `<select class="sub-val" onchange="if(sequence.length>0)debouncedCalculate()"><option value="0">0</option></select>`;
                container.appendChild(row);
            }
        }
            
        // 更新值
        const updatedRows = container.querySelectorAll('.substat-row');
        subs.forEach((sub, i) => {
            if (i < updatedRows.length) {
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

    // 导出菜单控制
    let exportMenuVisible = false;
    
    function toggleExportMenu() {
        const menu = document.getElementById('exportMenu');
        if (!menu) return;
        
        if (exportMenuVisible) {
            menu.style.display = 'none';
        } else {
            // 隐藏其他可能打开的菜单
            menu.style.display = 'block';
            // 点击页面其他地方时关闭菜单
            setTimeout(() => {
                document.addEventListener('click', closeExportMenuOnClickOutside);
            }, 10);
        }
        exportMenuVisible = !exportMenuVisible;
    }
    
    function closeExportMenuOnClickOutside(event) {
        const menu = document.getElementById('exportMenu');
        const button = document.querySelector('.export-btn');
        
        if (menu && button && 
            !menu.contains(event.target) && 
            !button.contains(event.target)) {
            menu.style.display = 'none';
            exportMenuVisible = false;
            document.removeEventListener('click', closeExportMenuOnClickOutside);
        }
    }
    
    // 导出数据（支持JSON和XLSX格式）- 现在通过点击菜单选择
    function exportFullData() {
        // 默认导出JSON格式，以保持向后兼容性
        exportToJSON();
    }

    // 确认删除自定义类型的函数
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
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            max-width: 400px;
            width: 90%;
            border: 2px solid #8B4513;
        `;
        
        // 创建复选框
        const checkboxId = 'skipConfirmCheckbox_' + Date.now();
        const modalContent = `
            <h3 style="margin-top:0; color:#8B4513; margin-bottom:15px;">确认删除</h3>
            <p style="margin-bottom:20px; color:#333;">${message}</p>
            <div style="margin-bottom:20px;">
                <label style="display:flex; align-items:center; cursor:pointer;">
                    <input type="checkbox" id="${checkboxId}" style="margin-right:8px;">
                    <span style="font-size:13px; color:#8B4513;">当次使用不再提示（关闭页面后重置）</span>
                </label>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:10px;">
                <button id="cancelBtn" style="
                    background:linear-gradient(135deg, #8b949e, #6e7681);
                    color:white;
                    border:none;
                    padding:8px 16px;
                    border-radius:6px;
                    cursor:pointer;
                    font-weight:bold;
                ">取消</button>
                <button id="confirmBtn" style="
                    background:linear-gradient(135deg, #ff6b8b, #ff8ba3);
                    color:white;
                    border:none;
                    padding:8px 16px;
                    border-radius:6px;
                    cursor:pointer;
                    font-weight:bold;
                ">确认删除</button>
            </div>
        `;
        
        modal.innerHTML = modalContent;
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // 添加事件监听
        document.getElementById('cancelBtn').onclick = function() {
            document.body.removeChild(overlay);
        };
        
        document.getElementById('confirmBtn').onclick = function() {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox.checked) {
                sessionStorage.setItem('skipDeleteConfirm', 'true');
            }
            document.body.removeChild(overlay);
            callback();
        };
        
        // 点击遮罩层关闭
        overlay.onclick = function(e) {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        };
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

    // 导出为JSON格式（可接受外部config参数）
    function exportToJSON(externalConfig = null) {
        try {
            let config;
            if (externalConfig) {
                config = externalConfig;
            } else {
                updateBuffPool();
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
                    damage_types: DAMAGE_TYPES.filter(t => t.id.startsWith('custom_'))
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
                updateBuffPool();
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
                    damage_types: DAMAGE_TYPES.filter(t => t.id.startsWith('custom_'))
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
                ["动作名称", "倍率(%)", "伤害类型", "基数", "激活Buff"]
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
                totalDamageData.push(["总计", totalDmg.toFixed(0), "100.00"]);
                
                // 计算声骸对比数据
                echoComparisonData.push(["对比项目", "声骸A", "声骸B", "变化量", "变化率(%)"]);
                
                if (isEchoAEquipped) {
                    // 声骸A已装备：基础伤害已经包含声骸A的词条
                    const resB = runSim(echoBSubs, echoASubs);
                    const gainB = (resB.totalDmg / resBase.totalDmg - 1) * 100;
                    
                    echoComparisonData.push(["总伤害", resBase.totalDmg.toFixed(0), resB.totalDmg.toFixed(0), 
                        (resB.totalDmg - resBase.totalDmg).toFixed(0), gainB.toFixed(2)]);
                    
                    // 各伤害类型变化
                    DAMAGE_TYPES.forEach(type => {
                        if (type.id !== 'all') {
                            const before = resBase.typeDmg[type.id] || 0;
                            const after = resB.typeDmg[type.id] || 0;
                            if (before > 0 || after > 0) {
                                const change = after - before;
                                const changePercent = before > 0 ? ((change / before) * 100).toFixed(2) : "100.00";
                                echoComparisonData.push([`${type.name}伤害`, before.toFixed(0), after.toFixed(0), 
                                    change.toFixed(0), changePercent]);
                            }
                        }
                    });
                } else {
                    // 声骸A未装备
                    const resA = runSim(echoASubs, []);
                    const resB = runSim(echoBSubs, []);
                    const gainA = (resA.totalDmg / resBase.totalDmg - 1) * 100;
                    const gainB = (resB.totalDmg / resBase.totalDmg - 1) * 100;
                    const diff = gainA - gainB;
                    
                    echoComparisonData.push(["无声骸总伤害", resBase.totalDmg.toFixed(0), "", "", ""]);
                    echoComparisonData.push(["声骸A总伤害", resA.totalDmg.toFixed(0), "", gainA.toFixed(2) + "%", ""]);
                    echoComparisonData.push(["声骸B总伤害", "", resB.totalDmg.toFixed(0), gainB.toFixed(2) + "%", ""]);
                    echoComparisonData.push(["A vs B差异", "", "", diff.toFixed(2) + "%", 
                        diff > 0 ? "声骸A更强" : "声骸B更强"]);
                }
                
                // 恢复原始状态
                sequence = originalSequence;
                buffPool = originalBuffPool;
            } else {
                totalDamageData.push(["提示", "动作序列为空，无法计算伤害"]);
                echoComparisonData.push(["提示", "动作序列为空，无法进行声骸对比"]);
            }
            
            // 7. 详细计算过程工作表
            let detailedCalculationData = [];
            
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
                
                // 计算基础伤害（使用声骸A）
                const resBase = runSim([], []);
                
                // 准备详细计算数据
                detailedCalculationData.push(["详细伤害计算过程（基于当前装备的声骸A）"]);
                detailedCalculationData.push([]);
                detailedCalculationData.push(["动作名称", "伤害类型", "基数类型", "基础属性", "面板已有加成%", "额外加成%", "总属性加成%", 
                                             "伤害加成%", "伤害加深%", "暴击率%", "暴击伤害%", "暴击期望倍率", 
                                             "动作倍率%", "最终属性值", "基础伤害", "暴击期望伤害", "应用Buff"]);
                
                // 遍历每个动作的详细信息
                resBase.detailedInfo.forEach(info => {
                    const damageTypeName = DAMAGE_TYPES.find(t => t.id === info.damageType)?.name || info.damageType;
                    const scalingName = {
                        'atk': '攻击力',
                        'hp': '生命值',
                        'def': '防御力'
                    }[info.scalingType] || info.scalingType;
                    
                    // 获取基础属性值
                    let baseStat = 0;
                    if (info.scalingType === 'atk') {
                        baseStat = parseFloat(document.getElementById('base_atk').value) || 0;
                    } else if (info.scalingType === 'hp') {
                        baseStat = parseFloat(document.getElementById('base_hp')?.value) || 0;
                    } else if (info.scalingType === 'def') {
                        baseStat = parseFloat(document.getElementById('base_def').value) || 0;
                    }
                    
                    // 计算总属性加成百分比
                    const totalAttrPct = (info.panelExistingPct || 0) + info.totalAttrBonusPct;
                    
                    // 计算最终属性值
                    const finalScalingValue = info.finalScalingValue || (baseStat * (1 + totalAttrPct / 100));
                    
                    // 从序列中获取动作倍率
                    const action = config.sequence[info.actionIndex];
                    const actionMultPct = (action.mult * 100).toFixed(1);
                    
                    // 计算基础伤害（未考虑暴击）
                    const baseDamage = finalScalingValue * action.mult;
                    
                    // 计算暴击期望伤害
                    const critExpDamage = baseDamage * info.critMultiplier;
                    
                    // 格式化Buff信息
                    const buffNames = info.appliedBuffs.map(b => `${b.name}+${b.value.toFixed(1)}%`).join('; ');
                    
                    detailedCalculationData.push([
                        info.actionName,
                        damageTypeName,
                        scalingName,
                        baseStat.toFixed(0),
                        (info.panelExistingPct || 0).toFixed(2),
                        info.totalAttrBonusPct.toFixed(2),
                        totalAttrPct.toFixed(2),
                        info.totalDamageBonusPct.toFixed(2),
                        info.totalDamageDeepenPct.toFixed(2),
                        info.critRate.toFixed(1),
                        info.critDamage.toFixed(1),
                        info.critMultiplier.toFixed(3),
                        actionMultPct,
                        finalScalingValue.toFixed(0),
                        baseDamage.toFixed(0),
                        critExpDamage.toFixed(0),
                        buffNames || "无"
                    ]);
                });
                
                // 添加总计行
                detailedCalculationData.push([]);
                detailedCalculationData.push(["总计", "", "", "", "", "", "", "", "", "", "", "", "", "", 
                    "", resBase.totalDmg.toFixed(0), ""]);
                
                // 恢复原始状态
                sequence = originalSequence;
                buffPool = originalBuffPool;
            } else {
                detailedCalculationData.push(["提示", "动作序列为空，无法计算详细过程"]);
            }
            
            // 7. 总伤害计算结果工作表
            const ws6 = XLSX.utils.aoa_to_sheet(totalDamageData);
            XLSX.utils.book_append_sheet(wb, ws6, "总伤害分析");
            
            // 8. 声骸对比结果工作表
            const ws7 = XLSX.utils.aoa_to_sheet(echoComparisonData);
            XLSX.utils.book_append_sheet(wb, ws7, "声骸对比");
            
            // 9. 详细计算过程工作表（基于声骸A）
            const ws8 = XLSX.utils.aoa_to_sheet(detailedCalculationData);
            XLSX.utils.book_append_sheet(wb, ws8, "详细计算过程(声骸A)");
            
            // 10. 声骸对比详细计算过程工作表
            let echoComparisonDetailedData = [];
            
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
                
                if (isEchoAEquipped) {
                    // 声骸A已装备：基础伤害已经包含声骸A的词条
                    const resBase = runSim([], []);
                    const resB = runSim(echoBSubs, echoASubs);
                    
                    // 准备详细对比数据
                    echoComparisonDetailedData.push(["声骸对比详细计算过程（声骸A vs 声骸B）"]);
                    echoComparisonDetailedData.push([]);
                    echoComparisonDetailedData.push(["动作名称", "伤害类型", "基数类型", 
                                                     "声骸A总属性加成%", "声骸B总属性加成%", "属性加成变化%",
                                                     "声骸A伤害加成%", "声骸B伤害加成%", "伤害加成变化%",
                                                     "声骸A伤害加深%", "声骸B伤害加深%", "伤害加深变化%",
                                                     "声骸A暴击率%", "声骸B暴击率%", "暴击率变化%",
                                                     "声骸A暴击伤害%", "声骸B暴击伤害%", "暴击伤害变化%",
                                                     "声骸A暴击期望倍率", "声骸B暴击期望倍率", "暴击期望变化",
                                                     "声骸A最终属性值", "声骸B最终属性值", "属性值变化",
                                                     "声骸A基础伤害", "声骸B基础伤害", "基础伤害变化",
                                                     "声骸A暴击期望伤害", "声骸B暴击期望伤害", "伤害变化"]);
                    
                    // 遍历每个动作的详细信息
                    for (let i = 0; i < resBase.detailedInfo.length; i++) {
                        const infoA = resBase.detailedInfo[i];
                        const infoB = resB.detailedInfo[i];
                        
                        const damageTypeName = DAMAGE_TYPES.find(t => t.id === infoA.damageType)?.name || infoA.damageType;
                        const scalingName = {
                            'atk': '攻击力',
                            'hp': '生命值',
                            'def': '防御力'
                        }[infoA.scalingType] || infoA.scalingType;
                        
                        // 计算总属性加成百分比
                        const totalAttrPctA = (infoA.panelExistingPct || 0) + infoA.totalAttrBonusPct;
                        const totalAttrPctB = (infoB.panelExistingPct || 0) + infoB.totalAttrBonusPct;
                        const attrChange = totalAttrPctB - totalAttrPctA;
                        
                        // 伤害加成变化
                        const damageBonusChange = infoB.totalDamageBonusPct - infoA.totalDamageBonusPct;
                        // 伤害加深变化
                        const damageDeepenChange = infoB.totalDamageDeepenPct - infoA.totalDamageDeepenPct;
                        // 暴击率变化
                        const critRateChange = infoB.critRate - infoA.critRate;
                        // 暴击伤害变化
                        const critDamageChange = infoB.critDamage - infoA.critDamage;
                        // 暴击期望倍率变化
                        const critMultiplierChange = infoB.critMultiplier - infoA.critMultiplier;
                        
                        // 最终属性值变化
                        const finalScalingValueA = infoA.finalScalingValue || 0;
                        const finalScalingValueB = infoB.finalScalingValue || 0;
                        const scalingValueChange = finalScalingValueB - finalScalingValueA;
                        
                        // 从序列中获取动作倍率
                        const action = config.sequence[infoA.actionIndex];
                        const actionMult = action.mult;
                        
                        // 计算基础伤害（未考虑暴击）
                        const baseDamageA = finalScalingValueA * actionMult;
                        const baseDamageB = finalScalingValueB * actionMult;
                        const baseDamageChange = baseDamageB - baseDamageA;
                        
                        // 计算暴击期望伤害
                        const critExpDamageA = baseDamageA * infoA.critMultiplier;
                        const critExpDamageB = baseDamageB * infoB.critMultiplier;
                        const critExpDamageChange = critExpDamageB - critExpDamageA;
                        
                        echoComparisonDetailedData.push([
                            infoA.actionName,
                            damageTypeName,
                            scalingName,
                            totalAttrPctA.toFixed(2),
                            totalAttrPctB.toFixed(2),
                            attrChange.toFixed(2),
                            infoA.totalDamageBonusPct.toFixed(2),
                            infoB.totalDamageBonusPct.toFixed(2),
                            damageBonusChange.toFixed(2),
                            infoA.totalDamageDeepenPct.toFixed(2),
                            infoB.totalDamageDeepenPct.toFixed(2),
                            damageDeepenChange.toFixed(2),
                            infoA.critRate.toFixed(1),
                            infoB.critRate.toFixed(1),
                            critRateChange.toFixed(1),
                            infoA.critDamage.toFixed(1),
                            infoB.critDamage.toFixed(1),
                            critDamageChange.toFixed(1),
                            infoA.critMultiplier.toFixed(3),
                            infoB.critMultiplier.toFixed(3),
                            critMultiplierChange.toFixed(3),
                            finalScalingValueA.toFixed(0),
                            finalScalingValueB.toFixed(0),
                            scalingValueChange.toFixed(0),
                            baseDamageA.toFixed(0),
                            baseDamageB.toFixed(0),
                            baseDamageChange.toFixed(0),
                            critExpDamageA.toFixed(0),
                            critExpDamageB.toFixed(0),
                            critExpDamageChange.toFixed(0)
                        ]);
                    }
                    
                    // 添加总计行
                    echoComparisonDetailedData.push([]);
                    echoComparisonDetailedData.push(["总计", "", "", 
                        "", "", "",
                        "", "", "",
                        "", "", "",
                        "", "", "",
                        "", "", "",
                        "", "", "",
                        "", "", "",
                        "", "", "",
                        resBase.totalDmg.toFixed(0), resB.totalDmg.toFixed(0), 
                        (resB.totalDmg - resBase.totalDmg).toFixed(0)]);
                    
                } else {
                    // 声骸A未装备
                    const resBase = runSim([], []);
                    const resA = runSim(echoASubs, []);
                    const resB = runSim(echoBSubs, []);
                    
                    echoComparisonDetailedData.push(["声骸对比详细计算过程（无声骸 vs 声骸A vs 声骸B）"]);
                    echoComparisonDetailedData.push([]);
                    echoComparisonDetailedData.push(["动作名称", "伤害类型", "基数类型", 
                                                     "无声骸总属性加成%", "声骸A总属性加成%", "声骸B总属性加成%",
                                                     "无声骸伤害加成%", "声骸A伤害加成%", "声骸B伤害加成%",
                                                     "无声骸伤害加深%", "声骸A伤害加深%", "声骸B伤害加深%",
                                                     "无声骸暴击率%", "声骸A暴击率%", "声骸B暴击率%",
                                                     "无声骸暴击伤害%", "声骸A暴击伤害%", "声骸B暴击伤害%",
                                                     "无声骸暴击期望倍率", "声骸A暴击期望倍率", "声骸B暴击期望倍率",
                                                     "无声骸最终属性值", "声骸A最终属性值", "声骸B最终属性值",
                                                     "无声骸基础伤害", "声骸A基础伤害", "声骸B基础伤害",
                                                     "无声骸暴击期望伤害", "声骸A暴击期望伤害", "声骸B暴击期望伤害"]);
                    
                    // 遍历每个动作的详细信息
                    for (let i = 0; i < resBase.detailedInfo.length; i++) {
                        const infoBase = resBase.detailedInfo[i];
                        const infoA = resA.detailedInfo[i];
                        const infoB = resB.detailedInfo[i];
                        
                        const damageTypeName = DAMAGE_TYPES.find(t => t.id === infoBase.damageType)?.name || infoBase.damageType;
                        const scalingName = {
                            'atk': '攻击力',
                            'hp': '生命值',
                            'def': '防御力'
                        }[infoBase.scalingType] || infoBase.scalingType;
                        
                        // 计算总属性加成百分比
                        const totalAttrPctBase = (infoBase.panelExistingPct || 0) + infoBase.totalAttrBonusPct;
                        const totalAttrPctA = (infoA.panelExistingPct || 0) + infoA.totalAttrBonusPct;
                        const totalAttrPctB = (infoB.panelExistingPct || 0) + infoB.totalAttrBonusPct;
                        
                        // 从序列中获取动作倍率
                        const action = config.sequence[infoBase.actionIndex];
                        const actionMult = action.mult;
                        
                        // 最终属性值
                        const finalScalingValueBase = infoBase.finalScalingValue || 0;
                        const finalScalingValueA = infoA.finalScalingValue || 0;
                        const finalScalingValueB = infoB.finalScalingValue || 0;
                        
                        // 计算基础伤害（未考虑暴击）
                        const baseDamageBase = finalScalingValueBase * actionMult;
                        const baseDamageA = finalScalingValueA * actionMult;
                        const baseDamageB = finalScalingValueB * actionMult;
                        
                        // 计算暴击期望伤害
                        const critExpDamageBase = baseDamageBase * infoBase.critMultiplier;
                        const critExpDamageA = baseDamageA * infoA.critMultiplier;
                        const critExpDamageB = baseDamageB * infoB.critMultiplier;
                        
                        echoComparisonDetailedData.push([
                            infoBase.actionName,
                            damageTypeName,
                            scalingName,
                            totalAttrPctBase.toFixed(2),
                            totalAttrPctA.toFixed(2),
                            totalAttrPctB.toFixed(2),
                            infoBase.totalDamageBonusPct.toFixed(2),
                            infoA.totalDamageBonusPct.toFixed(2),
                            infoB.totalDamageBonusPct.toFixed(2),
                            infoBase.totalDamageDeepenPct.toFixed(2),
                            infoA.totalDamageDeepenPct.toFixed(2),
                            infoB.totalDamageDeepenPct.toFixed(2),
                            infoBase.critRate.toFixed(1),
                            infoA.critRate.toFixed(1),
                            infoB.critRate.toFixed(1),
                            infoBase.critDamage.toFixed(1),
                            infoA.critDamage.toFixed(1),
                            infoB.critDamage.toFixed(1),
                            infoBase.critMultiplier.toFixed(3),
                            infoA.critMultiplier.toFixed(3),
                            infoB.critMultiplier.toFixed(3),
                            finalScalingValueBase.toFixed(0),
                            finalScalingValueA.toFixed(0),
                            finalScalingValueB.toFixed(0),
                            baseDamageBase.toFixed(0),
                            baseDamageA.toFixed(0),
                            baseDamageB.toFixed(0),
                            critExpDamageBase.toFixed(0),
                            critExpDamageA.toFixed(0),
                            critExpDamageB.toFixed(0)
                        ]);
                    }
                    
                    // 添加总计行
                    echoComparisonDetailedData.push([]);
                    echoComparisonDetailedData.push(["总计", "", "", 
                        "", "", "",
                        "", "", "",
                        "", "", "",
                        "", "", "",
                        "", "", "",
                        "", "", "",
                        "", "", "",
                        "", "", "",
                        resBase.totalDmg.toFixed(0), resA.totalDmg.toFixed(0), resB.totalDmg.toFixed(0)]);
                }
                
                // 恢复原始状态
                sequence = originalSequence;
                buffPool = originalBuffPool;
            } else {
                echoComparisonDetailedData.push(["提示", "动作序列为空，无法计算声骸对比详细过程"]);
            }
            
            // 11. 声骸对比详细计算过程工作表
            const ws9 = XLSX.utils.aoa_to_sheet(echoComparisonDetailedData);
            XLSX.utils.book_append_sheet(wb, ws9, "声骸对比详细计算");
            
            // 12. 元数据工作表
            const metaData = [
                ["导出工具", config.meta.tool_name],
                ["版本", config.meta.version],
                ["导出时间", config.meta.export_time],
                ["数据版本", "4"],
                ["备注", "鸣潮伤害分析工具导出数据（包含详细计算过程和声骸对比详细计算）"]
            ];
            const ws10 = XLSX.utils.aoa_to_sheet(metaData);
            XLSX.utils.book_append_sheet(wb, ws10, "元数据");
            
            // 获取自定义文件名
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const defaultName = `鸣潮分析_${timestamp}`;
            const fileName = getCustomFileName(defaultName, 'xlsx');
            
            if (fileName === null) {
                // 用户取消
                console.log('用户取消导出');
                return false;
            }
            
            // 生成并下载文件
            XLSX.writeFile(wb, fileName);
            
            console.log('XLSX导出成功（包含计算结果）');
            return true;
            
        } catch (error) {
            console.error('XLSX导出失败:', error);
            alert(`XLSX导出失败: ${error.message}\n请确保已加载xlsx库。`);
            return false;
        }
    }

    // 完整导入功能（支持JSON和XLSX格式）
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

    // 从JSON数据导入
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
                const html = `
                    <div class="buff-config" data-id="${buff.id}" style="border-left:4px solid #4a6bff; background:rgba(74, 107, 255, 0.1); padding:12px; margin-bottom:10px; border-radius:8px;">
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
                            <select class="b-type" onchange="if(sequence.length>0)calculate(false)">${typeOptions}</select>
                            <input type="number" class="b-val" value="${(buff.val * 100) || 10}" style="width:40px" oninput="if(sequence.length>0)calculate(false)">%
                            <button onclick="confirmDelete('确定要删除这个Buff吗？', () => removeBuff('${buff.id}'))" style="color:#ff6b8b; background:none; border:none; cursor:pointer; font-size:16px; font-weight:bold;">×</button>
                        </div>
                    </div>`;
                document.getElementById('buff_pool').insertAdjacentHTML('beforeend', html);
            });
        }
        
        // 恢复动作序列
        if (data.sequence && Array.isArray(data.sequence)) {
            sequence = data.sequence;
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
        
        // 恢复自定义伤害类型
        if (data.damage_types && Array.isArray(data.damage_types)) {
            // 移除现有的自定义类型
            DAMAGE_TYPES = DAMAGE_TYPES.filter(t => !t.id.startsWith('custom_'));
            // 添加导入的自定义类型
            data.damage_types.forEach(t => {
                DAMAGE_TYPES.push(t);
            });
        }
        
        // 更新界面
        updateBuffPool();
        updateAllDamageTypeSelects();
        renderSequence();
        
        // 渲染分页
        renderBuffPagination();
        
        // 只有在不抑制计算时才调用calculate
        if (!suppressCalculate && sequence.length > 0) {
            calculate(false);
        }
    }

    // 从XLSX工作簿导入
    function importFromXLSX(workbook) {
        // 注意：由于XLSX导出主要是为了便于查看，导入功能可能无法完全恢复所有数据
        // 这里我们主要尝试恢复基础面板数据
        
        // 1. 读取基础面板数据
        const baseSheet = workbook.Sheets["基础面板"];
        if (baseSheet) {
            const baseData = XLSX.utils.sheet_to_json(baseSheet, { header: 1 });
            // 简单解析：第一列是属性名，第二列是基础值，第三列是当前值
            for (let i = 1; i < baseData.length; i++) {
                const row = baseData[i];
                if (row && row.length >= 2) {
                    const prop = row[0];
                    const baseVal = row[1];
                    const currentVal = row[2] || '';
                    
                    if (prop === "生命值") {
                        document.getElementById('base_hp').value = baseVal;
                        document.getElementById('total_hp_now').value = currentVal;
                    } else if (prop === "攻击力") {
                        document.getElementById('base_atk').value = baseVal;
                        document.getElementById('total_atk_now').value = currentVal;
                    } else if (prop === "防御力") {
                        document.getElementById('base_def').value = baseVal;
                        document.getElementById('total_def_now').value = currentVal;
                    } else if (prop === "暴击率(%)") {
                        document.getElementById('base_cr').value = baseVal;
                    } else if (prop === "暴击伤害(%)") {
                        document.getElementById('base_cd').value = baseVal;
                    }
                }
            }
        }
        
        // 2. 读取静态加成（简化处理）
        const staticSheet = workbook.Sheets["静态加成"];
        if (staticSheet) {
            const staticData = XLSX.utils.sheet_to_json(staticSheet, { header: 1 });
            // 清空现有静态加成
            document.getElementById('static_bonus_list').innerHTML = '';
            // 从第二行开始（跳过标题行）
            for (let i = 1; i < staticData.length; i++) {
                const row = staticData[i];
                if (row && row.length >= 2) {
                    const typeName = row[0];
                    const value = row[1];
                    // 查找对应的伤害类型ID
                    const damageType = DAMAGE_TYPES.find(t => t.name === typeName);
                    if (damageType) {
                        const options = DAMAGE_TYPES.map(t => 
                            `<option value="${t.id}" ${t.id === damageType.id ? 'selected' : ''}>${t.name}</option>`
                        ).join('');
                        const html = `<div class="static-bonus-item input-row">
                            <select class="s-type" onchange="calculate()">${options}</select>
                            <input type="number" class="s-val" value="${value}" style="width:40px" oninput="calculate()">%
                            <button onclick="this.parentElement.remove(); calculate();" style="color:var(--accent); background:none; border:none;">×</button>
                        </div>`;
                        document.getElementById('static_bonus_list').insertAdjacentHTML('beforeend', html);
                    }
                }
            }
        }
        
        // 3. 更新计算
        updateAllDamageTypeSelects();
        calculate();
        
        // 提示用户
        alert('Excel文件已导入基础面板和静态加成数据。\n\n注意：动态Buff、动作序列和声骸配置需要手动恢复，建议同时使用JSON格式进行完整备份。');
    }

    // 统一的保存功能 - 支持自动保存到本地存储，并可选择导出文件
    function saveConfig(exportToFile = false, format = 'json', showToast = true) {
        try {
            updateBuffPool();
            const config = {
                meta: {
                    version: "1.4",
                    save_time: new Date().toISOString(),
                    tool_name: "鸣潮伤害分析与声骸词条对比工具",
                    save_type: exportToFile ? 'file' : 'local'
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
                damage_types: DAMAGE_TYPES.filter(t => t.id.startsWith('custom_'))
            };
            
            // 总是保存到本地存储（自动保存）
            localStorage.setItem('mingchao_damage_calc_v1.4', JSON.stringify(config));
            
            if (exportToFile) {
                // 导出为文件
                let exportSuccess;
                if (format === 'json') {
                    exportSuccess = exportToJSON(config);
                } else if (format === 'xlsx') {
                    exportSuccess = exportToXLSX(config);
                }
                if (exportSuccess && showToast) {
                    showAutoSaveToast('✅ 配置已保存并导出为文件！');
                } else if (!exportSuccess) {
                    // 导出失败或用户取消
                    if (showToast) {
                        showAutoSaveToast('❌ 导出已取消或失败');
                    }
                    return false;
                } else {
                    console.log('🔄 配置已保存并导出为文件');
                }
            } else {
                if (showToast) {
                    showAutoSaveToast('✅ 配置已保存到本地存储！');
                } else {
                    console.log('🔄 配置已保存到本地存储');
                }
            }
            return true;
        } catch (error) {
            console.error('保存失败:', error);
            if (showToast) {
                showAutoSaveToast('❌ 保存失败: ' + error.message);
            }
            return false;
        }
    }

    // 统一的加载功能 - 支持从本地存储或文件加载
    function loadConfig(fromFile = false) {
        if (fromFile) {
            // 触发文件选择
            document.getElementById('csvImport').click();
            return;
        }
        
        // 从本地存储加载
        try {
            const saved = localStorage.getItem('mingchao_damage_calc_v1.4');
            if (!saved) {
                if (confirm('本地存储中没有找到保存的配置。是否从文件导入？')) {
                    document.getElementById('csvImport').click();
                }
                return false;
            }
            
            const data = JSON.parse(saved);
            
            if (confirm('是否从本地存储加载上次保存的配置？\n\n版本: ' + (data.meta?.version || '未知') + '\n保存时间: ' + (data.meta?.save_time || '未知'))) {
                importFromJSON(data);
                alert('✅ 配置已从本地存储加载！');
            }
            return true;
        } catch (error) {
            console.error('从本地存储加载失败:', error);
            alert('❌ 加载失败: ' + error.message);
            return false;
        }
    }
