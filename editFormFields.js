function readFields() {
//read all fields in editForm and output as an object
var output = {};
var fieldName;
var result;
var readError = false;

$("table.ms-formtable>tbody>tr").each(function(){
  result = "";
  if($(this).attr("id").indexOf("~Show") !== -1) {
    fieldName = findfield("FieldName",$(this).find("td:nth-child(2)").html());
    var temp = findfield("FieldType",$(this).find("td:nth-child(2)").html());
    switch (temp) {
      case "SPFieldText":
        result = $(this).find("input").val().replace(/[^\x20-\x7E]+/g, "");
      break;
      case "SPFieldNumber":
        result = $(this).find("input").val();
      break;
      case "SPFieldNote":
//        result = escapeHTML((browseris.ie5up ? $("textarea[Title='"+fieldName+"']").closest("span").find("iframe[Title='Rich Text Editor']").contents().find("body").html(): $("textarea[title='"+fieldName+"']").val()));
        if(browseris.ie5up && $("textarea[Title='"+fieldName+"']").closest("span").find("iframe[Title='Rich Text Editor']").length) {
            result = escapeHTML($("textarea[Title='"+fieldName+"']").closest("span").find("iframe[Title='Rich Text Editor']").contents().find("body").html());
        } else result = escapeHTML($("textarea[title='"+fieldName+"']").val());
        result = result.replace(/[^\x20-\x7E]+/g,"");
      break;
      case "SPFieldUser":
        result = $(this).find("input").val();
      break;
      case "SPFieldChoice":
        result = $(this).find("select").val();
      break;
      case "SPFieldDateTime":
        result = $(this).find("input").val();
        // Add time if available
        var temp1 = $(this).find("select[id$='DateTimeField_DateTimeFieldDateHours']").val();
        if(typeof(temp1) != "undefined") {
          if(temp1.substring(temp1.length-2,temp1.length) == "PM") temp1 = parseInt(temp1.substring(0, temp1.length-3),10) + 12;
          else temp1 = parseInt(temp1.substring(0, temp1.length-3),10);
          if(temp1 == 12 || temp1 == 24) temp1 -= 12;
          result += " " + temp1 + ":" + $(this).find("select[id$='DateTimeField_DateTimeFieldDateMinutes']").val();
        }
          result = SPdateConverter(result);

          if(result == "error") {
            $(this).find("input").css("color","red");
            readError = true;
          }
      break;
      default:
        result = temp;
    }
    output[findfield("FieldInternalName",$(this).find("td:nth-child(2)").html())] = result;
  }
});

if(readError == true) {
  output = "error";
}

return output;

  //Private function for readFields to find field property
  function findfield(fieldName,htmlText) {
    var temp1 = htmlText.indexOf(fieldName);
  return temp1!== 1?htmlText.substring((temp1 + fieldName.length + 2),(htmlText.indexOf('"',temp1 + fieldName.length + 3))):temp1;
  }

//Private function to convert date variable to Sharepoint date input. Remove date information
  function SPdateConverter( n ) {
    var SPdate = "";
    var d = new Date(n);
    if (!isNaN(d.valueOf())) {
      //alert(isNaN(d.valueOf()));
      
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
    } else if (n != "") {
      alert("Date Error");
      SPdate = "error";
    }
    function pad( n ) { return n < 10 ? '0' + n : n; }
    return SPdate;
  }; //End SPdateConverter
  
  //Private function to change string characters form multi-line text to SharePoint save-able text
  function escapeHTML(s) { return typeof(s) != "string"?"":s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
}

function compareFields(originVal,changeVal) {
//compare object values with the same properties and return with an array of differences

var result = new Array();
for (var temp11 in originVal) {
  if(originVal[temp11] !== changeVal[temp11]) result.push([temp11,changeVal[temp11]]);
}

return result;
}


function changedFields(originVal,changeVal) {
//compare object values with the same properties and return with an array of FIELD NAMES that got changed
var result = new Array();
for (var temp11 in originVal) {
  if(originVal[temp11] !== changeVal[temp11]) result.push(temp11);
}

return result;
}


function updateField(uFields) {
//updateFields by taking the URL?
JSRequest.EnsureSetup();
var uID = JSRequest.QueryString["ID"];
var uListName = $(".ms-pagetitle a:first-child").text();

$().SPServices({
        operation: "UpdateListItems",
        async: false,
        ID: uID,
        listName: uListName,
        valuepairs: uFields,
        completefunc: function(xData, Status) {
          alert(Status);
          
          alert("completed2");
        }  
  });
}

function pingFields() {
//For development purpose only. Return all form fields read.
  var temp1 = readFields();
  var pingResult = "";
  for(var key in temp1) {
    pingResult += key + ": " + temp1[key] + "<br />";
  }
  return pingResult;
}