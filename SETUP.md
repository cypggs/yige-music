# 亦歌（1g1g）数据库设置指南

## 🚀 快速开始

在使用应用之前，你需要在 Supabase 中执行数据库 SQL 来初始化表结构和示例数据。

## 步骤 1: 访问 Supabase Dashboard

1. 打开浏览器，访问 [https://supabase.com](https://supabase.com)
2. 登录你的账号
3. 选择项目: `mclpscvtkxldycxoidoc`

## 步骤 2: 执行数据库 SQL

1. 在左侧菜单中点击 **SQL Editor**
2. 点击 **New Query** 创建新查询
3. 复制 `database.sql` 文件的完整内容
4. 粘贴到 SQL 编辑器中
5. 点击右下角的 **Run** 按钮执行

执行过程可能需要几秒钟，成功后会显示绿色的成功消息。

## 步骤 3: 验证数据库

执行成功后，你应该看到以下表已创建：

- ✅ `artists` - 歌手信息表（10 位华语歌手）
- ✅ `tracks` - 曲目信息表（23 首热门歌曲）
- ✅ `user_behaviors` - 用户行为事件表
- ✅ `user_favorites` - 用户收藏表
- ✅ `user_blacklist` - 用户黑名单表
- ✅ `play_queue` - 播放队列表

你可以在左侧菜单的 **Table Editor** 中查看这些表。

## 步骤 4: 访问应用

数据库设置完成后，访问应用：

**生产环境**: https://yige-music-cypggs-projects.vercel.app

应用会自动开始播放音乐！

## 🎵 示例数据

数据库包含以下示例数据：

### 歌手（10 位）
- 周杰伦、林俊杰、邓紫棋、薛之谦、陈奕迅
- 李荣浩、王力宏、张学友、五月天、孙燕姿

### 曲目（23 首）
- 晴天、七里香、稻香（周杰伦）
- 江南、修炼爱情、美人鱼（林俊杰）
- 光年之外、泡沫（邓紫棋）
- 演员、丑八怪（薛之谦）
- 十年、浮夸、好久不见（陈奕迅）
- 更多...

所有曲目都使用示例音频 URL（SoundHelix），实际部署时应替换为合法音源。

## ⚠️ 注意事项

1. **音源版权**：示例数据使用的是 SoundHelix 公开音频，仅供演示。实际使用时需要替换为合法音源。

2. **RLS 策略**：数据库已启用行级安全（RLS），匿名用户可以：
   - 读取所有歌手和曲目
   - 插入和查看自己的行为数据
   - 管理自己的收藏和黑名单

3. **性能优化**：如需添加更多数据，建议：
   - 曲目数量 > 1000 时添加额外索引
   - 定期清理过期的行为数据
   - 考虑使用分区表

## 🐛 故障排除

### 问题 1: SQL 执行失败

**错误**: "relation already exists"

**解决**: 表已存在，可以：
- 选项 A: 跳过创建表，只插入数据
- 选项 B: 先删除旧表（`DROP TABLE IF EXISTS ...`）

### 问题 2: 应用无法加载数据

**检查**:
1. Supabase URL 和 Anon Key 是否正确配置
2. 表是否成功创建（在 Table Editor 中查看）
3. RLS 策略是否正确启用

**调试**:
打开浏览器开发者工具（F12）→ Network 标签，查看 API 请求是否成功。

### 问题 3: 推荐功能不工作

**原因**: 需要有行为数据才能生成个性化推荐

**解决**:
- 播放几首歌曲
- 点击收藏/锁定按钮
- 系统会根据你的行为调整推荐

## 📚 更多资源

- [Supabase 文档](https://supabase.com/docs)
- [GitHub 仓库](https://github.com/cypggs/yige-music)
- [README](./README.md)

## 🆘 需要帮助？

如有问题，请在 GitHub Issues 中提交：
https://github.com/cypggs/yige-music/issues

---

**Generated with [Claude Code](https://claude.com/claude-code)**
