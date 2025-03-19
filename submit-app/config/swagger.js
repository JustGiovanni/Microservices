const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Quiz API",
            version: "1.0.0",
            description: "API documentation for Quiz Application",
        },
    },
    apis: ["./routes/*.js"], // Load API docs from route files
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
