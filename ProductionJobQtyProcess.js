var myQueryOptions = "<QueryOptions><ViewAttributes Scope='RecursiveAll' IncludeRootFolder='True' /></QueryOptions>";
var progressTrigger;
var focusTrigger;
var progressFlag = [0,0,0];


function JobQtyProcess() {
var processHeader;
var itemID;

$(document).ready(function() {

setupProductionWindow();

$("table.ms-listviewtable").each(function(){
  processHeader = $(this).attr("summary");
  if (processHeader != "SMT-Program Schedule"){
    $(this).find("table[ctype='Item']").each(function(){
      itemID = $(this).attr("id");
      $(this).find("a").removeAttr("onclick href").attr("ph",processHeader).attr("itemID",itemID).click(function(){ProcessorWindow($(this).attr("ph"),$(this).attr("itemID"))});
    });
  }
});

});
}; //JobQtyProcess Function Ends

function setupProductionWindow(){

if(browseris.ie5up) $("head").append('<link href="http://server1:8086/javascripts/ProductionJobQtyProcess.css" rel="stylesheet" type="text/css" />');
else $("head").append('<link href="/javascripts/ProductionJobQtyProcess.css" rel="stylesheet" type="text/css" />');
$("body").append("<span class=jstatus>Loading...</span><div class=overlay style='display:none;'></div><span class=closer style='display:none;'>x</span>"
  + "<table class=JobQtyProcessor style='display:none;'><tbody><tr><td colspan=2>Job No. <span style='font-weight:bold;' class=JQPJobNo>&nbsp;</span></td></tr>"
  + "<tr><td colspan=2 class=JQPTransact></td></tr><tr><td>Current Qty:</td><td><span class=qtyLeft>&nbsp;</span></td></tr>"
  + "<tr><td>Qty Pr<span class='secretButton'>o</span>cess:&nbsp;</td><td style='width:270px;'><input class=JQPQtyProcess type='text' onkeypress='return JQPkeyLock(event,this)' name='QtyProcess' style='width:100px;' />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class=JQPEnter>Press Enter</span></td></tr>"	
  + "<tr><td colspan=2 >Comments:<br /><textarea rows='15' class='ckeditor comments' name='PJQcomments' id='PJQcomments'></textarea></td></tr>"
  + "<tr class=JQPinternal style='display:none;'><td><div class=JQPID></div><div class=JQPQtyIn></div><div class=JQPQtyCompl></div>"
  + "<div class=JQPCurrList></div><div class=JQPNextList></div><div class=JQPCustomer></div><div class=JQPAssyID></div>"
  + "<div class=JQPJobProgressionID></div></td></tr></tbody></table>");

CKEDITOR.replace( 'PJQcomments', {toolbarStartupExpanded : false} );
$("span.jstatus").hide();
$("span.closer").click(function(){
  $("table.JobQtyProcessor").hide();
  $("input.JQPQtyProcess").val("");
  $("span.closer").hide();
  $("div.overlay").hide();
});

$("span.secretButton").click(function(){$(".JQPinternal").toggle()});

$("input.JQPQtyProcess").keyup(function(){
if($("input.JQPQtyProcess").val().length > 0){
  if(parseInt($("input.JQPQtyProcess").val(),10) < 0) $("span.flowArrow").text(" <<< ").attr("style","color:red; font-weight:bold;");
  else $("span.flowArrow").text(" --> ").removeAttr("style");
} else $("span.flowArrow").text(" --> ").removeAttr("style");
});

$("span.JQPEnter").mousedown(function(e){
  processQty();
});

} //End setupProductionWindow

