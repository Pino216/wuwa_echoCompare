# Aider 启动脚本使用说明

## 概述
这些脚本用于简化 aider 的启动过程，自动使用已配置的 DeepSeek API 环境变量。

## 前提条件
1. 已安装 Python 和 pip
2. 已安装 aider：`pip install aider-chat`
3. 已设置以下环境变量：
   - `DEEPSEEK_API_URL`: DeepSeek API 的端点地址
   - `DEEPSEEK_API_KEY`: 你的 DeepSeek API 密钥

## 使用方法

### Windows 批处理脚本 (CMD)
1. 双击 `aider_start.bat`
2. 或从命令行运行：
   ```cmd
   aider_start.bat
   ```

### PowerShell 脚本
1. 右键点击 `aider_start.ps1`，选择"使用 PowerShell 运行"
2. 或从 PowerShell 运行：
   ```powershell
   .\aider_start.ps1
   ```

## 脚本功能
- 自动检查必要的环境变量
- 验证 aider 是否已安装
- 使用配置的 API 启动 aider
- 提供错误提示和友好的用户界面

## 故障排除
1. **脚本无法运行**：
   - 确保已安装 aider：`pip install aider-chat`
   - 检查环境变量是否正确设置

2. **PowerShell 脚本被阻止**：
   - 以管理员身份运行 PowerShell
   - 执行：`Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

3. **API 连接问题**：
   - 验证 `DEEPSEEK_API_URL` 和 `DEEPSEEK_API_KEY` 是否正确
   - 检查网络连接

## 环境变量设置示例
在系统环境变量中添加：
- 变量名：`DEEPSEEK_API_URL`
- 变量值：`https://api.deepseek.com`

- 变量名：`DEEPSEEK_API_KEY`
- 变量值：`你的API密钥`

或在命令提示符中临时设置：
```cmd
set DEEPSEEK_API_URL=https://api.deepseek.com
set DEEPSEEK_API_KEY=你的API密钥
```
