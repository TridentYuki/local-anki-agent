import { CardRepository } from './storage';
import { OllamaService } from './llm';
import type { AnkiCard } from './types';

//DOM要素の取得
const questionInput = document.getElementById('input-question') as HTMLInputElement;
const answerInput = document.getElementById('input-answer') as HTMLTextAreaElement;
const addBtn = document.getElementById('btn-add') as HTMLButtonElement;
const addAiBtn = document.getElementById('btn-add-ai') as HTMLButtonElement;
const cardListContainer = document.getElementById('card-list') as HTMLDivElement;


/*
 XSS (クロスサイトスクリプティング)対策用のエスケープ処理
*/
function escapeHtml(str: string): string{
  return str
  .replace(/&/g,'&amp;')
  .replace(/</g,'&lt;')
  .replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;')
  .replace(/'/g,'&#039;');
}

/*
  画面にカード一覧を描画する関数
*/
function renderCards():void {
  const cards = CardRepository.GetAll();
  cardListContainer.innerHTML = '';

  if(cards.length === 0) {
    cardListContainer.innerHTML = '<p class="empty-msg">カードがまだありません。上のフォームから追加してください。</p>';
    return;
  }

  //新しい順に並び変えて描画
  cards.reverse().forEach((card: AnkiCard) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'anki-card';
    cardEl.innerHTML = `
    <div class="card-header">
      <span class="card-date">${new Date(card.createdDate).toLocaleDateString('ja-JP')}</span>
    </div>
    <div class="card-body">
      <h3>Q.${escapeHtml(card.question)}<h3>
      <p class="answer"><strong>A.</strong> ${escapeHtml(card.answer)}</p>
      ${
        card.explanation
        ? `<div class="explanation"🤖<strong>AI解説:</strong> ${escapeHtml(card.explanation)}</div>`
        :''
      }
    </div>
    `;
    cardListContainer.appendChild(cardEl);
  });
}

/*
  共通の保存処理ロジック
*/
async function handleSaveCard(useAI: boolean){
  const question = questionInput.value.trim();
  const answer = answerInput.value.trim();
  
  if(!question || !answer){
    alert('問題文と解答の両方を入力してください。');
    return;
  }

  // ボタンを無効化して連打を防ぎ、ローディング表示にする
  addBtn.disabled = true;
  addAiBtn.disabled = true;
  
  let explanation = '';

  try{
    if(useAI){
      addAiBtn.textContent = '🤖 AIが解説を生成中...';
      //1. Ollama から解説を取得
      explanation = await OllamaService.GenerateExplanation(question, answer);
    }else{
      addBtn.textContent = '保存中...';
    }

    //2. LocalStrage にカードを保存(SM-2パラメータの初期値もリセット)
    CardRepository.AddCard({
      question,
      answer,
      explanation,
      interval: 1,
      easeFactor: 2.5,
      nextReviewDate: new Date().toISOString().split('T')[0],
    });

    //3. フォームのクリアと画面再描画
    questionInput.value = '';
    answerInput.value = '';
    renderCards();
  } catch(error){
    console.error('保存処理エラー:', error);
    alert('カードの保存中にエラーが発生しました。');
  } finally{
    //ボタンの状態を元に戻す
    addBtn.disabled = false;
    addAiBtn.disabled = false;
    addBtn.textContent = 'カードを保存(AI解説なし)';
    addAiBtn.textContent = 'AI解説を生成してカードを保存';
  }
}

//1. 「カード追加(AI解説なし)」ボタンのクリックイベント
addBtn.addEventListener('click', async () =>handleSaveCard(false));

//2. 「カード追加(AI解説あり)」ボタンのクリックイベント
addAiBtn.addEventListener('click', async () => handleSaveCard(true));

//初期表示時にカード一覧を読み込む
renderCards();

/*
 「カード追加」ボタンのクリックイベント
*/
/*
addBtn.addEventListener('click',async() => {
  const question = questionInput.value.trim();
  const answer = answerInput.value.trim();

  if(!question|| !answer){
    alert('問題文と解答の両方を入力してください。');
    return;
  }

  //ボタンを無効化して連打を防ぎ、ローディング表示にする
  addBtn.disabled = true;
  addBtn.textContent = '🤖 AIが解説を生成中...';

  try{
    //1. Ollama から解説を取得
    const explanation = await OllamaService.GenerateExplanation(question,answer);

    //2. LocalStrage にカードを保存(SM-2パラメータの初期値もリセット)
    CardRepository.AddCard({
      question,
      answer,
      explanation,
      interval: 1,
      easeFactor: 2.5,
      nextReviewDate: new Date().toISOString().split('T')[0],
    });

    //3. フォームのクリアと画面再描画
    questionInput.value = '';
    answerInput.value = '';
    renderCards();
  } catch(error){
    console.error('保存処理エラー:',error);
    alert('カードの保存中にエラーが発生しました。');
  } finally{
    //ボタンの状態を元に戻す
    addBtn.disabled = false;
    addBtn.textContent = 'AI解説を生成してカードを保存';
  }
});

*/
