var myQueryOptions = "<QueryOptions><ViewAttributes Scope='RecursiveAll' IncludeRootFolder='True' /></QueryOptions>";
var myQuery;
var jobNo;
var assyID;
var i;
var temp1;
var temp3;

var typeTime = 1000;
var stopTimer;

function OpenJobsQuery(){
$(document).ready(function() {
if(browseris.ie5up) $("head").append('<link href="http://server1:8086/javascripts/Webpart-Jobs%20Query.css" rel="stylesheet" type="text/css">');
else $("head").append('<link href="/javascripts/Webpart-Jobs%20Query.css" rel="stylesheet" type="text/css">');
$("body").append('<table Class=assyList style="display:none;"><tbody><tr><td class=assySelect>cancel</td></tr></tbody></table>');

setupProductionWindow();

$("input#searchInput").select().focus().click(function(){$("input#searchInput").keydown();});
$("input#searchInput").keydown(function(){
  clearTimeout(stopTimer);
  stopTimer = setTimeout(function(){
    assyID = $("input#searchInput").val();
    $(".assyList tbody").remove();
    if(assyID != ""){
      temp1 = "<tbody><tr><td class='assyDD assyDDCancel'>cancel</td></tr>";
      temp3 = getJobfromAny(assyID);
      if(temp3.length==1){
        startJobQuery($("<div>"+temp3[0]+"</div>").find("span.jobNoResult").text());
      } else {
        if(temp3.length==0)temp1 += "<tr><td class='assyDD assyDDE2Select'>Search " + assyID + " in E2 (for comments only)</td></tr>";
        else for(i=0;i<temp3.length;i++) {temp1 += "<tr><td class='assyDD assyDDSelect'>" + temp3[i] + "</td></tr>";}
        temp1 += "</tbody>";
        $(".assyList").append(temp1);
        $(".assyDD").hover(function(){$(this).css("background-color","#b3e6ff");},
          function(){$(this).css("background-color","white")});
        $(".assyDDCancel").click(function(){$(".assyList").hide();});
        $(".assyDDSelect").click(function(){
          startJobQuery($(this).find("span.jobNoResult").text());
          $(".assyList").hide();
        });
        $(".assyDDE2Select").click(function(){
          startJobQuery(assyID);
          $(".assyList").hide();
        });
        $(".assyList").show();
      }
    }
  }, typeTime - 500);
});

JSRequest.EnsureSetup();
jobNo = JSRequest.QueryString["jobNo"];
if(typeof(jobNo) != "undefined") $("input#searchInput").val(jobNo).click();

});
}; //End Open Jobs Query

function pWadapter(routingcode){
  var listName = code2List(routingcode);
    
  if(listName == "ERROR") getItem($("a.jobNoLink").text(),routingcode);
  else {
    var myQuery = "<Query><Where><Eq><FieldRef Name='Title' /><Value Type='Text'>" + $("a.jobNoLink").text() + "</Value></Eq></Where></Query>";
    $().SPServices({
      operation: "GetListItems",
      async: true,
      listName: listName,
      CAMLViewFields: "<ViewFields><FieldRef Name='ID' /></ViewFields>",
      CAMLRowLimit: 1,
      CAMLQueryOptions: myQueryOptions,
      CAMLQuery: myQuery,
      completefunc: function (xData, Status) {
        ProcessorWindow(listName, $(xData.responseXML).SPFilterNode("z:row").attr("ows_ID"));
      }
    });
  };
} // End pWadapter

