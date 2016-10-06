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
    searchRefine(jQuery("input#sqlSearch").val());
    },typeTime);
  });

  jQuery("img#sqlSearchImg").click(function(){ searchRefine(jQuery("input#sqlSearch").val()); });

  var elems = document.getElementsByTagName('div'), i;
  for (i in elems) {
    if((" " + elems[i].className + " ").indexOf(" ms-quicklaunchouter ") > -1) {
      elems[i].innerHTML += "<button class=buttons onClick=henri()>TEXT Henri</button><br /><button class=buttons onClick=paolo()>TEXT Paolo</button><br />";
//      <button class=buttons onClick=daniel()>TEXT Daniel</button><br />
    }
  }
});
}

function henri(){
  location.href="mailto:6045213104@fido.ca?body=Hi Henri,";
};
function paolo(){
  location.href="mailto:6048172884@msg.telus.com?body=Hi Paolo,";
};
function daniel(){
  location.href="mailto:7783840335@msg.telus.com?body=Hi Daniel,";
};


function searchRefine(sqlSearchTerm) {
  var deferreds = [];
  var dfd = $.Deferred();
  var msPageTitle = jQuery("#onetidPageTitle a").text();
  if(msPageTitle.length) {} 
  else msPageTitle = jQuery.trim(jQuery("#onetidPageTitle").text());
  
  if (sqlSearchTerm == "") jQuery("table#sqlSearchTable").hide();
  else  {
    $("img#sqlLoadStatus").show();
    jQuery("table#sqlSearchTable").show();
  
    switch (msPageTitle) {
    case "SMT Program / Placement Schedule":
      deferreds.push(sqlSearch("SMT-Program Schedule",sqlSearchTerm,5));
      deferreds.push(sqlSearch("SMT-Placement Schedule",sqlSearchTerm,10));
      break;
    case "Wavesolder / Selective Schedule":
      deferreds.push(sqlSearch("PTH Wave Schedule",sqlSearchTerm,5));
      deferreds.push(sqlSearch("PTH Select Schedule",sqlSearchTerm,5));
      break;
    case "Handsolder Schedule":
      deferreds.push(sqlSearch("HS Operation 1 Schedule",sqlSearchTerm,5));
      deferreds.push(sqlSearch("HS Operation 2 Schedule",sqlSearchTerm,5));
      deferreds.push(sqlSearch("HS Operation 3 Schedule",sqlSearchTerm,5));
      break;
    case "Mechanical Schedule":
      deferreds.push(sqlSearch("MECH Operation 1 Schedule",sqlSearchTerm,5));
      deferreds.push(sqlSearch("MECH Operation 2 Schedule",sqlSearchTerm,5));
      deferreds.push(sqlSearch("MECH Operation 3 Schedule",sqlSearchTerm,5));
      deferreds.push(sqlSearch("CC Operation 1 Schedule",sqlSearchTerm,5));    
      break;
    case "Test Schedule":
      deferreds.push(sqlSearch("TEST Operation 1 Schedule",sqlSearchTerm,5));
      deferreds.push(sqlSearch("TEST Operation 2 Schedule",sqlSearchTerm,5));
      break;
    case "Pack / SAR Schedule":
      deferreds.push(sqlSearch("Final Inspection Schedule",sqlSearchTerm,5));
      deferreds.push(sqlSearch("Pack Schedule",sqlSearchTerm,5));
      deferreds.push(sqlSearch("Shipment Authorization",sqlSearchTerm,5));
      break;
    case "QC Schedule":
      deferreds.push(sqlSearch("SMT Inspection Schedule",sqlSearchTerm,5));
      deferreds.push(sqlSearch("PTH Wave Inspection Schedule",sqlSearchTerm,5));
      deferreds.push(sqlSearch("PTH Select Inspection Schedule",sqlSearchTerm,5));
      deferreds.push(sqlSearch("HS Inspection 1 Schedule",sqlSearchTerm,5));
      deferreds.push(sqlSearch("HS Inspection 2 Schedule",sqlSearchTerm,5));
      deferreds.push(sqlSearch("HS Inspection 3 Schedule",sqlSearchTerm,5));
      deferreds.push(sqlSearch("MECH Inspection 1 Schedule",sqlSearchTerm,5));
      deferreds.push(sqlSearch("MECH Inspection 2 Schedule",sqlSearchTerm,5));
      deferreds.push(sqlSearch("MECH Inspection 3 Schedule",sqlSearchTerm,5));
      deferreds.push(sqlSearch("CC Inspection 1 Schedule",sqlSearchTerm,5));
      deferreds.push(sqlSearch("Final Inspection Schedule",sqlSearchTerm,5));
      break;
    default:
      deferreds.push(sqlSearch(msPageTitle,sqlSearchTerm,100));
    }

    $.when.apply($,deferreds).done(function(){
      var tempFinal = "";
        $.each(arguments, function(index, responseData){
          tempFinal += responseData;
        });
        tempFinal += "<tr><td style='background-color:silver; width: 160px; height: 1px'></td></tr><tr><td><a href='http://server1:8086/Webparts/Jobs%20Query.aspx?jobNo=" + sqlSearchTerm + "'>Job Query: "+ sqlSearchTerm + "</a></td></tr>";
        $("table#sqlSearchTable tbody").html(tempFinal);

        if(typeof ProcessorWindow !== 'undefined' && $.isFunction(ProcessorWindow)){
          $("table#sqlSearchTable a.pwlink").click(function(){
            ProcessorWindow($(this).attr("listName"),$(this).attr("searchID"));
          });
        }  
        $("img#sqlLoadStatus").hide();
    });
  }
} //End function Search refine

