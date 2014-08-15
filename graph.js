d3.json('item1.json', function(data) {
  nv.addGraph(function() {
    var chart = nv.models.multiBarHorizontalChart()
        .x(function(d) { return d.label })
        .y(function(d) { return d.value })
        .margin({top: 30, right: 20, bottom: 50, left: 175})
        .showValues(true)           //Show bar value next to each bar.
        .tooltips(true)             //Show tooltips on hover.
        .transitionDuration(350)
        .showControls(true);        //Allow user to switch between "Grouped" and "Stacked" mode.

    chart.yAxis
        .tickFormat(d3.format(',.2f'));

    d3.select('#chart1 svg')
        .datum(data)
        .call(chart);
    
    chart.multibar.dispatch.on("elementClick", function(e) {
      console.log(e.point.label);
    });

    nv.utils.windowResize(chart.update);

    return chart;
  });
});