function startJobQuery(jobNo){

$("span#JQloader").show();
$(".routingDis").remove();

var routeTable = "<table Class=routingDis><tbody>"+
                 "<tr><td style='width:200px' width=200>Job No. <span id='JQjobNo'></span></td><td style='width:400px' width=400>Description: <span id='JQDescription'></span></td></tr>" +
                 "<tr><td>Assy ID <span id='JQassy'></span></td><td>Job Qty: <span id='JQjobQty'></span> / Balance due: <span id='JQbal' class='redBal'></span><span style='display:none' id='JQjobComplete'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Job Complete</span></td></tr>" +
                 "<tr><td>PE: <span id='JQPE'></span></td><td>Target Ship Date: <span id='JQtargetDate'></span></td></tr>" +
                 "<tr><td class='tableblock' style='vertical-align:top; padding: 0px; border:0px;'><table id='JQjobRoute'><tr><td colspan=2><a href=javascript:getItem('" + jobNo + "','RoutingSteps')>Routing Steps</a>&nbsp;/&nbsp;<a href=javascript:getItem('" + jobNo + "','Progression')>Progression</a></td></tr></table></td>" +
                 "<td class='tableblock' style='vertical-align:top; padding: 0px; border:0px;'><table><tr><td colspan=2>Job Info</td></tr><tr><td>Panel</td><td id='JQpanel'></td></tr><tr><td>SMT SS</td><td id='JQsmtSS'></td></tr><tr class='JQstencil'><td>&nbsp;&nbsp;&nbsp;Stencil SS: </td><td id='JQstencilB'></td></tr><tr><td>SMT PS</td><td id='JQsmtPS'></td></tr><tr class='JQstencil'><td>&nbsp;&nbsp;&nbsp;Stencil PS: </td><td id='JQstencilT'></td></tr><tr><td>Wave Comp</td><td id='JQwaveComp'></td></tr><tr><td>Wave Pins</td><td id='JQwavePin'></td></tr><tr><td>Hand Pins</td><td id='JQhandPin'></td></tr><tr><td>Mech Items</td><td id='JQmechItem'></td></tr><tr><td>Test Mins</td><td id='JQtestMin'></td></tr><tr><td>Conformal Coat</td><td id='JQcoat'></td></tr></table></td></tr>" +
                 "<tr><td colspan=2 id='JQe2Comment'></td></tr><tr><td colspan=2>Schedule Comment: <br /><span id='JQscComment'></span>&nbsp;</td></tr>"
                 "</tbody></table>";


$("#routingAnchor").append(routeTable);

getRouting(jobNo);

} //End startJobQuery

function getJobfromAny(jobDesc) {
  myQuery = "<Query><Where><Or><Or><Or><Contains><FieldRef Name='Description' /><Value Type='Text'>" + jobDesc + 
            "</Value></Contains><Contains><FieldRef Name='Dorigo_x0020_Assy_x0023_' /><Value Type='Text'>" + jobDesc +
            "</Value></Contains></Or><Contains><FieldRef Name='Cust_x0020_Assy_x0023_' /><Value Type='Text'>" + jobDesc +
            "</Value></Contains></Or><Contains><FieldRef Name='Title' /><Value Type='Text'>" + jobDesc +
            "</Value></Contains></Or></Where><OrderBy><FieldRef Name='ID' Ascending='False' /></OrderBy></Query>";
  var temp2 = new Array();

  $().SPServices({
    operation: "GetListItems",
    async: false,
    listName: "Master Job List",
    CAMLViewFields: "<ViewFields><FieldRef Name='Title' /><FieldRef Name='Dorigo_x0020_Assy_x0023_' /><FieldRef Name='Cust_x0020_Assy_x0023_' /><FieldRef Name='Description' /></ViewFields>",
    CAMLRowLimit: 100,
    CAMLQueryOptions: myQueryOptions,
    CAMLQuery: myQuery,
    completefunc: function (xData, Status) {
      $(xData.responseXML).SPFilterNode("z:row").each(function(n) {
        temp2[n] = "<span class=jobNoResult>" + $(this).attr("ows_Title")+"</span>: "+ $(this).attr("ows_Dorigo_x0020_Assy_x0023_") + "<b> >> </b>" + $(this).attr("ows_Cust_x0020_Assy_x0023_") + "<br/>" + $(this).attr("ows_Description");
      });
    }
  });

  return temp2;
  } //End getAssyfromANY

