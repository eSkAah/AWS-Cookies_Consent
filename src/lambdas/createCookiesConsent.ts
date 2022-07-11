import * as AWS from 'aws-sdk';
import {formatUserIp} from "/opt/nodejs/utils/formatUserIp";
import {CookiesConsent} from "/opt/nodejs/entities/CookiesConsent";

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = "CookiesConsent"

export const handler = async (event: any, context:any ): Promise<any> => {
    console.log("EVENT API",event)
    console.log("CONTEXT API",context)

    if(!event.body){
        return {
            body: 'Error, data not found', statusCode: 400,
        }
    }

    const body = typeof event.body == "object" ? event.body : JSON.parse(event.body);
    const userAgent = event.headers["User-Agent"];
    const userIp = formatUserIp(event.requestContext.identity.sourceIp);

    const cookiesConsent: CookiesConsent = new CookiesConsent(body);
    cookiesConsent.url= event.headers.Host;
    cookiesConsent.userAgent = userAgent
    cookiesConsent.anonymousIp = userIp

    console.log("CookiesConsent ",cookiesConsent);

    const createDynamodbCookiesParams = {
        TableName: tableName,
        Item: cookiesConsent.toItem(),
        ConditionExpression: "attribute_not_exists(PK)",
    };
    await dynamodb.put(createDynamodbCookiesParams).promise();

        return {
            statusCode: 200,
            body: "Your parameters has been saved",

        };
};

