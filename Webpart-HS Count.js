var myQueryOptions = "<QueryOptions><ViewAttributes Scope='RecursiveAll' IncludeRootFolder='True' /></QueryOptions>";

function HSCount(){
$(document).ready(function(){
  $("div#HSCount").append("BLAH");
  
  var myQuery = '<Query><Where><And><And><Leq><FieldRef Name="Action_x0020_Date_x002e_" /><Value Type="DateTime">2016-01-31T00:00:00Z</Value></Leq><Geq><FieldRef Name="Action_x0020_Date_x002e_" /><Value Type="DateTime">2016-01-01T00:00:00Z</Value></Geq></And><Eq><FieldRef Name="From_x0020_Proc" /><Value Type="Text">HS Oper 1</Value></Eq></And></Where></Query>';
//  var myQuery = '<Query><Where><Eq><FieldRef Name="From_x0020_Proc" /><Value Type="Text">HS Oper 1</Value></Eq></Where></Query>';

  var countTable = "<table><tbody>";
  var queryValues = new Array();
  var temp1;
  var temp2;
  
  $().SPServices({
    operation: "GetListItems",
    async: true,
    listName: "Board Movement Report",
    CAMLViewFields: "<ViewFields><FieldRef Name='Action_x0020_Date_x002e_' /><FieldRef Name='Qty_x0020_Moved' /><FieldRef Name='Title' /></ViewFields>",
    CAMLRowLimit: 1000,
    CAMLQueryOptions: myQueryOptions,
    CAMLQuery: myQuery,
    completefunc: function (xData, Status) {
      //alert(Status);
      $(xData.responseXML).SPFilterNode("z:row").each(function(){
        countTable += "<tr class=" + $(this).attr("ows_Title") + "><td>" + $(this).attr("ows_Title") + "</td>";
        countTable += "<td class=qtyMoved>" + $(this).attr("ows_Qty_x0020_Moved") + "</td></tr>";
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
        CAMLRowLimit: 1000,
        CAMLQueryOptions: myQueryOptions,
        CAMLQuery: queryHSOp,
        completefunc: function (xData2, Status) {
                   alert(Status);
          $(xData2.responseXML).SPFilterNode("z:row").each(function(){
            temp1 = $(this).attr("ows_HS1_x0020_Pins");
            $("tr." + $(this).attr("ows_Title")).each(function(){
                $(this).append("<td class=hsPins>" + temp1 + "</td>");
                temp2 = $(this).children("td.qtyMoved").text()*$(this).children("td.hsPins").text();
                $(this).append("<td>" + temp2 + "</td>");
            }); 
          });
        }
      });
    }
  });

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