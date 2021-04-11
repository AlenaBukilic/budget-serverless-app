import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createBudgetItem, deleteBudgetItem, getBudgetItems, patchBudgetItem } from '../api/budgets-api'
import Auth from '../auth/Auth'
import { BudgetItem } from '../types/BudgetItem'

interface BudgetItemsProps {
  auth: Auth;
  history: History;
}

interface BudgetItemsState {
  budgetItems: BudgetItem[];
  newBudgetItemName: string;
  loadingBudgetItems: boolean;
  budget: number;
}

export class BudgetItems extends React.PureComponent<BudgetItemsProps, BudgetItemsState> {
  state: BudgetItemsState = {
    budgetItems: [],
    newBudgetItemName: '',
    loadingBudgetItems: true,
    budget: 0
  }

  calculateBalance = (budgetItems: BudgetItem[]) => {
      let budget: number = 0;
      budgetItems.forEach((budgetItem) => {
          budget = !budgetItem.income ? (budget - Number(budgetItem.amount)) : (budget + Number(budgetItem.amount))
      })
      return budget;
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBudgetItemName: event.target.value })
  }

  onEditButtonClick = (budgetItemId: string) => {
    this.props.history.push(`/budgets/${budgetItemId}/edit`)
  }

  onBudgetItemCreateIncome = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
        if (!this.state.newBudgetItemName) {
            alert('Input cannot be empty.');
            return;
        }
        const newBudgetItem = await createBudgetItem(this.props.auth.getIdToken(), {
            amount: Number(this.state.newBudgetItemName),
            income: true
        })
        this.setState({
            budgetItems: [...this.state.budgetItems, newBudgetItem],
            newBudgetItemName: ''
        })
        } catch {
            alert('BudgetItem creation failed')
        }
  }

  onBudgetItemCreateExp = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
        if (!this.state.newBudgetItemName) {
            alert('Input cannot be empty.');
            return;
        }
        const newBudgetItem = await createBudgetItem(this.props.auth.getIdToken(), {
            amount: Number(this.state.newBudgetItemName),
            income: false
        })
        this.setState({
            budgetItems: [...this.state.budgetItems, newBudgetItem],
            newBudgetItemName: ''
        })
        } catch {
        alert('BudgetItem creation failed')
        }
  }

  onBudgetItemDelete = async (budgetItemId: string) => {
    try {
      await deleteBudgetItem(this.props.auth.getIdToken(), budgetItemId)
      this.setState({
        budgetItems: this.state.budgetItems.filter(budgetItem => budgetItem.budgetItemId != budgetItemId)
      })
    } catch {
      alert('BudgetItem deletion failed')
    }
  }

  onBudgetItemCheck = async (pos: number) => {
    try {
      const budgetItem = this.state.budgetItems[pos]
      await patchBudgetItem(this.props.auth.getIdToken(), budgetItem.budgetItemId, {
        income: !budgetItem.income
      })
      this.setState({
        budgetItems: update(this.state.budgetItems, {
          [pos]: { income: { $set: !budgetItem.income } }
        })
      })
    } catch {
      alert('BudgetItem update failed')
    }
  }

  async componentDidMount() {
    try {
      const budgetItems = await getBudgetItems(this.props.auth.getIdToken())
      this.setState({
        budgetItems,
        loadingBudgetItems: false
      })
    } catch (e) {
      alert(`Failed to fetch BudgetItems: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Balance: {this.calculateBalance(this.state.budgetItems)}</Header>

        {this.renderCreateBudgetItemInput()}

        {this.renderBudgetItems()}
      </div>
    )
  }

  renderCreateBudgetItemInput() {
    return (
      <Grid.Row>
        <Grid.Column align="center">
            <Input
                align="left"
                action={{
                    color: 'green',
                    labelPosition: 'left',
                    icon: 'add',
                    content: 'Income',
                    onClick: this.onBudgetItemCreateIncome
                }}
                actionPosition="left"
                placeholder="100"
                onChange={this.handleNameChange}
            />
            <Input
                align="right"
                action={{
                    color: 'red',
                    labelPosition: 'left',
                    icon: 'add',
                    content: 'Expense',
                    onClick: this.onBudgetItemCreateExp
                }}
                actionPosition="left"
                placeholder="100"
                onChange={this.handleNameChange}
            />
        </Grid.Column>
        <Grid.Column width={16}>
            <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderBudgetItems() {
    if (this.state.loadingBudgetItems) {
      return this.renderLoading()
    }

    return this.renderBudgetItemsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading budget...
        </Loader>
      </Grid.Row>
    )
  }

  renderBudgetItemsList() {
    return (
      <Grid padded>
        {this.state.budgetItems.map((budgetItem, pos) => {
          return (
            <Grid.Row key={budgetItem.budgetItemId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onBudgetItemCheck(pos)}
                  checked={!budgetItem.income}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle" color={budgetItem.income ? "green" : "red"}>
                {budgetItem.amount}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {this.formateDate(budgetItem.createdAt)}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(budgetItem.budgetItemId)}
                >
                  <Icon name="camera" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onBudgetItemDelete(budgetItem.budgetItemId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {budgetItem.attachmentUrl && (
                <Image src={budgetItem.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  formateDate(date: Date): string {
    const newDate = new Date(date);

    return newDate.toUTCString();
  }
}
