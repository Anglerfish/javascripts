var myQueryOptions = "<QueryOptions><ViewAttributes Scope='RecursiveAll' IncludeRootFolder='True' /></QueryOptions>";

function MasterJobListEdit(){
$(document).ready(function(){
if(browseris.ie5up) $("head").append('<link href="http://server1:8086/javascripts/jquery-ui-1104/css/redmond/jquery-ui-1.10.4.custom.min.css" rel="stylesheet" type="text/css" /><link href="http://server1:8086/javascripts/Master Job List-newedit.css" rel="stylesheet" type="text/css" />');
else $("head").append('<link href="/javascripts/jquery-ui-1104/css/redmond/jquery-ui-1.10.4.custom.min.css" rel="stylesheet" type="text/css" /><link href="/javascripts/Master Job List-newedit.css" rel="stylesheet" type="text/css" />');

$("body").append("<span id=saveStatus><table><tbody><tr><td id=loadStatus></td></tr><tr><td id=loadPEPL></td></tr><tr><td id=loadPPS></td></tr><tr><td id=loadError></td></tr></tbody></table></span>");
$("span#saveStatus").hide();
///////////////////////////////////////////////////BUTTON ENABLE/////////////////////////////////////////////////////////////////////
$("INPUT[ID$='diidIOSaveItem']").hide().parent().prepend("<input type='button' class='ms-ButtonHeightWidth loadSubmit' value='Submit'>");
$("INPUT[ID$='diidIOGoBack']").parent().append("<input type='button' class='forceUpdate ms-ButtonHeightWidth' value='Fix it!'>");

UserGuide("Master Job List-edit");

//ckeditor for chrome/Firefox users
if(!browseris.ie5up) {
  $("textarea[id$='TextField']").attr("class","ckeditor");
//  $.noConflict();
  $("input[id$='DateTimeFieldDate']").datepicker();
  for(var i in CKEDITOR.instances) { CKEDITOR.instances[i].updateElement();}
}

var typeTime = 1000; // Adjustable time for loading ajax after user jobNo input

var jobNo =  $("tr[id^='Title'] input").val();
var originVal;
setTimeout(function(){
//added 1 second delay because IE cannot get the comment box setup right after document ready
  originVal = readFields();
//  $("div.e2table").append(pingFields());
  if(originVal.Dorigo_x0020_Assy_x0023_ != "") {
    flagChecker(originVal.Dorigo_x0020_Assy_x0023_);
  }
},1000);

//data initialization complete
var stopTimer;
var jobQuery = "http://server1:8086/AJAX/jcfjm.aspx?Job=" + jobNo;
loadajax(jobQuery);

$("input.forceUpdate").click(function(){
  var fup = confirm("This button will attempt to fix " + jobNo + " in PE Prioritization List and all production routing schedules.\nDO NOT USE THIS BUTTON UNLESS THE JOB IS NOT SHOWING UP.");
  
  if(fup == true) {
    var clearVal = {};
    for (var okey in originVal) { clearVal[okey] = ""; }
////////////////////////////////////////ENABLE NO SAVE UPDATE///////////////////////////////////////////////////////////////////////////////////////
    loadSubmit(clearVal,true);
//    loadSubmit(clearVal,false);
  }
});
///////////////////////////////////////ENABLE SUBMIT BUTTON//////////////////////////////////////////////////////////////////////////////

$("input.loadSubmit").click(function(){
  loadSubmit(originVal,true);
}); //End click on save

$("INPUT[title='Job No.']").keyup(function(){
  clearTimeout(stopTimer);
  if($(this).val()){
    jobQuery = "http://server1:8086/AJAX/jcfjm.aspx?Job=" + $("INPUT[title='Job No.']").attr("value");
    $(".E2toSP").hide();
    $(".e2output").remove();
    stopTimer = setTimeout(function(){loadajax(jobQuery)}, typeTime);
  }
});

$(".E2toSP").mousedown(function(e){
  if(e.which==1){
    $("INPUT[title='Description']").attr("value",$(".E2description").text());
    $("INPUT[title='Cust Assy ID']").attr("value",$(".E2cust_assy_id").text());
    $("INPUT[title='Dorigo Assy ID']").attr("value",$(".E2dorigo_assy_id").text());
    $("SELECT[title='Order Type']").val($(".E2order_type").text().replace(/\s+/g,''));
    if( $(".E2stores_code").text().replace(/\s+/g,'') == "MS"){
      $("SELECT[title='Job Type']").val("Stock-MS");
    }else if($(".E2job_type").text().replace(/\s+/g,'')=="S"){
      $("SELECT[title='Job Type']").val("Stock-FG");
    }else { $("SELECT[title='Job Type']").val("C - Customer Order");};
    $("INPUT[title='Job Qty']").attr("value",parseInt($(".E2job_qty").text(),10));
    $("INPUT[title='Exp Kit Ready Date']").attr("value",$(".E2exp_kit_ready_date").text());
    $("INPUT[title='Target Ship Date']").attr("value",$(".E2target_ship_date").text());
    //edit select field for customer
    $("SELECT[title='Customer'] option:selected").removeAttr("selected");
    var temp2 = $(".E2customer").text().toLowerCase().replace(/\s+/g,'');
    var temp1 = temp2.length;
    if(temp2.slice(temp1 - 3, temp1) == "rwk") temp1 -= 3 ;  
    temp2 = temp2.slice(0, temp1);
    $("SELECT[title='Customer'] option").filter(function(){
      if( this.value.toLowerCase().replace(/\s+/g,'').slice(0,temp1) == temp2 ) {
        temp2 = "";
        return true;
      } else return false;
    }).attr("selected","selected");
    flagChecker($(".E2dorigo_assy_id").text());
  }
});

});

$("input[title='Dorigo Assy ID']").focusout(function(){
  $(this).val($(this).val().replace(/\s+/g,''));
  flagChecker($(this).val());
});

}; // End MasterJobListEdit

