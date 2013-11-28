var target = document.body;
var config = { childList: true, subtree: true };

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "keyword"){
      //sendResponse({farewell: "goodbye"});
		chrome.storage.sync.get('switcher',function(e){      
			if(e['switcher']=='on'){
				$(target).find("div._5jmm").each(function(index, element){
						filter( $(element) );
				}); 
				$(target).find("li.uiStreamStory").each(function(index, element){
						filter( $(element) );
				}); 
			}else if(e['switcher']==undefined){
				chrome.storage.sync.set({'switcher':'on'});			  
			};
		});
	}
});


chrome.storage.sync.get('switcher',function(e){
    if(e['switcher']=='on'){
        $(target).find("div._5jmm").each(function(index, element){
		        filter( $(element) );
        }); 
        $(target).find("li.uiStreamStory").each(function(index, element){
		        filter( $(element) );
        }); 

		new MutationObserver(function(mutations){
            mutations.forEach(function(mutation) {
                if( mutation.type !== "childList" ) return; 

                for(var i=0; i<mutation.addedNodes.length; i++){
                    var addedNode = mutation.addedNodes[i];

                    if( typeof addedNode.tagName === "undefined" ) return; 

                    $(addedNode).find("div._5jmm").each(function(index, element){
		                filter( $(element) );
                    });

                    if( addedNode.classList.contains("uiStreamStory") ){
                        filter( $(addedNode) );
                    }
                }
            });    
		}).observe(target, config);
    }else if(e['switcher']==undefined){
        chrome.storage.sync.set({'switcher':'on'});
          
    };
})


function filter($element){
    chrome.storage.sync.get('block.keyword',function(r){
        if(typeof r['block.keyword'] !== "undefined" && 
           r['block.keyword'].trim() !== ''){
            var keyword = r['block.keyword'].split("\n");
            for (var i = 0; i<keyword.length; i++) {
			    if (keyword[i]!==""){
                    if( $element.find('.userContent:contains("' + keyword[i] + '"), \
                                      .actorName:contains("' + keyword[i] + '"), \
                                      ._5pbw:contains("' + keyword[i] + '")' ).length > 0 ){
                                          $element.addClass("FP-filter");
                                          $element.fadeOut();  break;
                                      }
				}
            }
        }
    })
}

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
