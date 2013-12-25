/********
 * ONLY background.js handle the real save setting action 
 * other page sent sync message with background.js
 *
 * Background page serves as a central brain of this extension: 
 *                 (B)                         (C)
 *   script.js <---------> background.js <------------> popup.js
 *                             |
 *                             |
 *                             |(A)
 *                             |
 *                         the browser action/event

 * (A) background.js is responsible for taking action for various browser action, includes,
 *  # chrome.runtime.onInstalled:(Fired when the extension is first installed, when the extension is updated to a new version, and when Chrome is updated to a new version.)
 *     1. re-inject the script.js into the tab
 *     2. load the pageaction/contextmenu
 *  # chrome.tabs.onUpdated.addListener: Fired when a tab is updated. (if user reload the page, or click on the up-left-corner button) 
 *     keyword counter reset; sent "init" message to script.js; pageaction show/hide; 
 *     create/remove contextmenu
 *
 * (B) background.js listen to the message sent from script.js, includes: 
 *  "addCount" message: 
 *      whenever script.js match a keyword, it will send this message to notify background.js to add count to the keyword
 * (C) when user have interaction with popup.js, it will call the functions in background.js to update the settings, see popup.js for more detail
 *
 * 
 */
var Switcher = function(){
    var PF_STORAGE_SWITCHER = 'postfilter-switcher';
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
    var PF_STORAGE_BLOCKKEYWORD = 'postfilter-block.keyword';
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
            var count = 0;
            blockKeywords.forEach(function(block){
                if( block.name === _keyword ){
                    block.count ++; 
                    count = block.count;
                    return false;
                }
            });
            saveSettings();
            return count;
        }
    };
}();

// (B) listen to the message sent from script.js
chrome.runtime.onMessage.addListener(
    function(messageEvent, sender, sendResponse) {
        if( typeof messageEvent.name === "undefined") return; 
        switch( messageEvent.name){
        case 'addCount': 
            //add counter
            updateCountPopupPage(messageEvent.message,BlockKeywords.addCounter(messageEvent.message));
            break;
        }
    });

var reloadPopupPage = function(){
    if( chrome.extension.getViews({type:"popup"}).length > 0 && 
        typeof chrome.extension.getViews({type:"popup"})[0].blockKeywordUI !== "undefined" ){
            chrome.extension.getViews({type:"popup"})[0].location.href = chrome.extension.getViews({type:"popup"})[0].location.href;
        }
};

var updateCountPopupPage = function(_keyword,count){
    if( chrome.extension.getViews({type:"popup"}).length > 0 && 
        typeof chrome.extension.getViews({type:"popup"})[0].blockKeywordUI !== "undefined" ){
            chrome.extension.getViews({type:"popup"})[0].blockKeywordUI.addCount(_keyword,count);
        }
};


/**
 * Functions that are used in popup.js and other action handler
 */
var notifyTabScript = function( name, message, settings,func_response){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, 
                                {"name": name,
                                 "message": message,
                                 "settings": settings},
                                func_response);
	});
}; 

//called at popup.js
var removeBlockKey = function( removeKey ){
    BlockKeywords.removeKey(removeKey);
    BlockKeywords.resetCounter();
    notifyTabScript("removeBlockKey", 
                    {"name":removeKey}, 
                    {"switcher": Switcher.get(), 
                     "block.keyword": BlockKeywords.get()},
                    null);
};

//called at popup.js
var clearBlockKey = function(){
    BlockKeywords.clear();
    notifyTabScript("clearBlockKey", 
                    null, 
                    {"switcher": Switcher.get(), 
                     "block.keyword": BlockKeywords.get()},
                    null);
};

//called at popup.js
var addBlockKey = function( addedKey ){
    if( !BlockKeywords.addKey(addedKey) ) return false;
    reloadPopupPage();
    notifyTabScript("addBlockKey", 
                    {"name": addedKey},
                    {"switcher": Switcher.get(), 
                     "block.keyword": BlockKeywords.get()},
                    null);
    return true;
};

