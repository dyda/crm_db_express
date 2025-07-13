const Salary = require('../../models/Salary/Salary');
const Branch = require('../../models/Branch/Branch');
const Employee = require('../../models/User/User');
const i18n = require('../../config/i18nConfig');
const { convertToBaseCurrency } = require('../../components/helpers');

// Create Salary
exports.createSalary = (req, res) => {
  const salaryData = req.body;
  salaryData.amount = Number(salaryData.amount);

  // Validate required fields
  if (!salaryData.employee_id) {
    return res.status(400).json({ error: i18n.__('validation.required.employee_id') });
  }
  if (!salaryData.amount || isNaN(salaryData.amount)) {
    return res.status(400).json({ error: i18n.__('validation.required.amount') });
  }
  if (!salaryData.branch_id) {
    return res.status(400).json({ error: i18n.__('validation.required.branch_id') });
  }
  if (!salaryData.currency_id) {
    return res.status(400).json({ error: i18n.__('validation.required.currency_id') });
  }

  Branch.getById(salaryData.branch_id, (err, branchResult) => {
    if (err || branchResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.branch_id') });
    }

    Employee.getById(salaryData.employee_id, async (err, employeeResult) => {
      if (err || employeeResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.employee_id') });
      }

      try {
        const { amountInBase, exchange_rate } = await convertToBaseCurrency(salaryData.amount, salaryData.currency_id);

        if (!exchange_rate || exchange_rate === 0) {
          return res.status(400).json({ error: i18n.__('messages.exchange_rate_zero') });
        }

        salaryData.exchange_rate = parseFloat(exchange_rate);

        Salary.create(salaryData, (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: i18n.__('messages.error_creating_salary') });
          }

          Branch.decreaseWallet(salaryData.branch_id, amountInBase, (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ error: i18n.__('messages.error_updating_branch_wallet') });
            }
            res.status(201).json({ message: i18n.__('messages.salary_created'), id: result.insertId });
          });
        });
      } catch (err) {
        return res.status(400).json({ error: i18n.__('messages.currency_conversion_failed', { error: err }) });
      }
    });
  });
};

// Get All Salaries
exports.getAllSalaries = (req, res) => {
  Salary.getAll((err, results) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_salaries') });
    res.status(200).json(results);
  });
};

// Get Salary by ID
exports.getSalaryById = (req, res) => {
  const salaryId = req.params.id;
  Salary.getById(salaryId, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_salary') });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.salary_not_found') });
    res.status(200).json(result[0]);
  });
};

// Filter Salaries
exports.filterSalaries = (req, res) => {
  const { startDate, endDate, employee_id, branch_id, currency_id, sortBy, sortOrder, page, pageSize } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: i18n.__('validation.required.date_range') });
  }

  const filters = {
    startDate,
    endDate,
    employee_id,
    branch_id,
    currency_id,
    sortBy,
    sortOrder,
    page,
    pageSize
  };

  Salary.filterByParams(filters, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_salaries') });
    res.status(200).json({
      message: i18n.__('messages.salaries_found', { count: result.results.length }),
      salaries: result.results,
      total: result.total
    });
  });
};

