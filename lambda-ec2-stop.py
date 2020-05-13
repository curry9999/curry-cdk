import boto3

def main(event, context):
    region = 'ap-northeast-1'
    ec2 = boto3.client('ec2', region_name=region)

    results = ec2.describe_instances(
        Filters=[
            {'Name': 'tag:autostop', 'Values': ['1']}
        ]
    )

    for reservation in results['Reservations']:
      for instance in reservation['Instances']:
        ec2.stop_instances(
            InstanceIds=[
                instance['InstanceId']
            ]
        )

    return 0
