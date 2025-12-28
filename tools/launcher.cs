// 正方选课工具 - 一键部署启动器
// 编译命令: csc /nologo /target:exe /out:一键启动.exe /optimize+ launcher.cs
using System;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Threading;

class Launcher
{
    static string projectDir;
    static string exeDir;
    const string GITHUB_REPO = "https://github.com/znjhahaha/zhengfangqk.git";
    
    static void Main()
    {
        Console.OutputEncoding = Encoding.UTF8;
        Console.Title = "正方选课工具 - 一键部署启动器";
        
        SetConsoleColor(ConsoleColor.Cyan);
        Console.WriteLine();
        Console.WriteLine("╔══════════════════════════════════════════════════════╗");
        Console.WriteLine("║     正方选课工具 - 一键部署启动器                   ║");
        Console.WriteLine("║     太原科技大学 TYUST Course Selector              ║");
        Console.WriteLine("╚══════════════════════════════════════════════════════╝");
        Console.WriteLine();
        Console.ResetColor();
        
        // 获取 exe 所在目录
        string exePath = System.Reflection.Assembly.GetExecutingAssembly().Location;
        exeDir = Path.GetDirectoryName(exePath);
        
        // 步骤0: 检查项目文件，如果不存在则从 GitHub 克隆
        PrintStep(0, 5, "检查项目文件");
        projectDir = FindOrCloneProject();
        if (projectDir == null)
        {
            PrintError("无法获取项目文件");
            WaitForExit();
            return;
        }
        Console.WriteLine("[信息] 项目目录: " + projectDir);
        Console.WriteLine();
        
        // 步骤1: 检查 Node.js
        PrintStep(1, 5, "检查 Node.js 环境");
        if (!CheckNodeJS())
        {
            PrintWarning("未检测到 Node.js，正在尝试安装...");
            if (!InstallNodeJS())
            {
                PrintError("Node.js 安装失败，请手动安装");
                Console.WriteLine();
                Console.WriteLine("下载地址: https://nodejs.org/zh-cn/download/");
                Console.WriteLine();
                Console.WriteLine("安装完成后请重新运行此程序");
                WaitForExit();
                return;
            }
        }
        string nodeVer = GetCommandOutput("node", "-v").Trim();
        string npmVer = GetCommandOutput("npm", "-v").Trim();
        PrintSuccess("Node.js: " + nodeVer + ", npm: v" + npmVer);
        Console.WriteLine();
        
        // 步骤2: 检查环境配置
        PrintStep(2, 5, "检查环境配置");
        string envPath = Path.Combine(projectDir, ".env.local");
        if (!File.Exists(envPath))
        {
            string envExamplePath = Path.Combine(projectDir, "env.example");
            if (File.Exists(envExamplePath))
            {
                File.Copy(envExamplePath, envPath);
                PrintSuccess("已从 env.example 创建 .env.local 配置文件");
            }
            else
            {
                File.WriteAllText(envPath, 
                    "# Next.js环境变量\n" +
                    "# 由一键部署工具自动创建\n\n" +
                    "NEXT_PUBLIC_API_URL=http://localhost:5000\n" +
                    "NODE_ENV=development\n");
                PrintSuccess("已创建默认 .env.local 配置文件");
            }
        }
        else
        {
            PrintSuccess(".env.local 配置文件已存在");
        }
        Console.WriteLine();
        
        // 步骤3: 安装依赖
        PrintStep(3, 5, "检查并安装项目依赖");
        string nodeModulesPath = Path.Combine(projectDir, "node_modules");
        if (!Directory.Exists(nodeModulesPath))
        {
            PrintInfo("首次运行，正在安装依赖（可能需要 2-5 分钟）...");
            PrintInfo("请耐心等待，不要关闭此窗口...");
            Console.WriteLine();
            
            if (!RunCommand("npm", "install"))
            {
                PrintError("依赖安装失败");
                Console.WriteLine();
                Console.WriteLine("请尝试手动运行: npm install");
                WaitForExit();
                return;
            }
            Console.WriteLine();
            PrintSuccess("依赖安装完成");
        }
        else
        {
            PrintSuccess("依赖已安装");
        }
        Console.WriteLine();
        
        // 步骤4: 构建生产版本
        PrintStep(4, 6, "检查生产构建");
        string buildIdPath = Path.Combine(projectDir, ".next", "BUILD_ID");
        if (!File.Exists(buildIdPath))
        {
            PrintInfo("首次运行，正在构建生产版本（可能需要 1-3 分钟）...");
            PrintInfo("请耐心等待，不要关闭此窗口...");
            Console.WriteLine();
            
            if (!RunCommand("npm", "run build"))
            {
                PrintError("构建失败");
                Console.WriteLine();
                Console.WriteLine("请尝试手动运行: npm run build");
                WaitForExit();
                return;
            }
            Console.WriteLine();
            PrintSuccess("生产构建完成");
        }
        else
        {
            PrintSuccess("生产构建已存在");
        }
        Console.WriteLine();
        
        // 步骤5: 启动生产服务器
        PrintStep(5, 6, "启动生产服务器");
        Console.WriteLine();
        SetConsoleColor(ConsoleColor.Cyan);
        Console.WriteLine("════════════════════════════════════════════════════════");
        SetConsoleColor(ConsoleColor.Green);
        Console.WriteLine("  正方选课工具 - 生产服务器启动中...");
        SetConsoleColor(ConsoleColor.Cyan);
        Console.WriteLine("════════════════════════════════════════════════════════");
        Console.ResetColor();
        Console.WriteLine();
        PrintTip("服务器启动后，请在浏览器访问:");
        SetConsoleColor(ConsoleColor.Cyan);
        Console.WriteLine("       http://127.0.0.1:3000");
        Console.ResetColor();
        Console.WriteLine();
        PrintTip("按 Ctrl+C 可停止服务器");
        Console.WriteLine();
        
        // 延迟打开浏览器
        Thread openBrowserThread = new Thread(OpenBrowser);
        openBrowserThread.IsBackground = true;
        openBrowserThread.Start();
        
        // 启动生产服务器
        RunCommandInteractive("npm", "run start");
        
        Console.WriteLine();
        PrintInfo("服务器已停止");
        WaitForExit();
    }
    
