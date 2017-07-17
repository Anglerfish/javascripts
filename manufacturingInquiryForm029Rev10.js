var myQueryOptions = "<QueryOptions><ViewAttributes Scope='RecursiveAll' IncludeRootFolder='True' /></QueryOptions>";
var myQuery;
var loadData;
var validEntry = {};
var miFormID = String(window.location);
if( miFormID.indexOf("itemID") > 0) {
  miFormID = miFormID.slice(miFormID.lastIndexOf("itemID") + 7, miFormID.indexOf("&"));
  loadData = $.when(loadFormData(miFormID));
} else miFormID = "new";

$(document).ready(function(){

$("input.miQuoteNo").on("keyup change",function() {
  $(this).val().length <= 1?$(this).width(16):$(this).width($(this).val().length*16);
});

$("input#miDate").on("change",function(){
  if($(this).val().length == 0) {
    var now = new Date();
    now = (now.getMonth()<10?"0":"") + (now.getMonth() + 1) + "/" + (now.getDate()<10?"0":"") + now.getDate() + "/" + now.getFullYear();
    now = now.substr(0,6) + now.substr(8,2);
    $(this).val(now).css("color","black");
    validEntry[$(this).attr("id")] = true;
  } else if ($(this).val().length != 8){
    $(this).css("color","red");
    validEntry[$(this).attr("id")] = false;
    alert("Date format must be MM/DD/YY");
  } else {
    var tempDate = $(this).val();
    if($.isNumeric(tempDate.substr(0,2)) && $.isNumeric(tempDate.substr(3,2)) && $.isNumeric(tempDate.substr(6,2)) && tempDate.substr(2,1) == "/" && tempDate.substr(5,1) == "/"){
      $(this).css("color","black");
      validEntry[$(this).attr("id")] = true;
    } else {
      $(this).css("color","red");
      validEntry[$(this).attr("id")] = false;
      alert("Date format must be MM/DD/YY");
    }
  }
}).change();

forceNum($("input#miSMTUP"));
forceNum($("input#miSMTTopA"));
forceNum($("input#miSMTBotA"));
forceNum($("input#miSMTTopM"));
forceNum($("input#miSMTBotM"));
forceNum($("input#miSMTHandComp"));
forceNum($("input#miSMTHandPins"));
forceNum($("input#miTHWave"));
forceNum($("input#miTHWavePin"));
forceNum($("input#miTHHand"));
forceNum($("input#miTHHSPin"));
forceNum($("input#miTHCut"));
forceNum($("input#miTHForm"));
forceNum($("input#miMECHMins"));
forceNum($("input#miMechGeneric"));
forceNum($("input#miMechPressFit"));
forceNum($("input#miMechOther"));
forceNum($("input#miTestMin"));
$("input#miSMTTopA").on("keyup change",function(e){
  $("div#miSMTTopTotal").text(checkAndSum($("input#miSMTTopA").val(),$("input#miSMTTopM").val()));
  $("div#miSMTA").text(checkAndSum($("input#miSMTTopA").val(),$("input#miSMTBotA").val()));
  $("div#miSMT").text(checkAndSum($("div#miSMTA").text(),$("div#miSMTM").text()));
});
$("input#miSMTTopM").on("keyup change",function(){
  $("div#miSMTTopTotal").text(checkAndSum($("input#miSMTTopA").val(),$("input#miSMTTopM").val()));
  $("div#miSMTM").text(checkAndSum($("input#miSMTTopM").val(),$("input#miSMTBotM").val()));
  $("div#miSMT").text(checkAndSum($("div#miSMTA").text(),$("div#miSMTM").text()));
});
$("input#miSMTBotA").on("keyup change",function(){
  $("div#miSMTBotTotal").text(checkAndSum($("input#miSMTBotA").val(),$("input#miSMTBotM").val()));
  $("div#miSMTA").text(checkAndSum($("input#miSMTTopA").val(),$("input#miSMTBotA").val()));
  $("div#miSMT").text(checkAndSum($("div#miSMTA").text(),$("div#miSMTM").text()));
});
$("input#miSMTBotM").on("keyup change",function(){
  $("div#miSMTBotTotal").text(checkAndSum($("input#miSMTBotA").val(),$("input#miSMTBotM").val()));
  $("div#miSMTM").text(checkAndSum($("input#miSMTTopM").val(),$("input#miSMTBotM").val()));
  $("div#miSMT").text(checkAndSum($("div#miSMTA").text(),$("div#miSMTM").text()));
});
$("input#miSMTOtherDeviceInfo").change(function() {
  if($(this).val() != "") $("input#miSMTOtherDevice").prop("checked",true);
  else $("input#miSMTOtherDevice").prop("checked",false);
});
$("input#miTHWave,input#miTHHand").change(function(){
  $("div#miTH").text(checkAndSum($("input#miTHWave").val(),$("input#miTHHand").val()));
});
$("input#miMechGeneric,input#miMechPressFit, input#miMechOther").change(function(){
  $("div#miMechHard").text(checkAndSum($("input#miMechGeneric").val(),$("input#miMechPressFit").val(),$("input#miMechOther").val()));
});

$("body").append("<table id=MImenu><tbody><tr><td class=MIbutton><input id=MIsave type=button value=Save /></td></tr><tr><td class=MIbutton><input id=MIprint type=button value='Submit & Print' /></td></tr><tr><td class=MIbutton><input id=MIcopy type=button value='Save As New Quote' /></td></tr><tr><td class=MIsearchbox><input type=text id=MIsearch value='Search Quote' /></td></tr></tbody></table>");

$("input#MIsearch").focus(function() {
  if($(this).val() == "Search Quote") $(this).val("").css("color","black");
}).focusout(function(){
  if($(this).val().length == 0) $(this).val("Search Quote").css("color","gray");
});

$("input#MIsave").click(function() { saveFormData(miFormID,false); });
$("input#MIprint").click(function() { 
  saveFormData(miFormID,true);
});

connectFormData();

});

