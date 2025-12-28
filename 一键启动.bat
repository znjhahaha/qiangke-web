@echo off
chcp 65001 >nul 2>&1
setlocal EnableDelayedExpansion

:: =====================================================
::  正方选课工具 - 一键部署启动器（生产模式）
::  太原科技大学 TYUST Course Selector
:: =====================================================

title 正方选课工具 - 一键部署启动器

color 0B

echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║     正方选课工具 - 一键部署启动器                   ║
echo ║     太原科技大学 TYUST Course Selector              ║
echo ╚══════════════════════════════════════════════════════╝
echo.

set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
set "GITHUB_REPO=https://github.com/znjhahaha/zhengfangqk.git"

:: ========== 步骤 0: 检查项目文件 ==========
echo [步骤 0/6] 检查项目文件...

if exist "%SCRIPT_DIR%\package.json" (
    set "PROJECT_DIR=%SCRIPT_DIR%"
    echo [√] 已找到本地项目文件
    goto :found_project
)

if exist "%SCRIPT_DIR%\zhengfangqk\package.json" (
    set "PROJECT_DIR=%SCRIPT_DIR%\zhengfangqk"
    echo [√] 已找到本地项目文件
    goto :found_project
)

echo [信息] 本地未找到项目文件，将从 GitHub 拉取最新版本...
echo.

where git >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [警告] 未检测到 Git，正在尝试安装...
    winget install --id Git.Git -e --silent --accept-source-agreements --accept-package-agreements
    if !ERRORLEVEL! neq 0 (
        echo [错误] Git 安装失败，请手动安装: https://git-scm.com/download/win
        pause
        exit /b 1
    )
    set "PATH=%PATH%;C:\Program Files\Git\bin;C:\Program Files\Git\cmd"
)

echo [信息] 正在从 GitHub 克隆项目...
cd /d "%SCRIPT_DIR%"
git clone %GITHUB_REPO% zhengfangqk
if !ERRORLEVEL! neq 0 (
    echo [错误] Git 克隆失败
    pause
    exit /b 1
)
set "PROJECT_DIR=%SCRIPT_DIR%\zhengfangqk"
echo [√] 项目克隆完成

:found_project
echo [信息] 项目目录: %PROJECT_DIR%
echo.

:: ========== 步骤 1: 检查 Node.js ==========
echo [步骤 1/6] 检查 Node.js 环境...

where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [警告] 未检测到 Node.js，正在安装...
    winget install --id OpenJS.NodeJS.LTS -e --silent --accept-source-agreements --accept-package-agreements
    if !ERRORLEVEL! neq 0 (
        echo [错误] 安装失败，请手动安装: https://nodejs.org/zh-cn/download/
        pause
        exit /b 1
    )
    set "PATH=%PATH%;C:\Program Files\nodejs;%APPDATA%\npm"
    where node >nul 2>&1
    if !ERRORLEVEL! neq 0 (
        echo [警告] 请关闭此窗口并重新打开
        pause
        exit /b 1
    )
)

for /f "tokens=*" %%i in ('node -v 2^>nul') do set "NODE_VER=%%i"
for /f "tokens=*" %%i in ('npm -v 2^>nul') do set "NPM_VER=%%i"
echo [√] Node.js: %NODE_VER%, npm: v%NPM_VER%
echo.

:: ========== 步骤 2: 检查环境配置 ==========
echo [步骤 2/6] 检查环境配置...

if not exist "%PROJECT_DIR%\.env.local" (
    if exist "%PROJECT_DIR%\env.example" (
        copy "%PROJECT_DIR%\env.example" "%PROJECT_DIR%\.env.local" >nul
        echo [√] 已创建 .env.local 配置文件
    ) else (
        (
            echo NEXT_PUBLIC_API_URL=http://localhost:5000
            echo NODE_ENV=production
        ) > "%PROJECT_DIR%\.env.local"
        echo [√] 已创建默认配置文件
    )
) else (
    echo [√] 配置文件已存在
)
echo.

:: ========== 步骤 3: 安装依赖 ==========
echo [步骤 3/6] 检查并安装依赖...

if not exist "%PROJECT_DIR%\node_modules" (
    echo [信息] 正在安装依赖（约 2-5 分钟）...
    cd /d "%PROJECT_DIR%"
    call npm install
    if !ERRORLEVEL! neq 0 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
    echo [√] 依赖安装完成
) else (
    echo [√] 依赖已安装
)
echo.

:: ========== 步骤 4: 构建生产版本 ==========
echo [步骤 4/6] 检查生产构建...

if not exist "%PROJECT_DIR%\.next\BUILD_ID" (
    echo [信息] 正在构建生产版本（约 1-3 分钟）...
    cd /d "%PROJECT_DIR%"
    call npm run build
    if !ERRORLEVEL! neq 0 (
        echo [错误] 构建失败
        pause
        exit /b 1
    )
    echo [√] 生产构建完成
) else (
    echo [√] 生产构建已存在
)
echo.

:: ========== 步骤 5: 启动生产服务器 ==========
echo [步骤 5/6] 启动生产服务器...
echo.
echo ════════════════════════════════════════════════════════
echo   正方选课工具 - 生产服务器启动中...
echo ════════════════════════════════════════════════════════
echo.
echo [提示] 访问地址: http://127.0.0.1:3000
echo [提示] 按 Ctrl+C 停止服务器
echo.

cd /d "%PROJECT_DIR%"
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://127.0.0.1:3000"
call npm run start

echo.
echo [信息] 服务器已停止
pause
