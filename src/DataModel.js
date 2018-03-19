class DataModel{

  constructor(_data){
    this.data = _data
    this.tagKeys = ['space','atmosphere','materiality']
    this.references = {}
    for(let refId in this.data.references){
      let reference = this.data.references[refId]
      if(reference.type in this.references){
        this.references[reference.type].push(reference)
      }else{
        this.references[reference.type] = [reference]
      }
    }
    this.refKeys = Object.keys(this.references)
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

  get tagArray(){
    let tagsDict = this.tags;
    let tagArray = []
    for( let tagKey of this.tagKeys){
      tagArray = tagArray.concat(tagsDict[tagKey])
    }
    return Array.from(new Set(tagArray)).sort()

  }

  get projects(){
    return this.data.projects
  }

  //select projects based on tags
  filter(tagsDict){

    //tagQuery is an empty object
    if(Object.keys(tagsDict).length === 0){
      //TODO:return a copy
      let data = Object({},this.data)

      return this
    }

    let projects = Object.values(this.data.projects)

    let selectedProjects = projects.filter( p => {

      for(let tagKey in tagsDict){

        if( !p.hasOwnProperty(tagKey)){
          return false
        }

        let tags = tagsDict[tagKey]

        for(let tag of tags){
          if(!p[tagKey].includes(tag)){
            return false
          }
        }
        return true
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
