import * as AWS from 'aws-sdk';
import {formatUserIp} from "/opt/nodejs/utils/formatUserIp";
import {CookiesConsent} from "/opt/nodejs/entities/CookiesConsent";

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = "CookiesConsent";

export const handler = async (event: any, context:any ): Promise<any> => {
    console.log("TABLE NAME", tableName)

    if(!event.body){
        return {
            statusCode: 400,
            body: 'Error, data not found',
        }
    }

    const body = typeof event.body == "object" ? event.body : JSON.parse(event.body);

    const cookiesConsent: CookiesConsent = new CookiesConsent(body);
    cookiesConsent.url= event.headers.host;
    cookiesConsent.userAgent = event.headers["User-Agent"]
    cookiesConsent.anonymousIp = formatUserIp(event.requestContext.identity.sourceIp)

    console.log("Cookies Consent Data : ",cookiesConsent);

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

