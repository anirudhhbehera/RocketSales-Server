//controller/company/controller.js
const Company = require("../models/Company");
const User = require("../models/User");

// Create a new company
exports.createCompany = async (req, res) => {
  const {
    companyName,
    companyEmail,
    ownerName,
    ownerEmail,
    gstNo,
    panNo,
    businessType,
    branches,
    companyUsername,
    companyPassword,
  } = req.body;

  try {
    // Check if the email already exists in the Company collection (optional)
    const existingCompanyByEmail = await Company.findOne({ companyEmail });
    if (existingCompanyByEmail) {
      return res.status(400).json({ message: "Company with this email already exists" });
    }

    // Check if the username already exists in the User collection
    const existingUserByUsername = await User.findOne({ username: companyUsername });
    if (existingUserByUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Check if the email already exists in the User collection
    const existingUserByEmail = await User.findOne({ email: companyEmail });
    if (existingUserByEmail) {
      return res.status(400).json({ message: "Email already exists in the system" });
    }

    // Create a new company document
    const newCompany = new Company({
      companyName,
      companyEmail,
      ownerName,
      ownerEmail,
      gstNo,
      panNo,
      businessType,
      branches: [],
      companyUsername,
      companyPassword, // Plain password for now
    });

    // Save the company to the database
    const company = await newCompany.save();

    // Create a new user associated with this company
    const newUser = new User({
      username: companyUsername, // Use company username as the user's username
      email: companyEmail, // Use company email
      password: companyPassword, // Use company password
      role: 2, // Default role set to 2 (as requested)
    });

    // Save the new user
    await newUser.save();

    // Return the created company and user data as response
    res.status(201).json({
      company: company,
      user: {
        userId: newUser._id,
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all companies  
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.status(200).json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get only companies without branches
exports.getOnlyCompanies = async (req, res) => {
  try {
    // Exclude the `branches` field using .select()
    const companies = await Company.find().select('-branches');
    res.status(200).json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Update companies & also in user collection
exports.updateCompany = async (req, res) => {
  const { id } = req.params; // The ID of the company to update (from params, not body)
  const {
    companyName,
    companyEmail,
    ownerName,
    ownerEmail,
    gstNo,
    panNo,
    businessType,
    branches,
    companyUsername,
    companyPassword,
  } = req.body;

  try {
    // Find the existing company by ID
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Save the old username and email for user search later
    const oldUsername = company.companyUsername;
    const oldEmail = company.companyEmail;
    /// Validate if the new username or email already exists in the User collection
    if (companyUsername && companyUsername !== oldUsername) {
      const existingUserByUsername = await User.findOne({ username: companyUsername });
      if (existingUserByUsername) {
        return res.status(400).json({ message: 'Username already exists in the system' });
      }
    }

    if (companyEmail && companyEmail !== oldEmail) {
      const existingUserByEmail = await User.findOne({ email: companyEmail });
      if (existingUserByEmail) {
        return res.status(400).json({ message: 'Email already exists in the system' });
      }
    }

    // Update the company details
    company.companyName = companyName || company.companyName;
    company.companyEmail = companyEmail || company.companyEmail;
    company.ownerName = ownerName || company.ownerName;
    company.ownerEmail = ownerEmail || company.ownerEmail;
    company.gstNo = gstNo || company.gstNo;
    company.panNo = panNo || company.panNo;
    company.businessType = businessType || company.businessType;
    company.branches = branches || company.branches;
    company.companyUsername = companyUsername || company.companyUsername;
    company.companyPassword = companyPassword || company.companyPassword;

    // Save the updated company
    await company.save();

    // Find the associated user by the old username
    const user = await User.findOne({ username: oldUsername });
    if (user) {
      user.username = companyUsername || user.username;
      user.password = companyPassword || user.password;
      user.email = companyEmail || user.email;
      await user.save();
    }else {
      return res.status(404).json({ message: 'Associated user not found in the system' });
    }

    res.status(200).json({ message: 'Company and associated user updated successfully', company });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete companies & also in user collection
exports.deleteCompany = async (req, res) => {
  const { id } = req.params; // The ID of the company to delete

  try {
    // Find the existing company by ID
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Find the associated user by companyUsername
    const user = await User.findOne({ username: company.companyUsername });
    if (user) {
      // Delete the associated user
      await user.deleteOne();
    }

    // Delete the company
    await company.deleteOne();

    res.status(200).json({ message: 'Company and associated user deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single company by username
exports.getCompanyByUsername = async (req, res) => {
  try {
    const company = await Company.findOne({ companyUsername: req.params.username });
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.status(200).json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
