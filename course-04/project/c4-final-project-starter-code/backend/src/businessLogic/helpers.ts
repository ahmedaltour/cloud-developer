

import { TodoItem } from '../models/TodoItem'
import { TodoDatabase } from '../databaseAccess/todo'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { v4 as uuidv4 } from 'uuid'
import { getUserId } from '../lambda/utils'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'

const todoDatabase = new TodoDatabase()

export async function getAllTodos(event: APIGatewayProxyEvent): Promise<TodoItem[]> {
  const userId = getUserId(event);
  return todoDatabase.getAllTodes(userId);
}

export async function createTodo(event: APIGatewayProxyEvent): Promise<TodoItem> {

  const id = uuidv4();
  const userId = getUserId(event);
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  return await todoDatabase.createTodo({
  	userId: userId,
  	todoId: id,
  	createdAt: new Date().toISOString(),
  	done: false,
  	...newTodo
  })
}
export async function updateTodo(event: APIGatewayProxyEvent){
  const todoId = event.pathParameters.todoId;
  const userId = getUserId(event)
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
  return await todoDatabase.updateTodo(userId,todoId,updatedTodo);
}

export async function deleteTodo(event: APIGatewayProxyEvent){
  const userId = getUserId(event);
  const todoId = event.pathParameters.todoId;
	return await todoDatabase.deleteTodo(todoId, userId);
}




export async function generateUploadUrl(event: APIGatewayProxyEvent): Promise<string>{
  const todoId = event.pathParameters.todoId;
  const userId = getUserId(event);
  return await todoDatabase.generateUploadUrl(todoId, userId);
}