function getStencil(jobNo){
var dfd = $.Deferred();
var jobQuery = "/AJAX/stencil_ICFPM.aspx?JobID=" + jobNo;

$("td#JQstencil").text("");
jQuery.ajax({
  url: jobQuery,
  beforeSend: function() { },
  success:function(data){
    if($(data).find("td.stencilNameT").text().length >0) $("td#JQstencilT").text($(data).find("td.stencilNameT").text() + " >> " + $(data).find(".stencilPartT").text());
    else $("td#JQstencilT").text("N/A");
    if($(data).find("td.stencilNameB").text().length >0) $("td#JQstencilB").text($(data).find("td.stencilNameB").text() + " >> " + $(data).find(".stencilPartB").text());
    else $("td#JQstencilB").text("N/A");
    dfd.resolve("");
  },
  fail:function(){
//    e2info = "<div>Failed to load data.Please try again later.</div>";
    //$("#JQstencil").append(e2info);
    dfd.resolve("");
  }
});

return dfd.promise();
}

function getE2jobcomments(jobNo){
var dfd = $.Deferred();
var jobQuery = "/AJAX/jcfjm.aspx?Job=" + jobNo;
var e2info = "E2 Job Comments <br /><br />";

$(".e2comment").text("");
jQuery.ajax({
  url: jobQuery,
  beforeSend: function() { },
  success:function(data){
    if($(data).find(".E2job_no").text().length > 0){
      $(data).find(".E2print_type").each(function(i){
        e2info += "<b>Comments-" + $(this).text() + "</b><br/>" + $(this).next().text().replace(/\|/g, "<br />") + "<br/><br/>";
      });
    }else { e2info = "<b>E2 Job Information</b><br />Job No. not found on EII"; }
    $("#JQe2Comment").append(e2info);
    dfd.resolve("");
  },
  fail:function(){
    e2info = "<div>Failed to load data.Please try again later.</div>";
    $("#JQe2Comment").append(e2info);
    dfd.resolve("");
  }
});

return dfd.promise();
} //End getE2jobcomments


