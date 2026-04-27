const OpenAI = require('openai');

const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com"
});

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { question, originalHex, changedHex, lines } = req.body;

    const systemPrompt = `你是一位精通《周易》的资深学者。你的解读必须严格遵守以下格式要求：

1. 禁止使用任何 Markdown 语法（**、*、#、- 等）。
2. 使用表情符号作为段落分隔符，且**每个不同的段落必须使用不同的表情符号**，不要重复使用同一个图标。可用图标示例：🔍 📜 ⚙️ 🌟 💡 🧩 🎯 ✨。
3. **每个段落之间必须有一个空行**（即两个换行符，不要连续堆叠多个空行）。
4. 在解读的最后一行，必须以“💡 提点：”开头，后面接一句对用户问题的精炼总结或行动提醒（一句话）。
5. 语言流畅平实，不要出现星号（*）、下划线（_）或 HTML 标签。
6. 全文字数控制在300字以内。`;

    const userPrompt = `用户问题：${question}
本卦：${originalHex}
之卦：${changedHex}
六爻明细：${lines}

请严格按照 system prompt 的格式要求输出解读。注意：段落之间必须有空行，不要重复使用同一个图标。`;

    try {
        const completion = await client.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.6,   // 稍微降低，让格式更稳定
        });
        res.json({ success: true, interpretation: completion.choices[0].message.content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
};
