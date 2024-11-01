import inquirer from 'inquirer';
import { pool, connectToDb } from './connections.js';

async function main() {
   let answer = await inquirer.prompt([
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
    ])
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
    }
async function showDepartments() {
    try {
        const result = await pool.query(`SELECT id, name AS Department FROM department;`);
        console.table(result.rows);
        main();
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
        main();
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
        main();
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
        main();
    } catch (err) {
        console.error('Error adding department:', err);
    }
}
// Function to Add a Role
async function addRole() {
    try {
        const departmentResult = await pool.query(`SELECT * FROM department`);
        const departmentList = departmentResult.rows.map((department: { [key: string]: string }) => ({
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
        main();
    } catch (err) {
        console.error('Error adding role:', err);
    }
}

// Function to Add an Employee
async function addEmployee() {
    try {
        const employeeResult = await pool.query(`SELECT * FROM employee`);
        const employeeList = employeeResult.rows.map((employee: { [key: string]: string }) => ({
            name: employee.first_name.concat(" ", employee.last_name),
            value: employee.id
        }));

        const roleResult = await pool.query(`SELECT * FROM role`);
        const roleList = roleResult.rows.map((role: {[key: string]: string}) => ({
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
        main();
    } catch (err) {
        console.error('Error adding employee:', err);
    }
}

// Function to Update a Role
async function updateRole() {
    try {
        const employeeResult = await pool.query(`SELECT * FROM employee`);
        const employeeList = employeeResult.rows.map((employee: { [key: string]: string})  => ({
            name: employee.first_name.concat(" ", employee.last_name),
            value: employee.id
        }));

        const roleResult = await pool.query(`SELECT * FROM role`);
        const roleList = roleResult.rows.map((role: { [key: string]: string}) => ({
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
        main();
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
    }
}
init();