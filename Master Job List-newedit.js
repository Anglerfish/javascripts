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
},1000);

//data initialization complete
var stopTimer;
var jobQuery = "http://server1:8086/AJAX/jcfjm.aspx?Job=" + jobNo;
loadajax(jobQuery);

$("input.forceUpdate").click(function(){
  var fup = confirm("This button will attempt to fix " + jobNo + " in PE Prioritization List and all production routing schedules.\nDO NOT USE THIS BUTTON UNLESS THE JOB IS NOT SHOWING UP.");
  
  if(fup == true) {
    var clearVal = {};
    for (var okey in originVal) {
      clearVal[okey] = "";
    }
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
    $("SELECT[title='Order Type']").val($(".E2order_type").text().replace(/ /g,""));
    if( $(".E2stores_code").text().replace(/ /g,"") == "MS"){
      $("SELECT[title='Job Type']").val("Stock-MS");
    }else if($(".E2job_type").text().replace(/ /g,"")=="S"){
      $("SELECT[title='Job Type']").val("Stock-FG");
    }else { $("SELECT[title='Job Type']").val("C - Customer Order");};
    $("INPUT[title='Job Qty']").attr("value",parseInt($(".E2job_qty").text(),10));
    $("INPUT[title='Exp Kit Ready Date']").attr("value",$(".E2exp_kit_ready_date").text());
    $("INPUT[title='Target Ship Date']").attr("value",$(".E2target_ship_date").text());
    //edit select field for customer
    $("SELECT[title='Customer'] option:selected").removeAttr("selected");
    var temp2 = $(".E2customer").text().toLowerCase().replace(/ /g,"");
    var temp1 = temp2.length;
    if(temp2.slice(temp1 - 3, temp1) == "rwk") temp1 -= 3 ;  
    temp2 = temp2.slice(0, temp1);
    $("SELECT[title='Customer'] option").filter(function(){
      if( this.value.toLowerCase().replace(/ /g,"").slice(0,temp1) == temp2 ) {
        temp2 = "";
        return true;
      } else return false;
    }).attr("selected","selected");
  }
});

});
}; // End MasterJobListEdit

function loadSubmit(originVal,saveSubmit){

if(!browseris.ie5up) { for(var i in CKEDITOR.instances) { CKEDITOR.instances[i].updateElement();} }
var changeVal = readFields();
var jobNo = changeVal.Title;
//  console.log(jobNo + "start");
if(jobNo != "TBD" && jobNo.indexOf("-Copy") < 0) {
    
  $("td#loadStatus").css("color","green").text("Loading");
  $("td#loadPEPL").css("color","green").text("PE Prioritization List - Updating");
  $("td#loadPPS").css("color","green").text("Router Process Steps - Updating");
  $("span#saveStatus").show();
  var changeFieldNames = changedFields(originVal,changeVal);
  var deferreds = [];
  
  deferreds.push(updatePEPL(changeFieldNames, changeVal));
  updatePPS(changeFieldNames, changeVal);
  
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
} else {
  $("INPUT[ID$='diidIOSaveItem']:first").click();
}

//internal function to compare changes to fields related to PE Prioritization List
  function updatePEPL(changeFieldNames, changeVal){
    var dfdPEPL = $.Deferred();
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

    $.when(getListID("PE Prioritization List", jobNo)).done(function(listID) {
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
      dfdPEPL.resolve();
    });

    return dfdPEPL.promise();
  } //End internal function updatePEPL

//internal function to compare changes to fields related to Production Process steps
  function updatePPS(changeFieldNames, changeVal) {
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
   
      for(var i=1;i<=27;i++){ deferreds.push(getRouterID(getEachRouterProp(i,changeVal),jobNo,changeVal.Qty)); }
      
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

function getRouterID(routerProp,jobNo,qty){
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

        if (jQtyIn > qty) {
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
/*  case "SMTOperSS":
    routePropVal.push("SMT-Placement Schedule"); break;
  case "SMTOperPS":
    routePropVal.push("SMT-Placement Schedule"); break;
*/
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
      if(temp1.length > 0){
        $("td#loadError").append("<p>" + listTitle + ":" + xData.responseText + "</p>");
      }
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
      if(temp1.length > 0){
        $("td#loadError").append("<p>" + listTitle + ":" + xData.responseText + "</p>");
      }
    }
    dfd.resolve();  
  }
});
return dfd.promise();
}//End updateListItem

function UserGuide(pageName) {
  $("body").append("<a id=userGuideIcon href='/User%20Guide/"+pageName+".aspx' target='_blank' title='User Guide on SharePoint'>HELP</a>");
  $("a#userGuideIcon").css({"position":"absolute",
    "right":"25px",
    "top":"110px",
    "font-family":"Arial, Helvetica, Sans-Serif",
    "text-decoration": "none",
    "font-size": "16px",
    "font-weight": "bold",
    "color":"#429ed7",
    "background":"white",
    "border":"3px #429ed7 solid",
    "padding":"5px, 8px"}).mouseover(function(){
      $(this).css({"color":"green","border-color":"green"});
    }).mouseleave(function(){
      $(this).css({"color":"#429ed7","border-color":"#429ed7"});
    });
}//End UserGuide