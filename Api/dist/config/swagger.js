import path from "path";
import swaggerJSDoc from "swagger-jsdoc";
export const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: "3.0.3",
        info: {
            title: "Task Manager API",
            version: "1.0.0",
            description: "API de tareas (proyectos, filtros, paginación, etc.)",
        },
        servers: [{ url: "http://localhost:3000/api", description: "local" }],
        security: [{ bearerAuth: [] }],
        components: {
            securitySchemes: {
                bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
            },
            parameters: {
                PageParam: { in: "query", name: "page", schema: { type: "integer", minimum: 1 }, description: "Página (1..n)" },
                PageSizeParam: { in: "query", name: "pageSize", schema: { type: "integer", minimum: 1, maximum: 100 }, description: "Tamaño de página" },
                SortParam: { in: "query", name: "sort", schema: { type: "string" }, description: "Campo de orden (createdAt, priority, dueDate...)" },
                OrderParam: { in: "query", name: "order", schema: { type: "string", enum: ["asc", "desc"] }, description: "Dirección de orden" },
                StatusParam: { in: "query", name: "statusId", schema: { type: "integer" }, description: "Filtro por estado" },
                QParam: { in: "query", name: "q", schema: { type: "string" }, description: "Búsqueda por texto" },
            },
            schemas: {
                Task: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        title: { type: "string" },
                        description: { type: "string", nullable: true },
                        createdAt: { type: "string", format: "date-time" },
                        dueDate: { type: "string", format: "date-time", nullable: true },
                        creatorId: { type: "integer" },
                        assigneeId: { type: "integer", nullable: true },
                        projectId: { type: "integer" },
                        statusId: { type: "integer" },
                        priorityId: { type: "integer" },
                    },
                    required: ["id", "title", "projectId", "statusId", "priorityId", "creatorId", "createdAt"],
                },
                TaskCreate: {
                    type: "object",
                    required: ["title", "projectId", "statusId", "priorityId"],
                    properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        dueDate: { type: "string", format: "date-time" },
                        assigneeId: { type: "integer" },
                        projectId: { type: "integer" },
                        statusId: { type: "integer" },
                        priorityId: { type: "integer" },
                    },
                },
                Project: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        name: { type: "string" },
                        description: { type: "string", nullable: true },
                        createdAt: { type: "string", format: "date-time" },
                        ownerId: { type: "integer" }
                    },
                    required: ["id", "name", "createdAt", "ownerId"]
                },
                TaskUpdate: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        description: { type: "string", nullable: true },
                        dueDate: { type: "string", format: "date-time", nullable: true },
                        assigneeId: { type: "integer", nullable: true },
                        statusId: { type: "integer" },
                        priorityId: { type: "integer" },
                    },
                },
                PageInfo: {
                    type: "object",
                    properties: {
                        page: { type: "integer" },
                        pageSize: { type: "integer" },
                        total: { type: "integer" },
                        totalPages: { type: "integer" },
                    },
                },
                TaskListResponse: {
                    type: "object",
                    properties: {
                        items: { type: "array", items: { $ref: "#/components/schemas/Task" } },
                        pageInfo: { $ref: "#/components/schemas/PageInfo" },
                    },
                },
                Error: {
                    type: "object",
                    properties: { message: { type: "string" } },
                },
            },
        },
    },
    apis: [path.resolve("src/**/*.routes.ts"), path.resolve("src/**/*.controller.ts")],
});
//# sourceMappingURL=swagger.js.map