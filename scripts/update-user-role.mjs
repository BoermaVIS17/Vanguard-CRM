import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// First check current users
const [rows] = await connection.execute(
  "SELECT id, name, email, role, openId FROM users WHERE email = 'contact@nextdoorext.com'"
);
console.log("Current user:", rows);

// Update to owner
await connection.execute(
  "UPDATE users SET role = 'owner' WHERE email = 'contact@nextdoorext.com'"
);
console.log("Updated to owner role");

// Verify
const [updated] = await connection.execute(
  "SELECT id, name, email, role FROM users WHERE email = 'contact@nextdoorext.com'"
);
console.log("After update:", updated);

await connection.end();
