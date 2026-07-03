const fs = require('fs');
const lines = fs.readFileSync('C:/Users/ADMIN/.gemini/antigravity/brain/868b9a70-b06c-4450-87f1-38fc21af1292/.system_generated/logs/transcript_full.jsonl', 'utf-8').trim().split('\n');
const inputs = lines.filter(l => l.includes('"type":"USER_INPUT"')).map(l => JSON.parse(l));
fs.writeFileSync('last_prompt.txt', inputs[inputs.length - 1].content);
