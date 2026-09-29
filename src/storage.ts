import type { AnkiCard } from './types';

//LocalStorage 内でデータを識別するための固有キー
const STRAGE_KEY = 'my_anki_cards_v1'

export class CardRepository
{
    /* 保存されているすべてのカードを取得する */
    static GetAll(): AnkiCard[]
    {
        const data = localStorage.getItem(STRAGE_KEY);
        if (!data) { return []; }

        try
        {
            return JSON.parse(data) as AnkiCard[];   
        }
        catch (error)
        {
            console.error('LocalStorageからのデータ読み込みに失敗しました',error);
            
            return [];
        }
    }
    
    /* カード配列全体を LocalStorage に保存する */
    static SaveAll(cards: AnkiCard[]): void
    {
        localStorage.setItem(STRAGE_KEY,JSON.stringify(cards));
    }

    /* 新しいカードを1枚追加して保存する
    (id や createdDate は自動生成するため、呼び出し側では指定不要にします)*/
    static AddCard(cardData: Omit<AnkiCard,'id' | 'createdDate'>): AnkiCard 
    {
        const cards = this.GetAll();

        const newCard: AnkiCard = {
            ...cardData,
            id: crypto.randomUUID(),            // 標準APIで重複しない一意の文字列(UUID)を生成
            createdDate: new Date().toISOString(),// 現在日時を ISO 形式で記録
        };

        cards.push(newCard);
        this.SaveAll(cards);
        return newCard;
    }
}