function loadSubmit(originVal,saveSubmit){
if(!browseris.ie5up) { for(var i in CKEDITOR.instances) { CKEDITOR.instances[i].updateElement();} }
var changeVal = readFields();

//  console.log(jobNo + "start");

if(changeVal != "error") {
var jobNo = changeVal.Title;


if(jobNo != "TBD" && jobNo.indexOf("-Copy") < 0) {
    
  $("td#loadStatus").css("color","green").text("Loading");
  $("td#loadPEPL").css("color","green").text("PE Prioritization List - Updating");
  $("td#loadPPS").css("color","green").text("Router Process Steps - Updating");
  $("span#saveStatus").show();
  var changeFieldNames = changedFields(originVal,changeVal);
  var deferreds = [];
  var PEPLid;
  var PEPLr1;

  $().SPServices({
    operation: "GetListItems",
    async: true,
    listName: "PE Prioritization List",
    CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='Routing_x0020_1' /></ViewFields>",
    CAMLRowLimit: 1,
    CAMLQueryOptions: myQueryOptions,
    CAMLQuery: "<Query><Where><Eq><FieldRef Name='Title' /><Value Type='Text'>" + jobNo + "</Value></Eq></Where></Query>",
    completefunc: function (xData, Status) {
      PEPLid = $(xData.responseXML).SPFilterNode("z:row").attr("ows_ID");
      updatePEPL(PEPLid, changeFieldNames, changeVal);
      updateMAL(changeVal.Dorigo_x0020_Assy_x0023_,changeVal.Description);
      
      if (typeof(PEPLid) != "undefined") {
        PEPLr1 = $(xData.responseXML).SPFilterNode("z:row").attr("ows_Routing_x0020_1");
        updatePPS(PEPLr1,changeFieldNames,changeVal);
      }
      
      $.when.apply($,deferreds).done(function(){
        setTimeout(function(){
          if($("td#loadError").text() != "") {
            $("td#loadStatus").text("ERROR! STOP AND CALL KAI");
          } else {
            $("td#loadStatus").css("color","black").text("Complete");
            setTimeout(function(){
              $("span#saveStatus").hide();
                if(saveSubmit == true) {
                  $("INPUT[ID$='diidIOSaveItem']:first").click();
                }
            },1000);
          }
        },2000);
      });

      }
    });
} else {
  if(saveSubmit == true) { $("INPUT[ID$='diidIOSaveItem']:first").click();}
}

} else {
  alert("Error in one of the date fields");
}

//internal function to update Master Assembly List if ncessary
function updateMAL(assyID,description){
  $.when(getListID("Master Assembly List",assyID)).done(function(listID) {
    var pairVal = [["Description", description]];
    if($.isNumeric(listID)) {
      deferreds.push(updateListItem("Master Assembly List", listID, pairVal));
    } else {
      deferreds.push(createListItem("Master Assembly List", assyID, pairVal));
    }
  });
}//End internal function updateMAL

//internal function to compare changes to fields related to PE Prioritization List
  function updatePEPL(listID, changeFieldNames, changeVal){
    var updateQuery = new Array();
    var temp1 = false;

    updateQuery = [["Assy_x0023_", changeVal.Dorigo_x0020_Assy_x0023_],
          ["Customer", changeVal.Customer],
          ["Orange", changeVal.Orange],
          ["SMT_x002d_SS", changeVal.SMT_x002d_B],
          ["SMT_x002d_PS", changeVal.SMT_x002d_T],
          ["Wave_x002e_", changeVal.Wave_x0020_Parts],
          ["HS_x0020_Oper_x0020_1_x0020_Pins", changeVal.Hand_x0020_Pins],
          ["Mech_x0020_Oper_x0020_1", changeVal.Mech_x0020_Items],
          ["Test_x002d_1", changeVal.Test_x0020_Mins],
          ["Comments_x002d_OPS", changeVal.Comments_x002d_Job_x0020_Schedul],
          ["Comments_x002d_Master", changeVal.Comments_x002d_PE],
          ["Comments_x002d_Orange",changeVal.Comments_x002d_Orange]];
    if(changeVal.T_x002f_CONS == "CON" || changeVal.T_x002f_CONS == "CTK") updateQuery.push(["Kit_x0020_Up", changeVal.Exp_x0020_Kit_x0020_Date]);

    for(var temp in changeFieldNames) {
      if($.inArray(changeFieldNames[temp],["Dorigo_x0020_Assy_x0023_","Customer","Orange","SMT_x002d_B","SMT_x002d_T","Wave_x0020_Parts","Hand_x0020_Pins","Mech_x0020_Items","Test_x0020_Mins","Comments_x002d_Job_x0020_Schedul","Comments_x002d_PE","Comments_x002d_Orange","Exp_x0020_Kit_x0020_Date"])>-1){
        temp1 = true;
      }
    }

    if (typeof(listID) != "undefined") {
      if( temp1 == true ){
        deferreds.push(updateListItem("PE Prioritization List", listID, updateQuery));
        $("td#loadPEPL").text("PE Prioritization List Update");
      } else { $("td#loadPEPL").text("PE Prioritization List - No Change"); }
    } else {
      deferreds.push(createListItem("PE Prioritization List", jobNo, updateQuery));
      $("td#loadPEPL").text("PE prioritization List created");
    }

  } //End internal function updatePEPL

//internal function to compare changes to fields related to Production Process steps
  function updatePPS(PEPLr1, changeFieldNames, changeVal) {
    var temp1 = false;
    for(var temp in changeFieldNames) {
      if($.inArray(changeFieldNames[temp],["Dorigo_x0020_Assy_x0023_","Customer","Description","Qty","SO_x0020_Due","Job_x0020_Type","Comments_x002d_Pack_x002e_Ship"])>-1){
        temp1 = true;
      }
    }
    
    if(temp1 == true) {
//   This is for getting only getEachRouterProp results. Can delete later.
//      var tempA = "";
//      for(var i=27;i<=27;i++){
//        var routeProp = getEachRouterProp(i,changeVal);
//        $.when(getListID(routeProp[0],jobNo).done(function(listID) {
//          tempA += listID + " ";
//        });
//        tempA += routeProp + ":::";
//      }
//      $("td#loadPPS").text(tempA);

      $.when(getListID("SMT-Program Schedule",jobNo)).done(function(listID) {
        if($.isNumeric(listID)) {
          var pairVal = [["Dorigo_x0020_Assy_x0023_", changeVal.Dorigo_x0020_Assy_x0023_],
                         ["Customer", changeVal.Customer],
                         ["Qty", changeVal.Qty],
                         ["Description", changeVal.Description],
                         ["T_x002f_CONS", changeVal.T_x002f_CONS],
                         ["Orange", changeVal.Orange],
                         ["Last_x0020_Job_x0020_No_x002e__x", changeVal.Last_x0020_Job_x0020_No_x002e__x],
                         ["SO_x0020_Due", changeVal.SO_x0020_Due]];
          deferreds.push(updateListItem("SMT-Program Schedule", listID, pairVal));
        }; 
      });
      
      
      var r1Prop = code2List(PEPLr1);
      for(var i=1;i<=27;i++){ deferreds.push(getRouterID(getEachRouterProp(i,changeVal),r1Prop,jobNo,changeVal.Qty)); }
      
      $("td#loadPPS").text("Production Process Steps update");
    } else { 
      $("td#loadPPS").text("Production Process Steps - No Change"); 
    }
  } //End internal function updatePPS  
}//End loadSubmit Function

