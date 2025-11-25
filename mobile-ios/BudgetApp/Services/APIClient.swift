import Foundation

class APIClient {
    static let shared = APIClient()
    
    // Cambiar según ambiente:
    // Desarrollo local: "http://192.168.1.X:8000/api"
    // Producción Render: "https://budgetapp-backend.onrender.com/api"
    private let baseURL = "https://budgetapp-backend.onrender.com/api"
    
    private init() {}
    
    // MARK: - Generic Request
    
    func request<T: Decodable>(
        endpoint: String,
        method: String = "GET",
        body: Data? = nil
    ) async throws -> T {
        guard let url = URL(string: "\(baseURL)\(endpoint)") else {
            throw URLError(.badURL)
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 10
        
        if let body = body {
            request.httpBody = body
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }
        
        let decoder = JSONDecoder()
        return try decoder.decode(T.self, from: data)
    }
    
    // MARK: - Dashboard API
    
    func getAvailableMetrics() async throws -> AvailableMetrics {
        return try await request(endpoint: "/dashboard/monthly-available/")
    }
    
    func getProjectionMetrics() async throws -> ProjectionMetrics {
        return try await request(endpoint: "/dashboard/month-projection/")
    }
    
    // MARK: - Transactions API
    
    func getRecentTransactions(limit: Int = 10) async throws -> [TransactionWithDetails] {
        return try await request(endpoint: "/transactions/recent/?limit=\(limit)")
    }
    
    func createTransaction(_ transaction: TransactionCreate) async throws -> Transaction {
        let encoder = JSONEncoder()
        let body = try encoder.encode(transaction)
        return try await request(endpoint: "/transactions/", method: "POST", body: body)
    }
    
    // MARK: - Categories API
    
    func getActiveCategories() async throws -> [Category] {
        return try await request(endpoint: "/categories/active/")
    }
    
    // MARK: - Accounts API
    
    func getActiveAccounts() async throws -> [Account] {
        return try await request(endpoint: "/accounts/active/")
    }
}
