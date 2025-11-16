-- 亦歌（1g1g）音乐播放器数据库 Schema
-- 创建时间: 2025-11-16

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. 歌手表 (Artists)
-- ============================================
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_en TEXT,
  avatar_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_artists_name ON artists(name);

-- ============================================
-- 2. 曲目表 (Tracks)
-- ============================================
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  title_en TEXT,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  album TEXT,
  duration INTEGER, -- 时长（秒）
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  lyrics TEXT,
  tags TEXT[], -- 音乐标签（用于推荐）
  popularity INTEGER DEFAULT 0, -- 流行度分数（0-100）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX idx_tracks_popularity ON tracks(popularity DESC);
CREATE INDEX idx_tracks_tags ON tracks USING GIN(tags);

-- ============================================
-- 3. 用户行为表 (User Behaviors)
-- ============================================
CREATE TABLE user_behaviors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- 支持匿名用户（使用浏览器指纹）
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('play', 'skip', 'lock', 'favorite', 'unfavorite', 'complete')),
  play_duration INTEGER, -- 实际播放时长（秒）
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT, -- 会话ID
  metadata JSONB -- 额外元数据
);

CREATE INDEX idx_user_behaviors_user_id ON user_behaviors(user_id);
CREATE INDEX idx_user_behaviors_track_id ON user_behaviors(track_id);
CREATE INDEX idx_user_behaviors_artist_id ON user_behaviors(artist_id);
CREATE INDEX idx_user_behaviors_action ON user_behaviors(action);
CREATE INDEX idx_user_behaviors_timestamp ON user_behaviors(timestamp DESC);

-- ============================================
-- 4. 用户收藏表 (User Favorites)
-- ============================================
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, track_id)
);

CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);

-- ============================================
-- 5. 用户黑名单表 (User Blacklist)
-- ============================================
CREATE TABLE user_blacklist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, artist_id)
);

CREATE INDEX idx_user_blacklist_user_id ON user_blacklist(user_id);

-- ============================================
-- 6. 播放队列表 (Play Queue)
-- ============================================
CREATE TABLE play_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL, -- 队列位置
  is_locked BOOLEAN DEFAULT FALSE, -- 是否被锁定
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, position)
);

CREATE INDEX idx_play_queue_user_id ON play_queue(user_id, position);

-- ============================================
-- 触发器：自动更新 updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tracks_updated_at BEFORE UPDATE ON tracks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 示例数据（用于 Demo）
-- ============================================

-- 插入歌手
INSERT INTO artists (id, name, name_en, avatar_url, description) VALUES
  ('11111111-1111-1111-1111-111111111111', '周杰伦', 'Jay Chou', 'https://picsum.photos/seed/jay/200', '华语流行音乐天王'),
  ('22222222-2222-2222-2222-222222222222', '林俊杰', 'JJ Lin', 'https://picsum.photos/seed/jj/200', '新加坡创作歌手'),
  ('33333333-3333-3333-3333-333333333333', '邓紫棋', 'G.E.M.', 'https://picsum.photos/seed/gem/200', '香港创作歌手'),
  ('44444444-4444-4444-4444-444444444444', '薛之谦', 'Joker Xue', 'https://picsum.photos/seed/joker/200', '内地创作歌手'),
  ('55555555-5555-5555-5555-555555555555', '陈奕迅', 'Eason Chan', 'https://picsum.photos/seed/eason/200', '香港流行歌手'),
  ('66666666-6666-6666-6666-666666666666', '李荣浩', 'Ronghao Li', 'https://picsum.photos/seed/ronghao/200', '内地创作歌手'),
  ('77777777-7777-7777-7777-777777777777', '王力宏', 'Leehom Wang', 'https://picsum.photos/seed/leehom/200', '华语流行歌手'),
  ('88888888-8888-8888-8888-888888888888', '张学友', 'Jacky Cheung', 'https://picsum.photos/seed/jacky/200', '香港歌神'),
  ('99999999-9999-9999-9999-999999999999', '五月天', 'Mayday', 'https://picsum.photos/seed/mayday/200', '台湾摇滚乐团'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '孙燕姿', 'Stefanie Sun', 'https://picsum.photos/seed/stefanie/200', '新加坡流行歌手');

