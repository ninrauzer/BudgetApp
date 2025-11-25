import Foundation

@MainActor
class TransactionViewModel: ObservableObject {
    @Published var categories: [Category] = []
    @Published var accounts: [Account] = []
    @Published var isLoading = false
    @Published var isSaving = false
    @Published var errorMessage: String?
    @Published var successMessage: String?
    
    private let apiClient = APIClient.shared
    
    func loadFormData() async {
        isLoading = true
        errorMessage = nil
        
        do {
            async let categoriesTask = apiClient.getActiveCategories()
            async let accountsTask = apiClient.getActiveAccounts()
            
            let (categoriesResult, accountsResult) = try await (categoriesTask, accountsTask)
            
            self.categories = categoriesResult.filter { $0.type == "expense" }
            self.accounts = accountsResult
        } catch {
            errorMessage = "Error al cargar formulario: \(error.localizedDescription)"
            print("Form data error: \(error)")
        }
        
        isLoading = false
    }
    
    func saveTransaction(
        amount: Double,
        description: String,
        categoryId: Int,
        accountId: Int
    ) async -> Bool {
        isSaving = true
        errorMessage = nil
        successMessage = nil
        
        let dateFormatter = ISO8601DateFormatter()
        dateFormatter.formatOptions = [.withFullDate]
        let todayString = dateFormatter.string(from: Date())
        
        let transaction = TransactionCreate(
            date: todayString,
            description: description,
            amount: amount,
            type: "expense",
            category_id: categoryId,
            account_id: accountId,
            currency: "PEN"
        )
        
        do {
            _ = try await apiClient.createTransaction(transaction)
            successMessage = "Transacción creada correctamente"
            isSaving = false
            return true
        } catch {
            errorMessage = "Error al guardar: \(error.localizedDescription)"
            print("Save transaction error: \(error)")
            isSaving = false
            return false
        }
    }
}
