'use strict'

import * as d3 from 'd3'
import {createTagElems} from './tagUtils.js'
import {DataModel} from './DataModel.js'
import {timeBlocks,clearBlocks,surfaceBlocks,typoBlocks} from './projects.js'
import {updateGUI} from './explore.js'
//(c) 2018 Martin Nadal martin@muimota.net

var svg = d3.select("#svgview"),
    margin = {top: 0 , right: 0, bottom: 40, left: 130},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom;

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var yearX   = d3.scaleLinear().range([30,width])
var surfX   = d3.scaleLinear().range([30,width])
var typoX   = d3.scaleLinear().range([30,width])

var projTip = g.append("text")
    .attr("class", "tooltip")
    .style("opacity", 0)


var links, tags

var timeScale
var surfaceScale

var d3tags,blocks
var gRef = {}
var dm,filterModel


//add description labels
let labels = [
  ['RCR Lab A',57],['RCR Arquitectes',87],
  ['espacio-lugar-territorio',180],['cualidades - atmósferas',225],['sentido - materialidad',282],
  ['Publicaciones',333],['Obras',347],['Eventos',359],['Fontarquitextura',372 ]
]
svg.append('g')
  .selectAll('text')
  .data(labels)
    .enter()
    .append('text')
    .text(l=> l[0])
    .attr('x',110).attr('y',l=>l[1])
    .attr('class','label')

//d3.json("https://vue-http-ec65d.firebaseio.com/.json",update)
d3.json("data_merger.json",update)




//on load
function update(data){

  console.log(data);
  dm = DataModel.import(data)

  let references = Object.values(dm.references)
  let typologies = new Set()

  let projects = Object.values(dm.projects)
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

  })

  //time based order
  projects.sort((a,b) => a.startYear - b.startYear)
  let domainExtent = [d3.min(projects,d=>d.startYear),d3.max(projects,d=>d.endYear)]
  let yoffset = 80

  //define el domino de x
  yearX.domain(domainExtent);
  //generate blocks
  blocks =   g.selectAll('rect')
      .data(projects)
      .enter()
        .append('rect')

  blocks = timeBlocks(blocks,projects,yearX,yoffset)

  //dibuja la linea inferior
  let timeTags = []
  for(let year = domainExtent[0];year<domainExtent[1];year ++){
    timeTags.push(year)
  }

  timeScale = g.append('g').selectAll('text')
      .data(timeTags)
      .enter()
      .append('text')
      .attr('x',(t,i) => yearX(t))
      .text(t=>t)
      .attr('y',73)
      .attr('class','scale')


  let surfTags = ['sin dim','<100m²','100-500m²','100-1000m²','1000-5000m²','>5000m²']
  surfX.domain([0,surfTags.length])

  let surfScale = g.append('g').selectAll('text')
    .data(surfTags)
    .enter()
    .append('text')
    .attr('x',(t,i) => surfX(i))
    .text(t=>t)
    .attr('y',70)
    .attr('class','scale')
    .style('opacity',0)

  typoX.domain([0,dm.typologies.length])

  let typoScale = g.append('g').selectAll('text')
    .data(['actividades','cultural','deportivo','educativo',
    'público','hotel','ópera','pabellón','restaurante','visual',
    'viviendas','Sin'])
    .enter()
    .append('text')
    .attr('x',(t,i) => typoX(i))
    .text(t=>t)
    .attr('y',70)
    .attr('class','scale')
    .style('opacity',0)


