class DataModel{

  /*basic structure has projects, references, data
  {projects:{projId:{projData}.. }
   references:{refId:{refData}}
  data:{refId|projId:{extraData}}}}
  */
  static import(_data){
    let data = _data

    for(let project of Object.values(data.projects)){
      if(data.data[project.id] && data.data[project.id].memory){
        project.data = data.data[project.id].memory
      }
    }

    for(let reference of Object.values(data.references)){
      if(data.data[reference.id] && data.data[reference.id].description){
        reference.data = data.data[reference.id].description
      }
    }

    delete(data.data)
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

    this.noTypology = "sin"

    let typologies = new Set()
    Object.values(this.data.projects).forEach(p=> {
      if(!('typology' in p)){
        p.typology = this.noTypology
      }
      typologies.add(p.typology)
    })
    let undeftypo = typologies.has(this.noTypology)
    typologies.delete(this.noTypology)

    this.data.typologies = Array.from(typologies).sort()
    if(undeftypo){
      this.data.typologies.push(this.noTypology)
    }

    //console.log(this.data.typologies);
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

  //return projects dict
  get projects(){
    return this.data.projects
  }

  //return projects dict
  get references(){
    return this.data.references
  }

  get typologies(){
    return this.data.typologies
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

          if(reference.tags && tags.some(t=>reference.tags.includes(t))){
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
  filterRef(references){

    let reftags = []
    let counts  = {}

    if(references.length == 0){
      return new DataModel(this.data)
    }
    for(let reference of references){
      //suponemos que no hay tags repetidos
      for(let tag of reference.tags){
        counts[tag] = counts[tag] ? counts[tag] + 1 : 1
      }
    }

    for(let tag in counts){
      if(counts[tag] == references.length){
        reftags.push(tag)
      }
    }
    //references that has all the reftags
    //flatten list https://stackoverflow.com/a/10865042/2205297
    let selectedReferences = [].concat.apply([],Object.values(this.data.references))
    selectedReferences = selectedReferences.filter(r=>{
      for(let tag of reftags){
        if(r.tags.includes(tag)){
          return true
        }
      }
      return false
    })


    /*
    //intersección de todas las tags
    for(let reference of references){
      reftags = reftags.concat(reference.tags)
    }


    reftags = Array.from(new Set(reftags))
*/
    let projects = Object.values(this.data.projects)
    let selectedProjects = projects.filter( p => {

      let rtags = reftags.slice()

      for( let tagKey of this.tagKeys){
        if(tagKey in p){
          rtags = rtags.filter(tag=> !p[tagKey].includes(tag))
        }
      }

      return rtags.length < reftags.length
    })

    let data = Object({},this.data)
    data.projects = {}
    selectedProjects.forEach(p=> data.projects[p.id] = p)
    data.references = {}
    selectedReferences.forEach(r=>
      data.references[r.type] = data.references[r.type] ? data.references[r.type].concat([r]) : [r]
    )
    return new DataModel(data)
  }
}

export {DataModel}
