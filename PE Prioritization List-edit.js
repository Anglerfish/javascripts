var AegisProcess = new Array();
var myQueryOptions = "<QueryOptions><ViewAttributes Scope='RecursiveAll' IncludeRootFolder='True' /></QueryOptions>";
var originVals;

function PEPriorizationList(){

//Dynamic load Javascript Library function
(function(){
function loadScript(url, callback) {
  var script = document.createElement("script");
  script.type = "text/javascript";
  if (script.readyState) { //IE
    script.onreadystatechange = function () {
      if (script.readyState == "loaded" || script.readyState == "complete") {
        script.onreadystatechange = null;
        callback();
      }
    };
  } else { //Others
    script.onload = function () { callback(); };
  }
  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
}
if(!window.jQuery){
  loadScript("/jquery.min.js", function () {
//    console.log('dynamic script jquery loaded'); 
  });
}
loadScript("/jquery.SPServices-0.7.1a.min.js",function() {
//  console.log('dynamic script SPServices loaded'); 
});

loadScript("/javascripts/editFormFields.js",function() {
//  console.log('dynamic script SPServices loaded'); 
});

})();
//End Dynamic load Javascript Library Ends


var temp1;
var temp2;
var selectVal = new Array();

$(document).ready(function() {

if(browseris.ie5up) $("head").append('<link href="http://server1:8086/javascripts/PE Prioritization List-edit.css" rel="stylesheet" type="text/css" />');
else $("head").append('<link href="/javascripts/PE Prioritization List-edit.css" rel="stylesheet" type="text/css" />');

$("body").append("<span id=saveStatus><table><tbody><tr><td id=loadStatus>Loading</td></tr><tr><td id=loadError></td></tr></tbody></table></span><div id=AegisOpps></div>" +
                 "<span id=releaseAfterClean style='display:none;'><table><tbody><tr><td id=rACTitle></td></tr><tr><td><textarea id=rACReason rows ='2'></textarea></td></tr>" +
                 "<tr><td id=rACButtons></td></tr></tbody></table></span><div id=greyOverlay style='display:none;'></div>");
$("span#saveStatus").hide();

$("INPUT[ID$='diidIOSaveItem']").hide().parent().prepend("<input type='button' class='ms-ButtonHeightWidth saveSubmit' value='Submit'>");
        
$("div.routingTitle").before("<div class=loading style='position: absolute; left: 50px; color:white; font: bold 16px arial; background-color: green;'>Loading...</div>");
$("div.routingTitle").before("<button type='button' id=folderLabel>Label</button>");
$("tr[id^='Routing_x0020_7'] td.ms-formbody").append("<button type='button' id=forceRouter>Force Update<br/>Router to<br/>Job Progression</button>");

//ckeditor for chrome/Firefox users
if(!browseris.ie5up) $("textarea[id$='TextField']").attr("class","ckeditor");

originVals = readFields();

//get information from Aegis
var jobNo = $("TR[ID^='Title'] TD:nth-child(2)").text();
jobNo = jobNo.replace(/\s+/g,'');
$.when(getAegisJob(jobNo)).done(function(jobRef) {
  if(jobRef.jobid != "") {
    getAegisRouter(jobRef);
    getAegisOpps(jobRef);
  } else {
   $(".routingAnchor").append("Cannot find job in Aegis Fusion");
   $(".loading").hide();
  }
});

$("select[title^=Route]").change(function(){
  if($(this).val() == "CC Oper 1") {
    $("select[title='Conformal Coat']").css("background-color","red").css("color","white").val("YES");
  } else if($(this).val() == "END") folderReleasedDate();
}).each(function(){
  temp1 = $(this).attr("title").replace(/(Route )/ig,"");
  $(this).after("&nbsp;&nbsp;<button type='button' class='processDown' title='move process down' onclick='routedown(" + temp1 + ",0);'><img src='/javascripts/pictures/Down.gif' width=16px /></button><button class='processRemove' title='remove process' type='button' onclick='routeDelete(" + temp1 + ",0);'><img src='/javascripts/pictures/Delete.gif' width=16px /></button>");
});

$("button#folderLabel").click(function(){folderLabel(jobNo)});

$("select[title^=Route]").each(function(){ selectVal.push($(this).val()); });

$("button#forceRouter").click(function(){
  var forceOK = confirm("ALERT!\nThis button should only be used to fix/update job progression WHEN SHAREPOINT DID NOT UPDATE JOB PROGRESSION PROPERLY. Press 'OK' to continue and 'Submit' entry after.");
  if (forceOK == true) {
    for(var i = 0, l = selectVal.length; i < l; i++ ){
      selectVal[i] = "TBD";
    }
    $("input.saveSubmit:first").click();
  }
}) //End forceRouter

//provides information on the process locations that needs modifications.
$("input.saveSubmit").click(function(){
$("div.routeErr").remove();
$("select[title^='Route']").each(function(){
  if($(this).val() != "TBD") {
    temp1 = $(this).val();
    temp2 = 0;
    $("select[title^='Route']").each(function(){ if($(this).val() == temp1) temp2++; });
    if(temp2 > 1) $(this).parent("span").append("<div class=routeErr>DUPLICATE</div>"); 
  }
});

var smtCheck = [false,false];
//variable contains smtCheck Primary, smtCheck Secondary

if($("div").hasClass("routeErr")) alert("Error. Duplicate entry in Router.");
else {
  $("span#saveStatus").show().find("td#loadStatus").text("Updating");
  $("div#greyOverlay").show();
  if($("Input[title='Folder Released']").val() != "") {
    var routerChange = new Array;
    var smtPlacement = [false,false];
    var smtNumber = new Array;
  
    $("select[title^=Route]").each(function(){
      temp1 = parseInt($(this).attr("title").slice(5),10);
      if(selectVal[temp1 - 1] !=  $(this).val()) routerChange.push({routeNum:temp1,route:$(this).val()});
      if($(this).val() == "SMT Oper PS") smtPlacement[0] = true;
      if($(this).val() == "SMT Oper SS") smtPlacement[1] = true;
    });
    
    smtNumber[0] = parseInt($("input[title='SMT-PS Parts']").val().replace(/,+/g,''),10);
    smtNumber[1] = parseInt($("input[title='SMT-SS Parts']").val().replace(/,+/g,''),10);
    
    if(smtPlacement[0] == true && smtNumber[0] > 0) smtCheck[0] = true;
    else if(smtPlacement[0] == false) { 
      if(smtNumber[0] != 0) smtNumber[0] = 0;
      smtCheck[0] = true;
    }
    if(smtPlacement[1] == true && smtNumber[1] > 0) smtCheck[1] = true;
    else if(smtPlacement[1] == false) { 
      if(smtNumber[1] != 0) smtNumber[1] = 0;
      smtCheck[1] = true;
    }
    if(smtCheck[0] == false || smtCheck[1] == false) {
      if($("td#aegisSMTpart").length) {
        temp1 = parseInt($("td#aegisSMTpart").text(),10);
        if(smtCheck[0] == false && smtCheck[1] == false) smtNumber = [Math.floor(temp1/2),Math.ceil(temp1/2)];
        else if(smtCheck[0] == false) smtNumber[0] = temp1 - smtNumber[1];
        else if(smtCheck[1] == false) smtNumber[1] = temp1 - smtNumber[0];
        if(smtNumber[0] < 0 || smtNumber[1] < 0) smtNumber = [Math.floor(temp1/2),Math.ceil(temp1/2)];
        if(confirm("'SMT-SS Parts' and/or 'SMT-PS Parts' cannot be less than or equal to 0. \nUpdate to the following estimates, as per Aegis BOM? \nSMT-SS Parts: " + smtNumber[1] + "\nSMT-PS Parts: " + smtNumber[0])) {
          $("input[title='SMT-PS Parts']").val(smtNumber[0]);
          $("input[title='SMT-SS Parts']").val(smtNumber[1]);
          smtCheck = [true, true];
        }
      } else {
        if(smtCheck[0] == false && smtCheck[1] == false) alert("Cannot have 0 or less for both 'SMT-SS Parts' and 'SMT-PS Parts' when SMT-SS and SMT-PS are both on the router.\nPlease update 'SMT-SS Parts' and 'SMT-PS Parts' to proceed.");
        else if(smtCheck[0] == false) alert("Cannot have 0 or less for 'SMT-PS Parts' when SMT-PS is on the router.\nPlease update 'SMT-PS Parts' to proceed.");
        else if(smtCheck[1] == false) alert("Cannot have 0 or less for 'SMT-SS Parts' when SMT-SS is on the router.\nPlease update 'SMT-SS Parts' to proceed.");
        $("span#saveStatus").hide();
        $("div#greyOverlay").hide();
      }
    } else {
      $("input[title='SMT-PS Parts']").val(smtNumber[0]);
      $("input[title='SMT-SS Parts']").val(smtNumber[1]);
    }
    
    rACCheckb4Submit(routerChange, smtCheck);  
  } else{  //folder not released
    $("span#saveStatus td#loadStatus").text("Saving...");
    $("INPUT[ID$='diidIOSaveItem']:first").click();
  }
  
}  
}); //End click saveSubmit


});
};//End Function PE Prioritization List

