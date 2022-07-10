//
//  MovieContent.swift
//  MovieContent
//
//  Created by Tanmay Bakshi on 2021-07-20.
//

import Foundation

class MovieContent {
    actor Cache {
        var movies: [Int: Movie] = [:]
        var genres: [Movie: [String]] = [:]
        var productionCompanies: [Movie: [String]] = [:]
        
        func new(movie: Movie, for id: Int) {
            self.movies[id] = movie
        }
        
        func new(genres: [String], for movie: Movie) {
            self.genres[movie] = genres
        }
        
        func new(productionCompanies: [String], for movie: Movie) {
            self.productionCompanies[movie] = productionCompanies
        }
    }
    
    class Search {
        var query: String
        private var job: Db2Handler.Job<Movie>
        
        init(query: String, job: Db2Handler.Job<Movie>) {
            self.query = query
            self.job = job
        }
        
        func next() async throws -> [Movie]? {
            try await job.nextPage()?.resultSet
        }
    }
    
    private var db2Handler: Db2Handler
    private var cache = Cache()
    
    init(db2Handler: Db2Handler) {
        self.db2Handler = db2Handler
    }
    
    func movie(by id: Int) async throws -> Movie? {
        if let cached = await cache.movies[id] {
            return cached
        }
        let response: Db2Handler.QueryResponse<Movie> =
            try await db2Handler.runSyncJob(service: "GetMovieByID", version: "1.0",
                                            parameters: ["@movieId": id])
        guard let results = response.resultSet else {
            return nil
        }
        guard let movie = results.first else {
            return nil
        }
        await cache.new(movie: movie, for: id)
        return movie
    }
    
    func movies(by name: String) async throws -> Search {
        let job: Db2Handler.Job<Movie> =
            try await db2Handler.runAsyncJob(service: "GetMoviesByName", version: "1.0",
                                             parameters: ["@title": name], limit: 10)
        return Search(query: name, job: job)
    }
    
    func genres(for movie: Movie) async throws -> [String]? {
        if let cached = await cache.genres[movie] {
            return cached
        }
        let response: Db2Handler.QueryResponse<MovieGenreLink> =
            try await db2Handler.runSyncJob(service: "GetMovieGenres", version: "1.0",
                                            parameters: ["@movieId": movie.movieID])
        guard let results = response.resultSet else {
            return nil
        }
        let genres = results.map { $0.name }
        await cache.new(genres: genres, for: movie)
        return genres
    }
    
    func productionCompanies(for movie: Movie) async throws -> [String]? {
        if let cached = await cache.productionCompanies[movie] {
            return cached
        }
        let response: Db2Handler.QueryResponse<MovieProductionCompanyLink> =
            try await db2Handler.runSyncJob(service: "GetMovieProductionCompanies", version: "1.0",
                                            parameters: ["@movieId": movie.movieID])
        guard let results = response.resultSet else {
            return nil
        }
        let productionCompanies = results.map { $0.name }
        await cache.new(productionCompanies: productionCompanies, for: movie)
        return productionCompanies
    }

	func recommendations(for ratings: [Int: Int]) async throws -> [Int] {
		let queryID = Int.random(in: 1...10000000)

		let insertValues = ratings.map { "(\(queryID), \($0.key), \($0.value))" }.joined(separator: ", ")
		let insertStatement = "INSERT INTO RATINGS VALUES \(insertValues)"
		try await db2Handler.runSyncSQL(statement: insertStatement, parameters: [:])

		let recommendationResponse: Db2Handler.QueryResponse<MovieRecommendation> =
			try await db2Handler.runSyncJob(service: "GetMovieRecommendations", version: "1.0",
									        parameters: ["@queryId": queryID])
		let recommendations = (recommendationResponse.resultSet ?? []).map { $0.movieID }

		let deleteStatement = "DELETE FROM RATINGS WHERE QUERYID=\(queryID)"
		try await db2Handler.runSyncSQL(statement: deleteStatement, parameters: [:])

		return recommendations
	}
}

