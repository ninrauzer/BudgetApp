"""
Pydantic schemas package.
"""

from app.schemas.category import (
    CategoryBase,
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryWithSubcategories,
)
from app.schemas.account import (
    AccountBase,
    AccountCreate,
    AccountUpdate,
    AccountResponse,
)
from app.schemas.budget_plan import (
    BudgetPlanBase,
    BudgetPlanCreate,
    BudgetPlanUpdate,
    BudgetPlanResponse,
    BudgetPlanBulkCreate,
    BudgetPlanSummary,
    BudgetPlanCycleResponse,
)
from app.schemas.transaction import (
    TransactionBase,
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionSummary,
    TransactionCategorySummary,
    TransactionPeriodSummary,
)
from app.schemas.dashboard import (
    DashboardCategorySummary,
    DashboardTopExpense,
    DashboardSummary,
    DashboardResponse,
    DashboardTrendMonth,
    DashboardTrendResponse,
)
from app.schemas.common import (
    SuccessResponse,
    ErrorResponse,
    PaginationMeta,
    PaginatedResponse,
)
from app.schemas.credit_card import (
    CreditCardBase,
    CreditCardCreate,
    CreditCardUpdate,
    CreditCard,
    InstallmentBase,
    InstallmentCreate,
    InstallmentUpdate,
    Installment,
    StatementBase,
    StatementCreate,
    Statement,
    CreditCardSummary,
    DebtEvolutionPoint,
    PayoffProjection,
    StatementUploadResponse,
)
from app.schemas.loan import (
    LoanBase,
    LoanCreate,
    LoanUpdate,
    LoanResponse,
    LoanSummary,
    LoanPaymentCreate,
    LoanPaymentResponse,
    SimulationRequest,
    SimulationResponse,
    DebtDashboard,
    AmortizationSchedule,
)

__all__ = [
    # Category
    "CategoryBase",
    "CategoryCreate",
    "CategoryUpdate",
    "CategoryResponse",
    "CategoryWithSubcategories",
    # Account
    "AccountBase",
    "AccountCreate",
    "AccountUpdate",
    "AccountResponse",
    # BudgetPlan
    "BudgetPlanBase",
    "BudgetPlanCreate",
    "BudgetPlanUpdate",
    "BudgetPlanResponse",
    "BudgetPlanBulkCreate",
    "BudgetPlanSummary",
    "BudgetPlanCycleResponse",
    # Transaction
    "TransactionBase",
    "TransactionCreate",
    "TransactionUpdate",
    "TransactionResponse",
    "TransactionSummary",
    "TransactionCategorySummary",
    "TransactionPeriodSummary",
    # Dashboard
    "DashboardCategorySummary",
    "DashboardTopExpense",
    "DashboardSummary",
    "DashboardResponse",
    "DashboardTrendMonth",
    "DashboardTrendResponse",
    # Common
    "SuccessResponse",
    "ErrorResponse",
    "PaginationMeta",
    "PaginatedResponse",
    # Loan
    "LoanBase",
    "LoanCreate",
    "LoanUpdate",
    "LoanResponse",
    "LoanSummary",
    "LoanPaymentCreate",
    "LoanPaymentResponse",
    "SimulationRequest",
    "SimulationResponse",
    "DebtDashboard",
    "AmortizationSchedule",
]