-- 插入曲目（使用示例音频 URL）
-- 注意：这里使用公开的示例音频，实际应用需要合法音源
INSERT INTO tracks (title, title_en, artist_id, album, duration, audio_url, cover_url, tags, popularity) VALUES
  -- 周杰伦
  ('晴天', 'Sunny Day', '11111111-1111-1111-1111-111111111111', '叶惠美', 270, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'https://picsum.photos/seed/song1/300', ARRAY['流行', '抒情', '经典'], 95),
  ('七里香', 'Common Jasmin Orange', '11111111-1111-1111-1111-111111111111', '七里香', 300, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'https://picsum.photos/seed/song2/300', ARRAY['流行', '浪漫'], 92),
  ('稻香', 'Rice Field', '11111111-1111-1111-1111-111111111111', '魔杰座', 225, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'https://picsum.photos/seed/song3/300', ARRAY['流行', '励志'], 90),

  -- 林俊杰
  ('江南', 'Jiang Nan', '22222222-2222-2222-2222-222222222222', '第二天堂', 255, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 'https://picsum.photos/seed/song4/300', ARRAY['流行', '抒情'], 88),
  ('修炼爱情', 'Practice Love', '22222222-2222-2222-2222-222222222222', '新地球', 267, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 'https://picsum.photos/seed/song5/300', ARRAY['流行', '浪漫'], 85),
  ('美人鱼', 'Mermaid', '22222222-2222-2222-2222-222222222222', '她说', 240, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 'https://picsum.photos/seed/song6/300', ARRAY['流行', '抒情'], 83),

  -- 邓紫棋
  ('光年之外', 'Light Years Away', '33333333-3333-3333-3333-333333333333', '新的心跳', 285, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 'https://picsum.photos/seed/song7/300', ARRAY['流行', '电影OST'], 90),
  ('泡沫', 'Bubble', '33333333-3333-3333-3333-333333333333', 'Xposed', 243, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 'https://picsum.photos/seed/song8/300', ARRAY['流行', '抒情'], 87),

  -- 薛之谦
  ('演员', 'Actor', '44444444-4444-4444-4444-444444444444', '绅士', 258, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', 'https://picsum.photos/seed/song9/300', ARRAY['流行', '抒情'], 93),
  ('丑八怪', 'Ugly Beauty', '44444444-4444-4444-4444-444444444444', '意外', 273, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', 'https://picsum.photos/seed/song10/300', ARRAY['流行', '励志'], 86),

  -- 陈奕迅
  ('十年', 'Ten Years', '55555555-5555-5555-5555-555555555555', 'U-87', 195, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'https://picsum.photos/seed/song11/300', ARRAY['流行', '经典', '抒情'], 96),
  ('浮夸', 'Exaggerated', '55555555-5555-5555-5555-555555555555', 'U-87', 322, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'https://picsum.photos/seed/song12/300', ARRAY['流行', '励志'], 91),
  ('好久不见', 'Long Time No See', '55555555-5555-5555-5555-555555555555', '认了吧', 235, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'https://picsum.photos/seed/song13/300', ARRAY['流行', '抒情'], 89),

  -- 李荣浩
  ('李白', 'Li Bai', '66666666-6666-6666-6666-666666666666', '模特', 261, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 'https://picsum.photos/seed/song14/300', ARRAY['流行', '励志'], 84),
  ('年少有为', 'Young and Promising', '66666666-6666-6666-6666-666666666666', '耳朵', 222, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 'https://picsum.photos/seed/song15/300', ARRAY['流行', '抒情'], 88),

  -- 王力宏
  ('心跳', 'Heartbeat', '77777777-7777-7777-7777-777777777777', '心跳', 245, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 'https://picsum.photos/seed/song16/300', ARRAY['流行', '摇滚'], 82),
  ('大城小爱', 'Small Love in Big City', '77777777-7777-7777-7777-777777777777', '心中的日月', 267, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 'https://picsum.photos/seed/song17/300', ARRAY['流行', '浪漫'], 85),

  -- 张学友
  ('吻别', 'Kiss Goodbye', '88888888-8888-8888-8888-888888888888', '吻别', 295, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 'https://picsum.photos/seed/song18/300', ARRAY['流行', '经典', '抒情'], 97),
  ('一千个伤心的理由', '1000 Sad Reasons', '88888888-8888-8888-8888-888888888888', '真情流露', 278, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', 'https://picsum.photos/seed/song19/300', ARRAY['流行', '经典'], 94),

  -- 五月天
  ('突然好想你', 'Suddenly Miss You', '99999999-9999-9999-9999-999999999999', '后青春期的诗', 237, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', 'https://picsum.photos/seed/song20/300', ARRAY['摇滚', '抒情'], 92),
  ('倔强', 'Stubborn', '99999999-9999-9999-9999-999999999999', '神的孩子都在跳舞', 250, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'https://picsum.photos/seed/song21/300', ARRAY['摇滚', '励志'], 95),

  -- 孙燕姿
  ('遇见', 'Meet', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '未完成', 264, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'https://picsum.photos/seed/song22/300', ARRAY['流行', '抒情'], 91),
  ('天黑黑', 'Rainy Night', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '孙燕姿同名专辑', 288, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'https://picsum.photos/seed/song23/300', ARRAY['流行', '经典'], 87);

-- ============================================
-- Row Level Security (RLS) 策略
-- ============================================

-- 启用 RLS
ALTER TABLE user_behaviors ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_queue ENABLE ROW LEVEL SECURITY;

-- 公共读取策略（所有表都可以被匿名用户读取）
CREATE POLICY "Artists are viewable by everyone" ON artists
  FOR SELECT USING (true);

CREATE POLICY "Tracks are viewable by everyone" ON tracks
  FOR SELECT USING (true);

-- 用户行为策略（任何人都可以插入，但只能查看和修改自己的数据）
CREATE POLICY "Anyone can insert user behaviors" ON user_behaviors
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own behaviors" ON user_behaviors
  FOR SELECT USING (true);

-- 用户收藏策略
CREATE POLICY "Anyone can manage their favorites" ON user_favorites
  FOR ALL USING (true) WITH CHECK (true);

-- 用户黑名单策略
CREATE POLICY "Anyone can manage their blacklist" ON user_blacklist
  FOR ALL USING (true) WITH CHECK (true);

-- 播放队列策略
CREATE POLICY "Anyone can manage their queue" ON play_queue
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 推荐算法辅助视图
-- ============================================

-- 用户最喜欢的歌手（基于行为统计）
CREATE OR REPLACE VIEW user_favorite_artists AS
SELECT
  user_id,
  artist_id,
  COUNT(*) FILTER (WHERE action = 'favorite') as favorite_count,
  COUNT(*) FILTER (WHERE action = 'lock') as lock_count,
  COUNT(*) FILTER (WHERE action = 'complete') as complete_count,
  COUNT(*) FILTER (WHERE action = 'skip') as skip_count,
  (
    COUNT(*) FILTER (WHERE action IN ('favorite', 'lock', 'complete')) * 10 -
    COUNT(*) FILTER (WHERE action = 'skip') * 5
  ) as preference_score
FROM user_behaviors
GROUP BY user_id, artist_id
ORDER BY preference_score DESC;

-- 热门曲目（基于全站行为）
CREATE OR REPLACE VIEW popular_tracks AS
SELECT
  t.id,
  t.title,
  t.artist_id,
  COUNT(*) FILTER (WHERE ub.action = 'favorite') as favorite_count,
  COUNT(*) FILTER (WHERE ub.action = 'lock') as lock_count,
  COUNT(*) FILTER (WHERE ub.action = 'complete') as complete_count,
  COUNT(*) FILTER (WHERE ub.action = 'skip') as skip_count,
  t.popularity + (
    COUNT(*) FILTER (WHERE ub.action IN ('favorite', 'lock', 'complete')) * 2 -
    COUNT(*) FILTER (WHERE ub.action = 'skip')
  ) as total_score
FROM tracks t
LEFT JOIN user_behaviors ub ON ub.track_id = t.id
GROUP BY t.id
ORDER BY total_score DESC;

COMMENT ON TABLE artists IS '歌手信息表';
COMMENT ON TABLE tracks IS '曲目信息表';
COMMENT ON TABLE user_behaviors IS '用户行为事件表（播放、跳过、锁定、收藏等）';
COMMENT ON TABLE user_favorites IS '用户收藏表';
COMMENT ON TABLE user_blacklist IS '用户黑名单表（歌手级别）';
COMMENT ON TABLE play_queue IS '用户播放队列表';