function transferSaveData(routerChange, smtCheck){
  var temp1;
  if(smtCheck[0] == true && smtCheck[1]== true) {
    if(routerChange.length > 0) {
      for( var i = 0, l = routerChange.length; i < l; i++ ) {
        if (routerChange[i].routeNum != 1) {
          temp1 = routerChange[i].routeNum - 1;
          if(temp1 < 10) routerChange.push({routeNum:temp1 ,route:$("select[title='Route 0" + temp1 + "']").val()});
          else routerChange.push({routeNum:temp1 ,route:$("select[title='Route " + temp1 + "']").val()});
        }
        if (routerChange[i].route != "END") {
          temp1 = routerChange[i].routeNum + 1;
          if(temp1 < 10) routerChange.push({routeNum:temp1 ,route:$("select[title='Route 0" + temp1 + "']").val()});
          else routerChange.push({routeNum:temp1 ,route:$("select[title='Route " + temp1 + "']").val()});
        }
      }
  
      $.when(routerSetup(jobNo, routerChange)).done(function(){
        $("span#saveStatus td#loadStatus").text("Saving...");
        setTimeout(function(){
          $("INPUT[ID$='diidIOSaveItem']:first").click();
        },2000);
      });
    } else { //No router change. Saving.
      $.when(getSPList("Master Job List",jobNo)).done(function(masterData) {
        var deferreds = [];
        var changesSMT = new Array();
        var jobVals = readFields();
  
        if(typeof $(masterData.responseXML).SPFilterNode("z:row").attr("ows_SMT_x002d_T") != "undefined") {
          if(parseInt($(masterData.responseXML).SPFilterNode("z:row").attr("ows_SMT_x002d_T"),10) != jobVals.SMT_x002d_PS) changesSMT.push(["SMT_x002d_T",jobVals.SMT_x002d_PS]);
        }
        if(typeof $(masterData.responseXML).SPFilterNode("z:row").attr("ows_SMT_x002d_B") != "undefined") {
          if(parseInt($(masterData.responseXML).SPFilterNode("z:row").attr("ows_SMT_x002d_B"),10) != jobVals.SMT_x002d_SS) changesSMT.push(["SMT_x002d_B",jobVals.SMT_x002d_SS]);
        }
  
        if (changesSMT.length > 0) deferreds.push(updateSPList("Master Job List",$(masterData.responseXML).SPFilterNode("z:row").attr("ows_ID"),changesSMT));
        $.when.apply($,deferreds).done(function(){
          $("span#saveStatus td#loadStatus").text("Saving...");
          $("INPUT[ID$='diidIOSaveItem']:first").click();
        });
      });        
    }
  } else {
    $("span#saveStatus").hide(); //SMT incorrect. Stops user from saving.
    $("div#greyOverlay").hide();
  }
} //End transferSaveData

