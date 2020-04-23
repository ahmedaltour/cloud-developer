import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import {createTodo} from '../../businessLogic/helpers'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  //const newTodo: CreateTodoRequest = JSON.parse(event.body)

  // TODO: Implement creating a new TODO item
  const item = await createTodo(event)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({msg:"To-do Item was created",
      item
    })
  }
}
