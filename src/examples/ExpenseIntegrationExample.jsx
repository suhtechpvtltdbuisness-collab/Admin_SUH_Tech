/**
 * Example: How to integrate CompanyExpenses component with the API
 *
 * Replace the mock data in CompanyExpenses.jsx with this pattern:
 */

import React, { useState, useEffect } from "react";
import { authService, employeeService } from "../services";

const CompanyExpensesExample = () => {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: "",
    category: "Misc",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "Bank Transfer",
    status: "Pending",
    description: "",
  });

  // Fetch expenses on component mount
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const response = await api.getExpenses();
      setExpenses(response.expenses || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      alert("Failed to load expenses: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const expenseData = {
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        date: newExpense.date ? new Date(newExpense.date) : new Date(),
      };

      const response = await api.createExpense(expenseData);
      setExpenses([response.expense, ...expenses]);
      setIsAddModalOpen(false);
      setNewExpense({
        title: "",
        category: "Misc",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        paymentMethod: "Bank Transfer",
        status: "Pending",
        description: "",
      });
    } catch (error) {
      console.error("Error creating expense:", error);
      alert("Failed to create expense: " + error.message);
    }
  };

  const handleUpdateExpense = async (id, data) => {
    try {
      const response = await api.updateExpense(id, data);
      setExpenses(
        expenses.map((exp) => (exp._id === id ? response.expense : exp)),
      );
    } catch (error) {
      console.error("Error updating expense:", error);
      alert("Failed to update expense: " + error.message);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }
    try {
      await api.deleteExpense(id);
      setExpenses(expenses.filter((exp) => exp._id !== id));
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense: " + error.message);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format amount for display
  const formatAmount = (amount) => {
    const num = Number(amount);
    return `₹${isNan(amount).toLocaleString("en-IN")}`;
  };

  if (isLoading) {
    return <div>Loading expenses...</div>;
  }

  return (
    <div>
      {/* Your existing JSX, but use expenses from state */}
      {/* Map expenses: expenses.map(expense => ...) */}
      {/* Use expense._id instead of expense.id */}
      {/* Use formatDate(expense.date) and formatAmount(expense.amount) for display */}
    </div>
  );
};

export default CompanyExpensesExample;

/**
 * Similar pattern for other components:
 * - Invoices: use api.getInvoices(), api.createInvoice(), etc.
 * - Sales: use api.getSales(), api.createSale(), etc.
 * - Employee Salary: use api.getEmployeeSalaries(), api.createEmployeeSalary(), etc.
 */