function getRouting(jobNo){
 var routing=new Array();
 var routingQty = new Array();
 var routeName;
 var description;
 var jobQty;
 var bal;
 var targetDate;
 var commentSch;
 var schedulePS;
 var scheduleSS;
 var routeTable;

$("span#JQjobNo").html("<a href=javascript:getItem('" + jobNo + "','Master') class='jobNoLink'>" + jobNo + "</a>");

myQuery = "<Query><Where><Eq><FieldRef Name='Title' /><Value Type='Text'>" + jobNo + "</Value></Eq></Where></Query>";


$.when(getPEPrioritizationList(),getMasterJobList(),getSMTProgramSchedule(),getE2jobcomments(jobNo),getStencil(jobNo))
.done(function(){

  $("a.PWadapter").click(function(){
    pWadapter($(this).attr("routing"));
  });
  
  $("span#JQloader").hide();
});

function getPEPrioritizationList() {
var dfd = $.Deferred();
$().SPServices({
  operation: "GetListItems",
  async: true,
  listName: "PE Prioritization List",
  CAMLViewFields: "<ViewFields Properties = 'True' />",
  CAMLRowLimit: 1,
  CAMLQueryOptions: myQueryOptions,
  CAMLQuery: myQuery,
  completefunc: function (xData, Status) {
      if($(xData.responseXML).SPFilterNode("z:row").attr("ows_PE") != null){
        $("span#JQPE").text($(xData.responseXML).SPFilterNode("z:row").attr("ows_PE").substr(8));
      }
      $("span#JQassy").text($(xData.responseXML).SPFilterNode("z:row").attr("ows_Assy_x0023_"));
      for (i=1;i<=10;i++){
          routing[i] = $(xData.responseXML).SPFilterNode("z:row").attr("ows_Routing_x0020_"+i);
      }
      for (i=11;i<=26;i++){
          routing[i] = $(xData.responseXML).SPFilterNode("z:row").attr("ows_Route_x0020_"+i);
      }
      $.when(getOpenJobs()).done(function(){ dfd.resolve(""); });
  }
});
return dfd.promise();
}

function getOpenJobs(){
var dfd = $.Deferred();
$().SPServices({
  operation: "GetListItems",
  async: true,
  listName: "Open Jobs Progression",
  CAMLViewFields: "<ViewFields Properties = 'True' />",
  CAMLRowLimit: 1,
  CAMLQueryOptions: myQueryOptions,
  CAMLQuery: myQuery,
  completefunc: function (xData, Status) {
    if($(xData.responseXML).SPFilterNode("z:row").attr("ows_SO_x0020_Due") != null ){
      $("span#JQDescription").text($(xData.responseXML).SPFilterNode("z:row").attr("ows_Description"));
      jobQty = bal = parseInt($(xData.responseXML).SPFilterNode("z:row").attr("ows_Qty"));
      $("span#JQjobQty").text(jobQty);
      targetDate = $(xData.responseXML).SPFilterNode("z:row").attr("ows_SO_x0020_Due");
      targetDate = targetDate.substr(5,2) + "/" + targetDate.substr(8,2) + "/" + targetDate.substr(0,4);
      $("span#JQtargetDate").text(targetDate);
      for(i=1;i<=26;i++){
         switch (routing[i])
         {
            case "SMT Oper SS":
               routeName = "ows_SMT_x002d_Bot"; break;
            case "SMT Oper PS":
               routeName = "ows_SMT_x002d_Top"; break;
            case "SMT Insp":
               routeName = "ows_QC_x002d_SMT"; break;
            case "PTH Wave":
               routeName = "ows__x0032_nd_x002d_Solder"; break;
            case "PTH Insp Wave":
               routeName = "ows_QC_x002d_2nd"; break;
            case "PTH Select":
               routeName = "ows__x0032_nd_x002d_Mech"; break;
            case "PTH Insp Select":
               routeName = "ows_QC_x002d_Mech"; break;
            case "HS Oper 1":
               routeName = "ows_Test_x002d_1"; break;
            case "HS Oper 2":
               routeName = "ows__x0032_nd_x002d_Solder2"; break;
            case "HS Oper 3":
               routeName = "ows__x0032_nd_x002d_Solder3"; break;
            case "HS Insp 1":
               routeName = "ows_Test_x002d_2"; break;
            case "HS Insp 2":
               routeName = "ows_QC_x002d_Solder2"; break;
            case "HS Insp 3":
               routeName = "ows_QC_x002d_Solder3"; break;
            case "CC Oper 1":
               routeName = "ows__x0032_nd_x002d_Coat"; break;
            case "CC Insp 1":
               routeName = "ows_QC_x002d_Coat"; break;
            case "MECH Oper 1":
               routeName = "ows__x0032_nd_x002d_Mech1"; break;
            case "MECH Oper 2":
               routeName = "ows__x0032_nd_x002d_Mech2"; break;
            case "MECH Oper 3":
               routeName = "ows__x0032_nd_x002d_Mech3"; break;
            case "MECH Insp 1":
               routeName = "ows_QC_x002d_Mech1"; break;
            case "MECH Insp 2":
               routeName = "ows_QC_x002d_Mech2"; break;
            case "MECH Insp 3":
               routeName = "ows_QC_x002d_Mech3"; break;
            case "TEST Oper 1":
               routeName = "ows_Test_x002d_10"; break;
            case "TEST Oper 2":
               routeName = "ows_Test_x002d_20"; break;
            case "FINAL Insp":
               routeName = "ows_Final_x0020_QC"; break;
            case "PACK / SHIP":
               routeName = "ows_Pack";
               routing[i] = "PACK"; break;
            case "END":
               routeName = "ows_TSE";
               routing[i] = "SHIP";
               routing[i+1] = "SHIPPED"; break;
            case "SHIPPED":
               routeName = "ows_END";
               bal = parseInt(jobQty - parseInt($(xData.responseXML).SPFilterNode("z:row").attr(routeName))); break;
            default:
               routeName = "none";
            }
            $("span#JQbal").text(bal);
            if(bal == 0) {
              $("span#JQjobComplete").show();
              $("span#JQbal").removeClass("redBal");
            }
            
            if(routeName != "none"){
               routingQty[i] = parseInt($(xData.responseXML).SPFilterNode("z:row").attr(routeName));
            }else {
               routingQty[i] = "";
            }
          }
      }
      
      routeTable = "";

      for(i=1;i<=26;i++){
        if( routing[i] != "TBD" && routing[i] != null){
          routeTable = routeTable + "<tr><td><a href=javascript:getItem('" + jobNo + "','" + routing[i].replace(/\s+/g, '') + "')><img src='/javascripts/pictures/View.gif' alt='Edit page' style='border:none;'></a>&nbsp;&nbsp;"
                     + "<a href=# class='PWadapter' routing='" + routing[i] + "'>" + routing[i] + "</a></td><td>" + routingQty[i] + "</td></tr>";
          if(routing[i] == "SMT Oper SS") {
            routeTable += "<tr><td><font color='green'>&nbsp;&nbsp;Schedule SS:</font></td><td>" + scheduleSS + "</td></tr>";
          } else if (routing[i] == "SMT Oper PS") {
            routeTable += "<tr><td><font color='green'>&nbsp;&nbsp;Schedule PS:</font></td><td>" + schedulePS + "</td></tr>";
          }
        }
      }
      $("table#JQjobRoute").append(routeTable);

      dfd.resolve("");
  }
});
return dfd.promise();
}//End getOpenJobs, internal function

function getMasterJobList(){
var dfd = $.Deferred();
$().SPServices({
  operation: "GetListItems",
  async: true,
  listName: "Master Job List",
  CAMLViewFields: "<ViewFields Properties = 'True' />",
  CAMLRowLimit: 1,
  CAMLQueryOptions: myQueryOptions,
  CAMLQuery: myQuery,
  completefunc: function (xData, Status) {
    $(xData.responseXML).SPFilterNode("z:row").each(function() {
      $("span#JQscComment").html($(this).attr("ows_Comments_x002d_Job_x0020_Schedul"));
      $("td#JQpanel").text(parseInt($(this).attr("ows_Panel"),10));
      $("td#JQsmtSS").text(parseInt($(this).attr("ows_SMT_x002d_B"),10));
      $("td#JQsmtPS").text(parseInt($(this).attr("ows_SMT_x002d_T"),10));
      $("td#JQwaveComp").text(parseInt($(this).attr("ows_Wave_x0020_Parts"),10));
      $("td#JQwavePin").text(parseInt($(this).attr("ows_Wave_x0020_Pins"),10));
      $("td#JQhandPin").text(parseInt($(this).attr("ows_Hand_x0020_Pins"),10));
      $("td#JQmechItem").text(parseInt($(this).attr("ows_Mech_x0020_Items"),10));
      $("td#JQtestMin").text(parseInt($(this).attr("ows_Test_x0020_Mins"),10));
      $("td#JQcoat").text($(this).attr("ows_Conformal_x0020_Coat"));
    });
    dfd.resolve("");
  }
});
return dfd.promise();
}//End getMasterJobList, internal function

function getSMTProgramSchedule(){
var dfd = $.Deferred();
$().SPServices({
  operation: "GetListItems",
  async: true,
  listName: "SMT-Program Schedule",
  CAMLViewFields: "<ViewFields><FieldRef Name='Scheduled_x0020_Run_x0020_Date_x0' /><FieldRef Name='Scheduled_x0020_Run_x0020_Date_x' /></ViewFields>",
  CAMLRowLimit: 1,
  CAMLQueryOptions: myQueryOptions,
  CAMLQuery: myQuery,
  completefunc: function (xData, Status) {
    $(xData.responseXML).SPFilterNode("z:row").each(function() {
      schedulePS = $(this).attr("ows_Scheduled_x0020_Run_x0020_Date_x0");
      scheduleSS = $(this).attr("ows_Scheduled_x0020_Run_x0020_Date_x");
    });
    dfd.resolve("");
  }
});
return dfd.promise();
} //End getSMTProgramSchedule, internal function

};

