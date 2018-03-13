
//extracts tags from the JSON
function getTags(tagName,projects){
  let tagArray = []
  projects.filter( p => p.hasOwnProperty(tagName)).map(p => tagArray = tagArray.concat(p[tagName]))
  return Array.from(new Set(tagArray)).sort()
}

function createTagElems(gElem,tagArray,offY = 280){

  let width = 800
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
          offX += (i == 0) ? textWidth / 2 : textWidth / 2 + lastWord / 2 + 10
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
    return selection
}

export {getTags,createTagElems}
