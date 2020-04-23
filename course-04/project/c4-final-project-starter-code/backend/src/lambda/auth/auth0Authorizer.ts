import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
//decode
import { createLogger } from '../../utils/logger'
//import Axios from 'axios'
//import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
//import * as util from 'util';

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
//const jwksUrl = 'https://doola.auth0.com/.well-known/jwks.json'
const cert = `-----BEGIN CERTIFICATE-----
MIIC+TCCAeGgAwIBAgIJQ6RBCVKwtggGMA0GCSqGSIb3DQEBCwUAMBoxGDAWBgNVBAMTD2Rvb2xhLmF1dGgwLmNvbTAeFw0yMDA0MTcxMDQ0MzRaFw0zMzEyMjUxMDQ0MzRaMBoxGDAWBgNVBAMTD2Rvb2xhLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALWwIjU6EwDvhjpSA2lYIcU1dZLFiMbbjMYHfSa+GiREBEPYlE/H/q+GdCcu8zEOpPUBzBZDQNFVOyEqcCxDf3/Ui4IlxN/RSyZx69/0uQcMooPAaRyfh86HUiuCh78ZQo55kQFrOUkceczip1AUG7Po0HzVOpOyxL1/jHv2pIE7fW9NWjLPhSLhz9lmZqENGX6FKyaaiy7b/TSvsb8b0Y6mQiF/6OnGbIF29HndUckgnYZ1Ws8rteXy4CJ5uH3eQzjSNwVLqSu9b5Th9JN2+Zcb1orgtZ5JZvYlzABdcis5mpeVv/EYHjy1TrxmW56hRAgFDrTkaI390LL0BhWPkVUCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUAXfFPmzrur4oKoqROeV/jCCjfpQwDgYDVR0PAQH/BAQDAgKEMA0GCSqGSIb3DQEBCwUAA4IBAQCpp4xqskYEIrSNW5ccA3E+3GqwG/SD+76ZCuK9FJEXGlfoH/bmqkSGo2FUCxObEmsLtVpzDXhUd74NScYkcfOHtg5N8s7X9+8mqRErZfNQms7FOK5WcavKoA/bwVVNb73Pva7yrT3xog4ntsyrW7ihug6uPOl51DwIidY9lSuke8eUS0qbnWqzvkUS8pLZxDdKJmAfwLQPvWOARKUBf64UBqVv2I/dgzea54mfj0MvQvnqdBLsA0EFCC0xrlGJYgc0H/MaYdZa+o9812qIB34rYn5my7oKG1gWIBZ3+nFD86mqrwUghKRFfYc78/YqfwoPX+pcS0zRjwJEQt7Wm+jD
-----END CERTIFICATE-----
`;

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  //const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

  //if(!jwt){
  //  throw new Error('invalid token')
  //}
  //const AuthData=await Axios(jwksUrl);
  //const responseData = AuthData.data;
  //const certificate=responseData.keys[0].x5c[0]

 // return verify(token,AuthData.data, {algorithms: ['RS256']}) as JwtPayload
 //const response = await Axios.get(jwksUrl);
 return verify(token, cert, { algorithms: ["RS256"] }) as JwtPayload;
 
 
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
