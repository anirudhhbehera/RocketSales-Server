const Company = require('../models/Company');
const User = require("../models/User");
const mongoose = require('mongoose');
const findSameUsername = require("../utils/findSameUsername");
const Supervisor = require('../models/Supervisor');
const Branch = require('../models/Branch');
const Salesman = require('../models/Salesman');
const { decrypt, encrypt } = require('../utils/cryptoUtils');



// Add a Supervisor
exports.addSupervisor = async (req, res) => {
    const {
      companyId,
      branchId,
      supervisorName,
      supervisorEmail,
      supervisorPhone,
      username,
      password,
    } = req.body;
  
    // Ensure supervisorUsername is provided
    if (!username) {
      return res.status(400).json({ message: 'Supervisor username is required' });
    }
  
    try {
      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
  
      const branch = await Branch.findById(branchId);
      if (!branch) {
        return res.status(404).json({ message: 'Branch not found' });
      }
  
      // Check if supervisor username already exists in the branch
      const existingUserByUsername = await findSameUsername(username);
    if (existingUserByUsername.exists) {
      return res.status(400).json({ message: "Username already exists" });
    }
      // Check if the email already exists in the User collection (assuming email is generated)
      // const supervisorEmail = `${supervisorUsername}@supervisor.com`;
      // const existingUserByEmail = await User.findOne({ email: supervisorEmail });
      // if (existingUserByEmail) {
      //   return res.status(400).json({ message: 'Email already exists in the system' });
      // }
      const supervisorId = new mongoose.Types.ObjectId();
      
      const newSupervisor = new Supervisor ({
        _id: supervisorId,
        supervisorName,
        supervisorEmail,
        supervisorPhone,
        username,
        password,
        companyId,
        branchId,
         role: 4,
      });
 
      await newSupervisor.save();
  
      res.status(201).json({ message: 'Supervisor added successfully', supervisor: newSupervisor });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
};
  
// Get All Supervisors
exports.getSupervisors = async (req, res) => {
  // const { companyId, branchId } = req.params;
    const {role} = req.user
    const {id} = req.user
      let supervisors;
      const ObjectId = mongoose.Types.ObjectId;

 try {
 
       if(role=='superadmin'){
        supervisors = await Supervisor.find().populate("companyId","companyName").populate("branchId","branchName");
       }else if(role =='company'){
        supervisors = await Supervisor.find({companyId: new ObjectId(id)}).populate("companyId","companyName").populate("branchId","branchName");
       }else if(role =='branch'){
        supervisors = await Supervisor.find({branchId: new ObjectId(id)}).populate("branchId","branchName").populate("companyId","companyName");
       }
       supervisors?.forEach(supervisor=>{
        const decryptedPassword  = decrypt(supervisor.password);
        supervisor.password = decryptedPassword;


       })
 
     if (!supervisors) {
       return res.status(404).json({ message: "supervisors not found" });
     }
 
     res.status(200).json({ supervisors});
   } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Supervisor
exports.updateSupervisor = async (req, res) => {

  const {id} = req.params;
  const { 
    companyId,
    branchId,
    supervisorName,
    supervisorEmail,
    supervisorPhone,
    username,
    password,} = req.body;

  const objectId = mongoose.Types.objectId
 
  try {
      const currentSupervisor = await Supervisor.findById(id);

    if(username && username !== currentSupervisor.username){
      const alreadyExistUser = await findSameUsername(username);
      if(alreadyExistUser.exists){
        return res.status(404).json({ message: "Username already exist" });
      }
    }

    let changedpassword;

    if (password) {
      const isPasswordChanged =
        !currentSupervisor.password || decrypt(currentSupervisor.password) !== password;
    
      if (isPasswordChanged) {
        changedpassword = encrypt(password);
      }
    }

      const updatedSupervisor = await Supervisor.findByIdAndUpdate(id,{ 
        companyId,
        branchId,
        supervisorName,
        supervisorEmail,
        supervisorPhone,
        username,
        password:changedpassword
        },
        { new: true,
        runValidators: true,
      })
      if(!updatedSupervisor){
        res.status(404).json({ message: 'Supervisor not found for update'});
      }

      if(branchId){
        await Salesman.updateMany(
          { supervisorId: id },
          { $unset: { supervisorId: "" } }
      );      
    }

      if(companyId){
        await Salesman.updateMany(
          { supervisorId:id  },
          { $unset: { supervisorId: "" } }
      );            
    }
   
    res.status(200).json({ message: 'Supervisor updated successfully', updatedSupervisor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Supervisor
exports.deleteSupervisor = async (req, res) => {
  const { id } = req.params;

  try {
   
        const deletedSupervisor = await Supervisor.findByIdAndDelete(id);
          if (!deletedSupervisor) {
            return res.status(404).json({ message: "Supervisor not found for delete" });
          }
          if(deletedSupervisor){
            await Salesman.updateMany(
              { supervisorId: id },
              { $unset: { supervisorId: "" } }
          );      
        }
    
    res.status(200).json({ message: 'Supervisor deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

