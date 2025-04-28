const Salary = require('../../models/User/Salary');
const Branch = require('../../models/Branch/Branch');
const Employee = require('../../models/User/User'); // Ensure this is correctly imported
const i18n = require('../../config/i18nConfig'); // Import i18n for localization


// Create Salary
exports.createSalary = (req, res) => {
  const salaryData = req.body;

    // Validate required fields
    if (!salaryData.employee_id) {
      return res.status(400).json({ error: i18n.__('validation.required.employee_id') });
    }
    if (!salaryData.amount) {
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
    if (err) return res.status(500).json({ error: i18n.__('messages.error_creating_salary') });

    Branch.decreaseWallet(salaryData.branch_id, salaryData.amount, (err, updateResult) => {
      if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_branch_wallet') });
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
exports.getSalariesByDateRange = (req, res) => {
  const { startDate, endDate, employee_id } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: i18n.__('validation.required.date_range') });
  }

  Salary.getByDateRange(startDate, endDate, employee_id, (err, results) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_salaries') });
    if (results.length === 0) {
      return res.status(404).json({ message: i18n.__('messages.no_salaries_found') });
    }
    res.status(200).json({ message: i18n.__('messages.salaries_found', { count: results.length }), salaries: results });
  });
};


// Update Salary
exports.updateSalary = (req, res) => {
  const { id } = req.params;
  const { employee_id, amount,salary_period_start,salary_period_end,note,user_id, branch_id } = req.body;

   // Validate required fields
   if (!employee_id) {
    return res.status(400).json({ error: i18n.__('validation.required.employee_id') });
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

    // Check if employee_id is valid
    Employee.getById(employee_id, (err, employeeResult) => {
      if (err || employeeResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.employee_id') });
      }

       // Update salary
    const salaryData = { employee_id, amount,salary_period_start,salary_period_end,note,user_id, branch_id };

  // Retrieve the existing salary details
  Salary.getById(id, (err, existingSalary) => {
    if (err) return res.status(500).json({ error: i18n.__('messages.error_fetching_salary') });
        if (existingSalary.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.salary_not_found') });

    const oldSalary = existingSalary[0];
    const oldAmount = oldSalary.amount;
    const newAmount = salaryData.amount;
    const amountDifference = newAmount - oldAmount;

    // Update the salary details
    Salary.update(id, salaryData, (err, result) => {
      if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_salary') });
      if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.salary_not_found') });

      // Adjust the Branch wallet based on the amount difference
      if (amountDifference !== 0) {
        Branch.decreaseWallet(salaryData.branch_id, amountDifference, (err, updateResult) => {
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

      Branch.increaseWallet(salaryData.branch_id, salaryData.amount, (err, updateResult) => {
        if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_branch_wallet') });
        res.status(200).json({ message: i18n.__('messages.salary_deleted') });
      });
    });

  });
};
