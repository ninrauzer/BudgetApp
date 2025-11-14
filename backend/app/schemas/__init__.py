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
]
