const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'SundayMall',
    description: 'Auto-generated docs',
  },
  host: 'http://localhost:5000',
  schemes: ['http'],
  tags: [
    {
      name: 'user',
      description: 'User Routes'
    },
  
  ]

};

const outputFile = './swagger-output.json';
const endpointsFiles = ['app.js']; // include all route files

swaggerAutogen(outputFile, endpointsFiles, doc)