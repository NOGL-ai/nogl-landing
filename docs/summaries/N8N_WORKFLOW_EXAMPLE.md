# n8n Workflow Example for AI Copilot

This document provides example n8n workflows you can use with your AI Copilot.

---

## 🎯 Simple OpenAI Workflow

This is the most basic workflow - just forwards messages to OpenAI.

### Nodes:

1. **Webhook** (Trigger)
   - **HTTP Method**: POST
   - **Path**: `copilot-chat`
   - **Response Mode**: "When Last Node Finishes"
   - **Response Data**: "First Entry JSON"

2. **Code** (Process Input)
   ```javascript
   const input = $input.item.json;
   
   return [
     {
       json: {
         messages: [
           // Add conversation history
           ...input.conversationHistory.map(msg => ({
             role: msg.role,
             content: msg.content
           })),
           // Add current user message
           {
             role: 'user',
             content: input.message
           }
         ],
         userId: input.userId,
         timestamp: input.timestamp
       }
     }
   ];
   ```

3. **OpenAI** (AI Response)
   - **Resource**: Chat
   - **Operation**: Create a Chat Completion
   - **Model**: `gpt-4` or `gpt-3.5-turbo`
   - **Messages**: `{{ $json.messages }}`
   - **Options**:
     - Temperature: `0.7`
     - Max Tokens: `1000`

4. **Code** (Format Response)
   ```javascript
   const response = $input.item.json;
   
   return [
     {
       json: {
         reply: response.choices[0].message.content,
         model: response.model,
         tokens: response.usage?.total_tokens || 0
       }
     }
   ];
   ```

5. **Respond to Webhook**
   - **Response Body**: `{{ $json }}`

---

## ⚡ Streaming Workflow (Advanced)

For real-time streaming responses, use this workflow.

### Nodes:

1. **Webhook** (Trigger)
   - **HTTP Method**: POST
   - **Path**: `copilot-chat-stream`
   - **Response Mode**: "Using 'Respond to Webhook' Node"

2. **Code** (Prepare Request)
   ```javascript
   const input = $input.item.json;
   
   return [
     {
       json: {
         messages: [
           ...input.conversationHistory.map(msg => ({
             role: msg.role,
             content: msg.content
           })),
           {
             role: 'user',
             content: input.message
           }
         ],
         stream: true
       }
     }
   ];
   ```

3. **HTTP Request** (OpenAI Streaming)
   - **Method**: POST
   - **URL**: `https://api.openai.com/v1/chat/completions`
   - **Authentication**: Header Auth
     - **Name**: `Authorization`
     - **Value**: `Bearer YOUR_OPENAI_API_KEY`
   - **Options**:
     - **Response Format**: Stream
     - **Headers**:
       - `Content-Type`: `application/json`
   - **Body**:
     ```json
     {
       "model": "gpt-4",
       "messages": "{{ $json.messages }}",
       "stream": true
     }
     ```

4. **Respond to Webhook**
   - **Response Code**: 200
   - **Response Headers**:
     ```json
     {
       "Content-Type": "text/plain"
     }
     ```
   - **Response Body**: `{{ $binary.data }}`

---

## 🧠 RAG Workflow (Retrieval Augmented Generation)

Add context from your knowledge base before sending to AI.

### Nodes:

1. **Webhook** (Trigger)
   - Same as above

2. **Vector Store** (Query)
   - **Operation**: Retrieve Documents
   - **Query**: `{{ $json.message }}`
   - **Top K**: 3
   - **Return Type**: Documents

3. **Code** (Build Context)
   ```javascript
   const input = $input.first().json;
   const documents = $input.all().slice(1);
   
   // Build context from retrieved documents
   const context = documents
     .map(doc => doc.json.pageContent)
     .join('\n\n');
   
   // Create system message with context
   const systemMessage = {
     role: 'system',
     content: `You are a helpful assistant. Use the following context to answer questions:\n\n${context}`
   };
   
   return [
     {
       json: {
         messages: [
           systemMessage,
           ...input.conversationHistory.map(msg => ({
             role: msg.role,
             content: msg.content
           })),
           {
             role: 'user',
             content: input.message
           }
         ]
       }
     }
   ];
   ```

4. **OpenAI** (AI Response)
   - Same as simple workflow

5. **Code** (Format Response)
   - Same as simple workflow

6. **Respond to Webhook**
   - Same as simple workflow

---

## 🔧 Custom Business Logic Workflow

Add custom logic, database queries, or API calls before responding.

### Nodes:

1. **Webhook** (Trigger)

2. **Switch** (Route by Intent)
   ```javascript
   // Detect user intent
   const message = $json.message.toLowerCase();
   
   if (message.includes('price') || message.includes('cost')) {
     return [0]; // Pricing query
   } else if (message.includes('order') || message.includes('track')) {
     return [1]; // Order query
   } else {
     return [2]; // General query
   }
   ```

