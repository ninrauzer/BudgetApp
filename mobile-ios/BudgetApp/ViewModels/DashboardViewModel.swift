import Foundation

@MainActor
class DashboardViewModel: ObservableObject {
    @Published var available: AvailableMetrics?
    @Published var projection: ProjectionMetrics?
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let apiClient = APIClient.shared
    
    func loadDashboard() async {
        isLoading = true
        errorMessage = nil
        
        do {
            async let availableTask = apiClient.getAvailableMetrics()
            async let projectionTask = apiClient.getProjectionMetrics()
            
            let (availableResult, projectionResult) = try await (availableTask, projectionTask)
            
            self.available = availableResult
            self.projection = projectionResult
        } catch {
            errorMessage = "Error al cargar datos: \(error.localizedDescription)"
            print("Dashboard error: \(error)")
        }
        
        isLoading = false
    }
}
