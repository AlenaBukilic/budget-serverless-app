import { apiEndpoint } from '../config'
import { BudgetItem } from '../types/BudgetItem';
import { CreateBudgetItemRequest } from '../types/CreateBudgetItemRequest';
import Axios from 'axios'
import { UpdateBudgetItemRequest } from '../types/UpdateBudgetItemRequest';

export async function getBudgetItems(idToken: string): Promise<BudgetItem[]> {
  console.log('Fetching budgets')

  const response = await Axios.get(`${apiEndpoint}/budgets`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('budgets:', response.data)
  return response.data.items
}

export async function createBudgetItem(
  idToken: string,
  newBudgetItem: CreateBudgetItemRequest
): Promise<BudgetItem> {
  const response = await Axios.post(`${apiEndpoint}/budgets`,  JSON.stringify(newBudgetItem), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchBudgetItem(
  idToken: string,
  budgetItemId: string,
  updatedBudgetItem: UpdateBudgetItemRequest
): Promise<void> {
  const response = await Axios.patch(`${apiEndpoint}/budgets/${budgetItemId}`, JSON.stringify(updatedBudgetItem), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  console.log('updateeeeee', response.data);
}

export async function deleteBudgetItem(
  idToken: string,
  budgetItemId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/budgets/${budgetItemId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  budgetItemId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/budgets/${budgetItemId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
