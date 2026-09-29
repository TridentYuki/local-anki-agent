//LLM使用ポートURL
const Ollama_URL = 'http://localhost:11434/v1/chat/completions';

export class OllamaService {
    /*
        問題と解答を渡し、Ollama から補足説明を取得する
    */
   static async GenerateExplanation(question: string, answer: string): Promise<string> {
    const prompt = `以下の暗記カードの問題と解答に対して、理解を深めるための簡潔な解説(100~200文字程度)を作成してください。
    問題: ${question}
    解答: ${answer}`;

        try {
            //1.OllamaにPOSTリクエストを送信
            const response = await fetch(Ollama_URL,{
                method: 'POST',
                headers: {
                    'Content-Type':'application/json',
                },
                body: JSON.stringify({
                    model: 'gemma2:9b', //使用モデル
                    messages:[
                        {role: 'system',content:'あなたは親切でわかりやすい解説を提供する教育AIアシスタントです。挨拶などは不要です、そして強調したり＊印の使用も控えてください。'},
                        {role: 'user', content: prompt},
                    ],
                    temperature: 0.7,
                }),
            });

            //実行エラーチェック
            if(!response.ok){throw new Error('HTTPエラー！ステータス: ${response.status}');}

            //2.レスポンスのJSONを解析してテキストを出力
            const data = await response.json();
            return data.choices[0]?.message?.content?.trim() || '解説を取得できませんでした。';

        } catch(error) {
            console.error('Ollama 通信エラー:', error);
            return '(※Ollama が起動していないか、接続エラーが発生しました)'
        }
   }
}