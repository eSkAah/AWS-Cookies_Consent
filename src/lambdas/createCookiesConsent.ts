import * as AWS from 'aws-sdk';
import {formatUserIp} from "/opt/nodejs/utils/formatUserIp";
import {CookiesConsent} from "/opt/nodejs/entities/CookiesConsent";

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME || "";

export const handler = async (event: any, context:any ): Promise<any> => {
    console.log("Context",context)
    console.log("Event",event)

    if (!event.body){
        return {
            statusCode: 400,
            body: 'Error, data not found',
        }
    }

    if (event.headers.hasOwnProperty('Postman-Token')) {
        return {
            statusCode: 403,
            body: 'Postman is not allowed.',
        }
    }

    const body = typeof event.body == "object" ? event.body : JSON.parse(event.body);
    const userAgent = event.headers["User-Agent"];

    const cookiesConsent: CookiesConsent = new CookiesConsent(body);
    cookiesConsent.url= event.headers.host;
    cookiesConsent.userAgent = userAgent;
    cookiesConsent.anonymousIp = formatUserIp(event.requestContext.identity.sourceIp);

    const createDynamodbCookiesParams = {
        TableName: tableName,
        Item: cookiesConsent.toItem(),
        ConditionExpression: "attribute_not_exists(PK)",
    };
    await dynamodb.put(createDynamodbCookiesParams).promise();

        return {
            statusCode: 200,
            body: `${userAgent}'s parameters saved`,
        };
};