function ProcessorWindow(processHeader, itemID) {
var tempA;
var jobNo;
var PWQuery;
var PWprocessHeader = processHeader;
var PWitemID = itemID;


$("span.jstatus").show();
CKEDITOR.instances["PJQcomments"].setReadOnly(false);

//Adapter for SMT-Placement Schedule
if(PWprocessHeader == "SMT-Placement Schedule"){
  jobNo = $("a[itemID="+PWitemID+"]").text();
  PWprocessHeader = (jobNo.substr(jobNo.length - 2) == "SS") ? ("SMT Operation SS Schedule") : ("SMT Operation PS Schedule");
  jobNo = jobNo.substring(0,jobNo.length - 3);
  PWQuery = "<Query><Where><Eq><FieldRef Name='Title' /><Value Type='Text'>" + jobNo + "</Value></Eq></Where></Query>";
} else {
  PWQuery = "<Query><Where><Eq><FieldRef Name='ID' /><Value Type='Text'>" + PWitemID + "</Value></Eq></Where></Query>";
}

//Get Information from current list
$().SPServices({
  operation: "GetListItems",
  async: true,
  listName: PWprocessHeader,
  CAMLViewFields: "<ViewFields Properties = 'True' />",
  CAMLRowLimit: 1,
  CAMLQuery: PWQuery,
  CAMLQueryOptions: myQueryOptions,
  beforeSend: function () {$("span.jstatus").show();},
  completefunc: function (xData, Status) {
    $("div.JQPID").text($(xData.responseXML).SPFilterNode("z:row").attr("ows_ID"));
    $("div.JQPCustomer").text($(xData.responseXML).SPFilterNode("z:row").attr("ows_Customer"));
    $("div.JQPAssyID").text($(xData.responseXML).SPFilterNode("z:row").attr("ows_Dorigo_x0020_Assy_x0023_"));
    $("div.JQPCurrList").text(PWprocessHeader);
    $("div.JQPQtyIn").text($(xData.responseXML).SPFilterNode("z:row").attr("ows_Qty_x0020_In"));
    if($("div.JQPQtyIn").text().length <= 0) $("div.JQPQtyIn").text("0");
    $("div.JQPQtyCompl").text($(xData.responseXML).SPFilterNode("z:row").attr("ows_Qty_x0020_Compl"));
    if($("div.JQPQtyCompl").text().length <= 0) $("div.JQPQtyCompl").text("0");
    $("span.qtyLeft").text(parseInt($("div.JQPQtyIn").text(),10) - parseInt($("div.JQPQtyCompl").text(),10));
    CKEDITOR.instances["PJQcomments"].setData($(xData.responseXML).SPFilterNode("z:row").attr("ows_Comments"));
    jobNo = $(xData.responseXML).SPFilterNode("z:row").attr("ows_Title");
    $(".JQPJobNo").text(jobNo);
    
//SMT Operation PS Schedule WORK AROUND    
    if(PWprocessHeader == "SMT Operation PS Schedule") tempA = code2List($(xData.responseXML).SPFilterNode("z:row").attr("ows_NExt_x0020_Proc"));
    else tempA = code2List($(xData.responseXML).SPFilterNode("z:row").attr("ows_Next_x0020_Proc"));
    $("div.JQPNextList").text(tempA);
    
    // Get Open Jobs Progression ID
    $().SPServices({
      operation: "GetListItems",
      async: true,
      listName: "Open Jobs Progression",
      CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='ID' /></ViewFields>",
      CAMLRowLimit: 1,
      CAMLQuery: "<Query><Where><Eq><FieldRef Name='Title' /><Value Type='Text'>" + jobNo + "</Value></Eq></Where></Query>",
      CAMLQueryOptions: myQueryOptions,
      completefunc: function (xData, Status) {
        $("div.JQPJobProgressionID").text($(xData.responseXML).SPFilterNode("z:row").attr("ows_ID"));
        if(tempA == "ERROR") {
          tempA = "<span style='font-weight:bold; color:red'> ERROR! Cannot Process. Contact SharePoint Administrator: Kai</span>";
          $("input.JQPQtyProcess").prop('disabled',true);
          $("span.JQPEnter").css("background-color","red");
        }else {
          tempA = PWprocessHeader + "<span class=flowArrow> --> </span>" + tempA;
          $("input.JQPQtyProcess").prop('disabled',false);
          window.setTimeout(function(){$("input.JQPQtyProcess").prop('disabled',false).select().focus();}, 10);
          $("span.JQPEnter").css("background-color","green");
        }
        $("span.jstatus").empty().text("Loading...").hide();
        $("input.JQPQtyProcess").val("");    
        $(".JQPTransact").text("").append(tempA);
        $("table.JobQtyProcessor").show();
        $("span.closer").show();
        $("div.overlay").show();
        $("span.flagBox").css("background","red").css("color","red").show();
// DISABLE FOCUS TRIGGER
        focusTrigger = setInterval(function(){focusCheck()},1000);
      }
    }); //SPServices Open Jobs Progression GetInfo
  }
}); //SPServices Get Info from current list
};//Processor Window Function Ends

