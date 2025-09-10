# Finance Dashboard

A modern, responsive finance dashboard built with **React**, **TypeScript**, **Tailwind CSS**, and **Recharts**, featuring real-time transaction management, budget tracking, and goal setting.

---

## Features

### 💰 Transaction Management

- **TransactionTable**: View all transactions with search and filters.
- **AddTransactionForm**: Add new transactions via a **Modal**.
- Editable and deletable transactions.
- Real-time updates; all computations derived from `transactions` state.

### 📊 Analytics & Visualization

- **StatCard**: Quick overview of income, expenses, and balance.
- **SpendingTrendChart**: Visualize spending trends over time using **Recharts LineChart**.
- **PieChart**: Category-wise breakdown of expenses.

### 📈 Budget Tracking

- Set budget limits per category.
- **BudgetBar**: Visualize progress and warnings with conditional styling.
- Over-budget alerts for categories exceeding limits.

### 🎯 Goal Setting

- Set financial goals with target amount and deadline.
- **GoalProgress**: Shows progress percentage, countdown to deadline, and progress bar.

### 🧑‍🎨 Modern UI & UX

- Built with **Tailwind CSS** and gradient themes.
- Smooth transitions using **Framer Motion** or Tailwind classes.
- Responsive layout for mobile, tablet, and desktop.
- **FAB (Floating Action Button)** for adding new transactions.

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/finance-dashboard.git
cd finance-dashboard
Install dependencies:
npm install
npm run dev
Open http://localhost:3000 in your browser.


Technologies Used
React + TypeScript

Tailwind CSS

Framer Motion

Recharts

Local state management (React useState, useReducer)

Future Improvements
Persist transactions with localStorage or backend.

Add authentication for multiple users.

Export transactions to CSV or PDF.

```