function loadajax(jobQuery){
var e2info = "<table class=e2output><tr><th>E2 Job Information</th><th></th></tr>";
jQuery.ajax({
  url: jobQuery,
  beforeSend: function() { $(".loading").show(); },
  success:function(data){
    if($(data).find(".E2job_no").text().length > 0){
      e2info += "<tr><td>Job No. </td><td class=E2job_no>" + $(data).find(".E2job_no").text() + "</td></tr>";
      e2info += "<tr><td>Quote No. </td><td></td></tr>";
      e2info += "<tr><td>Customer </td><td class=E2customer>" + $(data).find(".E2customer").text().trim() + "</td></tr>";
      e2info += "<tr><td>Description </td><td class=E2description>" + $(data).find(".E2description").text().trim() + "</td></tr>";
      e2info += "<tr><td>Cust Assy ID </td><td class=E2cust_assy_id>" + $(data).find(".E2cust_assy_id").text().trim() + "</td></tr>";
      e2info += "<tr><td>Dorigo Assy ID </td><td class=E2dorigo_assy_id>" + $(data).find(".E2dorigo_assy_id").text().trim() + "</td></tr>";
      e2info += "<tr><td>Last Job(Qty) </td><td></td></tr>";
      e2info += "<tr><td>Order Type </td><td class=E2order_type>" + $(data).find(".E2order_type").text() + "</td></tr>";
      e2info += "<tr><td>Job Type </td><td class=E2job_type>" + $(data).find(".E2job_type").text() + "</td></tr>";
      e2info += "<tr><td>Stores Code </td><td class=E2stores_code>" + $(data).find(".E2stores_code").text() + "</td></tr>";
      e2info += "<tr><td>Job Qty </td><td class=E2job_qty>" + parseInt($(data).find(".E2job_qty").text().replace(/\,/g,""),10) + "</td></tr>";
      var temp = $(data).find(".E2exp_kit_ready_date").text();
      temp = temp.substr(5,2)+"/"+temp.substr(8,2)+"/"+temp.substr(0,4);
      e2info += "<tr><td>Exp Kit Ready </td><td class=E2exp_kit_ready_date>" + temp + "</td></tr>";
      temp = $(data).find(".E2target_ship_date").text();
      temp = temp.substr(5,2)+"/"+temp.substr(8,2)+"/"+temp.substr(0,4);
      e2info += "<tr><td>Target Ship Date </td><td class=E2target_ship_date>" + temp + "</td></tr>";
      $(data).find(".E2print_type").each(function(i){
        e2info += "<tr valign=top><td>Comments-" + $(this).text() + "</td><td class=E2comments" + i + ">" + $(this).next().text().replace(/\|/g, "<br />") + "</td></tr>";
      });
      e2info += "</table>";
    }else {
      e2info = "<div class=e2output><b>E2 Job Information</b><br />Job No. not found on EII</div>";
    }
    
    $(".e2table").append(e2info);
    $(".loading").hide();
    $(".E2toSP").show();
  },
  fail:function(){
    e2info = "<div>Failed to load data.Please try again later.</div>";
    $(".e2table").append(e2info);
    $(".loading").hide();
  }
});
}; //End loadajax

