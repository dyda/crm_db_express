const Expense = require('../../models/Expenses/Expenses');
const Branch = require('../../models/Branch/Branch');
const i18n = require('../../config/i18nConfig'); // Import i18n for localization


// Create Expense
exports.createExpense = (req, res) => {
  const { employee_id, category_id, name, amount, note, branch_id, user_id } = req.body;

  // Validate required fields
  if (!employee_id) {
    return res.status(400).json({ error: i18n.__('validation.required.employee_id') });
  }
  if (!category_id) {
    return res.status(400).json({ error: i18n.__('validation.required.expense_category_id') });
  }
  if (!name) {
    return res.status(400).json({ error: i18n.__('validation.required.expense_name') });
  }
  if (!amount) {
    return res.status(400).json({ error: i18n.__('validation.required.amount') });
  }
  if (!branch_id) {
    return res.status(400).json({ error: i18n.__('validation.required.branch_id') });
  }

  // Check if branch_id is valid
  Branch.getById(branch_id, (err, branchResult) => {
    if (err || branchResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.branch_id') });
    }

  // Prepare data for saving
  const expenseData = { employee_id, category_id, name, amount, note, branch_id, user_id };

  // Create expense
  Expense.create(expenseData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_creating_expense') });
    }

    // Decrease wallet amount in the branch
    Branch.decreaseWallet(branch_id, amount, (err, updateResult) => {
      if (err) {
        return res.status(500).json({ error: i18n.__('messages.error_decreasing_wallet') });
      }
      res.status(201).json({ message: i18n.__('messages.expense_created'), id: result.insertId });
    });
  });
});
};

// Get All Expenses
exports.getAllExpenses = (req, res) => {
  Expense.getAll((err, results) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_expenses') });
    }
    res.status(200).json(results);
  });
};

// Get Expense by ID
exports.getExpenseById = (req, res) => {
  const { id } = req.params;
  Expense.getById(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_expense') });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: i18n.__('validation.invalid.expense_not_found') });
    }
    res.status(200).json(result[0]);
  });
};

// Get Expenses by Filters
exports.getExpensesByFilters = (req, res) => {
  const filters = req.query;

  // Validate required filters
  if (!filters.id && (!filters.startDate || !filters.endDate)) {
    return res.status(400).json({ error: i18n.__('validation.required.start_and_end_date_or_id') });
  }

  Expense.getByFilters(filters, (err, results) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_expenses') });
    if (results.length === 0) {
      return res.status(404).json({ message: i18n.__('messages.no_expenses_found') });
    }
    res.status(200).json({
      message: i18n.__('messages.expenses_found', { count: results.length }),
      expenses: results
    });
  });
};


// Update Expense
exports.updateExpense = (req, res) => {

  const { id } = req.params;
  const { employee_id, category_id, name, amount, note, branch_id, user_id } = req.body;

   // Validate required fields
  if (!employee_id) {
    return res.status(400).json({ error: i18n.__('validation.required.employee_id') });
  }
  if (!category_id) {
    return res.status(400).json({ error: i18n.__('validation.required.expense_category_id') });
  }
  if (!name) {
    return res.status(400).json({ error: i18n.__('validation.required.expense_name') });
  }
  if (!amount) {
    return res.status(400).json({ error: i18n.__('validation.required.amount') });
  }
  if (!branch_id) {
    return res.status(400).json({ error: i18n.__('validation.required.branch_id') });
  }

  // Check if branch_id is valid
  Branch.getById(branch_id, (err, branchResult) => {
    if (err || branchResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.branch_id') });
    }

   // Prepare data for updating
   const expenseData = { employee_id, category_id, name, amount, note, branch_id, user_id };


  // Retrieve the existing expense details
  Expense.getById(id, (err, existingExpense) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_expense') });
    if (existingExpense.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.expense_not_found') });

    const oldExpense = existingExpense[0];
    const oldAmount = oldExpense.amount;
    const newAmount = expenseData.amount;
    const amountDifference = newAmount - oldAmount;

    // Update the expense details
    Expense.update(id, expenseData, (err, result) => {

      if (err) {
        return res.status(500).json({ error: i18n.__('messages.error_updating_expense') });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: i18n.__('validation.invalid.expense_not_found') });
      }
     // Adjust the wallet amount in the branch
     if (amountDifference !== 0) {
      Branch.decreaseWallet(branch_id, amountDifference, (err, updateResult) => {
        if (err) return res.status(500).json({ error: i18n.__('messages.error_decreasing_wallet') });
        res.status(200).json({ message: i18n.__('messages.expense_updated') });
      });
    } else {
      res.status(200).json({ message: i18n.__('messages.expense_updated') });
    }
    });
  });
});

};

// Delete Expense
exports.deleteExpense = (req, res) => {
  const expenseId = req.params.id;
  Expense.getById(expenseId, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_expense') });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.expense_not_found') });

    const expenseData = result[0];

    Expense.deleteSoft(expenseId, (err, deleteResult) => {
      if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_expense') });
      if (deleteResult.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.expense_not_found') });

      Branch.increaseWallet(expenseData.branch_id, expenseData.amount, (err, updateResult) => {
        if (err) return res.status(500).json({ error: i18n.__('messages.error_increasing_wallet') });
        res.status(200).json({ message: i18n.__('messages.expense_deleted') });
      });
    });
  });
};