3a. **MySQL** (Get Pricing) - Output 0
   - Query database for pricing info

3b. **HTTP Request** (Get Order Status) - Output 1
   - Call order tracking API

3c. **OpenAI** (General Response) - Output 2
   - Handle general questions

4. **Merge** (Combine Results)

5. **Code** (Format Final Response)
   ```javascript
   const result = $input.item.json;
   
   // Format based on data type
   let reply = '';
   
   if (result.price) {
     reply = `The current price is $${result.price}`;
   } else if (result.orderStatus) {
     reply = `Your order status: ${result.orderStatus}`;
   } else if (result.choices) {
     reply = result.choices[0].message.content;
   }
   
   return [{ json: { reply } }];
   ```

6. **Respond to Webhook**

---

## 📊 Analytics & Logging Workflow

Track all conversations for analytics.

### Additional Nodes:

After receiving the message:

**Code** (Log to Database)
```javascript
const input = $input.item.json;

// Log the interaction
return [
  {
    json: {
      userId: input.userId,
      message: input.message,
      timestamp: input.timestamp,
      metadata: input.metadata
    }
  }
];
```

**MySQL/PostgreSQL** (Insert)
- Table: `copilot_logs`
- Columns: `user_id`, `message`, `response`, `timestamp`, `metadata`

---

## 🔒 Authentication Workflow

Verify user access before responding.

### Nodes:

1. **Webhook** (Trigger)

2. **HTTP Request** (Verify User)
   - **URL**: `https://yourapp.com/api/auth/verify`
   - **Headers**:
     - `Authorization`: `Bearer {{ $json.metadata.token }}`

3. **IF** (Check Auth)
   ```javascript
   return $json.authenticated === true ? [true] : [false];
   ```

4a. **Continue with AI** (Authenticated)

4b. **Respond to Webhook** (Not Authenticated)
   - Return error: "Authentication required"

---

## 🎨 Custom Response Formats

Return structured data (charts, tables, etc.).

### Code Node (Format Special Response):

```javascript
const message = $json.message.toLowerCase();
const aiResponse = $json.aiResponse;

// Check if response should be a chart
if (message.includes('chart') || message.includes('graph')) {
  return [
    {
      json: {
        type: 'chart',
        message: aiResponse,
        chart: {
          type: 'bar',
          data: [
            { label: 'Jan', value: 100 },
            { label: 'Feb', value: 150 },
            { label: 'Mar', value: 200 }
          ]
        }
      }
    }
  ];
}

// Check if response should be a table
if (message.includes('table') || message.includes('list')) {
  return [
    {
      json: {
        type: 'table',
        message: aiResponse,
        table: {
          headers: ['Name', 'Value'],
          rows: [
            ['Item 1', '$100'],
            ['Item 2', '$150']
          ]
        }
      }
    }
  ];
}

// Default text response
return [
  {
    json: {
      type: 'text',
      message: aiResponse
    }
  }
];
```

---

## 🚀 Testing Your Workflow

### Using Postman/Insomnia:

```http
POST https://your-n8n-instance.com/webhook/copilot-chat
Content-Type: application/json

{
  "message": "What is the weather today?",
  "conversationHistory": [],
  "userId": "test-user@example.com",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "metadata": {
    "userAgent": "Mozilla/5.0",
    "referer": "https://yourapp.com"
  }
}
```

### Expected Response:

```json
{
  "reply": "I'm sorry, I don't have access to real-time weather data...",
  "model": "gpt-4",
  "tokens": 150
}
```

---

## 💡 Pro Tips

1. **Use streaming** for better UX - users see responses as they're generated
2. **Add rate limiting** in n8n to protect your API
3. **Log conversations** for analytics and debugging
4. **Use caching** for common questions
5. **Add fallbacks** for when AI is unavailable
6. **Validate input** before sending to AI
7. **Monitor costs** - track token usage
8. **Use system prompts** to guide AI behavior

---

## 📖 Resources

- [n8n Documentation](https://docs.n8n.io/)
- [OpenAI API Docs](https://platform.openai.com/docs/api-reference)
- [n8n Streaming Guide](https://docs.n8n.io/workflows/streaming/)
- [Vector Store Node](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.vectorstore/)

---

## ⚠️ Important Notes

- **API Keys**: Store OpenAI API key in n8n credentials, never in workflow
- **Rate Limits**: Add rate limiting to prevent abuse
- **Error Handling**: Always add error handling nodes
- **Testing**: Test thoroughly before deploying
- **Monitoring**: Set up monitoring for failed executions

---

**Need help?** Join the [n8n Community Forum](https://community.n8n.io/)

