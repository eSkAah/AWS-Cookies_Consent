import * as AWS from 'aws-sdk';
import {formatUserIp} from "/opt/nodejs/utils/formatUserIp";
import {CookiesConsent} from "/opt/nodejs/entities/CookiesConsent";

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = "CookiesConsent";
// const metrics = new Metrics();

export const handler = async (event: any, context:any ): Promise<any> => {

    if(!event.body){
        return {
            statusCode: 400,
            body: 'Error, data not found',
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
    // metrics.addMetric('UserCookiesConsent', MetricUnits.Count, 1)

        return {
            statusCode: 200,
            body: `${userAgent}'s parameters saved`,
        };
};