function folderLabel(jobNo) {

var jobURL = "http://server1:8086/ajax/jcfjm.aspx?job=" + jobNo;

jQuery.ajax({
  url: jobURL,
  async: true,
  success:function(data){
    labelstring = "<table class=labelTable><tr><td id=labelJobNo>&nbsp;JOB#: " + jobNo + "</td></tr></table>"
                + "<table class=labelTable><tr><td id=labelCustName>&nbsp;&nbsp;&nbsp;" + $(data).find(".E2customer").text() + "</td><td id=labelOrderType>" + $(data).find(".E2order_type").text() + "</td></tr></table>"
                + "<table class=labelTable><tr><td id=labelAssy>&nbsp;&nbsp;&nbsp;&nbsp;" + $(data).find(".E2dorigo_assy_id").text().trim() + "</td><td id=labelDescrip> " + $(data).find(".E2description").text() + "</td></tr></table>";

      labelstring = "<head><link rel='stylesheet' type='text/css' href='/javascripts/PE Prioritization List-edit.css'></head><body>"
                        + labelstring + "</body>";
    myWindow=window.open('','','location=no,toolbar=yes,width=500,height=300,scrollbars=yes,top=20');
    myWindow.document.write(labelstring);
    myWindow.focus();
  }
});

}; //End function folderLabel

function getAegisJob(jobNo) {
var dfd = $.Deferred();

jQuery.ajax({
  url: "/AJAX/AegisJobs.aspx?job=" + jobNo,
  async: true,
  success:function(data){
    if($(data).find("td.name").text() == jobNo) dfd.resolve({jobid:$(data).find("td.jobid").text(),processrevisionid:$(data).find("td.processrevisionid").text()});
    else dfd.resolve({jobid:"",processrevisionid:""});
  }
});

return dfd.promise();
}//End function getAegisJobID

function getAegisOpps(jobRef) {
var SMTpart = 0;
var THpart = 0;
var MECHpart = 0;
var temp1;

jQuery.ajax({
  url: "/AJAX/AegisProcessRevision.aspx?processrevisionid=" + jobRef.processrevisionid,
  async: true,
  success:function(data2){
    jQuery.ajax({
      url: "/AJAX/AegisBOMpartlist.aspx?bomid=" + $(data2).find("td.assemblyrevid").text(),
      async: true,
      success:function(data3){
        $(data3).find("tr.BOMlist").each(function(e){
          temp1 = $(this).find("td.populationtype").text();
          if(temp1.substring(0,3) == "SMT") SMTpart += parseInt($(this).find("td.quantity").text(),10);
          else if(temp1.substring(0,2) == "TH") THpart += parseInt($(this).find("td.quantity").text(),10);
          else if(temp1.substring(0,4) == "MECH") MECHpart += parseInt($(this).find("td.quantity").text(),10);
        });
        temp1 = "<table id=aegisInfoTable><tbody><tr><th colspan='2'>Aegis BOM Info</th></tr><tr><td>SMT:</td><td id=aegisSMTpart>"+SMTpart+"</td></tr>"+
        "<tr><td>TH:</td><td id=aegisTHpart>"+THpart+"</td></tr>" +
        "<tr><td>MECH:</td><td id=aegisMECHpart>"+MECHpart+ "</td></tr>";
        if( (SMTpart + THpart + MECHpart) == 0) temp1 += "<tr><td colspan=2 style='font: bold 24px arial; color: red;'>CALL KAI ABOUT THIS JOB</td></tr>";
        temp1 += "</tbody></table>";
        
        $("div#AegisOpps").append(temp1);
      }
    });//end ajax AegisBOMpartlist
  }
});//end ajax AegisProcessRevision

}


