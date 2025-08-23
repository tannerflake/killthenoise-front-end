# AI-Powered Jira Description Generation

## Overview
The frontend now includes an AI-powered feature that automatically generates structured Jira ticket descriptions from AI issue groups. This enhances the ticket creation workflow by providing professional, consistent descriptions.

## Required Endpoint

### `POST /api/ai/generate-jira-description`

**Purpose**: Generate a structured Jira ticket description using AI based on the AI issue group data.

**Request Body**:
```json
{
  "title": "YN Integration Failure Impacting Important Customer",
  "summary": "Integration with YN service is broken causing issues for an important customer. Urgent resolution required."
}
```

**Response** (Success - 200):
```json
{
  "success": true,
  "data": {
    "description": "👤 User Story:\n• As a **customer** I want **reliable YN service integration** in order to **access critical functionality without disruption**.\n\n✅ Acceptance Criteria:\n• Investigate the root cause of YN service integration failure\n• Implement a fix that restores service functionality\n• Add monitoring and alerting for similar integration issues\n• Test the fix thoroughly in staging environment\n• Deploy the fix to production with minimal downtime\n• Verify that the important customer can access the service\n\n💡 Additional Info:\n• Original issue: YN Integration Failure Impacting Important Customer\n• Impact: Critical customer functionality affected\n• Priority: High - affecting important customer\n• This ticket was auto-generated from AI-detected issue group"
  },
  "message": "Jira description generated successfully"
}
```

**Response** (Error - 400/500):
```json
{
  "success": false,
  "error": "Error message",
  "message": "User-friendly error message"
}
```

## AI Prompt Template

The backend should use this exact prompt template for consistent results:

```
Create a Jira ticket description for the following issue:

Title: {title}
Summary: {summary}

Please format the response using this exact template:

👤 User Story:
• As a **user** I want **feature/improvement** in order to **benefit/value**.

✅ Acceptance Criteria:
• Requirement 1
• Requirement 2
• Requirement 3

💡 Additional Info:
• Any additional context, technical details, or considerations

Make sure to:
1. Use proper Jira formatting with bullet points
2. Bold the key parts of the user story (As a, I want, in order to)
3. Make it specific and actionable
4. Keep it concise but comprehensive
5. Base the user story on the actual issue context
6. Include relevant technical details in Additional Info
7. Make acceptance criteria measurable and testable
```

## Implementation Requirements

### 1. **AI Service Integration**
- Use your preferred AI service (OpenAI, Anthropic, etc.)
- Ensure the AI model can handle structured output
- Implement proper error handling for AI service failures

### 2. **Response Formatting**
- Ensure the response maintains the exact template structure
- Preserve Jira formatting (bullet points, bold text)
- Keep the emoji icons (👤, ✅, 💡)

### 3. **Content Quality**
- Generate realistic user stories based on the issue context
- Create actionable acceptance criteria
- Include relevant technical context in Additional Info

### 4. **Error Handling**
- Handle AI service timeouts gracefully
- Provide fallback responses if AI service is unavailable
- Log errors for debugging

## Example AI-Generated Descriptions

### Example 1: Integration Issue
**Input:**
- Title: "YN Integration Failure Impacting Important Customer"
- Summary: "Integration with YN service is broken causing issues for an important customer. Urgent resolution required."

**Output:**
```
👤 User Story:
• As a **customer** I want **reliable YN service integration** in order to **access critical functionality without disruption**.

✅ Acceptance Criteria:
• Investigate the root cause of YN service integration failure
• Implement a fix that restores service functionality
• Add monitoring and alerting for similar integration issues
• Test the fix thoroughly in staging environment
• Deploy the fix to production with minimal downtime
• Verify that the important customer can access the service

💡 Additional Info:
• Original issue: YN Integration Failure Impacting Important Customer
• Impact: Critical customer functionality affected
• Priority: High - affecting important customer
• This ticket was auto-generated from AI-detected issue group
```

### Example 2: Feature Request
**Input:**
- Title: "Implement Cross-Platform Dark Mode Support"
- Summary: "Users are requesting dark mode support across all platforms to improve user experience and reduce eye strain."

**Output:**
```
👤 User Story:
• As a **user** I want **dark mode support across all platforms** in order to **reduce eye strain and improve user experience**.

✅ Acceptance Criteria:
• Design dark mode theme that maintains accessibility standards
• Implement dark mode toggle in user preferences
• Apply dark mode styling to all UI components
• Ensure dark mode works consistently across web, mobile, and desktop
• Add system preference detection for automatic dark mode
• Test dark mode in various lighting conditions
• Document dark mode implementation for future maintenance

💡 Additional Info:
• Original issue: Implement Cross-Platform Dark Mode Support
• Accessibility: Must meet WCAG contrast requirements
• Platforms: Web, iOS, Android, Desktop
• This ticket was auto-generated from AI-detected issue group
```

## Frontend Integration

The frontend will:
1. Call this endpoint when user clicks "🤖 Generate with AI"
2. Display a loading state during generation
3. Populate the description field with the AI-generated content
4. Allow users to edit the generated description before creating the ticket
5. Fall back to template-based generation if the AI service is unavailable

## Security Considerations

- Validate input data (title and summary)
- Sanitize AI responses to prevent XSS
- Rate limit the endpoint to prevent abuse
- Log usage for monitoring and billing

## Testing

Test with:
1. Valid issue titles and summaries
2. Edge cases (very long titles, special characters)
3. AI service failures (timeout, rate limit, etc.)
4. Various issue types (bugs, features, improvements)

This endpoint will significantly improve the Jira ticket creation workflow by providing professional, consistent descriptions that follow best practices.
