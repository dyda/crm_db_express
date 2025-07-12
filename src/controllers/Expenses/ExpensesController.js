const Expense = require('../../models/Expenses/Expenses');
const Branch = require('../../models/Branch/Branch');
const { convertToBaseCurrency } = require('../../components/helpers');
const Currency = require('../../models/Currency/Currency');
const i18n = require('../../config/i18nConfig');

// Create Expense
exports.createExpense = async (req, res) => {
  const { employee_id, category_id, name, amount, note, branch_id, user_id, expense_date, currency_id } = req.body;

  // Validate required fields
  if (!employee_id) return res.status(400).json({ error: i18n.__('validation.required.employee_id') });
  if (!category_id) return res.status(400).json({ error: i18n.__('validation.required.expense_category_id') });
  if (!name) return res.status(400).json({ error: i18n.__('validation.required.expense_name') });
  if (!amount) return res.status(400).json({ error: i18n.__('validation.required.amount') });
  if (!branch_id) return res.status(400).json({ error: i18n.__('validation.required.branch_id') });
  if (!expense_date) return res.status(400).json({ error: i18n.__('validation.required.expense_date') });
  if (!currency_id) return res.status(400).json({ error: i18n.__('validation.required.currency_id') });

  Branch.getById(branch_id, async (err, branchResult) => {
    if (err || branchResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.branch_id') });
    }

    try {
      const { amountInBase, exchange_rate } = await convertToBaseCurrency(amount, currency_id);

      if (!exchange_rate || exchange_rate === 0) {
        return res.status(400).json({ error: 'Exchange rate cannot be zero' });
      }

      const expenseData = {
        employee_id,
        category_id,
        name,
        amount: parseFloat(amount),
        note,
        branch_id,
        user_id,
        expense_date,
        currency_id,
        exchange_rate: parseFloat(exchange_rate)
      };

      Expense.create(expenseData, (err, result) => {
        if (err) {
          return res.status(500).json({ error: i18n.__('messages.error_creating_expense') });
        }
        Branch.decreaseWallet(branch_id, amountInBase, (err) => {
          if (err) {
            return res.status(500).json({ error: i18n.__('messages.error_decreasing_wallet') });
          }
          res.status(201).json({ message: i18n.__('messages.expense_created'), id: result.insertId });
        });
      });
    } catch (err) {
      return res.status(400).json({ error: 'Currency conversion failed: ' + err });
    }
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

  // Optional: Only block if no filters at all
  if (
    !filters.id &&
    !filters.startDate &&
    !filters.endDate &&
    !filters.category_id &&
    !filters.name &&
    !filters.note &&
    !filters.employee_id &&
    !filters.branch_id &&
    !filters.currency_id
  ) {
    return res.status(400).json({ error: i18n.__('validation.required.at_least_one_filter') });
  }

  Expense.getByFilters(filters, (err, data) => {
    if (err) return res.status(500).json({ error: req.__('messages.error_fetching_expenses') });
    res.status(200).json({
      expenses: data.results,
      total: data.total,
    });
  });
};

// Update Expense
exports.updateExpense = (req, res) => {
  const { id } = req.params;
  const { employee_id, category_id, name, amount, note, branch_id, user_id, expense_date, currency_id } = req.body;

  // Validate required fields
  if (!employee_id) return res.status(400).json({ error: i18n.__('validation.required.employee_id') });
  if (!category_id) return res.status(400).json({ error: i18n.__('validation.required.expense_category_id') });
  if (!name) return res.status(400).json({ error: i18n.__('validation.required.expense_name') });
  if (!amount) return res.status(400).json({ error: i18n.__('validation.required.amount') });
  if (!branch_id) return res.status(400).json({ error: i18n.__('validation.required.branch_id') });
  if (!expense_date) return res.status(400).json({ error: i18n.__('validation.required.expense_date') });
  if (!currency_id) return res.status(400).json({ error: i18n.__('validation.required.currency_id') });

  Branch.getById(branch_id, (err, branchResult) => {
    if (err || branchResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.branch_id') });
    }

    Expense.getById(id, async (err, existingExpense) => {
      if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_expense') });
      if (existingExpense.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.expense_not_found') });

      const oldExpense = existingExpense[0];

      try {
        // --- Calculate old amount in base currency using the stored exchange_rate ---
        let oldAmountInBase;
        if (Number(oldExpense.currency_id) === Number(currency_id)) {
          // Same currency, use stored exchange_rate for old, and new rate for new
          if (!oldExpense.exchange_rate || Number(oldExpense.exchange_rate) === 0) {
            return res.status(400).json({ error: 'Stored exchange rate cannot be zero' });
          }
          oldAmountInBase = parseFloat(oldExpense.amount) / parseFloat(oldExpense.exchange_rate);
        } else {
          // Different currency, use stored exchange_rate for old
          if (!oldExpense.exchange_rate || Number(oldExpense.exchange_rate) === 0) {
            return res.status(400).json({ error: 'Stored exchange rate cannot be zero' });
          }
          oldAmountInBase = parseFloat(oldExpense.amount) / parseFloat(oldExpense.exchange_rate);
        }

        // --- Calculate new amount in base currency using the current exchange_rate ---
        const { amountInBase: newAmountInBase, exchange_rate } = await convertToBaseCurrency(amount, currency_id);

        if (!exchange_rate || exchange_rate === 0) {
          return res.status(400).json({ error: 'Exchange rate cannot be zero' });
        }

        const amountDifference = newAmountInBase - oldAmountInBase;

        const expenseData = {
          employee_id,
          category_id,
          name,
          amount: parseFloat(amount),
          note,
          branch_id,
          user_id,
          expense_date,
          currency_id,
          exchange_rate: parseFloat(exchange_rate)
        };

        Expense.update(id, expenseData, (err, result) => {
          if (err) {
            return res.status(500).json({ error: i18n.__('messages.error_updating_expense') });
          }
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: i18n.__('validation.invalid.expense_not_found') });
          }
          // Adjust the wallet amount in the branch
          if (amountDifference !== 0) {
            Branch.decreaseWallet(branch_id, amountDifference, (err) => {
              if (err) return res.status(500).json({ error: i18n.__('messages.error_decreasing_wallet') });
              res.status(200).json({ message: i18n.__('messages.expense_updated') });
            });
          } else {
            res.status(200).json({ message: i18n.__('messages.expense_updated') });
          }
        });
      } catch (err) {
        return res.status(400).json({ error: 'Currency conversion failed: ' + err });
      }
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

    // Use the exchange_rate stored in the expense record
    let amountInBase;
    if (Number(expenseData.exchange_rate) && Number(expenseData.exchange_rate) !== 1) {
      if (Number(expenseData.exchange_rate) === 0) {
        return res.status(400).json({ error: 'Exchange rate cannot be zero' });
      }
      amountInBase = parseFloat(expenseData.amount) / parseFloat(expenseData.exchange_rate);
    } else {
      amountInBase = parseFloat(expenseData.amount);
    }

    Expense.deleteSoft(expenseId, (err, deleteResult) => {
      if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_expense') });
      if (deleteResult.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.expense_not_found') });

      Branch.increaseWallet(expenseData.branch_id, amountInBase, (err) => {
        if (err) return res.status(500).json({ error: i18n.__('messages.error_increasing_wallet') });
        res.status(200).json({ message: i18n.__('messages.expense_deleted') });
      });
    });
  });
};