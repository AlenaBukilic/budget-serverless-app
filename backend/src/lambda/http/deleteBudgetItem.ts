require('source-map-support').install();

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { deleteBudgetItem } from '../../bussinesLogic/budget';
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger';

const logger = createLogger('deleteBudgetItem');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    logger.info("Delete handler called for event: ", event)

    const { budgetItemId } = event.pathParameters;
    const userId = getUserId(event);

    await deleteBudgetItem(userId, budgetItemId);
    return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({})
    }
}