function processQty() {
var qtyProcess = $("input.JQPQtyProcess").val();

//  CKEDITOR.instances["PJQcomments"].setReadOnly(true);
//  var JQPComments = CKEDITOR.instances["PJQcomments"].setData();
//  alert(JQPComments);
//  CKEDITOR.instances["PJQcomments"].setReadOnly(false);

if(qtyProcess.length > 0) {
qtyProcess = parseInt(qtyProcess,10);
if(qtyProcess.length != 0 && qtyProcess != 0) {

  var qtyLeft;
  var nextListID;
  var nextQtyIn;
  var nextQtyLeft;
  var JobProgressionID = $("div.JQPJobProgressionID").text();
  var jobNo = $(".JQPJobNo").text();
  var customer = $("div.JQPCustomer").text();
  var assyID = $("div.JQPAssyID").text();
  var itemID = $("div.JQPID").text();
  var currList = $("div.JQPCurrList").text();
  var currListID;
  var qtyCompl = parseInt($("div.JQPQtyCompl").text(),10);
  var nextList = $("div.JQPNextList").text();
  var currCode = list2Code(currList);
  var nextCode = list2Code(nextList);
  var OJPcurrList = list2OJP(currList);
  var OJPnextList = list2OJP(nextList);
  var actionDate = today4SP(1);
  var transactionProcess = qtyProcess < 0 ? ("Return " + nextCode + " to " + currCode + " " + qtyProcess + "pc") : ("Transact " + currCode + " to " + nextCode + " " + qtyProcess + "pc");
  var JQPComments;
  var OJPvaluePair = new Array();
  
  clearInterval(focusTrigger);
  $("span.closer").hide();
  $("body").append("<span class=jstatus><span class=aText>Workflow In Progress</span><br /><span class='flagBMR flagBox' title='Update Board Movement'>_</span>&nbsp;&nbsp;<span class='flagOJP flagBox' title='Update Open Jobs Progression'>_</span>&nbsp;&nbsp;<span class='flagRN flagBox' title='Update next Schedule'>_</span>&nbsp;&nbsp;<span class='flagR flagBox' title='Update current Schedule'>_</span></span>");
  $("span.flagBox").css("background","red").css("color","red").show();
  $("input.JQPQtyProcess").prop('disabled',true);
  progressTrigger = setInterval(function(){progressCheck()},1000);

  $("input.JQPQtyProcess").val("");
  qtyLeft = parseInt($("span.qtyLeft").text(),10) - qtyProcess;
  qtyCompl = qtyCompl + qtyProcess;

  CKEDITOR.instances["PJQcomments"].setReadOnly(true);
  JQPComments = escapeHTML(CKEDITOR.instances["PJQcomments"].getData());
  
  continueProcess();
  
function continueProcess(){
  $("span.JQPEnter").css("background-color","gray").text("Processing");
  $("span.aText").text("Processing " + qtyProcess + " pc");
//Get nextList Info
$().SPServices({
  operation: "GetListItems",
  async: true,
  listName: nextList,
  CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='Qty_x0020_In' /><FieldRef Name='Qty_x0020_Compl' /></ViewFields>",
  CAMLRowLimit: 1,
  CAMLQuery: "<Query><Where><Eq><FieldRef Name='Title' /><Value Type='Text'>" + jobNo + "</Value></Eq></Where></Query>",
  CAMLQueryOptions: myQueryOptions,
  completefunc: function (xData, Status) {
    nextListID = $(xData.responseXML).SPFilterNode("z:row").attr("ows_ID");
    nextQtyIn = $(xData.responseXML).SPFilterNode("z:row").attr("ows_Qty_x0020_In");
    if(typeof(nextQtyIn) != "undefined") nextQtyIn = parseInt(nextQtyIn,10) + qtyProcess;
    else nextQtyIn = qtyProcess;
    nextQtyLeft = $(xData.responseXML).SPFilterNode("z:row").attr("ows_Qty_x0020_Compl");
    if(typeof(nextQtyLeft) != "undefined") nextQtyLeft = nextQtyIn - parseInt(nextQtyLeft,10);
    else nextQtyLeft = nextQtyIn;
    
    if( OJPcurrList == "ERROR" || OJPnextList == "ERROR") OJPvaluePair.push(["Title", jobNo]);
    else OJPvaluePair = [[OJPnextList, nextQtyLeft],[OJPcurrList, qtyLeft]];
    
    //Update nextList
    $().SPServices({
      operation: "UpdateListItems",
      async: true,
      batchCmd: "Update",
      ID:nextListID,
      listName: nextList,
      valuepairs: [["Qty_x0020_In", nextQtyIn],["Qty_x0020_Left_x002e_", nextQtyLeft]],
      completefunc: function(xData, Status) {
        if($(xData.responseXML).SPFilterNode('ErrorText').text().length > 0) errorUpdate(nextList, nextListID);
//        $("span.JQPEnter").text("Updating " + qtyProcess + " pc");
          $("span.flagRN").css("background","green").css("color","green");
      }
    }); //SPServices nextList Update
  
    // Update Current List
    $().SPServices({
      operation: "UpdateListItems",
      async: true,
      batchCmd: "Update",
      ID:itemID,
      listName: currList,
      valuepairs: [["Qty_x0020_Left_x002e_", qtyLeft],["Qty_x0020_Compl", qtyCompl],["Transaction", transactionProcess],["Comments",JQPComments]],
      completefunc: function(xData, Status) {
        if($(xData.responseXML).SPFilterNode('ErrorText').text().length > 0) errorUpdate(currList, itemID, jobNo);
        progressFlag[0] = 1; 
        $("span.flagR").css("background","green").css("color","green");
      }
    }); //SPServices currList Update

    //Update Board Movement Report
    $().SPServices({
      operation: "UpdateListItems",
      async: true,
      batchCmd: "New",
      listName: "Board Movement Report",
      valuepairs: [["Title", jobNo],["Customer", customer],["Dorigo_x0020_Assy_x0020_ID", assyID],["From_x0020_Proc",currCode],["Next_x0020_Proc",nextCode],["Action_x0020_Date_x002e_", actionDate],["Qty_x0020_Moved",qtyProcess],["Timestamp",today4SP(2)]],
      completefunc: function(xData, Status) {
        if($(xData.responseXML).SPFilterNode('ErrorText').text().length > 0) errorUpdate("Board Movement Report", "new", jobNo);
        progressFlag[1] = 1;
        $("span.flagBMR").css("background","green").css("color","green");
      }
    });

    //Update Open Jobs Progression
    $().SPServices({
      operation: "UpdateListItems",
      async: true,
      batchCmd: "Update",
      ID: JobProgressionID,
      listName: "Open Jobs Progression",
      valuepairs: OJPvaluePair,
      completefunc: function(xData, Status) {
        if($(xData.responseXML).SPFilterNode('ErrorText').text().length > 0) errorUpdate("Open Jobs Progression", JobProgressionID, jobNo);
        progressFlag[2] = 1;
        $("span.flagOJP").css("background","green").css("color","green");
      }
    }); //SPServices Open Jobs Progression Update
  }
}); //SPServices nextList GetInfo

}// Continue Process Ends

} //End if
} //End if

};//Process Qty Function Ends