function getRouterID(routerProp,r1Prop,jobNo,qty){
var dfd = $.Deferred();

var myQuery = "<Query><Where><Eq><FieldRef Name='Title' /><Value Type='Text'>" + jobNo + "</Value></Eq></Where></Query>";

$().SPServices({
  operation: "GetListItems",
  async: true,
  listName: routerProp[0],
  CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='Qty_x0020_In' /><FieldRef Name='Qty_x0020_Compl' /></ViewFields>",
  CAMLRowLimit: 1,
  CAMLQueryOptions: myQueryOptions,
  CAMLQuery: myQuery,
  completefunc: function (xData, Status) {
    var listID = $(xData.responseXML).SPFilterNode("z:row").attr("ows_ID");
    if(typeof(listID) != "undefined"){
      if(listID.length > 0) {
        var jQtyIn = parseInt($(xData.responseXML).SPFilterNode("z:row").attr("ows_Qty_x0020_In"),10);
        var jQtyCompl = parseInt($(xData.responseXML).SPFilterNode("z:row").attr("ows_Qty_x0020_Compl"),10);

        if (jQtyIn > qty || r1Prop == routerProp[0]) {
          routerProp.push(["Qty_x0020_In",qty]);
          if(jQtyCompl > qty) {
            routerProp.push(["Qty_x0020_Compl",qty]);
            routerProp.push(["Qty_x0020_Left_x002e_",0]);
          } else routerProp.push(["Qty_x0020_Left_x002e_",(jQtyIn - jQtyCompl)]);
        }
        
        dfd.resolve(updateListItem(routerProp[0], listID, routerProp.slice(1)));
      } else dfd.resolve();
    } else dfd.resolve();
  }
});
return dfd.promise();
};//End getRouterID function

