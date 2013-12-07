var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
var widget = require("sdk/widget");
var tabs = require('sdk/tabs');
var ss = require("sdk/simple-storage");
var cm = require("sdk/context-menu");
var _ = require("sdk/l10n").get;

function upload(){
    for each (var tab in tabs){
        if(tab.url.search('https://www.facebook.com') != -1){
            tab.reload();
        }
    }
}

if(ss.storage.state==null){
    ss.storage.list = "";
    ss.storage.state = true;
    ss.storage.mode = "filter";
    upload();
}

var panel = require("sdk/panel").Panel({
    width: 520,
    height: 575,
    contentURL: data.url("setting1.html"),
    contentScriptFile: data.url("popup.js")
});



cm.Item({
    label: _("contextmenu_addfilterkeyword"),
    image: data.url("FB.png"),
    context: [cm.URLContext("https://www.facebook.com/*"),
              cm.SelectionContext()],
    contentScript: 'self.on("context", function(node, data){'+
                   'var text = document.getSelection().toString();'+
                   'if(text.length > 10) text = text.substring(0, 10)+"... ";'+
                   'return "' + _("contextmenu_addfilterkeyword1") + '"+ text + "'+ _("contextmenu_addfilterkeyword2") + '"' +
                   '});'+
                   'self.on("click", function(node, data){'+
                   'self.postMessage(document.getSelection().toString());'+
                   '})',
    onMessage: function(selection){
                    if(ss.storage.list==""){
                        ss.storage.list += selection;
                    }else{
                        ss.storage.list += '\n' + selection;
                    }
                    ss.storage.state = true;
                    upload();
               }
});

pageMod.PageMod({
    include: "https://www.facebook.com/*",
    contentScriptFile: [data.url("jquery_min.js"),
                        data.url("script.js")],
    contentScriptWhen: "ready",
    contentStyleFile: data.url("index.css"),
    onAttach: function(worker){
        worker.port.emit("onAttach", ss.storage.list, ss.storage.state, ss.storage.mode);
    }
});

widget.Widget({
    id: "FPF",
    label: "Facebook Post Filter",
    contentURL: data.url("FB.png"),
    panel: panel
});

panel.on("show", function(){
    panel.port.emit("show", ss.storage.list, ss.storage.state, ss.storage.mode);
});

panel.port.on("save", function(list, state, mode){
    panel.hide();
    ss.storage.list = list;
    ss.storage.state = state;
    ss.storage.mode = mode;
    upload();
});