    static string FindOrCloneProject()
    {
        // 优先级1: 检查 exe 同目录是否有 package.json
        if (File.Exists(Path.Combine(exeDir, "package.json")))
        {
            PrintSuccess("已找到本地项目文件");
            return exeDir;
        }
        
        // 优先级2: 检查 exe 上级目录（如果 exe 在 tools 目录下）
        if (Path.GetFileName(exeDir).ToLower() == "tools")
        {
            string parentDir = Path.GetDirectoryName(exeDir);
            if (File.Exists(Path.Combine(parentDir, "package.json")))
            {
                PrintSuccess("已找到本地项目文件");
                return parentDir;
            }
        }
        
        // 优先级3: 检查 zhengfangqk 子目录
        string subDir = Path.Combine(exeDir, "zhengfangqk");
        if (Directory.Exists(subDir) && File.Exists(Path.Combine(subDir, "package.json")))
        {
            PrintSuccess("已找到本地项目文件");
            return subDir;
        }
        
        // 没有本地文件，需要从 GitHub 克隆
        PrintInfo("本地未找到项目文件，将从 GitHub 拉取最新版本...");
        Console.WriteLine();
        
        // 检查 Git 是否安装
        if (!CheckGit())
        {
            PrintWarning("未检测到 Git，正在尝试安装...");
            if (!InstallGit())
            {
                PrintError("Git 安装失败，请手动安装 Git 后重试");
                Console.WriteLine();
                Console.WriteLine("下载地址: https://git-scm.com/download/win");
                return null;
            }
        }
        
        // 克隆仓库
        PrintInfo("正在从 GitHub 克隆项目...");
        PrintInfo("仓库地址: " + GITHUB_REPO);
        Console.WriteLine();
        
        string cloneDir = Path.Combine(exeDir, "zhengfangqk");
        
        ProcessStartInfo psi = new ProcessStartInfo();
        psi.FileName = "git";
        psi.Arguments = "clone " + GITHUB_REPO + " \"" + cloneDir + "\"";
        psi.WorkingDirectory = exeDir;
        psi.UseShellExecute = false;
        psi.CreateNoWindow = false;
        
        try
        {
            Process p = Process.Start(psi);
            p.WaitForExit();
            
            if (p.ExitCode == 0 && Directory.Exists(cloneDir))
            {
                PrintSuccess("项目克隆完成");
                Console.WriteLine();
                return cloneDir;
            }
            else
            {
                PrintError("Git 克隆失败");
                return null;
            }
        }
        catch (Exception ex)
        {
            PrintError("克隆出错: " + ex.Message);
            return null;
        }
    }
    
    static bool CheckGit()
    {
        try
        {
            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = "git";
            psi.Arguments = "--version";
            psi.UseShellExecute = false;
            psi.RedirectStandardOutput = true;
            psi.CreateNoWindow = true;
            Process p = Process.Start(psi);
            p.WaitForExit();
            return p.ExitCode == 0;
        }
        catch
        {
            return false;
        }
    }
    
    static bool InstallGit()
    {
        PrintInfo("尝试使用 winget 安装 Git...");
        Console.WriteLine();
        
        try
        {
            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = "winget";
            psi.Arguments = "install --id Git.Git -e --silent --accept-source-agreements --accept-package-agreements";
            psi.UseShellExecute = false;
            psi.CreateNoWindow = false;
            Process p = Process.Start(psi);
            p.WaitForExit();
            
            if (p.ExitCode == 0)
            {
                // 刷新 PATH
                string path = Environment.GetEnvironmentVariable("PATH");
                path += @";C:\Program Files\Git\bin;C:\Program Files\Git\cmd";
                Environment.SetEnvironmentVariable("PATH", path);
                
                PrintSuccess("Git 安装完成");
                return true;
            }
        }
        catch { }
        
        return false;
    }
    
