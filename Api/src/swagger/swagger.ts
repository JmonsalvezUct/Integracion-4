import swaggerJsdoc from 'swagger-jsdoc';



const options = {
  swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'FastPlanner API',
            version: '1.0.0',
            description: 'API para el gestor de tareas colaborativo',
            contact: {
                name: 'Sion Arancibia'
            },
            servers: [
                {
                    url: 'http://localhost:3000/',
                    description: 'Local server'
                }
            ]
        }
    },
  apis: [
    './src/modules/**/*.routes.ts'
  ],
};


const specs = swaggerJsdoc(options);
export default specs;