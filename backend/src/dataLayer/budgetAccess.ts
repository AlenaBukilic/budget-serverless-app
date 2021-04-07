import { BudgetItem } from "../models/BudgetItem";

import { UpdateBudgetItemRequest } from "../requests/UpdateBudgetItemRequest";
import { CreateBudgetItemRequest } from "../requests/CreateBudgetItemRequest";

import * as AWS from "aws-sdk";
import * as AWSXRay from 'aws-xray-sdk';
import { createLogger } from "../utils/logger";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('budgetAccess')

export class budgetAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly budgetTable: string = process.env.BUDGET_TABLE,
        private readonly budgetIdIndex: string = process.env.BUDGET_ID_INDEX) {
    }

    async getBudgetItemsForUser(userId: string): Promise<BudgetItem[]> {

        const budgetItems = await this.docClient.query({
            TableName: this.budgetTable,
            KeyConditionExpression: "userId = :uId",
            ExpressionAttributeValues: {":uId": userId}
        }).promise()

        const items = budgetItems.Items

        logger.info("Query to get BudgetItems returned: ", items)
        console.log("Query returned:", items)

        return items as BudgetItem[]
    }

    async getBudgetItemById(budgetItemId: string): Promise <BudgetItem> {

        if (!budgetItemId) {
            throw new Error("budgetItemId is missing")
        }

        const budgetItems = await this.docClient.query({
            TableName: this.budgetTable,
            IndexName: this.budgetIdIndex,
            KeyConditionExpression: "budgetItemId = :budgetItemId",
            ExpressionAttributeValues: {":budgetItemId": budgetItemId},
            ScanIndexForward: false
        }).promise()

        return budgetItems.Items[0] as BudgetItem
    }

    async createBudgetItem(createRequest: CreateBudgetItemRequest): Promise<BudgetItem> {

        await this.docClient.put({
            TableName: this.budgetTable,
            Item: createRequest
        }).promise()

        return createRequest as BudgetItem
    }

    async updateBudgetItem(budgetItem: BudgetItem, updateBudgetItemRequest: UpdateBudgetItemRequest) {

        const params = updateBudgetItemRequest.attachmentUrl ? this.constructUpdateUrlParams(budgetItem, updateBudgetItemRequest) : this.constructUpdateParams(budgetItem, updateBudgetItemRequest)
        await this.docClient.update(params, function(err, data) {
            logger.error('log paraaaaams: ', updateBudgetItemRequest)
            if (err) {
                logger.error(`Unable to update budget item. Error JSON: ${JSON.stringify(err, null, 2)}`);
                throw new Error("Unable to update budget item: " + err.message)
            } else {
                logger.info(`Update succeeded:, ${JSON.stringify(data)}`);
            }
        }).promise();

    }

    async deleteBudgetItem(budgetItem: BudgetItem) {
        await this.docClient.delete({
            TableName: this.budgetTable,
            Key: {
                budgetItemId: budgetItem.budgetItemId,
                userId: budgetItem.userId
            }
        }).promise()
    }

    constructUpdateParams(p_budgetItem, p_newValues) {
        return {
            TableName: this.budgetTable,
            Key: {
                "userId": p_budgetItem.userId,
                "budgetItemId": p_budgetItem.budgetItemId,
            },
            UpdateExpression: "SET #_income = :i",
            ExpressionAttributeValues: {
                ":i" : p_newValues.income
            },
            ExpressionAttributeNames: {
                "#_income": "income"
            }
        }
    }

    constructUpdateUrlParams(p_budgetItem, p_newValues) {
        return {
            TableName: this.budgetTable,
            Key: {
                "userId": p_budgetItem.userId,
                "budgetItemId": p_budgetItem.budgetItemId,
            },
            UpdateExpression: "SET #_attachmentUrl = :a",
            ExpressionAttributeValues: {
                ":a" : p_newValues.attachmentUrl
            },
            ExpressionAttributeNames: {
                "#_attachmentUrl": "attachmentUrl"
            }
        }
    }
}
