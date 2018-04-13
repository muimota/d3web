import $ from "jquery"

function updateGUI(model,query){
  console.log('updateGUI!');

  //taxonomy
  let tags = [].concat.apply([],Object.values(model.tags)).sort()
  let selectedTags = [].concat.apply([],Object.values(query)).sort()
  tags = Array.from(new Set(tags))

  let taxo_html = ""

  taxo_html += '<h5>seleccionados</h5><ul>'
  for(let tag of selectedTags){
    taxo_html+=`<li>${tag}</li>`
  }
  taxo_html+='</ul>'

  taxo_html += '<h5>relacionados</h5><ul>'
  for(let tag of tags){
    taxo_html+=`<li>${tag}</li>`
  }
  taxo_html+='</ul>'

  $('#col-taxo').html(taxo_html)

  //projects
  let proj_html = ""
  for(let project of Object.values(model.projects)){
    let subtitle = `${project.typology} - ${project.surface}m² - ${project.type}`
    let link = ('link' in project) ? project.link :'#'
    proj_html +=
      `<a href="${link} target="_blank""><div class="cell">
          <img class="image" src="images/${project.id}.jpg" ></img>
          <p class="title">${project.shortname}</p>
          <p class="subtitle">${subtitle}</p>
          <p class="description">${project.data}</p>
      </div></a>`
  }
  $('#col-projects').html(proj_html)

  //referemces
  let ref_html = ""
  let references = [].concat.apply([],Object.values(model.references))

  for(let reference of references){
    let link = ('link' in reference) ? reference.link :'#'
    ref_html +=
      `<a href="${link}" target="_blank"><div class="cell">
          <img class="image" src="images/${reference.id}.jpg" ></img>
          <p class="title">${reference.shortname}</p>
          <p class="subtitle">${reference.type}</p>
          <p class="description">${reference.data}</p>
      </div></a>`
  }
  $('#col-references').html(ref_html)
}

export {updateGUI}
