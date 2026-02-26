import ky from "ky"
import { NextResponse } from "next/server"

type ArticSearchItem = {
  id: number
  title: string | null
  artist_title: string | null
  image_id: string | null
}

type ArticSearchResponse = {
  data?: ArticSearchItem[]
}

const articClient = ky.create({
  prefixUrl: "https://api.artic.edu/api/v1/",
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim() ?? ""

  if (query.length < 2) {
    return NextResponse.json([])
  }

  try {
    const response = await articClient
      .get("artworks/search", {
        searchParams: {
          q: query,
          fields: "id,title,artist_title,image_id",
          limit: "8",
        },
      })
      .json<ArticSearchResponse>()

    const artworks = (response.data ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      artist_title: item.artist_title,
      image_id: item.image_id,
    }))

    return NextResponse.json(artworks)
  } catch {
    return NextResponse.json(
      {
        message: "Unable to search Art Institute artworks",
      },
      { status: 502 },
    )
  }
}
