//
//  Tables.swift
//  Tables
//
//  Created by Tanmay Bakshi on 2021-07-19.
//

import Foundation

struct Movie: Codable, Hashable {
    enum CodingKeys: String, CodingKey {
        case movieID = "MOVIEID"
        case posterURL = "POSTERURL"
        case title = "TITLE"
        case overview = "OVERVIEW"
    }
    
    var movieID: Int
    var posterURL: String
    var title: String
    var overview: String
}

struct MovieGenreLink: Codable {
    enum CodingKeys: String, CodingKey {
        case name = "NAME"
    }
    
    var name: String
}

struct MovieProductionCompanyLink: Codable {
    enum CodingKeys: String, CodingKey {
        case name = "NAME"
    }
    
    var name: String
}

struct MovieRecommendation: Codable {
	enum CodingKeys: String, CodingKey {
		case movieID = "MOVIEID"
	}

	var movieID: Int
}
