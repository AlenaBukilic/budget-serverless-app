require('source-map-support').install();

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';

import { UpdateBudgetItemRequest } from '../../requests/UpdateBudgetItemRequest';
import { createLogger } from '../../utils/logger';
import { updateBudgetItemForUser } from '../../bussinesLogic/budget';
import { getUserId } from '../utils';

const logger = createLogger('updateBudgetItem')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    logger.info("Processing event", event);

    const { budgetItemId } = event.pathParameters;
    const updatedTodo: UpdateBudgetItemRequest = JSON.parse(event.body);

    const updatedItem = {
        ...updatedTodo
    }

    await updateBudgetItemForUser(getUserId(event), budgetItemId, updatedItem)

    return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            item: updatedItem
        })
    }
}
