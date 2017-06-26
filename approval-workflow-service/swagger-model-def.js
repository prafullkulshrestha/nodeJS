/**
 * @swagger
 * definition:
 *  CreateWorkflowBody:
 *      required:
 *          - wfModel
 *          - document
 *      properties:
 *          wfModel:
 *              type: object
 *          document:
 *              type: object
 *              required:
 *                  - history
 *              properties: 
 *                  history:
 *                      description: empty array for new documents
 *                      type: array
 *                      items:
 *                          type: object
 *                          required:
 *                              - user
 *                              - action
 *                              - milestone
 *                          properties:
 *                              user:
 *                                  type: string
 *                              action:
 *                                  type: string
 *                              milestone:
 *                                  type: string
 *  DefaultSuccessResponse:
 *      required:
 *          - responseCode
 *          - responseMessage
 *      properties:
 *          responseCode:
 *              type: integer
 *              default: 0
 *          responseMessage:
 *              type: string
 *              default: Success
 *  DefaultErrorResponse:
 *      required:
 *          - responseCode
 *          - responseMessage
 *      properties:
 *          responseCode:
 *              type: integer
 *              default: 1
 *          responseMessage:
 *              type: string
 *              default: Error
 *  isUserAllowedActionBody:
 *      required:
 *          -   user
 *          -   action
 *      properties:
 *          user:
 *              type: object
 *              required:
 *                  - id
 *                  - role
 *              properties:
 *                  id:
 *                      type: string
 *                  role:
 *                      type: string
 *          action:
 *              type: string
 *          document:
 *              type: object
 *              required:
 *                  - history
 *              properties: 
 *                  history:
 *                      description: empty array for new documents
 *                      type: array
 *                      items:
 *                          type: object
 *                          required:
 *                              - user
 *                              - action
 *                              - milestone
 *                          properties:
 *                              user:
 *                                  type: string
 *                              action:
 *                                  type: string
 *                              milestone:
 *                                  type: string
 *  doActionBody:
 *      required:
 *          -   user
 *          -   action
 *      properties:
 *          user:
 *              type: object
 *              required:
 *                  - id
 *                  - role
 *              properties:
 *                  id:
 *                      type: string
 *                  role:
 *                      type: string
 *          action:
 *              type: string
 *          document:
 *              type: object
 *              required:
 *                  - history
 *              properties: 
 *                  history:
 *                      description: empty array for new documents
 *                      type: array
 *                      items:
 *                          type: object
 *                          required:
 *                              - user
 *                              - action
 *                              - milestone
 *                          properties:
 *                              user:
 *                                  type: string
 *                              action:
 *                                  type: string
 *                              milestone:
 *                                  type: string
 *  mapActionsBody:
 *      required:
 *          -   user
 *          -   data
 *      properties:
 *          user:
 *              type: object
 *              required:
 *                  - id
 *                  - role
 *              properties:
 *                  id:
 *                      type: string
 *                  role:
 *                      type: string
 *          data:
 *              type: array
 *              items:
 *                  type: object
 *                  properties:
 *                      workflowId:
 *                          type: string
 *                          required: true
 *                      wfHistory:
 *                          required: true
 *                          type: array
 *                          items:
 *                              type: object
 *                              required:
 *                                  - user
 *                                  - action
 *                                  - milestone
 *                              properties:
 *                                  user:
 *                                      type: string
 *                                  action:
 *                                      type: string
 *                                  milestone:
 *                                      type: string
 *                      anyDataToBeReturnedBack:
 *                          type: string
 *  getAllowedActionsBody:
 *      required:
 *          -   user
 *      properties:
 *          user:
 *              type: object
 *              required:
 *                  - id
 *                  - role
 *              properties:
 *                  id:
 *                      type: string
 *                  role:
 *                      type: string
 *          document:
 *              type: object
 *              required:
 *                  - history
 *              properties: 
 *                  history:
 *                      description: empty array for new documents
 *                      type: array
 *                      items:
 *                          type: object
 *                          required:
 *                              - user
 *                              - action
 *                              - milestone
 *                          properties:
 *                              user:
 *                                  type: string
 *                              action:
 *                                  type: string
 *                              milestone:
 *                                  type: string
 *  getLastMilestoneBody:
 *      properties:
 *          document:
 *              type: object
 *              required:
 *                  - history
 *              properties: 
 *                  history:
 *                      description: empty array for new documents (Required only for file based storage)
 *                      type: array
 *                      items:
 *                          type: object
 *                          required:
 *                              - user
 *                              - action
 *                              - milestone
 *                          properties:
 *                              user:
 *                                  type: string
 *                              action:
 *                                  type: string
 *                              milestone:
 *                                  type: string
 */
