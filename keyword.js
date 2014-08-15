var chart;
var graphdata; 
var type;
var origGraph;
var returnValueKeyword = "";
function submitGlobal() {
  fileListArr = new Array();
  function toggleAll(d) {
	if (d.children) {
	  d.children.forEach(toggleAll);
	} else if (d._children) {
	  d._children.forEach(toggleAll);
	} else {
	  if (d.selected === "yes") {
		var arr = new Array();
		arr.push(d.coll);
		arr.push(d.file);
		fileListArr.push(d.coll);
	  }
	}
  } 
  root.children.forEach(toggleAll);

  if (fileListArr.length === 0) {
	alert("Please make a selection");
	return;  
  }
	
	
  $('#myTab a[href="#keyword"]').tab('show')
  $( "#chart1 svg" ).empty();
  $( "#valueChart svg" ).empty();
  $("#minimumValue").val("");
  $("#maximumValue").val("");
  $("#minimum").val("");
  $("#maximum").val("");
  $("#bodySubset").empty();
  $("#keywordDisplay").val("");
  $("#keywordDisplay1").val("");
  $("#valueDisplay").val("");
  serviceUrl = "service/pullKeywordList"
  $.ajax({
    type:"POST",
    url: serviceUrl,
	traditional: true,
	data: {
	  fileList: JSON.stringify(fileListArr),
	},
	dataType: "json",
	success: function (response) {
	  type = "occurancecount"
	  origGraph = response;
	  returnValueKeyword = response;
	  height = ((response.length + 1) * 12) + 80;
	  graphdata = response.result;
	  console.log(returnValueKeyword);
	  setslider(graphdata[0].values[0].value, graphdata[0].values[graphdata[0].values.length - 1].value);

	  document.getElementById('chart1').setAttribute("style","height: " + height + "px;width:80%;float:left;");
	  //document.getElementById('parentChart1').setAttribute("style", "height: " + document.height + "px;width: 100%; overflow: auto;");

      document.getElementById('vertical-slider').setAttribute("style", "height: " + height + "px;margin-left:50px;float:left;");
      outerHeight = $(window).height() - 250;
      //document.getElementById('parentChart1').setAttribute("style", "height:80%;width:100%;overflow:auto;margin-bottom:80px;");
      nv.addGraph(function() {
        chart = nv.models.multiBarHorizontalChart()
                  .x(function(d) { return d.label })
                  .y(function(d) { return d.value })
                  .margin({top: 30, right: 20, bottom: 50, left: 375})
                  .showValues(false)           //Show bar value next to each bar.
                  .tooltips(true)             //Show tooltips on hover.
                  .transitionDuration(350)
                  .showControls(false)        //Allow user to switch between "Grouped" and "Stacked" mode.
                  .height(height);
    
        d3.select('#chart1 svg').datum(graphdata)
          .call(chart);
        setverticalslider(graphdata[0].values[graphdata[0].values.length - 1].label, 0);
        chart.multibar.dispatch.on("elementClick", function(e) {
          console.log(e.point.label);
          submitKeyword(e.point.label);
        });
       nv.utils.windowResize(chart.update);	
       return chart;
     });
       
	}
  });
}


