# AWS SES Email Integration Setup

## Overview

This guide covers setting up Amazon Simple Email Service (SES) for the RDJCustoms email functionality. AWS SES provides a reliable, scalable email sending service perfect for transactional emails.

## Prerequisites

- AWS Account
- AWS CLI (optional but recommended)
- Node.js environment configured

## Setup Steps

### 1. Create IAM User for SES

1. **Log in to AWS Console**
   - Navigate to IAM service
   - Click "Users" → "Add users"

2. **Create User**
   - User name: `grapheneos-ses-user`
   - Select "Programmatic access"
   - Click "Next: Permissions"

3. **Set Permissions**
   - Click "Attach existing policies directly"
   - Search for and select: `AmazonSESFullAccess`
   - Click "Next: Tags" → "Next: Review" → "Create user"

4. **Save Credentials**
   - Download the CSV file with credentials
   - Copy the Access Key ID and Secret Access Key

### 2. Configure AWS SES

1. **Access SES Console**
   - Go to Amazon SES in AWS Console
   - Select your preferred region (e.g., `us-east-1`)

2. **Verify Email Addresses**
   
   **Verify Sender Email (Required):**
   - Go to "Email Addresses" under "Identity Management"
   - Click "Verify a New Email Address"
   - Enter: `noreply@grapheneos-store.com` (or your sender email)
   - Click "Verify This Email Address"
   - Check email and click verification link

   **Verify Test Recipients (Sandbox Mode):**
   - While in sandbox mode, verify all recipient emails
   - Follow same process for test email addresses

3. **Request Production Access** (When Ready)
   - Go to "Sending Statistics" → "Request a Sending Limit Increase"
   - Fill out the form with:
     - Mail type: Transactional
     - Website URL: Your GrapheneOS store URL
     - Use case description: Order confirmations, shipping updates, etc.
   - Submit request (typically approved within 24 hours)

### 3. Update Environment Variables

Update your `.env` file with the AWS credentials:

```env
# Email Configuration (AWS SES)
EMAIL_SERVICE=ses
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-actual-access-key-id
AWS_SECRET_ACCESS_KEY=your-actual-secret-access-key
FROM_EMAIL=noreply@grapheneos-store.com
FROM_NAME=RDJCustoms
SUPPORT_EMAIL=support@grapheneos-store.com

# Optional: For testing
TEST_EMAIL=your-verified-test-email@example.com
```

### 4. Test the Integration

1. **Run the SES test script:**
   ```bash
   npm run test:ses
   ```

2. **Run comprehensive email tests:**
   ```bash
   npm run test:email
   ```

## Configuration Options

### Region Selection

Choose a region close to your users for better performance:
- `us-east-1` - US East (Virginia)
- `us-west-2` - US West (Oregon)
- `eu-west-1` - EU (Ireland)
- `ap-southeast-1` - Asia Pacific (Singapore)

Update `AWS_REGION` in your `.env` file accordingly.

### Email Templates

The email service includes pre-configured templates for:
- Order confirmations
- Payment confirmations
- Shipping notifications
- Delivery confirmations
- Cancellation notices
- Refund confirmations
- Support requests
- Account status updates
- Return requests

## Monitoring and Management

### 1. CloudWatch Metrics

Monitor email sending in CloudWatch:
- Send rate
- Bounce rate
- Complaint rate
- Delivery rate

### 2. SNS Notifications

Set up notifications for bounces and complaints:

1. Create SNS topic in AWS Console
2. Subscribe your admin email to the topic
3. Configure SES to send notifications to the topic

### 3. Suppression List

AWS SES automatically manages a suppression list for:
- Hard bounces
- Complaints
- Unsubscribes

## Best Practices

### 1. Sender Reputation

- Keep bounce rate < 5%
- Keep complaint rate < 0.1%
- Use double opt-in for marketing emails
- Process unsubscribes immediately

### 2. Email Content

- Include unsubscribe links (if applicable)
- Use consistent FROM addresses
- Avoid spam trigger words
- Include both HTML and text versions

### 3. Rate Limiting

AWS SES has sending limits:
- **Sandbox**: 200 emails/day, 1 email/second
- **Production**: Starts at 50,000 emails/day, increases with good reputation

### 4. Error Handling

The email service includes error handling for:
- Invalid email addresses
- Rate limiting
- Service outages
- Authentication failures

## Troubleshooting

### Connection Failed

If you see "AWS SES connection failed":

1. **Check credentials:**
   ```bash
   echo $AWS_ACCESS_KEY_ID
   echo $AWS_SECRET_ACCESS_KEY
   ```

2. **Verify IAM permissions:**
   - User must have `ses:SendEmail` permission
   - Check IAM policy is attached

3. **Test AWS CLI:**
   ```bash
   aws ses get-send-quota --region us-east-1
   ```

### Email Not Received

1. **Check SES Console:**
   - Go to "Sending Statistics"
   - Check for bounces/complaints

2. **Verify email addresses:**
   - Sender must be verified
   - In sandbox: recipient must be verified

3. **Check spam folders:**
   - New domains often go to spam initially

### Rate Limit Errors

```
Error: Throttling - Maximum sending rate exceeded
```

Solutions:
- Implement retry with exponential backoff
- Request sending rate increase
- Use SES bulk sending for large volumes

## Cost Optimization

AWS SES Pricing (as of 2024):
- First 62,000 emails/month: Free (from EC2)
- Additional emails: $0.10 per 1,000 emails
- Incoming emails: $0.10 per 1,000 emails
- Attachments: $0.12 per GB

## Migration from Development to Production

1. **Development:**
   - Use sandbox mode
   - Verify all test emails
   - Low sending limits

2. **Staging:**
   - Request production access
   - Test with real email addresses
   - Monitor metrics

3. **Production:**
   - Full production access
   - Set up CloudWatch alarms
   - Configure bounce/complaint handling

## Security Considerations

1. **Credential Management:**
   - Never commit AWS credentials
   - Use environment variables
   - Rotate credentials regularly

2. **IAM Best Practices:**
   - Use minimum required permissions
   - Create separate users for different environments
   - Enable MFA on AWS account

3. **Email Security:**
   - Implement SPF records
   - Set up DKIM signing
   - Consider DMARC policy

## Next Steps

After successful setup:

1. Test all email templates
2. Set up monitoring dashboards
3. Configure bounce handling
4. Document email workflows
5. Plan for scale and growth

## Support

For AWS SES issues:
- AWS Support Center
- AWS SES Developer Guide
- Stack Overflow (#amazon-ses)

For application issues:
- Check application logs
- Review email service code
- Test with mock mode first