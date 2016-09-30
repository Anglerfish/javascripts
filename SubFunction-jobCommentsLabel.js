function jobCommentsLabel() {
$(document).ready(function(){
 
jobNo = String(window.location);
if( jobNo.indexOf("jobNo") > 0) {
  jobNo = jobNo.slice(jobNo.lastIndexOf("jobNo") + 6);
}
  var temp1 = "";
  var temp2 = 1;
  for (var i=0; i < 10; i++) { temp1 += "<tr><td class=labelL labelNo='" + temp2 + "'>" + (i+1) + "</td><td class=labelC labelNo='" + (temp2+1) + "'>&nbsp;</td><td class=labelR labelNo='" + (temp2+2) + "'>&nbsp;</td></tr>"; 
    temp2 += 3;
  };
  $("body").prepend("<span id=labelTopAlert>Select the starting label on the label sheet.</span><br />");
  $("table#labelBody tbody").append(temp1);
  $("table#labelBody td").hover(function(){
    $(this).css({"border-width":"5px","border-color":"blue"});
  },function(){
    $(this).css({"border-width":"1px","border-color":"gray"});
  }).click(function(){
    startlabelMaker($(this).attr("labelNo"));
  });
  
});

function startlabelMaker(orglabelNo) {
  var e2info="";
  var labelNo = orglabelNo;
  $("span#labelTopAlert").hide();
  $("table#labelBody td").css({"font-size":"9pt","border-width":"0px","text-align":"left"}).text("").off("hover click");
  jQuery.ajax({
    url: "http://server1:8086/AJAX/jcfjm.aspx?Job=" + jobNo,
    success:function(data){
      if($(data).find(".E2job_no").text().length > 0){
        e2info += "<div>Job No." + $(data).find(".E2job_no").text() + " ";
        $(data).find(".E2print_type").each(function(){
          if($(this).text() == "PA") {
            e2info += $(this).next().text();  
            e2info = e2info.substring(e2info.indexOf("DELIVER")); //Start at DELIVER
            if(e2info.indexOf("| |") != -1) e2info = e2info.substring(0,e2info.indexOf("| |")); //Ends with a line with only white space
            e2info = e2info.split("|");

            temp1 = 0;
            cellspace = 80;

            do {
              if(cellspace == 80) { $("td[labelNo=" + labelNo +"]").html("<span>" + e2info[temp1] + "</span>") + e2info[temp1].length;}
              else {$("td[labelNo=" + labelNo +"]").append("<span>" + e2info[temp1] + "</span>") + e2info[temp1].length; }
              cellspace -= $("td[labelNo=" + labelNo +"] span:last-child").height();
              if(cellspace < 0) {
                $("td[labelNo=" + labelNo +"] span:last-child").remove();
                labelNo++;
                //Adding comment to next line. Doing it here to stop infinite loop if comment is larger than label
                $("td[labelNo=" + labelNo +"]").html("<span>" + e2info[temp1] + "</span>");
                cellspace = 80- $("td[labelNo=" + labelNo +"] span:last-child").height();
              }
              $("td[labelNo=" + labelNo +"]").append("<span><br /></span>");
              temp1++;
            } while(temp1 < e2info.length);
            
            if(labelNo >= 30 ) {
              alert("Error. Not enough labels to print.\nPlease restart label printing with new sheet.");
            } else window.print();
          }
        });
      }else {
        //ERROR ERROR ERROR
        alert("Error.Cannot find Job No. " + jobNo);
      }
    },
    fail:function(){
      alert("Fail to connecto to Expandable II. Please contact SharePoint Administrator.");
    }
  }); //End ajax
}

};
