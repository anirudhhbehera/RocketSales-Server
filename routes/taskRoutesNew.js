const express = require('express');
const router = express.Router();

const  {addTasks, updateTask, deleteTask, updateTaskStatus, getTasks}  = require('../controllers/taskControllerNew');
const authenticate = require('../middlewares/authMiddleware');




router.post('/task',authenticate, addTasks);

router.get('/task',authenticate, getTasks);

router.put('/task/:id',authenticate,updateTask);

router.delete('/task/:id',authenticate, deleteTask);






// router.get('/tasks/supervisor/:supervisorUsername', getTasksBySupervisor);

          // task status api
router.put('/task/status/:id', updateTaskStatus);  







module.exports = router;
