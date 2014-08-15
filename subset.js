var saveStateList;
var tmpKeywordItem;
var tmpValueItem;
function Link(name) {
    $('#myTab a[href="#dataPoint"]').tab('show')
    $('#dataPointObject').attr("data", "http://viz1.ncifcrf.gov:8080/IvaanApps/dev/xmlupload/tcga.html?filename=" + encodeURIComponent(name));
	//var win = window.open("http://viz1.ncifcrf.gov:8080/IvaanApps/dev/xmlupload/tcga.html?filename=" + encodeURIComponent(name), '_blank');
    //win.focus();
}

function buildGraph(response) {
 
		  data = response.result;
var fileListArr = "";
var mainKeyword = "";

var returnValue = "";
var tmpKeywordFileNumberSortByName = "";
var tmpKeywordFileNumberSortByValue = "";
var tmpKeywordListingSortByName = "";
var tmpKeywordListingSortByValue = "";
var m = [20, 120, 20, 120],
    w = window.innerWidth * .8 - m[1] - m[3],
    h = window.innerHeight * .8 - m[0] - m[2],
    i = 0,
    root;
var tree = d3.layout.tree()
    .size([h, w]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var vis = d3.select("#bodySubset").append("svg:svg")
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])
  .append("svg:g")
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

	      
	  root = data;
	  root.x0 = h / 2;
	  root.y0 = 0;
		
	  function toggleAll(d) {
	    if (d.children) {
	      d.children.forEach(toggleAll);
	      toggle(d);
	    }
	  }
	
	  // Initialize the display to show a few nodes.
	  root.children.forEach(toggleAll);
	//  toggle(root.children[1]);
	//  toggle(root.children[1].children[2]);
	//  toggle(root.children[9]);
	//  toggle(root.children[9].children[0]);
	
	  update(root);
	  
//function Link(name) {
//	var win = window.open("http://viz1.ncifcrf.gov:8080/IvaanApps/dev/xmlupload/tcga.html?filename=" + encodeURIComponent(name), '_blank');
//    win.focus();
//}

function update(source) {
  var duration = d3.event && d3.event.altKey ? 5000 : 500;

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse();

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });

  // Update the nodes…
  var node = vis.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("svg:g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", function(d) { 
			  toggle(d);
		      update(d); 
	   })
      .on("mouseover", onMouseOver);
      
  nodeEnter.append("svg:a") 
  	  .attr("xlink:href", function(d) { if (d.type === "file") {
										return "javascript:Link(\"" + d.file + "\")";
										//return "http://viz1.ncifcrf.gov:8080/IvaanApps/dev/xmlupload/tcga.html?filename='" + d.file + "'";
		                                //return encodeURIComponent(uri);
		                                }})
  .append("svg:circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });
  nodeEnter.append("svg:text")
      .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { 
		    return d.name;
		})
      .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
      .attr("r", 4.5)
      .style("fill", function(d) { 
		  if (d.selected === "no") {
		      return d._children ? "lightsteelblue" : "#fff"; 
		  } else {
			  return d._children ? "red" : "lightred"; 
		  }
	  });

  nodeUpdate.select("text")
      .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

  nodeExit.select("circle")
      .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links…
  var link = vis.selectAll("path.link")
      .data(tree.links(nodes), function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("svg:path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      })
    .transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
  
  function onMouseOver(d)
	{
		var message = "<p><strong>Name</strong>: " + d.name + ", " + d.file + ", " + d.coll + "</p>";
		
		
		//document.getElementById("console").innerHTML = message;
	}
}


// Toggle children.
function toggle(d) {
	
	if ( !(d.children || d._children) )
		return;
		
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
}
}

function submitValue(keywordItem, valueItem) {
	
    $( "#bodySubset" ).empty();
	$("#keywordDisplay1").val(keywordItem);
    $("#valueDisplay").val(valueItem);
	$('#myTab a[href="#subset"]').tab('show')
serviceUrl = "service/buildSelectedSubset"
  $.ajax({
	  url: serviceUrl,
	  data: {
		  	fileList: JSON.stringify(fileListArr),
	        keyword: keywordItem,
	        value: valueItem
	  },
	  dataType: "json",
	  success: function (response) {
		  
		tmpKeywordItem = keywordItem;
		tmpValueItem = valueItem;
		saveStateList = response.saveState; 
		buildGraph(response)

	  }
  });
}

function saveState(item) {
	$("#savestatebutton").popover("hide");
	serviceUrl = "service/saveState"
	  $.ajax({
	  url: serviceUrl,
	  data: {
		  	subGraph: JSON.stringify(saveStateList),
		  	subName: item.savestateinput.value,
		    keyword: tmpKeywordItem,
	        value: tmpValueItem
	  },
	  dataType: "json",
	  success: function (response) {
		  $("#saveStatusDisplay").val(item.savestateinput.value);
	  }
  })
}

function loadSavedState(coll, keywordItem, valueItem) {
	$( "#bodySubset" ).empty();
	$("#keywordDisplay1").val(keywordItem);
    $("#valueDisplay").val(valueItem);
	$("#loadstatebutton").popover("hide");
	serviceUrl = "service/buildMainset"
    $.ajax({
	  url: serviceUrl,
	  data: {
	        collection: coll
	  },
	  dataType: "json",
	  success: function (response) {
		  
		tmpKeywordItem = keywordItem;
		tmpValueItem = valueItem;
		saveStateList = "";
		buildGraph(response)

	  }
  });
}
