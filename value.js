var valueChart;
var valueGraphData; 
var valuetype;
var returnValue = "";
var valueChart
var valueGraphData; 
function submitKeyword(keywordItem) {
  $( "#valueChart svg" ).empty();
  $("#minimumValue").val("");
  $("#maximumValue").val("");
  $("#keywordDisplay1").val("");
  $("#valueDisplay").val("");
  $("#bodySubset").empty();
  $('#myTab a[href="#value"]').tab('show')
  $("#keywordDisplay").val(keywordItem);
  serviceUrl = "service/pullValueList"
  $.ajax({
	    type:"POST",
	    url: serviceUrl,
	    traditional: true,
	    data: {
	        fileList: JSON.stringify(fileListArr),
	        keyword: keywordItem
	    },
	dataType: "json",
	success: function (response) {
	  valuetype = "occurancecount"
	  returnValue = response;
	  height = ((response.length + 1) * 12) + 80;
	  valueGraphData = response.result;
	  console.log(returnValue);
	  setSliderValue(valueGraphData[0].values[0].value, valueGraphData[0].values[valueGraphData[0].values.length - 1].value);

	  document.getElementById('valueChart').setAttribute("style","height: " + height + "px;width:80%;float:left;");
	  //document.getElementById('parentChart1').setAttribute("style", "height: " + document.height + "px;width: 100%; overflow: auto;");

      document.getElementById('vertical-slider-Value').setAttribute("style", "height: " + height + "px;margin-left:50px;float:left;");
      outerHeight = $(window).height() - 250;
      //document.getElementById('parentChart1').setAttribute("style", "height:80%;width:100%;overflow:auto;margin-bottom:80px;");
      nv.addGraph(function() {
        valueChart = nv.models.multiBarHorizontalChart()
                  .x(function(d) { return d.label })
                  .y(function(d) { return d.value })
                  .margin({top: 30, right: 20, bottom: 50, left: 375})
                  .showValues(false)           //Show bar value next to each bar.
                  .tooltips(true)             //Show tooltips on hover.
                  .transitionDuration(350)
                  .showControls(false)        //Allow user to switch between "Grouped" and "Stacked" mode.
                  .height(height);
    
        d3.select('#valueChart svg').datum(valueGraphData)
          .call(valueChart);
        setVerticalSliderValue(valueGraphData[0].values[valueGraphData[0].values.length - 1].label, 0);
        valueChart.multibar.dispatch.on("elementClick", function(e) {
          console.log(e.point.label);
          submitValue(keywordItem, e.point.label);
        });
       nv.utils.windowResize(valueChart.update);	
       return valueChart;
     });
       
	}
  });
}