//called at popup.js
var toggleSwitcher = function(){
    Switcher.toggle();
    chrome.contextMenus.update("contextmenu_addkeyword",{"enabled" : (Switcher.get()==="off")?false:true});
    notifyTabScript("toggleSwitcher", 
                    null,
                    {"switcher": Switcher.get(), 
                     "block.keyword": BlockKeywords.get()},
                    null);
};


var createContextMenu = function(){
    chrome.contextMenus.create({
        "id": "contextmenu_addkeyword",
	    "title": chrome.i18n.getMessage("contextmenu_addfilterkeyword"),
	    "contexts" : [ "selection" ],
        "enabled" : (Switcher.get()==="off")?false:true
    });

    chrome.contextMenus.onClicked.addListener(function(info, tab) {
        if( info.menuItemId === "contextmenu_addkeyword"){
	        if(typeof info.selectionText !== "undefined" &&
               info.selectionText.trim() !== '' ){
                  addBlockKey(info.selectionText.trim());
	          }
        }
    });

};

var removeContextMenu = function(){
    chrome.contextMenus.remove("contextmenu_addkeyword");
};

/**
 * check the tab's url, see to load pageaction/contextmenu or not
 */
var urlCheckAndLoad = function(url,tabId){
    var tabLocation = document.createElement('a');
    tabLocation.href= url;
    if(typeof tabLocation.hostname === "undefined" ||
       tabLocation.hostname !== "www.facebook.com" || 
       typeof tabLocation.pathname === "undefined" || 
       tabLocation.pathname !== "/"
      ){
          BlockKeywords.resetCounter();
          chrome.tabs.sendMessage(tabId, 
                                {"name": "stop",
                                 "message": null,
                                 "settings": {"switcher": Switcher.get(), 
                                              "block.keyword": BlockKeywords.get()}});
          chrome.pageAction.hide(tabId); removeContextMenu(); return false;
      }else{
          BlockKeywords.resetCounter();
		  chrome.tabs.sendMessage(tabId, 
                                  {"name": "init",
                                   "message": null,
                                   "settings": {"switcher": Switcher.get(), 
                                                "block.keyword": BlockKeywords.get()}});
          chrome.pageAction.show(tabId);
          createContextMenu();
          return true;
      }
};

/******
 ** (A) all the runtime/tabs Event listener 
 ************/
// extension update/reload listener 
chrome.runtime.onInstalled.addListener(function(details) {
    if( typeof details.reason === 'undefined') return;

    switch (details.reason) {
    case "install": 
        //first install, save default settings into storage
        break;
    case "update":
        // version 1.1.1 -> 2.0.0, from chrome storage -> localStorage
        if(details.previousVersion==="1.1.1"){
            chrome.storage.sync.get(null, function(r){
                Switcher.set(r['switcher']);
                BlockKeywords.addkeys(r['block.keyword'].split("\n")
                                      .map(function(keyword){ return keyword.trim();})
                                      .filter(function(keyword){
                                          return (keyword !=="");
                                      })
                                     );
            });
        }
        break;
    }

    var init = function(){
        Switcher.save();
        BlockKeywords.resetCounter();

        // parse all windows, re-inject the new content script to facebook
        chrome.windows.getAll({
            populate: true
        }, function (windows) {
            windows.forEach(function(_window){
                _window.tabs.forEach(function(tab){
                    if( tab.url.match(/https:\/\/www.facebook.com/gi) ) {
                        chrome.app.getDetails().content_scripts[0].js.forEach(function(script){
                            chrome.tabs.executeScript(tab.id, {file: script}, function(){
                                if( script.match(/script.js/gi) )
                                    urlCheckAndLoad(tab.url, tab.id); 
                            });
                        });
                    }
                });
            });
        });
    };
    init();
});

// Listen for any changes to the URL of any tab. only show the page action & contextmenu when the url's hostname is www.facebook.com
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if( typeof changeInfo.status !== "undefined" &&
        changeInfo.status === "complete" ){
            urlCheckAndLoad(tab.url, tabId);
        }
});

// listen for event when suspend extension
chrome.runtime.onSuspend.addListener(function(){
    BlockKeywords.save();
    Switcher.save();
});
