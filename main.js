'use strict'

var svg = d3.select("#svgview"),
    margin = {top: 20, right: 40, bottom: 40, left: 80},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom;

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleLinear().range([30,width])


d3.json("projects_web.json",update)

function update(data){
  console.log(data);

  //remove work with no startYear
  data = data.filter(d => d.startYear != null && d.endYear != null)
  let domainExtent = [d3.min(data,d=>d.startYear),d3.max(data,d=>d.endYear)]
  //define el domino de x
  x.domain(domainExtent);

  //dibuja la linea inferior
  g.append("g")
     .attr("class", "axis axis--x")
     .call(d3.axisTop(x).tickFormat(d3.format('04')).ticks());

  var y = d3.scalePoint()
    .domain([0,1,2,3,4,5,6,8,9,10])
    .range([0, height/4])

  let block = g.selectAll('rect')
    .data(data)
    .enter()
      .append('rect')
      .attr('id',d => d.id )
      .attr('x' ,d => x(d.startYear))
      .attr('y' , d=> y(d3.randomUniform(10)() | 0))
      .attr('width', d => x(d.endYear) -  x(d.startYear))
      .attr('height', 10)


}
