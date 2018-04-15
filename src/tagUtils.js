
import * as d3 from 'd3'

function createTagElems(gElem,tagArray,offY = 280){

  let width = 810
  let offX = 30
  let posY = []
  let lastWord = 0

  let selection = gElem.selectAll('text')
    .data(tagArray)
    .enter()
      .append('text')
      .attr('class','tag')
      .text((s)=>s)
      .attr('x',function(s,i){

        let textWidth = this.getComputedTextLength()

        if(offX + textWidth < width){
          offX += (i == 0) ? textWidth / 2 : textWidth / 2 + lastWord / 2 + 6
        }else{
          offX = 30 + textWidth / 2
          offY += 13
        }

        lastWord = textWidth
        posY.push(offY)

        //console.log(s+'-'+textWidth+'-'+offX);
        return offX

      })

      .attr('y',(s,i) => posY[i])
      .style('transition-delay',d=>`${d3.randomUniform(0,.6)()}s`)
      .style('transition-duration',d=>`${d3.randomUniform(.3,.1)()}s`)
    return selection
}

export {createTagElems}
