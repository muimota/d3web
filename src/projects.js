//projects blocks
import * as d3 from 'd3'

function timeBlocks(blocks,projects,yearX,yoffset){

  let rowHeight = 10

  let rows = [d3.min(projects,d=>d.startYear)]


  blocks = blocks
    .data(projects)
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
          if(d.type != 'RCR'){
            return -35 -i * rowHeight / 2 + 5 + yoffset
          }else{
            return i * rowHeight + 5 + yoffset
          }
        })
      .attr('width', d => yearX(d.endYear) -  yearX(d.startYear) - 1 )
      .attr('height', p=> (p.type == 'RCR') ? rowHeight - 1 : rowHeight / 2 - 1)
      .classed('project',true)
  return blocks
}

function surfaceBlocks(blocks,projects,scale){

  //block height block width
  let bh = 5, bw = 5
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

  let counter = [0,0,0,0,0,0]
  let sizes   = [0.9,1,2,3,4,5,]
  let positions = []

  blocks.data(projects)
    .each(p=>{
      let si = _si(p)
      positions.push(counter[si])
      counter[si]++
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
        return 80 + y * (bw + 1)
      }else{
        return 40 - (y * (bw + 1))
      }
    })
    .attr('width', p=>bw * sizes[_si(p)] )
    .attr('height', bh)

  return blocks
}

function typoBlocks(blocks,projects,scale,typologies){

  //block height block width
  let bh = 7, bw = 7
  //surfaceindex, converts surface to it corresponging range


  let counter = []
  for(let i=0;i<typologies.length;i++){
    counter.push(0)
  }
  let positions = []

  blocks.data(projects)
    .each(p=>{
      let ti = typologies.indexOf(p.typology)
      positions.push(counter[ti])
      counter[ti]++
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
        return 80 + y * (bw + 1)
      }else{
        return 40 - (y * (bw + 1))
      }
    })
    .attr('width', bw)
    .attr('height', bh)

  return blocks
}

function clearBlocks(blocks){
  let totalTime = 0


  blocks.style('opacity', 0)
  blocks.style('transition-delay',
    d=>{
      let time  = d3.randomUniform(0,.6)()
      totalTime = Math.max(time,totalTime)
      return `${time}s`
    })
  blocks.style('transition-duration',
    d=>{
      let time = d3.randomUniform(0,.6)()
      totalTime = Math.max(time,totalTime)
      return `${time}s`
    })
  setTimeout(()=>console.log('log'),Math.round(totalTime * 1000))
  return blocks
}
export {timeBlocks,clearBlocks,surfaceBlocks,typoBlocks}
