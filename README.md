# 正方选课工具（zhengfangqk），别用来赚钱🤯

简短介绍
- 一个面向高校的现代化选课工具（Web + Android APK），支持多学校配置、智能选课/抢课、激活码、公告与建议反馈等。
- 已使用 Next.js 全栈架构实现，支持将前端打包为 Android APK（通过 Capacitor）。线上演示：https://zhengfangqk.vercel.app （需要🪜）




目前存在选课数目计算重复问题。
快速开始（开发）
1. 克隆并安装依赖
   ```bash
   git clone https://github.com/znjhahaha/zhengfangqk.git
   cd zhengfangqk
   npm install
   ```

2. 本地开发（启动 dev 服务器）
   ```bash
   npm run dev
   # 访问 http://127.0.0.1:3000
   ```

构建与打包
- 常规构建（生产）
  ```bash
  npm run build
  npm run start
  ```




环境与注意事项
- 请参考仓库根目录的 env.example 来配置必要的环境变量。
- 自动抢课功能请在合规范围内使用，避免违反学校或第三方服务条款。

许可
- Apache License 2.0
