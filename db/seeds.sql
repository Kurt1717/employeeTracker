INSERT INTO department (name)
VALUES ('Sales'),
       ('Engineering'),
       ('Finance');

INSERT INTO role (title, salary, department_id)
VALUES ('Salesperson', 50000, 1),
       ('Engineer', 115000, 2),
       ('Head Engineer', 200000, 2),
       ('Accountant', 120000, 3),
       ('Analyst', 80000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('John', 'Smith', 1,),
       ('Emily', 'Cooper', 2, 1)
       ('Eric', 'Daniels', 3, 2);
    