function getAegisRouter(jobRef){
var errorFlag = 0;
var AegisProcessID = new Array();

var temp;
var temp2 = "";
var temp3;
var output;

jQuery.ajax({
  url: "/AJAX/AegisProcess2.aspx?jobid=" + jobRef.jobid,
  async: true,
  success:function(data){
    if($(data).find("td.jobid:first").text() == jobRef.jobid){
      $(data).find("td.AegisProcessID").each(function(i){
        AegisProcessID[i] = parseInt($(this).text(),10);
      });
      output = "<table class=outputTable>";
      AegisModelPoints();
    } 
  },
  fail:function(){
    errorFlag = 1;
    $(".loading").hide();
  }
});
return false;

function AegisModelPoints(){
  jQuery.ajax({
    url: "/AJAX/AegisModelPoints.aspx",
    async: true,
    success:function(data2){
      temp = 0;
      temp2 = AegisProcessID.length;
      temp3 = 1;
      while(temp < temp2){
        //AegisProcessID[temp] -= 1;
        AegisProcess[temp] = $(data2).find("#processName").eq(AegisProcessID[temp]-1).text();
        if(AegisProcess[temp] == "Panasonic PanaPro Top" || AegisProcess[temp] == "Panasonic PanaPro Bottom" || AegisProcess[temp] == "Addendum" || AegisProcess[temp] == "MYDATA Basic" || AegisProcess[temp] == "AOI/Visual Inspection Color Code Drawing" || AegisProcess[temp] == ""){}
        else {output = output + "<tr><td>" + temp3 + "</td><td class=aroute"+ temp3 + ">" + AegisProcess[temp] + "</td></tr>"; temp3++;}
        temp +=1;
      }
      output += "</table>";
      $(".routingAnchor").append(output);
      $(".routingAnchor").after("<button type='button' onclick='PopulateSteps()'>Transfer Router</button><button type='button' onclick='clearcolor()'>Clear Color</button><button type='button' onclick='clearrouter()'>Clear Router</button>");
      $(".loading").hide();
    },
    fail:function(){
      errorFlag = 1;
      $(".loading").hide();
    }
  });
} //Ends AegisModelPoints, internal function
}; //Ends getAegisRouter

function PopulateSteps(){
  var temp1 = 0;
  var temp2 = 1;
  var temp3;
  
  clearrouter();
  
  while ( temp1 < AegisProcess.length) {
    if(temp2 < 10) temp3 = "0" + temp2;
    else temp3 = temp2;
    
    switch (AegisProcess[temp1]) {
      case "SMT Operation Secondary Side":
        $("select[title='Route " + temp3 + "']").css("background-color","yellow").val("SMT Oper SS");
        temp2++;
        break;
      case "SMT Inspection Secondary Side - First Article / Post-SMT":
        if(AegisProcess[temp1 + 1] != "SMT Operation Primary Side") {
          $("select[title='Route " + temp3 + "']").css("background-color","yellow").val("SMT Insp");
          temp2++;
        }
        break;
      case "SMT Operation Primary Side":
        $("select[title='Route " + temp3 + "']").css("background-color","yellow").val("SMT Oper PS");
        temp2++;
        break;
      case "SMT Inspection Primary Side - First Article / Post-SMT":
        if(AegisProcess[temp1 + 1] != "SMT Operation Secondary Side") {
          $("select[title='Route " + temp3 + "']").css("background-color","yellow").val("SMT Insp");
          temp2++;
        }
        break;
      case "PTH Soldering Wavesolder / Selective":
        $("select[title='Route " + temp3 + "']").css("background-color","red").val("PTH Wave");
        temp2++;
        break;
      case "PTH Inspection Post Wavesolder / Selective Solder":
        $("select[title='Route " + temp3 + "']").css("background-color","red").val("PTH Insp Wave");
        temp2++;
        break;
      case "Handsolder Insertion / Solder 1":
        $("select[title='Route " + temp3 + "']").css("background-color","orange").val("HS Oper 1");
        temp2++;
        if(AegisProcess[temp1 + 1] != "Final Inspection" && AegisProcess[temp1 + 1] != "Handsolder Insertion / Solder 2" && AegisProcess[temp1 + 1] != "Handsolder Insertion / Solder 3") {
          if(temp2 < 10) temp3 = "0" + temp2;
          else temp3 = temp2;
          $("select[title='Route " + temp3 + "']").css("background-color","orange").val("HS Insp 1");
          temp2++;        
        }  
        break;
      case "Handsolder Insertion / Solder 2":
         $("select[title='Route " + temp3 + "']").css("background-color","orange").val("HS Oper 2");
        temp2++;
        if(AegisProcess[temp1 + 1] != "Final Inspection" && AegisProcess[temp1 + 1] != "Handsolder Insertion / Solder 1" && AegisProcess[temp1 + 1] != "Handsolder Insertion / Solder 3") {
          if(temp2 < 10) temp3 = "0" + temp2;
          else temp3 = temp2;
          $("select[title='Route " + temp3 + "']").css("background-color","orange").val("HS Insp 2");
          temp2++;        
        }  
        break;
      case "Handsolder Insertion / Solder 3":
        $("select[title='Route " + temp3 + "']").css("background-color","orange").val("HS Oper 3");
        temp2++;
        if(AegisProcess[temp1 + 1] != "Final Inspection" && AegisProcess[temp1 + 1] != "Handsolder Insertion / Solder 1" && AegisProcess[temp1 + 1] != "Handsolder Insertion / Solder 2") {
          if(temp2 < 10) temp3 = "0" + temp2;
          else temp3 = temp2;
          $("select[title='Route " + temp3 + "']").css("background-color","orange").val("HS Insp 3");
          temp2++;        
        }  
        break;
      case "Conformal Coating":
        $("select[title='Route " + temp3 + "']").css("background-color","C570DC").val("CC Oper 1");
        $("select[title='Conformal Coat']").css("background-color","red").css("color","white").val("YES");
        temp2++;
        if(temp2 < 10) temp3 = "0" + temp2;
        else temp3 = temp2;
        $("select[title='Route " + temp3 + "']").css("background-color","C570DC").val("CC Insp 1");
        temp2++;
        break;
      case "Mechanical Assembly 1":
        $("select[title='Route " + temp3 + "']").css("background-color","pink").val("MECH Oper 1");
        temp2++;
        if( AegisProcess[temp1 + 1] != "Final Inspection" ){
          if(temp2 < 10) temp3 = "0" + temp2;
          else temp3 = temp2;
          $("select[title='Route " + temp3 + "']").css("background-color","pink").val("MECH Insp 1");
          temp2++;
        }
        break;
      case "Mechanical Assembly 2":
        $("select[title='Route " + temp3 + "']").css("background-color","pink").val("MECH Oper 2");
        temp2++;
        if( AegisProcess[temp1 + 1] != "Final Inspection" ){
          if(temp2 < 10) temp3 = "0" + temp2;
          else temp3 = temp2;
          $("select[title='Route " + temp3 + "']").css("background-color","pink").val("MECH Insp 2");
          temp2++;
        }
        break;
      case "Mechanical Assembly 3":
        $("select[title='Route " + temp3 + "']").css("background-color","pink").val("MECH Oper 3");
        temp2++;
        if( AegisProcess[temp1 + 1] != "Final Inspection" ){
          if(temp2 < 10) temp3 = "0" + temp2;
          else temp3 = temp2;
          $("select[title='Route " + temp3 + "']").css("background-color","pink").val("MECH Insp 3");
          temp2++;
        }
        break;
      case "Test 1":
        $("select[title='Route " + temp3 + "']").css("background-color","6C91DA").val("TEST Oper 1");
        temp2++;
        break;
      case "Test 2":
        $("select[title='Route " + temp3 + "']").css("background-color","6C91DA").val("TEST Oper 2");
        temp2++;
        break;
      case "Final Inspection":
        $("select[title='Route " + temp3 + "']").css("background-color","8EE88E").val("FINAL Insp");
        temp2++;
        break;
      case "Packaging / Shipping":
        $("select[title='Route " + temp3 + "']").css("background-color","8EE88E").val("PACK / SHIP");
        temp2++;
        if(temp2 < 10) temp3 = "0" + temp2;
        else temp3 = temp2;
        $("select[title='Route " + temp3 + "']").css("background-color","8EE88E").val("END");
        if($("select[title='Conformal Coat']").val() == "TBD") $("select[title='Conformal Coat']").val("NO");
        folderReleasedDate();
        temp2++;
        break;
    }
  temp1++;
  }
};