function updateKeyword() {
	console.log(graphdata[0].values.length);
	d3.select("#chart1 svg").selectAll("rect[remove='yes']").filter(function(d) { 
		pos = graphdata[0].values.map(function(e) { return e.label; }).indexOf(d.label);
		if (pos === -1) {
			
		} else {
			graphdata[0].values.splice(pos, 1);
			if (type != "occurancecount") {
				bPos = returnValueKeyword.result[0].values.map(function(e) { return e.label; }).indexOf(d.label);
			    returnValueKeyword.result[0].values.splice(bPos, 1);
			}
			if (type != "occurancekeyword") {
			    bPos = returnValueKeyword.sortresult[0].values.map(function(e) { return e.label; }).indexOf(d.label);
			    returnValueKeyword.sortresult[0].values.splice(bPos, 1);
		    }
		    if (type != "filecount") {
			    aPos = returnValueKeyword.fileresult[0].values.map(function(e) { return e.label; }).indexOf(d.label);
			    returnValueKeyword.fileresult[0].values.splice(aPos, 1);
		    }
		    if (type != "filekeyword") {
			    aPos = returnValueKeyword.sortfileresult[0].values.map(function(e) { return e.label; }).indexOf(d.label);
			    returnValueKeyword.sortfileresult[0].values.splice(aPos, 1);
		    }
		}
	});
	height = ((graphdata[0].values.length + 1) * 12) + 80;
	chart.height(height)
    d3.select('#chart1 svg').datum(graphdata).transition().duration(500).call(chart);

    d3.select("#chart1 svg").selectAll("rect").filter(function(d){ 
		 d3.select(this).attr("style", null);
		 d3.select(this).attr("remove", null);		
	});

	
	document.getElementById('chart1').setAttribute("style","height: " + height + "px;width:80%;float:left;");
	  //document.getElementById('parentChart1').setAttribute("style", "height: " + document.height + "px;width: 100%; overflow: auto;");

    document.getElementById('vertical-slider').setAttribute("style", "height: " + height + "px;margin-left:50px;float:left;");
    nv.utils.windowResize(chart.update);	
    if (type === "occurancekeyword" || type === "filekeyword") {
		adjustonalphabet()
	} else {
       setslider(graphdata[0].values[0].value, graphdata[0].values[graphdata[0].values.length - 1].value);
	   setverticalslider(graphdata[0].values[graphdata[0].values.length - 1].label, 0);
    }
 }
 
function keywordSearch() {
	keywordSearchItem = document.getElementById('searchKeyword').value
	var regex = new RegExp(keywordSearchItem);
	d3.select("#chart1 svg").selectAll("rect").filter(function(d) { 
		if (d.label.match(regex)) {
			d3.select(this).attr("style", null);
			d3.select(this).attr("remove", null);	
		} else {
			d3.select(this).attr("style","opacity:0.2;")
			d3.select(this).attr("remove","yes")
		}
	});
}

function keywordRevert() {
	submitGlobal();
} 

function keywordSort() {
	if (type === "occurancecount") {
		type = "occurancekeyword";
		graphdata = returnValueKeyword.sortresult;
		d3.select('#chart1 svg').datum(graphdata).transition().duration(500).call(chart);
		//setslider(graphdata[0].values[0].value, graphdata[0].values[graphdata[0].values.length - 1].value);
		//setverticalslider(graphdata[0].values[graphdata[0].values.length - 1].label, 0);
	} else if (type === "occurancekeyword") {
		type = "occurancecount";
		graphdata = returnValueKeyword.result;
		d3.select('#chart1 svg').datum(graphdata).transition().duration(500).call(chart);
		//setslider(graphdata[0].values[0].value, graphdata[0].values[graphdata[0].values.length - 1].value);
		//setverticalslider(graphdata[0].values[graphdata[0].values.length - 1].label, 0);		
	} else if (type === "filecount") {
		type = "filekeyword";
		graphdata = returnValueKeyword.sortfileresult;
		d3.select('#chart1 svg').datum(graphdata).transition().duration(500).call(chart);
		//setslider(graphdata[0].values[0].value, graphdata[0].values[graphdata[0].values.length - 1].value);
		//setverticalslider(graphdata[0].values[graphdata[0].values.length - 1].label, 0);
	} else if (type === "filekeyword") {
		type = "filecount";
		graphdata = returnValueKeyword.fileresult;
		d3.select('#chart1 svg').datum(graphdata).transition().duration(500).call(chart);
		//setslider(graphdata[0].values[0].value, graphdata[0].values[graphdata[0].values.length - 1].value);
		//setverticalslider(graphdata[0].values[graphdata[0].values.length - 1].label, 0);		
	}
}

