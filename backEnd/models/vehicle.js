const pool = require('../database/postgresql');

// SQL
// create table vehicle
// (
//     id               serial
//         constraint vehicle_pk_id
//             primary key,
//     account_owner    varchar(255) not null
//         constraint vehicle___fk_owner
//             references "user" (email),
//     vehicle_type     varchar(64),
//     image_front      varchar(255),
//     image_end        varchar(255),
//     image_rear_right varchar(255),
//     image_rear_left  varchar(255),
//     image_pic1       varchar(255),
//     image_pic2       varchar(255),
//     engine           varchar(255),
//     transmission     varchar(255),
//     fuel_type        varchar(255),
//     color            varchar(255),
//     seating_capacity integer,
//     air_conditioning boolean,
//     gps              boolean,
//     bluetooth        boolean,
//     price            integer,
//     title            varchar(255)
// );

// comment on table vehicle is 'Stores vehicle''s information';

// alter table vehicle
//     owner to postgres;

module.exports = class Vehicle {
    constructor(accountOwner, title, vehicleType, images, features, price) {
        this.accountOwner = accountOwner;
        this.title = title;
        this.vehicleType = vehicleType;
        this.images = images;
        this.features = features;
        this.price = price;
    }

    // Store a new vehicle
    async createVehicle() {
        const query = `
            INSERT INTO "vehicle" (account_owner, vehicle_type, image_front, image_end, image_rear_right, image_rear_left, image_pic1, image_pic2, engine, transmission, fuel_type, color, seating_capacity, air_conditioning, gps, bluetooth, price, title)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING *;
        `;
        const values = [
            this.accountOwner,
            this.vehicleType,
            this.images.imageFront,
            this.images.imageEnd,
            this.images.imageRearRight,
            this.images.imageRearLeft,
            this.images.imagePic1,
            this.images.imagePic2,
            this.features.engine,
            this.features.transmission,
            this.features.fuelType,
            this.features.color,
            this.features.seatingCapacity,
            this.features.airConditioning,
            this.features.gps,
            this.features.bluetooth,
            this.price,
            this.title
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Get vehicle by it's id
    static async getVehicleById(id) {
        const query = 'SELECT * FROM "vehicle" WHERE id = $1';
        const values = [id];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Update vehicle by it's id
    static async updateVehicleById(id, vehicleData) {
        const query = 'UPDATE "vehicle" SET vehicle_type = $1, image_front = $2, image_end = $3, image_rear_right = $4, image_rear_left = $5, image_pic1 = $6, image_pic2 = $7, engine = $8, transmission = $9, fuel_type = $10, color = $11, seating_capacity = $12, air_conditioning = $13, gps = $14, bluetooth = $15, price = $16, title = $17 WHERE id = $18 RETURNING *;';
        const values = [
            vehicleData.vehicleType,
            vehicleData.images.imageFront,
            vehicleData.images.imageEnd,
            vehicleData.images.imageRearRight,
            vehicleData.images.imageRearLeft,
            vehicleData.images.imagePic1,
            vehicleData.images.imagePic2,
            vehicleData.features.engine,
            vehicleData.features.transmission,
            vehicleData.features.fuelType,
            vehicleData.features.color,
            vehicleData.features.seatingCapacity,
            vehicleData.features.airConditioning,
            vehicleData.features.gps,
            vehicleData.features.bluetooth,
            vehicleData.price,
            vehicleData.title,
            id
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Delete vehicle by it's title
    static async deleteVehicleById(id) {
        const query = 'DELETE FROM "vehicle" WHERE id = $1';
        const values = [id];
        await pool.query(query, values);
    }
};