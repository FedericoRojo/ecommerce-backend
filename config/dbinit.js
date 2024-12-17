const {Client} = require("pg");
require('dotenv').config();

const SQL = `


CREATE TABLE Image (
    id SERIAL PRIMARY KEY,
    img TEXT NOT NULL,
    public_id VARCHAR(255) UNIQUE NOT NULL,
    resource_type VARCHAR(50) NOT NULL
);

CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    status INT NOT NULL CHECK (status IN (0, 1))
);


CREATE TABLE Category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id INT REFERENCES Category(id) -- Self-referencing
);


CREATE TABLE Product (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES Category(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_id INT REFERENCES Image(id) ON DELETE SET NULL,
    price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2),
    units_in_stock INT NOT NULL DEFAULT 0
);

CREATE TABLE Orders (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES Users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('ORDER_PLACED', 'ORDER_PACKAGED', 'ORDERS_SHIPPED', 'ORDER_DELIVERED')),
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_delivered TIMESTAMP,
    total DECIMAL(10, 2) NOT NULL,
    customer_comments TEXT
);


CREATE TABLE OrderItem (
    id SERIAL PRIMARY KEY,
    order_id INT,
    product_id INT REFERENCES Product(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE
);


CREATE TABLE OrderReturns (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES Orders(id) ON DELETE CASCADE,
    customer_id INT REFERENCES Users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    return_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    refund_amount DECIMAL(10, 2) NOT NULL,
    reason TEXT NOT NULL,
    note TEXT
);


CREATE TABLE ReturnOrderItem (
    id SERIAL PRIMARY KEY,
    return_order_id INT,
    product_id INT REFERENCES Product(id) ON DELETE SET NULL,
    quantity INT NOT NULL,
    refund_price DECIMAL(10, 2) NOT NULL,
    condition VARCHAR(50) NOT NULL CHECK (condition IN ('NEW', 'USED', 'DAMAGED', 'DEFECTIVE')),
    reason TEXT,
    FOREIGN KEY (return_order_id) REFERENCES Orders(id) ON DELETE CASCADE
);


CREATE TABLE Shipping (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES Orders(id) ON DELETE CASCADE,
    to_address TEXT NOT NULL,
    from_address TEXT NOT NULL,
    tracking_nro VARCHAR(100),
    status VARCHAR(50),
    sent_at TIMESTAMP,
    courier_tracker_details TEXT,
    delivered_at TIMESTAMP
);


CREATE TABLE PaymentMethod (
    id SERIAL PRIMARY KEY,
    method VARCHAR(50) NOT NULL,
    description TEXT
);


CREATE TABLE PaymentMethodParameters (
    id SERIAL PRIMARY KEY,
    payment_method_id INT REFERENCES PaymentMethod(id) ON DELETE CASCADE,
    parameter_key VARCHAR(100) NOT NULL,
    parameter_value TEXT NOT NULL
);


CREATE TABLE PaymentDetails (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES Orders(id) ON DELETE CASCADE,
    customer_id INT REFERENCES Users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT
);

CREATE TABLE Cart (
    id SERIAL PRIMARY KEY, 
    user_id INT UNIQUE NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE CartItem (
    id SERIAL PRIMARY KEY, 
    cart_id INT NOT NULL, 
    product_id INT NOT NULL, 
    quantity INT NOT NULL,
    FOREIGN KEY (cart_id) REFERENCES Cart(id) ON DELETE CASCADE
);


`;

async function main(){
    console.log('seeding...');
    const client = new Client({
        connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`,
    });
    await client.connect();
    await client.query(SQL);
    await client.end();
    console.log('done');
}

main();