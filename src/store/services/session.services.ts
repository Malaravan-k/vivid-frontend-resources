import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand
} from "@aws-sdk/client-cognito-identity-provider";
import CryptoJS from "crypto-js";
import { awsConfig } from "../../config";
import { Auth } from "aws-amplify";
import { NavigateFunction } from "react-router-dom";
import { API } from "aws-amplify";

const client = new CognitoIdentityProviderClient({ region: awsConfig.region });



function getSecretHash(username: string, clientId: string, clientSecret: string) {
  const message = username + clientId;
  const hash = CryptoJS.HmacSHA256(message, clientSecret);
  return CryptoJS.enc.Base64.stringify(hash);
}


async function login(username: string, password: string) {
  const secretHash = getSecretHash(username, awsConfig.userPoolWebClientId, awsConfig.userPoolWebClientSecret);

  const command = new InitiateAuthCommand({
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: awsConfig.userPoolWebClientId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
      SECRET_HASH: secretHash,
    },
  });

  try {
    const response = await client.send(command);
    return response;
  } catch (error) {
    return Promise.reject(error);
  }
}

function logout(navigate:NavigateFunction) {
  Auth.signOut()
    .then(() => {
      localStorage.clear();
      if (navigate) {
        navigate('/login');
      }
    })
    .catch(error => {
      console.error('Error signing out:', error);
    });
}

export const sessionServices = {
  login,
  logout
};
