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

function changeBlocks(blocks,projects){

    blocks.data(projects)
      .attr('x',0)
      .attr('y',() => d3.randomUniform(0,4)()*10)
      .attr('width', 10 )
      .attr('height', 10)


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
export {timeBlocks,clearBlocks,changeBlocks}
