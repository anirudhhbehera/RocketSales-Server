const Company = require('../models/Company');

// Add a Salesman
exports.addSalesman = async (req, res) => {
  const { companyId, branchId, supervisorId } = req.params;
  const { salesmanName, salesmanEmail, salesmanPhone, salesmanUsername, salesmanPassword } = req.body;

  try {
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const branch = company.branches.id(branchId);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    const supervisor = branch.supervisors.id(supervisorId);
    if (!supervisor) {
      return res.status(404).json({ message: 'Supervisor not found' });
    }

    const existingSalesman = supervisor.salesmen.find(
      (salesman) => salesman.salesmanUsername === salesmanUsername
    );
    if (existingSalesman) {
      return res.status(400).json({ message: 'Salesman username already exists' });
    }

    const newSalesman = {
      salesmanName,
      salesmanEmail,
      salesmanPhone,
      salesmanUsername,
      salesmanPassword,
    };

    supervisor.salesmen.push(newSalesman);
    await company.save();

    res.status(201).json({ message: 'Salesman added successfully', salesman: newSalesman });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Salesmen
exports.getSalesmen = async (req, res) => {
    const { companyId, branchId, supervisorId } = req.params;
  
    try {
      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
  
      const branch = company.branches.id(branchId);
      if (!branch) {
        return res.status(404).json({ message: 'Branch not found' });
      }
  
      const supervisor = branch.supervisors.id(supervisorId);
      if (!supervisor) {
        return res.status(404).json({ message: 'Supervisor not found' });
      }
  
      res.status(200).json(supervisor.salesmen);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
};
  

// Update Salesman
exports.updateSalesman = async (req, res) => {
  const { companyId, branchId, supervisorId, salesmanId } = req.params;
  const { salesmanName, salesmanEmail, salesmanPhone, salesmanUsername, salesmanPassword } = req.body;

  try {
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const branch = company.branches.id(branchId);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    const supervisor = branch.supervisors.id(supervisorId);
    if (!supervisor) {
      return res.status(404).json({ message: 'Supervisor not found' });
    }

    const salesman = supervisor.salesmen.id(salesmanId);
    if (!salesman) {
      return res.status(404).json({ message: 'Salesman not found' });
    }

    salesman.salesmanName = salesmanName || salesman.salesmanName;
    salesman.salesmanEmail = salesmanEmail || salesman.salesmanEmail;
    salesman.salesmanPhone = salesmanPhone || salesman.salesmanPhone;
    salesman.salesmanUsername = salesmanUsername || salesman.salesmanUsername;
    salesman.salesmanPassword = salesmanPassword || salesman.salesmanPassword;

    await company.save();

    res.status(200).json({ message: 'Salesman updated successfully', salesman });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Salesman
exports.deleteSalesman = async (req, res) => {
  const { companyId, branchId, supervisorId, salesmanId } = req.params;

  try {
    // Find the company by ID
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Find the branch by ID
    const branch = company.branches.id(branchId);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Find the supervisor by ID
    const supervisor = branch.supervisors.id(supervisorId);
    if (!supervisor) {
      return res.status(404).json({ message: 'Supervisor not found' });
    }

    // Remove the salesman from the salesmen array
    supervisor.salesmen = supervisor.salesmen.filter(
      (salesman) => salesman._id.toString() !== salesmanId
    );

    // Save the updated company document
    await company.save();

    res.status(200).json({ message: 'Salesman deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
