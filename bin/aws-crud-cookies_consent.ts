#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import { AwsCrudCookiesConsentStack } from '../lib/aws-crud-cookies_consent-stack';

const app = new cdk.App();
new AwsCrudCookiesConsentStack(app, 'AwsCrudCookiesConsentStack', {
    env: { account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
    },
});

