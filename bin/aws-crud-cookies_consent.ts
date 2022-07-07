#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AwsCrudCookiesConsentStack } from '../lib/aws-crud-cookies_consent-stack';

const app = new cdk.App();
new AwsCrudCookiesConsentStack(app, 'AwsCrudCookiesConsentStack');