function progressCheck(){
  if(progressFlag[0] == 1 && progressFlag[1] == 1 && progressFlag[2] == 1){
    progressFlag = [0,0,0];
    clearInterval(progressTrigger);
    $("span.JQPEnter").text("Press Enter").css("background-color","green");
    $("span.closer").click();
    $("span.aText").text("Complete!");
    $("span.flagBox").hide();
    window.setTimeout(function(){$("span.jstatus").empty().text("Loading...").hide()},2000);
  }
};

function focusCheck() { 
  if($("table.JobQtyProcessor").css("display") == "none") clearInterval(focusTrigger);
  else if(document.hasFocus() == false){
      $("span.closer").click();
      clearInterval(focusTrigger);
  }
}

function errorUpdate(name, id, jobNo){
  alert(name + " not updated. Please click OK and send the pop-up email to Kai.");
  var temp = "mailto:kching@dorigo.com?subject=Production Process Window Error&body=Error updating " + name + " for item ID: " + id 
    + " and job No: " + jobNo;
  location.href=temp;
};

function list2Code(listName) {
var codeName = "";
switch (listName)
{
  case "SMT Operation SS Schedule": codeName = "SMT Oper SS"; break;
  case "SMT Operation PS Schedule": codeName = "SMT Oper PS"; break;
  case "SMT Inspection Schedule": codeName = "SMT Insp"; break;
  case "PTH Wave Schedule": codeName = "PTH Wave"; break;
  case "PTH Select Schedule": codeName = "PTH Select"; break;
  case "PTH Select Inspection Schedule": codeName = "PTH Insp Select"; break;
  case "PTH Wave Inspection Schedule": codeName = "PTH Insp Wave"; break;
  case "HS Operation 1 Schedule": codeName = "HS Oper 1"; break;
  case "HS Operation 2 Schedule": codeName = "HS Oper 2"; break;
  case "HS Operation 3 Schedule": codeName = "HS Oper 3"; break;
  case "HS Inspection 1 Schedule": codeName = "HS Insp 1"; break;
  case "HS Inspection 2 Schedule": codeName = "HS Insp 2"; break;
  case "HS Inspection 3 Schedule": codeName = "HS Insp 3"; break;
  case "CC Operation 1 Schedule": codeName = "CC Oper 1"; break;
  case "CC Inspection 1 Schedule": codeName = "CC Insp 1"; break;
  case "MECH Operation 1 Schedule": codeName = "MECH Oper 1"; break;
  case "MECH Operation 2 Schedule": codeName = "MECH Oper 2"; break;
  case "MECH Operation 3 Schedule": codeName = "MECH Oper 3"; break;
  case "MECH Inspection 1 Schedule": codeName = "MECH Insp 1"; break;
  case "MECH Inspection 2 Schedule": codeName = "MECH Insp 2"; break;
  case "MECH Inspection 3 Schedule": codeName = "MECH Insp 3"; break;
  case "TEST Operation 1 Schedule": codeName = "TEST Oper 1"; break;
  case "TEST Operation 2 Schedule": codeName = "TEST Oper 2"; break;
  case "Final Inspection Schedule": codeName = "FINAL Insp"; break;
  case "Pack Schedule": codeName = "PACK / SHIP"; break;
  case "Shipment Authorization": codeName = "END"; break;
  default: codeName = "ERROR";
}
return codeName;
};

