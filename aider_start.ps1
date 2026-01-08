# ========================================
#        Aider 启动脚本 (PowerShell)
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "       Aider 启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 检查环境变量
if (-not $env:DEEPSEEK_API_URL) {
    Write-Host "错误: 未找到 DEEPSEEK_API_URL 环境变量" -ForegroundColor Red
    Write-Host "请先设置 DEEPSEEK_API_URL 环境变量" -ForegroundColor Yellow
    Read-Host "按 Enter 退出"
    exit 1
}

if (-not $env:DEEPSEEK_API_KEY) {
    Write-Host "错误: 未找到 DEEPSEEK_API_KEY 环境变量" -ForegroundColor Red
    Write-Host "请先设置 DEEPSEEK_API_KEY 环境变量" -ForegroundColor Yellow
    Read-Host "按 Enter 退出"
    exit 1
}

Write-Host "正在使用 DeepSeek API..." -ForegroundColor Green
Write-Host "API URL: $env:DEEPSEEK_API_URL" -ForegroundColor Gray

# 显示部分API Key
if ($env:DEEPSEEK_API_KEY.Length -gt 10) {
    $partialKey = $env:DEEPSEEK_API_KEY.Substring(0, 10)
} else {
    $partialKey = $env:DEEPSEEK_API_KEY
}
Write-Host "API Key: ${partialKey}..." -ForegroundColor Gray

# 设置aider的环境变量
$env:AIDER_API_BASE = $env:DEEPSEEK_API_URL
$env:AIDER_API_KEY = $env:DEEPSEEK_API_KEY

# 检查aider是否已安装
try {
    $null = Get-Command aider -ErrorAction Stop
} catch {
    Write-Host "错误: 未找到 aider 命令" -ForegroundColor Red
    Write-Host "请先安装 aider: pip install aider-chat" -ForegroundColor Yellow
    Read-Host "按 Enter 退出"
    exit 1
}

Write-Host ""
Write-Host "正在启动 aider..." -ForegroundColor Green
Write-Host "按 Ctrl+C 退出" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 启动aider，使用DeepSeek作为模型
try {
    aider --api-base $env:AIDER_API_BASE --api-key $env:AIDER_API_KEY --model deepseek-chat
} catch {
    Write-Host "尝试使用环境变量启动 aider..." -ForegroundColor Yellow
    aider
}