function clearcolor(){
  $("select[title^='Route']").css("background-color","").css("color","");
  $("div.routeErr").remove();
};

function clearrouter(){
  $("select[title^='Route']").css("background-color","").val("TBD");
  $("select[title='Conformal Coat']").css("background-color","").css("color","").val("TBD");
  $("div.routeErr").remove();
};

function folderReleasedDate() {
  if(typeof($("input[title='Folder Released']").val()) != "undefined"){
    var todayD = new Date();
    todayD = (todayD.getMonth() + 1) + "/" + todayD.getDate() + "/" + todayD.getFullYear();
    $("input[title='Folder Released']").val(todayD);
  }
}; //End folder released date

function routedown(routeNum, routeProcess){
  var routeThis = parseInt(routeNum,10);
  var routeNext = routeThis + 1;
  
  if(routeThis < 26){
    if(routeThis < 10) routeThis = "0" + routeThis;
    else routeThis = String(routeThis);
    if(routeNext < 10) routeNext = "0" + routeNext;
    else routeNext = String(routeNext);

    routedown(routeNext,$("select[title='Route " + routeThis + "']").val());

    if(routeProcess == 0) $("select[title='Route " + routeThis + "']").val("TBD");
    else $("select[title='Route "+ routeThis + "']").val(routeProcess);
  }
}; //End routedown

function routeDelete(routeNum){
  var temp1 = parseInt(routeNum,10);
  var temp2;
  
  while( temp1 < 26){
    temp2 = temp1 + 1;
    if(temp2 < 10) temp2 = "0" + temp2;
    if(temp1 < 10) $("select[title='Route 0" + temp1 + "']").val($("select[title='Route " + temp2 + "']").val());
    else $("select[title='Route " + temp1 + "']").val($("select[title='Route " + temp2 + "']").val());
    temp1++;
  }
  if(temp1 == 26) $("select[title='Route 0" + temp1 + "']").val("TBD");
}; //End RouteDelete

