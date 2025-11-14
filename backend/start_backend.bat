@echo off
cd /d E:\Desarrollo\BudgetApp\backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
