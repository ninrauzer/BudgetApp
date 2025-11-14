# Design Specification – Crypto Light UI Kit

## 1. Overview

This document defines the foundational design specifications for the **Crypto Light Dashboard UI Kit**, ensuring consistency across all components, pages, and interactions within the React-based financial application.

The design style blends:

- Clean modern fintech aesthetics
- Light-mode optimized clarity
- Subtle gradients inspired by crypto dashboards
- High-contrast values for financial data
- Professional iconography and spacing



![ChatGPT Image 13 nov 2025, 18_19_41.png](E:\MyFiles\Descargas\ChatGPT%20Image%2013%20nov%202025,%2018_19_41.png)



---

## 2. Color System

### 2.1 Core Palette (Light Mode)

Background Base: #F8FAFE  
Surface / Cards: #FFFFFF  
Surface Soft: #F3F6FB  
Borders: #E5E7EB  
Text Primary: #111827  
Text Secondary: #6B7280  
Muted Text: #9CA3AF  

### 2.2 Brand & Action Colors

Primary Blue: #2D60FF  
Primary Blue Soft: #6AA9FF  
Primary Blue Gradient: linear-gradient(90deg, #2D60FF, #6AA9FF)

### 2.3 Financial Colors

Income: #00C48C  
Expense: #FF4D67  
Warning: #FACC15  
Info: #0EA5E9  

### 2.4 Category Colors

Food: #1E90FF  
Transport: #00BFA6  
Entertainment: #A347FF  
Services: #FFAA00  
Extra Income: #009B4D  

---

## 3. Typography

### 3.1 Font Family

Inter, sans-serif  
Weights: 400, 500, 600, 700

### 3.2 Type Scale

Display totals: 32–48px  
Page Titles: 26–30px  
Section Titles: 20–22px  
Card Titles: 16–18px  
Body: 16px  
Body Secondary: 14px  
Labels: 12–13px  

---

## 4. Spacing System

4, 8, 12, 16, 24, 32, 48, 64  

Cards padding: 24px  
Layout gutters: 32px  
Component gaps: 12–16px  

---

## 5. Border Radius

Buttons: 8px  
Inputs: 8px  
Cards: 12px  
Containers: 16px  
Progress bars: 10px  
Tags: 6–8px  

---

## 6. Shadows

XS: 0 1px 2px rgba(0,0,0,0.04)  
SM: 0 1px 4px rgba(0,0,0,0.06)  
LG: 0 4px 24px rgba(0,0,0,0.12)  

---

## 7. Components Specification

### 7.1 Buttons

Primary  
Background: #2D60FF  
Hover: #244DCC  
Text: #FFFFFF  

Secondary  
Background: #FFFFFF  
Border: #E5E7EB  
Hover: #F3F4F6  

Ghost  
Transparent, blue text, hover #EEF3FF  

---

### 7.2 Inputs

Background: #FFFFFF  
Border: #E5E7EB  
Focus: #2D60FF  
Padding: 10px 14px  
Radius: 8px  

---

### 7.3 Cards

Background: #FFFFFF  
Padding: 24px  
Radius: 12px  
Shadow: SM  

---

### 7.4 Category Tags

Background: #F3F6FB  
Padding: 4px 10px  
Radius: 8px  
Font: 12px / 500  

---

### 7.5 Progress Bars

Height: 12px  
Radius: 10px  
Background: #E5E7EB  
Foreground: category color  

---

### 7.6 Dashboard Layout

Sidebar | Header  
Sidebar | Page Title  
Sidebar | KPIs  
Sidebar | Charts  
Sidebar | Tables  

Max width: 1400px  

---

### 7.7 Sidebar Navigation

Width: 240px  
Background: #F8FAFE  
Active item: #E4E9FF, border-left 4px blue  
Hover: #EEF3FF  
Icons: Lucide / Heroicons  

---

### 7.8 Tables

Row height: 48–56px  
Hover: #F3F6FB  
Divider: #E5E7EB  
Financial positive: #00C48C  
Financial negative: #FF4D67  

---

### 7.9 Charts

Line chart: blue, 2.5px  
Area positive: rgba(0,196,140,0.25)  
Area negative: rgba(255,77,103,0.25)  
Donut: category colors  

---

## 8. Iconography

Lucide + Heroicons  
Sizes:
Sidebar: 20–22px  
Buttons: 18px  
Tags: 14px  
KPIs: 24px+  

Stroke width: 1.75–2px  

---

## 9. Interactions

Hover: slight shadow, slight brighten  
Focus: 2px blue outline  
Active: scale(0.98)  

---

## 10. Grid

12-column  
Gutters: 24px  
Max width: 1400px  

---

## 11. Accessibility

Contrast ≥ 4.5:1  
Visible focus rings  
Icons not color-only  
Min button height: 44px  

---

## 12. Deliverables

Figma file  
Components & variants  
Tokens  
SVG icons  
Final screens  
