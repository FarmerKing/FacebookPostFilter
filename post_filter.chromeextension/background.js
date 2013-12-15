/********
 * ONLY background.js handle the real save setting action 
 * other page sent sync message with background.js
 */
var PF_STORAGE_SWITCHER = 'postfilter-switcher',
    PF_STORAGE_BLOCKKEYWORD = 'postfilter-block.keyword';

//console.log("action(" + settings.action + ") switcher(" + settings["switcher"] + ")");
var Switcher = function(){
    var switcher = window.localStorage[PF_STORAGE_SWITCHER] ? window.localStorage[PF_STORAGE_SWITCHER] : "on",
        saveSettings = function(){
            window.localStorage.setItem(PF_STORAGE_SWITCHER, switcher);
        };
    return{
        "save": function(){ saveSettings(); }, 
        "get": function(){ return switcher; }, 
        "set": function(_switcher){ switcher=_switcher; saveSettings();}, 
        "toggle": function(){
            if(switcher === "on"){
                switcher = "off";
                BlockKeywords.resetCounter();
            }
            else switcher = "on";
            saveSettings();
        }
    };
}();

var BlockKeywords = function(){
    //init
    var blockKeywords = window.localStorage[PF_STORAGE_BLOCKKEYWORD] ? JSON.parse(window.localStorage[PF_STORAGE_BLOCKKEYWORD]) : [],
        saveSettings = function(){
            window.localStorage.setItem(PF_STORAGE_BLOCKKEYWORD, JSON.stringify(blockKeywords));
        };

    return {
        "save": function(){ saveSettings();},
        "get": function(){ return blockKeywords;},
        "clear": function(){ 
            blockKeywords.length=0;
            saveSettings();
        },
        "removeKey": function(_keyword){
            blockKeywords = blockKeywords.filter(function(_key){
                return ( _key.name !== _keyword );
            });
            saveSettings();
        },
        "addKey": function(_keyword){
            if( blockKeywords.some(function(block){ return block.name === _keyword.trim(); })  )
                return false; 

            blockKeywords.push({"name":_keyword.trim(), "count":0});
            saveSettings();
            return true;
        },
        "addKeys": function(_keywords){
            _keywords.forEach(function(_keyword){
                if( blockKeywords.all(function(block){ 
                    return block.name !== _keyword.trim(); })  ){
                    blockKeywords.push({"name":_keyword.trim(), "count":0});
                }
            });

            saveSettings();
        },
        "resetCounter": function(_keyword){
            if( typeof _keyword !== "undefined" ){
                blockKeywords.forEach(function(_key){
                    if ( _key.name === _keyword ){ 
                        _key.count = 0; return false;
                    }
                });
            }else{
                blockKeywords.forEach(function(_key){
                    _key.count = 0;
                });
            }
            saveSettings();
        },
        "addCounter": function(_keyword){
            blockKeywords.forEach(function(block){
                if( block.name === _keyword ){
                    block.count ++; 

                    if( chrome.extension.getViews({type:"popup"}).length > 0 && 
                        typeof chrome.extension.getViews({type:"popup"})[0].blockKeywordUI !== "undefined" ){
                            chrome.extension.getViews({type:"popup"})[0].blockKeywordUI.addCount(_keyword,block.count);
                    }
                    return false;
                }
            });
        }
    };
}();

// listen to message from script.js
chrome.runtime.onMessage.addListener(
    function(messageEvent, sender, sendResponse) {
        if( typeof messageEvent.name === "undefined") return; 

        switch( messageEvent.name){
        case 'getSettings':
            //reset counter
            BlockKeywords.resetCounter();
            sendResponse({"name":"init", 
                          "settings": {"switcher": Switcher.get(), 
                                      "block.keyword": BlockKeywords.get()} 
                         });
            break;

        case 'addCount': 
            //add counter
            BlockKeywords.addCounter(messageEvent.message);
            break;
        }
    });

var removeBlockKey = function( removeKey ){
    BlockKeywords.removeKey(removeKey);
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, 
                                {"name": "removeBlockKey", 
                                 "message": {"name":removeKey}, 
                                 "settings": {"switcher": Switcher.get(), 
                                              "block.keyword": BlockKeywords.get()}}, 
                                function(response) {
		                        });
	});
};

var clearBlockKey = function( ){
    BlockKeywords.clear();
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, 
                                {"name": "clearBlockKey", 
                                 "settings": {"switcher": Switcher.get(), 
                                              "block.keyword": BlockKeywords.get()}}, 
                                function(response) {
		                        });
	});
};

var addBlockKey = function( addedKey ){
    if( !BlockKeywords.addKey(addedKey) ) return false;
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, 
                                {"name": "addBlockKey", 
                                 "message": {"name": addedKey},
                                 "settings": {"switcher": Switcher.get(), 
                                              "block.keyword": BlockKeywords.get()}}, 
                                function(response) {
		                        });
	});
    return true;
};

var toggleSwitcher = function(){
    Switcher.toggle();
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, 
                                {"name": "toggleSwitcher", 
                                 "settings": {"switcher": Switcher.get(),
                                              "block.keyword": BlockKeywords.get()}}, 
                                function(response) {
		                        });
	});
};

var trimKeywordStr = function(keyword_str){
    if(Array.isArray(keyword_str)){ 
        return keyword_str.filter(function(keyword){
            return (keyword.trim() !=="");
        }).join("\n");
    }

	return keyword_str.split("\n")
        .map(function(keyword){ return keyword.trim();})
        .filter(function(keyword){
            return (keyword !=="");
        }).join("\n");
}

var clickHandler = function(e) {
	if(typeof e.selectionText !== "undefined" 
       && e.selectionText.trim() !== ''){
        addBlockKey(e.selectionText.trim());
	}
}


var button = chrome.contextMenus.create({
	"title": chrome.i18n.getMessage("contextmenu_addfilterkeyword"),
	"contexts" : [ "selection" ],
	"onclick" : clickHandler
});

/******
 ** Event listener 
 ************/
// version update listener 
chrome.runtime.onInstalled.addListener(function(details) {
    if( typeof details.reason === 'undefined') return;

    var init = function(){
        BlockKeywords.save();
        Switcher.save();
        chrome.tabs.query({"url":"*//www.facebook.com/*"}, function(tabs){ 
            tabs.forEach(function(tab){ 
                chrome.tabs.executeScript(tab.id, {file: "script.js"});
                chrome.pageAction.show(tab.id);
            });
        });
    };

    init();
    switch (details.reason) {
    case "install": 
        //first install, save default settings into storage
        break;
    case "update":
        // version 1.1.1 -> 2.0.0, from chrome storage -> localStorage
        if(details.previousVersion==="1.1.1"){
            init();
            chrome.storage.sync.get(null, function(r){
                Switcher.set(r['switcher']);
                BlockKeywords.addkeys(r['block.keyword'].split("\n")
                                      .map(function(keyword){ return keyword.trim();})
                                      .filter(function(keyword){
                                          return (keyword !=="");
                                      })
                                     );
                chrome.runtime.reload();
            });
        }
        break;
    }
});

// Listen for any changes to the URL of any tab. only show the page action when the url's hostname is www.facebook.com
chrome.webNavigation.onCompleted.addListener(function (details) {
    chrome.pageAction.show(details.tabId);
}, {url: [{hostSuffix: 'www.facebook.com'}]});

// listen for event when suspend extension
chrome.runtime.onSuspend.addListener(function(){
    BlockKeywords.save();
    Switcher.save();
});
