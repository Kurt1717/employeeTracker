import inquirer from 'inquirer';
import { QueryResult } from 'pg';
import { pool, connectToDb } from './connection.js';

/*
async function viewEmployees() {
    try {
        const result = await pool.query('SELECT * FROM employees'); // Replace with your table name
        console.table(result.rows);
    } catch (err) {
        console.error('Error fetching employees:', err);
    }
}
async function addEmployee() {
    try {
        const departments = await pool.query('SELECT id, name FROM departments'); // Assume departments exist
        const roles = await pool.query('SELECT id, title FROM roles'); // Assume roles exist

        const answers = await inquirer.prompt([
            { name: 'first_name', message: "Employee's First Name:" },
            { name: 'last_name', message: "Employee's Last Name:" },
            {
                type: 'list',
                name: 'role_id',
                message: 'Select Role:',
                choices: roles.rows.map(role => ({ name: role.title, value: role.id }))
            },
            {
                type: 'list',
                name: 'department_id',
                message: 'Select Department:',
                choices: departments.rows.map(dept => ({ name: dept.name, value: dept.id }))
            }
        ]);

        await pool.query('INSERT INTO employees (first_name, last_name, role_id, department_id) VALUES ($1, $2, $3, $4)', 
                         [answers.first_name, answers.last_name, answers.role_id, answers.department_id]);

        console.log('Employee added successfully!');
    } catch (err) {
        console.error('Error adding employee:', err);
    }
}
async function updateRole() {
    try {
        const employees = await pool.query('SELECT id, first_name, last_name FROM employees');
        const roles = await pool.query('SELECT id, title FROM roles');

        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'employee_id',
                message: 'Select Employee:',
                choices: employees.rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }))
            },
            {
                type: 'list',
                name: 'new_role_id',
                message: 'Select New Role:',
                choices: roles.rows.map(role => ({ name: role.title, value: role.id }))
            }
        ]);

        await pool.query('UPDATE employees SET role_id = $1 WHERE id = $2', [answers.new_role_id, answers.employee_id]);

        console.log('Employee role updated successfully!');
    } catch (err) {
        console.error('Error updating employee role:', err);
    }
}
async function viewRoles() {
    try {
        const result = await pool.query('SELECT * FROM roles');
        console.table(result.rows);
    } catch (err) {
        console.error('Error fetching roles:', err);
    }
}
async function addRole() {
    try {
        const departments = await pool.query('SELECT id, name FROM departments');
        const answers = await inquirer.prompt([
            { name: 'title', message: 'Role Title:' },
            { name: 'salary', message: 'Role Salary:', validate: (value) => !isNaN(value) || 'Please enter a valid number' },
            {
                type: 'list',
                name: 'department_id',
                message: 'Select Department:',
                choices: departments.rows.map(dept => ({ name: dept.name, value: dept.id }))
            }
        ]);

        await pool.query('INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)', 
                         [answers.title, answers.salary, answers.department_id]);

        console.log('Role added successfully!');
    } catch (err) {
        console.error('Error adding role:', err);
    }
}
async function showDepartments() {
    try {
        const result = await pool.query('SELECT * FROM departments');
        console.table(result.rows);
    } catch (err) {
        console.error('Error fetching departments:', err);
    }
}
async function addDepartment() {
    try {
        const answers = await inquirer.prompt([
            { name: 'name', message: 'Department Name:' }
        ]);

        await pool.query('INSERT INTO departments (name) VALUES ($1)', [answers.name]);

        console.log('Department added successfully!');
    } catch (err) {
        console.error('Error adding department:', err);
    }
}*/
async function main() {
    await inquirer.prompt([
        {
            type: 'list',
            name: 'intro',
            message: 'What would you like to do?',
            choices:[
                'View All Employees',
                'Add Employee',
                'Update Employee Role',
                'View All Roles',
                'Add Role',
                'View All Departments',
                'Add Department',
                'Quit'
            ]
        }
    ]).then((answer) => {
        switch(answer.intro) {
            case 'View All Employees':
                viewEmployees();
                break;
            case 'Add Employee':
                addEmployee();
                break;
            case 'Update Employee Role':
                updateRole();
                break;
            case 'View All Roles':
                viewRoles();
                break;
            case 'Add Role':
                addRole();
                break;
            case 'View All Departments':
                showDepartments();
                break;
            case 'Add Department':
                addDepartment();
                break;
            case 'Quit':
                console.log('Ciao!');
                pool.end();
                break;
        }
    })
}
async function showDepartments() {
    try {
        const result = await pool.query(`SELECT id, name AS Department FROM department;`);
        console.table(result.rows);
        init();
    } catch (err) {
        console.error('Error fetching departments:', err);
    }
}

