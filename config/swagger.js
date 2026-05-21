const swaggerJsdoc = require('swagger-jsdoc');

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IPT 2026 Backend API',
      version: '1.0.0',
      description: 'Node.js + MySQL authentication API for IPT 2026 final project'
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Local development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js']
});

module.exports = swaggerSpec;
