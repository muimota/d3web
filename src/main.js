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

var yoffset = 93

//add description labels
let labels = [
  ['RCR Lab A',yoffset - 16],['RCR Arquitectes',yoffset + 9],
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

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip").text('')
    .style('top','300px')
    .style('left','200px')
    //.style('display','none')

//d3.json("https://vue-http-ec65d.firebaseio.com/.json",update)
d3.json("data_merger.json",update)




//on load
function update(data){

  console.log(data);
  dm = DataModel.import(data)

  updateGUI(dm)
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
      .attr('y',yoffset - 5.5)
      .attr('class','scale')


  let surfTags = ['sin dim','<100m²','100-500m²','100-1000m²','1000-5000m²','>5000m²']
  surfX.domain([0,surfTags.length])

  let surfScale = g.append('g').selectAll('text')
    .data(surfTags)
    .enter()
    .append('text')
    .attr('x',(t,i) => surfX(i))
    .text(t=>t)
    .attr('y',yoffset - 5.5)
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
    .attr('y',yoffset - 5.5)
    .attr('class','scale')
    .style('opacity',0)


//interactivity
  let t = d3.transition().duration(1500).ease(d3.easeCubicOut)

  d3.select('#explora').on('click',()=>{
    d3.select('#explora_cover')
      .style('display','block').style('opacity',0)
      .transition(1500).style('opacity',1)
  })

  d3.select('#conecta').on('click',()=>{
    if(links.attr('display') == 'none'){
      links.attr('display','inline')
    }else{
      links.attr('display','none')
    }
  })

  d3.select('#explora_cover').on('click',()=>
    d3.select('#explora_cover').style('display','none'))

   d3.selectAll('.map_modes  a').on('click',function(){
     let node = d3.select(this)
      d3.event.preventDefault();
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
         surfaceBlocks(blocks,projects,surfX,yoffset)
         timeScale.style('opacity', 0)
         surfScale.style('opacity',1)
         typoScale.style('opacity',0)
       break
       case 'typology':
         typoBlocks(blocks,projects,typoX,dm.typologies,yoffset)
         timeScale.style('opacity',0)
         surfScale.style('opacity',0)
         typoScale.style('opacity',1)
       break
     }
     updateQuery()
   })


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

  //tooltip
  //tooltip
  function mouseover(d){

    let node = d3.select(this)
    tooltip
    .style('display','block')
    .text(d.shortname)
    .style("left", (d3.event.pageX - 60) + "px")
    .style("top",  (d3.event.pageY + 20) + "px");

  }

  function mouseout(){
    tooltip.style('display','none')
  }

  blocks.on('mouseover',mouseover)
  blocks.on('mouseout',mouseout)

  for(let refId in dm.references){
    gRef[refId].on('mouseover',mouseover)
    gRef[refId].on('mouseout',mouseout)
  }

  //add tags and links
  links = g.append('g')
    .attr('pointer-events','none')
    .attr('display','none')

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

    blocks.style('transition-delay',d=>`${d3.randomUniform(0,.6)()}s`)
    blocks.style('transition-duration',d=>`${d3.randomUniform(.3,.6)()}s`)


    let references =  filterModel.references
    for(let refId in references){
      gRef[refId].classed('disabled',
        r => !references[refId].includes(r))
    }


    blocks.classed('disabled',true)
    //highlight filtered projects

    let filteredProjects = Object.values(filterModel.projects)
    let filteredBlocks = blocks.filter(p=>filteredProjects.includes(p))

    filteredBlocks.classed('disabled',false)

  }






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

      let filterModel = dm
        .filter(query)
        .filterRef(references)
        .filterProj(projects)

      if(Object.keys(filterModel.projects).length == 0){
        filterModel = dm
        resetSelection()
      }
      displayQuery(filterModel)
      updateGUI(filterModel)
      tagLine(filterModel)
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

function tagLine(filterModel){


  links.selectAll('path').remove()

  let relatedTags = filterModel.tags

  if(filterModel == dm){
    return
  }

  let line = ""

  let tagsCoord = []
  let projects  = Object.values(filterModel.projects)

  blocks.filter(p=>projects.includes(p))
  .each(function(t){
    let node = d3.select(this)
    let x = parseFloat(node.attr('x')) + parseFloat(node.attr('width')) / 2
    let y = parseFloat(node.attr('y')) + parseFloat(node.attr('height')) / 2 + 3

    tagsCoord.push([x,y])
  })

  tagsCoord.sort((a,b)=>a[1] - b[1] + a[0] - b[0])
  let draw = 'M'
  for(let i = 0;i<tagsCoord.length;i++){
    let tagCoord = tagsCoord[i]
    line += `${draw}${tagCoord[0]},${tagCoord[1]-4}`
    draw = 'L'
  }



  for(let tagCat of dm.tagKeys){

    tagsCoord = []

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

    for(let tagCoord of tagsCoord){
      line += `L${tagCoord[0]},${tagCoord[1]-4}`
    }
  }

  let references = filterModel.references
  tagsCoord = []
  for(let refId in references){
    gRef[refId].filter(r=>references[refId].includes(r))
    .each(function(r){
      let node = d3.select(this)
      tagsCoord.push([
        parseFloat(node.attr('x')) + 3.5,
        parseFloat(node.attr('y')) + 3.5
      ])
    })
  }



  //sort in x coords
  tagsCoord.sort((a,b)=>a[1] - b[1] + a[0] - b[0])

  for(let i = 0;i<tagsCoord.length;i++){
    let tagCoord = tagsCoord[i]
    line += `L${tagCoord[0]},${tagCoord[1]}`

  }

    links.append('path')
      .attr('d',line)
      .attr('fill','none')
      .attr('stroke-width',1.6)
      .attr('opacity',0.7)
      .attr('stroke','#198A78')


}
