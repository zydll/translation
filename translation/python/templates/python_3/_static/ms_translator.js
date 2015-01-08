function getOriginTexts() {
  $.ajax({
    type: "GET",
    url: window.location.pathname + "/origion/", 
    dataType: "json",
    success: function(data) {
      window.origion_texts = data;
    },
    error: function(jqXHR) {
      window.origion_texts = {};
    }
  })
}

function getStatsTab() {
  return $('<div class="MSTCStatsTab" style="margin-top: 2px;"><div class="MSTCVoteCount MSTCEdit" title="编辑此翻译" style="margin-top: 1px; text-align: center; border-top-left-radius: 2px; border-bottom-left-radius: 2px; background-color: #3D98CD;"><span><font style="display: inline-block; margin: 4px 1px 0px 3px;"></font><img src="/python_278/_static/ctfedit.gif" style="margin: 7px 3px 0px 1px;"></span></div><div class="MSTCVoteCount MSTCPlus" title="建议将此翻译作为更好的翻译" style="margin-top: 1px; text-align: center; border-top-left-radius: 2px; border-bottom-left-radius: 2px; background-color: #3D98CD;"><span><font style="display: inline-block; margin: 4px 1px 0px 3px;"></font><img src="/python_278/_static/ctfvotes.gif" style="margin: 7px 3px 0px 1px;"></span></div><div class="MSTCVoteCount MSTCMinus" title="觉得此翻译不够好" style="margin-top: 1px; text-align: center; border-top-left-radius: 2px; border-bottom-left-radius: 2px; background-color: rgb(191, 42, 45);"><span style="background-color: rgb(191, 42, 45);"><font style="display: inline-block; margin: 4px 1px 0px 3px;">0</font><img src="/python_278/_static/ctfreport.gif" style="margin: 7px 3px 0px 1px;"></span></div></div>');
}

function getButtonPanelDiv() {
  return $('<div id="MSTCButtonPanel" style="display: none; margin-top: 4px;"><a class="MSTCBlueButton MSTCSwitchButton MSTCButtonLabel" title="切换 Html/Text 编辑模式"><span class="Text" style="background-color: #71d1d1; float: left; padding: 2px; margin: -2px 2px; width: 35px;">Text</span></a><a class="MSTCBlueButton MSTCSubmitButton" title="提交"><span class="MSTCButtonLabel" style="color: rgb(255, 255, 255); background-color: rgb(61, 152, 205); border-left-color: white;">提交</span></a><a class="MSTCRedButton MSTCCancelButton" title="取消"><span class="MSTCButtonLabel" style="color: rgb(255, 255, 255); background-color: rgb(191, 42, 45); border-left-color: white;">取消</span></a></div>');
}

function getTransEditDiv() {
  return $('<div id="MSTCTransEdit" style="padding: 8px 95px 16px 4px; display: none;"><textarea class="MSTCTransEdit" name="translation" style="width: 100%; min-height: 50px;; padding: 4px;"></textarea></div>');
}

function getTransHtmlEditDiv() {
  return $('<div id="MSTCTransHtmlEdit" style="padding: 8px 87px 14px 4px; height: 60px; display: none;"><iframe class="MSTCTransHtmlEdit" name="translation" style="width: 100%; height: 100%; background-color: white;"><html><head></head><body></body></html></iframe></div>');
}

function getTransPannelDiv() {
  return $('<div class="MSTCTransPanel"></div>');
}

function getTransBoxDiv() {
  return $('<div class="MSTCTransBox"></div>');
}

