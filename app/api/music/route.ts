// 音乐搜索和获取下载链接 API
// 从 myfreemp3.com.cn 爬取音乐下载链接

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') // 歌曲名 + 歌手名

    if (!query) {
      return NextResponse.json({ success: false, error: 'Query is required' }, { status: 400 })
    }

    // 搜索音乐并获取下载链接
    const searchUrl = `https://www.myfreemp3.com.cn/api/search?q=${encodeURIComponent(query)}&page=1`

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.myfreemp3.com.cn/',
        'Accept': 'application/json',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
      next: { revalidate: 0 } // 不缓存
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // 解析返回的数据，获取第一个匹配的音乐链接
    if (data && data.response && data.response.length > 0) {
      const firstResult = data.response[0]

      return NextResponse.json({
        success: true,
        url: firstResult.url || firstResult.download || null,
        title: firstResult.title || query,
        artist: firstResult.artist || '',
        duration: firstResult.duration || 0,
        raw: firstResult // 返回原始数据用于调试
      })
    }

    // 如果没有找到结果，返回 null
    return NextResponse.json({
      success: true,
      url: null,
      message: 'No results found'
    })

  } catch (error) {
    console.error('Music fetch error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch music',
        fallback: true
      },
      { status: 500 }
    )
  }
}
