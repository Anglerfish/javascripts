function jobCommentsLabel() {
$(document).ready(function(){
 
jobNo = String(window.location);
if( jobNo.indexOf("jobNo") > 0) {
  jobNo = jobNo.slice(jobNo.lastIndexOf("jobNo") + 6);
//myQuery = "<Query><Where><Eq><FieldRef Name='ID' /><Value Type='Integer'>" + SOItemID + "</Value></Eq></Where></Query>";
  //alert(jobNo);
}
  var temp1 = "";
  var temp2 = 1;
  for (var i=0; i < 10; i++) { temp1 += "<tr><td class=labelL labelNo='" + temp2 + "'>" + (i+1) + "</td><td class=labelC labelNo='" + (temp2+1) + "'>&nbsp;</td><td class=labelR labelNo='" + (temp2+2) + "'>&nbsp;</td></tr>"; 
    temp2 += 3;
  };
//    for (var i=0; i < 10; i++) { temp1 += "<tr><td class='labelL'>WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW</td><td class='labelC'>WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW</td><td class='labelR'>WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW</td></tr>"; };
//    $("table#labelBody td").css("font-size","9pt");
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
  $("table#labelBody td").css("font-size","9pt");
  jQuery.ajax({
    url: "http://server1:8086/AJAX/jcfjm.aspx?Job=" + jobNo,
    success:function(data){
      if($(data).find(".E2job_no").text().length > 0){
        e2info += "<div>Job No." + $(data).find(".E2job_no").text() + " ";
        $(data).find(".E2print_type").each(function(){
          if($(this).text() == "PA") {
//            e2info += $(this).next().text().replace(/\|/g, "<br />");  
            e2info += $(this).next().text();  
            e2info = e2info.substring(e2info.indexOf("DELIVER")); //Start at DELIVER
//            e2info = e2info.substring(0,e2info.substring(1).indexOf("*")); //Ends at next *
            e2info = e2info.split("|");
            
            //e2info[0] = e2info[0] + "ABDDEDGFSRESFSEESRESR";
            temp1 = 0;
            cellspace = 80;
             alert(e2info[2].length);
            do {
              if(cellspace == 80) { $("td[labelNo=" + labelNo +"]").html("<span>" + e2info[temp1] + "</span>") + e2info[temp1].length;}
              else {$("td[labelNo=" + labelNo +"]").append("<span>" + e2info[temp1] + "</span>") + e2info[temp1].length; }
              cellspace -= $("td[labelNo=" + labelNo +"] span:last-child").height();
              if(cellspace < 0) {
                $("td[labelNo=" + labelNo +"] span:last-child").remove();
                labelNo++;
                $("td[labelNo=" + labelNo +"]").html("<span>" + e2info[temp1] + "</span>");
                cellspace = 80- $("td[labelNo=" + labelNo +"] span:last-child").height();
                $("td[labelNo=" + labelNo +"]").append("<span><br /></span>");
              } else {
                $("td[labelNo=" + labelNo +"]").append("<span><br /></span>");
              }  
            //  alert($("td[labelNo=" + labelNo +"] span:last-child").height() + " " +$("td[labelNo=" + labelNo +"]").height());
//              alert($("td[labelNo=" + labelNo +"]").outerWidth());
              temp1++;
            } while(temp1 < e2info.length);


          }
        });
      }else {
        //ERROR ERROR ERROR
        e2info = "<div class=e2output>Job No. not found on EII</div>";
      }
      //$(append
//      $("body").prepend(e2info[0]);
 //     $(".loading").hide();
 //     $(".E2toSP").show();
    },
    fail:function(){
      e2info = "<div>Failed to load data.Please try again later.</div>";
      //$("body").prepend(e2info);
      $(".loading").hide();
    }
  }); //End ajax
  
}

};

