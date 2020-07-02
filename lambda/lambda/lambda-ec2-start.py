import os
import boto3
import logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def main(event, context):
    region = os.getenv("AWS_DEFAULT_REGION")
    ec2 = boto3.client('ec2', region_name=region)

    results = ec2.describe_instances(
        Filters=[
            {'Name': 'tag:autostart', 'Values': ['1']},
            {'Name': 'instance-state-name', 'Values': ['stopped']}
        ]
    )

    for reservation in results['Reservations']:
      for instance in reservation['Instances']:
        logger.info(instance['InstanceId'])
        ec2.start_instances(
            InstanceIds=[
                instance['InstanceId']
            ]
        )

    return 0
