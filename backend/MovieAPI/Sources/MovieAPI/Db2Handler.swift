//
//  Db2Handler.swift
//  Db2Handler
//
//  Created by Tanmay Bakshi on 2021-07-19.
//

import Foundation
#if os(Linux)
import FoundationNetworking
#endif

public class Db2Handler {
    public struct AuthSettings: Codable {
        var hostname: String
        var database: String
        var dbPort: Int
        var restPort: Int
        var ssl: Bool
        var password: String
        var username: String
        var expiryTime: String

        public init(hostname: String, database: String, dbPort: Int, restPort: Int, ssl: Bool, password: String, username: String, expiryTime: String) {
            self.hostname = hostname
            self.database = database
            self.dbPort = dbPort
            self.restPort = restPort
            self.ssl = ssl
            self.password = password
            self.username = username
            self.expiryTime = expiryTime
        }
    }
    
    private struct Auth: Codable {
        var token: String
    }
    
    public struct QueryResponse<T: Codable>: Codable {
        var jobStatus: Int
        var jobStatusDescription: String?
        var resultSet: [T]?
        var rowCount: Int
    }
    
    private struct JobResponse: Codable {
        var id: String
    }
    
    public actor Job<T: Codable> {
        enum JobError: Error {
            case failure(String?)
            case cancelled
        }
        
        private var executing = false
        private var stopped = false
        private var pageRequest: URLRequest!
        private var stopRequest: URLRequest!
        
        deinit {
            if !stopped {
                let request = stopRequest
                Task {
                    try? await Job.stopJob(stopRequest: request!)
                }
            }
        }
        
        private static func stopJob(stopRequest: URLRequest) async throws {
            let (result, response) = try await URLSession.shared.data(for: stopRequest)
            guard (response as? HTTPURLResponse)?.statusCode == 204 else {
                throw RequestError.invalidResponse(String(data: result, encoding: .utf8)!)
            }
        }
       
        init(jobID: String, limit: Int, authSettings: AuthSettings, authToken: String) async throws {
            guard let nextPageURL = URL(string: "http://\(authSettings.hostname):\(authSettings.restPort)/v1/services/\(jobID)") else {
                throw RequestError.invalidURL
            }
            let payload: [String: Any] = [
                "limit": limit
            ]
            pageRequest = URLRequest(url: nextPageURL, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 5)
            pageRequest.httpMethod = "POST"
            pageRequest.httpBody = try JSONSerialization.data(withJSONObject: payload, options: .init())
            pageRequest.addValue("application/json", forHTTPHeaderField: "Content-Type")
            pageRequest.addValue(authToken, forHTTPHeaderField: "authorization")
            
            guard let stopURL = URL(string: "http://\(authSettings.hostname):\(authSettings.restPort)/v1/services/stop/\(jobID)") else {
                throw RequestError.invalidURL
            }
            stopRequest = URLRequest(url: stopURL, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 5)
            stopRequest.httpMethod = "PUT"
            stopRequest.addValue(authToken, forHTTPHeaderField: "authorization")
        }
        
        private func nextRawPage() async throws -> QueryResponse<T>? {
            let (result, response) = try await URLSession.shared.data(for: pageRequest)
            let statusCode = (response as? HTTPURLResponse)?.statusCode
            guard statusCode == 200 else {
                if statusCode == 404 {
                    return nil
                }
                throw RequestError.invalidResponse(String(data: result, encoding: .utf8)!)
            }
            return try JSONDecoder().decode(QueryResponse<T>.self, from: result)
        }
        
        private func stopJob() async throws {
            defer {
                stopped = true
            }
            try await Job.stopJob(stopRequest: stopRequest)
        }
        
        func nextPage() async throws -> QueryResponse<T>? {
            if executing {
                return nil
            }
            executing = true
            defer {
                executing = false
            }
            do {
                while let page = try await nextRawPage() {
                    if page.jobStatus == 0 {
                        throw JobError.failure(page.jobStatusDescription)
                    }
                    if page.jobStatus == 1 || page.jobStatus == 2 {
                        usleep(1_000_000)
                        try Task.checkCancellation()
                        continue
                    }
                    return page
                }
            } catch let error {
                Task {
                    try await stopJob()
                }
                throw error
            }
            return nil
        }
    }

    enum AuthenticationError: Error {
        case noAuthToken
    }
    
    enum RequestError: Error {
        case invalidURL
        case invalidResponse(String)
    }
                                                                                                                                                                                                                                                   
    let authSettings: AuthSettings
    public private(set) var authToken: String!
    private var authTokenError: Error!
    
    public init(authSettings: AuthSettings) throws {
        self.authSettings = authSettings
        let tokenSemaphore = DispatchSemaphore(value: 0)
        Task {
            do {
                self.authToken = try await getDb2AuthToken()
            } catch let error {
                self.authTokenError = error
            }
            tokenSemaphore.signal()
        }
        tokenSemaphore.wait()
        if let authTokenError = authTokenError {
            throw authTokenError
        }
        if authToken == nil {
            throw AuthenticationError.noAuthToken
        }
    }
    
