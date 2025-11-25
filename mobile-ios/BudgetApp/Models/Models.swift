import Foundation

// MARK: - Models

struct Transaction: Codable, Identifiable {
    let id: Int
    let date: String
    let description: String
    let amount: Double
    let type: String
    let category_id: Int
    let account_id: Int
    let currency: String?
    let created_at: String
    let updated_at: String
}

struct TransactionWithDetails: Codable, Identifiable {
    let id: Int
    let date: String
    let description: String
    let amount: Double
    let type: String
    let category_id: Int
    let account_id: Int
    let category_name: String
    let account_name: String
    let category_icon: String?
    let currency: String?
}

struct Account: Codable, Identifiable {
    let id: Int
    let name: String
    let type: String
    let icon: String?
    let currency: String
    let initial_balance: Double
    let current_balance: Double
    let is_active: Bool
}

struct Category: Codable, Identifiable {
    let id: Int
    let name: String
    let type: String
    let icon: String?
    let color: String?
    let expense_type: String?
    let is_active: Bool
}

struct AvailableMetrics: Codable {
    let available_balance: Double
    let total_income: Double
    let fixed_expenses: Double
    let variable_expenses: Double
    let pending_income: Double
}

struct ProjectionMetrics: Codable {
    let current_balance: Double
    let projected_balance: Double
    let days_remaining: Int
    let daily_average: Double
    let message: String
}

struct TransactionCreate: Codable {
    let date: String
    let description: String
    let amount: Double
    let type: String
    let category_id: Int
    let account_id: Int
    let currency: String
}
