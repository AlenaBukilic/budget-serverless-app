require('source-map-support').install();

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { updateBudgetItemForUser } from '../../bussinesLogic/budget';
import { getUserId } from '../utils';
import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { createLogger } from '../../utils/logger';

const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('createImageUrl');

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const s3 = new XAWS.S3({
    signatureVersion: 'v4'
  })

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    logger.info("Generate upload URL called for event: ", event)
    const { budgetItemId } = event.pathParameters;
    const url = getUploadUrl(budgetItemId);

    const updatedItem = {
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${budgetItemId}`
    };

    await updateBudgetItemForUser(getUserId(event), budgetItemId, updatedItem);

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            uploadUrl: url
        })
    }
}

function getUploadUrl(budgetItemId: string) {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: budgetItemId,
        Expires: Number(urlExpiration)
    })
  }
