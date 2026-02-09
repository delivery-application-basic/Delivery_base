const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL Connected...');

        // Sync models to database (Step 2: Build Database)
        // Set alter: true to update tables if they exist
        await sequelize.sync({ alter: true });
        console.log('Database tables synced.');
    } catch (error) {
        console.error('PostgreSQL Connection Error:', error.message);
        throw error;
    }
};

module.exports = { sequelize, connectDB };