// Update Salary
exports.updateSalary = (req, res) => {
  const { id } = req.params;
  const { employee_id, amount, salary_period_start, salary_period_end, note, user_id, branch_id, currency_id } = req.body;

  // Validate required fields
  if (!employee_id) {
    return res.status(400).json({ error: i18n.__('validation.required.employee_id') });
  }
  if (!amount || isNaN(Number(amount))) {
    return res.status(400).json({ error: i18n.__('validation.required.amount') });
  }
  if (!branch_id) {
    return res.status(400).json({ error: i18n.__('validation.required.branch_id') });
  }
  if (!currency_id) {
    return res.status(400).json({ error: i18n.__('validation.required.currency_id') });
  }

  Branch.getById(branch_id, (err, branchResult) => {
    if (err || branchResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.branch_id') });
    }

    Employee.getById(employee_id, async (err, employeeResult) => {
      if (err || employeeResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.employee_id') });
      }

      Salary.getById(id, async (err, existingSalary) => {
        if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_salary') });
        if (existingSalary.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.salary_not_found') });

        const oldSalary = existingSalary[0];
        const oldBranchId = oldSalary.branch_id;
        const newBranchId = branch_id;

        // Calculate old amount in base currency using stored exchange_rate
        let oldAmountInBase;
        if (Number(oldSalary.exchange_rate) && Number(oldSalary.exchange_rate) !== 1) {
          if (Number(oldSalary.exchange_rate) === 0) {
            return res.status(400).json({ error: i18n.__('messages.stored_exchange_rate_zero') });
          }
          oldAmountInBase = parseFloat(oldSalary.amount) / parseFloat(oldSalary.exchange_rate);
        } else {
          oldAmountInBase = parseFloat(oldSalary.amount);
        }

        // Calculate new amount in base currency using current exchange_rate
        let amountInBase, exchange_rate;
        try {
          const conversion = await convertToBaseCurrency(amount, currency_id);
          amountInBase = conversion.amountInBase;
          exchange_rate = conversion.exchange_rate;
        } catch (err) {
          return res.status(400).json({ error: i18n.__('messages.currency_conversion_failed', { error: err }) });
        }

        if (!exchange_rate || exchange_rate === 0) {
          return res.status(400).json({ error: i18n.__('messages.exchange_rate_zero') });
        }

        const salaryData = {
          employee_id,
          amount: Number(amount),
          salary_period_start,
          salary_period_end,
          note,
          user_id,
          branch_id,
          currency_id,
          exchange_rate: parseFloat(exchange_rate)
        };

        Salary.update(id, salaryData, (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: i18n.__('messages.error_updating_salary') });
          }
          if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.salary_not_found') });

          if (oldBranchId !== newBranchId) {
            // Increase old branch wallet, decrease new branch wallet
            Branch.increaseWallet(oldBranchId, oldAmountInBase, (err) => {
              if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_branch_wallet') });
              Branch.decreaseWallet(newBranchId, amountInBase, (err) => {
                if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_branch_wallet') });
                res.status(200).json({ message: i18n.__('messages.salary_updated') });
              });
            });
          } else {
            // Only adjust the difference
            const amountDifference = amountInBase - oldAmountInBase;
            if (amountDifference !== 0) {
              Branch.decreaseWallet(newBranchId, amountDifference, (err) => {
                if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_branch_wallet') });
                res.status(200).json({ message: i18n.__('messages.salary_updated') });
              });
            } else {
              res.status(200).json({ message: i18n.__('messages.salary_updated') });
            }
          }
        });
      });
    });
  });
};

// Delete Salary
exports.deleteSalary = (req, res) => {
  const salaryId = req.params.id;
  Salary.getById(salaryId, (err, result) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_salary') });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.salary_not_found') });

    const salaryData = result[0];

    // Use the exchange_rate stored in the salary record
    let amountInBase;
    if (Number(salaryData.exchange_rate) && Number(salaryData.exchange_rate) !== 1) {
      if (Number(salaryData.exchange_rate) === 0) {
        return res.status(400).json({ error: i18n.__('messages.exchange_rate_zero') });
      }
      amountInBase = parseFloat(salaryData.amount) / parseFloat(salaryData.exchange_rate);
    } else {
      amountInBase = parseFloat(salaryData.amount);
    }

    Salary.deleteSoft(salaryId, (err, deleteResult) => {
      if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_salary') });
      if (deleteResult.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.salary_not_found') });

      Branch.increaseWallet(salaryData.branch_id, amountInBase, (err) => {
        if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_branch_wallet') });
        res.status(200).json({ message: i18n.__('messages.salary_deleted') });
      });
    });
  });
};