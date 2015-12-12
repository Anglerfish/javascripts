function SMTProgramEdit() {
$(document).ready(function(){
  $("head").append('<link href="http://server1:8086/javascripts/jquery-ui-1104/css/redmond/jquery-ui-1.10.4.custom.min.css" rel="stylesheet" type="text/css" />' +
                   '<link href="http://server1:8086/javascripts/SMT-Program Schedule-edit.css" rel="stylesheet" type="text/css" />' );
//Temporarily disabled while working on the codes
  //  $("TABLE.ms-siteaction").hide();
  
//Temporary button for testing ONLY  
  
  $("INPUT[ID$='diidIOSaveItem']").hide().parent().prepend("<input type='button' class='ms-ButtonHeightWidth loadSubmit' value='Submit'>");
  
  $("INPUT[ID$='diidIOGoBack']").parent().append("<input type='button' class='ms-ButtonHeightWidth testSubmit' value='Do Not Click!'>");
  
  $("input[id$='DateTimeFieldDate']").datepicker({inline:true});
//ckeditor for chrome/Firefox users
  if(!browseris.ie5up) $("textarea[id$='TextField']").attr("class","ckeditor");
  
  var originalVals = readFields();

//Change back when testing is complete
//  $("input.loadSubmit").click(function(){
  $("input.testSubmit").click(function(){
    loadSubmit(originalVals, readFields());
    //$("INPUT[ID$='diidIOSaveItem']:first").click();
  });
  
});
}

function loadSubmit(originalVals, changeVals) {
  var temp = compareFields(originalVals, changeVals);
  alert(temp);
  //alert(fieldInfo.Title);
  
  
};