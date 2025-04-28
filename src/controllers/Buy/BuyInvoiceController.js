const BuyInvoice = require('../../models/Buy/BuyInvoice');
const Customer = require('../../models/Customer/Customer');
const Branch = require('../../models/Branch/Branch');
const Warehouse = require('../../models/Warehouse/Warehouse');
const Employee = require('../../models/User/User');
const i18n = require('../../config/i18nConfig');

// Helper function to validate required fields
const validateRequiredFields = (fields) => {
  const { type, customer_id, branch_id, warehouse_id, employee_id } = fields;
  if (!type) {
    return i18n.__('validation.required.type');
  }
  if (!customer_id) {
    return i18n.__('validation.required.customer_id');
  }
  if (!branch_id) {
    return i18n.__('validation.required.branch_id');
  }
  if (!warehouse_id) {
    return i18n.__('validation.required.warehouse_id');
  }
  if (!employee_id) {
    return i18n.__('validation.required.employee_id');
  }
  return null;
};

// Create Buy Invoice
exports.createInvoice = (req, res) => {
  const { type, invoice_number, invoice_date, total_amount, tax_amount, due_date, customer_id, branch_id, warehouse_id, employee_id, note } = req.body;

  // Validate required fields
  const validationError = validateRequiredFields(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  // Check if customer_id, warehouse_id, branch_id, and employee_id are valid
  Customer.getById(customer_id, (err, customerResult) => {
    if (err || customerResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.customer_id') });
    }

    Warehouse.getById(warehouse_id, (err, warehouseResult) => {
      if (err || warehouseResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.warehouse_id') });
      }

      Branch.getById(branch_id, (err, branchResult) => {
        if (err || branchResult.length === 0) {
          return res.status(400).json({ error: i18n.__('validation.invalid.branch_id') });
        }

        Employee.getById(employee_id, (err, employeeResult) => {
          if (err || employeeResult.length === 0) {
            return res.status(400).json({ error: i18n.__('validation.invalid.employee_id') });
          }

          // Create buy invoice record
          const invoiceData = { type, invoice_number, invoice_date, total_amount, tax_amount, due_date, customer_id, branch_id, warehouse_id, employee_id, note };
         
         
          BuyInvoice.create(invoiceData, (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            // Handle wallet or loan adjustment based on type
            if (type === 'direct' || type === 'cash') {
              Branch.decreaseWallet(branch_id, total_amount, (err) => {
                if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_branch_wallet') });
                res.status(201).json({ message: i18n.__('messages.invoice_created'), id: result.insertId });
              });
            } else if (type === 'loan') {
              Customer.decreaseLoan(customer_id, total_amount, (err) => {
                if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_customer_loan') });
                res.status(201).json({ message: i18n.__('messages.invoice_created'), id: result.insertId });
              });
            }
          });


        });
      });
    });
  });
};

// Get All Buy Invoices
exports.getAllInvoices = (req, res) => {
  BuyInvoice.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};

// Get Buy Invoice by ID
exports.getInvoiceById = (req, res) => {
  const { id } = req.params;
  BuyInvoice.getById(id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.invoice_not_found') });
    res.status(200).json(result[0]);
  });
};

// Get Buy Invoices by Filters
exports.getInvoicesByFilters = (req, res) => {
  const filters = req.body;

  // Validate required fields for date range
  if (!filters.startDate || !filters.endDate) {
    return res.status(400).json({ error: i18n.__('validation.required.date_range') });
  }

  BuyInvoice.getByFilters(filters, (err, results) => {
    if (err) {
      return res.status(500).json({ error: i18n.__('messages.error_fetching_invoices') });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: i18n.__('messages.no_invoices_found') });
    }

    res.status(200).json({
      message: i18n.__('messages.invoices_found', { count: results.length }),
      invoices: results
    });
  });
};