function getTranslation() {
  $.ajax({
    type: "GET",
    url: window.location.pathname + "/translation/" + window.sid + "/", 
    dataType: "json",
    success: function(data) {
      data.sort(function (x, y) {return y.plus - y.minus - x.plus + x.minus});
      window.translation = data;
      window.page = 1;
      window.total_page = Math.ceil(data.length / 3);
      $('#MSTCPage').text(window.page + ' / ' + window.total_page);
      window.clickPage = false;
      $("#MSTCPrevLink").css( 'color', 'rgb(153, 153, 153)');
      $("#MSTCNextLink").css( 'color', 'rgb(85, 153, 255)');
      if((window.translation.length - window.page * 3) <= 0 ) {
        $("#MSTCNextLink").css( 'color', 'rgb(153, 153, 153)');
      }
      for(var i = 0, l = data.length; i < l; i++){
        var transPannel = getTransPannelDiv();
        //stats tab
        var statsTab = getStatsTab();
        statsTab.attr('id', data[i].tid);
        statsTab.find('div.MSTCPlus font').text(data[i].plus);
        statsTab.find('div.MSTCMinus font').text(data[i].minus);
        transPannel.append(statsTab);
        // Button panel
        var buttonPanel = getButtonPanelDiv();
        transPannel.append(buttonPanel);
        // TransEdit Div
        var transEditDiv = getTransEditDiv();
        transEditDiv.find('textarea').val(data[i].trans_text);
        transPannel.append(transEditDiv);
        //TransHtmlEdit Div
        var transHtmlEditDiv = getTransHtmlEditDiv();
        transPannel.append(transHtmlEditDiv);
        //Trans box
        var transBox = getTransBoxDiv();
        transBox.html(data[i].trans_text);
        //window.transbox = transBox;
        if (i == 0) {
          window.statsTab = statsTab;
          transBox.css( 'color', '#009D45');
        } else {
          statsTab.hide();
        }
        transPannel.append(transBox);
        // append
        $("#MSTCTransPanel").append(transPannel);
        if( i >= 3) {
          transPannel.hide();
        }
      }
      showRootPanel();
    },
    error: function(jqXHR) {
    }
  })
}

function showTranslator() {
  //window.sbg_color = $('#' + window.sid).css("background-color");
  //$('#' + window.sid).css("background-color", "#60a0d0");
  window.sid = window.hover_id;
  var offset = $('#' + window.sid).offset();

  $("#MSTCOrigion").html(window.origion_texts[window.sid]);
  hideRootPanel();
  $("#MicrosoftTranslator").stop(true,true).show(0);
  $("#MicrosoftTranslator").offset(offset);
  
  mt_height = $("#MicrosoftTranslator").outerHeight();
  offset.top = offset.top - mt_height - 3;
  if(offset.top <= 0) {
    offset.top = offset.top + $('#' + window.sid).outerHeight() + mt_height + 7;
  }
  if(offset.left + $("#MicrosoftTranslator").width() > window.innerWidth - 25) {
    offset.left = window.innerWidth - 25 - $("#MicrosoftTranslator").width();
  }
  $("#MicrosoftTranslator").offset(offset);
}

function switchRootPanel(){
  if($("#MSTCRootPanel").is(":hidden")) {
    getTranslation();
  } else {
    hideRootPanel();
  }
}

function showRootPanel() {
  $("#MSTCSuggest").show();
  $("#MSTCToggleUp").show();
  $("#MSTCRootPanel").show();
  $("#MSTCImprove").hide();
  $("#MSTCToggleDown").hide();
  window.boolShowEdit = false;
}

function hideRootPanel() {
  $(".MSTCTransPanel").remove();
  $("#MSTCSuggest").hide();
  $("#MSTCToggleUp").hide();
  $("#MSTCRootPanel").hide()
  $("#MSTCImprove").show();
  $("#MSTCToggleDown").show();
  window.boolShowEdit = false;
}

function showTextEdit() {
  $('div.MSTCTransPanelHover #MSTCTransEdit').show();
  $('div.MSTCTransPanelHover #MSTCTransHtmlEdit').hide();
  $('div.MSTCTransPanelHover div#MSTCButtonPanel').show();
  $('div.MSTCTransPanelHover div.MSTCTransBox').hide();
  $('div.MSTCTransPanelHover div.MSTCStatsTab').hide();
  window.boolShowEdit = true;
}

function showHtmlEdit() {
  $('div.MSTCTransPanelHover #MSTCTransEdit').hide();
  $('div.MSTCTransPanelHover #MSTCTransHtmlEdit').children('iframe')[0].contentWindow.document.body.innerHTML = $('div.MSTCTransPanelHover #MSTCTransEdit').children('textarea').val();
  $('div.MSTCTransPanelHover #MSTCTransHtmlEdit').children('iframe')[0].contentWindow.document.designMode = 'on';
  $('div.MSTCTransPanelHover #MSTCTransHtmlEdit').children('iframe').contents().find("head").append($('<link rel="stylesheet" type="text/css" href="/python_278/_static/basic.css">'))
  $('div.MSTCTransPanelHover #MSTCTransHtmlEdit').children('iframe')[0].contentWindow.document.body.setAttribute('style', 'font-size: 12px');
  $('div.MSTCTransPanelHover #MSTCTransHtmlEdit').show();
  $('div.MSTCTransPanelHover div#MSTCButtonPanel').show();
  $('div.MSTCTransPanelHover div.MSTCTransBox').hide();
  $('div.MSTCTransPanelHover div.MSTCStatsTab').hide();
  window.boolShowEdit = true;
}

