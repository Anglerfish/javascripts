function PackSARSchedule(){
$(document).ready(function() {
$("head").append('<link href="http://server1:8086/javascripts/Webpart-Pack SAR schedule.css" rel="stylesheet" type="text/css" />');

set_scroll();

//Sets DispForm to EditForm2
  $("a[href*='DispForm']").attr('href',function(){
    return this.href.replace('DispForm','EditForm2');
    });

//Keeping a column width at a certain size
$("TABLE[SUMMARY^='Pack Schedule']").find("TABLE[DisplayName^='Job No.']").parents("TH").width(75);

//Keeping a column width at a certain size
$("TABLE[SUMMARY^='Shipment Authorization']").find("TABLE[DisplayName^='Job No.']").parents("TH").width(75);

//Setup production window for Final Inspection
var processHeader;
var itemID;

setupProductionWindow();

$("table.ms-listviewtable").each(function(){
  processHeader = $(this).attr("summary");
  if (processHeader == "Final Inspection Schedule"){
    $(this).find("table[ctype='Item']").each(function(){
      itemID = $(this).attr("id");
      $(this).find("a").removeAttr("onclick href").attr("ph",processHeader).attr("itemID",itemID).click(function(){ProcessorWindow($(this).attr("ph"),$(this).attr("itemID"))});
    });
  }
});

//Priority Changer Dropbox
var idvalue = 0;
var pvalue = 0;
var tempA = "";

$("TABLE[SUMMARY^='Pack Schedule'] TR").each(function(i){
  idvalue = $(this).find("TD.ms-vb2:eq(0)").hide().text();
  pvalue = $(this).find("TD.ms-vb2:eq(1)").text();
  $(this).find("TD.ms-vb2:eq(1)").text("").addClass("Priority").append('<dl class="dropdown" id="dd"><dt><div style="display:none">'+idvalue+'</div><a><center><span>'+pvalue+'</span></center></a></dt><dd><ul></ul></dd></dl>');

});

$(".dropdown dt a").click(function() {
    idvalue = $(this).parents("dt").find("div").text();
    if($(this).parents(".dropdown").find("dd ul").is(":hidden")) {
        $(".dropdown dd ul").hide();
        $(".dropdown dt a").removeClass("phighlight");
        if($(this).parents(".dropdown").find("dd ul li").text() == "") {
            tempA = "";
            for(j=1;j<51;j++){
            tempA = tempA + '<li><a href="javascript:prioritychanger('+idvalue+','+j+');">'+j+'</a></li>';
            }
            tempA = tempA + '<li><a href="javascript:prioritychanger('+idvalue+',95);">95</a></li>';
            tempA = tempA + '<li><a href="javascript:prioritychanger('+idvalue+',99);">99</a></li>';
            $(this).parents(".dropdown").find("dd ul").append(tempA);
            }
        $(this).addClass("phighlight"); 
        $(this).parents(".dropdown").find("dd ul").show();
    }
    else {
        $(".dropdown dd ul").hide();
        $(this).removeClass("phighlight"); 
    }
});

$(document).bind('click', function(e) {
    var $clicked = $(e.target);
    if (! $clicked.parents().hasClass("dropdown")) {
        $(".dropdown dt a").removeClass("phighlight");
        $(".dropdown dd ul").hide();
    }
});

$("TD.ms-vb").each(function(){
    if($(this).text()=="ID"){
       $(this).parents("TH").hide();
    }
});

});
}

// if query string in URL contains scroll=nnn, then scroll position will be restored
function set_scroll(){
    // get query string parameter with "?"
    var search = window.location.search;
    // if query string exists
    if (search){
        // find scroll parameter in query string
        var matches = /scroll=(\d+)/.exec(search);
        // jump to the scroll position if scroll parameter exists
        if (matches) window.scrollTo(0, matches[1]);
    }
}

