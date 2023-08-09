const { VERSIONS } = require('@asymmetrik/node-fhir-server-core').constants;
require("dotenv").config();
const cors = require('cors')
const env = require('var');
const jwttoken = require('./middleware/requireAuth');
/**
 * @name mongoConfig
 * @summary Configurations for our Mongo instance
 */
let mongoConfig = {
  //mongodb database url TEST:
  connection: 'mongodb+srv://JamesDoe:jamesDoe123@cluster0.7vmtnoj.mongodb.net/?retryWrites=true&w=majority',
	//connection: 'mongodb+srv://ncai:ncai@cluster0.bnkbae6.mongodb.net/?retryWrites=true&w=majority',
};

// Set up whitelist
let whitelist_env = ("http://localhost" && "http://localhost".split(',').map((host) => host.trim())) || false;

// If no whitelist is present, disable cors
// If it's length is 1, set it to a string, so * works
// If there are multiple, keep them as an array


// let whitelist = whitelist_env && whitelist_env.length === 1 ? whitelist_env[0] : whitelist_env;

/**
 * @name fhirServerConfig
 * @summary @asymmetrik/node-fhir-server-core configurations.
 */
let fhirServerConfig = {
  auth: {
    // This servers URI

    resourceServer: 'http://localhost:3001',
    //    strategy: {
    // 	name: 'bearer',
    // 	useSession: false,
    // 	service: './src/strategies/bearer.strategy.js'
    // },

  },
  server: {
    // support various ENV that uses PORT vs SERVER_PORT

    port: env.PORT || 3001,
    // allow Access-Control-Allow-Origin
    corsOptions: {
      maxAge: 86400,
      origin: '*',
      // cors: cors()
    },
  },
  logging: {
    level: "debug",
  },
  //
  // If you want to set up conformance statement with security enabled
  // Uncomment the following block
  //
  security: [
    {
      url: 'authorize',
      valueUri: `http://localhost:3000/authorize`,
    },
    {
      url: 'token',
      valueUri: jwttoken,
    },
    // optional - registration
  ],
  profiles: {
    // Users:{
    //   service: './services/users/app.service.js',
    //   versions: [VERSIONS['4_0_0']],
    //   required: true,

    // },
    Practitioner: {
      service: './src/services/practitioner/practitioner.service.js',
      versions: [VERSIONS['4_0_0']],
    },
    Patient: {
      service: './src/services/patient/patient.service.js',
      versions: [VERSIONS['4_0_0']],
      operation: [
        {
          name: 'generalPractitioner',
          route: '/:id/$generalPractitioner',
          method: 'GET',
        },
        {
          name: 'generalPractitionerById',
          route: '/:id/$generalPractitionerById',
          method: 'GET',
        },
      ],

      // operation: [
      //   {
      //     name: 'everything',
      //     route: '/$everything',
      //     method: 'GET',
      //     reference: 'https://www.hl7.org/fhir/patient-operation-everything.html',
      //   },
      //   // {
      //   //   name: 'everything-by-id',
      //   //   route: '/:id/$everything',
      //   //   method: 'GET',
      //   //   reference: 'https://www.hl7.org/fhir/patient-operation-everything.html',
      //   // },
      // ],
    },

    Questionnaire: {
      service: './src/services/questionnaire/questionnaire.service.js',
      versions: [VERSIONS['4_0_0']],
    },
    Questionnaireresponse: {
      service: './src/services/questionnaireresponse/questionnaireresponse.service.js',
      versions: [VERSIONS['4_0_0']],
    },
    Medicationrequest: {
      service: './src/services/medicationrequest/medicationrequest.service.js',
      versions: [VERSIONS['4_0_0']],
    },
  PlanDefinition: {
      service: './src/services/plandefinition/plandefinition.service.js',
      versions: [VERSIONS['4_0_0']],
    },
    
  },
};

module.exports = {
  fhirServerConfig,
  mongoConfig,
};