function getEachRouterProp(num,jobVal){

var routePropVal = new Array();
switch (num)
{
  case 1: routePropVal.push("SMT Operation PS Schedule"); break;
  case 2: routePropVal.push("SMT Operation SS Schedule"); break;
  case 3: routePropVal.push("SMT Inspection Schedule"); break;
  case 4: routePropVal.push("PTH Wave Schedule"); break;
  case 5: routePropVal.push("PTH Wave Inspection Schedule"); break;
  case 6: routePropVal.push("PTH Select Schedule"); break;
  case 7: routePropVal.push("PTH Select Inspection Schedule"); break;
  case 8: routePropVal.push("HS Operation 1 Schedule"); break;
  case 9: routePropVal.push("HS Operation 2 Schedule"); break;
  case 10: routePropVal.push("HS Operation 3 Schedule"); break;
  case 11: routePropVal.push("HS Inspection 1 Schedule"); break;
  case 12: routePropVal.push("HS Inspection 2 Schedule"); break;
  case 13: routePropVal.push("HS Inspection 3 Schedule"); break;
  case 14: routePropVal.push("CC Operation 1 Schedule"); break;
  case 15: routePropVal.push("CC Inspection 1 Schedule"); break;
  case 16: routePropVal.push("MECH Operation 1 Schedule"); break;
  case 17: routePropVal.push("MECH Operation 2 Schedule"); break;
  case 18: routePropVal.push("MECH Operation 3 Schedule"); break;
  case 19: routePropVal.push("MECH Inspection 1 Schedule"); break;
  case 20: routePropVal.push("MECH Inspection 2 Schedule"); break;
  case 21: routePropVal.push("MECH Inspection 3 Schedule"); break;
  case 22: routePropVal.push("TEST Operation 1 Schedule"); break;
  case 23: routePropVal.push("TEST Operation 2 Schedule"); break;
  case 24: routePropVal.push("Final Inspection Schedule"); break;
  case 25: routePropVal.push("Pack Schedule"); break;
  case 26: routePropVal.push("Shipment Authorization");
           routePropVal.push(["Dorigo_x0020_Assy_x0020_ID",jobVal.Dorigo_x0020_Assy_x0023_]);
           routePropVal.push(["Target_x0020_Ship_x0020_Date",jobVal.SO_x0020_Due]);
           routePropVal.push(["Stock_x003f_",jobVal.Job_x0020_Type]);
           routePropVal.push(["Comments_x002d_Pack_x002e_Ship",jobVal.Comments_x002d_Pack_x002e_Ship]);
           break;
  case 27: routePropVal.push("Open Jobs Progression");
           routePropVal.push(["Dorigo_x0020_Assy_x0020_ID",jobVal.Dorigo_x0020_Assy_x0023_]);
           break;
  default: routePropVal.push("error");
}

routePropVal.push(["Customer", jobVal.Customer]);
routePropVal.push(["Qty",jobVal.Qty]);
if(num != 26) {
  routePropVal.push(['Description', jobVal.Description]);
  routePropVal.push(["SO_x0020_Due",jobVal.SO_x0020_Due]);
}
if(num != 26 && num != 27) routePropVal.push(["Dorigo_x0020_Assy_x0023_",jobVal.Dorigo_x0020_Assy_x0023_]);

return routePropVal;
}; //End getEachRouterProp

