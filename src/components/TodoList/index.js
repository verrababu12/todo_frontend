import React, { Component } from "react";
import { TbRefresh } from "react-icons/tb";
import { Rings } from "react-loader-spinner";
import TodoItem from "../TodoItem";
import "./index.css";

const apiStatusConstants = {
  initial: "INITIAL",
  loading: "LOADING",
  success: "SUCCESS",
  failure: "FAILURE",
};

class TodoList extends Component {
  state = {
    todoList: [],
    todosCount: 0,
    userInput: "",
    editingTodoId: null,
    editingText: "",
    apiStatus: apiStatusConstants.initial,
  };

  componentDidMount() {
    this.fetchTodoList();
  }

  fetchTodoList = async () => {
    this.setState({ apiStatus: apiStatusConstants.loading });
    try {
      const response = await fetch("https://todo-backend-4x6k.onrender.com/api/todos");
      if (!response.ok) {
        throw new Error("Failed to fetch todos");
      }
      const data = await response.json();
      this.setState({
        todoList: data,
        todosCount: data.length,
        apiStatus: apiStatusConstants.success,
      });
    } catch (error) {
      console.error("Error fetching todos:", error);
      this.setState({ apiStatus: apiStatusConstants.failure });
    }
  };

  onAddTodo = async () => {
    const { userInput, todosCount } = this.state;
    if (!userInput) {
      alert("Enter valid text");
      return;
    }

    const newTodo = {
      text: userInput,
      uniqueNo: todosCount + 1,
      isChecked: false,
    };

    try {
      const response = await fetch("https://todo-backend-4x6k.onrender.com/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTodo),
      });
      const addedTodo = await response.json();
      this.setState((prevState) => ({
        todoList: [...prevState.todoList, addedTodo],
        todosCount: prevState.todosCount + 1,
        userInput: "",
      }));
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  onTodoStatusChange = async (todoId, isChecked) => {
    try {
      await fetch(`https://todo-backend-4x6k.onrender.com/api/todos/${todoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isChecked }),
      });
      this.setState((prevState) => ({
        todoList: prevState.todoList.map((todo) =>
          todo._id === todoId ? { ...todo, isChecked } : todo
        ),
      }));
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  onDeleteTodo = async (todoId) => {
    try {
      await fetch(`https://todo-backend-4x6k.onrender.com/api/todos/${todoId}`, {
        method: "DELETE",
      });
      this.fetchTodoList();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  startEditingTodo = (todo) => {
    this.setState({ editingTodoId: todo._id, editingText: todo.text });
  };

  handleEditInputChange = (event) => {
    this.setState({ editingText: event.target.value });
  };

  saveEditedTodo = async () => {
    const { editingTodoId, editingText } = this.state;
    try {
      await fetch(`https://todo-backend-4x6k.onrender.com/api/todos/${editingTodoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editingText }),
      });
      this.setState({ editingTodoId: null, editingText: "" });
      this.fetchTodoList();
    } catch (error) {
      console.error("Error saving edited todo:", error);
    }
  };

  handleInputChange = (e) => {
    this.setState({ userInput: e.target.value });
  };

  handleEditKeyPress = (event) => {
    if (event.key === "Enter") {
      this.saveEditedTodo();
    }
  };

  renderLoadingView = () => {
    return (
      <div className="loading-container">
        <Rings
          visible={true}
          height="80"
          width="80"
          color="#4fa94d"
          ariaLabel="rings-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    );
  };

  renderFailureView = () => {
    return (
      <div>
        <h1>Something Error!</h1>
      </div>
    );
  };

  onClickRefreshBtn = () => {
    this.fetchTodoList();
  };

  renderTodos = () => {
    const { todoList, editingTodoId, editingText } = this.state;
    return (
      <ul className="todo-items-container">
        {todoList.map((todo) => (
          <TodoItem
            key={todo._id}
            todo={todo}
            editingTodoId={editingTodoId}
            editingText={editingText}
            onTodoStatusChange={this.onTodoStatusChange}
            onDeleteTodo={this.onDeleteTodo}
            startEditingTodo={this.startEditingTodo}
            onEditInputChange={this.handleEditInputChange}
            onEditKeyPress={this.handleEditKeyPress}
            saveEditedTodo={this.saveEditedTodo}
          />
        ))}
      </ul>
    );
  };

  listView = () => {
    const { apiStatus } = this.state;
    switch (apiStatus) {
      case apiStatusConstants.loading:
        return this.renderLoadingView();
      case apiStatusConstants.success:
        return this.renderTodos();
      case apiStatusConstants.failure:
        return this.renderFailureView();
      default:
        return null;
    }
  };

  render() {
    const { userInput, apiStatus } = this.state;

    return (
      <div className="background-container">
        <div className="todo-app-container">
          <h1>Todo List</h1>

          <input
            type="text"
            value={userInput}
            onChange={this.handleInputChange}
            className="todo-input"
            placeholder="What needs to be done?"
          />
          <button onClick={this.onAddTodo} className="add-todo-button">
            Add Todo
          </button>

          <div className="save-head-container">
            <p>Create Tasks</p>
            <button
              type="button"
              onClick={this.onClickRefreshBtn}
              className="refresh-button"
              disabled={apiStatus === apiStatusConstants.loading}
            >
              <TbRefresh size={18} />
            </button>
          </div>

          {this.listView()}
        </div>
      </div>
    );
  }
}

export default TodoList;