function connectFormData() {
if(typeof loadData != "undefined") {
  loadData.done(function(xData) {
    $("input.miQuoteNo").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_Title")).change();
    $("input#miCustomer").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_Customer"));
    $("input#miDescription").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_Description"));
    $("input#miAssyID").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_Dorigo_x0020_Assembly_x0020_ID"));
    $("input#miContacts").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_Contacts"));
    $("input#miCusAssyID").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_Customer_x0020_Assembly_x0020_ID"));
    $("input#miCusRev").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_Revision"));
    $("input#miDate").val(dateDecipher($(xData.responseXML).SPFilterNode("z:row").attr("ows_Date")));
    $("input#miPE").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_Process_x0020_Engineer"));
    $("input#miExpQty").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_Quote_x0020_Qty"));
    $("input#miJobType").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_Job_x0020_Type"));
    $("input#miPCBSize").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_PCB_x0020_Size"));
    $("input#miPCBThickness").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_PCB_x0020_Thickness"));
    $("input#miPanel").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_Boards_x0020_per_x0020_Panel"));
    $("input#miPCBLayers").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_Number_x0020_of_x0020_Layers"));
    $("select#miPCBFinish").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_PCB_x0020_Finish"));
    $("select#miLandSize").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_Smallest_x0020_Landpattern"));
    $("input#miPitch").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_Smallest_x0020_pitch"));
    $("input#miSMTUP").val(intConvert($(xData.responseXML).SPFilterNode("z:row").attr("ows_SMT_x0020_Unique_x0020_Parts")));
    $("input#miSMTTopA").val(intConvert($(xData.responseXML).SPFilterNode("z:row").attr("ows_SMT_x0020_Top_x0020_Auto"))).change();
    $("input#miSMTBotA").val(intConvert($(xData.responseXML).SPFilterNode("z:row").attr("ows_SMT_x0020_Bot_x0020_Auto"))).change();
    $("input#miSMTTopM").val(intConvert($(xData.responseXML).SPFilterNode("z:row").attr("ows_SMT_x0020_Top_x0020_Manual"))).change();
    $("input#miSMTBotM").val(intConvert($(xData.responseXML).SPFilterNode("z:row").attr("ows_SMT_x0020_Bot_x0020_Manual"))).change();
    $("input#miSMTHandComp").val(intConvert($(xData.responseXML).SPFilterNode("z:row").attr("ows_SMT_x0020_Hand")));
    $("input#miSMTHandPins").val(intConvert($(xData.responseXML).SPFilterNode("z:row").attr("ows_SMT_x0020_Hand_x0020_Pins")));
    $("select#miSMTprogram").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_SMT_x0020_Program"));
    $("select#miStencilNumber").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_SMT_x0020_Stencil"));
    $("select#miStencilTopSize").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_SMT_x0020_Top_x0020_Stencil_x002"));
    $("select#miStencilTop").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_SMT_x0020_Top_x0020_Stencil_x0020"));
    $("select#miStencilBotSize").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_SMT_x0020_Bot_x0020_Stencil_x002"));
    $("select#miStencilBot").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_SMT_x0020_Bot_x0020_Stencil_x0020"));
    $("input#miSMTBGA").prop("checked",text2checkBox($(xData.responseXML).SPFilterNode("z:row").attr("ows_SMT_x0020_Special"),"BGA"));
    $("input#miSMTLGA").prop("checked",text2checkBox($(xData.responseXML).SPFilterNode("z:row").attr("ows_SMT_x0020_Special"),"LGA"));
    $("input#miSMTLeadless").prop("checked",text2checkBox($(xData.responseXML).SPFilterNode("z:row").attr("ows_SMT_x0020_Special"),"Leadless"));
    $("input#miSMTModule").prop("checked",text2checkBox($(xData.responseXML).SPFilterNode("z:row").attr("ows_SMT_x0020_Special"),"Module"));
    $("input#miSMTOtherDeviceInfo").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_SMT_x0020_Others")).change();
    $("input#miTHWave").val(intConvert($(xData.responseXML).SPFilterNode("z:row").attr("ows_Wave_x0020_Solder_x0020_Parts")));
    $("input#miTHWavePin").val(intConvert($(xData.responseXML).SPFilterNode("z:row").attr("ows_Wave_x0020_Solder_x0020_Pins")));
    $("input#miTHHand").val(intConvert($(xData.responseXML).SPFilterNode("z:row").attr("ows_Hand_x0020_Solder_x0020_Parts"))).change();
    $("input#miTHHSPin").val(intConvert($(xData.responseXML).SPFilterNode("z:row").attr("ows_Hand_x0020_Solder_x0020_Pins")));
    $("input#miTHCut").val(intConvert($(xData.responseXML).SPFilterNode("z:row").attr("ows_Pin_x0020_Cutting_x0020_Parts")));
    $("input#miTHForm").val(intConvert($(xData.responseXML).SPFilterNode("z:row").attr("ows_TH_x0020_Component_x0020_Forming")));
    $("select#miTHSelectProgram").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_Selctive_x0020_Wave_x0020_Progra"));
    $("select#miTHWavePallet").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_Wave_x0020_Pallet"));
    $("input#miMECHMins").val(intConvert($(xData.responseXML).SPFilterNode("z:row").attr("ows_Mech_x0020_Estimated_x0020_Minut")));
    $("input#miMechGeneric").val(intConvert($(xData.responseXML).SPFilterNode("z:row").attr("ows_Mech_x0020_Generic")));
    $("input#miMechPressFit").val(intConvert($(xData.responseXML).SPFilterNode("z:row").attr("ows_Mech_x0020_Press_x0020_Fits")));
    $("input#miMechOther").val(intConvert($(xData.responseXML).SPFilterNode("z:row").attr("ows_Mech_x0020_Other"))).change();
    $("input#miTestMin").val(intConvert($(xData.responseXML).SPFilterNode("z:row").attr("ows_Test_x0020_Minutes")));
    $("select#miMod").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_Modification"));
    $("select#miCC").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_Conformal_x0020_Coating"));
    $("textarea#commentsPE").val($(xData.responseXML).SPFilterNode("z:row").attr("ows_Comments_x0020_from_x0020_PE")
        .replace(/<[^\>]*>/g,"").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&lt;/g,"<").replace(/&gt;/g,">"));
  });
  
}
  //Private function to convert SP date to normal date
  function dateDecipher(n) {
    if(typeof n != "undefined") {
      return n.substr(5,2) + "/" + n.substr(8,2) + "/" + n.substr(2,2);      
    } else {
      var now = new Date();
      now = (now.getMonth()<10?"0":"") + (now.getMonth() + 1) + "/" + (now.getDate()<10?"0":"") + now.getDate() + "/" + now.getFullYear();
      now = now.substr(0,6) + now.substr(8,2);
      return now;  
    }
  }//End dateDecipher
} //End connectFormData

