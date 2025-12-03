# ADR-006: Multi-Tenancy Implementation

**Status:** Proposed  
**Date:** 2024-12-02  
**Decision Makers:** Development Team  
**Priority:** High (Required before adding multiple real users)

---

## Context and Problem Statement

Currently, BudgetApp operates as a **single-tenant application** where all users share the same data. With the OAuth authentication system and user whitelist implemented (ADR-005), we can now control WHO can access the application. However, **all authenticated users see and can modify the SAME data**.

**Critical Security Issue:**
- User A logs in → sees ALL transactions, accounts, budgets
- User B logs in → sees ALL transactions, accounts, budgets (including User A's data)
- Any user can modify or delete data from other users
- No data isolation between users

**Current State:**
```sql
-- All queries return ALL data (no user filtering)
SELECT * FROM transactions;
SELECT * FROM budget_plans;
SELECT * FROM accounts;
```

**Business Need:**
Enable multiple users (family members, team members) to use BudgetApp independently with complete data isolation.

---

## Decision Drivers

### Security Requirements
- **Data Privacy:** Users must only see their own financial data
- **Data Integrity:** Users cannot modify/delete other users' data
- **Audit Trail:** Track which user created/modified each record

### Use Cases
1. **Family Budget:** Multiple family members with separate personal budgets
2. **Multi-client Accounting:** Accountant managing multiple clients' budgets
3. **Team Budget:** Different departments with independent budgets
4. **Demo Users:** Each demo user gets isolated sandbox data

### Technical Constraints
- Must work with existing OAuth authentication (ADR-005)
- Must maintain backward compatibility with current data
- Must not significantly impact query performance
- PostgreSQL database (supports row-level security)

---

## Considered Options

### Option 1: User ID Foreign Key (Recommended)
Add `user_id` column to all tenant-scoped tables and filter all queries.

**Pros:**
- ✅ Simple to understand and implement
- ✅ Explicit data ownership in queries
- ✅ Easy to debug and audit
- ✅ Works with existing ORM (SQLAlchemy)
- ✅ Minimal performance impact (indexed foreign key)

**Cons:**
- ❌ Requires adding user_id to ~12 tables
- ❌ Must update ~100+ queries across codebase
- ❌ Data migration needed for existing records

### Option 2: PostgreSQL Row-Level Security (RLS)
Use PostgreSQL's built-in RLS feature to automatically filter rows.

**Pros:**
- ✅ Database-enforced security (cannot be bypassed)
- ✅ No query modifications needed in application code
- ✅ Centralized security policies

**Cons:**
- ❌ PostgreSQL-specific (no portability)
- ❌ Complex debugging (security is "invisible")
- ❌ Harder to audit which user owns what
- ❌ Performance overhead on every query

### Option 3: Separate Database Per User
Create isolated database or schema per user.

**Pros:**
- ✅ Complete data isolation
- ✅ Easy to backup/restore per user
- ✅ No query modifications needed

**Cons:**
- ❌ Significant infrastructure complexity
- ❌ Database connection pooling issues
- ❌ Migration/update nightmare
- ❌ Not practical for container deployments

### Option 4: Hybrid Approach (User ID + RLS)
Combine explicit user_id foreign keys with PostgreSQL RLS as second layer.

**Pros:**
- ✅ Defense in depth (two security layers)
- ✅ Explicit ownership + automatic enforcement

**Cons:**
- ❌ Most complex to implement
- ❌ Overkill for current needs

---

## Decision Outcome

**Chosen Option:** **Option 1 - User ID Foreign Key**

### Rationale:
1. **Simplicity:** Explicit and easy to understand
2. **Maintainability:** Clear data ownership in code
3. **Debuggability:** Easy to trace which user owns data
4. **Industry Standard:** Most SaaS applications use this pattern
5. **Pragmatic:** Best balance of security and development effort

---

## Implementation Plan

### Phase 1: Database Schema Changes (1-2 hours)

#### 1.1 Add user_id to Tenant-Scoped Tables
```sql
-- Tables requiring user_id foreign key:
ALTER TABLE transactions ADD COLUMN user_id INTEGER REFERENCES users(id);
ALTER TABLE budget_plans ADD COLUMN user_id INTEGER REFERENCES users(id);
ALTER TABLE accounts ADD COLUMN user_id INTEGER REFERENCES users(id);
ALTER TABLE categories ADD COLUMN user_id INTEGER REFERENCES users(id);
ALTER TABLE credit_cards ADD COLUMN user_id INTEGER REFERENCES users(id);
ALTER TABLE credit_card_statements ADD COLUMN user_id INTEGER REFERENCES users(id);
ALTER TABLE credit_card_installments ADD COLUMN user_id INTEGER REFERENCES users(id);
ALTER TABLE loans ADD COLUMN user_id INTEGER REFERENCES users(id);
ALTER TABLE loan_payments ADD COLUMN user_id INTEGER REFERENCES users(id);
ALTER TABLE quick_templates ADD COLUMN user_id INTEGER REFERENCES users(id);
ALTER TABLE transfers ADD COLUMN user_id INTEGER REFERENCES users(id);

-- Create indexes for performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_budget_plans_user_id ON budget_plans(user_id);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_credit_cards_user_id ON credit_cards(user_id);
CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_quick_templates_user_id ON quick_templates(user_id);
```

#### 1.2 Shared/Global Tables (NO user_id)
```sql
-- These tables remain global:
- billing_cycles (shared configuration)
- exchange_rates (public data from BCRP)
- users (identity management)
- allowed_users (whitelist)
```

#### 1.3 Data Migration
```sql
-- Assign all existing data to current primary user
UPDATE transactions SET user_id = (SELECT id FROM users WHERE email = 'ninrauzer@gmail.com');
UPDATE budget_plans SET user_id = (SELECT id FROM users WHERE email = 'ninrauzer@gmail.com');
UPDATE accounts SET user_id = (SELECT id FROM users WHERE email = 'ninrauzer@gmail.com');
UPDATE categories SET user_id = (SELECT id FROM users WHERE email = 'ninrauzer@gmail.com');
UPDATE credit_cards SET user_id = (SELECT id FROM users WHERE email = 'ninrauzer@gmail.com');
UPDATE loans SET user_id = (SELECT id FROM users WHERE email = 'ninrauzer@gmail.com');
UPDATE quick_templates SET user_id = (SELECT id FROM users WHERE email = 'ninrauzer@gmail.com');

-- Make user_id NOT NULL after migration
ALTER TABLE transactions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE budget_plans ALTER COLUMN user_id SET NOT NULL;
-- ... repeat for all tables
```

### Phase 2: Backend Model Changes (1 hour)

#### 2.1 Update SQLAlchemy Models
```python
# backend/app/models/transaction.py
class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)  # NEW
    # ... existing fields
    
    # Relationship
    user = relationship("User", back_populates="transactions")

# backend/app/models/user.py
class User(Base):
    __tablename__ = "users"
    
    # ... existing fields
    
    # Relationships
    transactions = relationship("Transaction", back_populates="user")
    budget_plans = relationship("BudgetPlan", back_populates="user")
    accounts = relationship("Account", back_populates="user")
    categories = relationship("Category", back_populates="user")
    # ... etc
```

### Phase 3: Backend Query Modifications (3-4 hours)

#### 3.1 Update All Query Endpoints
```python
# BEFORE (insecure - returns all data)
@router.get("/transactions")
async def get_transactions(db: Session = Depends(get_db)):
    transactions = db.query(Transaction).all()
    return transactions

# AFTER (secure - filtered by user)
@router.get("/transactions")
async def get_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).all()
    return transactions
```

#### 3.2 Files Requiring Query Updates
```
backend/app/api/
├── transactions.py      (~15 queries)
├── budget_plans.py      (~13 queries)
├── accounts.py          (~10 queries)
├── categories.py        (~8 queries)
├── credit_cards.py      (~12 queries)
├── loans.py             (~11 queries)
├── quick_templates.py   (~4 queries)
├── transfers.py         (~4 queries)
├── dashboard.py         (~8 queries)
├── analysis.py          (~3 queries)
└── data_management.py   (~2 queries - special handling)
```

**Total Estimated Queries to Update:** ~90 queries

#### 3.3 Create Operations (INSERT)
```python
# Automatically set user_id on create
@router.post("/transactions")
async def create_transaction(
    transaction_data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_transaction = Transaction(
        **transaction_data.dict(),
        user_id=current_user.id  # Automatically assign
    )
    db.add(new_transaction)
    db.commit()
    return new_transaction
```

#### 3.4 Update/Delete Operations
```python
# Verify ownership before update/delete
@router.put("/transactions/{transaction_id}")
async def update_transaction(
    transaction_id: int,
    updates: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id  # Ownership check
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Apply updates...
```

### Phase 4: Special Considerations (1 hour)

#### 4.1 Categories: Shared vs Personal
**Decision:** Categories can be **personal** (user-specific) or **global** (system-provided)

```python
class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # NULL = global
    is_system = Column(Boolean, default=False)  # System categories
    # ...

# Query: Show user's categories + global categories
def get_categories(user_id: int):
    return db.query(Category).filter(
        or_(
            Category.user_id == user_id,
            Category.is_system == True
        )
    ).all()
```

#### 4.2 Billing Cycles: Shared Configuration
**Decision:** Billing cycles remain **global** (shared by all users)

```python
# No user_id needed - all users share billing cycle configuration
class BillingCycle(Base):
    __tablename__ = "billing_cycles"
    # No user_id column
```

**Alternative:** If users need custom cycles, add user_id and allow override.

#### 4.3 Data Management: Admin Operations
```python
# Clear ALL data (admin only)
@router.delete("/data/clear-all")
async def clear_all_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)  # Admin only
):
    # Option 1: Clear only requesting user's data
    db.query(Transaction).filter(Transaction.user_id == current_user.id).delete()
    
    # Option 2: Admin can clear ALL users' data (dangerous)
    if current_user.is_admin:
        db.query(Transaction).delete()
```

#### 4.4 Demo Mode
```python
# Load demo data for specific user
@router.post("/data/load-demo")
async def load_demo_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Create demo transactions for THIS user only
    demo_transactions = [
        Transaction(user_id=current_user.id, amount=100, ...),
        Transaction(user_id=current_user.id, amount=200, ...),
    ]
    db.add_all(demo_transactions)
    db.commit()
```

### Phase 5: Testing (2 hours)

#### 5.1 Unit Tests
```python
def test_user_can_only_see_own_transactions():
    # Create two users
    user1 = create_user("user1@test.com")
    user2 = create_user("user2@test.com")
    
    # Create transactions for each
    tx1 = create_transaction(user_id=user1.id, amount=100)
    tx2 = create_transaction(user_id=user2.id, amount=200)
    
    # User 1 should only see their transaction
    user1_txs = get_transactions(user_id=user1.id)
    assert len(user1_txs) == 1
    assert user1_txs[0].id == tx1.id
    
    # User 2 should only see their transaction
    user2_txs = get_transactions(user_id=user2.id)
    assert len(user2_txs) == 1
    assert user2_txs[0].id == tx2.id
```

#### 5.2 Integration Tests
```python
def test_cannot_update_other_users_transaction():
    user1 = create_user("user1@test.com")
    user2 = create_user("user2@test.com")
    
    tx = create_transaction(user_id=user1.id, amount=100)
    
    # User 2 tries to update User 1's transaction
    response = client.put(
        f"/api/transactions/{tx.id}",
        json={"amount": 999},
        headers={"Authorization": f"Bearer {user2_token}"}
    )
    
    assert response.status_code == 404  # Not found (ownership check)
```

#### 5.3 Manual Testing Checklist
```
[ ] User A creates transaction → User B cannot see it
[ ] User A creates budget → User B cannot see it
[ ] User A creates account → User B cannot see it
[ ] User B tries to update User A's transaction → 404 error
[ ] User B tries to delete User A's budget → 404 error
[ ] Dashboard shows only current user's data
[ ] Analysis page shows only current user's data
[ ] Demo mode loads data for current user only
[ ] Admin can see stats across all users (if needed)
```

### Phase 6: Frontend Updates (Optional - 30 minutes)

```typescript
// Most frontend code requires NO changes
// All filtering happens in backend

// Optional: Show user info in header
<div className="user-info">
  Viewing data for: {currentUser.email}
</div>

// Optional: Admin view to switch between users (future)
{currentUser.isAdmin && (
  <UserSelector onChange={switchUser} />
)}
```

---

## Migration Script Template

```python
# backend/migrate_add_multitenancy.py
"""
Migration: Add multi-tenancy support
Adds user_id to all tenant-scoped tables
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from app.models.user import User
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_dev")

def add_multitenancy():
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Get primary user (ninrauzer@gmail.com)
        result = conn.execute(text("SELECT id FROM users WHERE email = 'ninrauzer@gmail.com'"))
        primary_user_id = result.scalar()
        
        print(f"Primary user ID: {primary_user_id}")
        
        # Add user_id columns
        tables = [
            'transactions', 'budget_plans', 'accounts', 'categories',
            'credit_cards', 'credit_card_statements', 'credit_card_installments',
            'loans', 'loan_payments', 'quick_templates', 'transfers'
        ]
        
        for table in tables:
            print(f"\n[{table}] Adding user_id column...")
            
            # Add column (nullable first)
            conn.execute(text(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)"))
            
            # Assign existing data to primary user
            conn.execute(text(f"UPDATE {table} SET user_id = {primary_user_id} WHERE user_id IS NULL"))
            
            # Make NOT NULL
            conn.execute(text(f"ALTER TABLE {table} ALTER COLUMN user_id SET NOT NULL"))
            
            # Add index
            conn.execute(text(f"CREATE INDEX IF NOT EXISTS idx_{table}_user_id ON {table}(user_id)"))
            
            print(f"✅ {table} migrated")
        
        conn.commit()
        print("\n✅ Multi-tenancy migration complete!")

if __name__ == "__main__":
    add_multitenancy()
```

---

## Performance Considerations

### Query Performance
- **Impact:** Minimal (indexed foreign key)
- **Typical query time:** +0.1-0.5ms per query
- **Mitigation:** Proper indexing on user_id columns

### Database Size
- **Impact:** +4 bytes per row (INTEGER user_id)
- **Example:** 10,000 transactions = ~40 KB additional storage
- **Negligible for typical usage**

### Connection Pooling
- No impact (same database, same connection pool)

---

## Security Considerations

### Defense in Depth
1. **Application Layer:** Explicit user_id filtering in queries
2. **Database Layer:** Foreign key constraints prevent orphaned data
3. **OAuth Layer:** JWT token validation (existing - ADR-005)
4. **Admin Layer:** Whitelist prevents unauthorized access (existing - ADR-005)

### Audit Trail
```python
# Track who created/modified records
class Transaction(Base):
    created_by = Column(Integer, ForeignKey("users.id"))  # Same as user_id
    modified_by = Column(Integer, ForeignKey("users.id"))
    modified_at = Column(DateTime)
```

### Backup Strategy
```bash
# Per-user backup
pg_dump -t transactions --where="user_id=1" budgetapp > user1_backup.sql

# Restore user data
psql budgetapp < user1_backup.sql
```

---

## Rollback Plan

If multi-tenancy causes issues:

```sql
-- Remove user_id columns (data loss!)
ALTER TABLE transactions DROP COLUMN user_id;
ALTER TABLE budget_plans DROP COLUMN user_id;
-- ... etc

-- Or revert to single user filtering
UPDATE transactions SET user_id = 1;  -- Assign all to admin
```

**Note:** Rollback after users have created separate data will cause **DATA LOSS**.

---

## Success Metrics

- ✅ All queries filtered by user_id
- ✅ Users cannot see/modify other users' data
- ✅ No performance degradation (< 5% query time increase)
- ✅ Zero data leakage in security audit
- ✅ All tests passing

---

## Timeline and Effort

| Phase | Duration | Complexity |
|-------|----------|------------|
| 1. Database Schema | 1-2 hours | Low |
| 2. Model Updates | 1 hour | Low |
| 3. Query Modifications | 3-4 hours | Medium |
| 4. Special Cases | 1 hour | Medium |
| 5. Testing | 2 hours | High |
| 6. Frontend (optional) | 0.5 hours | Low |
| **Total** | **8-10 hours** | **Medium** |

---

## Related ADRs

- **ADR-005:** OAuth Authentication & User Whitelist (prerequisite)
- **ADR-007:** (Future) User Roles & Permissions
- **ADR-008:** (Future) Data Sharing Between Users

---

## References

- [Multi-Tenancy Patterns (Microsoft)](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/considerations/tenancy-models)
- [PostgreSQL Row-Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [SQLAlchemy Hybrid Attributes](https://docs.sqlalchemy.org/en/14/orm/extensions/hybrid.html)

---

## Appendix: Affected Files Checklist

```
backend/app/models/
├── transaction.py          [ ] Add user_id
├── budget_plan.py          [ ] Add user_id
├── account.py              [ ] Add user_id
├── category.py             [ ] Add user_id
├── credit_card.py          [ ] Add user_id
├── loan.py                 [ ] Add user_id
├── quick_template.py       [ ] Add user_id
└── user.py                 [ ] Add relationships

backend/app/api/
├── transactions.py         [ ] Filter queries (15 endpoints)
├── budget_plans.py         [ ] Filter queries (13 endpoints)
├── accounts.py             [ ] Filter queries (10 endpoints)
├── categories.py           [ ] Filter queries (8 endpoints)
├── credit_cards.py         [ ] Filter queries (12 endpoints)
├── loans.py                [ ] Filter queries (11 endpoints)
├── quick_templates.py      [ ] Filter queries (4 endpoints)
├── transfers.py            [ ] Filter queries (4 endpoints)
├── dashboard.py            [ ] Filter queries (8 endpoints)
├── analysis.py             [ ] Filter queries (3 endpoints)
└── data_management.py      [ ] Special handling (2 endpoints)

backend/
├── migrate_add_multitenancy.py  [ ] Create migration script
└── tests/                       [ ] Add multi-tenancy tests
```

---

**Status:** Ready for implementation when multiple real users are needed.  
**Blocker:** None (OAuth authentication is prerequisite - already completed).  
**Owner:** TBD
