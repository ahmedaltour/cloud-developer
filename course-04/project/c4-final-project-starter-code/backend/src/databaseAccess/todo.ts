import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
//import {createLogger} from '../utils/logger'

//const logger = createLogger('datalayer');

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

export class TodoDatabase {

  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly S3 = new XAWS.S3({signatureVersion: 'v4'}),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly indexName = process.env.USER_ID_INDEX,
    private readonly bucket = process.env.S3_BUCKET,
    ) 
    {
  }

  async getAllTodes(userId: string): Promise<TodoItem[]> {
    console.log('Getting all Todes')


  const result = await this.docClient.query({
    TableName: this.todosTable,
    IndexName: this.indexName,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
          ':userId': userId
      }
  	}).promise();
    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise();
    return todo
  }
  
 async updateTodo(userId: string, todoId: string, updatedTodo: TodoUpdate) {
    
  await this.docClient.update({
  TableName:this.todosTable,
  Key:{ userId, todoId},
  ExpressionAttributeNames: {"#NAME": "name"},
  UpdateExpression: "set #NAME=:todoName, dueDate=:dueDate, done=:done",
  ExpressionAttributeValues:{
      ":todoName": updatedTodo.name,
      ":dueDate": updatedTodo.dueDate,
      ":done": updatedTodo.done
  },
  ReturnValues:"UPDATED_NEW"
  }).promise();
  return {};
}

async deleteTodo(todoId: string, userId: string) {
  
  var params = {
    TableName:this.todosTable,
    Key:{
        userId,todoId
    }
    };

 await this.docClient.delete(params).promise();
  
  return {};
}

   
  
  async generateUploadUrl(todoId: string, userId: string): Promise<string>{
     const uploadUrl = this.S3.getSignedUrl('putObject', {
       Bucket: this.bucket,
       Key: todoId,
       Expires: 500
     })
     await this.docClient.update({
      TableName:this.todosTable,
      Key:{ userId, todoId},
      UpdateExpression: "set attachmentUrl=:URL",
      ExpressionAttributeValues:{
          ":URL": uploadUrl.split("?")[0]
      },
      ReturnValues:"UPDATED_NEW"
      }).promise();

     return uploadUrl; 
  }



}


