import type { OMDbSearchResponse, OMDbMovieDetail, SearchFilters } from "~/types/omdb";
import { movieDetailsCache } from "./cache";

const OMDB_BASE_URL = "https://www.omdbapi.com/";

export async function fetchWithRetry(
  url: string,
  retries: number = 3,
  backoff: number = 1000
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { 
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      if (response.ok) {
        return response;
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, backoff * Math.pow(2, i)));
    }
  }
  throw new Error("Max retries exceeded");
}

export async function searchMovies(filters: SearchFilters): Promise<OMDbSearchResponse> {
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) {
    throw new Error("OMDB API key not configured");
  }

  const params = new URLSearchParams({
    apikey: apiKey,
    s: filters.search || "movie", // Default search term
    page: filters.page.toString(),
  });

  if (filters.type) {
    params.append("type", filters.type);
  }

  if (filters.year) {
    params.append("y", filters.year);
  }

  const url = `${OMDB_BASE_URL}?${params.toString()}`;
  
  try {
    const response = await fetchWithRetry(url);
    const data: OMDbSearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching movies:", error);
    return {
      Response: "False",
      Error: "Network error occurred while fetching movies"
    };
  }
}

export async function getMovieDetails(imdbID: string): Promise<OMDbMovieDetail | null> {
  // Check cache first
  const cached = movieDetailsCache.get(imdbID);
  if (cached) {
    return cached;
  }

  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) {
    throw new Error("OMDB API key not configured");
  }

  const params = new URLSearchParams({
    apikey: apiKey,
    i: imdbID,
    plot: "short",
  });

  const url = `${OMDB_BASE_URL}?${params.toString()}`;

  try {
    const response = await fetchWithRetry(url);
    const data: OMDbMovieDetail = await response.json();
    
    if (data.Response === "True") {
      // Cache successful response
      movieDetailsCache.set(imdbID, data);
      return data;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching details for ${imdbID}:`, error);
    return null;
  }
}

export async function filterMoviesByGenre(
  movies: any[],
  genre: string
): Promise<any[]> {
  if (!genre || !movies?.length) {
    return movies || [];
  }

  const detailsPromises = movies.map(movie => 
    getMovieDetails(movie.imdbID)
  );

  try {
    const detailsResults = await Promise.all(detailsPromises);
    
    return movies.filter((movie, index) => {
      const details = detailsResults[index];
      if (!details) return false;
      
      const movieGenres = details.Genre?.toLowerCase() || "";
      return movieGenres.includes(genre.toLowerCase());
    });
  } catch (error) {
    console.error("Error filtering by genre:", error);
    return movies; // Return original list if filtering fails
  }
}