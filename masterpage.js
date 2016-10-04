function masterRevise() {
var typeTime = 1000;
var stopTimer;

//Dynamic load Javascript Library function
(function(){
function loadScript(url, callback) {
  var script = document.createElement("script");
  script.type = "text/javascript";
  if (script.readyState) { //IE
    script.onreadystatechange = function () {
      if (script.readyState == "loaded" || script.readyState == "complete") {
        script.onreadystatechange = null;
        callback();
      }
    };
  } else { //Others
    script.onload = function () { callback(); };
  }
  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
}
if(!window.jQuery){
  loadScript("/jquery.min.js", function () {
  });
}
loadScript("/jquery.SPServices-0.7.1a.min.js",function() {
});

})();
//End Dynamic load Javascript Library Ends

jQuery(document).ready(function(){
  if(browseris.ie5up) jQuery("head").append('<link href="http://server1:8086/javascripts/masterpage.css" rel="stylesheet" type="text/css" />');
  else jQuery("head").append('<link href="/javascripts/masterpage.css" rel="stylesheet" type="text/css" />');
  
  jQuery("input#sqlSearch").keyup(function(e){
    clearTimeout(stopTimer);
    stopTimer = setTimeout(function(){
      sqlSearch(jQuery("input#sqlSearch").val());
    },typeTime);
  });

  jQuery("img#sqlSearchImg").click(function(){ sqlSearch(jQuery("input#sqlSearch").val()); });

  var elems = document.getElementsByTagName('div'), i;
  for (i in elems) {
    if((" " + elems[i].className + " ").indexOf(" ms-quicklaunchouter ") > -1) {
      elems[i].innerHTML += "<button class=buttons onClick=henri()>TEXT Henri</button><br /><button class=buttons onClick=paolo()>TEXT Paolo</button><br />";
//      <button class=buttons onClick=daniel()>TEXT Daniel</button><br />
    }
  }
});
}

function sqlSearch(sqlSearchTerm) {
  var myQueryOptions = "<QueryOptions><ViewAttributes Scope='RecursiveAll' IncludeRootFolder='True' /></QueryOptions>";
  var sqlTableText = "";
  if (sqlSearchTerm == "") jQuery("table#sqlSearchTable").hide();
  else  jQuery("table#sqlSearchTable").show();

  var msPageTitle = jQuery("#onetidPageTitle a").text();
  if(msPageTitle.length) {}
  else msPageTitle = jQuery.trim(jQuery("#onetidPageTitle").text());
  JSRequest.EnsureSetup();
  var temp = JSRequest.PathName;
  if(temp.indexOf("/Lists/") >= 0) {
    temp = temp.substring(temp.indexOf("/Lists/")+7);
    temp = temp.substring(0,temp.indexOf("/"));
  } else if(temp.indexOf("Manufacturing%20Inquiry%20Database") >= 0) {
    temp = temp.substring(1);
    temp = temp.substring(0,temp.indexOf("/"));
  } else temp = "";

  if(temp != "") {
    $("img#sqlLoadStatus").show();
    var sqlAddress;
    var sqlQuery = sqlQueryBuilder(msPageTitle,sqlSearchTerm);
    var camlFieldQuery = camlFieldBuilder(msPageTitle);
    
    jQuery().SPServices({
      operation: "GetListItems",
      async: true,
      listName: msPageTitle,
      CAMLViewFields: camlFieldQuery,
      CAMLRowLimit: 100,
      CAMLQuery: sqlQuery,
      CAMLQueryOptions: myQueryOptions,
      completefunc: function (xData, Status) {
        jQuery(xData.responseXML).SPFilterNode("z:row").each(function(){
          if (temp == "Manufacturing%20Inquiry%20Database") sqlAddress = "http://server1:8086/" + temp + "/" + jQuery(this).attr("ows_Title");
          else sqlAddress = "http://server1:8086/Lists/"+ temp + "/DispForm.aspx?ID=" + jQuery(this).attr("ows_ID");
          if (msPageTitle == "Resume Applicant List") sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href=" + sqlAddress + ">" + jQuery(this).attr("ows_Title")+ "</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_First_x0020_Name") + " " + jQuery(this).attr("ows_Last_x0020_Name") + "</span></td></tr>";
          else sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href=" + sqlAddress + ">" + jQuery(this).attr("ows_Title")+ "</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_Customer") + "</span></td></tr>";
        });
        jQuery("img#sqlLoadStatus").hide();
        sqlTableText += "<tr><td style='background-color:silver; width: 160px; height: 1px'></td></tr><tr><td><a href='http://server1:8086/Webparts/Jobs%20Query.aspx?jobNo=" + sqlSearchTerm + "'>Job Query: "+ sqlSearchTerm + "</a></td></tr>";
        jQuery("table#sqlSearchTable tbody").html(sqlTableText);
      }
    });
  } else {
    sqlTableText += "<tr><td style='background-color:silver; width: 160px; height: 1px'></td></tr><tr><td><a href='http://server1:8086/Webparts/Jobs%20Query.aspx?jobNo=" + sqlSearchTerm + "'>Job Query: "+ sqlSearchTerm + "</a></td></tr>";
    jQuery("table#sqlSearchTable tbody").html(sqlTableText);
  }


};

