# Budget App

This application will allow creating/removing/updating/fetching budget items. Each budget item can optionally have an attachment image. Each user only has access to budget items that he/she has created. Budget items are income or expense. The UI shows total balance for a user.

Developed using serverless framework, AWS Lambda, API Gateway, DynamoDB

# Budget items

The application should store budget items, and each budget item contains the following fields:

- `userId` (string) - a unique id for user that created the budget item
- `budgetItemId` (string) - a unique id for an item
- `createdAt` (string) - date and time when an item was created
- `amount` (number) - name of a budget item (e.g. 1000)
- `income` (boolean) - true if an item was income, false if expense
- `attachmentUrl` (string) (optional) - a URL pointing to an image attached to a TODO item

# Frontend

The `client` folder contains a web application that uses the API.

The `config.ts` file contains AWS API endpoint and Auth0 configuration:

```ts
const apiId = '...' API Gateway id
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: '...',    // Domain from Auth0
  clientId: '...',  // Client id from an Auth0 application
  callbackUrl: 'http://localhost:3000/callback'
}
```

## Authentication

Authentication is implemented using Auth0 application, using asymmetrically encrypted JWT tokens.

## Logging

Is implemented using [Winston](https://github.com/winstonjs/winston) logger that creates [JSON formatted](https://stackify.com/what-is-structured-logging-and-why-developers-need-it/) log statements.

# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless budget application.

# Postman collection

An alternative way to test your API, you can use the Postman collection that contains sample requests. You can find a Postman collection in this project. To import this collection, do the following.

Click on the import button:

![Alt text](images/import-collection-1.png?raw=true 'Image 1')

Click on the "Choose Files":

![Alt text](images/import-collection-2.png?raw=true 'Image 2')

Select a file to import:

![Alt text](images/import-collection-3.png?raw=true 'Image 3')

Right click on the imported collection to set variables for the collection:

![Alt text](images/import-collection-4.png?raw=true 'Image 4')

Provide variables for the collection (similarly to how this was done in the course):

![Alt text](images/import-collection-5.png?raw=true 'Image 5')
