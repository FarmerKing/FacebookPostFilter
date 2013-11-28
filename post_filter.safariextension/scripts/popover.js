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
}


var settings = safari.extension.globalPage.contentWindow.settings;
var FFMessages = safari.extension.globalPage.contentWindow.FFMessages;
settings.action = 'filter'; // only use filter now

var updateStatus = function(){
    $('#textarea_filter').val(settings["filter.keyword"]);
    $('#textarea_mark').val(settings["mark.keyword"]); 
    //update the switcher status
    if(settings['switcher']=='on'){
        $('#switcher').html(FFMessages.button_stop);
    }else if(settings['switcher']=='off'){
        $('#switcher').html(FFMessages.button_start);
    }
};

$(document).ready(function(){
    //console.log("popover ready");
    var _classname ={"mark":"active","filter":"r_active"};

    // static messages
    $('#tab_filter div p').html(FFMessages.filter_message);
    $('#submit').html(FFMessages.button_save);
    $('#clear').html(FFMessages.button_clear);
    $('#a_chenghsi').html(FFMessages.company_name);

    //changes setting according to settings
    updateStatus();
    
    $("textarea").bind("change", function(e){
        settings["filter.keyword"]=$('#textarea_filter').val();
        settings["mark.keyword"]=$('#textarea_mark').val();
    });

    //create event handler for clear keyword button
    $('#clear').click(function(e){
        $('#textarea_filter').val("");
        $('#textarea_mark').val("");
        settings["filter.keyword"]="";
        settings["mark.keyword"]="";

        //update settings
        safari.extension.globalPage.contentWindow.togglePageSwitch(settings);
    });

    //create event handler for click submit(save) button
    $('#submit').click(function(e){
	    var keywords = $('#textarea_' + settings.action).val().split("\n")
                .map(function(keyword){ return keyword.trim();})
                .filter(function(keyword){
		            if (keyword !==""){
			            keyword=keyword.replace(/\ /g,'').toLowerCase();
			            if (keyword!==""){
			                _gaq.push(['_trackEvent', 'KeywordChanged', keyword]);
			            }
                        return true;
		            }
                    else return false;
                });
        trackButton(e);
        settings["filter.keyword"]=keywords.join("\n");
        //settings["mark.keyword"]=$('#textarea_mark').val();

        //update settings
        safari.extension.globalPage.contentWindow.togglePageSwitch(settings);

        safari.self.hide()
    });

    //create event for switch button
    $('#switcher').click(function(e){
	    trackButton(e);
        if(settings['switcher']=='on'){
            $('#switcher').html(FFMessages.button_start);
            settings["switcher"]='off';
        }else if(settings['switcher']=='off'){
            $('#switcher').html(FFMessages.button_stop);
            settings["switcher"]='on';
        }

        //update settings
        safari.extension.globalPage.contentWindow.togglePageSwitch(settings);

        safari.self.hide()
    });
});