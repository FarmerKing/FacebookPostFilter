/*
chrome.commands.onCommand.addListener(function(command) {
	if(command == "next") {
		//alert('next');
		document.scrollTop(('.CK').offset().top);
	}
})
*/

//var parent = chrome.contextMenus.create({"title": "Test parent item"});


var clickHandler = function(e) {
	if(e.selectionText){
		//alert(e.selectionText);
		chrome.storage.sync.get('block.keyword', function(r){
			var text;
			if(r['block.keyword']==undefined){
				text = e.selectionText;
			} else {
				text = r['block.keyword'] + '\n' + e.selectionText;
			}
			/*alert(text);*/
			chrome.storage.sync.set({'block.keyword':text} , function(){ /*alert('save');*/ 
				//chrome.tabs.reload();
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				  chrome.tabs.sendMessage(tabs[0].id, {greeting: "keyword", keyword: e.selectionText}, function(response) {
					//console.log(response.farewell);
				  });
				});
			});
		});
		
	} else {
		alert("請反白關鍵字");
	}
}


var button = chrome.contextMenus.create({
	"title": "以FB動態殺手 篩掉「%s」",
	"contexts" : [ "page", "selection" ],
	"onclick" : clickHandler
});


