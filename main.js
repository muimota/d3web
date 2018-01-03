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
  data.forEach((p,i) => { if ( p.startYear == p.endYear ){p.endYear ++}})
  data.sort((a,b) => a.startYear - b.startYear)
  let domainExtent = [d3.min(data,d=>d.startYear),d3.max(data,d=>d.endYear)]
  //define el domino de x
  x.domain(domainExtent);

  //dibuja la linea inferior
  g.append("g")
     .attr("class", "axis axis--x")
     .call(d3.axisTop(x).tickFormat(d3.format('04')).ticks());


  let rowHeight = 10
  let rows  = [domainExtent[0]]

  let blocks = g.selectAll('rect')
    .data(data)
    .enter()
      .append('rect')
      .attr('id',d => d.id )
      .attr('x' ,d => x(d.startYear) + 1)
      .attr('y' ,
        function(d){
          let i = 0
          while(i < rows.length && rows[i] > d.startYear){
            i ++
          }
          if(rows[i] > d.startYear){
            rows.push(0)
            i ++
          }
          rows[i] = d.endYear
          return i * rowHeight + 5
        })
      .attr('width', d => x(d.endYear) -  x(d.startYear) - 1 )
      .attr('height', rowHeight - 1)


}
