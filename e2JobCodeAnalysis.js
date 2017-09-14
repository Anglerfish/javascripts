var typeTime = 1000;
var stopTimer;
var searchString;
var dataTable;

$(document).ready(function() {
  $("input#searchInput").select().focus().click(function(){$("input#searchInput").keydown();});
  $("input#searchInput").keydown(function(){
    clearTimeout(stopTimer);
    stopTimer = setTimeout(function(){
      findJobData($("input#searchInput").val());
    }, typeTime - 500);
  });
  
}); //end document ready

function findJobData(jobNo) {
  var temp1;
  var totalQty = 0;
  var totalScrap = 0;
  var tableSum = [];
  var tableSumSize;
  $("table#dataTable").remove();
  $.when(getE2JobCode(jobNo)).done(function(data){
    //alert($(data).find("td.jobID:first").text());
    if( jobNo != "" && $(data).find("td.jobID:first").text().replace(/\s+/g,'') == jobNo) {
      dataTable = "<table id=dataTable><tbody><tr><td>"+ jobNo + "</td><td id=totalQty></td><td id=totalScrap></td></tr><tr id=e2DataHeader><td>Job Code</td><td>Mins/board</td><td>Total Hrs</td></tr>";
      $(data).find("tr.dataRow").each(function(){
        if($(this).children("td.ref").text().replace(/\s+/g,'') == "TIMECHARGE"){
          temp1 = $(this).children("td.subRef").text().split(" ");
    //        $("input#searchInput").parent().append(temp1[0]+","+temp1[1]+"||");
          tableSumSize = tableSum.length;
          for( var i=0; i <= tableSumSize; i++ ) {
            if(i == tableSum.length) { 
              tableSum[i] = [temp1[0],
                             parseFloat($(this).children("td.hours").text()),
                             "<li>" + $(this).children("td.date").text() + " " + temp1[2] + " " + $(this).children("td.qty").text() + "</li>"];
              dataTable += "<tr class='e2Row" + temp1[0] + "'><td class='e2DataExpand'><a href='#'>" + temp1[0] + "</a></td><td class='e2SumDivide" + temp1[0] + "'></td><td class='e2Sum" + temp1[0] + "'></td></tr>" +
                           "<tr style='display:none;'><td class=e2Detail"  + temp1[0] +  " colspan=3></td></tr>";
            } else {
              if(tableSum[i][0] == temp1[0]) {
                tableSumSize = 0;
                tableSum[i][1] += parseFloat($(this).children("td.hours").text());
                tableSum[i][2] = tableSum[i][2] +  "<li>" + $(this).children("td.date").text() + " " + temp1[2] + " " + $(this).children("td.qty").text() + "</li>";
              }
            }
          }
        } else if($(this).children("td.ref").text().replace(/\s+/g,'') == "") {
          totalQty -= parseFloat($(this).children("td.qty").text());
        } else if($(this).children("td.ref").text().replace(/\s+/g,'') == "SCRAP") {
          totalScrap -= parseFloat($(this).children("td.qty").text());
        }
      });
      dataTable += "</tbody></table>";
      $("div#searchAnchor").append(dataTable);
      $("td#totalQty").text("Qty: " + totalQty);
      $("td#totalScrap").text("Scrap: " + totalScrap);
      for (var i = 0; i < tableSum.length; i++) {
        $("td.e2Sum" + tableSum[i][0]).text(tableSum[i][1]);
        $("td.e2SumDivide" + tableSum[i][0]).text((tableSum[i][1]/totalQty*60).toFixed(2));
        $("td.e2Detail" + tableSum[i][0]).text("<ul>" + tableSum[i][2] + "</ul>");
      }
      $("table#dataTable").css({"border-collapse":"collapse"});
      $("table#dataTable td").css({"border":"1px grey solid","font-size":"12pt","padding":"3px"});
      $("tr#e2DataHeader td").css({"font-weight":"bold"});
      $("td.e2DataExpand").click(function() {
        $(this).parent().next().toggle();
      });

    }
    else {
      dataTable = "<table id=dataTable><tbody><tr><td>Bad Entry</td></tr></tbody></table>";
      $("div#searchAnchor").append(dataTable);
    }
    
  });
}//end findJobData


function getE2JobCode(jobNo){
  var dfd = $.Deferred();
  var jobQuery = "/AJAX/jcfcd_JC%20Analysis.aspx?jobID=" + jobNo;

  $("td#JQstencil").text("");
  jQuery.ajax({
    url: jobQuery,
    beforeSend: function() { },
    success:function(data){
      dfd.resolve(data);
    },
    fail:function(){
//      e2info = "<div>Failed to load data.Please try again later.</div>";
      //$("#JQstencil").append(e2info);
      dfd.resolve("");
    }
  });
return dfd.promise();
}
