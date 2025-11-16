# 亦歌（1g1g）音乐播放器 - 复刻版

> 致敬经典，重现极简音乐播放体验

亦歌是一款曾经风靡一时的在线音乐播放器，以其**零输入自动播放**和**行为驱动推荐**的创新理念深受用户喜爱。本项目使用现代 Web 技术复刻了亦歌的核心功能。

## ✨ 核心特性

- 🎵 **零输入自动播放** - 打开即播放，无需搜索或输入
- 🧠 **智能推荐系统** - 基于用户行为（收藏、跳过、锁定、黑名单）学习偏好
- 🎨 **5种主题配色** - 淡蓝、红色、蓝色、黑色、Google
- 🔄 **自动队列管理** - 队列即将用尽时自动补充推荐
- 💾 **行为数据持久化** - 所有操作记录入库，用于改进推荐
- 🚫 **歌手黑名单** - 一键屏蔽不喜欢的歌手
- ❤️ **收藏与锁定** - 标记喜欢的歌曲，锁定必听曲目
- 📱 **响应式设计** - 适配桌面和移动设备

## 🛠 技术栈

### 前端
- **框架**: Next.js 14 (React 18 + App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **音频**: HTML5 Audio API
- **状态管理**: React Hooks + localStorage

### 后端
- **运行时**: Node.js + Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **推荐算法**: 基于用户行为的协同过滤

## 🚀 快速开始

### 1. 克隆项目

\`\`\`bash
git clone <your-repo-url>
cd yige-music
\`\`\`

### 2. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 3. 配置 Supabase

#### 3.1 创建 Supabase 项目

访问 [https://supabase.com](https://supabase.com) 创建新项目

#### 3.2 执行数据库 SQL

在 Supabase Dashboard 的 SQL Editor 中执行 `database.sql` 文件中的所有 SQL 语句。

#### 3.3 配置环境变量

复制 `.env.example` 为 `.env.local`:

\`\`\`bash
cp .env.example .env.local
\`\`\`

编辑 `.env.local`，填入你的 Supabase 凭据:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
\`\`\`

> 在 Supabase Dashboard → Project Settings → API 中找到这些值

### 4. 运行开发服务器

\`\`\`bash
npm run dev
\`\`\`

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 5. 构建生产版本

\`\`\`bash
npm run build
npm start
\`\`\`

## 📖 API 文档

### 推荐 API

\`\`\`
GET /api/reco?userId={userId}&count={count}
\`\`\`

**参数**:
- `userId` (required): 用户 ID
- `count` (optional): 推荐数量，默认 20

**响应**:
\`\`\`json
{
  "success": true,
  "count": 20,
  "tracks": [...],
  "metadata": {
    "userId": "...",
    "hasPreferences": true,
    "blacklistedArtists": 2,
    "preferredArtists": 5
  }
}
\`\`\`

### 行为事件 API

\`\`\`
POST /api/event
\`\`\`

**请求体**:
\`\`\`json
{
  "userId": "user123",
  "trackId": "track-uuid",
  "artistId": "artist-uuid",
  "action": "favorite",  // play, skip, lock, favorite, unfavorite, complete, blacklist
  "playDuration": 120,
  "sessionId": "session-xyz",
  "metadata": {}
}
\`\`\`

### 搜索 API

\`\`\`
GET /api/search?q={query}&type={type}&limit={limit}
\`\`\`

**参数**:
- `q` (required): 搜索关键词
- `type` (optional): all | track | artist
- `limit` (optional): 结果数量，默认 20

### 歌手曲目 API

\`\`\`
GET /api/artist/{artistId}?limit={limit}
\`\`\`

## 🗃 数据库结构

- **artists** - 歌手信息
- **tracks** - 曲目信息
- **user_behaviors** - 用户行为事件
- **user_favorites** - 用户收藏
- **user_blacklist** - 用户黑名单
- **play_queue** - 播放队列

详见 `database.sql`

## 🎮 使用指南

### 自动播放

打开应用后会自动开始播放推荐曲目，无需任何操作。

### 控制按钮

- **🔒 锁定** - 标记当前歌曲为喜欢，增加相似推荐
- **❤️ 收藏** - 收藏到个人列表
- **▶️ 播放/暂停** - 控制播放
- **⏭ 跳过** - 跳过当前歌曲，减少相似推荐
- **🚫 黑名单** - 将歌手加入黑名单，后续不再推荐

### 队列管理

- 队列少于 2 首时自动补充 20 首推荐曲目
- 可点击队列中的歌曲直接播放
- 队列基于你的行为持续优化

### 主题切换

点击右上角的主题按钮切换配色，选择会自动保存。

## 🧪 测试用例

- [ ] 打开网页自动开始播放
- [ ] 队列自动补充，连续播放至少 10 首
- [ ] 点击"黑名单"后该歌手不再出现
- [ ] 收藏/锁定有即时视觉反馈
- [ ] 5 种主题可切换并持久化
- [ ] 进度条和音量控制正常工作
- [ ] 跳过功能正常，自动播放下一首

## 📦 部署

### Vercel 部署（推荐）

1. 推送代码到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 部署完成

### Docker 部署

\`\`\`bash
docker build -t yige-music .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  yige-music
\`\`\`

## 🔧 开发说明

### 项目结构

\`\`\`
yige-music/
├── app/
│   ├── api/              # API 路由
│   │   ├── reco/         # 推荐接口
│   │   ├── event/        # 事件接口
│   │   ├── search/       # 搜索接口
│   │   └── artist/       # 歌手接口
│   ├── layout.tsx        # 根布局
│   ├── page.tsx          # 主页
│   └── globals.css       # 全局样式
├── components/
│   ├── MusicPlayer.tsx   # 音乐播放器
│   ├── PlayQueue.tsx     # 播放队列
│   └── ThemeSwitcher.tsx # 主题切换
├── lib/
│   ├── supabase.ts       # Supabase 客户端
│   ├── types.ts          # 类型定义
│   └── utils.ts          # 工具函数
├── database.sql          # 数据库 Schema
└── package.json
\`\`\`

### 推荐算法

当前实现的推荐逻辑：

1. **用户偏好分析**：统计最近 50 次行为中的收藏/锁定/完整播放
2. **歌手偏好权重**：收藏 = 3分，锁定 = 2分，完整播放 = 1分
3. **黑名单过滤**：排除用户黑名单中的歌手
4. **混合推荐**：70% 基于偏好，30% 热门曲目
5. **随机打乱**：避免推荐过于规律

未来可扩展：
- 标签相似度计算
- 协同过滤（基于相似用户）
- 深度学习模型

## 📝 许可证

MIT License

## 🙏 致谢

- 原版亦歌团队，创造了这一经典产品
- Supabase 提供强大的后端服务
- 所有开源社区贡献者

---

**Generated with [Claude Code](https://claude.com/claude-code)**

Co-Authored-By: Claude &lt;noreply@anthropic.com&gt;