// Update Buy Invoice
exports.updateInvoice = (req, res) => {
  const { id } = req.params;
  const { type, invoice_number, invoice_date, total_amount, tax_amount, due_date, customer_id, branch_id, warehouse_id, employee_id, note } = req.body;

  // Validate required fields
  const validationError = validateRequiredFields(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  // Check if customer_id, warehouse_id, branch_id, and employee_id are valid
  Customer.getById(customer_id, (err, customerResult) => {
    if (err || customerResult.length === 0) {
      return res.status(400).json({ error: i18n.__('validation.invalid.customer_id') });
    }

    Warehouse.getById(warehouse_id, (err, warehouseResult) => {
      if (err || warehouseResult.length === 0) {
        return res.status(400).json({ error: i18n.__('validation.invalid.warehouse_id') });
      }

      Branch.getById(branch_id, (err, branchResult) => {
        if (err || branchResult.length === 0) {
          return res.status(400).json({ error: i18n.__('validation.invalid.branch_id') });
        }

        Employee.getById(employee_id, (err, employeeResult) => {
          if (err || employeeResult.length === 0) {
            return res.status(400).json({ error: i18n.__('validation.invalid.employee_id') });
          }

          // Fetch existing invoice
          BuyInvoice.getById(id, (err, existingInvoice) => {
            if (err) return res.status(500).json({ error: err.message });
            if (existingInvoice.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.invoice_not_found') });

            const oldInvoice = existingInvoice[0];
            const oldAmount = oldInvoice.total_amount;
            const oldType = oldInvoice.type;

            // Update buy invoice record
            const invoiceData = { type, invoice_number, invoice_date, total_amount, tax_amount, due_date, customer_id, branch_id, warehouse_id, employee_id, note };
            BuyInvoice.update(id, invoiceData, (err, result) => {
              if (err) return res.status(500).json({ error: err.message });
              if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.invoice_not_found') });

              // Handle wallet or loan adjustment based on type change
              const amountDifference = total_amount - oldAmount;

              // Reverse the effect of the old type
              if (oldType === 'direct' || oldType === 'cash') {
                Branch.increaseWallet(branch_id, oldAmount, (err) => {
                  if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_branch_wallet') });
                });
              } else if (oldType === 'loan') {
                Customer.increaseLoan(customer_id, oldAmount, (err) => {
                  if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_customer_loan') });
                });
              }

              // Apply the effect of the new type
              if (type === 'direct' || type === 'cash') {
                Branch.decreaseWallet(branch_id, total_amount, (err) => {
                  if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_branch_wallet') });
                  res.status(200).json({ message: i18n.__('messages.invoice_updated') });
                });
              } else if (type === 'loan') {
                Customer.decreaseLoan(customer_id, total_amount, (err) => {
                  if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_customer_loan') });
                  res.status(200).json({ message: i18n.__('messages.invoice_updated') });
                });
              }
            });
          });
        });
      });
    });
  });
};



// Delete Buy Invoice
exports.deleteInvoice = (req, res) => {
  const { id } = req.params;

  // Fetch existing invoice
  BuyInvoice.getById(id, (err, existingInvoice) => {
    if (err) return res.status(500).json({ error: err.message });
    if (existingInvoice.length === 0) return res.status(404).json({ error: i18n.__('validation.invalid.invoice_not_found') });

    const oldInvoice = existingInvoice[0];
    const { type, total_amount, branch_id, customer_id } = oldInvoice;

    // Soft delete the buy invoice
    BuyInvoice.deleteSoft(id, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: i18n.__('validation.invalid.invoice_not_found') });

      // Handle wallet or loan adjustment based on type
      if (type === 'direct' || type === 'cash') {
        Branch.increaseWallet(branch_id, total_amount, (err) => {
          if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_branch_wallet') });
          res.status(200).json({ message: i18n.__('messages.invoice_deleted') });
        });
      } else if (type === 'loan') {
        Customer.increaseLoan(customer_id, total_amount, (err) => {
          if (err) return res.status(500).json({ error: i18n.__('messages.error_updating_customer_loan') });
          res.status(200).json({ message: i18n.__('messages.invoice_deleted') });
        });
      }
    });
  });
};