//interactivity
   d3.selectAll('.map_modes  a').on('click',function(){
     let node = d3.select(this)
     d3.selectAll('.map_modes  a').classed('active',false)
     node.classed('active',true)

     let clickId = node.attr('id')
     d3.event.stopPropagation()
     switch(clickId){
       case 'time':
         timeBlocks(blocks,projects,yearX,yoffset)
         timeScale.style('opacity',1)
         surfScale.style('opacity',0)
         typoScale.style('opacity',0)
       break
       case 'surface':
         surfaceBlocks(blocks,projects,surfX)
         timeScale.style('opacity', 0)
         surfScale.style('opacity',1)
         typoScale.style('opacity',0)
       break
       case 'typology':
         typoBlocks(blocks,projects,typoX,dm.typologies)
         timeScale.style('opacity',0)
         surfScale.style('opacity',0)
         typoScale.style('opacity',1)
       break
     }

   })

  //add tags and links
  links = g.append('g')

  //generate SVG tags
  d3tags = {}
  let tagY = 180
  for(let tagKey of dm.tagKeys){
    let node = g.append('g')
    let elem = createTagElems(node,dm.tags[tagKey],tagY)
    let bbox = node.node().getBBox()
    tagY += bbox.height + 20
    d3tags[tagKey] = elem
  }

  //references
  let bw = 7,bh=7
  for(let refId in dm.references){

    gRef[refId] = g.append('g')
    .selectAll('rect')
    .data(dm.references[refId])
    .enter()
    .append('rect')
      .attr('x',(r,i)=>30 + i*(bw + 1 ) )
      .attr('y',tagY)
      .attr('width',bw)
      .attr('height',bh)
      .attr('class','reference')

    tagY += bh + 6

    gRef[refId].on('click',function(ref){
      console.log(ref)
      let node = d3.select(this)
      if(node.classed('disabled')){
        resetSelection()
      }
      node.classed('selected',! node.classed('selected'))
      updateQuery()
    })
  }


  function displayQuery(filterModel){

    let relatedTags = filterModel.tags

    for(let tagCats in d3tags){
      d3tags[tagCats].classed('disabled',d => ! relatedTags[tagCats].includes(d))
    }

    for(let refId in dm.references){
      let delay = d3.randomUniform(0, 1)()
      gRef[refId].classed('disabled',true)
      gRef[refId].style('transition-delay',d=>`${d3.randomUniform(0,.6)()}s`)
      gRef[refId].style('transition-duration',d=>`${d3.randomUniform(.3,.1)()}s`)
    }

    let references =  filterModel.references
    for(let refId in references){
      gRef[refId].classed('disabled',
        r => !references[refId].includes(r))
    }
    //tagLine(query)

    blocks.classed('disabled',true)
    //highlight filtered projects

    let filteredProjects = Object.values(filterModel.projects)
    let filteredBlocks = blocks.filter(p=>filteredProjects.includes(p))

    filteredBlocks.classed('disabled',false)
    filteredBlocks.style('transition-delay',d=>`${d3.randomUniform(0,.6)()}s`)
    filteredBlocks.style('transition-duration',d=>`${d3.randomUniform(.3,.6)()}s`)

  }




    //projTip
    blocks.on('mouseover', function(d){

      let node = d3.select(this)
      //console.log(node.attr('x')+ node.attr('width') | 0)
      projTip.transition()
        .duration(200)
        .style("opacity", .9)

      projTip.html(d.shortname)
        .attr('x',parseFloat(node.attr('x')) + parseFloat(node.attr('width')) / 2)
        .attr('y',50)
    })

    blocks.on('mouseout', function(d){
      let node = d3.select(this)
      projTip.transition()
        .duration(200)
        .style('opacity', 0)

    })

    function resetSelection(){
      d3.selectAll('.selected').classed('selected',false)

      updateQuery()
    }



    blocks.on('click', function(p){
      let node  = d3.select(this)
      if(node.classed('disabled')){
        resetSelection()
      }
      node.classed('selected',!node.classed('selected'))
      //calculo de los tags
      updateQuery()

    })

    for(let tagCats in d3tags){
      d3tags[tagCats].on('click',function(tag){
        clickHandler(tag,this,tagCats)
        updateQuery()
      })
    }

    /* updates the query based on the UI */

    function updateQuery(){

      let projects   = []

      blocks.each(function(project){
        let node = d3.select(this)
        if(node.classed('selected')){
          projects.push(project)
        }
      })

      let query      = {}

      for(let tagKey of dm.tagKeys){
        d3tags[tagKey].each(function(tag){
          let node = d3.select(this)
          if(node.classed('selected')){
            if(!(tagKey in query)){
              query[tagKey] = []
            }
            query[tagKey].push(tag)
          }
        })
      }

      let references = []

      for(let refId in dm.references){
        gRef[refId].each(function(reference){
          let node = d3.select(this)
          if(node.classed('selected')){
            references.push(reference)
          }
        })
      }

      let filterModel = dm.filter(query).filterRef(references)

      if(Object.keys(filterModel.projects).length == 0){
        filterModel = dm
        resetSelection()
      }
      displayQuery(filterModel)
      updateGUI(filterModel)

    }
    //tag click handler
    function clickHandler(tag,d3elem,tagCat){

      let node = d3.select(d3elem)
      if(node.classed('disabled')){
        resetSelection()
      }
      node.classed('selected',! node.classed('selected'))
      updateQuery()
    }

}

//connects related Tags with line

function tagLine(query){

  links.selectAll('path').remove()
  filterModel = dm.filter(query)
  let relatedTags = filterModel.tags

  if(Object.keys(query).length > 0){
    let line = ""
    for(let tagCat of dm.tagKeys){

      let tagsCoord = []

      d3tags[tagCat].filter(
        t=>relatedTags[tagCat].includes(t)
      ).each(function(t){
        let node = d3.select(this)
        tagsCoord.push([
          parseFloat(node.attr('x')),
          parseFloat(node.attr('y'))
        ])
      })
      //sort in x coords
      tagsCoord.sort((a,b)=>a[1] - b[1] + a[0] - b[0])
      //console.log(tagsCoord)

      for(let i = 0;i<tagsCoord.length;i++){
        let draw = (i==0 && tagCat == dm.tagKeys[0]) ? 'M' : 'L'
        let tagCoord = tagsCoord[i]
        line += `${draw}${tagCoord[0]},${tagCoord[1]-4}`

      }

    }

    links.append('path')
      .attr('d',line)
      .attr('fill','none')
      .attr('stroke','blue')
  }
}