function henri(){
  location.href="mailto:6045213104@fido.ca?body=Hi Henri,";
};
function paolo(){
  location.href="mailto:6048172884@msg.telus.com?body=Hi Paolo,";
};
function daniel(){
  location.href="mailto:7783840335@msg.telus.com?body=Hi Daniel,";
};

function camlFieldBuilder(msPageTitle) {
  var camlString;
  
  switch (msPageTitle) {
    case "Resume Applicant List": camlString = "<ViewFields><FieldRef Name='Title' /><FieldRef Name='ID' /><FieldRef Name='First_x0020_Name' /><FieldRef Name='Last_x0020_Name' /></ViewFields>"; break;
    default: camlString = "<ViewFields><FieldRef Name='Title' /><FieldRef Name='ID' /><FieldRef Name='Customer' /></ViewFields>";
  }
  
  return camlString;
} //End function camlFieldBuilder

function sqlQueryBuilder(msPageTitle,sqlSearchTerm) {
  var sqlSearchField;
  var sqlQuery = "";
  var sqlNumber = 0;
  
  switch (msPageTitle) {
    case "Master Job List": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0023_:"Text",Description:"Text",Cust_x0020_Assy_x0023_:"Text"}; break;
    case "PE Prioritization List": sqlSearchField = {Title:"Text",Customer:"Text",Assy_x0023_:"Text"}; break;
    case "SMT-Program Schedule": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0023_:"Text"}; break;
  case "SMT-Placement Schedule": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0020_ID:"Text"}; break;
  case "SMT Inspection Schedule": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0023_:"Text"}; break;
  case "PTH Wave Schedule": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0023_:"Text"}; break;
  case "PTH Wave Inspection Schedule": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0023_:"Text"}; break;
  case "PTH Select Schedule": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0023_:"Text"}; break;
  case "PTH Select Inspection Schedule": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0023_:"Text"}; break;
  case "HS Operation 1 Schedule": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0023_:"Text"}; break;
  case "HS Operation 2 Schedule": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0023_:"Text"}; break;
  case "HS Operation 3 Schedule": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0023_:"Text"}; break;
  case "HS Inspection 1 Schedule": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0023_:"Text"}; break;
  case "HS Inspection 2 Schedule": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0023_:"Text"}; break;
  case "HS Inspection 3 Schedule": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0023_:"Text"}; break;
  case "CC Operation 1 Schedule": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0023_:"Text"}; break;
  case "CC Inspection 1 Schedule": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0023_:"Text"}; break;
  case "MECH Operation 1 Schedule": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0023_:"Text"}; break;
  case "MECH Operation 2 Schedule": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0023_:"Text"}; break;
  case "MECH Operation 3 Schedule": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0023_:"Text"}; break;
  case "MECH Inspection 1 Schedule": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0023_:"Text"}; break;
  case "MECH Inspection 2 Schedule": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0023_:"Text"}; break;
  case "MECH Inspection 3 Schedule": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0023_:"Text"}; break;
  case "TEST Operation 1 Schedule": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0023_:"Text"}; break;
  case "TEST Operation 2 Schedule": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0023_:"Text"}; break;
  case "Final Inspection Schedule": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0023_:"Text"}; break;
  case "Pack Schedule": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0023_:"Text"}; break;
  case "Shipment Authorization": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0020_ID:"Text"}; break;
  case "Open Jobs Progression": sqlSearchField = {Title:"Text",Customer:"Text",Dorigo_x0020_Assy_x0020_ID:"Text"}; break;
  case "Turnkey Status Tracker.": sqlSearchField = {Title:"Text",Customer:"Text",Assy_x0020_ID:"Text"};break;
    case "Quotation Log": sqlSearchField = {Title:"Text",Customer:"Text",Description:"Text"};break;
    case "Resume Applicant List": sqlSearchField = {Title:"Text",First_x0020_Name:"Text",Last_x0020_Name:"Text"}; break;
  default:sqlSearchField = {Title:"Text"};
  }
  
  for(var key in sqlSearchField) {
    sqlNumber++;
    sqlQuery += "<Contains><FieldRef Name='" + key + "' /><Value Type='" + sqlSearchField[key] + "'>" + sqlSearchTerm + "</Value></Contains>";
    if(sqlNumber != 1) sqlQuery += "</Or>";
  }
  while (sqlNumber > 1) {
    sqlQuery = "<Or>" + sqlQuery;
    sqlNumber--;
  }
  sqlQuery = "<Query><Where>" + sqlQuery + "</Where><OrderBy><FieldRef Name='ID' Ascending='False' /></OrderBy></Query>";
  return sqlQuery;
};

function UserGuide(pageName) {
  $("body").append("<a id=userGuideIcon href='/User%20Guide/"+pageName+".aspx' target='_blank' title='User Guide on SharePoint'>HELP</a>");
  $("a#userGuideIcon").css({"position":"absolute",
    "right":"25px",
    "top":"110px",
    "font-family":"Arial, Helvetica, Sans-Serif",
    "text-decoration": "none",
    "font-size": "16px",
    "font-weight": "bold",
    "color":"white",
    "background":"#429ed7",
    "border":"3px #429ed7 solid",
    "padding":"5px, 8px"}).mouseover(function(){
      $(this).css({"color":"white","border-color":"#19447b","background":"#19447b"});
    }).mouseleave(function(){
      $(this).css({"color":"white","border-color":"#429ed7","background":"#429ed7"});
    });
}//End UserGuide