function showEdit() {
  var span = $('div.MSTCTransPanelHover .MSTCSwitchButton').find("span");
  var status = span.attr("class");
  if(status == 'Text') {
    showTextEdit();
  } else {
    showHtmlEdit();
  }
}

function MSTCSwitchButton() {
  var span = $('div.MSTCTransPanelHover .MSTCSwitchButton').find("span");
  var status = span.attr("class");
  if(status == 'Text') {
    span.css('float', 'right');
    span.toggleClass('Text');
    span.text('Html');
    $('div.MSTCTransPanelHover #MSTCTransHtmlEdit').children('iframe')[0].contentWindow.document.body.innerHTML = $("div.MSTCTransPanelHover .MSTCTransEdit").val();
    showHtmlEdit();
  } else {
    span.css('float', 'left');
    span.toggleClass('Text');
    span.text('Text');
    $("div.MSTCTransPanelHover .MSTCTransEdit").val($('div.MSTCTransPanelHover #MSTCTransHtmlEdit').children('iframe')[0].contentWindow.document.body.innerHTML.replace("<br>", ""));
    showEdit();
  }
}

function showTransBox() {
  $("div.MSTCTransPanelHover #MSTCTransEdit").hide();
  $('div.MSTCTransPanelHover #MSTCTransHtmlEdit').hide();
  $("div.MSTCTransPanelHover div#MSTCButtonPanel").hide();
  $('div.MSTCTransPanelHover div.MSTCTransBox').show();
  $('div.MSTCTransPanelHover div.MSTCStatsTab').show();
  window.boolShowEdit = false;
}

function submitTranslation() {
  if($('div.MSTCTransPanelHover .MSTCSwitchButton span').attr('class') != 'Text') {
    $("div.MSTCTransPanelHover .MSTCTransEdit").val($('div.MSTCTransPanelHover #MSTCTransHtmlEdit').children('iframe')[0].contentWindow.document.body.innerHTML.replace("<br>", ""));
  }
  var translation = $("div.MSTCTransPanelHover .MSTCTransEdit").val();
  var plus = $("div.MSTCTransPanelHover").find('div.MSTCPlus font').text();
  var minus = $("div.MSTCTransPanelHover").find('div.MSTCMinus font').text();
  var prev = $("div.MSTCTransPanelHover .MSTCTransEdit").prev();
  var pre_vote = 0;
  if (prev.length == 0) {
    pre_vote = parseInt(plus, 10) - parseInt(minus, 10);
  } else {
    var pre_plus = prev.find('div.MSTCPlus font').text();
    var pre_minus = prev.find('div.MSTCMinus font').text();
    pre_vote = parseInt(pre_plus, 10) - parseInt(pre_minus, 10);
  }
  $.ajax({
      type: "POST",
      url: window.location.pathname + "/translation/" + window.sid + "/", 
      data: $("div.MSTCTransPanelHover .MSTCTransEdit").serialize() + "&plus=" + plus + "&minus=" + minus + '&pre_vote=' + pre_vote.toString(),
      success: function(data) {
        $(".MSTCTransPanel").remove();
        getTranslation();
        window.boolShowEdit = false;
        if(parseInt(data) > 0) {
          $('#' + window.sid).html(translation);
        }
      },
      error: function(jqXHR) {
        $("#MSTCTransPanelError").width($(".MSTCTransPanelHover").width() - 20);
        $("#MSTCTransPanelError").height($(".MSTCTransPanelHover").height() - 20);
        var top = $(".MSTCTransPanelHover").position().top;
        $("#MSTCTransPanelError").css('top', top + 'px');
        $("#MSTCTransPanelErrorMsg").text(jqXHR.responseText);
        $("#MSTCTransPanelError").show();
      }
    })
}

function checkShowTranslator() {
     if($("#MicrosoftTranslator").is(":hidden") && !window.boolShowEdit) {
          showTranslator();
    }
}