    static void OpenBrowser()
    {
        Thread.Sleep(5000);
        try
        {
            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = "cmd";
            psi.Arguments = "/c start http://127.0.0.1:3000";
            psi.UseShellExecute = false;
            psi.CreateNoWindow = true;
            Process.Start(psi);
        }
        catch { }
    }
    
    static bool CheckNodeJS()
    {
        try
        {
            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = "node";
            psi.Arguments = "-v";
            psi.UseShellExecute = false;
            psi.RedirectStandardOutput = true;
            psi.CreateNoWindow = true;
            Process p = Process.Start(psi);
            p.WaitForExit();
            return p.ExitCode == 0;
        }
        catch
        {
            return false;
        }
    }
    
    static bool InstallNodeJS()
    {
        PrintInfo("尝试使用 winget 安装 Node.js...");
        Console.WriteLine();
        
        try
        {
            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = "winget";
            psi.Arguments = "install --id OpenJS.NodeJS.LTS -e --silent --accept-source-agreements --accept-package-agreements";
            psi.UseShellExecute = false;
            psi.CreateNoWindow = false;
            Process p = Process.Start(psi);
            p.WaitForExit();
            
            if (p.ExitCode == 0)
            {
                // 刷新 PATH
                string path = Environment.GetEnvironmentVariable("PATH");
                path += @";C:\Program Files\nodejs;" + Environment.ExpandEnvironmentVariables(@"%APPDATA%\npm");
                Environment.SetEnvironmentVariable("PATH", path);
                
                PrintSuccess("Node.js 安装完成");
                PrintWarning("如果仍然无法使用，请关闭此窗口并重新打开");
                return true;
            }
        }
        catch { }
        
        return false;
    }
    
    static string GetCommandOutput(string cmd, string args)
    {
        try
        {
            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = cmd;
            psi.Arguments = args;
            psi.UseShellExecute = false;
            psi.RedirectStandardOutput = true;
            psi.CreateNoWindow = true;
            Process p = Process.Start(psi);
            string output = p.StandardOutput.ReadToEnd();
            p.WaitForExit();
            return output;
        }
        catch
        {
            return "未知";
        }
    }
    
    static bool RunCommand(string cmd, string args)
    {
        try
        {
            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = cmd;
            psi.Arguments = args;
            psi.WorkingDirectory = projectDir;
            psi.UseShellExecute = false;
            psi.CreateNoWindow = false;
            Process p = Process.Start(psi);
            p.WaitForExit();
            return p.ExitCode == 0;
        }
        catch
        {
            return false;
        }
    }
    
    static void RunCommandInteractive(string cmd, string args)
    {
        try
        {
            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = cmd;
            psi.Arguments = args;
            psi.WorkingDirectory = projectDir;
            psi.UseShellExecute = false;
            Process p = Process.Start(psi);
            p.WaitForExit();
        }
        catch (Exception ex)
        {
            PrintError("启动失败: " + ex.Message);
        }
    }
    
    static void PrintStep(int current, int total, string message)
    {
        SetConsoleColor(ConsoleColor.Blue);
        Console.Write("[步骤 " + current + "/" + total + "] ");
        Console.ResetColor();
        Console.WriteLine(message);
    }
    
    static void PrintSuccess(string message)
    {
        SetConsoleColor(ConsoleColor.Green);
        Console.Write("[√] ");
        Console.ResetColor();
        Console.WriteLine(message);
    }
    
    static void PrintInfo(string message)
    {
        SetConsoleColor(ConsoleColor.Cyan);
        Console.Write("[信息] ");
        Console.ResetColor();
        Console.WriteLine(message);
    }
    
    static void PrintWarning(string message)
    {
        SetConsoleColor(ConsoleColor.Yellow);
        Console.Write("[警告] ");
        Console.ResetColor();
        Console.WriteLine(message);
    }
    
    static void PrintError(string message)
    {
        SetConsoleColor(ConsoleColor.Red);
        Console.Write("[错误] ");
        Console.ResetColor();
        Console.WriteLine(message);
    }
    
    static void PrintTip(string message)
    {
        SetConsoleColor(ConsoleColor.Yellow);
        Console.Write("[提示] ");
        Console.ResetColor();
        Console.WriteLine(message);
    }
    
    static void SetConsoleColor(ConsoleColor color)
    {
        try { Console.ForegroundColor = color; } catch { }
    }
    
    static void WaitForExit()
    {
        Console.WriteLine();
        Console.WriteLine("按任意键退出...");
        Console.ReadKey();
    }
}
