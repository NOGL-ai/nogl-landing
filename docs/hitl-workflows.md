# Human-in-the-Loop (HITL) Workflows

This guide explains how to use the Human-in-the-Loop approval system for AI operations that modify data or send external communications.

## What is HITL?

Human-in-the-Loop (HITL) is a safety mechanism that requires human approval before the AI can execute certain operations. This ensures that:

- Data modifications are reviewed before being applied
- External communications are approved before being sent
- Users maintain control over critical operations
- All changes are auditable and traceable

## When HITL is Required

The following operations require human approval:

### Data Modifications
- Creating new competitors
- Updating competitor information
- Deleting competitors
- Adding competitor notes
- Updating product prices

### External Communications
- Sending emails
- Sending pricing reports
- Sending alert notifications

### Plan Execution
- Executing multi-step plans
- Confirming strategic recommendations

## HITL Workflow Process

### 1. AI Proposes Action

When you ask the AI to perform a HITL operation, it will:

1. Analyze your request
2. Prepare the necessary data
3. Show you an approval dialog with:
   - What will be changed
   - Preview of the data
   - Reason for the operation

### 2. Review and Modify

Before approving, you can:

- **Review the data** - Check all fields and values
- **Edit the data** - Modify any fields before approval
- **Add context** - Provide additional information
- **Cancel** - Reject the operation entirely

### 3. Approve or Reject

Choose one of these options:

- **Approve** - Execute the operation as proposed
- **Approve with modifications** - Execute with your changes
- **Reject** - Cancel the operation

### 4. Confirmation

After approval, you'll receive:

- Confirmation that the operation completed
- Details of what was changed
- Any errors that occurred

## Approval Dialog Types

### Competitor Operations

**Create Competitor**
- Shows form with competitor details
- Allows editing of all fields
- Validates required fields before approval

**Update Competitor**
- Shows current values vs. proposed changes
- Highlights what will be modified
- Allows editing of any field

**Delete Competitor**
- Shows competitor details
- Requires reason for deletion
- Warns about related data that will be removed

### Email Operations

**Send Email**
- Shows email preview (subject, recipients, content)
- Allows editing of all email fields
- Validates email addresses before sending

**Send Report**
- Shows report data preview
- Allows editing of recipients and subject
- Shows what data will be included

### Price Updates

**Update Prices**
- Shows current vs. proposed prices
- Lists all products that will be affected
- Allows editing of individual prices

## Best Practices

### Before Approving

1. **Read carefully** - Review all proposed changes
2. **Check data accuracy** - Verify names, emails, prices, etc.
3. **Consider impact** - Think about who will be affected
4. **Verify permissions** - Ensure you have authority to approve

### When Editing

1. **Be precise** - Make specific, accurate changes
2. **Maintain consistency** - Follow existing data patterns
3. **Add context** - Include relevant notes or reasons
4. **Validate data** - Check that edited data is correct

### When Rejecting

1. **Provide reason** - Explain why you're rejecting
2. **Suggest alternatives** - Offer better approaches
3. **Ask for clarification** - Request more information if needed

## Safety Features

### Data Validation

- Required fields are validated before approval
- Email addresses are checked for format
- Duplicate entries are detected
- Data types are enforced

### Permission Checks

- Only authorized users can approve operations
- Role-based permissions are enforced
- Audit trail tracks who approved what

### Rollback Capability

- Most operations can be reversed
- Change history is maintained
- Previous versions can be restored

## Common Scenarios

### Scenario 1: Creating a New Competitor

1. **Request**: "Add TechCorp as a new competitor"
2. **AI Response**: Shows form with competitor details
3. **Your Action**: Review and edit the details
4. **Approval**: Click "Approve" to create the competitor
5. **Result**: Competitor is added to the database

### Scenario 2: Sending a Pricing Report

1. **Request**: "Send pricing report to the team"
2. **AI Response**: Shows email preview with report data
3. **Your Action**: Review recipients and content
4. **Approval**: Click "Approve" to send the email
5. **Result**: Email is sent to all recipients

### Scenario 3: Updating Product Prices

1. **Request**: "Update prices based on competitor analysis"
2. **AI Response**: Shows current vs. proposed prices
3. **Your Action**: Review and modify individual prices
4. **Approval**: Click "Approve" to update prices
5. **Result**: Prices are updated in the system

## Troubleshooting

### Approval Dialog Not Appearing

**Possible Causes:**
- Insufficient permissions
- JavaScript errors
- Network connectivity issues

**Solutions:**
- Check your user role and permissions
- Refresh the page
- Check browser console for errors
- Contact system administrator

### Operation Failed After Approval

**Possible Causes:**
- Database constraints
- Validation errors
- Network timeouts

**Solutions:**
- Check the error message
- Verify data is still valid
- Try the operation again
- Contact technical support

### Can't Edit Approval Data

**Possible Causes:**
- Read-only fields
- Validation constraints
- Permission restrictions

**Solutions:**
- Check which fields are editable
- Verify your permissions
- Contact administrator for help

## Security Considerations

### Data Protection

- All approval data is encrypted in transit
- Sensitive information is masked in logs
- Access is logged and audited

### User Authentication

- Users must be logged in to approve operations
- Session timeouts prevent unauthorized access
- Multi-factor authentication is supported

### Audit Trail

- All approvals are logged with timestamps
- User actions are tracked
- Changes can be traced back to specific users

## Getting Help

If you encounter issues with HITL workflows:

1. **Check this guide** for common solutions
2. **Review error messages** for specific guidance
3. **Contact your administrator** for permission issues
4. **Submit a support ticket** for technical problems

Remember: HITL is designed to keep you in control. When in doubt, reject the operation and ask for clarification.