function loadFormData(miFormID) {
var dfd = $.Deferred();
myQuery = "<Query><Where><Eq><FieldRef Name='ID' /><Value Type='Integer'>" + miFormID + "</Value></Eq></Where></Query>";

$().SPServices({
  operation: "GetListItems",
  async: true,
  listName: "Manufacturing Inquiry",
  CAMLViewFields: "<ViewFields Properties = 'True' />",
  CAMLRowLimit: 1,
  CAMLQueryOptions: myQueryOptions,
  CAMLQuery: myQuery,
  completefunc: function (xData, Status) {
    dfd.resolve(xData);
  }
});
  return dfd.promise();
}//End loadFormData

function saveFormData(miFormID,submit) {
var checkedValue = validCheck();
var updateQuery= [["Title", $("input.miQuoteNo").val()],
  ["Customer", $("input#miCustomer").val()],
  ["Description", $("input#miDescription").val()],
  ["Dorigo_x0020_Assembly_x0020_ID", $("input#miAssyID").val()],
  ["Contacts", $("input#miContacts").val()],
  ["Customer_x0020_Assembly_x0020_ID", $("input#miCusAssyID").val()],
  ["Revision", $("input#miCusRev").val()],
  ["Process_x0020_Engineer", $("input#miPE").val()],
  ["Quote_x0020_Qty", $("input#miExpQty").val()],
  ["Job_x0020_Type", $("input#miJobType").val()],
  ["PCB_x0020_Size", $("input#miPCBSize").val()],
  ["PCB_x0020_Thickness", $("input#miPCBThickness").val()],
  ["Boards_x0020_per_x0020_Panel", $("input#miPanel").val()],
  ["Number_x0020_of_x0020_Layers", $("input#miPCBLayers").val()],
  ["PCB_x0020_Finish", $("select#miPCBFinish").val()],
  ["Smallest_x0020_Landpattern", $("select#miLandSize").val()],
  ["Smallest_x0020_pitch", $("input#miPitch").val()],
  ["SMT_x0020_Unique_x0020_Parts", $("input#miSMTUP").val()],
  ["SMT_x0020_Top_x0020_Auto", $("input#miSMTTopA").val()],
  ["SMT_x0020_Bot_x0020_Auto", $("input#miSMTBotA").val()],
  ["SMT_x0020_Top_x0020_Manual", $("input#miSMTTopM").val()],
  ["SMT_x0020_Bot_x0020_Manual", $("input#miSMTBotM").val()],
  ["SMT_x0020_Hand", $("input#miSMTHandComp").val()],
  ["SMT_x0020_Hand_x0020_Pins", $("input#miSMTHandPins").val()],
  ["SMT_x0020_Program", $("select#miSMTprogram").val()],
  ["SMT_x0020_Stencil", $("select#miStencilNumber").val()],
  ["SMT_x0020_Top_x0020_Stencil_x002", $("select#miStencilTopSize").val()],
  ["SMT_x0020_Top_x0020_Stencil_x0020", $("select#miStencilTop").val()],
  ["SMT_x0020_Bot_x0020_Stencil_x002", $("select#miStencilBotSize").val()],
  ["SMT_x0020_Bot_x0020_Stencil_x0020", $("select#miStencilBot").val()],
  ["SMT_x0020_Special", ($("input#miSMTBGA").prop("checked")==true?"BGA ":"")+ 
  ($("input#miSMTLGA").prop("checked")==true?"LGA ":"") +
  ($("input#miSMTLeadless").prop("checked")==true?"Leadless ":"") +
  ($("input#miSMTModule").prop("checked")==true?"Module ":"")],
  ["SMT_x0020_Others", $("input#miSMTOtherDeviceInfo").val()],
  ["Wave_x0020_Solder_x0020_Parts", $("input#miTHWave").val()],
  ["Wave_x0020_Solder_x0020_Pins", $("input#miTHWavePin").val()],
  ["Hand_x0020_Solder_x0020_Parts", $("input#miTHHand").val()],
  ["Hand_x0020_Solder_x0020_Pins", $("input#miTHHSPin").val()],
  ["Pin_x0020_Cutting_x0020_Parts", $("input#miTHCut").val()],
  ["TH_x0020_Component_x0020_Forming", $("input#miTHForm").val()],
  ["Selctive_x0020_Wave_x0020_Progra", $("select#miTHSelectProgram").val()],
  ["Wave_x0020_Pallet", $("select#miTHWavePallet").val()],
  ["Mech_x0020_Estimated_x0020_Minut", $("input#miMECHMins").val()],
  ["Mech_x0020_Generic", $("input#miMechGeneric").val()],
  ["Mech_x0020_Press_x0020_Fits", $("input#miMechPressFit").val()],
  ["Mech_x0020_Other", $("input#miMechOther").val()],
  ["Test_x0020_Minutes", $("input#miTestMin").val()],
  ["Modification", $("select#miMod").val()],
  //["Conformal_x0020_Coating", $("select#miCC").val()]];
  ["Conformal_x0020_Coating", $("select#miCC").val()],
  ["Comments_x0020_from_x0020_PE", escapeHTML($("textarea#commentsPE").html().replace(/[\n]/g,'<br>'))]];

var dateCheck = true;
var numCheck = true;
if (checkedValue.length != 0) {
  for( var i = 0; i < checkedValue.length; i++){
    if(checkedValue[i] == "miDate") dateCheck = false;
    else numCheck = false;
  }
}

if(dateCheck == true) updateQuery.push(["Date", SPdateConverter($("input#miDate").val())]);
else updateQuery.push(["Date", ""]);
if(numCheck == true) {
  updateQuery.push(  ["SMT_x0020_Top", $("div#miSMTTopTotal").text()],
  ["SMT_x0020_Bot", $("div#miSMTBotTotal").text()],
  ["SMT_x0020_Auto", $("div#miSMTA").text()],
  ["SMT_x0020_Manual", $("div#miSMTM").text()],
  ["SMT_x0020_Placement_x0020_Total", $("div#miSMT").text()],
  ["TH_x0020_Total", $("div#miTH").text()],
  ["Mech_x0020_Hardware", $("div#miMechHard").text()]);
} else {
  updateQuery.push(  ["SMT_x0020_Top", ""],
  ["SMT_x0020_Bot", ""],
  ["SMT_x0020_Auto", ""],
  ["SMT_x0020_Manual", ""],
  ["SMT_x0020_Placement_x0020_Total", ""],
  ["TH_x0020_Total", ""],
  ["Mech_x0020_Hardware", ""]);
}

if(submit == true && checkedValue.length == 0) {//Add submit into push
}

if(miFormID != "new"){
  $().SPServices({
    operation: "UpdateListItems",
    async: true,
    batchCmd: "Update",
    ID: miFormID,
    listName: "Manufacturing Inquiry",
    valuepairs: updateQuery,
    completefunc: function(xData, Status) {
      if(submit == true && checkedValue.length != 0) alert("Manufacturing Inquiry Form NOT Submitted.\nError in one or more of your Entries. Data saved.");
      else if(submit == true && checkedValue.length == 0) alert("Manufacturing Inquiry Form saved and submitted");
      else alert("Manufacturing Inquiry Form saved");
    }
  });
} else {
  $().SPServices({
    operation: "UpdateListItems",
    async: true,
    batchCmd: "New",
    listName: "Manufacturing Inquiry",
    valuepairs: updateQuery,
    completefunc: function(xData, Status) {
      if(submit == true && checkedValue.length != 0) alert("New Manufacturing Inquiry Form NOT Submitted.\nError in one or more of your Entries. Data saved.");
      else if(submit == true && checkedValue.length == 0) alert("New Manufacturing Inquiry Form saved and submitted");
      else alert("New Manufacturing Inquiry Form created and saved");
    }
  });
}

  //Private function to convert date variable to Sharepoint date input. Remove date information
  function SPdateConverter( n ) {
    var SPdate = "";
    var d = new Date(n);
    if ( Object.prototype.toString.call(d) === "[object Date]" ) {
      if (!isNaN(d.getTime())) {
        d = d.setHours(d.getHours()- d.getTimezoneOffset()/60);
        d = new Date(d);
        if(d.getUTCFullYear() < 1980) {
          var todayDate = new Date();
          var tempYear = d.getUTCFullYear();
          while( tempYear > 100) {tempYear -= 100;}
          d.setUTCFullYear(parseInt((todayDate.getUTCFullYear()/100),10)*100 + tempYear);
        }
        SPdate = d.getUTCFullYear() + '-' +
        pad( d.getUTCMonth() +1 ) + '-' +
        pad( d.getUTCDate() ) + 'T' + 
        pad( d.getUTCHours() ) +':' + 
        pad( d.getUTCMinutes() )+':' + 
        pad( d.getUTCSeconds() )+'Z';
      }
    }
    function pad( n ) { return n < 10 ? '0' + n : n; }
    return SPdate;
  }; //End SPdateConverter
  
  //Private function to change string characters form multi-line text to SharePoint save-able text
  function escapeHTML(s) { return typeof(s) != "string"?"":s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

}//End saveFormData

function forceNum(inputL) {
var keynum;
var numCheck = /\d/;
inputL.on("keyup change",function(){
  if($.isNumeric(inputL.val())) {
    inputL.val(inputL.val().replace(/\s+/g,''));
    validEntry[inputL.attr("id")] = true;
    inputL.css("color","black");
  } else {
    if (inputL.val() == "") inputL.css("color","black");
    else inputL.css("color","red");  
    validEntry[inputL.attr("id")] = false;
  }
});
inputL.on("keypress",function(e) {
  if(window.event) keynum = e.keyCode; //IE8
  else if(e.which) keynum = e.which;// Netscape/Firefox/Opera
  return numCheck.test(String.fromCharCode(keynum));
});
}//End forceNum

function checkAndSum(a,b,c) {
var pc = typeof c == "undefined"?0:parseInt(c,10);
if($.isNumeric(a) && $.isNumeric(b)) return parseInt(a,10) + parseInt(b,10) + pc;
else return "Error";
} //End checkAndSum

function intConvert(num) {
  return $.isNumeric(num)?parseInt(num,10):"";
} //End intConvert

function text2checkBox (chkString,chkVal) {
  var chkStatus;
  if(typeof chkString != "undefined") chkStatus = chkString.indexOf(chkVal)==-1?false:true;
  else chkStatus = false;
return chkStatus;
} //End text2checkBox

function validCheck() {
  var temp1 = [];
  for(var temp2 in validEntry) if(validEntry[temp2] == false) temp1.push(temp2);
  return temp1;
} //End validCheck
