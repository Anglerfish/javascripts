function commentBox() {
$(document).ready(function(){
  $("head").append('<link href="http://server1:8086/javascripts/jquery-ui-1104/css/redmond/jquery-ui-1.10.4.custom.min.css" rel="stylesheet" type="text/css" />' +
                   '<link href="http://server1:8086/javascripts/SMT-Program Schedule-edit.css" rel="stylesheet" type="text/css" />' );
  $("TABLE.ms-siteaction").hide();
  
  $("input[id$='DateTimeFieldDate']").datepicker({inline:true});
//ckeditor for chrome/Firefox users
  if(!browseris.ie5up) {
    $("textarea[id$='TextField']").attr("class","ckeditor");
  }
});
}