var FBV = $('._6ns').length;
var mark_list = new Array();

function scroll_event(){
    var eventObj = document.createEvent('HTMLEvents');
	eventObj.initEvent('scroll', true, false);
	window.dispatchEvent(eventObj);
}

function button_left(){
	if($("div._5jmm, li.uiUnifiedStory").length){
		var left = $("#scrollup").offset().left;
		if(left) return;
		
		if($("#rightCol").length){
			// 舊版FB
			left = $("#rightCol").offset().left-38;
		}else if($("div._4bl7._4bmn").length){
			// 新版FB
			left = $("div._4bl7._4bmn").offset().left-38;
		}
		
		// $("#scrollup, #scrolldown, #menu").css("left", left);
		// $("#scrollup, #scrolldown, #text").show();
		$("#scrollup, #scrolldown").css("left", left);
		$("#scrollup, #scrolldown").show();
		scroll_event();
	}else if($("#scrollup:visible").length){
		// $("#scrollup, #scrolldown, #text").hide();
		$("#scrollup, #scrolldown").hide();
	}
}

function filter(text){
    if(text=="" || !$("div._5jmm, li.uiUnifiedStory").length) return;

    var keyword = text.split('\n');
    
	if(FBV){
		// 新版FB
		// _6nl: 貼文者的名字 標題
		// _6m3: 分享的連結預覽內容
		// _6nm: 貼文者的內容 包含See Translation
		// _6kv: 上傳檔案的附件文字
		// translationEligibleUserMessage: 分享的別人貼文的內容
		// userContent: 貼文者的內容
		// UFICommentContent: 底下的留言 包含留言者的名字
		
		$("._6nl:not(.FPF-a)").addClass("FPF-b");
		$("._6m3:not(.FPF-a)").addClass("FPF-b");
		$("._6kv:not(.FPF-a)").addClass("FPF-b");
		$(".userContent:not(.FPF-a)").addClass("FPF-b");
		$(".UFICommentContent:not(.FPF-a)").addClass("FPF-b");
		$(".translationEligibleUserMessage:not(.FPF-a)").addClass("FPF-b");
	}else{
		// 舊版FB
		if($("._5jmm").length){
			// 動態時報
			// _5pbw: 貼文者的名字 標題
			// _5pb1: 分享的連結預覽內容
			// userContent: 貼文內容
			// UFICommentContent: 底下的留言 包含留言者的名字
			
			$("._5pbw:not(.FPF-a)").addClass("FPF-b");
			$("._5pb1:not(.FPF-a)").addClass("FPF-b");
			$(".userContent:not(.FPF-a)").addClass("FPF-b");
			$(".UFICommentContent:not(.FPF-a)").addClass("FPF-b");
		}else{
			// 其它的頁面
			// uiStreamMessage: 貼文者的名字 標題 包含userContent
			// attachmentText: 分享的連結預覽內容
			// shareSubtext: 分享的相片的文字內容
			// uiStreamAttachments: 貼文的內容 包括圖片和文字內容
			// UFICommentContent: 底下的留言 包含留言者的名字
			// shareText: 分享的連結預覽內容 包括超連結
			
			$(".uiStreamMessage:not(.FPF-a)").addClass("FPF-b");
			$(".attachmentText:not(.FPF-a)").addClass("FPF-b");
			$(".shareSubtext:not(.FPF-a)").addClass("FPF-b");
			$(".uiStreamAttachments:not(.FPF-a)").addClass("FPF-b");
			$(".UFICommentContent:not(.FPF-a)").addClass("FPF-b");
		}
	}
	
    for(var i = 0; i < keyword.length; i++ ){
		var key = keyword[i].trim();
	
        if( key != "" ){
			$(".FPF-b:contains('" + key + "')")
			.toggleClass("FPF-b FPF-a")
			.closest("div._5jmm, li.uiUnifiedStory")
			.fadeOut();
            // .hide();
			// .css("background", "#B6B6B4");
		}
    }
    $(".FPF-b").toggleClass("FPF-b FPF-a");
}

