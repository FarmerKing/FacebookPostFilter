var StaticMessage = function( lang ){
    if(lang && lang === "tw"){
        return {
            'filter_message': '請輸入在臉書的動態消息上，你不想看到貼文的主要關鍵字唷！（例如：你不想看到「黃色小鴨」的貼文，則輸入「黃色小鴨」），則有「黃色小鴨」關鍵字的貼文就消失啦！',
            "button_save": "儲存",
            "button_stop": "停用",
            "button_start": "啟用",
            "button_clear": "清空",
            "company_name": "丞希綠色資訊",
            "menu_action_addfilterkeyword": "以 FB 動態殺手 篩掉「$mes」"
        };
    }else{
        return {
            'filter_message': 'Please enter the keywords you do not want to see on facebook. For example, if you don\'t want to see any posts about Justin Bieber, then enter \"Justin Bieber\" as the keyword. Then all posts containing the word \"Justin Bieber\" will disappear.',
            "button_save": "Save",
            "button_stop": "Stop",
            "button_start": "Start",
            "button_clear": "Clear",
            "company_name": "ChengHsi.com",
            "menu_action_addfilterkeyword": "Filter out the \"$mes\" using FB Post Filter"
        };
    }
};
