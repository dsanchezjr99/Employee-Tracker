const mysql = require('mysql2');
const util = require('util');
const inquirer = require('inquirer');
const conTable = require('console.table');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    //  Insert Your MySQL username and password
    user: 'root',
    password: '',
    database: 'department_db'
  });
  
  connection.connect(err => {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId + '\n');
    menu();
  });
  
  connection.query = util.promisify(connection.query);
  
  // Displaying the questions 
  function menu() {
    console.log("\n** Select options **\n");
  
    inquirer.prompt([
      {
        type: 'list',
        name: 'selectOptions',
        message: 'What would you like to do?',
        choices: [
          'View all Departments',
          'Add a  new Department',
          'Show Employees by department',
          'Add a new Role',
          'Delete Role',
          'Delete Department',
          'View all Roles',
          'View all Employees',
          'Add an Employee',
          'Delete an Employee',
          'Update an Employees role',
          `Update the Employee manager's name`,
          'Quit'
        ]
      }


    ]).then(options => {
      switch (options.selectOptions) {
        case 'View all Departments':
          showDepartments();
          break;
        case 'Add Department':
          addDepartment();
          break;
        case 'Delete Department':
          deleteApartment();
          break;
        case 'View all Roles':
          showRoles();
          break;
        case 'Add a new Role':
          addRole();
          break;
        case 'Delete Role':
          deleteRole();
          break;
        case 'View all Employees':
          showEmployees();
          break;
        case 'Add an Employee':
          addEmployee();
          break;
        case 'Delete an Employee':
          deleteEmployee();
          break;
        case 'Update an Employees role':
          updateEmployeeRole();
          break;
        case `Update the Employee manager's name`:
          updateEmpManager()
          break;
        case 'Show Employees by department':
          showEmployeebyDepto();
          break;
         
        default:
          connection.end();
      }
    });
  }
  
  
  // showing all the departments
  function showDepartments() {
    //sql consult select
    connection.query(`SELECT * FROM department`, (err, res) => {
      if (err) throw err;
  
      if (res.length > 0) {
        console.log('\n')
        console.log(' ** Departments **')
        console.log('\n')
        console.table(res);
      }
      //calls the menu to display the question again
      menu();
    });
  }


  // Display info on all roles
  function showRoles() {
    //sql consult select
    connection.query(`SELECT role.title AS job_title,role.id,department.name AS department_name,role.salary  FROM  role LEFT JOIN department ON role.department_id=department.id`,
      (err, res) => {
  
        if (err) throw err;
  
        if (res.length > 0) {
          console.log('\n')
          console.log(' ** Roles **')
          console.log('\n')
          console.table(res);
        }
        //calls the menu to display the question again
        menu();
      });
  }
  // displaying all of the employees info
  function showEmployees() {
    //query consult select
    connection.query(`SELECT employee.id, employee.first_name,employee.last_name,role.title AS job_title,role.salary,
         CONCAT(manager.first_name ," ", manager.last_name) AS Manager FROM  employee LEFT JOIN role ON employee.role_id=role.id LEFT JOIN employee  manager ON manager.id = employee.manager_id`, (err, res) => {
      
  
      if (err) throw err;
  
      if (res.length > 0) {
        console.log('\n')
        console.log('** Employees **')
        console.log('\n')
        console.table(res);
      }
      //calls the menu to display the question again
      menu();
    });
  
  }
  
  //selection of the first name, last name  and  employeeid from the employee table and back to an object array
  async function helperEmpManager() {
    let res = await connection.query(`SELECT  CONCAT(employee.first_name," " ,employee.last_name) AS fullName, employee.id FROM employee`)
    let employeName = [];
    res.forEach(emp => {
      //saving on the list of objects
      employeName.push({ name: emp.fullName, value: emp.id })
    })
  
    return employeName;
  
  }
  
  //selection of all departments from department table and back to an object array (department-names and id)
  async function helperArray() {
    let res = await connection.query(`SELECT * FROM department `)
    let deptoChoice = [];
  
    res.forEach(dpto => {
      //saving on the list of objects
      deptoChoice.push({ name: dpto.name, value: dpto.id });
    })
    
    return deptoChoice;
  
  }
  
  //selection of title and id from the roles table and back to an object array
  async function helperEmployee() {
    let res = await connection.query(`SELECT role.title,role.id FROM role `)
    let roleChoice = [];
  
    res.forEach(roles => {
      //saving on the list of objects
      roleChoice.push({ name: roles.title, value: roles.id })
    })
    
    return roleChoice;
  
  }
  
  
  //adding a new department to the datebase
  function addDepartment() {
  
    inquirer.prompt([
  
      {
        type: 'input',
        name: 'nameDpto',
        message: 'What is your department name?',
        validate: name => {           
          if (name) {
            return true;
          } else {
            console.log('\n Please enter a department name!');
            return false;
          }
        }
      }
    ])
      .then(anserw => {
        let nameDepartment = anserw.nameDpto;
        //sql consult insert
        connection.query('INSERT INTO department SET name=? ', [nameDepartment], (err, res) => {
          if (err) throw err;
  
          //printing info that tells the user that 1 department was added
          console.log(res.affectedRows + ' Department added!\n');
  
          //calls the menu to display the question again
          menu();
        })
      })
  
  }
  
  //Deletion of departments
  async function deleteApartment() {
    //return a list of the current department names
    let roleNames = await helperArray();
    inquirer.prompt([
  
      {
        type: 'list',
        name: 'dptoDelete',
        message: 'Select the department for delete!',
        choices: roleNames
  
      }
    ])
      .then(anserw => {
        let deleteId = anserw.dptoDelete;
        //sql consult delete
        connection.query('DELETE FROM department WHERE id=? ', [deleteId], (err, res) => {
          if (err) throw err;
  
          console.log(res.affectedRows + ' Department deleted!\n');
          menu();
        })
      })
  }
  
  // adding a new role info to the datebase
  async function addRole() {
    //the function will come back with an array with all the departments names listed
    let deptoChoiceRes = await helperArray();
   
    inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'What is your rol name?',
        validate: name => {           
          if (name) {
            return true;
          } else {
            console.log('\n Please enter a title rol!');
            return false;
          }
        }
      },
      {
        type: 'input',
        name: 'salary',
        message: 'What is the salary rol?',
        validate: salaryInput => {           
          if (salaryInput) {
            return true;
          } else {
            console.log('\n Please enter a salary rol!');
            return false;
          }
        }
      },
      {
        type: 'list',
        name: 'dptoId',
        message: 'Select the department for that rol?',
        choices: deptoChoiceRes
  
      }
    ])
      .then(anserw => {
        let title = anserw.title;
        let salary = anserw.salary;
        let id = anserw.dptoId;
       
        //inserting query in a role
        connection.query('INSERT INTO role SET title=?,salary=?,department_id=? ', [title, salary, id], (err, res) => {
          if (err) throw err;
          console.log(res.affectedRows + 'Role added!\n');
          menu();
        })
      })
  }
  
  // deleting roles from the  current table 
  async function deleteRole() {
    let rolesName = await helperEmployee();
    inquirer.prompt([
  
      {
        type: 'list',
        name: 'roleDelete',
        message: 'Select a role for delete!',
        choices: rolesName
  
      }
  
    ])
      .then(anserw => {
        let deleteId = anserw.roleDelete;
        //sql consult delete 
        connection.query('DELETE FROM role WHERE id=? ', [deleteId], (err, res) => {
          if (err) throw err;
  
          console.log(res.affectedRows + 'A role was delete!\n');
          menu();
        })
      })
  }
  
  //adding a new employee to the date base
  async function addEmployee() {
    let employeeNames = await helperEmpManager();
    let rolesName = await helperEmployee();
    
    inquirer.prompt([
  
      {
        type: 'input',
        name: 'name',
        message: 'What is the employee name?',
        validate: name => {           
          if (name) {
            return true;
          } else {
            console.log('\n Please enter the name!');
            return false;
          }
          
        }

      },

      {
        type: 'input',
        name: 'lastName',
        message: 'What is the employee\ manager last name?',
        validate: lastnameInput => {           
          if (lastnameInput) {
            return true;
          } else {
            console.log('\n Please enter the last name!');
            return false;
          }
        }
      },

      {
        type: 'list',
        name: 'selectRole',
        message: 'Select a role for a employee',
        choices: rolesName
      },
      
      {
        type: 'confirm',
        name: 'confirmManager',
        message: 'Have a manager?',
        default: false,
      },
  
      {
        type: 'list',
        name: 'magId',
        message: 'Have a manager?',
        choices: employeeNames,
        when: ({ confirmManager }) => confirmManager
      }
  
    ])

      .then(anserw => {
        //taking the values to entry for the prompts 
        let name = anserw.name;
        let last = anserw.lastName;
        let roleIdEmp = anserw.selectRole;
        //manager-id can be null to
        let managerId = anserw.magId || null;
  
        //sql consult inserting an employee
        connection.query('INSERT INTO employee SET first_name=?,last_name=?,role_id=?,manager_id=? ', [name, last, roleIdEmp, managerId], (err, res) => {
          if (err) throw err;
          console.log(res.affectedRows + ' Employee added!\n');
          menu();

        })
      })
  }
  
  //deleting employees info from the table used through an id
  async function deleteEmployee() {
  
    let employees = await helperEmpManager();
    inquirer.prompt([
  
      {
        type: 'list',
        name: 'empDelete',
        message: 'Select a role to delete!',
        choices: employees
  
      }
  
    ])
      .then(anserw => {
        let deleteId = anserw.empDelete;
        //sql consult deleting employee
        connection.query('DELETE FROM employee WHERE id=? ', [deleteId], (err, res) => {
          if (err) throw err;
  
          console.log(res.affectedRows + ' Employee deleted!\n');
          menu();
        })
      })
  }
  
  //updating an employees role
  async function updateEmployeeRole() {

    //calling the functions back from an employees names,id and roles names,id
    let employeeNames = await helperEmpManager();
    let rolesName = await helperEmployee();
   
    inquirer.prompt([
  
      { 
            //display a list with an array with employees names   
        type: 'list',
        name: 'employeeName',
        message: 'Select a employee for update his role',
        choices: employeeNames
  
      },
      { 
          //displaying a list with all the roles names
        type: 'list',
        name: 'selectRole',
        message: 'Select a new role for a employee',
        choices: rolesName
      }
  
    ])
      .then(anserw => {
        let empName = anserw.employeeName;
        let newrole = anserw.selectRole;
        //query consult updating roles for an employee
        connection.query('UPDATE employee SET employee.role_id= ? WHERE employee.id=?', [newrole, empName], (err, res) => {
          if (err) throw err;
  
  
          console.log(res.affectedRows + ' Employee updated role changed!\n');
  
          //calls the menu to display the question again
          menu();
        })
      })
  
  };
  
  
  async function updateEmpManager() {
    let namesEmpManager = await helperEmpManager();
   
    inquirer.prompt([
  
      {  
           //displaying a list with an array of employees names   
        type: 'list',
        name: 'employee',
        message: 'Select a employee for update his manager',
        choices: namesEmpManager
  
      },
      { 
          //displaying a list with all the roles names
        type: 'list',
        name: 'manager',
        message: 'Select a manager name',
        choices: namesEmpManager
      }
  
    ])
      .then(anserw => {
        let empName = anserw.employee;
        let newManager = anserw.manager;
        //query consult update role for a employee
        connection.query('UPDATE employee SET employee.manager_id= ? WHERE employee.id=?', [newManager, empName], (err, res) => {
          if (err) throw err;
  
  
          console.log(res.affectedRows + ' Employee updated manager changed!\n');
  
          //calls the menu to display the question again
          menu();
        })
      })
  }
  
  //showing employees by  each department
  async function showEmployeebyDepto() {
    //returning a list of the department names
    let deptonames = await helperArray();
  
    inquirer.prompt([
  
      {
        type: 'list',
        name: 'ShowED',
        message: 'Select the department for show employees!',
        choices: deptonames
  
      }
    ])
      .then(anserw => {
        let deptoID = anserw.ShowED;
        //query for select from all tables info    
        connection.query('SELECT employee.id, employee.first_name, employee.last_name,role.title FROM employee LEFT JOIN role ON employee.role_id=role.id  LEFT JOIN department department on role.department_id = department.id  WHERE department.id=? ', [deptoID], (err, res) => {
          if (err) throw err;
        if(res.length>0){
  
          console.log('\n')
          console.log('** Employees by Department **')
          console.log('\n')
          console.table(res);
        }
        else
        {
          
          console.log('\n')
          console.log('** Employees by Department **')
          console.log('\n')
          console.log('No employees to show for that department now')
        }
        
          menu();
        })
      })
  }