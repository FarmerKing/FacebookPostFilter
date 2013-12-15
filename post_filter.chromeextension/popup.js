var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-43248623-2']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  
})();
function trackButton(e) {
    _gaq.push(['_trackEvent', e.target.id, 'clicked']);
};

var filter_note_show = window.localStorage["postfilter-popup-filternote"] ? JSON.parse(window.localStorage["postfilter-popup-filternote"]) : true;

// get the settings from background page
chrome.runtime.getBackgroundPage(function(backgroundPage){
    var switcher = backgroundPage.Switcher.get();

    $(document).ready(function(){
        $("input:radio[name='option_switcher']").click(event_toggleSwitcher);
        $("#submit_keyword").click(event_addBlockKeyword);
        $("#input_keyword").submit(event_addBlockKeyword);
        $("#trash_li a").click(blockKeywordUI.clear);

        $("button.close").click(function(){
            filter_note_show = false;
            window.localStorage.setItem("postfilter-popup-filternote", "false");
            $('.panel-body div.alert-success').hide();
        });

        //change UIsetting according to settings
        updateStatus(switcher);
    })
});

var blockKeywordUI = function(){
    return {
        "clear": function(){
            chrome.runtime.getBackgroundPage(function(backgroundPage){
                backgroundPage.clearBlockKey();
                $(".list-group").empty();
            });
        },
        "addCount": function(_keyword,_count){
            $('.list-group-item:contains("' + _keyword + '") span').html(_count);
        },
        "addAndSet": function(_keyword) {
            chrome.runtime.getBackgroundPage(function(backgroundPage){
                if( backgroundPage.addBlockKey(_keyword) )
                    $('<li class="list-group-item"><a href="#"></a><span class="badge"></span>'+
                      _keyword +'</li>').appendTo(".list-group");
            });
        },
        "removeAndSet": function(_keyword) {
            chrome.runtime.getBackgroundPage(function(backgroundPage){
                backgroundPage.removeBlockKey(_keyword);
            });
        },
        "init": function(){
            chrome.runtime.getBackgroundPage(function(backgroundPage){
                var keywords_count = backgroundPage.BlockKeywords.get();
                keywords_count.forEach(function( keyword ){
                    if( keyword.name.trim() !== ""){
                        $('<li class="list-group-item"><a href="#"></a><span class="badge">' +
                          keyword.count + '</span>'+
                          keyword.name +'</li>').appendTo(".list-group").click(event_removeBlockKeyword).find("a").click(event_removeBlockKeyword);
                    }
                });

            });
        }
    };
}();

//update UI
var updateStatus = function(switcher){
    // static international messages
    $('div.copyright p a').html(chrome.i18n.getMessage("company_name"));
    $("#submit_keyword").html(chrome.i18n.getMessage("button_add"));
    $("#input_keyword").prop("placeholder", chrome.i18n.getMessage("hint_addkeyword"));
    $("#option_enable + span").html(chrome.i18n.getMessage("option_enable"));
    $("#option_disable + span").html(chrome.i18n.getMessage("option_disable"));

    if(filter_note_show){
        $('.panel-body div.alert-success p').html(chrome.i18n.getMessage("setting_note"));
        $('.panel-body div.alert-success').show();
    }else{
        $('.panel-body div.alert-success').hide();
    }

    // print ui
    blockKeywordUI.init();

    //update the switcher status
    if(switcher==='off'){
        $("#option_disable").prop("checked",true);
        $("#div_main").hide();
        $("#option_disable").focus();
    }else{
        $("#option_enable").prop("checked",true);
        $("#div_main").show();
        $("#input_keyword").focus();
    }
};

var event_addBlockKeyword = function(e){
    var keyword = $("#input_keyword").val().trim();

	_gaq.push(['_trackEvent', 'KeywordChanged', keyword]);

    if(keyword === '') return; 
    blockKeywordUI.addAndSet(keyword);
}

var event_toggleSwitcher = function(e){
    if( e.target.getAttribute("value") === "enable" ){
        $("#div_main").show();
    }else{
        $("#div_main").hide();
    }
    chrome.runtime.getBackgroundPage(function(backgroundPage){
         backgroundPage.toggleSwitcher();
    });
}

var event_removeBlockKeyword = function(e){
    if( this.tagName.toLowerCase() !== "li" ) return;
    var keyword = "";
    $(this).contents().each(function() {
        if( this.nodeType == 3){
            keyword = $(this).text();
            return false;
        }
    });

    if(keyword === '') return; 
    blockKeywordUI.removeAndSet(keyword);
    $(this).remove();
}