$(document).ready(function(){

  getOriginTexts();
  window.boolShowEdit = false;
  $("#MicrosoftTranslator").hide();
  $("font").hover(function() {
    if(!window.boolShowEdit) {
      window.hover_id = $(this).attr("id");
      window.sbg_color = $('#' + window.hover_id).css("background-color");
      $('#' + window.hover_id).css("background-color", "#60a0d0");
    }
    window.timeout_st = setTimeout(checkShowTranslator , 1010);
    //if($("#MicrosoftTranslator").is(":hidden") && !window.boolShowEdit) {
    //  window.sid = $(this).attr("id");
    //  showTranslator();
    //}
  }, function() {
    clearTimeout(window.timeout_st);
    if(!window.boolShowEdit) {
      $(this).css("background-color", window.sbg_color);
      $("#MicrosoftTranslator").stop(true,true).delay(1000).hide(0);
    }
  });
  
  $("#MicrosoftTranslator").hover(function() {
    if(!window.boolShowEdit) {
      $('#' + window.sid).css("background-color", "#60a0d0");
      window.clickPage = false;
      $(this).stop(true,true).show();
    }
  }, function(){
    if(!window.boolShowEdit && !window.clickPage) {
      $('#' + window.sid).css("background-color", window.sbg_color);
      $(this).stop(true,true).hide(0);
     }
  });
  
  $("#MSTCClose").click(function(){
    hideRootPanel();
    window.clickPage = false;
    $("#MicrosoftTranslator").stop(true,true).hide(0);
  });
  
  $("#MSTCExpandLink").click(switchRootPanel);
  
  $(document).delegate('div.MSTCTransPanel', 'mouseover', function() {
    if(!window.boolShowEdit) {
      $(this).addClass("MSTCTransPanelHover");
      $(this).find('div.MSTCStatsTab').show();
    }
  });
  
  $(document).delegate('div.MSTCTransPanel', 'mouseout', function() {
    if(!window.boolShowEdit) {
      $(this).removeClass("MSTCTransPanelHover");
      $(this).find('div.MSTCStatsTab').hide();
    }
  });

  $(document).delegate('div.MSTCPlus', 'click', function() {
    var elem = $(this)[0];
    $.ajax({
      type: "PUT",
      url: window.location.pathname + "/vote/plus/" + elem.parentElement.getAttribute('id') + '/', 
      success: function(data) {
        elem.getElementsByTagName('font')[0].textContent = data;
      },
      error: function(jqXHR) {
      }
    })
  });
  
  $(document).delegate('div.MSTCMinus', 'click', function() {
    var elem = $(this)[0];
    $.ajax({
      type: "PUT",
      url: window.location.pathname + "/vote/minus/" + elem.parentElement.getAttribute('id') + '/', 
      success: function(data) {
        elem.getElementsByTagName('font')[0].textContent = data;
      },
      error: function(jqXHR) {
      }
    })
  });
  
  $(document).delegate('div.MSTCEdit', 'click', function() {
    showEdit();
  });
  
  $(document).delegate('.MSTCCancelButton', 'click', function() {
    showTransBox();
  });
  
  $(document).delegate('.MSTCSubmitButton', 'click', function() {
    submitTranslation();
  });
  
  $(document).delegate('.MSTCSwitchButton', 'click', function() {
    MSTCSwitchButton();
  });
  
  $('#MSTCNextLink').click(function() {
    var l = window.translation.length;
    if((l - window.page * 3) > 0 ) {
      tp = $("#MSTCTransPanel").find(".MSTCTransPanel");
      tp.hide();
      e = tp[window.page * 3];
      for(var i = 0; i < 3 && i < l - window.page * 3; i ++) {
        e.setAttribute('style', 'display: block');
        e = e.nextSibling;
      }
      window.page = window.page + 1;
      $('#MSTCPage').text(window.page + ' / ' + window.total_page);
      $("#MSTCPrevLink").css( 'color', 'rgb(85, 153, 255)');
      if((l - window.page * 3) <= 0 ) {
        $("#MSTCNextLink").css( 'color', 'rgb(153, 153, 153)');
      }
      window.clickPage = true;
    }
  });
  
  $('#MSTCPrevLink').click(function() {
    if(window.page > 1 ) {
      tp = $("#MSTCTransPanel").find(".MSTCTransPanel");
      tp.hide();
      e = tp[(window.page - 2) * 3];
      
      for(var i = 0; i < 3; i ++) {
        e.setAttribute('style', 'display: block');
        e = e.nextSibling;
      }
      window.page = window.page - 1;
      $('#MSTCPage').text(window.page + ' / ' + window.total_page);
      if(window.page <= 1 ) {
        $("#MSTCPrevLink").css( 'color', 'rgb(153, 153, 153)');
      }
      $("#MSTCNextLink").css( 'color', 'rgb(85, 153, 255)');
    }
  });
  
  $('#MSTCOKImgBtn').click(function() {
    $("#MSTCTransPanelError").hide();
  });
});