    private func getDb2AuthToken() async throws -> String {
        guard let authUrl = URL(string: "http://\(authSettings.hostname):\(authSettings.restPort)/v1/auth") else {
            throw RequestError.invalidURL
        }

        let body: [String: Any] = [
            "dbParms": [
                "dbHost": authSettings.hostname,
                "dbName": authSettings.database,
                "dbPort": authSettings.dbPort,
                "isSSLConnection": authSettings.ssl,
                "password": authSettings.password,
                "username": authSettings.username
            ],
            "expiryTime": authSettings.expiryTime
        ]

        var request = URLRequest(url: authUrl, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 5)
        request.httpMethod = "POST"
        request.httpBody = try JSONSerialization.data(withJSONObject: body, options: .init())
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let (result, response) = try await URLSession.shared.data(for: request)
        guard (response as? HTTPURLResponse)?.statusCode == 200 else {
            throw RequestError.invalidResponse(String(data: result, encoding: .utf8)!)
        }
        return try JSONDecoder().decode(Auth.self, from: result).token
    }
    
    private func runQuery(service: String, version: String, parameters: [String: Any], sync: Bool) async throws -> Data {
        guard let uploadUrl = URL(string: "http://\(authSettings.hostname):\(authSettings.restPort)/v1/services/\(service)/\(version)") else {
            throw RequestError.invalidURL
        }

        let body: [String: Any] = [
            "parameters": parameters,
            "sync": sync
        ]

        var request = URLRequest(url: uploadUrl, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 10)
        request.httpMethod = "POST"
        request.httpBody = try JSONSerialization.data(withJSONObject: body, options: .init())
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.addValue(authToken, forHTTPHeaderField: "authorization")
        
        let (result, response) = try await URLSession.shared.data(for: request)
        try Task.checkCancellation()
        let statusCode = (response as? HTTPURLResponse)?.statusCode
        guard statusCode == 200 || statusCode == 202 else { throw RequestError.invalidResponse(String(data: result, encoding: .utf8)!) }
        return result
    }

    private func runSQL(statement: String, parameters: [String: Any], isQuery: Bool, sync: Bool) async throws -> Data {
        guard let url = URL(string: "http://\(authSettings.hostname):\(authSettings.restPort)/v1/services/execsql") else {
            throw RequestError.invalidURL
        }

        let body: [String: Any] = [
            "sqlStatement": statement,
            "parameters": parameters,
            "isQuery": isQuery,
            "sync": sync
        ]

        var request = URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 10)
        request.httpMethod = "POST"
        request.httpBody = try JSONSerialization.data(withJSONObject: body, options: .init())
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.addValue(authToken, forHTTPHeaderField: "authorization")

        let (result, response) = try await URLSession.shared.data(for: request)
        try Task.checkCancellation()
        let statusCode = (response as? HTTPURLResponse)?.statusCode
        guard statusCode == 200 || statusCode == 202 else { throw RequestError.invalidResponse(String(data: result, encoding: .utf8)!) }
        return result
    }
    
    func runSyncJob<T>(service: String, version: String, parameters: [String: Any]) async throws -> QueryResponse<T> {
        let result = try await runQuery(service: service, version: version, parameters: parameters, sync: true)
        return try JSONDecoder().decode(QueryResponse<T>.self, from: result)
    }

    func runSyncSQL<T>(statement: String, parameters: [String: Any]) async throws -> QueryResponse<T> {
        let result = try await runSQL(statement: statement, parameters: parameters, isQuery: true, sync: true)
        return try JSONDecoder().decode(QueryResponse<T>.self, from: result)
    }
    
    func runSyncJob(service: String, version: String, parameters: [String: Any]) async throws {
        _ = try await runQuery(service: service, version: version, parameters: parameters, sync: true)
    }

    func runSyncSQL(statement: String, parameters: [String: Any]) async throws {
        _ = try await runSQL(statement: statement, parameters: parameters, isQuery: false, sync: true)
    }
    
    func runAsyncJob<T>(service: String, version: String, parameters: [String: Any], limit: Int) async throws -> Job<T> {
        let result = try await runQuery(service: service, version: version, parameters: parameters, sync: false)
        let jobId = try JSONDecoder().decode(JobResponse.self, from: result).id
        return try await Job<T>(jobID: jobId, limit: limit, authSettings: authSettings, authToken: authToken)
    }

    func runAsyncSQL<T>(statement: String, parameters: [String: Any], limit: Int) async throws -> Job<T> {
        let result = try await runSQL(statement: statement, parameters: parameters, isQuery: true, sync: false)
        let jobId = try JSONDecoder().decode(JobResponse.self, from: result).id
        return try await Job(jobID: jobId, limit: limit, authSettings: authSettings, authToken: authToken)
    }
}