function mark(text){
	if(text=="" || !$("div._5jmm, li.uiUnifiedStory").length) return;
	
    var keyword = text.split('\n');
    
    if(FBV){
		// 新版FB
		// _6nl: 貼文者的名字 標題
		// _6m3: 分享的連結預覽內容
		// _6nm: 貼文者的內容 包含See Translation
		// _6kv: 上傳檔案的附件文字
		// translationEligibleUserMessage: 分享的別人貼文的內容
		// userContent: 貼文者的內容
		// UFICommentContent: 底下的留言 包含留言者的名字
		
		$("._6nl:not(.FPF-a)").addClass("FPF-b");
		$("._6m3:not(.FPF-a)").addClass("FPF-b");
		$("._6kv:not(.FPF-a)").addClass("FPF-b");
		$(".userContent:not(.FPF-a)").addClass("FPF-b");
		$(".UFICommentContent:not(.FPF-a)").addClass("FPF-b");
		$(".translationEligibleUserMessage:not(.FPF-a)").addClass("FPF-b");
	}else{
		// 舊版FB
		if($("._5jmm").length){
			// 動態時報
			// _5pbw: 貼文者的名字 標題
			// _5pb1: 分享的連結預覽內容
			// userContent: 貼文內容
			// UFICommentContent: 底下的留言 包含留言者的名字
			
			$("._5pbw:not(.FPF-a)").addClass("FPF-b");
			$("._5pb1:not(.FPF-a)").addClass("FPF-b");
			$(".userContent:not(.FPF-a)").addClass("FPF-b");
			$(".UFICommentContent:not(.FPF-a)").addClass("FPF-b");
		}else{
			// 其它的頁面
			// uiStreamMessage: 貼文者的名字 標題 包含userContent
			// attachmentText: 分享的連結預覽內容
			// shareSubtext: 分享的相片的文字內容
			// uiStreamAttachments: 貼文的內容 包括圖片和文字內容
			// UFICommentContent: 底下的留言 包含留言者的名字
			// shareText: 分享的連結預覽內容 包括超連結
			
			$(".uiStreamMessage:not(.FPF-a)").addClass("FPF-b");
			$(".attachmentText:not(.FPF-a)").addClass("FPF-b");
			$(".shareSubtext:not(.FPF-a)").addClass("FPF-b");
			$(".uiStreamAttachments:not(.FPF-a)").addClass("FPF-b");
			$(".UFICommentContent:not(.FPF-a)").addClass("FPF-b");
		}
	}

    for(var i = 0; i < keyword.length; i++ ){
		var key = keyword[i].trim();
	
        if( key != "" ){
            $(".FPF-b:contains('" + key + "')")
            .each(function(index,e){
                var list = new Array();
                var or_html = e.outerHTML;
                var mark_html;
                var newKey = key.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                var strReg = new RegExp(newKey, "g");
                var repstr = "<span class=\"mark\">"+newKey+"</span>";

                for(var j=0; j<or_html.length; j++){
                    if(or_html.charAt(j)=='<' || or_html.charAt(j)=='>'){
                        list.push(j);
                    }
                }
                
                mark_html = or_html.substring(0, list[1]+1);
                
                for(var j=1; j<list.length-2; j+=2){
                    mark_html +=
                    or_html.substring(list[j]+1, list[j+1]).replace(strReg, repstr)+
                    or_html.substring(list[j+1], list[j+2]+1);
                }
            });
			
			$(".FPF-b:not(.FPF-a):contains('" + key + "')")
			.addClass("FPF-a")
			.closest("div._5jmm, li.uiUnifiedStory")
			.addClass("marker");
		}
    }
    $(".FPF-b").addClass("FPF-a").removeClass("FPF-b");
}

self.port.on("onAttach", function onShow(list, state, mode){
    if(state){
        if(mode=="marker"){
			$("<a id=\"scrollup\"></a><a id=\"scrolldown\"></a>").prependTo($("body"));
			// $("<div id=\"menu\"><textarea id=\"text\"></textarea><button id=\"save\">儲存</button>").prependTo($("body"));
			$("#scrollup, #scrolldown").hide();
			// $("#text, #save").hide();
			$("#scrollup").css("bottom", document.documentElement.clientHeight/2+26);
			$("#scrolldown").css("top", document.documentElement.clientHeight/2+26);
			// $('#menu').css("top", document.documentElement.clientHeight/2-18);
			
			$(window).load(function(){
				if(!FBV && $("div.fbChatSidebarBody").length && $("#rightCol").length){
					new MutationObserver(function(mutations){
						var left = $("#rightCol").offset().left-38;
						// $("#scrollup, #scrolldown, #menu").css("left", left);
						$("#scrollup, #scrolldown").css("left", left);
					}).observe($("div.fbChatSidebarBody")[0], { attributes: true, subtree: true });
				}
			});
            
			$(window).scroll(function(){
				var top = parseInt($(window).scrollTop());
				var marker = $(".marker:visible");
				mark_list = new Array();
				
				for(var i=0; i<marker.length; i++){
					mark_list.push(parseInt( marker.eq(i).offset().top )-50);
				}
				
				$("#scrollup, #scrolldown").removeClass("disabled");
				
				if(mark_list.length==0 || top <= mark_list[0]){
					$("#scrollup").addClass("disabled");
				}
				
				if(mark_list.length==0 || top >= mark_list[mark_list.length-1]){
					$("#scrolldown").addClass("disabled");
				}
			});
			
			$("#scrollup").click(function(){
				if($(this).hasClass("disabled")) return;
			
				scroll_event();
				var top = parseInt($(window).scrollTop());
				
				if(top > mark_list[mark_list.length-1]){
					$('html').animate({
						scrollTop: mark_list[mark_list.length-1]
					}, 600);
					// $(window).scrollTop(mark_list[mark_list.length-1]);
				}else if(top > mark_list[0]){
					for(var i=0; i<mark_list.length-1; i++){
						if(top>mark_list[i] && top<=mark_list[i+1]){
							$('html').animate({
								scrollTop: mark_list[i]
							}, 600);
							// $(window).scrollTop(mark_list[i]);
							break;
						}
					}
				}
			});
            
			$("#scrolldown").click(function(){
				if($(this).hasClass("disabled")) return;
			
				scroll_event();
				var top = parseInt($(window).scrollTop());
				
				if(top < mark_list[0]){
					$('html').animate({
						scrollTop: mark_list[0]
					}, 600);
					// $(window).scrollTop(mark_list[0]);
				}else if(top < mark_list[mark_list.length-1]){
					for(var i=0; i<mark_list.length-1; i++){
						if(top>=mark_list[i] && top<mark_list[i+1]){
							$('html').animate({
								scrollTop: mark_list[i+1]
							}, 600);
							// $(window).scrollTop(mark_list[i+1]);
							break;
						}
					}
				}
			});

			// $("#text").focus(function(){
				// $(this).val(list);
				// $("#save").show();
			// });
			
			// $("#text").blur(function(){
				// $("#text").val("");
				// $("#save").hide();
			// });
			
			// $("#save").click(function(){
				// self.port.emit("save", $("#text").val(), true, "marker");
			// });
			
			new MutationObserver(function(mutations){
				mark(list);
				button_left();
			}).observe(document.body, {childList: true, subtree: true});
		}else{
			new MutationObserver(function(mutations){
				filter(list);
			}).observe(document.body, {childList: true, subtree: true});
		}
    }
});

