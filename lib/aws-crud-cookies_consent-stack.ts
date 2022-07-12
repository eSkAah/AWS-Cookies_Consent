import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as targets from "aws-cdk-lib/aws-route53-targets";
// import {EndpointType} from "aws-cdk-lib/";
import {Construct} from "constructs";
import {Stack, StackProps} from "aws-cdk-lib";
import {EndpointType} from "aws-cdk-lib/aws-apigateway";


export class AwsCrudCookiesConsentStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //Define  variables
    const cookiesModelName = "CookiesConsent";
    const hostedZoneDomain = "abr.d.kodehyve.com";
    const applicationDomain = `devtest.${hostedZoneDomain}`;
    const apiDomain = `api.${applicationDomain}`;
    const zone = route53.HostedZone.fromLookup(this, "HostedZone", {domainName: hostedZoneDomain,});

    //define dynamodb table
    const cookiesConsentTable = new dynamodb.Table(this, "CookiesConsentTable", {
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        partitionKey: {
            name: "PK",
            type: dynamodb.AttributeType.STRING
        },
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        tableName: cookiesModelName
    });

    //define lambda layer
      const cookiesConsentLayer = new lambda.LayerVersion(this, "CookiesConsentLayer", {
          compatibleRuntimes: [
              lambda.Runtime.NODEJS_12_X,
              lambda.Runtime.NODEJS_14_X],
            code: new lambda.AssetCode(`${__dirname}/../src/layers/common/`),
      });

    //define Lambdas functions
      const cookiesConsentLambda = new lambda.Function(this, "CookiesConsentLambda", {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "createCookiesConsent.handler",
        code: lambda.Code.fromAsset(`${__dirname}/../src/lambdas`),
        environment: {
            TABLE_NAME: cookiesConsentTable.tableName,
        },
        layers: [cookiesConsentLayer]
      });

      const getCookiesConsentLambda = new lambda.Function(this, "getCookiesConsentLambda", {
          runtime: lambda.Runtime.NODEJS_12_X,
          handler: "getCookiesConsent.handler",
          code: lambda.Code.fromAsset(`${__dirname}/../src/lambdas`),
          environment: {
              TABLE_NAME: cookiesConsentTable.tableName,
          }
      });

      //define rights of lambdas
      cookiesConsentTable.grantWriteData(cookiesConsentLambda);
      cookiesConsentTable.grantReadData(cookiesConsentLambda);

      //define wildCard certificate
      const wildcardCertificate = new acm.DnsValidatedCertificate(this, "WildcardCertificate", {
          domainName: `*.${applicationDomain}`,
          subjectAlternativeNames: [`${applicationDomain}`],
          hostedZone: zone,
          region: "us-east-1",
      });

      // define domain API
      const domainAPI = new apigateway.DomainName(this, 'domain-name', {
          domainName: `${apiDomain}`,
          certificate: wildcardCertificate,
          endpointType: EndpointType.EDGE
      });

      // define custom route for API
      new route53.ARecord(this, "cookiesApi-route", {
          zone,
          recordName: apiDomain,
          target: route53.RecordTarget.fromAlias(
              new targets.ApiGatewayDomain(domainAPI)
          )
      });

      //define l'API
      const cookiesApi = new apigateway.RestApi(this, "CookiesConsentAPI", {
            deployOptions: {
                stageName: 'dev',
            },
          defaultCorsPreflightOptions: {
              allowOrigins: apigateway.Cors.ALL_ORIGINS,
              allowMethods: apigateway.Cors.ALL_METHODS,
              allowCredentials: true,
          },
          endpointTypes: [EndpointType.EDGE]
      });

      //mapping API to domain
      new apigateway.BasePathMapping(this, "apiMapping", {
          domainName: domainAPI,
          restApi: cookiesApi,
          stage: cookiesApi.deploymentStage,
      })

      //define API endpoints
      const createCookiesconsent = cookiesApi.root.addResource('cookiesconsent');
      createCookiesconsent.addMethod('POST', new apigateway.LambdaIntegration(cookiesConsentLambda));

      const getCookiesconsent = cookiesApi.root.addResource('getCookiesconsent');
        getCookiesconsent.addMethod('GET', new apigateway.LambdaIntegration(getCookiesConsentLambda));


  }
}