function updateValue() {
	console.log(valueGraphData[0].values.length);
	d3.select("#valueChart svg").selectAll("rect[remove='yes']").filter(function(d) { 
		pos = valueGraphData[0].values.map(function(e) { return e.label; }).indexOf(d.label);
		if (pos === -1) {
			
		} else {
			valueGraphData[0].values.splice(pos, 1);
			if (valuetype != "occurancecount") {
				bPos = returnValue.result[0].values.map(function(e) { return e.label; }).indexOf(d.label);
			    returnValue.result[0].values.splice(bPos, 1);
			}
			if (valuetype != "occuranceValue") {
			    bPos = returnValue.sortresult[0].values.map(function(e) { return e.label; }).indexOf(d.label);
			    returnValue.sortresult[0].values.splice(bPos, 1);
		    }
		    if (valuetype != "filecount") {
			    aPos = returnValue.fileresult[0].values.map(function(e) { return e.label; }).indexOf(d.label);
			    returnValue.fileresult[0].values.splice(aPos, 1);
		    }
		    if (valuetype != "fileValue") {
			    aPos = returnValue.sortfileresult[0].values.map(function(e) { return e.label; }).indexOf(d.label);
			    returnValue.sortfileresult[0].values.splice(aPos, 1);
		    }
		}
	});
	height = ((valueGraphData[0].values.length + 1) * 12) + 80;
	valueChart.height(height)
    d3.select('#valueChart svg').datum(valueGraphData).transition().duration(500).call(valueChart);

    d3.select("#valueChart svg").selectAll("rect").filter(function(d){ 
		 d3.select(this).attr("style", null);
		 d3.select(this).attr("remove", null);		
	});

	
	document.getElementById('valueChart').setAttribute("style","height: " + height + "px;width:80%;float:left;");
	  //document.getElementById('parentChart1').setAttribute("style", "height: " + document.height + "px;width: 100%; overflow: auto;");

    document.getElementById('vertical-slider-Value').setAttribute("style", "height: " + height + "px;margin-left:50px;float:left;");
    nv.utils.windowResize(valueChart.update);	
    if (valuetype === "occuranceValue" || valuetype === "fileValue") {
		adjustonalphabet()
	} else {
       setSliderValue(valueGraphData[0].values[0].value, valueGraphData[0].values[valueGraphData[0].values.length - 1].value);
	   setVerticalSliderValue(valueGraphData[0].values[valueGraphData[0].values.length - 1].label, 0);
    }
 }
 
function valueSearch() {
	ValueSearchItem = document.getElementById('searchValue').value
	var regex = new RegExp(ValueSearchItem);
	d3.select("#valueChart svg").selectAll("rect").filter(function(d) { 
		if (d.label.match(regex)) {
			d3.select(this).attr("style", null);
			d3.select(this).attr("remove", null);	
		} else {
			d3.select(this).attr("style","opacity:0.2;")
			d3.select(this).attr("remove","yes")
		}
	});
}

function valueRevert() {
	submitGlobal();
} 

function valueSort() {
	if (valuetype === "occurancecount") {
		valuetype = "occuranceValue";
		valueGraphData = returnValue.sortresult;
		d3.select('#valueChart svg').datum(valueGraphData).transition().duration(500).call(valueChart);
		//setSliderValue(valueGraphData[0].values[0].value, valueGraphData[0].values[valueGraphData[0].values.length - 1].value);
		//setVerticalSliderValue(valueGraphData[0].values[valueGraphData[0].values.length - 1].label, 0);
	} else if (valuetype === "occuranceValue") {
		valuetype = "occurancecount";
		valueGraphData = returnValue.result;
		d3.select('#valueChart svg').datum(valueGraphData).transition().duration(500).call(valueChart);
		//setSliderValue(valueGraphData[0].values[0].value, valueGraphData[0].values[valueGraphData[0].values.length - 1].value);
		//setVerticalSliderValue(valueGraphData[0].values[valueGraphData[0].values.length - 1].label, 0);		
	} else if (valuetype === "filecount") {
		valuetype = "fileValue";
		valueGraphData = returnValue.sortfileresult;
		d3.select('#valueChart svg').datum(valueGraphData).transition().duration(500).call(valueChart);
		//setSliderValue(valueGraphData[0].values[0].value, valueGraphData[0].values[valueGraphData[0].values.length - 1].value);
		//setVerticalSliderValue(valueGraphData[0].values[valueGraphData[0].values.length - 1].label, 0);
	} else if (valuetype === "fileValue") {
		valuetype = "filecount";
		valueGraphData = returnValue.fileresult;
		d3.select('#valueChart svg').datum(valueGraphData).transition().duration(500).call(valueChart);
		//setSliderValue(valueGraphData[0].values[0].value, valueGraphData[0].values[valueGraphData[0].values.length - 1].value);
		//setVerticalSliderValue(valueGraphData[0].values[valueGraphData[0].values.length - 1].label, 0);		
	}
}

