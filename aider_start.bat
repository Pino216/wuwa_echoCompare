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
echo API Key: %DEEPSEEK_API_KEY:~0,10%...

:: 设置aider的环境变量
set AIDER_API_BASE=%DEEPSEEK_API_BASE%
set AIDER_API_KEY=%DEEPSEEK_API_KEY%

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

:: 启动aider，使用DeepSeek作为模型
aider --api-base %AIDER_API_BASE% --api-key %AIDER_API_KEY% --model deepseek-chat

:: 如果上面的命令失败，尝试另一种方式
if errorlevel 1 (
    echo 尝试使用环境变量启动 aider...
    aider
)

endlocal
