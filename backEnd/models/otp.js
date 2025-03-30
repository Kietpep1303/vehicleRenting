const pool = require('../database/postgresql');

// SQL
// create table otp
// (
//     email       varchar(255) not null
//         constraint otp_pk
//             primary key,
//     otp         integer,
//     expire_time timestamp
// );

// comment on table otp is 'Store OTP';

// alter table otp
//     owner to postgres;

// Create the expire time 10 minutes
function makeExpireTime() {
    const date = new Date(Date.now() + 10 * 60000); 
    return date;
}

// Generate a random OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}

module.exports = class Otp {
    constructor(email) {
        this.email = email;
        this.otp = generateOTP();
        this.expireTime = makeExpireTime();
    }

    // Create a new OTP
    async createOtp() {
        const query = `
            INSERT INTO otp (email, otp, expire_time)
            VALUES ($1, $2, $3)
            RETURNING *; 
        `; 
        const values = [this.email, this.otp, this.expireTime];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Find the email's OTP is valid or not
    static async findValidOTP(email) {
        const query = 'SELECT * FROM "otp" WHERE email = $1';
        const values = [email];
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return 'OTP not found';
        }
        if (result.expire_time < new Date()) {
            return 'OTP has expired';
        }
        return result.rows[0];
    }

    // Delete the email's OTP
    static async deleteOTP(email) {
        const query = 'DELETE FROM "otp" WHERE email = $1';
        const values = [email];
        await pool.query(query, values);
    }
};