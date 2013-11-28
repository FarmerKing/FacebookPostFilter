var text = document.getElementById('text');
var save = document.getElementById('save');
var switcher = document.getElementById('switcher');
var cl = document.getElementById('clear');
var nav_filter = document.getElementById('nav_filter');
var filter = document.getElementById('filter');
var filter_mes = document.getElementById('filter_mes');
var nav_marker = document.getElementById('nav_marker');
var marker = document.getElementById('marker');
var marker_mes = document.getElementById('marker_mes');

function mode_state(){
    if(filter.checked){
        return "filter";
    }else{
        return "marker";
    }
}

function save_opt(){
    self.port.emit("save", text.value, true, mode_state());
}

function change(){
    self.port.emit("save", text.value, (switcher.innerHTML!="停用"), mode_state());
}

function clear_text(){
    text.value = "";
}

function mode_ch(){
    if(marker.checked){
        nav_marker.className = nav_marker.className + " btn-success";
        nav_filter.className = "btn";
        marker_mes.style.display = null;
        filter_mes.style.display = "none";
    }else{
        nav_filter.className = nav_filter.className + " btn-danger";
        nav_marker.className = "btn";
        filter_mes.style.display = null;
        marker_mes.style.display = "none";
    }
}

function onShow(list, state, mode){
    text.value = list;
    
    if(state){
        switcher.innerHTML = "停用";
    }else{
        switcher.innerHTML = "啟用";
    }
    
    filter.checked = (mode=="filter");
    marker.checked = (mode=="marker");
    
    mode_ch();
}

self.port.on("show", onShow);
save.onclick = save_opt;
switcher.onclick = change;
cl.onclick = clear_text;
nav_filter.onclick = mode_ch;
nav_marker.onclick = mode_ch;
