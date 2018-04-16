//projects blocks
import * as d3 from 'd3'

function timeBlocks(blocks,projects,yearX,yoffset){

  let rowHeight = 7

  let rows = [[d3.min(projects,d=>d.startYear)],[d3.min(projects,d=>d.startYear)]]


  blocks = blocks
    .data(projects)
      .attr('x' ,d => yearX(d.startYear) + 1)
      .attr('y' ,
        function(d){
          let i = 0
          let cat = 0
          if(d.type != 'RCR'){
            cat = 1
          }
          while(i < rows[cat].length && rows[cat][i] > d.startYear){
            i ++
          }
          if(rows[cat][i] > d.startYear){
            rows[cat].push(0)
            i ++
          }
          rows[cat][i] = d.endYear
          if(d.type != 'RCR'){
            return yoffset - 25 - (i * rowHeight / 2)
          }else{
            return yoffset + 3 + i * rowHeight
          }
        })
      .attr('width', d => yearX(d.endYear) -  yearX(d.startYear) - 1 )
      .attr('height', p=> (p.type == 'RCR') ? rowHeight - 1 : rowHeight / 2 - 1)
      .classed('project',true)
      .style('transition-delay',d=>`${d3.randomUniform(0,.6)()}s`)
      .style('transition-duration',d=>`${d3.randomUniform(.3,.1)()}s`)
  return blocks
}

function surfaceBlocks(blocks,projects,scale,yoffset){

  //block height block width
  let bh = 7, bw = 7
  //surfaceindex, converts surface to it corresponging range
  function _si(p){
    let surfaces = [0,100,500,1000,5000]
    if(!('surface' in p)){
      return 0
    }
    let i
    for(i= 0;i<surfaces.length && p.surface>surfaces[i];i++){}

    return i
  }

  let counter = [[0,0,0,0,0,0],[0,0,0,0,0,0]]
  let sizes   = [1,1,2,2.4,3.2,4.5,]
  let positions = []

  blocks.data(projects)
    .each(p=>{
      let si = _si(p)
      let cat = (p.type == 'RCR') ? 0:1
      positions.push(counter[cat][si])
      counter[cat][si]++
    })
    .attr('x',(p,i)=>{
      let si = _si(p)
      let x = positions[i] % 5
      return scale(si) + x * (bw * sizes[si]+ 1)
    })
    .attr('y',(p,i)=>{
      let si = _si(p)
      let y = Math.floor(positions[i] / 5)

      if(p.type == 'RCR'){
        return yoffset + 3 + y * (bw + 1)
      }else{
        return yoffset - 28 - (y * (bw + 1))
      }
    })
    .attr('width', p=>bw * sizes[_si(p)] )
    .attr('height', bh)
    .style('transition-delay',d=>`${d3.randomUniform(0,.6)()}s`)
    .style('transition-duration',d=>`${d3.randomUniform(.3,.1)()}s`)

  return blocks
}

function typoBlocks(blocks,projects,scale,typologies,yoffset){

  //block height block width
  let bh = 7, bw = 7
  //surfaceindex, converts surface to it corresponging range


  let counter = [[],[]]

  for(let i=0;i<typologies.length;i++){
    counter[0].push(0)
    counter[1].push(0)
  }
  let positions = []

  blocks.data(projects)
    .each(p=>{
      let ti = typologies.indexOf(p.typology)
      let cat = (p.type == 'RCR') ? 0:1
      positions.push(counter[cat][ti])
      counter[cat][ti]++
    })
    .attr('x',(p,i)=>{
      let ti = typologies.indexOf(p.typology)
      let x = positions[i] % 5
      return scale(ti) + x * (bw + 1)
    })
    .attr('y',(p,i)=>{
      let ti = typologies.indexOf(p.typology)
      let y = Math.floor(positions[i] / 5)

      if(p.type == 'RCR'){
        return yoffset + 3 + y * (bw + 1)
      }else{
        return yoffset - 28 - (y * (bw + 1))
      }
    })
    .attr('width', bw)
    .attr('height', bh)
    .style('transition-delay',d=>`${d3.randomUniform(0,.6)()}s`)
    .style('transition-duration',d=>`${d3.randomUniform(.3,.1)()}s`)

  return blocks
}

export {timeBlocks,surfaceBlocks,typoBlocks}
