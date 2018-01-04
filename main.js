'use strict'
//(c) 2018 Martin Nadal martin@muimota.net

var svg = d3.select("#svgview"),
    margin = {top: 20, right: 40, bottom: 40, left: 80},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom;

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var yearX   = d3.scaleLinear().range([30,width])
var peopleX = d3.scaleLinear().range([30,width])

var tooltip = g.append("text")
    .attr("class", "tooltip")
    .style("opacity", 0)

d3.json("projects_web.json",update)

function update(data){
  console.log(data);

  //remove work with no startYear
  data = data.filter(d => d.startYear != null && d.endYear != null)
  let everybody = []
  //project with same startDate endDate add a year so it has 1 year duration
  data.forEach((p,i) => {
    if ( p.startYear == p.endYear ){
      p.endYear ++
    }

    let people = []
    for (let department in p.team){
      people = people.concat(p.team[department])
    }
    p['people'] = Array.from(new Set(people))
    everybody = Array.from(new Set(everybody.concat(p['people'])))
  })
  everybody.sort()
  //console.log(everybody);
  data.sort((a,b) => a.startYear - b.startYear)
  let domainExtent = [d3.min(data,d=>d.startYear),d3.max(data,d=>d.endYear)]
  //define el domino de x
  yearX.domain(domainExtent);

  //dibuja la linea inferior
  g.append("g")
     .attr("class", "axis axis--x")
     .call(d3.axisTop(yearX).tickFormat(d3.format('04')).ticks());


  let rowHeight = 10
  let rows  = [domainExtent[0]]

  let blocks = g.selectAll('rect')
    .data(data)
    .enter()
      .append('rect')
      .attr('id',d => d.id )
      .attr('x' ,d => yearX(d.startYear) + 1)
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
      .attr('width', d => yearX(d.endYear) -  yearX(d.startYear) - 1 )
      .attr('height', rowHeight - 1)

    //tooltip
    blocks.on('mouseover', function(d){

      let node = d3.select(this)
      node.attr('opacity',0.5)
      //console.log(node.attr('x')+ node.attr('width') | 0)
      tooltip.transition()
        .duration(200)
        .style("opacity", .9)

      tooltip.html(d.shortname)
        .attr('x',parseFloat(node.attr('x')) + parseFloat(node.attr('width')) / 2)
        .attr('y',100)
    })
    blocks.on('mouseout', function(d){
      let node = d3.select(this)
      node.attr('opacity',1)
      tooltip.transition()
        .duration(200)
        .style("opacity", 0)

    })
    peopleX.domain([0,everybody.length])

    let people = g.selectAll('circle')
      .data(everybody)
      .enter()
        .append('circle')
        .attr('id',d => d.id )
        .attr('r', d => 3)
        .attr('cx',(d,i) => peopleX(i))
        .attr('cy',(d,i) => 150 + (i % 3) * 6 )


}
