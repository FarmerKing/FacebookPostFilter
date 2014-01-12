/**
 * content-script: this script is loaded at facebook content page (manifest.json)
 */
(function(){
    var settings = settings || {};
    var target = document.body;
    var config = { childList: true, subtree: true };
    var blockData = {}; //keyword-post dedupe mechanism

    Date.MutationObserver = window.WebKitMutationObserver || window.MutationObserver || window.MozMutationObserver || null; 
    if( !Date.MutationObserver ) return; 

    chrome.runtime.onMessage.addListener(
        function(messageEvent, sender, sendResponse) {
            if( typeof messageEvent.name === "undefined") return; 
            var prevSettings = settings;
            settings = messageEvent.settings;

            switch( messageEvent.name){
            case 'addBlockKey': 
                sendResponse({"name":"done"});
                processAll($(document.body), [messageEvent.message]);
                break;

            case 'removeBlockKey': 
                //reverse all filter effect 
                reverseAction(prevSettings.action);

                //use new block list to process all 
                processAll($(document.body),settings["block.keyword"]);

                sendResponse({"name":"done"});

                break;

            case 'clearBlockKey': 
                sendResponse({"name":"done"});
                reverseAction(prevSettings.action);
                break;

            case 'toggleSwitcher': 
                init(settings);
                sendResponse({"name":"done"});
                break;
            case 'stop': 
                sendResponse({"name":"done"});
                postObserver.takeRecords();
                postObserver.disconnect();
                reverseAction(prevSettings.action);
                break;
            case 'init': 
                sendResponse({"name":"done"});
                init(settings);
                break;
            }
        });

    //create a mutation observer 
    var postObserver = new Date.MutationObserver(function(mutations){
	    mutations.forEach(function(mutation) {
		    if( mutation.type !== "childList" ) return; 
            if( mutation.target.tagName.toLowerCase() === "body") return;
            processAll($(mutation.target));
	    });
    })


    /***************
     * process the filter action for a "single post node element"(ex. div._5jmm)
     * if keyword match, fade out this node element
     */
    function filter($element, keywords){
        if( typeof keywords === "undefined" ||
            keywords.length <= 0) return; 

        // each object in this array is {"name": xx, "count":xx }
        keywords.forEach(function(keyword){
			if (keyword.name.trim() !== ""){
                _filter($element,keyword.name.trim());
			}
        });
    }

    function _filter($element, keyword){
        try{
            $element.has('.userContent:contains("' + keyword + '"), \
                          .UFICommentContent:contains("' + keyword + '"), \
                          ._5pb1:contains("' + keyword + '"), \
                          ._5pbw:contains("' + keyword + '"), \
                          .messageBody:contains("' + keyword + '")' /*ads message*/)
                .each(function(i,dom){
                    if( typeof blockData[keyword+$(dom).attr("data-dedupekey")] === "undefined" ){
                        chrome.runtime.sendMessage({"name": "addCount", "message":keyword});
                        blockData[keyword+$(dom).attr("data-dedupekey")] = 1;
                    }
                })
                .addClass("FP-filter").fadeOut();
        }catch(e){
            console.log(e.name + ": " + e.message);
            postObserver.disconnect();
        }
    }

    var processAll = function($objectCollection, keywords){
        keywords = keywords || settings["block.keyword"];
        $objectCollection.find("div._5jmm,li.uiStreamStory").each(function(index, element){
		    filter( $(element), keywords );
        }); 
    };

    var init = function(_settings){
        settings = _settings;

        postObserver.takeRecords();
        postObserver.disconnect();
        reverseAction(_settings.action);

        if(  settings['switcher'] === 'on'){
            processAll($(document.body));
            postObserver.observe(target, config);
        }
    };


    /****************
     * undo the previous status
     ****/
    var reverseAction = function(oriAction){
        blockData = {};
        $(".FP-filter").each(function(i, domItem){
            $(domItem).removeClass("FP-filter").fadeIn();
        });
    };
})();


/*
function mark(){
    chrome.storage.sync.get('block.keyword',function(r){
        if(r['block.keyword'].trim()!=''){
			$('.uiStreamStory').addClass('checking');
            var keyword = r['block.keyword'].split("\n");
            for (var i = 0; i<keyword.length; i++) {
			    if (keyword[i]!==""){
					
					$('.userContent:contains("' + keyword[i] + '") , .actorName:contains("' + keyword[i] + '")' ).parents(".uiStreamStory").css(  'border' , '2px red solid'  ).css("background-color" , "#b0c4de"  ).removeClass('checking').addClass('CK');
					$('.userContent:contains("' + keyword[i] + '") , .profileLink:contains("' + keyword[i] + '")' ).parents("._6ns").css(  'border' , '2px red solid'  ).css("background-color" , "#b0c4de"  ).removeClass('checking').addClass('CK');
										

				}
            }; 
			$('.checking').removeClass('checking');
        }
    })
}
*/
