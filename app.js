const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require('cors');
const expressJSDocSwagger = require('express-jsdoc-swagger');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json');

// Middlewares
const errorMiddleware = require("./middlewares/error");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const contentRoutes = require("./routes/contentRoutes")

// Initialize Express App
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*", credentials: true }));


// Routes
app.use("/api/v1", userRoutes);
app.use("/api/v1", adminRoutes);
app.use("/api/v1",contentRoutes)

// Error Handling
app.use(errorMiddleware);


// Swagger UI

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

module.exports = app;
