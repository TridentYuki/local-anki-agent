export interface AnkiCard
{
    id:             string; // ユニークID
    question:       string; // 問題文 (例: "FE: アセンブラ言語とは？")
    answer:         string; // 解答文
    explanation?:   string; // AIによる補足解説（? は値がなくても良いことを意味する）
    interval:       number; // 復習間隔（日数）
    easeFactor:     number; // 難易度係数（初期値: 2.5）
    nextReviewDate: string; // 次の復習日 (形式: "YYYY-MM-DD")
    createdDate:    string; // カード作成日時
}