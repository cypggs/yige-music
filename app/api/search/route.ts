// 搜索 API - 搜索歌曲和歌手

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all' // all, track, artist
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!q || q.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      )
    }

    const results: any = {
      success: true,
      query: q,
      tracks: [],
      artists: [],
    }

    // 搜索曲目
    if (type === 'all' || type === 'track') {
      const { data: tracks } = await supabase
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
        .or(`title.ilike.%${q}%,title_en.ilike.%${q}%,album.ilike.%${q}%`)
        .order('popularity', { ascending: false })
        .limit(limit)

      results.tracks = tracks || []
    }

    // 搜索歌手
    if (type === 'all' || type === 'artist') {
      const { data: artists } = await supabase
        .from('artists')
        .select('*')
        .or(`name.ilike.%${q}%,name_en.ilike.%${q}%`)
        .limit(limit)

      results.artists = artists || []
    }

    return NextResponse.json(results)

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    )
  }
}