function code2List(codeName) {
var listName = "";
switch (codeName)
{
  case "SMT Oper SS": listName = "SMT Operation SS Schedule"; break;
  case "SMT Oper PS": listName = "SMT Operation PS Schedule"; break;
  case "SMT Insp": listName = "SMT Inspection Schedule"; break;
  case "PTH Wave": listName = "PTH Wave Schedule"; break;
  case "PTH Insp Wave": listName = "PTH Wave Inspection Schedule"; break;
  case "PTH Select": listName = "PTH Select Schedule"; break;
  case "PTH Insp Select": listName = "PTH Select Inspection Schedule"; break;
  case "HS Oper 1": listName = "HS Operation 1 Schedule"; break;
  case "HS Oper 2": listName = "HS Operation 2 Schedule"; break;
  case "HS Oper 3": listName = "HS Operation 3 Schedule"; break;
  case "HS Insp 1": listName = "HS Inspection 1 Schedule"; break;
  case "HS Insp 2": listName = "HS Inspection 2 Schedule"; break;
  case "HS Insp 3": listName = "HS Inspection 3 Schedule"; break;
  case "CC Oper 1": listName = "CC Operation 1 Schedule"; break;
  case "CC Insp 1": listName = "CC Inspection 1 Schedule"; break;
  case "MECH Oper 1": listName = "MECH Operation 1 Schedule"; break;
  case "MECH Oper 2": listName = "MECH Operation 2 Schedule"; break;
  case "MECH Oper 3": listName = "MECH Operation 3 Schedule"; break;
  case "MECH Insp 1": listName = "MECH Inspection 1 Schedule"; break;
  case "MECH Insp 2": listName = "MECH Inspection 2 Schedule"; break;
  case "MECH Insp 3": listName = "MECH Inspection 3 Schedule"; break;
  case "TEST Oper 1": listName = "TEST Operation 1 Schedule"; break;
  case "TEST Oper 2": listName = "TEST Operation 2 Schedule"; break;
  case "FINAL Insp": listName = "Final Inspection Schedule"; break;
  case "PACK / SHIP": listName = "Pack Schedule"; break;
  case "END": listName = "Shipment Authorization"; break;
  default: listName = "ERROR";
}
return listName;
};