function sqlSearch(msPageTitle,sqlSearchTerm,searchNum) {
  var dfd = $.Deferred();
  var sqlTableText = "<tr><td style='padding:0px 0px 8px 0px; font-weight: bold;'>" + msPageTitle + "</td></tr>";
  var sqlAddress;
  var camlFieldQuery = camlFieldBuilder(msPageTitle);
  var sqlQuery = sqlQueryBuilder(msPageTitle,sqlSearchTerm);

  jQuery().SPServices({
    operation: "GetListItems",
    async: true,
    listName: msPageTitle,
    CAMLViewFields: camlFieldQuery,
    CAMLRowLimit: searchNum,
    CAMLQuery: sqlQuery,
    CAMLQueryOptions: "<QueryOptions><ViewAttributes Scope='RecursiveAll' IncludeRootFolder='True' /></QueryOptions>",
    completefunc: function (xData, Status) {
      if(jQuery(xData.responseXML).SPFilterNode("z:row").length < 1) sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'>No result.</td></tr>";
      jQuery(xData.responseXML).SPFilterNode("z:row").each(function(){
        sqlAddress = jQuery(this).attr("ows_ServerUrl");
        if(sqlAddress.substring(0,7) == "/Lists/") sqlAddress = "http://server1:8086" + sqlAddress.substring(0,sqlAddress.lastIndexOf("/") + 1) + "DispForm.aspx?ID=" + jQuery(this).attr("ows_ID");
        else sqlAddress = "http://server1:8086" + sqlAddress.substring(0,sqlAddress.lastIndexOf("/") + 1) + jQuery(this).attr("ows_Title") ;

        switch (msPageTitle) {
        case "Resume Applicant List": sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href='" + sqlAddress + "'>" + jQuery(this).attr("ows_Title")+ "</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_First_x0020_Name") + " " + jQuery(this).attr("ows_Last_x0020_Name") + "</span></td></tr>"; break;
        case "Manufacturing Inquiry Database": sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href='" + sqlAddress + "'>" + jQuery(this).attr("ows_Title")+ "</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_Customer") + " " + jQuery(this).attr("ows_Cust_x0020_Assy_x0020_ID") + "</span></td></tr>"; break;
        case "SMT-Placement Schedule": sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href=# class='pwlink' listName='" + msPageTitle + "' searchID='" + jQuery(this).attr("ows_ID") + "'>" + jQuery(this).attr("ows_Title")+ "</a>  <a href='" + sqlAddress + "'>edit</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_Customer") + "</span></td></tr>"; break;
        case "SMT Inspection Schedule": sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href=# class='pwlink' listName='" + msPageTitle + "' searchID='" + jQuery(this).attr("ows_ID") + "'>" + jQuery(this).attr("ows_Title")+ "</a>  <a href='" + sqlAddress + "'>edit</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_Customer") + "</span></td></tr>"; break;
        case "PTH Wave Schedule": sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href=# class='pwlink' listName='" + msPageTitle + "' searchID='" + jQuery(this).attr("ows_ID") + "'>" + jQuery(this).attr("ows_Title")+ "</a>  <a href='" + sqlAddress + "'>edit</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_Customer") + "</span></td></tr>"; break;
        case "PTH Wave Inspection Schedule": sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href=# class='pwlink' listName='" + msPageTitle + "' searchID='" + jQuery(this).attr("ows_ID") + "'>" + jQuery(this).attr("ows_Title")+ "</a>  <a href='" + sqlAddress + "'>edit</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_Customer") + "</span></td></tr>"; break;
        case "PTH Select Schedule": sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href=# class='pwlink' listName='" + msPageTitle + "' searchID='" + jQuery(this).attr("ows_ID") + "'>" + jQuery(this).attr("ows_Title")+ "</a>  <a href='" + sqlAddress + "'>edit</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_Customer") + "</span></td></tr>"; break;
        case "PTH Select Inspection Schedule": sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href=# class='pwlink' listName='" + msPageTitle + "' searchID='" + jQuery(this).attr("ows_ID") + "'>" + jQuery(this).attr("ows_Title")+ "</a>  <a href='" + sqlAddress + "'>edit</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_Customer") + "</span></td></tr>"; break;
        case "HS Operation 1 Schedule": sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href=# class='pwlink' listName='" + msPageTitle + "' searchID='" + jQuery(this).attr("ows_ID") + "'>" + jQuery(this).attr("ows_Title")+ "</a>  <a href='" + sqlAddress + "'>edit</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_Customer") + "</span></td></tr>"; break;
        case "HS Operation 2 Schedule": sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href=# class='pwlink' listName='" + msPageTitle + "' searchID='" + jQuery(this).attr("ows_ID") + "'>" + jQuery(this).attr("ows_Title")+ "</a>  <a href='" + sqlAddress + "'>edit</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_Customer") + "</span></td></tr>"; break;
        case "HS Operation 3 Schedule": sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href=# class='pwlink' listName='" + msPageTitle + "' searchID='" + jQuery(this).attr("ows_ID") + "'>" + jQuery(this).attr("ows_Title")+ "</a>  <a href='" + sqlAddress + "'>edit</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_Customer") + "</span></td></tr>"; break;
        case "HS Inspection 1 Schedule": sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href=# class='pwlink' listName='" + msPageTitle + "' searchID='" + jQuery(this).attr("ows_ID") + "'>" + jQuery(this).attr("ows_Title")+ "</a>  <a href='" + sqlAddress + "'>edit</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_Customer") + "</span></td></tr>"; break;
        case "HS Inspection 2 Schedule": sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href=# class='pwlink' listName='" + msPageTitle + "' searchID='" + jQuery(this).attr("ows_ID") + "'>" + jQuery(this).attr("ows_Title")+ "</a>  <a href='" + sqlAddress + "'>edit</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_Customer") + "</span></td></tr>"; break;
        case "HS Inspection 3 Schedule": sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href=# class='pwlink' listName='" + msPageTitle + "' searchID='" + jQuery(this).attr("ows_ID") + "'>" + jQuery(this).attr("ows_Title")+ "</a>  <a href='" + sqlAddress + "'>edit</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_Customer") + "</span></td></tr>"; break;
        case "CC Operation 1 Schedule": sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href=# class='pwlink' listName='" + msPageTitle + "' searchID='" + jQuery(this).attr("ows_ID") + "'>" + jQuery(this).attr("ows_Title")+ "</a>  <a href='" + sqlAddress + "'>edit</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_Customer") + "</span></td></tr>"; break;
        case "CC Inspection 1 Schedule": sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href=# class='pwlink' listName='" + msPageTitle + "' searchID='" + jQuery(this).attr("ows_ID") + "'>" + jQuery(this).attr("ows_Title")+ "</a>  <a href='" + sqlAddress + "'>edit</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_Customer") + "</span></td></tr>"; break;
        case "MECH Operation 1 Schedule": sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href=# class='pwlink' listName='" + msPageTitle + "' searchID='" + jQuery(this).attr("ows_ID") + "'>" + jQuery(this).attr("ows_Title")+ "</a>  <a href='" + sqlAddress + "'>edit</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_Customer") + "</span></td></tr>"; break;
        case "MECH Operation 2 Schedule": sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href=# class='pwlink' listName='" + msPageTitle + "' searchID='" + jQuery(this).attr("ows_ID") + "'>" + jQuery(this).attr("ows_Title")+ "</a>  <a href='" + sqlAddress + "'>edit</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_Customer") + "</span></td></tr>"; break;
        case "MECH Operation 3 Schedule": sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href=# class='pwlink' listName='" + msPageTitle + "' searchID='" + jQuery(this).attr("ows_ID") + "'>" + jQuery(this).attr("ows_Title")+ "</a>  <a href='" + sqlAddress + "'>edit</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_Customer") + "</span></td></tr>"; break;
        case "MECH Inspection 1 Schedule": sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href=# class='pwlink' listName='" + msPageTitle + "' searchID='" + jQuery(this).attr("ows_ID") + "'>" + jQuery(this).attr("ows_Title")+ "</a>  <a href='" + sqlAddress + "'>edit</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_Customer") + "</span></td></tr>"; break;
        case "MECH Inspection 2 Schedule": sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href=# class='pwlink' listName='" + msPageTitle + "' searchID='" + jQuery(this).attr("ows_ID") + "'>" + jQuery(this).attr("ows_Title")+ "</a>  <a href='" + sqlAddress + "'>edit</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_Customer") + "</span></td></tr>"; break;
        case "MECH Inspection 3 Schedule": sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href=# class='pwlink' listName='" + msPageTitle + "' searchID='" + jQuery(this).attr("ows_ID") + "'>" + jQuery(this).attr("ows_Title")+ "</a>  <a href='" + sqlAddress + "'>edit</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_Customer") + "</span></td></tr>"; break;
        case "TEST Operation 1 Schedule": sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href=# class='pwlink' listName='" + msPageTitle + "' searchID='" + jQuery(this).attr("ows_ID") + "'>" + jQuery(this).attr("ows_Title")+ "</a>  <a href='" + sqlAddress + "'>edit</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_Customer") + "</span></td></tr>"; break;
        case "TEST Operation 2 Schedule": sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href=# class='pwlink' listName='" + msPageTitle + "' searchID='" + jQuery(this).attr("ows_ID") + "'>" + jQuery(this).attr("ows_Title")+ "</a>  <a href='" + sqlAddress + "'>edit</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_Customer") + "</span></td></tr>"; break;
        case "Final Inspection Schedule": sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href=# class='pwlink' listName='" + msPageTitle + "' searchID='" + jQuery(this).attr("ows_ID") + "'>" + jQuery(this).attr("ows_Title")+ "</a>  <a href='" + sqlAddress + "'>edit</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_Customer") + "</span></td></tr>"; break;
        default: sqlTableText += "<tr><td style='padding:0px 0px 8px 0px;'><a href='" + sqlAddress + "' listName='" + msPageTitle + "' searchID='" + jQuery(this).attr("ows_ID") + "'>" + jQuery(this).attr("ows_Title")+ "</a><br /><span class=sqlCust>" + jQuery(this).attr("ows_Customer") + "</span></td></tr>";
        }
      });
      dfd.resolve(sqlTableText);
    }
  });
  return dfd.promise();
} //End function sqlSearch

function camlFieldBuilder(msPageTitle) {
  var camlString;
  switch (msPageTitle) {
    case "Resume Applicant List": camlString = "<ViewFields><FieldRef Name='Title' /><FieldRef Name='ID' /><FieldRef Name='First_x0020_Name' /><FieldRef Name='Last_x0020_Name' /><FieldRef Name='ServerUrl' /></ViewFields>"; break;
    case "Manufacturing Inquiry Database": camlString = "<ViewFields><FieldRef Name='Title' /><FieldRef Name='ID' /><FieldRef Name='Customer' /><FieldRef Name='Cust_x0020_Assy_x0020_ID' /><FieldRef Name='ServerUrl' /></ViewFields>"; break;
    default: camlString = "<ViewFields><FieldRef Name='Title' /><FieldRef Name='ID' /><FieldRef Name='Customer' /><FieldRef Name='ServerUrl' /></ViewFields>";
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
  case "Manufacturing Inquiry Database": sqlSearchField = {Title:"Text",Customer:"Text", Cust_x0020_Assy_x0020_ID:"Text",Dorigo_x0020_Assembly_x0020_ID:"Text"}; break;
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