import SwiftUI

struct ContentView: View {
    @State private var showAddTransaction = false
    
    var body: some View {
        NavigationView {
            if showAddTransaction {
                AddTransactionView(isPresented: $showAddTransaction)
            } else {
                DashboardView(onNavigateToAdd: {
                    showAddTransaction = true
                })
            }
        }
    }
}

#Preview {
    ContentView()
}
