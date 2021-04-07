require('source-map-support').install();

import { APIGatewayProxyEvent, Handler, APIGatewayProxyResult } from 'aws-lambda'
import * as uuid from 'uuid';
import { createBudgetItem } from '../../bussinesLogic/budget';
import { CreateBudgetItemRequest } from '../../requests/CreateBudgetItemRequest'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger';

const logger = createLogger('createTodo');

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    logger.info('Processing event: ', event);

    const newBudgetItem: CreateBudgetItemRequest = JSON.parse(event.body)

    const userId = getUserId(event);

    const itemId = uuid.v4();

    const newItem = {
        ...newBudgetItem,
        amount: Number(newBudgetItem.amount),
        budgetItemId: itemId,
        userId,
        createdAt: new Date().toISOString(),
        attachmentUrl: ''
    }

    await createBudgetItem(newItem);

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            item: newItem
        })
    };
}
