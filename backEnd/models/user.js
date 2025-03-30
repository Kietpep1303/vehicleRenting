const pool = require('../database/postgresql');

// SQL
// CREATE TABLE "user" (
//     id SERIAL PRIMARY KEY,
//     first_name VARCHAR(64),
//     middle_name VARCHAR(64),
//     last_name VARCHAR(64),
//     email VARCHAR(255) NOT NULL UNIQUE,
//     password VARCHAR(255) NOT NULL,
//     id_card_number VARCHAR(255) UNIQUE,
//     nickname VARCHAR(64) NOT NULL,
//     account_level INTEGER
// );

// COMMENT ON TABLE "user" IS 'Stores user''s information';

// ALTER TABLE "user"
//     OWNER TO postgres;

class User {
    constructor(nickname, email, password) {
        this.nickname = nickname;
        this.email = email;
        this.password = password;
    }

    // Create a new user
    async createUserLevel0() {
        const query = `
            INSERT INTO "user" (nickname, email, password, account_level)
            VALUES ($1, $2, $3, $4)
            RETURNING *; 
        `; // RETURNING *; is used to return the inserted row with auto-generated values.
        const values = [this.nickname, this.email, this.password, 0];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Update user level 1
    static async updateUserLevel1(email) {
        const query = `
            UPDATE "user" SET account_level = $1
            WHERE email = $2
            RETURNING *;
        `;
        const values = [1, email];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Find the user's data using email
    static async findUserByEmail(email) {
        const query = 'SELECT * FROM "user" WHERE email = $1';
        const values = [email];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Find the user's data using ID card number
    static async findUserByIdCardNumber(idCardNumber) {
        const query = 'SELECT * FROM "user" WHERE id_card_number = $1';
        const values = [idCardNumber];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Update the user's password using email
    static async updateUserPassword(email, password) {
        const query = 'UPDATE "user" SET password = $1 WHERE email = $2';
        const values = [password, email];
        await pool.query(query, values);
    }
};

class UserLevel2 extends User {
    constructor(firstName, middleName, lastName, idCardNumber, nickname, email, password) {
        super(nickname, email, password); // Call the parent class constructor
        this.firstName = firstName;
        this.middleName = middleName;
        this.lastName = lastName;
        this.idCardNumber = idCardNumber;
    }

    // Update user level 2
    async updateUserLevel2() {
        const query = `
            UPDATE "user" SET first_name = $1, middle_name = $2, last_name = $3, id_card_number = $4, account_level = $5
            WHERE email = $6
            RETURNING *;
        `;
        const values = [this.firstName, this.middleName, this.lastName, this.idCardNumber, 2, this.email];
        const result = await pool.query(query, values);
        return result.rows[0];
    }
};

module.exports = { User, UserLevel2 };