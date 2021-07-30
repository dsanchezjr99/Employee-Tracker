use department_db;

INSERT INTRO department (name)
VALUES 
('HR'),
('Sales Lead'),
('Legal'),
('IT');


INSERT INTO role ( title, salary, department_id)
VALUES 
('Sales Manger', 5000, 6),
('Project Manager', 3000, 5),
('Engineer', 7000, 4),
('HR Admin', 2500, 3),
('Attorney', 10000, 2);


INSERT INTO employee (first_name, last_name, role_id, manager_db)
VALUES 
('David', 'Sanchez', '4', NULL),
('Lance', 'Dunkley', '2', NULL),
('Adrian', 'Raso', '6', NULL),
('Ajdin', 'Demic', '3', NULL),
('Vince', 'Guillome', '5', NULL);