//take value routerChange.routeNum (step number) and routerChange.route (route name in code) to create/modify process locations.
function routerSetup(jobNo, routerChange) {
  routerChange.sort(function(a,b){ return a.routeNum-b.routeNum; });
  var deferreds = [];
  var dfd = $.Deferred();
  var temp1 = 0;
  var temp2 = routerChange.length - 1;
  while( temp1 < temp2) {
    if( routerChange[temp1].route == "TBD" || routerChange[temp1].routeNum == routerChange[temp1 + 1].routeNum) {
      routerChange = routerChange.slice(0,temp1).concat(routerChange.slice(temp1 + 1));
      temp2--;
    } else {
      temp1++;
    }
    if (temp1 == temp2 && routerChange[temp1].route == "TBD") {
      routerChange = routerChange.slice(0,temp1);
      temp2--;
    }
  }    
/*////////////////////////////////
  var temp9 = "";
  for(var i = 0, l = routerChange.length; i < l; i ++) {
   temp9 += routerChange[i].routeNum + " " + routerChange[i].route + "::";
  }
  alert(temp9);
*/

$.when(getSPList("Master Job List",jobNo),getSPList("SMT-Program Schedule",jobNo)).done(function(masterData, spsData) {
  var changesSMT = new Array();
  var jobVals = readFields();

  if(typeof $(masterData.responseXML).SPFilterNode("z:row").attr("ows_SMT_x002d_T") != "undefined") {
    if(parseInt($(masterData.responseXML).SPFilterNode("z:row").attr("ows_SMT_x002d_T"),10) != jobVals.SMT_x002d_PS) changesSMT.push(["SMT_x002d_T",jobVals.SMT_x002d_PS]);
  }
  if(typeof $(masterData.responseXML).SPFilterNode("z:row").attr("ows_SMT_x002d_B") != "undefined") {
    if(parseInt($(masterData.responseXML).SPFilterNode("z:row").attr("ows_SMT_x002d_B"),10) != jobVals.SMT_x002d_SS) changesSMT.push(["SMT_x002d_B",jobVals.SMT_x002d_SS]);
  }

  if(changesSMT.length > 0) deferreds.push(updateSPList("Master Job List",$(masterData.responseXML).SPFilterNode("z:row").attr("ows_ID"),changesSMT));
  if(typeof $(spsData.responseXML).SPFilterNode("z:row").attr("ows_ID") != "undefined") {
    deferreds.push(updateSPList("SMT-Program Schedule",$(spsData.responseXML).SPFilterNode("z:row").attr("ows_ID"),[["Next_x0020_Proc",jobVals.Routing_x0020_1],["Next_x0020_Next_x0020_Proc",jobVals.Routing_x0020_2]]));
  } else if(jobVals.SMT_x002d_PS > 0 || jobVals.SMT_x002d_SS > 0) {
    var mjl2sp = [["Title",$(masterData.responseXML).SPFilterNode("z:row").attr("ows_Title")],
                  ["Description",$(masterData.responseXML).SPFilterNode("z:row").attr("ows_Description")],
                  ["Dorigo_x0020_Assy_x0023_",$(masterData.responseXML).SPFilterNode("z:row").attr("ows_Dorigo_x0020_Assy_x0023_")],
                  ["Qty",parseInt($(masterData.responseXML).SPFilterNode("z:row").attr("ows_Qty"),10)],
                  ["T_x002f_CONS",$(masterData.responseXML).SPFilterNode("z:row").attr("ows_T_x002f_CONS")],
                  ["SO_x0020_Due",$(masterData.responseXML).SPFilterNode("z:row").attr("ows_SO_x0020_Due")],
                  ["Master_x0020_Comments",$(masterData.responseXML).SPFilterNode("z:row").attr("ows_Comments_x002d_SMT")],
                  ["Last_x0020_Job_x0020_No_x002e__x",$(masterData.responseXML).SPFilterNode("z:row").attr("ows_Last_x0020_Job_x0020_No_x002e__x")],
                  ["Orange",$(masterData.responseXML).SPFilterNode("z:row").attr("ows_Orange")],
                  ["Flux_x0020_Type",$(masterData.responseXML).SPFilterNode("z:row").attr("ows_Flux_x0020_Type")],
                  ["Assy_x0020_Type",$(masterData.responseXML).SPFilterNode("z:row").attr("ows_Assy_x0020_Type")],
                  ["Next_x0020_Proc",jobVals.Routing_x0020_1],
                  ["Next_x0020_Next_x0020_Proc",jobVals.Routing_x0020_2],
                  ["Customer",$(masterData.responseXML).SPFilterNode("z:row").attr("ows_Customer")]];
    deferreds.push(createSPList("SMT-Program Schedule",mjl2sp));
  }
   
  for(var i = 0, l = routerChange.length; i < l; i++) {
    deferreds.push(addUpdateRouter(i,l,masterData,jobVals));
  }
  
  if(routerChange.length > 0) deferreds.push(addUpdateRouter(999,1000,masterData,jobVals));  //Update Open Jobs Progression
  
  $.when.apply($,deferreds).done(function(){
    dfd.resolve();
  });

});

return dfd.promise();

//Internal function. Use after routerSetup. Forms the update query and then activate the query through SPServices
function addUpdateRouter(i,l,masterData,jobVals) {
  var dfd = $.Deferred();
  var listTitle = (i == 999)? "Open Jobs Progression": code2List(routerChange[i].route); 
  var pairVal = getMasterSQL(listTitle,masterData,jobVals);
  var pairID;

  if(i != 999) {  //where 999 is for Open Jobs Progression only.
    if (routerChange[i].routeNum == 1) pairVal.push(["Qty_x0020_In",$(masterData.responseXML).SPFilterNode("z:row").attr("ows_Qty")]);
    if (i != 0 && routerChange[i].route != "END"){
      if(routerChange[(i-1)].routeNum == (routerChange[i].routeNum - 1)) pairVal.push(["Prev_x0020_Proc",routerChange[i-1].route]);
    }
    if ( i != (l-1) && routerChange[i].route != "END"){
      if(routerChange[(i+1)].routeNum == (routerChange[i].routeNum + 1)) {
        if(listTitle == "SMT Operation PS Schedule") pairVal.push(["NExt_x0020_Proc",routerChange[i+1].route]);
        else pairVal.push(["Next_x0020_Proc",routerChange[i+1].route]);
      }
    }
  }
  
  $().SPServices({
    operation: "GetListItems",
    async: true,
    listName: listTitle,
    CAMLViewFields: "<ViewFields><FieldRef Name='ID' /></ViewFields>",
    CAMLRowLimit: 1,
    CAMLQueryOptions: myQueryOptions,
    CAMLQuery: "<Query><Where><Eq><FieldRef Name='Title' /><Value Type='Text'>" + jobNo + "</Value></Eq></Where></Query>",
    completefunc: function (xData, Status) {
      pairID = $(xData.responseXML).SPFilterNode("z:row").attr("ows_ID");
      if (typeof(pairID) == "undefined"){
        pairVal.push(["Title",jobNo]);
        $().SPServices({
          operation: "UpdateListItems",
          async: true,
          batchCmd: "New",
          listName: listTitle,
          valuepairs: pairVal,
          completefunc: function(xData, Status) {
            var temp1 = $(xData.responseXML).SPFilterNode("ErrorText").text();
            if( typeof(temp1) != "undefined") {
              if(temp1.length > 0) alert(listTitle + "::" + temp1); 
            }
            dfd.resolve();
          }
        });
      }
      else {
        $().SPServices({
          operation: "UpdateListItems",
          async: true,
          batchCmd: "Update",
          ID: pairID,
          listName: listTitle,
          valuepairs: pairVal,
          completefunc: function(xData, Status) {
            var temp1 = $(xData.responseXML).SPFilterNode("ErrorText").text();
            if( typeof(temp1) != "undefined") {
              if(temp1.length > 0) alert(listTitle + "::" + temp1); 
            }
            dfd.resolve();
          }
        });
      }
    }
    
  });

return dfd.promise();
} //End Internal Function addUpdateRouter

}; //End router Setup

