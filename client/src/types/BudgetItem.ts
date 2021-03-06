export interface BudgetItem {
    budgetItemId: string;
    userId: string;
    createdAt: Date;
    amount: number;
    income: boolean;
    attachmentUrl?: string;
}
