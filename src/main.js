'use strict'

import * as d3 from 'd3'
import {createTagElems} from './tagUtils.js'
import {DataModel} from './DataModel.js'
//(c) 2018 Martin Nadal martin@muimota.net

var svg = d3.select("#svgview"),
    margin = {top: 20, right: 40, bottom: 40, left: 80},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom;

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var yearX   = d3.scaleLinear().range([30,width])
var peopleX = d3.scaleLinear().range([30,width])

var projTip = g.append("text")
    .attr("class", "tooltip")
    .style("opacity", 0)

var personTip = g.append("text")
    .attr("class", "tooltip")
    .style("opacity", 0)


var everybody
var links, tags

var dm

d3.json("data_merger.json",update)

//on load
function update(data){

  console.log(data);
  dm = new DataModel(data)

  console.log(dm.filter({'atmosphere':['luz']}).tags);

  let projects = d3.values(data.projects)
  //remove work with no startYear
  projects = projects.filter(d => d.hasOwnProperty('startYear') &&
              d.hasOwnProperty('endYear') && d.startYear != null && d.endYear != null
            && d.startYear > 0 && d.endYear > 0)
  //team {member:[projectIds ..]}
  let team = {}
  //project with same startDate endDate add a year so it has 1 year duration
  projects.forEach((p,i) => {
    if ( p.startYear == p.endYear ){
      p.endYear ++
    }

    let projectTeam = []
    for (let department in p.team){
      projectTeam = projectTeam.concat(p.team[department])
    }
    //remove duplicates in team
    projectTeam = Array.from(new Set(projectTeam))
    p.people = projectTeam

    // update team
    for(let member of projectTeam){

      if(!(member in team)){
        team[member] = []
      }

      team[member].push(p.id)

    }
    everybody = Object.keys(team)
  })
  everybody.sort()

  projects.sort((a,b) => a.startYear - b.startYear)
  let domainExtent = [d3.min(projects,d=>d.startYear),d3.max(projects,d=>d.endYear)]

  //define el domino de x
  yearX.domain(domainExtent);

  //dibuja la linea inferior
  g.append("g")
     .attr("class", "axis axis--x")
     .attr("transform", "translate(0,150)")
     .call(d3.axisTop(yearX).tickFormat(d3.format('04')).ticks(domainExtent[1]-domainExtent[0]));


  let rowHeight = 10
  let yoffset  = 150
  let rows  = [domainExtent[0]]

  //projects blocks

  let blocks = g.selectAll('rect')
    .data(projects)
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
          return i * rowHeight + 5 + yoffset
        })
      .attr('width', d => yearX(d.endYear) -  yearX(d.startYear) - 1 )
      .attr('height', rowHeight - 1)

    peopleX.domain([0,everybody.length])

    //add tags and links
    links = g.append('g')

    let people = g.selectAll('circle')
      .data(everybody)
      .enter()
        .append('circle')
        .attr('r', d => 3)
        .attr('cx',(d,i) => peopleX(i))
        .attr('cy',(d,i) => 10 + (i % 3) * 6 )



    //generate SVG tags
    let d3tags = {
      'space':createTagElems(g.append('g'),dm.tags['space'],300),
      'atmosphere':createTagElems(g.append('g'),dm.tags['atmosphere'],420),
      'materiality':createTagElems(g.append('g'),dm.tags['materiality'],590)
    }

    function clickHandler(tag,d3elem,tagCat){

      let node = d3.select(d3elem)
      let query = {}
      query[tagCat] = [tag]

      let relatedTags = dm.filter(query).tags

      for(let tagCats in d3tags){
        d3tags[tagCats].classed('active',false)
        d3tags[tagCats].classed('related',d => relatedTags[tagCats].includes(d))
      }

      node.classed('active',true)
      node.classed('related',false)
    }

    for(let tagCats in d3tags){
      d3tags[tagCats].on('click',function(tag){
        clickHandler(tag,this,tagCats)
      })
    }

    spaceTags.on('click',function(tag){

      let node = d3.select(this)

      let relatedTags = dm.filter({'space':[tag]}).tags['space']

      spaceTags.classed('active',false)
      node.classed('active',true)

      spaceTags.classed('related',d => relatedTags.includes(d))
      node.classed('related',false)
    })

    //projTip
    blocks.on('mouseover', function(d){

      let node = d3.select(this)
      node.attr('opacity',0.5)
      //console.log(node.attr('x')+ node.attr('width') | 0)
      projTip.transition()
        .duration(200)
        .style("opacity", .9)

      projTip.html(d.shortname)
        .attr('x',parseFloat(node.attr('x')) + parseFloat(node.attr('width')) / 2)
        .attr('y',100)
    })

    blocks.on('mouseout', function(d){
      let node = d3.select(this)
      node.attr('opacity',1)
      projTip.transition()
        .duration(200)
        .style("opacity", 0)

    })

    blocks.on('click',function(project){
      let node = d3.select(this)

      let projectNode = d3.select(this)
      let projectCoords = [projectNode.attr('x')|0,projectNode.attr('y')|0]

      //findout people who participated in the project
      let relatedPeople = people.filter(function(person){
        return project.people.indexOf(person) != -1
      })

      //calculate people coordinates
      let peopleCoords = []

      relatedPeople.each(function(d){
        let node = d3.select(this)
        let coords = [node.attr('cx')|0,node.attr('cy')|0]
        peopleCoords.push(coords)
      })
      updateLink(projectCoords,peopleCoords)
    })

    people.on('mouseover',function(person){

      let node = d3.select(this)
      let relatedProjects = blocks.filter(function(d){
        return d.people.indexOf(person) != -1
      })
      blocks.attr('opacity',1)
      relatedProjects.attr('opacity',0.5)
      personTip.transition()
        .duration(200)
        .style("opacity", .9)

      personTip.html(person)
        .attr('x',node.attr('cx'))
        .attr('y',130)
    })


    people.on('mouseout',function(person){
      //links.selectAll('path').remove()
    })

    people.on('click',function(person){


      let personNode = d3.select(this)
      let personCoords = [personNode.attr('cx')|0,personNode.attr('cy')|0]
      let projectsCoords = []

      let relatedProjects = blocks.filter(function(d){
        return d.people.indexOf(person) != -1
      })
      relatedProjects.attr('opacity',0.5)

      relatedProjects.each(function(d){
        let node = d3.select(this)
        let coords = [
          parseFloat(node.attr('x')),
          parseFloat(node.attr('y')),
        ]
        projectsCoords.push(coords)
      })
      updateLink(personCoords,projectsCoords)
    })

}

function updateLink(srcCoord,dstCoords){

  let line = ""
  for(let dstCoord of dstCoords){
    line += `M${srcCoord[0]},${srcCoord[1]}`
    line += `L${dstCoord[0]},${dstCoord[1]}`
  }
  //g.select('path').remove()
  links.selectAll('path').remove()
  links.append('path')
    .attr('d',line)
    .attr('fill','none')
    .attr('stroke','blue')

}
