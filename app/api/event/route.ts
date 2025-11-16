// 用户行为事件 API - 记录用户操作（播放、跳过、收藏等）

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { UserAction } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      trackId,
      artistId,
      action,
      playDuration,
      sessionId,
      metadata,
    } = body

    // 验证必需字段
    if (!userId || !trackId || !artistId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 验证 action 类型
    const validActions: UserAction[] = ['play', 'skip', 'lock', 'favorite', 'unfavorite', 'complete', 'blacklist']
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action type' },
        { status: 400 }
      )
    }

    // 1. 记录行为事件
    const { data: behavior, error: behaviorError } = await supabase
      .from('user_behaviors')
      .insert({
        user_id: userId,
        track_id: trackId,
        artist_id: artistId,
        action,
        play_duration: playDuration,
        session_id: sessionId,
        metadata,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single()

    if (behaviorError) throw behaviorError

    // 2. 处理收藏/取消收藏
    if (action === 'favorite') {
      await supabase
        .from('user_favorites')
        .upsert({
          user_id: userId,
          track_id: trackId,
        }, {
          onConflict: 'user_id,track_id',
        })
    } else if (action === 'unfavorite') {
      await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('track_id', trackId)
    }

    // 3. 处理黑名单
    if (action === 'blacklist') {
      await supabase
        .from('user_blacklist')
        .upsert({
          user_id: userId,
          artist_id: artistId,
        }, {
          onConflict: 'user_id,artist_id',
        })
    }

    return NextResponse.json({
      success: true,
      data: behavior,
      message: `Action '${action}' recorded successfully`,
    })

  } catch (error) {
    console.error('Event API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to record event' },
      { status: 500 }
    )
  }
}

// 获取用户行为历史
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('user_behaviors')
      .select(`
        *,
        track:tracks(*),
        artist:artists(*)
      `)
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (action) {
      query = query.eq('action', action)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      count: data.length,
      behaviors: data,
    })

  } catch (error) {
    console.error('Get behaviors error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch behaviors' },
      { status: 500 }
    )
  }
}
