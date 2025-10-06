import { SwaggerDefinition } from "swagger-jsdoc"
import { SwaggerOptions } from "swagger-ui-express"

const options : SwaggerOptions = {
    swaggerDefinition: {
        openapi: '3.1.0',
        info: {
            title: 'Synapse Call',
            description: 'A robust and scalable backend service for real-time video and audio communication. Powers seamless, low-latency video conferencing applications.',
            version: '0.0.1'
        },
        servers: [
            { url: 'http://localhost:' + process.env.PORT }
        ]
    },
    apis: [
        './src/**/*.ts'
    ]
}

export default options;