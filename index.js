import express from 'express';
import corsConfig from './src/core/config/cors.js';
import connectDB from './src/core/database/connection.js';
import globalExceptionHandler from './src/utils/globalException.js';
import logger from './src/core/config/logger.js';
import "dotenv/config"
import responseInterceptor from './src/utils/responseInterceptor.js';

// import userRouter from './src/routes/user.routes.js';
import propertyRouter from './src/routes/property.routes.js';
import bookingRoutes from './src/routes/booking.routes.js';
import agentRoutes from './src/routes/agents.routes.js';
import tenantRoutes from'./src/routes/tenant.routes.js';
import userRoutes from './src/routes/user.routes.js';
import companyRoutes from './src/routes/company.routes.js';
import ownerRoutes from './src/routes/owner.routes.js';
import complainRoutes from './src/routes/complain.routes.js';
import typeRoutes from './src/routes/type.routes.js';
import billRoutes from './src/routes/bill.routes.js'
import path from "path";
import mongoose from 'mongoose';

const app = express();
const PORT = (() => {
    const env = process.env.ENV;
    return env === 'development' ? 7200 : 4545;
})();

app.use(express.json());
app.use(corsConfig);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use((req, res, next) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
    next();
});

// await mongoose.connect('mongodb+srv://rental_property:rental_property%40samyotech2024@cluster0.kv1f8.mongodb.net/rms?retryWrites=true&w=majority&appName=Cluster0')
console.log('database connected successfully');
connectDB()
    .then(() => {
        logger.info('Database connected successfully');
    })
    .catch((err) => {
        logger.error(`Database connection failed: ${err.message}`);
    });

app.use(responseInterceptor);

// app.use('/api/v1/user', userRouter)
app.use('/api/v1/complain', complainRoutes);
app.use('/api/v1/property', propertyRouter);
app.use('/api/v1/bill', billRoutes);
app.use('/api/v1/booking', bookingRoutes)
app.use('/api/v1/agent', agentRoutes);
app.use('/api/v1/tenant', tenantRoutes);
app.use('/api/v1/owner', ownerRoutes);
app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/types', typeRoutes);
app.use('/api/v1/user', userRoutes);

app.use(globalExceptionHandler);

app.listen(PORT, () => {
    logger.info(`Server is running at port ${PORT}`);
    console.log(`Server is running at port ${PORT}`);
});
