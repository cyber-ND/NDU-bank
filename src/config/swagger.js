const swaggerUi = require('swagger-ui-express');

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'NIBSS Bank API',
    version: '1.0.0',
    description: 'Digital Banking System powered by NIBSS by Phoenix',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Customer: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string' },
          isVerified: { type: 'boolean' },
          hasAccount: { type: 'boolean' },
        },
      },
      Account: {
        type: 'object',
        properties: {
          accountNumber: { type: 'string' },
          bankCode: { type: 'string' },
          bankName: { type: 'string' },
          balance: { type: 'number' },
        },
      },
      Transaction: {
        type: 'object',
        properties: {
          transactionId: { type: 'string' },
          type: { type: 'string', enum: ['debit', 'credit'] },
          amount: { type: 'number' },
          fromAccount: { type: 'string' },
          toAccount: { type: 'string' },
          fromBank: { type: 'string' },
          toBank: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['SUCCESS', 'PENDING', 'FAILED'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/auth/login': {
      post: {
        summary: 'Login and receive JWT token',
        tags: ['Auth'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'john@example.com' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                    customer: { $ref: '#/components/schemas/Customer' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },

    '/api/onboarding/register': {
      post: {
        summary: 'Register a new customer',
        tags: ['Onboarding'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'kycType', 'kycID', 'dob'],
                properties: {
                  email: { type: 'string', example: 'john@example.com' },
                  password: { type: 'string', example: 'password123' },
                  kycType: { type: 'string', enum: ['bvn', 'nin'], example: 'bvn' },
                  kycID: { type: 'string', example: '12345678901' },
                  dob: { type: 'string', example: '2000-01-15' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Registration successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          400: { description: 'Validation failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          409: { description: 'Email or KYC already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    '/api/onboarding/create-account': {
      post: {
        summary: 'Create a bank account for the logged in customer',
        tags: ['Onboarding'],
        security: [{ bearerAuth: [] }],
        responses: {
          201: {
            description: 'Account created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Account' },
              },
            },
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          409: { description: 'Customer already has an account', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    '/api/accounts/me': {
      get: {
        summary: 'Get your account details',
        tags: ['Accounts'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Account details returned',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Account' },
              },
            },
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'No account found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    '/api/accounts/balance': {
      get: {
        summary: 'Get your current balance',
        tags: ['Accounts'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Balance returned',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    accountNumber: { type: 'string' },
                    balance: { type: 'number' },
                    bankName: { type: 'string' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'No account found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    '/api/accounts/name-enquiry/{accountNumber}': {
      get: {
        summary: 'Resolve an account number to account holder name',
        tags: ['Accounts'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'accountNumber',
            required: true,
            schema: { type: 'string' },
            example: '1084071287',
          },
        ],
        responses: {
          200: {
            description: 'Account name returned',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    accountNumber: { type: 'string' },
                    accountName: { type: 'string' },
                    bankName: { type: 'string' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Account not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    '/api/transfers': {
      post: {
        summary: 'Send money to another account',
        tags: ['Transfers'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['toAccount', 'amount'],
                properties: {
                  toAccount: { type: 'string', example: '1087207670' },
                  amount: { type: 'number', example: 5000 },
                  description: { type: 'string', example: 'Payment for services' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Transfer successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    transactionId: { type: 'string' },
                    amount: { type: 'number' },
                    recipient: { type: 'string' },
                    status: { type: 'string' },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid input or insufficient funds', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Account not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    '/api/transfers/history': {
      get: {
        summary: 'Get your transaction history',
        tags: ['Transfers'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of your transactions',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    transactions: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Transaction' },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    '/api/transfers/status/{transactionId}': {
      get: {
        summary: 'Check status of a specific transaction',
        tags: ['Transfers'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'transactionId',
            required: true,
            schema: { type: 'string' },
            example: 'TX1776340463722',
          },
        ],
        responses: {
          200: {
            description: 'Transaction status returned',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Transaction' },
              },
            },
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Transaction not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
  },
};

module.exports = { swaggerUi, swaggerSpec };