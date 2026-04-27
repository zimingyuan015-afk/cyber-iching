const OpenAI = require('openai');

const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY, // 这里通过 Vercel 后台配置，不要写死
    baseURL: "https://api.deepseek.com"
});

module.exports = async (req, res) => {
    // 允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { question, originalHex, changedHex, lines } = req.body;

    try {
        const completion = await client.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                { role: "system", content: "你是一位精通《周易》的学者，解读卦象时既有哲理深度又贴合现代生活。回答控制在300字以内。" },
                { role: "user", content: `用户问题：${question}\n本卦：${originalHex}\n之卦：${changedHex}\n明细：${lines}` }
            ],
        });
        res.json({ success: true, interpretation: completion.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};