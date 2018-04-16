import $ from "jquery"

function updateGUI(model,query,selectedProjects = [],selectedReferences = []){

  //taxonomy
  let tags = [].concat.apply([],Object.values(model.tags)).sort()
  let selectedTags = [].concat.apply([],Object.values(query)).sort()
  tags = Array.from(new Set(tags))

  let taxo_html = ""

  if(selectedTags.length > 0){

    taxo_html += '<h5>Seleccionada</h5><ul>'
    for(let tag of selectedTags){
      taxo_html+=`<li>${tag}</li>`
    }
    taxo_html+='</ul>'

  }

  taxo_html += '<h5>Relacionada</h5><ul>'
  for(let tag of tags){
    taxo_html+=`<li>${tag}</li>`
  }
  taxo_html+='</ul>'

  $('#col-taxo').html(taxo_html)

  //projects
  let proj_html = ""

  if(selectedProjects.length > 0){

    proj_html += '<h5>Seleccionados</h5><ul>'
    for(let project of selectedProjects){
      proj_html += displayProject(project)
    }
    proj_html +='</ul>'
  }

  proj_html+='<h5>Relacionados</h5><ul>'

  for(let project of Object.values(model.projects)){
    if(!selectedProjects.includes(project)){
      proj_html += displayProject(project)
    }
  }
  proj_html +='</ul>'

  $('#col-projects').html(proj_html)

  //referemces
  let ref_html = ""
  let references = [].concat.apply([],Object.values(model.references))

  if(selectedReferences.length > 0){

    ref_html += '<h5>Seleccionadas</h5><ul>'
    for(let reference of selectedReferences){
      ref_html += displayReference(reference)
    }
    ref_html+='</ul>'
  }
  ref_html +='<h5>Relacionadas</h5><ul>'

  for(let reference of references){
    if(!selectedReferences.includes(reference)){
      ref_html +=displayReference(reference)
    }
  }
  ref_html += '</ul>'
  $('#col-references').html(ref_html)
}

function displayProject(project){
  let subtitle = `${project.typology} - ${project.surface}m² - ${project.type}`
  let link = ('link' in project) ? project.link :'#'
  let proj_html =
    `<a href="${link}" target="_blank">
      <div class="cell">
        <img class="image" src="images/${project.id}.jpg"
          onerror="this.src='not_found.jpg'">
        <p class="title">${project.shortname}</p>
        <p class="subtitle">${subtitle}</p>
        <p class="description">${project.data}</p>
      </div>
    </a>`
  return proj_html
}

function displayReference(reference){
  let link = ('link' in reference) ? reference.link :'#'
  let ref_html =
    `<a href="${link}" target="_blank"><div class="cell">
        <img class="image" src="images/${reference.id}.jpg"
        onerror="this.src='not_found.jpg'" >
        <p class="title">${reference.shortname}</p>
        <p class="subtitle">${reference.type}</p>
        <p class="description">${reference.data}</p>
    </div></a>`
  return ref_html
}
export {updateGUI}
