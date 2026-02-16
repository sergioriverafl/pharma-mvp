import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface ScraperStackProps extends cdk.StackProps {
  queue: sqs.Queue;
}

export class ScraperMercadoLibreStack extends cdk.Stack {
  public readonly scraperFunction: lambda.DockerImageFunction;

  constructor(scope: Construct, id: string, props: ScraperStackProps) {
    super(scope, id, props);

    // Lambda function con Playwright
    this.scraperFunction = new lambda.DockerImageFunction(this, 'ScraperFunction', {
      code: lambda.DockerImageCode.fromImageAsset('../', {
        file: 'scraper-ml/Dockerfile'
      }),
      timeout: cdk.Duration.minutes(5),
      memorySize: 2048,
      environment: {
        SQS_QUEUE_URL: props.queue.queueUrl,
        NODE_ENV: 'production'
      },
      architecture: lambda.Architecture.X86_64
    });

    // Permisos para enviar a SQS
    props.queue.grantSendMessages(this.scraperFunction);

    // EventBridge rule - ejecutar diariamente
    const rule = new events.Rule(this, 'ScheduleRule', {
      schedule: events.Schedule.cron({
        hour: '6',
        minute: '0'
      })
    });

    rule.addTarget(new targets.LambdaFunction(this.scraperFunction, {
      event: events.RuleTargetInput.fromObject({
        searchQuery: 'medicamentos',
        maxResults: 100
      })
    }));

    // Outputs
    new cdk.CfnOutput(this, 'ScraperFunctionName', {
      value: this.scraperFunction.functionName,
      description: 'Scraper Lambda function name'
    });

    new cdk.CfnOutput(this, 'ScraperFunctionArn', {
      value: this.scraperFunction.functionArn,
      description: 'Scraper Lambda function ARN'
    });
  }
}