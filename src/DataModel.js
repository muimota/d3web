class DataModel{

  /*basic structure has projects, references, data
  {projects:{projId:{projData}.. }
   references:{refId:{refData}}
  data:{refId|projId:{extraData}}}}
  */
  static import(_data){
    let data = _data

    //organize references by category
    let references = {}
    for(let refId in data.references){
      let reference = data.references[refId]
      if(reference.type in references){
        references[reference.type].push(reference)
      }else{
        references[reference.type] = [reference]
      }
    }

    data.references = references
    return new DataModel(data)
  }

  constructor(_data){
    this.data = _data
    this.tagKeys = ['space','atmosphere','materiality']

  }

  //get dicitonary with tag in each category without duplicates
  get tags(){

    let tagsDict = {}
    let projects = Object.values(this.data.projects)

    for( let tagKey of this.tagKeys){
      let tagArray = []
      projects.filter( p => p.hasOwnProperty(tagKey)).map(p => tagArray = tagArray.concat(p[tagKey]))
//http://www.jstips.co/en/javascript/sorting-strings-with-accented-characters/
      tagsDict[tagKey] =  Array.from(new Set(tagArray)).sort(
        (a, b) => a.localeCompare(b))
    }

    return tagsDict

  }

  //array of tags without duplicates
  get tagArray(){
    let tagsDict = this.tags;
    let tagArray = []
    for( let tagKey of this.tagKeys){
      tagArray = tagArray.concat(tagsDict[tagKey])
    }
    return Array.from(new Set(tagArray)).sort()

  }

  //return projects dict
  get projects(){
    return this.data.projects
  }

  //return projects dict
  get references(){
    return this.data.references
  }

  //select projects based on a query
  //{tagCategory1:[tags..],tagCategory2:[tags..]}
  filter(tagsDict){

    //tagQuery is an empty object
    if(Object.keys(tagsDict).length === 0){
      //TODO:return a copy
      let data = Object.assign({},this.data)

      return new DataModel(data)
    }

    let projects = Object.values(this.data.projects)

    //select project that have the ALL the tag of the query
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

      }
      return true
    })

    let data = Object.assign({},this.data)
    data.projects = {}
    selectedProjects.forEach(p=> data.projects[p.id] = p)
    data.references = this.selectedReferences(selectedProjects)

    let dm = new DataModel(data)

    return dm
  }

  //returns a dict with all the related references
  selectedReferences(selectedProjects){
    //extract array of tags from the selectedProjects
    let tags = []
    for(let project of selectedProjects){
        for(let tagKey of this.tagKeys){
          if(tagKey in project){
            tags = tags.concat(project[tagKey])
          }
        }
    }
    //remove duplicates
    tags =  Array.from(new Set(tags))

    //remove references that don't have ALL tags
    let selectedReferences = {}
    for(let refKey in this.references){

      for(let reference of this.references[refKey]){
        //every ALL
          if(tags.some(t=>reference.tags.includes(t))){
              if(!(refKey in selectedReferences)){
                selectedReferences[refKey] = []
              }
              selectedReferences[refKey].push(reference)
          }
      }
    }

    return selectedReferences
  }
  //filters projects that have all the tags (could be in different categories)
  filterRef(reftags){

    let projects = Object.values(this.data.projects)
    let selectedProjects = projects.filter( p => {

      let rtags = reftags.slice()

      for( let tagKey of this.tagKeys){
        if(tagKey in p){
          rtags = rtags.filter(tag=> !p[tagKey].includes(tag))
        }
      }

      return rtags.length == 0
    })

    let data = Object({},this.data)
    data.projects = {}
    selectedProjects.forEach(p=> data.projects[p.id] = p)
    data.references = this.selectedReferences(selectedProjects)
    return new DataModel(data)
  }
}

export {DataModel}
