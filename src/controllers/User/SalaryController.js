const Salary = require('../../models/User/Salary');
const Branch = require('../../models/Branch/Branch');
const Employee = require('../../models/User/User');
const i18n = require('../../config/i18nConfig');



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

  // Check if branch_id is valid
  Branch.getById(salaryData.branch_id, (err, branchResult) => {
    if (err || branchResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.branch_id') });
    }

    // Check if employee_id is valid
    Employee.getById(salaryData.employee_id, (err, employeeResult) => {
      if (err || employeeResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.employee_id') });
      }

      Salary.create(salaryData, (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: i18n.__('messages.error_creating_salary') });
        }

        Branch.decreaseWallet(salaryData.branch_id, salaryData.amount, (err, updateResult) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: i18n.__('messages.error_updating_branch_wallet') });
          }
          res.status(201).json({ message: i18n.__('messages.salary_created'), id: result.insertId });
        });
      });
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

// Get Salaries by Date Range
exports.filterSalaries = (req, res) => {
  const { startDate, endDate, employee_id, branch_id } = req.query;

 // console.log('filterSalaries endpoint hit', req.query);

  if (!startDate && !endDate) {
    return res.status(400).json({ error: i18n.__('validation.required.date_range') });
  }

  Salary.filterByParams(startDate, endDate, employee_id, branch_id, (err, results) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_salaries') });
    // Instead of 404, always return 200 with empty array
    res.status(200).json({ message: i18n.__('messages.salaries_found', { count: results.length }), salaries: results });
  });
};

// Update Salary
exports.updateSalary = (req, res) => {
  const { id } = req.params;
  const { employee_id, amount, salary_period_start, salary_period_end, note, user_id, branch_id } = req.body;

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

  Branch.getById(branch_id, (err, branchResult) => {
    if (err || branchResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.branch_id') });
    }

    Employee.getById(employee_id, (err, employeeResult) => {
      if (err || employeeResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.employee_id') });
      }

      const salaryData = { employee_id, amount: Number(amount), salary_period_start, salary_period_end, note, user_id, branch_id };

      Salary.getById(id, (err, existingSalary) => {
        if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_salary') });
        if (existingSalary.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.salary_not_found') });

        const oldSalary = existingSalary[0];
        const oldAmount = Number(oldSalary.amount);
        const newAmount = Number(salaryData.amount);
        const oldBranchId = oldSalary.branch_id;
        const newBranchId = salaryData.branch_id;

        Salary.update(id, salaryData, (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: i18n.__('messages.error_updating_salary') });
          }
          if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.salary_not_found') });

          if (oldBranchId !== newBranchId) {
            // Increase old branch wallet, decrease new branch wallet
            Branch.increaseWallet(oldBranchId, oldAmount, (err) => {
              if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_branch_wallet') });
              Branch.decreaseWallet(newBranchId, newAmount, (err) => {
                if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_branch_wallet') });
                res.status(200).json({ message: i18n.__('messages.salary_updated') });
              });
            });
          } else if (oldAmount !== newAmount) {
            // Only adjust the difference
            const amountDifference = newAmount - oldAmount;
            Branch.decreaseWallet(newBranchId, amountDifference, (err) => {
              if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_branch_wallet') });
              res.status(200).json({ message: i18n.__('messages.salary_updated') });
            });
          } else {
            res.status(200).json({ message: i18n.__('messages.salary_updated') });
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

    Salary.deleteSoft(salaryId, (err, deleteResult) => {
      if (err) return res.status(500).json({ error: i18n.__('messages.error_deleting_salary') });
      if (deleteResult.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.salary_not_found') });

      Branch.increaseWallet(salaryData.branch_id, Number(salaryData.amount), (err, updateResult) => {
        if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_branch_wallet') });
        res.status(200).json({ message: i18n.__('messages.salary_deleted') });
      });
    });
  });
};