function prioritychanger(pcid,pcca) {
$("body").append("<div class=jstatus2>Updating</div>");
if(pcca < 10) pcca = "0" + pcca;

$().SPServices({
  operation: "UpdateListItems",
  async: true,
  batchCmd: "Update",
  ID:pcid,
  listName: "Pack Schedule",
  valuepairs: [["Priority",pcca]],
    completefunc: function(xData, Status) {
      $(".dropdown dd ul").hide();
      /*Priority sorting
      tempA = $(".phighlight").closest("tbody");
      $(".phighlight").closest("tr").appendTo(tempA);
      
      tempA = parseInt(pcca,10);
      tempB = false;

      $(".phighlight").closest("tbody").find(".Priority").each(function(){
        if(tempB ==false && $(this).find(".id") != pcid){
          if( tempA < parseInt($(this).find("span").text(),10) || (tempA == parseInt($(this).find("span").text(),10) && parseInt(pcid,10) < parseInt($(this).closest("tr").find(".id").text(),10) ) ){
            tempA = $(this).closest("tr");
            $(".phighlight").closest("tr").insertBefore(tempA);
            tempA = pcca;
            tempB = true;
          } 
        }
      });
      */
      $(".phighlight").removeClass("phighlight").find("span").text(pcca);
      $(".jstatus2").text("Complete!");
      window.setTimeout(function(){window.location.href = '/Webparts/Pack-Ship%20Schedule.aspx'},1000);
    }  
})
}


