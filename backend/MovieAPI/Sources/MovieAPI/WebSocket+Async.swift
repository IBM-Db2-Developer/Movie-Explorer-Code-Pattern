//
//  WebSocket+Async.swift
//  WebSocket+Async
//
//  Created by Tanmay Bakshi on 2021-07-20.
//

import Foundation
import Vapor

extension WebSocket {
    func onTextAsync(_ callback: @escaping (WebSocket, String) async -> ()) {
        onText { ws, str in
            let semaphore = DispatchSemaphore(value: 0)
            Task {
                defer { semaphore.signal() }
                await callback(ws, str)
            }
            semaphore.wait()
        }
    }
}
