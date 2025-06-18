import { Auth } from "aws-amplify";

type AmplifyAuthConfig = {
    region: string;
    userPoolId: string;
    userPoolWebClientId: string;
    userPoolWebClientSecret:string;
    authenticationFlowType:string
};

const VITE_APP_USER_POOL_ID = import.meta.env.VITE_APP_USER_POOL_ID;
const VITE_APP_REGION = import.meta.env.VITE_APP_REGION;
const VITE_APP_USER_POOL_WEBCLIENT_ID = import.meta.env.VITE_APP_USER_POOL_WEBCLIENT_ID;
const VITE_APP_USER_POOL_CLIENT_SECRET = import.meta.env.VITE_APP_USER_POOL_CLIENT_SECRET;

export const awsConfig: AmplifyAuthConfig = {
    region: VITE_APP_REGION,
    userPoolId: VITE_APP_USER_POOL_ID,
    userPoolWebClientId: VITE_APP_USER_POOL_WEBCLIENT_ID,
    userPoolWebClientSecret:VITE_APP_USER_POOL_CLIENT_SECRET,
    authenticationFlowType: 'USER_PASSWORD_AUTH'
};

const dev = {
  Auth: awsConfig,
  API: {
    endpoints: [
      {
        name: 'vivid-api',
        endpoint: import.meta.env.VITE_APP_BASE_URL,
        custom_header: async () => {
          try{
            const session = localStorage.getItem('serviceToken')
            return { Authorization: `Bearer ${session}` };
          }catch(err){
            console.log(err)
            console.error("Error while getting session",err)
            await Auth.signOut({ global: true });
          }
        }
      },
      {
        name:'vivid-api-twilio',
        endpoint:import.meta.env.VITE_APP_CALLING_SYSTEM_URL
      }
    ]
  }
};

const config = {...dev}

export default config;