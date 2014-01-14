/**
 * content-script: this script is loaded at facebook content page (manifest.json)
 */
(function(){
    var settings = settings || {};
    var target = document.body;
    var config = { childList: true, subtree: true };
    var blockData = {}; //keyword-post dedupe mechanism
    // { "word": {}, "word2": {} }
    var keywordPostData = {};

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
                filter_keyword(messageEvent.message);
                break;

            case 'removeBlockKey': 
                blockData = {}; //clean the block data 

                //re-mark the previous matched post
                $(".FP-filter").toggleClass("FP-filter FP-prevfilter");

                //use new block list to process all 
                filter_keywords(settings["block.keyword"]);

                //if the old post is nolonger filter, made it fadein
                $(".FP-prevfilter:not(.FP-filter)").fadeIn();
                $(".FP-prevfilter").toggleClass("FP-prevfilter")

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
    var observer_handler = function(mutations){
         mutations.forEach(function(mutation) {
		    if( mutation.type !== "childList" ) ; 
            else if( mutation.target.tagName.toLowerCase() === "div" && 
                (mutation.target.classList.contains("_5pcb") || 
                 mutation.target.classList.contains("_4ikz")) ){
                filter_keywords();
                return false; 
            }
	    });
    };
    var postObserver = new Date.MutationObserver(observer_handler);

    /***************
     * process the filter action for a "single post node element"(ex. div._5jmm)
     * if keyword match, fade out this node element
     */
    function filter_keywords(keywords){
        keywords = keywords || settings["block.keyword"];
        if( typeof keywords === "undefined" ||
            keywords.length <= 0) return; 

        // each object in this array is {"name": xx, "count":xx }
        keywords.forEach(function(keyword){
			if (keyword.name.trim() !== ""){
                filter_keyword(keyword.name.trim());
			}
        });
    }

    function filter_keyword(keyword){
        try{
            $('.userContent:contains("' + keyword + '"), \
              .UFICommentContent:contains("' + keyword + '"), \
              ._5pb1:contains("' + keyword + '"), \
              ._5pbw:contains("' + keyword + '"), \
              .messageBody:contains("' + keyword + '")' /*ads message*/)
                .closest("div._5jmm, li.uiUnifiedStory")
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

    var markOldFilterPost = function(){
        $(".FP-filter").toggleClass("FP-filter FP-prevfilter");
    };

    var init = function(_settings){
        settings = _settings;

        postObserver.takeRecords();
        postObserver.disconnect();
        reverseAction(_settings.action);

        if(  settings['switcher'] === 'on'){
            filter_keywords();
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
