@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo        Aider 启动脚本
echo ========================================

:: 检查环境变量
if "%DEEPSEEK_API_BASE%"=="" (
    echo 错误: 未找到 DEEPSEEK_API_BASE 环境变量
    echo 请先设置 DEEPSEEK_API_BASE 环境变量
    pause
    exit /b 1
)

if "%DEEPSEEK_API_KEY%"=="" (
    echo 错误: 未找到 DEEPSEEK_API_KEY 环境变量
    echo 请先设置 DEEPSEEK_API_KEY 环境变量
    pause
    exit /b 1
)

echo 正在使用 DeepSeek API...
echo API BASE: %DEEPSEEK_API_BASE%
echo API Key 前10位: %DEEPSEEK_API_KEY:~0,10%...

:: 调试：显示完整的API key长度
echo API Key 长度: !DEEPSEEK_API_KEY:~0,1!...!DEEPSEEK_API_KEY:~-4!

:: 设置aider的环境变量，确保正确处理特殊字符
set "AIDER_API_BASE=%DEEPSEEK_API_BASE%"
set "AIDER_API_KEY=%DEEPSEEK_API_KEY%"

:: 检查aider是否已安装
where aider >nul 2>nul
if errorlevel 1 (
    echo 错误: 未找到 aider 命令
    echo 请先安装 aider: pip install aider-chat
    pause
    exit /b 1
)

echo.
echo 正在启动 aider...
echo 按 Ctrl+C 退出
echo ========================================
echo.

:: 调试：显示将要传递的参数
echo 调试信息:
echo API BASE: "%AIDER_API_BASE%"
echo API KEY: "%AIDER_API_KEY:~0,10%..."

:: 启动aider，使用DeepSeek作为模型
:: 使用引号包裹参数，确保特殊字符被正确处理
aider --api-base "%AIDER_API_BASE%" --api-key "%AIDER_API_KEY%" --model deepseek-chat

:: 如果上面的命令失败，尝试另一种方式
if errorlevel 1 (
    echo 尝试使用环境变量启动 aider...
    echo 注意: 使用环境变量 AIDER_API_BASE 和 AIDER_API_KEY
    aider
)

endlocal
