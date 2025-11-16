// 推荐 API - 基于用户行为的音乐推荐

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId') || 'anonymous'
    const count = parseInt(searchParams.get('count') || '20')

    // 1. 获取用户黑名单歌手
    const { data: blacklist } = await supabase
      .from('user_blacklist')
      .select('artist_id')
      .eq('user_id', userId)

    const blacklistedArtistIds = blacklist?.map(b => b.artist_id) || []

    // 2. 获取用户行为数据（最近的收藏、锁定、完整播放）
    const { data: behaviors } = await supabase
      .from('user_behaviors')
      .select('artist_id, action')
      .eq('user_id', userId)
      .in('action', ['favorite', 'lock', 'complete'])
      .order('timestamp', { ascending: false })
      .limit(50)

    // 3. 统计用户喜欢的歌手
    const artistPreferences = new Map<string, number>()
    behaviors?.forEach(b => {
      const score = artistPreferences.get(b.artist_id) || 0
      const weight = b.action === 'favorite' ? 3 : b.action === 'lock' ? 2 : 1
      artistPreferences.set(b.artist_id, score + weight)
    })

    // 按偏好分数排序
    const preferredArtists = Array.from(artistPreferences.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([artistId]) => artistId)

    let recommendedTracks: any[] = []

    // 4. 如果有用户偏好，基于偏好推荐（70%）
    if (preferredArtists.length > 0) {
      let query = supabase
        .from('tracks')
        .select(`
          id,
          title,
          title_en,
          artist_id,
          album,
          duration,
          audio_url,
          cover_url,
          lyrics,
          tags,
          popularity,
          artist:artists(*)
        `)
        .in('artist_id', preferredArtists)

      // 只有当黑名单不为空时才应用过滤
      if (blacklistedArtistIds.length > 0) {
        query = query.not('artist_id', 'in', `(${blacklistedArtistIds.join(',')})`)
      }

      const { data: preferredTracks } = await query
        .order('popularity', { ascending: false })
        .limit(Math.floor(count * 0.7))

      recommendedTracks = preferredTracks || []
    }

    // 5. 补充热门歌曲（30% 或全部，如果没有用户偏好）
    const remainingCount = count - recommendedTracks.length
    if (remainingCount > 0) {
      let query = supabase
        .from('tracks')
        .select(`
          id,
          title,
          title_en,
          artist_id,
          album,
          duration,
          audio_url,
          cover_url,
          lyrics,
          tags,
          popularity,
          artist:artists(*)
        `)

      // 只有当黑名单不为空时才应用过滤
      if (blacklistedArtistIds.length > 0) {
        query = query.not('artist_id', 'in', `(${blacklistedArtistIds.join(',')})`)
      }

      const { data: popularTracks } = await query
        .order('popularity', { ascending: false })
        .limit(remainingCount * 2) // 多获取一些，用于过滤

      // 过滤掉已推荐的曲目
      const recommendedIds = new Set(recommendedTracks.map(t => t.id))
      const filteredPopular = (popularTracks || []).filter(t => !recommendedIds.has(t.id))

      recommendedTracks = [
        ...recommendedTracks,
        ...filteredPopular.slice(0, remainingCount)
      ]
    }

    // 6. 随机打乱推荐结果（避免太过规律）
    const shuffled = recommendedTracks.sort(() => Math.random() - 0.5)

    return NextResponse.json({
      success: true,
      count: shuffled.length,
      tracks: shuffled,
      metadata: {
        userId,
        hasPreferences: preferredArtists.length > 0,
        blacklistedArtists: blacklistedArtistIds.length,
        preferredArtists: preferredArtists.length,
      }
    })

  } catch (error) {
    console.error('Recommendation API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}