function getItem(jobNo,listName){

var toList;
var listSite;
var returnSite;
var itemName;
var editFormName;
var toID;

itemName = jobNo;
editFormName = "EditForm2";

switch (listName)
{
  case "SMTOperSS":
    toList = "SMT-Placement Schedule"; listSite = "SMTPlacement%20Schedule"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FWebparts%2FSMT%2520Schedule%2Easpx"; itemName = jobNo + "-SS"; break;
  case "SMTOperPS":
    toList = "SMT-Placement Schedule"; listSite = "SMTPlacement%20Schedule"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FWebparts%2FSMT%2520Schedule%2Easpx"; itemName = jobNo + "-PS"; break;
  case "SMTInsp":
    toList = "SMT Inspection Schedule"; listSite = "QC-SMT%20Schedule"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FWebparts%2FQC%2520Schedule%2Easpx"; break;
  case "PTHWave":
    toList = "PTH Wave Schedule"; listSite = "2nd-Wave%20Schedule"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FWebparts%2FWave%2DSelect%2520Schedule%2Easpx"; break;
  case "PTHInspWave":
    toList = "PTH Wave Inspection Schedule"; listSite = "QC-Wave%20Schedule"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FWebparts%2FQC%2520Schedule%2Easpx"; break;
  case "PTHSelect":
    toList = "PTH Select Schedule"; listSite = "2nd-Select%20Schedule"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FWebparts%2FWave%2DSelect%2520Schedule%2Easpx"; break;
  case "PTHInspSelect":
    toList = "PTH Select Inspection Schedule"; listSite = "QC-Select%20Schedule"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FWebparts%2FQC%2520Schedule%2Easpx"; break;
  case "HSOper1":
    toList = "HS Operation 1 Schedule"; listSite = "2ndSolder1%20Schedule"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FWebparts%2FHandsolder%2520Schedule%2Easpx"; break;
  case "HSOper2":
    toList = "HS Operation 2 Schedule"; listSite = "2ndSolder2%20Schedule"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FWebparts%2FHandsolder%2520Schedule%2Easpx"; break;
  case "HSOper3":
    toList = "HS Operation 3 Schedule"; listSite = "2ndSolder3%20Schedule"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FWebparts%2FHandsolder%2520Schedule%2Easpx"; break;
  case "HSInsp1":
    toList = "HS Inspection 1 Schedule"; listSite = "QCSolder1%20Schedule"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FWebparts%2FQC%2520Schedule%2Easpx"; break;
  case "HSInsp2":
    toList = "HS Inspection 2 Schedule"; listSite = "QCSolder2%20Schedule"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FWebparts%2FQC%2520Schedule%2Easpx"; break;
  case "HSInsp3":
    toList = "HS Inspection 3 Schedule"; listSite = "QCSolder3%20Schedule"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FWebparts%2FQC%2520Schedule%2Easpx"; break;
  case "CCOper1":
    toList = "CC Operation 1 Schedule"; listSite = "2ndCoat%20Schedule"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FWebparts%2FMechanical%2520Schedule%2Easpx"; break;
  case "CCInsp1":
    toList = "CC Inspection 1 Schedule"; listSite = "QCCoat%20Schedule"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FWebparts%2FQC%2520Schedule%2Easpx"; break;
  case "MECHOper1":
    toList = "MECH Operation 1 Schedule"; listSite = "2ndMech1%20Schedule"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FWebparts%2FMechanical%2520Schedule%2Easpx"; break;
  case "MECHOper2":
    toList = "MECH Operation 2 Schedule"; listSite = "2ndMech2%20Schedule"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FWebparts%2FMechanical%2520Schedule%2Easpx"; break;
  case "MECHOper3":
    toList = "MECH Operation 3 Schedule"; listSite = "2ndMech3%20Schedule"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FWebparts%2FMechanical%2520Schedule%2Easpx"; break;
  case "MECHInsp1":
    toList = "MECH Inspection 1 Schedule"; listSite = "QCMech1%20Schedule"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FWebparts%2FQC%2520Schedule%2Easpx"; break;
  case "MECHInsp2":
    toList = "MECH Inspection 2 Schedule"; listSite = "QCMech2%20Schedule"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FWebparts%2FQC%2520Schedule%2Easpx"; break;
  case "MECHInsp3":
    toList = "MECH Inspection 3 Schedule"; listSite = "QCMech3%20Schedule"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FWebparts%2FQC%2520Schedule%2Easpx"; break;
  case "TESTOper1":
    toList = "TEST Operation 1 Schedule"; listSite = "Test1%20Schedule"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FWebparts%2FTest%2520Schedule%2Easpx"; break;
  case "TESTOper2":
    toList = "TEST Operation 2 Schedule"; listSite = "Test2%20Schedule"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FWebparts%2FTest%2520Schedule%2Easpx"; break;
  case "FINALInsp":
    toList = "Final Inspection Schedule"; listSite = "Final%20QC%20Schedule"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FWebparts%2FQC%2520Schedule%2Easpx"; break;
  case "PACK":
    toList = "Pack Schedule"; listSite = "Pack%20%20Ship%20Schedule"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FWebparts%2FPack%2DShip%2520Schedule%2Easpx"; editFormName = "EditForm3"; break;
  case "SHIP":
    toList = "Shipment Authorization"; listSite = "END%20Schedule"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FWebparts%2FPack%2DShip%2520Schedule%2Easpx"; break;
  case "SHIPPED":
    toList = "Shipment Authorization"; listSite = "END%20Schedule"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FWebparts%2FPack%2DShip%2520Schedule%2Easpx"; break;
  case "RoutingSteps":
    toList = "PE Prioritization List"; listSite = "PE%20Priority%20List1"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FLists%2FPE%2520Priority%2520List1%2FOpen%2520Jobs%2520by%2520PE%2Easpx"; editFormName = "DispForm"; break;
  case "Progression":
    toList = "Open Jobs Progression"; listSite = "Open%20Jobs%20List"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FLists%2FOpen%20Jobs%20List%2F"; editFormName = "DispForm"; break;
  case "Master":
    toList = "Master Job List"; listSite = "Master%20Job%20List"; returnSite = "http%3A%2F%2Fserver1%3A8086%2FLists%2FMaster%20Job%20List%2F"; editFormName = "DispForm"; break;
  default:
   toList = "error";
}

$().SPServices({
  operation: "GetListItems",
  async: true,
  listName: toList,
  CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='Title' /></ViewFields>",
  CAMLRowLimit: 1,
  CAMLQueryOptions: myQueryOptions,
  CAMLQuery: "<Query><Where><Eq><FieldRef Name='Title' /><Value Type='Text'>" + itemName + "</Value></Eq></Where></Query>",
  completefunc: function (xData, Status) {
    toID = $(xData.responseXML).SPFilterNode("z:row").attr("ows_ID");
    window.open("http://server1:8086/Lists/" + listSite + "/" + editFormName + ".aspx?ID=" + toID + "&Source=" + returnSite, '_newtab');
  }
});
}