function getListID(listName, jobNo) {
var dfd = $.Deferred();
$().SPServices({
  operation: "GetListItems",
  async: true,
  listName: listName,
  CAMLViewFields: "<ViewFields><FieldRef Name='ID' /></ViewFields>",
  CAMLRowLimit: 1,
  CAMLQueryOptions: myQueryOptions,
    CAMLQuery: "<Query><Where><Eq><FieldRef Name='Title' /><Value Type='Text'>" + jobNo + "</Value></Eq></Where></Query>",
    completefunc: function (xData, Status) {
      dfd.resolve($(xData.responseXML).SPFilterNode("z:row").attr("ows_ID"));
    }
});
return dfd.promise();
} // End getListID

//Create a List Item
function createListItem(listTitle, jobNo, pairVal) {
var dfd = $.Deferred();
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
      if(temp1.length > 0) $("td#loadError").append("<p>" + listTitle + ":" + xData.responseText + "</p>");
    }
    dfd.resolve();  
  }
});
return dfd.promise();
} //End createListItem

//Update a List Item
function updateListItem(listTitle, listID, pairVal) {
var dfd = $.Deferred();
$().SPServices({
  operation: "UpdateListItems",
  async: true,
  batchCmd: "Update",
  ID: listID,
  listName: listTitle,
  valuepairs: pairVal,
  completefunc: function(xData, Status) { 
    var temp1 = $(xData.responseXML).SPFilterNode("ErrorText").text();
    if( typeof(temp1) != "undefined") {
      if(temp1.length > 0) $("td#loadError").append("<p>" + listTitle + ":" + xData.responseText + "</p>");
    }
    dfd.resolve();  
  }
});
return dfd.promise();
}//End updateListItem

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
  
