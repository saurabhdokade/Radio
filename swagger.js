const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Redio',
    description: 'Auto-generated docs',
  },
  host: 'https://radio-drfi.onrender.com/',
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