function updateSPList(listName,splID,changes) {
var dfd = $.Deferred();

$().SPServices({
  operation: "UpdateListItems",
  async: true,
  batchCmd: "Update",
  ID: splID,
  listName: listName,
  valuepairs: changes,
  completefunc: function(xData, Status) {
    var temp1 = $(xData.responseXML).SPFilterNode("ErrorText").text();
    if( typeof(temp1) != "undefined") {
      if(temp1.length > 0) alert(listName + "::" + temp1); 
    }
    dfd.resolve();
  }
});

return dfd.promise();
} //End function updateSPList

function createSPList(listName,changes) {
var dfd = $.Deferred();

$().SPServices({
  operation: "UpdateListItems",
  async: true,
  batchCmd: "New",
  listName: listName,
  valuepairs: changes,
  completefunc: function(xData, Status) {
    var temp1 = $(xData.responseXML).SPFilterNode("ErrorText").text();
    if( typeof(temp1) != "undefined") {
      if(temp1.length > 0) alert(listName + "::" + temp1); 
    }
    dfd.resolve();
  }
});

return dfd.promise();
} //End function createSPList

function getSPList(listName,jobNo) {
var myQuery = "<Query><Where><Eq><FieldRef Name='Title' /><Value Type='Text'>" + jobNo + "</Value></Eq></Where></Query>";
var dfd = $.Deferred();

$().SPServices({
  operation: "GetListItems",
  async: true,
  listName: listName,
  CAMLViewFields: "<ViewFields Properties = 'True' />",
  CAMLRowLimit: 1,
  CAMLQueryOptions: myQueryOptions,
  CAMLQuery: myQuery,
  completefunc: function (xData, Status) {
    dfd.resolve(xData);
  }
});
return dfd.promise();

}; //End getSPList