// Function to View Roles
async function viewRoles() {
    try {
        const sql = `SELECT role.id, role.title AS role, role.salary, department.name AS department 
                     FROM role 
                     INNER JOIN department ON (department.id = role.department_id);`;
        const result = await pool.query(sql);
        console.table(result.rows);
        init();
    } catch (err) {
        console.error('Error fetching roles:', err);
    }
}

// Function to View Employees
async function viewEmployees() {
    try {
        const sql = `SELECT employee.id, employee.first_name, employee.last_name, role.title AS role, 
                            department.name AS department, role.salary, 
                            CONCAT(manager.first_name, ' ', manager.last_name) AS manager 
                     FROM employee 
                     LEFT JOIN employee manager ON manager.id = employee.manager_id 
                     INNER JOIN role ON (role.id = employee.role_id) 
                     INNER JOIN department ON (department.id = role.department_id) 
                     ORDER BY employee.id;`;
        const result = await pool.query(sql);
        console.table(result.rows);
        init();
    } catch (err) {
        console.error('Error fetching employees:', err);
    }
}

// Function to Add A Department
async function addDepartment() {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'department',
            message: 'What is the name of the department?',
        }
    ]);
    
    try {
        const sql = `INSERT INTO department (name) VALUES ($1);`; // Use parameterized queries
        await pool.query(sql, [answers.department]);
        console.log(`Added ${answers.department} to the database`);
        init();
    } catch (err) {
        console.error('Error adding department:', err);
    }
}
// Function to Add a Role
async function addRole() {
    try {
        const departmentResult = await pool.query(`SELECT * FROM department`);
        const departmentList = departmentResult.rows.map(department => ({
            name: department.name,
            value: department.id
        }));

        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'What is the name of this role?',
            },
            {
                type: 'input',
                name: 'salary',
                message: 'What is the salary of this role?',
            },
            {
                type: 'list',
                name: 'department',
                message: 'Which Department does this role belong to?',
                choices: departmentList
            }
        ]);

        const sql = `INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3);`; // Use parameterized queries
        await pool.query(sql, [answers.title, answers.salary, answers.department]);
        console.log(`Added ${answers.title} to the database`);
        init();
    } catch (err) {
        console.error('Error adding role:', err);
    }
}

// Function to Add an Employee
async function addEmployee() {
    try {
        const employeeResult = await pool.query(`SELECT * FROM employee`);
        const employeeList = employeeResult.rows.map(employee => ({
            name: employee.first_name.concat(" ", employee.last_name),
            value: employee.id
        }));

        const roleResult = await pool.query(`SELECT * FROM role`);
        const roleList = roleResult.rows.map(role => ({
            name: role.title,
            value: role.id
        }));

        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'first',
                message: "What is the employee's first name?",
            },
            {
                type: 'input',
                name: 'last',
                message: "What is the employee's last name?",
            },
            {
                type: 'list',
                name: 'role',
                message: "What is the employee's role?",
                choices: roleList
            },
            {
                type: 'list',
                name: 'manager',
                message: "Who is the employee's manager?",
                choices: employeeList
            }
        ]);

        const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) 
                     VALUES ($1, $2, $3, $4);`; // Use parameterized queries
        await pool.query(sql, [answers.first, answers.last, answers.role, answers.manager]);
        console.log(`Added ${answers.first} ${answers.last} to the database`);
        init();
    } catch (err) {
        console.error('Error adding employee:', err);
    }
}

// Function to Update a Role
async function updateRole() {
    try {
        const employeeResult = await pool.query(`SELECT * FROM employee`);
        const employeeList = employeeResult.rows.map(employee => ({
            name: employee.first_name.concat(" ", employee.last_name),
            value: employee.id
        }));

        const roleResult = await pool.query(`SELECT * FROM role`);
        const roleList = roleResult.rows.map(role => ({
            name: role.title,
            value: role.id
        }));

        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'employee',
                message: "Which employee's role do you want to update?",
                choices: employeeList
            },
            {
                type: 'list',
                name: 'role',
                message: "Which role do you want to assign the selected employee?",
                choices: roleList
            },
            {
                type: 'list',
                name: 'manager',
                message: "Who will be this employee's manager?",
                choices: employeeList
            }
        ]);

        const sql = `UPDATE employee SET role_id = $1, manager_id = $2 WHERE id = $3;`; // Use parameterized queries
        await pool.query(sql, [answers.role, answers.manager, answers.employee]);
        console.log('Employee role updated');
        init();
    } catch (err) {
        console.error('Error updating employee role:', err);
    }
}

async function init() {
    try {
        await connectToDb();
        await main();
    } catch (err) {
        console.error('An error occurred:', err);
    } finally {
        await pool.end();
        console.log('Connection to database closed.');
    }
}