export interface OMDbSearchResult {
  Title: string;
  Year: string;
  imdbID: string;
  Type: "movie" | "series" | "episode";
  Poster: string;
}

export interface OMDbSearchResponse {
  Search?: OMDbSearchResult[];
  totalResults?: string;
  Response: "True" | "False";
  Error?: string;
}

export interface OMDbMovieDetail {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{
    Source: string;
    Value: string;
  }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: "movie" | "series" | "episode";
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: "True" | "False";
  Error?: string;
}

export interface SearchFilters {
  search: string;
  type: "movie" | "series" | "episode" | "";
  year: string;
  genre: string;
  page: number;
}