function list2OJP(listName) {
var OJPName = "";
switch (listName)
{
  case "SMT Operation SS Schedule": OJPName = "SMT_x002d_Bot"; break;
  case "SMT Operation PS Schedule": OJPName = "SMT_x002d_Top"; break;
  case "SMT Inspection Schedule": OJPName = "QC_x002d_SMT"; break;
  case "PTH Wave Schedule": OJPName = "_x0032_nd_x002d_Solder"; break;
  case "PTH Select Schedule": OJPName = "_x0032_nd_x002d_Mech"; break;
  case "PTH Select Inspection Schedule": OJPName = "QC_x002d_Mech"; break;
  case "PTH Wave Inspection Schedule": OJPName = "_x0032_nd_x002d_Solder"; break;
  case "HS Operation 1 Schedule": OJPName = "Test_x002d_1"; break;
  case "HS Operation 2 Schedule": OJPName = "_x0032_nd_x002d_Solder2"; break;
  case "HS Operation 3 Schedule": OJPName = "_x0032_nd_x002d_Solder3"; break;
  case "HS Inspection 1 Schedule": OJPName = "Test_x002d_2"; break;
  case "HS Inspection 2 Schedule": OJPName = "QC_x002d_Solder2"; break;
  case "HS Inspection 3 Schedule": OJPName = "QC_x002d_Solder3"; break;
  case "CC Operation 1 Schedule": OJPName = "_x0032_nd_x002d_Coat"; break;
  case "CC Inspection 1 Schedule": OJPName = "QC_x002d_Coat"; break;
  case "MECH Operation 1 Schedule": OJPName = "_x0032_nd_x002d_Mech1"; break;
  case "MECH Operation 2 Schedule": OJPName = "_x0032_nd_x002d_Mech2"; break;
  case "MECH Operation 3 Schedule": OJPName = "_x0032_nd_x002d_Mech3"; break;
  case "MECH Inspection 1 Schedule": OJPName = "QC_x002d_Mech1"; break;
  case "MECH Inspection 2 Schedule": OJPName = "QC_x002d_Mech2"; break;
  case "MECH Inspection 3 Schedule": OJPName = "QC_x002d_Mech3"; break;
  case "TEST Operation 1 Schedule": OJPName = "Test_x002d_10"; break;
  case "TEST Operation 2 Schedule": OJPName = "Test_x002d_20"; break;
  case "Final Inspection Schedule": OJPName = "Final_x0020_QC"; break;
//  case "Pack Schedule": OJPName = "Pack"; break;
//case "SAR" : OJPName = "TSE"; Break;
//  case "Shipment Authorization": OJPName = "END"; break;
  default: OJPName = "ERROR";
}
return OJPName;
};

function JQPkeyLock(e,ind)
{
var keynum;
var keychar;
var numcheck;
var quoteno;

//IE
if(window.event) keynum = e.keyCode;
// Netscape/Firefox/Opera
else if(e.which) keynum = e.which;

keychar = String.fromCharCode(keynum);
numcheck = /\d|[-]/;

if(keynum==27){
  $("span.closer").click();
}

if(keynum==13){
  processQty();
}

return numcheck.test(keychar);
};

function today4SP(dateType) {
//change today's date to SharePoint date formats.
//dateType = 1 is for YYYY-MM-DD HH:MM:SS
//dateType = 2 is for MM/DD/YYYY HH:MM:SS TT
var actionDate = new Date();
var actionMonth = actionDate.getMonth() + 1;
var actionDay = actionDate.getDate();
var actionYear = actionDate.getFullYear();
var actionHour = actionDate.getHours();
var actionMinute = actionDate.getMinutes() < 10 ? "0" + actionDate.getMinutes() : actionDate.getMinutes();
var actionSeconds = actionDate.getSeconds() < 10 ? "0" + actionDate.getSeconds() : actionDate.getSeconds();

if(dateType == 1) actionDate = actionYear + "-" + actionMonth + "-" + actionDay + " " + actionHour + ":" + actionMinute + ":" + actionSeconds;
else if (dateType == 2) {
  var actionMeridiem = actionDate.getHours() > 12 ? "PM" : "AM";
  actionHour = actionHour > 12 ? actionHour - 12 : actionHour;
  actionDate = actionMonth + "/" + actionDay + "/" + actionYear + " " + actionHour + ":" + actionMinute + ":" + actionSeconds + " " + actionMeridiem;
}
return actionDate;
};

// Escape string characters
function escapeHTML(s) { return typeof(s) != "string"?"":s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }