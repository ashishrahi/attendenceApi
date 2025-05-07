// const swaggerAutogen = require('swagger-autogen')();

// const doc = {
//   info: {
//     title: 'Persona Management API',
//     description: 'API for managing personas and authentication'
//   },
//   host: 'localhost:3000',
//   schemes: ['http'],
//   securityDefinitions: {
//     bearerAuth: {
//       type: 'apiKey',
//       name: 'Authorization',
//       in: 'header'
//     }
//   }
// };

// const outputFile = './swagger-output.json';
// const endpointsFiles = ['./src/routes/*.js'];

// swaggerAutogen(outputFile, endpointsFiles, doc);



// /* Swagger configuration */
// const options = {
//   openapi: 'OpenAPI 3',   // Enable/Disable OpenAPI. By default is null
//   language: 'en-US',      // Change response language. By default is 'en-US'
//   disableLogs: false,     // Enable/Disable logs. By default is false
//   autoHeaders: false,     // Enable/Disable automatic headers capture. By default is true
//   autoQuery: false,       // Enable/Disable automatic query capture. By default is true
//   autoBody: false         // Enable/Disable automatic body capture. By default is true
// }

// const config = require('../config/cloud');
// const swaggerAutogen = require('swagger-autogen')();
// const msg = require('./messages');

// const doc = {
// info: {
//   version: '2.0.0',      // by default: '1.0.0'
//   title: 'CloudAgent Apis',        // by default: 'REST API'
//   description: 'API for Managing queue calls',  // by default: ''
//   contact: {
//       'name': 'API Support',
//       'email': 'rajputankit22@gmail.com'
//   },
// },
// host: 'localhost:5000',
// basePath: '/',  // by default: '/'
// schemes: ['http'],   // by default: ['http']
// consumes: ['application/json'],  // by default: ['application/json']
// produces: ['application/json'],  // by default: ['application/json']
// tags: [        // by default: empty Array
//   {
//     name: 'Queue CRUD',         // Tag name
//     description: 'Queue related apis',  // Tag description
//   },
//   {
//       name: 'Health',
//       description: 'Health Check'
//   }
// ],
// securityDefinitions: {},  // by default: empty object
// definitions: {
//   helathResponse: {
//     code: msg.response.CAG001.code,
//     message: msg.response.CAG001.message,
//   },
//   'errorResponse.400': {
//     code: msg.response.CAGE002.code,
//     message: msg.response.CAGE002.message,
//   },
//   'errorResponse.403': {
//     code: msg.response.CAGE001.code,
//     message: msg.response.CAGE001.message,
//   },
//   'errorResponse.404': {
//     "code": "404",
//     "message": "Not found",
//   },
//   'errorResponse.500': {
//     code: msg.response.CAGE003.code,
//     message: msg.response.CAGE003.message,
//   }
// },          // by default: empty object (Swagger 2.0)
// };

// const outputFile = './swagger-output.json';
// const endpointsFiles = ['./src/server.js', './controllers/*.js'];

// /* NOTE: if you use the express Router, you must pass in the 
//  'endpointsFiles' only the root file where the route starts,
//  such as: index.js, app.js, routes.js, ... */
// swaggerAutogen(outputFile, endpointsFiles, doc);

// // swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
// //     require('./index.js'); // Your project's root file
// //   });


const swaggerAutogen = require('swagger-autogen')();
const msg = require('./messages');

const doc = {
  info: {
    version: '2.0.0',
    title: 'CloudAgent APIs',
    description: 'API for Managing queue calls',
    contact: {
      name: 'API Support',
      email: 'rajputankit22@gmail.com',
    },
  },
  host: process.env.SWAGGER_HOST || 'localhost:5000', // Use env variable for host
  basePath: '/',
  schemes:  'http', // Use HTTPS in production
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    {
      name: 'Queue CRUD',
      description: 'Queue related APIs',
    },
    {
      name: 'Health',
      description: 'Health Check',
    },
  ],
  definitions: {
    helathResponse: {
      code: msg.response.CAG001.code,
      message: msg.response.CAG001.message,
    },
    'errorResponse.400': {
      code: msg.response.CAGE002.code,
      message: msg.response.CAGE002.message,
    },
    'errorResponse.403': {
      code: msg.response.CAGE001.code,
      message: msg.response.CAGE001.message,
    },
    'errorResponse.404': {
      code: '404',
      message: 'Not found',
    },
    'errorResponse.500': {
      code: msg.response.CAGE003.code,
      message: msg.response.CAGE003.message,
    },
  },
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./src/server.js', './controllers/*.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);