//projects blocks
import * as d3 from 'd3'

function createBlocks(gElem,projects,yearX,yoffset){

  let rowHeight = 10

  let rows = [d3.min(projects,d=>d.startYear)]


  let blocks = gElem.selectAll('rect')
    .data(projects)
    .enter()
      .append('rect')
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
      .classed('project',true)
  return blocks
}

export {createBlocks}