function valueByFile() {
	if (valuetype === "occurancecount") {
		valuetype = "filecount";
		valueGraphData = returnValue.fileresult;
		d3.select('#valueChart svg').datum(valueGraphData).transition().duration(500).call(valueChart);
		setSliderValue(valueGraphData[0].values[0].value, valueGraphData[0].values[valueGraphData[0].values.length - 1].value);
		setVerticalSliderValue(valueGraphData[0].values[valueGraphData[0].values.length - 1].label, 0);
	} else if (valuetype === "filecount") {
		valuetype = "occurancecount";
		valueGraphData = returnValue.result;
		d3.select('#valueChart svg').datum(valueGraphData).transition().duration(500).call(valueChart);
		setSliderValue(valueGraphData[0].values[0].value, valueGraphData[0].values[valueGraphData[0].values.length - 1].value);
		setVerticalSliderValue(valueGraphData[0].values[valueGraphData[0].values.length - 1].label, 0);		
	} else if (valuetype === "occuranceValue") {
		valuetype = "fileValue";
		valueGraphData = returnValue.sortfileresult;
        d3.select('#valueChart svg').datum(valueGraphData).transition().duration(500).call(valueChart);
		adjustonalphabet();
	} else if (valuetype === "fileValue") {
		valuetype = "occuranceValue";
		valueGraphData = returnValue.sortresult;
        d3.select('#valueChart svg').datum(valueGraphData).transition().duration(500).call(valueChart);
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

function setSliderValue(high, low) {
  $(function() {
    $( "#slider-range-Value" ).slider({
      range: true,
      min: low,
      max: high,
      values: [ low, high ],
      slide: function( event, ui ) {
		 $("#minimumValue").val(ui.values[0]);
		 $("#maximumValue").val(ui.values[1]);
		 //d3.select("#chart1 svg").selectAll("rect").filter(function(d){ if ((d.value) < ui.values[0]) { d3.select(this).attr("style","color:white;")}});
		 d3.select("#valueChart svg").selectAll("rect").filter(function(d){ 
			 if (d.value < ui.values[0] || d.value > ui.values[1]) { 
				 d3.select(this).attr("style","opacity:0.2;")
				 d3.select(this).attr("remove","yes")
				 //valueGraphData[0].values.splice(valueGraphData[0].values.indexOf(d.value), 1);
				 //redraw();
		     } else {
				 d3.select(this).attr("style", null);
				 d3.select(this).attr("remove", null);			 
			 }
		 });
      }
    });
    $("#minimumValue").val(low);
    $("#maximumValue").val(high);
  });
 }
 
 
 function setVerticalSliderValue(highval, low) { 
	var high = 0;
	 
    d3.select("#valueChart svg").selectAll("rect").filter(function(d){
	   if (d.label === highval) {
	     z = d3.transform(d3.select(this.parentNode).attr("transform"));
	     high = z.translate[1]
	   return
       }
	});	 
	 
	 high *= -1;
	 
  $(function() {
    $( "#vertical-slider-Value" ).slider({
      range: "min",
      orientation: "vertical",
      min:high, 
      max:low,
      values: [ low, high ],
      slide: function( event, ui ) {
         console.log(ui.values[0] + " " + ui.values[1])
		 //d3.select("#chart1 svg").selectAll("rect").filter(function(d){ if ((d.value) < ui.values[0]) { d3.select(this).attr("style","color:white;")}});
		 d3.select("#valueChart svg").selectAll("rect").filter(function(d){
			 z = d3.transform(d3.select(this.parentNode).attr("transform")); 
			 //console.log(z.translate[1] + " " + ui.values[0] + " " + ui.values[1])
			 if (z.translate[1] < (ui.values[0] * -1) || z.translate[1] > (ui.values[1]) * -1) { 
				 d3.select(this).attr("style","opacity:0.2;")
				 d3.select(this).attr("remove","yes")
				 //valueGraphData[0].values.splice(valueGraphData[0].values.indexOf(d.value), 1);
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
 
