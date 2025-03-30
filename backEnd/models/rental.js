const pool = require('../database/postgresql');

// SQL
// create table renting
// (
//     id         serial
//         constraint renting_pk
//             primary key,
//     vehicle_id integer      not null
//         constraint renting___fk_vehicle_id
//             references vehicle,
//     rented_by  varchar(255) not null
//         constraint renting___fk_rentedby
//             references "user" (email),
//     start_date timestamp    not null,
//     end_date   timestamp
// );

// comment on table renting is 'Renting Storing';

// alter table renting
//     owner to postgres;

// Check if the start date is before the end date
function validateTime (startDate, endDate) {
    if (startDate >= endDate) {
        return false;
    }
    return true;
} 

module.exports = class Rental {
    constructor(vehicleId, rentedBy, startDate, endDate) {
        if (!validateTime(startDate, endDate)) {
            throw new Error('Start date must be before end date.');
        }
        this.vehicleId = vehicleId;
        this.rentedBy = rentedBy;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    // Check if the vehicle is available for rent
    async isVehicleAvailable() {
        const query = `
            SELECT * FROM renting
            WHERE vehicle_id = $1 AND
            (
                (start_date <= $2 AND end_date >= $2) OR
                (start_date <= $3 AND end_date >= $3) OR
                (start_date >= $2 AND end_date <= $3)
            );
        `;
        const values = [this.vehicleId, this.startDate, this.endDate];
        const result = await pool.query(query, values);
        return result.rowCount === 0; // If no rows are returned, the vehicle is available
    }

    // Create a new rental
    async createRental() {
        // Check if the vehicle is available for rent
        const isAvailable = await this.isVehicleAvailable();
        if (!isAvailable) {
            return 'Vehicle is not available for rent during the specified period.';
        }
        const query = `
            INSERT INTO "renting" (vehicle_id, rented_by, start_date, end_date)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [this.vehicleId, this.rentedBy, this.startDate, this.endDate];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Update rental by ID
    async updateRental(id) {
    // Check if the new rental period overlaps with existing rentals
        const queryCheckAvailability = `
            SELECT * FROM "renting"
            WHERE vehicle_id = $1
            AND id != $2 -- Exclude the current rental
            AND (
                (start_date <= $3 AND end_date >= $3) OR
                (start_date <= $4 AND end_date >= $4) OR
                (start_date >= $3 AND end_date <= $4)
            );
        `;
        const valuesCheckAvailability = [this.vehicleId, id, this.startDate, this.endDate];
        const availabilityResult = await pool.query(queryCheckAvailability, valuesCheckAvailability);

        // If there are overlapping rentals, return an error
        if (availabilityResult.rowCount > 0) {
            return 'Vehicle is not available for rent during the specified period.';
        }

        // Proceed with the update if no conflicts are found
        const queryUpdate = `
            UPDATE "renting"
            SET vehicle_id = $1, rented_by = $2, start_date = $3, end_date = $4
            WHERE id = $5
            RETURNING *;
        `;
        const valuesUpdate = [this.vehicleId, this.rentedBy, this.startDate, this.endDate, id];
        const updateResult = await pool.query(queryUpdate, valuesUpdate);

        return updateResult.rows[0];
    }

    // Get rental by ID
    static async getRentalById(id) {
        const query = 'SELECT * FROM "renting" WHERE id = $1';
        const values = [id];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Delete rental by ID
    static async deleteRentalById(id) {
        const query = 'DELETE FROM "renting" WHERE id = $1 RETURNING *';
        const values = [id];
        const result = await pool.query(query, values);
        return result.rows[0];
    }
}