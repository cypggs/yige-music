// 获取歌手的所有曲目

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { artistId: string } }
) {
  try {
    const artistId = params.artistId
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')

    // 获取歌手信息
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('*')
      .eq('id', artistId)
      .single()

    if (artistError) throw artistError

    // 获取歌手的所有曲目
    const { data: tracks, error: tracksError } = await supabase
      .from('tracks')
      .select('*')
      .eq('artist_id', artistId)
      .order('popularity', { ascending: false })
      .limit(limit)

    if (tracksError) throw tracksError

    return NextResponse.json({
      success: true,
      artist,
      tracks,
      count: tracks.length,
    })

  } catch (error) {
    console.error('Get artist tracks error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch artist tracks' },
      { status: 500 }
    )
  }
}
