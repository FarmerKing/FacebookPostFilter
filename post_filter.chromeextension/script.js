(function(){
    var settings = settings || {};
    var target = document.body;
    var config = { childList: true, subtree: true };

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
                postObserver.disconnect();
                if(  settings['switcher'] === 'on'){
                    postObserver.observe(target, config);
                }

                reverseAction(prevSettings.action);
                if(  settings['switcher'] === 'on'){
                    processAll($(document.body));
                }

                sendResponse({"name":"done"});
                break;
            }
        });

    //create a mutation observer 
    var postObserver = new Date.MutationObserver(function(mutations){
	    mutations.forEach(function(mutation) {
		    if( mutation.type !== "childList" ) return; 
		    for(var i=0; i<mutation.addedNodes.length; i++){
			    if( typeof mutation.addedNodes[i].tagName === "undefined" ) return; 
                processAll($(mutation.addedNodes[i]));
		    }
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
                if( _filter($element,keyword.name.trim()) )
                    return false;
			}
        });
    }

    function _filter($element, keyword){
        if( $element.find('.userContent:contains("' + keyword + '"), \
                          .actorName:contains("' + keyword + '"), \
                          ._5pbw:contains("' + keyword + '")' ).length > 0 ){
                              $element.addClass("FP-filter");
                              $element.fadeOut(); 
                              chrome.runtime.sendMessage({"name": "addCount", "message":keyword},function(theMessageEvent) {
                              });
                              return true;
                          }
        return false;
    }

    var processAll = function($objectCollection, keywords){
        keywords = keywords || settings["block.keyword"];
        $objectCollection.find("div._5jmm,li.uiStreamStory").each(function(index, element){
		    filter( $(element), keywords );
        }); 
    };


    /****************
     * undo the previous status
     ****/
    var reverseAction = function(oriAction){
        $(".FP-filter").each(function(i, domItem){
            $(domItem).fadeIn();
            $(domItem).removeClass("FP-filter");
        });
    };

    $(function(){
        // get the settings from background js
        chrome.runtime.sendMessage({"name": "getSettings"}, function(theMessageEvent) {
            settings = theMessageEvent.settings;
            //before any inserted post, there're some initially loaded post 
            processAll($(document.body));
            //create mutation listener

            if(  settings['switcher'] === 'on'){
	            postObserver.observe(target, config);
            }
            else
	            postObserver.disconnect();
        });
    });
    
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
