const OpenAI = require('openai');

const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY, // 通过 Vercel 后台配置，不要写死
    baseURL: "https://api.deepseek.com"
});

module.exports = async (req, res) => {
    // 允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { question, originalHex, changedHex, lines } = req.body;

    // 新的 system prompt：严格禁止 Markdown 标记，要求使用表情符号分隔，并强制添加“💡 提点”
    const systemPrompt = `你是一位精通《周易》的资深学者。你的解读必须严格遵守以下格式要求：
1. 禁止使用任何 Markdown 语法，包括但不限于：**加粗**、*斜体*、#标题、-列表。
2. 使用以下表情符号作为段落分隔符：
   - 🔍 表示一个主要观点结束
   - 📜 表示卦象描述的开始
   - ⚙️ 表示技术或行动建议的开始
3. 在解读的最后一行，必须以“💡 提点：”开头，后面接一句对用户问题的精炼总结或行动提醒（一句话）。
4. 语言流畅平实，不要出现星号（*）、下划线（_）或任何 HTML 标签。
5. 整段回答控制在300字以内。`;

    const userPrompt = `用户问题：${question}
本卦：${originalHex}
之卦：${changedHex}
六爻明细：${lines}

请严格按照 system prompt 的格式要求输出解读。不要使用任何 Markdown 标记。`;

    try {
        const completion = await client.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7,   // 适当降低温度让输出更稳定
        });
        res.json({ success: true, interpretation: completion.choices[0].message.content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
};
