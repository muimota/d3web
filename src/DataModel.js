class DataModel{

  constructor(_data){
    this.data = _data
    this.tagKeys = ['space','atmosphere','materiality']
  }

  get tags(){

    let tagsDict = {}
    let projects = Object.values(this.data.projects)

    for( let tagKey of this.tagKeys){
      let tagArray = []
      projects.filter( p => p.hasOwnProperty(tagKey)).map(p => tagArray = tagArray.concat(p[tagKey]))
      tagsDict[tagKey] =  Array.from(new Set(tagArray)).sort()
    }

    return tagsDict

  }

  get projects(){
    return this.data.projects
  }

  get references(){
    return this.data.references
  }
  //select projects based on the
  filter(tagsDict){

    let projects = Object.values(this.data.projects)

    let selectedProjects = projects.filter( p => {

      for(let tagKey in tagsDict){

        if( !p.hasOwnProperty(tagKey)){
          continue
        }

        let tags = tagsDict[tagKey]

        for(let tag of tags){
          if(p[tagKey].includes(tag)){
            return true
          }
        }
        return false
      }
    })

    let data = Object({},this.data)
    data.projects = selectedProjects

    return new DataModel(data)
  }
  //gets Tags that relate in some way
  queryTags(projects){

  }
}

export {DataModel}