function flagChecker(assyID){
  if(typeof assyID != "undefined") {
    assyID = assyID.replace(/\s+/g,'');
  }
  var tempChecker = $("table#flagChecker").attr("title1");
  if(tempChecker != assyID) {
    $("table#flagChecker").remove();
    $("body").append("<table id=flagChecker title=" + assyID + " style=''><tbody><tr><td id=flagCheckerTitle colspan=2 ><span id=flagMinimizer>v</span>&nbsp;Flags for " + assyID + "</td></tr><tr><td class=flagTitle>Engineering Flag</td><td class=flagTitle>Operation Flag</td></tr><tr>" +
                     "<td id=engFlagText class=flagText>&nbsp;</td>" +
                     "<td id=opFlagText class=flagText>&nbsp;</td>" +
                     "</tr></tbody></table>");
    $("table#flagChecker").css("bottom", (0 - $(window).scrollTop()) + "px").css("left",$(window).scrollLeft() + "px");
    $(window).on("load resize scroll", function(){
      $("table#flagChecker").css("bottom", (0 - $(window).scrollTop()) + "px").css("left",$(window).scrollLeft() + "px");
    });

    $("span#flagMinimizer").click(function(){
      if($(this).text() == "v") {
        $(this).text("^");
        $("td.flagText, td.flagTitle").hide();
        if(($("td#engFlagText").text().replace(/\s+/g,'').length + $("td#opFlagText").text().replace(/\s+/g,'').length)== 0) {
          $("table#flagChecker").css("background-color","green");
          $(this).css("background-color","green");
        } else $("table#flagChecker").css("background-color","red");
      } else {
        $(this).text("v").css("background-color","red");
        $("td.flagText, td.flagTitle").show();
        $("table#flagChecker").css("background-color","red");
      }
    });
    
    $().SPServices({
      operation: "GetListItems",
      async: true,
      listName: "Master Assembly List",
      CAMLViewFields: "<ViewFields><FieldRef Name='Engineering_x0020_Flag' /></ViewFields>",
      CAMLRowLimit: 1,
      CAMLQueryOptions: myQueryOptions,
      CAMLQuery: "<Query><Where><Eq><FieldRef Name='Title' /><Value Type='Text'>" + assyID + "</Value></Eq></Where></Query>",
      completefunc: function (xData, Status) {
        if($(xData.responseXML).SPFilterNode("rs:data").attr("ItemCount") == 0) {
          $("td#flagCheckerTitle").text("ASSEMBLY ID NOT FOUND");
          $("table#flagChecker").css("background-color","orange");
          $("td.flagText, td.flagTitle").hide();
        } else {
          $("td#engFlagText").html($(xData.responseXML).SPFilterNode("z:row").attr("ows_Engineering_x0020_Flag"));
          $("td#opFlagText").html($(xData.responseXML).SPFilterNode("z:row").attr("ows_Operations_x0020_Flag"));
          if(($("td#engFlagText").text().replace(/\s+/g,'').length + $("td#opFlagText").text().replace(/\s+/g,'').length)== 0) {
            $("span#flagMinimizer").click();
          } else {
            unicornAttack(5);
          }

        }

      }
    });
  }    
} //End flagChecker

function unicornAttack(unicornNumTotal) {
  var unicornLeft =[];
  var unicornFin = [];
  var uSpeed = [];
  for (var unicornNum = 0; unicornNum < unicornNumTotal; unicornNum++) {
    $("body").append("<img id='unicorn" + unicornNum + "L' alt='Woof!' src='/images/giphyLeft.gif' style='position:absolute; top:100%; left:2000px; height: 100px; display:none;'/><img id='unicorn" + unicornNum + "R' alt='Woof!' src='/images/giphyRight.gif' style='position:absolute; top:100%; left:2000px; height: 100px; display:none;'/>");
    $("img#unicorn" + unicornNum + "L").css("position","absolute");
    $("img#unicorn" + unicornNum + "R").css("position","absolute");
    unicornLeft[unicornNum] = $(window).width()*Math.random();
    unicornFin[unicornNum] = $(window).width()-150;
    uSpeed[unicornNum] = Math.random()*30;
  };
  setInterval(function() {
    for(var unicornNum = 0; unicornNum < unicornNumTotal; unicornNum++) {
      if((unicornFin[unicornNum]-unicornLeft[unicornNum]) > 0 ) {
        $("img#unicorn" + unicornNum + "L").hide();
        $("img#unicorn" + unicornNum + "R").css({"top": $("table#flagChecker").position().top - 100,"left": unicornLeft[unicornNum]}).show();
        unicornFin[unicornNum] = $(window).width()-150;
        unicornLeft[unicornNum] += uSpeed[unicornNum];
      } else if((unicornFin[unicornNum]-unicornLeft[unicornNum]) < 0 ){
        $("img#unicorn" + unicornNum + "R").hide();
        $("img#unicorn" + unicornNum + "L").css({"top": $("table#flagChecker").position().top - 100,"left": unicornLeft[unicornNum]}).show();
        unicornLeft[unicornNum] -= uSpeed[unicornNum];
        unicornFin[unicornNum] = 0;
      } else {
        unicornFin[unicornNum] = 0;
      }
      if((unicornFin[unicornNum] - unicornLeft[unicornNum]) >= 30) uSpeed[unicornNum] = Math.random()*30;
    }
  },100);
}