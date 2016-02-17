var myQueryOptions = "<QueryOptions><ViewAttributes Scope='RecursiveAll' IncludeRootFolder='True' /></QueryOptions>";

function HSCount(){
$(document).ready(function(){

  $("input#HSstart, input#HSend").keydown(function(e){
    if(e.keyCode == 13){
      var hsstart = SPdateConverter($("input#HSstart").val());
      var hsend = SPdateConverter($("input#HSend").val());
      
      if(hsstart == "" || hsend == ""){
        alert("Error with date entry. Please check your entry and try again");
      } else {
        exeHSCount(hsstart,hsend);
      }
    }
  });
    
});

}

function exeHSCount(hsstart,hsend) {  
//  var myQuery = '<Query><Where><And><And><Leq><FieldRef Name="Action_x0020_Date_x002e_" /><Value Type="DateTime">2016-01-31T00:00:00Z</Value></Leq><Geq><FieldRef Name="Action_x0020_Date_x002e_" /><Value Type="DateTime">2016-01-01T00:00:00Z</Value></Geq></And><Eq><FieldRef Name="From_x0020_Proc" /><Value Type="Text">HS Oper 1</Value></Eq></And></Where></Query>';
  var myQuery = '<Query><Where><And><And><Leq><FieldRef Name="Action_x0020_Date_x002e_" /><Value Type="DateTime">' + hsend + '</Value></Leq><Geq><FieldRef Name="Action_x0020_Date_x002e_" /><Value Type="DateTime">' + hsstart + '</Value></Geq></And><Eq><FieldRef Name="From_x0020_Proc" /><Value Type="Text">HS Oper 1</Value></Eq></And></Where></Query>';
  var countTable = "<table id='hsCountTable'><tbody><tr><th>Job No</th><th>Qty Moved</th><th>Pin count</th><th>Subtotal</th></tr>";
  var queryValues = new Array();
  var temp1;
  var temp2;

  $("div#HSCount").html("");
  
  $().SPServices({
    operation: "GetListItems",
    async: true,
    listName: "Board Movement Report",
    CAMLViewFields: "<ViewFields><FieldRef Name='Action_x0020_Date_x002e_' /><FieldRef Name='Qty_x0020_Moved' /><FieldRef Name='Title' /></ViewFields>",
    CAMLRowLimit: 5000,
    CAMLQueryOptions: myQueryOptions,
    CAMLQuery: myQuery,
    completefunc: function (xData, Status) {
      //alert(Status);
      $(xData.responseXML).SPFilterNode("z:row").each(function(){
        countTable += "<tr class=" + $(this).attr("ows_Title") + "><td>" + $(this).attr("ows_Title") + "</td>";
        countTable += "<td class=qtyMoved>" + parseInt($(this).attr("ows_Qty_x0020_Moved"),10) + "</td></tr>";
        queryValues.push($(this).attr("ows_Title"));
      });
      
      countTable += "</tbody></table>";
      $("div#HSCount").append(countTable);
      //$("div#HSCount").append(queryString("Title",queryValues));
      
      var queryHSOp = queryString("Title",queryValues);
      $().SPServices({
        operation: "GetListItems",
        async: true,
        listName: "HS Operation 1 Schedule",
        CAMLViewFields: "<ViewFields><FieldRef Name='HS1_x0020_Pins' /><FieldRef Name='Title' /></ViewFields>",
        CAMLRowLimit: 5000,
        CAMLQueryOptions: myQueryOptions,
        CAMLQuery: queryHSOp,
        completefunc: function (xData2, Status) {
                   //alert(Status);
          $(xData2.responseXML).SPFilterNode("z:row").each(function(){
            temp1 = parseInt($(this).attr("ows_HS1_x0020_Pins"),10);
            if(isNaN(temp1)) temp1 = 0;
            $("tr." + $(this).attr("ows_Title")).each(function(){
                $(this).append("<td class=hsPins>" + temp1 + "</td>");
                temp2 = $(this).children("td.qtyMoved").text()*$(this).children("td.hsPins").text();
                $(this).append("<td class='hsSubtotal'>" + temp2 + "</td>");
            }); 
          });
          
          $("table#hsCountTable").css("border-collapse","collapse");
          $("table#hsCountTable th, table#hsCountTable td").css("border","1px solid gray");
          
          totalHSCount = 0;
          $("td.hsSubtotal").each(function(){ totalHSCount += parseInt($(this).text(),10); });
          
          $("div#HSCount").prepend("<div id=totalHSCount> Total HS Pin Count: " + totalHSCount + "</div><span>&nbsp;</span>");
          $("div#totalHSCount").css("font","24px arial bold");
        }
      });
    }
  });

}

function queryString(fieldName, values) {
  var vString = "<Query><Where>";
  for (var j = 2; j <= values.length; j++) {
    vString += "<Or>";
  }
  for (var i = 0; i < values.length; i++) {
    if(i == 0) vString += '<Eq><FieldRef Name="' + fieldName + '" /><Value Type="Text">' +values[i] + '</Value></Eq>';
    else vString += '<Eq><FieldRef Name="' + fieldName + '" /><Value Type="Text">' +values[i] + '</Value></Eq></Or>';
  }
  vString += "</Where></Query>";
  return vString;
}

function GotoItemNo(e,ind)
{
var keynum;
var keychar;
var numcheck;
var quoteno;

if(window.event) // IE
  {
  keynum = e.keyCode;
  }
else if(e.which) // Netscape/Firefox/Opera
  {
  keynum = e.which;
  }
keychar = String.fromCharCode(keynum);
//numcheck = /\d/;
numcheck = /(\/)|(\d)/;

return numcheck.test(keychar);
}//End GotoItemNo

function SPdateConverter( n ) {
  var SPdate = "";
  var d = new Date(n);
  var offset = d.getTimezoneOffset()/60;
    if ( Object.prototype.toString.call(d) === "[object Date]" ) {
      if (!isNaN(d.getTime())) {
        d = d.setHours(d.getHours()-offset);
        d = new Date(d);
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
