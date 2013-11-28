
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

$(document).ready(function(){
    // static international messages
    $('.panel-body div p').html(chrome.i18n.getMessage("setting_note"));
    $('#submit').html(chrome.i18n.getMessage("button_save"));
    $('#clear').html(chrome.i18n.getMessage("button_clear"));
    $('div.copyright p a').html(chrome.i18n.getMessage("company_name"));

    chrome.storage.sync.get('block.keyword',function(r){
        $('textarea').html(r['block.keyword']);
    });
    
	chrome.storage.sync.get('switcher',function(e){
        if(e['switcher']=='on'){
            $('#switcher').html(chrome.i18n.getMessage("button_stop"));
        }else if(e['switcher']=='off'){
            $('#switcher').html(chrome.i18n.getMessage("button_start"));
        }
    });
	/*
	chrome.storage.sync.get('mode',function(e){
        if(e['mode']=='on'){
            $('#mode').html('標記');
        }else if(e['mode']=='off'){
            $('#mode').html('移除');
        }
    });
	*/
    $('#submit').click(function(e){
		var keywords = $('textarea').val().split("\n");
		for (var i = 0; i<keywords.length; i++) {
			if (keywords[i]!==""){
				var keyword=keywords[i].replace(/\ /g,'').toLowerCase();
				if (keyword!==""){
				_gaq.push(['_trackEvent', 'KeywordChanged', keyword]);
				}
			}
		};  
	
		trackButton(e);
        chrome.storage.sync.set({'block.keyword':$('textarea').val()},function(){
            chrome.storage.sync.get('block.keyword',function(r){
			
                $('textarea').html(r['block.keyword']);
                chrome.tabs.reload();
                window.close();
            })    
        });
    })
	
    $('#switcher').click(function(e){
	trackButton(e);
        chrome.storage.sync.get('switcher',function(e){
            if(e['switcher']=='on'){
                $('#switcher').html(chrome.i18n.getMessage("button_start"));
                chrome.storage.sync.set({'switcher':'off'});
            }else if(e['switcher']=='off'){
                $('#switcher').html(chrome.i18n.getMessage("button_stop"));
                chrome.storage.sync.set({'switcher':'on'});
            }
			chrome.tabs.reload();
            window.close();
            $('.notice').css('display','block');
            $('.notice').html(chrome.i18n.getMessage("notice_restart"));
        });
    });
	/*
	$('#mode').click(function(e){
	trackButton(e);
        chrome.storage.sync.get('mode',function(e){
            if(e['mode']=='on'){
                $('#mode').html('移除');
                chrome.storage.sync.set({'mode':'off'});
            }else if(e['mode']=='off'){
                $('#mode').html('標記');
                chrome.storage.sync.set({'mode':'on'});
            }
			chrome.tabs.reload();
            window.close();
            $('.notice').css('display','block');
            $('.notice').html('重新整理頁面後方會啟用');
        });
    });
	*/
	$('#clear').click(function(e){
		trackButton(e);
        $('textarea').html("");
		chrome.storage.sync.set({'block.keyword':$('textarea').val()},function(){
            chrome.storage.sync.get('block.keyword',function(r){			
                $('textarea').html(r['block.keyword']);
                //chrome.tabs.reload();
                //window.close();
            })    
        });
    });
})