function NOTUSE() {
$(document).ready(function() {

//Priority Changer
var idvalue = 0;
var pvalue = 0;
var tempA = "";

set_scroll();


//Priority Changer Dropbox
$("TABLE[SUMMARY^='Pack Schedule'] TR").each(function(i){
        idvalue = $(this).find("TD.ms-vb2:eq(0)").toggle().text();
        pvalue = $(this).find("TD.ms-vb2:eq(1)").text();
          $(this).find("TD.ms-vb2:eq(1)").text("").each(function() {
        $(this).append('<dl class="dropdown" id="dd"><dt><div style="display:none">'+idvalue+'</div><a><center><span>'+pvalue+'</span></center></a></dt><dd><ul></ul></dd></dl>');
        });

});

$(".dropdown dt a").click(function() {
    idvalue = $(this).parents("dt").find("div").text();
    if($(this).parents(".dropdown").find("dd ul").is(":hidden")) {
        $(".dropdown dd ul").hide();
        $(".dropdown dt a").removeClass("phighlight");
        if($(this).parents(".dropdown").find("dd ul li").text() == "") {
            tempA = "";
            for(j=1;j<51;j++){
            tempA = tempA + '<li><a href="javascript:prioritychanger('+idvalue+','+j+');">'+j+'</a></li>';
            }
            tempA = tempA + '<li><a href="javascript:prioritychanger('+idvalue+',95);">95</a></li>';
            tempA = tempA + '<li><a href="javascript:prioritychanger('+idvalue+',99);">99</a></li>';
            $(this).parents(".dropdown").find("dd ul").append(tempA);
            }
        $(this).addClass("phighlight"); 
        $(this).parents(".dropdown").find("dd ul").show();
    }
    else {
        $(".dropdown dd ul").hide();
        $(this).removeClass("phighlight"); 
    }
});

$(document).bind('click', function(e) {
    var $clicked = $(e.target);
    if (! $clicked.parents().hasClass("dropdown")) {
        $(".dropdown dt a").removeClass("phighlight");
        $(".dropdown dd ul").hide();
    }
});

$("TD.ms-vb").each(function(){
    if($(this).text()=="ID"){
       $(this).parents("TH").toggle();
    }
});

});

// if query string in URL contains scroll=nnn, then scroll position will be restored
function set_scroll(){
    // get query string parameter with "?"
    var search = window.location.search;
    // if query string exists
    if (search){
        // find scroll parameter in query string
        var matches = /scroll=(\d+)/.exec(search);
        // jump to the scroll position if scroll parameter exists
        if (matches) window.scrollTo(0, matches[1]);
    }
}

function prioritychanger(pcid,pcca) {
    tempA = "http://server1:8086/_layouts/KWizCom_LFEA/SLFECustomActionHandler.aspx?List=%7Bd689573b%2Dadad%2D4f1a%2Da10b%2D694cbdaf25a1%7D&Action=";
    switch(pcca)
    {
        case 1:
            tempA = tempA + "%7B6b4c2048%2D0100%2D40a9%2Db6b4%2D5878f05c894e%7D";
        break;
        case 2:
            tempA = tempA + "%7B4157ce4b%2D8c59%2D45d3%2Daef0%2D6b4ee4aea1db%7D";
        break;
        case 3:
          tempA = tempA + "%7B7e186daa%2De404%2D4f80%2Db9b1%2D0c18ad5d82e1%7D";
        break;
        case 4:
          tempA = tempA + "%7Bb952095e%2D76cf%2D4c90%2D9619%2Df3293589badf%7D";
        break;
        case 5:
          tempA = tempA + "%7B40d5718a%2Dd8ff%2D4a68%2D9e12%2D74d02a68e0a1%7D";
        break;
        case 6:
          tempA = tempA + "%7B315f9a42%2D4c24%2D44a4%2Db07d%2D6db63629d084%7D";
        break;
        case 7:
          tempA = tempA + "%7Baa48ec7e%2D409a%2D4bed%2D88c6%2D29ba0baf2a9a%7D";
        break;
        case 8:
          tempA = tempA + "%7B6b3912bd%2Dfe19%2D4e02%2D9bb2%2D69c12f0da639%7D";
        break;
        case 9:
          tempA = tempA + "%7B980eed87%2D9610%2D4245%2Db8d3%2D290736830cf3%7D";
        break;
        case 10:
          tempA = tempA + "%7B70e2e7ac%2D23a3%2D4198%2Da819%2D0438c5ba2a88%7D";
        break;
        case 11:
          tempA = tempA + "%7Bbb285000%2Df713%2D4b5a%2D8b52%2Ddd63818b1948%7D";
        break;
        case 12:
          tempA = tempA + "%7B388d5213%2Df6fb%2D4514%2Db01c%2D216591e391ac%7D";
        break;
        case 13:
          tempA = tempA + "%7B0bb030f7%2Dba8a%2D4ad4%2D8f32%2D0f8e292d071c%7D";
        break;
        case 14:
          tempA = tempA + "%7Ba55f1973%2D8a7a%2D4494%2D8da1%2D0d0df06a13fb%7D";
        break;
        case 15:
          tempA = tempA + "%7B575b8d23%2D69f1%2D4956%2Da107%2D7fb33ccf0df5%7D";
        break;
        case 16:
          tempA = tempA + "%7Bcd08712a%2D7722%2D4d06%2Da128%2De49bfa00a94c%7D";
        break;
        case 17:
          tempA = tempA + "%7B63a557e2%2Daac1%2D4bff%2D8a67%2Daa18b4521aa5%7D";
        break;
        case 18:
          tempA = tempA + "%7B7d8f5930%2D6032%2D4a82%2Dab67%2D8b39acbe6d99%7D";
        break;
        case 19:
          tempA = tempA + "%7Ba412e919%2De7c6%2D4c5d%2D9788%2D1f8d5b5a301b%7D";
        break;
        case 20:
          tempA = tempA + "%7B343d1ba7%2Dbb00%2D4abe%2D8f72%2D4ab49b4e803f%7D";
        break;
        case 21:
          tempA = tempA + "%7Bfdc6a24c%2Da97c%2D4cbf%2Da8be%2D274bc1ca374b%7D";
        break;
        case 22:
          tempA = tempA + "%7B738ac815%2Dd592%2D4f6c%2D94b5%2Df37435e27736%7D";
        break;
        case 23:
          tempA = tempA + "%7B654d86e9%2D6f83%2D4e09%2D846b%2D6260b12fefea%7D";
        break;
        case 24:
          tempA = tempA + "%7Bfb9b50ac%2Dc474%2D412a%2Db218%2D8979dd279669%7D";
        break;
        case 25:
          tempA = tempA + "%7B92caceaa%2Dc9fc%2D499c%2Dba67%2D69158c5b4ecb%7D";
        break;
        case 26:
          tempA = tempA + "%7B802a3a7f%2D578a%2D430d%2Dabe4%2D421ed4904ae9%7D";
        break;
        case 27:
          tempA = tempA + "%7B1cff7c20%2D2581%2D4e0b%2Dab1f%2D4a903de334bf%7D";
        break;
        case 28:
          tempA = tempA + "%7B414db77a%2D1244%2D4a6e%2D93cc%2Dc3b401e204c4%7D";
        break;
        case 29:
          tempA = tempA + "%7Bccf7cdec%2D9f0d%2D47c3%2D8af8%2D38d32acc7029%7D";
        break;
        case 30:
          tempA = tempA + "%7B5a875e34%2D6352%2D4962%2Dacdd%2D4d5c504b7fb2%7D";
        break;
        case 31:
          tempA = tempA + "%7B1d22725d%2D9dd7%2D4a07%2D924e%2D9f371315334d%7D";
        break;
        case 32:
          tempA = tempA + "%7B0cd60238%2Dcbf5%2D4f5b%2D8306%2D1667fa1aae6f%7D";
        break;
        case 33:
          tempA = tempA + "%7Bd059bdc0%2Da0f4%2D4b8f%2Da4dd%2D8b0080df696a%7D";
        break;
        case 34:
          tempA = tempA + "%7B54f41059%2D52e5%2D4a0f%2D8552%2Da578ba3442ff%7D";
        break;
        case 35:
          tempA = tempA + "%7Ba444c564%2D5f11%2D4536%2D8c0c%2D3095f403c02a%7D";
        break;
        case 36:
          tempA = tempA + "%7Ba5f4a9ac%2Dada6%2D47b4%2Dbe08%2D5644a51e6eae%7D";
        break;
        case 37:
          tempA = tempA + "%7B51514c5f%2Df13a%2D42f1%2Da8ef%2D14966039fdee%7D";
        break;
        case 38:
          tempA = tempA + "%7B0f6bc213%2Da07d%2D4375%2D8fdd%2Db863cb673863%7D";
        break;
        case 39:
          tempA = tempA + "%7B2fd63bda%2Db89a%2D4ce1%2Da4ef%2Dacbe2b006671%7D";
        break;
        case 40:
          tempA = tempA + "%7B8a269c20%2D7b6f%2D45df%2Db5b7%2Dc6fbb08cd2a9%7D";
        break;
        case 41:
          tempA = tempA + "%7B169f9c09%2D079f%2D4665%2Dac7f%2D2ab461e1c4b9%7D";
        break;
        case 42:
          tempA = tempA + "%7B379c7dbe%2Dd7f3%2D4bce%2D9517%2D27e1781962d5%7D";
        break;
        case 43:
          tempA = tempA + "%7Bbb996b4e%2D7284%2D4d17%2Db3d5%2D6b79c335513b%7D";
        break;
        case 44:
          tempA = tempA + "%7Bdea8264f%2D01ee%2D4c94%2D9cd4%2Dc66b5800473b%7D";
        break;
        case 45:
          tempA = tempA + "%7B9b5c6ffd%2D7fa0%2D4924%2D8f96%2D0c462a267eb0%7D";
        break;
        case 46:
          tempA = tempA + "%7Bb43a1841%2Da995%2D4922%2D9946%2D490a95ce73f7%7D";
        break;
        case 47:
          tempA = tempA + "%7B4e181d85%2D0680%2D4690%2Da14d%2D2bbc3c9e1fc3%7D";
        break;
        case 48:
          tempA = tempA + "%7Bdee0b228%2D6c88%2D443a%2Db665%2D50e4ebb5087e%7D";
        break;
        case 49:
          tempA = tempA + "%7Bfc7d14fe%2Ddb5d%2D4647%2D9d0c%2D385bfa7617e6%7D";
        break;
        case 50:
          tempA = tempA + "%7B9fae28ac%2Df163%2D42bf%2Daf7a%2Daa34ca59b862%7D";
        break;
        case 95:
          tempA = tempA + "%7B0673066c%2D3395%2D4c01%2Db809%2D8a6799ebc187%7D";
        break;
        case 99:
          tempA = tempA + "%7B901ebff3%2D0afc%2D402e%2Daa25%2D499cbac5d724%7D";
        break;
        default:
            tempA = "";
    }
        if (tempA == "") {
            alert("Error. Please contact SharePoint Administrator.");
        }
        else
        {
           tempA = tempA + '&Item=' + pcid + '&Source=http://server1:8086/Webparts/Pack-Ship%20Schedule.aspx%3F%26scroll='+$(window).scrollTop();
        }
        window.location.href =tempA;
}

}