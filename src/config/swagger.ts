import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Primetrade API',
      version: '1.0.0',
      description:
        'REST API with JWT authentication and role-based access control.\n\n**How to use:** Call `/auth/login` → copy `accessToken` from response → click **Authorize** → paste token.',
    },
    servers: [{ url: '/api/v1', description: 'Development' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            username: { type: 'string' },
            role: { type: 'string', enum: ['USER', 'ADMIN'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'] },
            userId: { type: 'string' },
            createdBy: { type: 'string' },
            updatedBy: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
            details: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          tags: ['System'],
          summary: 'Health check',
          responses: { '200': { description: 'Server healthy' } },
        },
      },
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'username', 'password'],
                  properties: {
                    email: { type: 'string', example: 'user@example.com' },
                    username: { type: 'string', example: 'johndoe' },
                    password: { type: 'string', example: 'Password1' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Registered. accessToken returned in body for Swagger use.' },
            '409': { description: 'Email or username already in use' },
            '422': { description: 'Validation error' },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'user@example.com' },
                    password: { type: 'string', example: 'Password1' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Login successful. Copy accessToken → click Authorize.' },
            '401': { description: 'Invalid credentials' },
          },
        },
      },
      '/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current user profile',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'User profile' },
            '401': { description: 'Not authenticated' },
          },
        },
      },
      '/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Refresh access token (uses refresh cookie)',
          responses: { '200': { description: 'New tokens issued' } },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout and clear tokens',
          responses: { '200': { description: 'Logged out' } },
        },
      },
      '/tasks': {
        get: {
          tags: ['Tasks'],
          summary: 'List tasks — users see own, admins see all',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'] } },
            { name: 'sort', in: 'query', schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'title'], default: 'createdAt' } },
            { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
          ],
          responses: {
            '200': { description: 'Paginated task list' },
            '401': { description: 'Not authenticated' },
          },
        },
        post: {
          tags: ['Tasks'],
          summary: 'Create a task',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title'],
                  properties: {
                    title: { type: 'string', example: 'Fix login bug' },
                    description: { type: 'string', example: 'Users cannot login on mobile' },
                    status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'] },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Task created' },
            '422': { description: 'Validation error' },
          },
        },
      },
      '/tasks/{id}': {
        get: {
          tags: ['Tasks'],
          summary: 'Get task by ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Task' }, '403': { description: 'Forbidden' }, '404': { description: 'Not found' } },
        },
        patch: {
          tags: ['Tasks'],
          summary: 'Update task',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'] },
                  },
                },
              },
            },
          },
          responses: { '200': { description: 'Updated' }, '403': { description: 'Forbidden' }, '404': { description: 'Not found' } },
        },
        delete: {
          tags: ['Tasks'],
          summary: 'Delete task',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Deleted' }, '403': { description: 'Forbidden' }, '404': { description: 'Not found' } },
        },
      },
      '/users': {
        get: {
          tags: ['Users (Admin)'],
          summary: 'List all users (admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          ],
          responses: { '200': { description: 'Paginated user list' }, '403': { description: 'Admin only' } },
        },
      },
      '/users/{id}': {
        get: {
          tags: ['Users (Admin)'],
          summary: 'Get user by ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'User' }, '404': { description: 'Not found' } },
        },
        delete: {
          tags: ['Users (Admin)'],
          summary: 'Soft delete user',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Deactivated' }, '404': { description: 'Not found' } },
        },
      },
      '/users/{id}/role': {
        patch: {
          tags: ['Users (Admin)'],
          summary: 'Update user role',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['role'],
                  properties: { role: { type: 'string', enum: ['USER', 'ADMIN'] } },
                },
              },
            },
          },
          responses: { '200': { description: 'Role updated' }, '404': { description: 'Not found' } },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
