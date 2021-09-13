import Foundation
import FoundationNetworking

extension URLSession {
    enum DataRequestError: Error {
        case noData
        case noResponse
    }

    func data(for request: URLRequest) async throws -> (Data, URLResponse) {
        var completionData: Data?
        var completionResponse: URLResponse?
        var completionError: Error?
        let semaphore = DispatchSemaphore(value: 0)
        let task = self.dataTask(with: request) { (taskData, taskResponse, taskError) in
            completionData = taskData
            completionResponse = taskResponse
            completionError = taskError
            semaphore.signal()
        }
        task.resume()
        semaphore.wait()
        if let error = completionError {
            throw error
        }
        guard let data = completionData else {
            throw DataRequestError.noData
        }
        guard let response = completionResponse else {
            throw DataRequestError.noResponse
        }
        return (data, response)
    }
}