function code2List(codeName) {
var listTitle = "";
switch (codeName)
{
  case "SMT Oper SS": listTitle = "SMT Operation SS Schedule"; break;
  case "SMT Oper PS": listTitle = "SMT Operation PS Schedule"; break;
  case "SMT Insp": listTitle = "SMT Inspection Schedule"; break;
  case "PTH Wave": listTitle = "PTH Wave Schedule"; break;
  case "PTH Insp Wave": listTitle = "PTH Wave Inspection Schedule"; break;
  case "PTH Select": listTitle = "PTH Select Schedule"; break;
  case "PTH Insp Select": listTitle = "PTH Select Inspection Schedule"; break;
  case "HS Oper 1": listTitle = "HS Operation 1 Schedule"; break;
  case "HS Oper 2": listTitle = "HS Operation 2 Schedule"; break;
  case "HS Oper 3": listTitle = "HS Operation 3 Schedule"; break;
  case "HS Insp 1": listTitle = "HS Inspection 1 Schedule"; break;
  case "HS Insp 2": listTitle = "HS Inspection 2 Schedule"; break;
  case "HS Insp 3": listTitle = "HS Inspection 3 Schedule"; break;
  case "CC Oper 1": listTitle = "CC Operation 1 Schedule"; break;
  case "CC Insp 1": listTitle = "CC Inspection 1 Schedule"; break;
  case "MECH Oper 1": listTitle = "MECH Operation 1 Schedule"; break;
  case "MECH Oper 2": listTitle = "MECH Operation 2 Schedule"; break;
  case "MECH Oper 3": listTitle = "MECH Operation 3 Schedule"; break;
  case "MECH Insp 1": listTitle = "MECH Inspection 1 Schedule"; break;
  case "MECH Insp 2": listTitle = "MECH Inspection 2 Schedule"; break;
  case "MECH Insp 3": listTitle = "MECH Inspection 3 Schedule"; break;
  case "TEST Oper 1": listTitle = "TEST Operation 1 Schedule"; break;
  case "TEST Oper 2": listTitle = "TEST Operation 2 Schedule"; break;
  case "FINAL Insp": listTitle = "Final Inspection Schedule"; break;
  case "PACK / SHIP": listTitle = "Pack Schedule"; break;
  case "END": listTitle = "Shipment Authorization"; break;
  default: listTitle = "ERROR";
}
return listTitle;
}; //End code2List

function getMasterSQL(num,masterData,jobVals){

var temp1;
var routePropVal = new Array();
switch (num)
{
  case "SMT Operation PS Schedule":
           routePropVal.push(["SMT_x002d_T",jobVals.SMT_x002d_PS]);
           break;
  case "SMT Operation SS Schedule":
           routePropVal.push(["SMT_x002d_B",jobVals.SMT_x002d_SS]);
           break;
  case "HS Operation 1 Schedule":
           routePropVal.push(["HS1_x0020_Pins",$(masterData.responseXML).SPFilterNode("z:row").attr("ows_Hand_x0020_Pins")]);
           routePropVal.push(["Ref_x0020_Time",Math.round($(masterData.responseXML).SPFilterNode("z:row").attr("ows_Hand_x0020_Pins")*0.25)]);
           break;
  case "Shipment Authorization": 
           routePropVal.push(["Dorigo_x0020_Assy_x0020_ID",$(masterData.responseXML).SPFilterNode("z:row").attr("ows_Dorigo_x0020_Assy_x0023_")]);
           routePropVal.push(["Target_x0020_Ship_x0020_Date",$(masterData.responseXML).SPFilterNode("z:row").attr("ows_SO_x0020_Due")]);
           routePropVal.push(["Stock_x003f_",$(masterData.responseXML).SPFilterNode("z:row").attr("ows_Job_x0020_Type")]);
           break;
  case "Open Jobs Progression":
           routePropVal.push(["Dorigo_x0020_Assy_x0020_ID",$(masterData.responseXML).SPFilterNode("z:row").attr("ows_Dorigo_x0020_Assy_x0023_")]);
           break;
}

routePropVal.push(["Customer", $(masterData.responseXML).SPFilterNode("z:row").attr("ows_Customer")]);
if(num != "PE Prioritization List" && num != "Shipment Authorization") {
  routePropVal.push(['Description', $(masterData.responseXML).SPFilterNode("z:row").attr("ows_Description")]);
  routePropVal.push(["SO_x0020_Due",$(masterData.responseXML).SPFilterNode("z:row").attr("ows_SO_x0020_Due")]);
}
if(num != "PE Prioritization List" && num != "Shipment Authorization" && num != "Open Jobs Progression") {
  routePropVal.push(["Dorigo_x0020_Assy_x0023_",$(masterData.responseXML).SPFilterNode("z:row").attr("ows_Dorigo_x0020_Assy_x0023_")]);
  temp1 = $(masterData.responseXML).SPFilterNode("z:row").attr("ows_PE");
  temp1 = temp1.substr(temp1.indexOf(" - ")+3);
  routePropVal.push(["PE",temp1]);
}
routePropVal.push(["Qty",$(masterData.responseXML).SPFilterNode("z:row").attr("ows_Qty")]);

return routePropVal;
};

function rACCheckb4Submit(routerChange, smtCheck) {
  //if(true) {
  if(originVals["Clean_x003f_"] != "" && originVals["Printed"] != "" && $("input[title='Folder Released']").val() != "") {
    $("td#rACTitle").text("Kit Status is " + originVals["Clean_x003f_"] + ". Please advise cause for folder release after kit release:");
    $("td#rACButtons").html("<button type='button' id=rACSubmit>Submit</button>&nbsp;&nbsp;<button type='button' id=rACCancel>Cancel</button>");
    $("span#releaseAfterClean").show().find("textarea#rACReason").focus(); 
    $("button#rACSubmit").click(function(){
      if($("textarea#rACReason").val() == "") alert("Entry required. Please specify reason.");
      else {
        $("textarea[title='Release after clean']").val($("textarea#rACReason").val());
        $("span#releaseAfterClean").hide();
        transferSaveData(routerChange, smtCheck);
      }
    });
    $("button#rACCancel").click(function(){
      $("td#rACButtons").html("");
      $("span#releaseAfterClean").hide();
      $("span#saveStatus").hide();
      $("div#greyOverlay").hide();
    });
  } else {
    transferSaveData(routerChange, smtCheck); 
  }

}  //End rACCheck