function keywordByFile() {
	if (type === "occurancecount") {
		type = "filecount";
		graphdata = returnValueKeyword.fileresult;
		d3.select('#chart1 svg').datum(graphdata).transition().duration(500).call(chart);
		setslider(graphdata[0].values[0].value, graphdata[0].values[graphdata[0].values.length - 1].value);
		setverticalslider(graphdata[0].values[graphdata[0].values.length - 1].label, 0);
	} else if (type === "filecount") {
		type = "occurancecount";
		graphdata = returnValueKeyword.result;
		d3.select('#chart1 svg').datum(graphdata).transition().duration(500).call(chart);
		setslider(graphdata[0].values[0].value, graphdata[0].values[graphdata[0].values.length - 1].value);
		setverticalslider(graphdata[0].values[graphdata[0].values.length - 1].label, 0);		
	} else if (type === "occurancekeyword") {
		type = "filekeyword";
		graphdata = returnValueKeyword.sortfileresult;
        d3.select('#chart1 svg').datum(graphdata).transition().duration(500).call(chart);
		adjustonalphabet();
	} else if (type === "filekeyword") {
		type = "occurancekeyword";
		graphdata = returnValueKeyword.sortresult;
        d3.select('#chart1 svg').datum(graphdata).transition().duration(500).call(chart);
        adjustonalphabet();
	}
}

function adjustonalphabet() {
	var highadjust = "";
	var lowadjust = "";
	var highlabel = "";
	for (key in graphdata[0].values) {
		if (!highadjust && !lowadjust) {
			highadjust = graphdata[0].values[key].value;
			lowadjust = graphdata[0].values[key].value;
		} else {
			if (graphdata[0].values[key].value > highadjust) {
				highadjust = graphdata[0].values[key].value;
				highlabel = graphdata[0].values[key].label;
			} else if (graphdata[0].values[key].value < lowadjust) {
				lowadjust = graphdata[0].values[key].value;
			}
		}
	}
	setslider(highadjust, lowadjust);
	setverticalslider(highlabel, 0);	
}

function setslider(high, low) {
  $(function() {
    $( "#slider-range" ).slider({
      range: true,
      min: low,
      max: high,
      values: [ low, high ],
      slide: function( event, ui ) {
		 $("#minimum").val(ui.values[0]);
		 $("#maximum").val(ui.values[1]);
		 //d3.select("#chart1 svg").selectAll("rect").filter(function(d){ if ((d.value) < ui.values[0]) { d3.select(this).attr("style","color:white;")}});
		 d3.select("#chart1 svg").selectAll("rect").filter(function(d){ 
			 if (d.value < ui.values[0] || d.value > ui.values[1]) { 
				 d3.select(this).attr("style","opacity:0.2;")
				 d3.select(this).attr("remove","yes")
				 //graphdata[0].values.splice(graphdata[0].values.indexOf(d.value), 1);
				 //redraw();
		     } else {
				 d3.select(this).attr("style", null);
				 d3.select(this).attr("remove", null);			 
			 }
		 });
      }
    });
    $("#minimum").val(low);
    $("#maximum").val(high);
  });
 }
 
 
 function setverticalslider(highval, low) { 
	var high = 0;
	 
    d3.select("#chart1 svg").selectAll("rect").filter(function(d){
	   if (d.label === highval) {
	     z = d3.transform(d3.select(this.parentNode).attr("transform"));
	     high = z.translate[1]
	   return
       }
	});	 
	 
	 high *= -1;
	 
  $(function() {
    $( "#vertical-slider" ).slider({
      range: "min",
      orientation: "vertical",
      min:high, 
      max:low,
      values: [ low, high ],
      slide: function( event, ui ) {
         console.log(ui.values[0] + " " + ui.values[1])
		 //d3.select("#chart1 svg").selectAll("rect").filter(function(d){ if ((d.value) < ui.values[0]) { d3.select(this).attr("style","color:white;")}});
		 d3.select("#chart1 svg").selectAll("rect").filter(function(d){
			 z = d3.transform(d3.select(this.parentNode).attr("transform")); 
			 //console.log(z.translate[1] + " " + ui.values[0] + " " + ui.values[1])
			 if (z.translate[1] < (ui.values[0] * -1) || z.translate[1] > (ui.values[1]) * -1) { 
				 d3.select(this).attr("style","opacity:0.2;")
				 d3.select(this).attr("remove","yes")
				 //graphdata[0].values.splice(graphdata[0].values.indexOf(d.value), 1);
				 //redraw();
		     } else {
				 d3.select(this).attr("style", null);
				 d3.select(this).attr("remove", null);			 
			 }
		 });
      }
    });
  });
 }
 
