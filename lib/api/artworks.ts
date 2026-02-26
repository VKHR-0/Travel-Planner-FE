import { apiRequest } from "@/lib/api/client"

export type ArtworkSearchResult = {
  id: number
  title: string | null
  artist_title: string | null
  image_id: string | null
}

export async function searchArtworks(query: string): Promise<ArtworkSearchResult[]> {
  const params = new URLSearchParams({ q: query })
  return apiRequest<ArtworkSearchResult[]>(`/artworks/search?${params.toString()}`)
}
