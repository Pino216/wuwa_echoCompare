// UI事件处理和初始化模块

// 菜单可见性状态
let exportMenuVisible = false;
let importMenuVisible = false;

// 自动保存提示相关函数
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

// 导出/导入菜单控制
function toggleExportMenu() {
    const menu = document.getElementById('exportMenu');
    if (!menu) return;
    
    // 关闭导入菜单
    const importMenu = document.getElementById('importMenu');
    if (importMenu) {
        importMenu.style.display = 'none';
        importMenuVisible = false;
    }
    
    if (exportMenuVisible) {
        menu.style.display = 'none';
    } else {
        menu.style.display = 'block';
        setTimeout(() => {
            document.addEventListener('click', closeExportMenuOnClickOutside);
        }, 10);
    }
    exportMenuVisible = !exportMenuVisible;
}

function toggleImportMenu() {
    const menu = document.getElementById('importMenu');
    if (!menu) return;
    
    // 关闭导出菜单
    const exportMenu = document.getElementById('exportMenu');
    if (exportMenu) {
        exportMenu.style.display = 'none';
        exportMenuVisible = false;
    }
    
    if (importMenuVisible) {
        menu.style.display = 'none';
    } else {
        menu.style.display = 'block';
        setTimeout(() => {
            document.addEventListener('click', closeImportMenuOnClickOutside);
        }, 10);
    }
    importMenuVisible = !importMenuVisible;
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

function closeImportMenuOnClickOutside(event) {
    const menu = document.getElementById('importMenu');
    const button = document.querySelector('.import-btn');
    
    if (menu && button && 
        !menu.contains(event.target) && 
        !button.contains(event.target)) {
        menu.style.display = 'none';
        importMenuVisible = false;
        document.removeEventListener('click', closeImportMenuOnClickOutside);
    }
}

// 触发文件导入
function triggerFileImport() {
    document.getElementById('csvImport').click();
    // 关闭菜单
    const menu = document.getElementById('importMenu');
    if (menu) {
        menu.style.display = 'none';
        importMenuVisible = false;
    }
}

// 统一的保存功能 - 支持自动保存到本地存储，并可选择导出文件
function saveConfig(exportToFile = false, format = 'json', showToast = true) {
    try {
        updateBuffPool(true);
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
            sequence: sequence.map(action => ({
                ...action,
                enabled: action.enabled !== false // 确保enabled字段存在，默认true
            })),
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
                triggerFileImport();
            } else {
                // 用户选择不从文件导入，提供创建默认配置的选项
                if (confirm('是否创建并加载默认配置？')) {
                    // 调用重置函数来设置默认值
                    resetToDefaults();
                    // 添加一个默认动作
                    sequence = [{ 
                        name: "技能演示", 
                        mult: 2.5, 
                        type: "skill", 
                        scaling: "atk",
                        activeBuffs: [] 
                    }];
                    renderSequence();
                    calculate(false);
                }
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

// 页面初始化
window.onload = () => {
    // 首先从本地存储加载自定义伤害类型
    loadCustomDamageTypesFromStorage();
    
    // 确保只初始化一次声骸选择器
    // 检查是否已经有行存在，如果没有才初始化
    const echoAContainer = document.querySelector('#echo_a .substat-container');
    const echoBContainer = document.querySelector('#echo_b .substat-container');
    
    if (echoAContainer && echoAContainer.children.length === 0) {
        initEchoSelects('echo_a');
    }
    if (echoBContainer && echoBContainer.children.length === 0) {
        initEchoSelects('echo_b');
    }
    
    // 初始化伤害类型选择器
    updateAllDamageTypeSelects();
    
    // 初始化BUFF分组选择器
    updateGroupSelect();
    updateBuffFilterSelect();
    
    // 初始化暴击率溢出转换面板
    const enableCrOverflow = document.getElementById('enable_cr_overflow');
    if (enableCrOverflow) {
        enableCrOverflow.addEventListener('change', function() {
            updateCrOverflowPanel();
            // 触发重新计算
            if (sequence.length > 0) {
                debouncedCalculate();
            }
        });
        // 设置初始状态
        updateCrOverflowPanel();
    }
    
    // 为暴击率溢出设置添加事件监听
    const ratioInput = document.getElementById('cr_to_cd_ratio');
    const maxGainInput = document.getElementById('max_cd_gain');
    if (ratioInput) {
        ratioInput.addEventListener('input', function() {
            if (sequence.length > 0 && document.getElementById('enable_cr_overflow')?.checked) {
                debouncedCalculate();
            }
        });
    }
    if (maxGainInput) {
        maxGainInput.addEventListener('input', function() {
            if (sequence.length > 0 && document.getElementById('enable_cr_overflow')?.checked) {
                debouncedCalculate();
            }
        });
    }
    
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
                activeBuffs: [],
                enabled: true 
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

    // 声骸A现在总是已装备，不需要勾选框事件监听

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