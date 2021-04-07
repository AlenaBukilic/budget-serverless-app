import { budgetAccess } from '../dataLayer/budgetAccess';
import { BudgetItem } from '../models/BudgetItem';
import { UpdateBudgetItemRequest } from '../requests/UpdateBudgetItemRequest'
import { CreateBudgetItemRequest } from '../requests/CreateBudgetItemRequest'

const todoAccessor = new budgetAccess();

export function getBudgetItemsForUser(userId: string): Promise<BudgetItem[]> {
    return todoAccessor.getBudgetItemsForUser(userId);
}

export function createBudgetItem(createRequest: CreateBudgetItemRequest) {
    return todoAccessor.createBudgetItem(createRequest)
}

export function getBudgetItemById(budgetItemId: string) {
    return todoAccessor.getBudgetItemById(budgetItemId)
}

export async function updateBudgetItemForUser(userId: string, budgetItemId: string, updateBudgetItemRequest: UpdateBudgetItemRequest) {
    const item = await todoAccessor.getBudgetItemById(budgetItemId)

    if (item.userId !== userId) {
        throw new Error("You can only update items you own")
    }

    return todoAccessor.updateBudgetItem(item, updateBudgetItemRequest);
}

export async function deleteBudgetItem(userId: string, budgetItemId: string) {
    const item = await todoAccessor.getBudgetItemById(budgetItemId)

    if (item.userId !== userId) {
        throw new Error("You can only delete items you own");
    }

    return todoAccessor.deleteBudgetItem(item);
}