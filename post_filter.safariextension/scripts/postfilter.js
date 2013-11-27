(function() {
    if(window !== window.top)
        return;

    Date.MutationObserver = window.WebKitMutationObserver || window.MutationObserver || window.MozMutationObserver || null; 

    if( !Date.MutationObserver ) return; 

    //case-insensitive Conatin
    jQuery.expr[':'].Contains = function(a, i, m) {
        return jQuery(a).text().toLowerCase().indexOf(m[3].toLowerCase()) >= 0;
    };

    var settings = {"action":'filter', 
                    "switcher": 'on', 
                    "filter.keyword":"", 
                    "mark.keyword":""};
    var fbStreamObject = null;

    var reverseAction = function(oriAction){
        $(".FP-filter").each(function(i, domItem){
            $(domItem).fadeIn();
        });
    };

    var applyAction = function(messageProcess,newSettings){
        $("li.uiStreamStory").each( function(index, element){
            messageProcess( $(element), newSettings);
        });
        
        $("div._5jmm").each(function(index, element){
		    messageProcess( $(element), newSettings );
        });
    };

    function filter($element,_settings){
        if(_settings['filter.keyword'].trim()!=''){
            var keyword = _settings['filter.keyword'].trim().split("\n");
            for (var i = 0; i<keyword.length; i++) {
                if (keyword[i]==="") continue; 
                if( $element.is(':Contains("' + keyword[i] + '")') ){ 
                    $element.addClass("FP-filter");
                    $element.fadeOut();  break;}
            }
        }
    }

    // create an observer instance
    var observer = new Date.MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if( mutation.type !== "childList" ) return; 

            for(var i=0; i<mutation.addedNodes.length; i++){

                var addedNode = mutation.addedNodes[i];
                if( typeof addedNode.tagName === "undefined" ) return; 

                if( addedNode.tagName.toLowerCase() === "div" ){
                    $(addedNode).find("div._5jmm").each(function(index, element){
		                eval(settings['action'])( $(element), settings );
                    });
                }else if( addedNode.tagName.toLowerCase() === "li" && 
                          addedNode.classList.contains("uiStreamStory") ){
                    eval(settings['action'])( $(addedNode), settings );
                }
                
            }
        });    
    });

    var initAction = function(){
        if( fbStreamObject != null ){
            $(fbStreamObject).find("div._5jmm").each(function(index, element){
		        eval(settings['action'])( $(element), settings );
            }); 
            $(fbStreamObject).find("li.uiStreamStory").each(function(index, element){
		        eval(settings['action'])( $(element), settings );
            }); 
        }
    };

    function onMessageReceived(theMessageEvent) {
        // configuration of the observer:
        var _config = { attributes: false, childList: true, characterData: false, subtree:true };

        var newSettings = theMessageEvent.message;
        switch (theMessageEvent.name) {
        case 'init':
            settings = newSettings;
            initAction();
            if(  newSettings['switcher'] === 'on'){
	            observer.observe(fbStreamObject, _config);
            }
            else
	            observer.disconnect();
            
            break;
        case 'toggleSwitch': 
            observer.disconnect();
            if(  newSettings['switcher'] === 'on'){
                observer.observe(fbStreamObject, _config);
            }

            reverseAction(settings.action);
            if(  newSettings['switcher'] === 'on'){
                applyAction(eval(newSettings.action),newSettings);
            }

            settings = newSettings;
            break;
        }
    }


    $(function() {
        // select the target node
        fbStreamObject = document.body; 

        if( fbStreamObject != null ){
            //listen to message from extension
            safari.self.addEventListener("message", onMessageReceived, false);

            // get init settings from global page
            safari.self.tab.dispatchMessage('getSettings');

            // add action to "add keyword" on context menu 
            document.addEventListener("contextmenu", function(e){
                var selectedText = null;
                if (window.getSelection) {
                    selectedText = window.getSelection();
                } else if (document.selection) {
                    selectedText = document.selection.createRange();
                }
                safari.self.tab.setContextMenuEventUserInfo(e, selectedText.toString().trim());
            }, false);
        }
    });


  
})();


