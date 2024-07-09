-- Schema for postgresql database auth_methods

-- Create users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE
);

-- Create devices table
CREATE TABLE devices (
    device_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    visitor_id VARCHAR(50) NOT NULL,
    os VARCHAR(50) NOT NULL,
    browser VARCHAR(50) NOT NULL,
    UNIQUE (user_id, visitor_id),
    CONSTRAINT fk_user
      FOREIGN KEY(user_id) 
      REFERENCES users(user_id)
);

-- Create measurements table
CREATE TABLE measurements (
    id SERIAL PRIMARY KEY,
    device_id INT NOT NULL,
    auth_method_name VARCHAR(50) NOT NULL,
    action VARCHAR(10) NOT NULL,  -- 'Signup', 'Login' or saveDevice
    time_ms INT NOT NULL,  -- Time in milliseconds
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_device
      FOREIGN KEY(device_id)
      REFERENCES devices(device_id)
);

-- Create indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_devices_user_id ON devices(user_id);
CREATE INDEX idx_measurements_device_id ON measurements(device_id);
CREATE INDEX idx_measurements_auth_method_action ON measurements(auth_method_name, action);

CREATE VIEW user_device_measurements AS
SELECT 
    u.username,
    d.visitor_id,
    d.os,
    d.browser,
    m.auth_method_name,
    m.action,
    m.time_ms,
    m.timestamp
FROM 
    users u
JOIN 
    devices d ON u.user_id = d.user_id
JOIN 
    measurements m ON d.device_id = m.device_id;

