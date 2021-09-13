//
//  RoutesBuilder+Async.swift
//  RoutesBuilder+Async
//
//  Created by Tanmay Bakshi on 2021-07-19.
//

import Foundation
import Vapor

extension RoutesBuilder {
    @discardableResult
    public func getAsync<Response>(
        _ path: PathComponent...,
        use closure: @escaping (Request) async throws -> Response
    ) -> Route
        where Response: ResponseEncodable
    {
        return self.on(.GET, path, use: { req -> Response in
            let semaphore = DispatchSemaphore(value: 0)
            let response: ValueReference<Response?> = .init(nil)
            let error: ValueReference<Error?> = .init(nil)
            Task {
                defer { semaphore.signal() }
                do {
                    response.value = try await closure(req)
                } catch let caughtError {
                    error.value = caughtError
                }
            }
            semaphore.wait()
            if let error = error.value {
                throw error
            }
            guard let response = response.value else {
                fatalError()
            }
            return response
        })
    }
    
    @discardableResult
    public func postAsync<Response>(
        _ path: PathComponent...,
        use closure: @escaping (Request) async throws -> Response
    ) -> Route
        where Response: ResponseEncodable
    {
        return self.on(.POST, path, use: { req -> Response in
            let semaphore = DispatchSemaphore(value: 0)
            let response: ValueReference<Response?> = .init(nil)
            let error: ValueReference<Error?> = .init(nil)
            Task {
                defer { semaphore.signal() }
                do {
                    response.value = try await closure(req)
                } catch let caughtError {
                    error.value = caughtError
                }
            }
            semaphore.wait()
            if let error = error.value {
                throw error
            }
            guard let response = response.value else {
                fatalError()
            }
            return response
        })
    }
    
    @discardableResult
    public func webSocketAsync(
        _ path: PathComponent...,
        maxFrameSize: WebSocketMaxFrameSize = .`default`,
        shouldUpgrade: @escaping ((Request) -> EventLoopFuture<HTTPHeaders?>) = {
            $0.eventLoop.makeSucceededFuture([:])
        },
        onUpgrade: @escaping (Request, WebSocket) async -> ()
    ) -> Route {
        return self.on(.GET, path) { request -> Response in
            return request.webSocket(maxFrameSize: maxFrameSize, shouldUpgrade: shouldUpgrade, onUpgrade: { req, ws in
                let semaphore = DispatchSemaphore(value: 0)
                Task {
                    defer { semaphore.signal() }
                    await onUpgrade(req, ws)
                }
                semaphore.wait()
            })
        }
    }
}
