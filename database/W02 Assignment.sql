-- This is assignment2.sql

--1. Adding tony stark to data base 
INSERT INTO public.account (
	account_firstname,
	account_lastname,
	account_email,
	account_password
)
VALUES (
	'Tony',
	'Stark',
	'tony@starkent.com',
	'Iam1ronM@n'
);


--2. Settiing tony stark to admin 
UPDATE public.account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';



--3. Deleting tony stark from database
DELETE FROM public.account
WHERE account_email = 'tony@starkent.com'
RETURNING *;


--4. Modifying interior
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_id = '10';


--5. Selecting sports cars
SELECT  
	i.inv_make   AS make,
    i.inv_model  AS model,
    c.classification_name
FROM 
	public.inventory AS i
INNER JOIN 
	public.classification AS c
	ON i.classification_id = c.classification_id
	WHERE c.classification_name = 'Sport';


--6. Adding /vehicle/
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/')
