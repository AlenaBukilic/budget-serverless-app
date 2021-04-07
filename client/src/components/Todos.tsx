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

import { createTodo, deleteTodo, getTodos, patchTodo } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Todo } from '../types/Todo'

interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  todos: Todo[]
  newTodoName: string
  loadingTodos: boolean
  budget: number
}

export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: [],
    newTodoName: '',
    loadingTodos: true,
    budget: 0
  }

  calculateBalance = (todos: Todo[]) => {
      let budget: number = 0;
      todos.forEach((todo) => {
          budget = !todo.income ? (budget - Number(todo.amount)) : (budget + Number(todo.amount))
      })
      return budget;
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoName: event.target.value })
  }

  onEditButtonClick = (budgetItemId: string) => {
    this.props.history.push(`/budgets/${budgetItemId}/edit`)
  }

  onTodoCreateIncome = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
        if (!this.state.newTodoName) {
            alert('Input cannot be empty.');
            return;
        }
        const newTodo = await createTodo(this.props.auth.getIdToken(), {
            amount: Number(this.state.newTodoName),
            income: true
        })
        this.setState({
            todos: [...this.state.todos, newTodo],
            newTodoName: ''
        })
        } catch {
        alert('Todo creation failed')
        }
  }

  onTodoCreateExp = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
        if (!this.state.newTodoName) {
            alert('Input cannot be empty.');
            return;
        }
        const newTodo = await createTodo(this.props.auth.getIdToken(), {
            amount: Number(this.state.newTodoName),
            income: false
        })
        this.setState({
            todos: [...this.state.todos, newTodo],
            newTodoName: ''
        })
        } catch {
        alert('Todo creation failed')
        }
  }

  onTodoDelete = async (todoId: string) => {
    try {
      await deleteTodo(this.props.auth.getIdToken(), todoId)
      this.setState({
        todos: this.state.todos.filter(todo => todo.budgetItemId != todoId)
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  onTodoCheck = async (pos: number) => {
    try {
      const todo = this.state.todos[pos]
      await patchTodo(this.props.auth.getIdToken(), todo.budgetItemId, {
        income: !todo.income
      })
      this.setState({
        todos: update(this.state.todos, {
          [pos]: { income: { $set: !todo.income } }
        })
      })
    } catch {
      alert('Todo update failed')
    }
  }

  async componentDidMount() {
    try {
      const todos = await getTodos(this.props.auth.getIdToken())
      this.setState({
        todos,
        loadingTodos: false
      })
    } catch (e) {
      alert(`Failed to fetch todos: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Balance: {this.calculateBalance(this.state.todos)}</Header>

        {this.renderCreateTodoInput()}

        {this.renderTodos()}
      </div>
    )
  }

  renderCreateTodoInput() {
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
                    onClick: this.onTodoCreateIncome
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
                    onClick: this.onTodoCreateExp
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

  renderTodos() {
    if (this.state.loadingTodos) {
      return this.renderLoading()
    }

    return this.renderTodosList()
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

  renderTodosList() {
    return (
      <Grid padded>
        {this.state.todos.map((todo, pos) => {
          return (
            <Grid.Row key={todo.budgetItemId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onTodoCheck(pos)}
                  checked={!todo.income}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle" color={todo.income ? "green" : "red"}>
                {todo.amount}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {this.formateDate(todo.createdAt)}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(todo.budgetItemId)}
                >
                  <Icon name="camera" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onTodoDelete(todo.budgetItemId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {todo.attachmentUrl && (
                <Image src={todo.attachmentUrl} size="small" wrapped />
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

    return newDate.toUTCString() as string
  }
}
