import $ from "jquery"

function updateGUI(model){
  console.log('updateGUI!');

  //taxonomy
  let tags = [].concat.apply([],Object.values(model.tags)).sort()
  tags = Array.from(new Set(tags))
  let taxo_html = ""
  for(let tag of tags){
    taxo_html+=`<li>${tag}</li>`
  }

  $('#col-taxo').html(taxo_html)

  //projects
  let proj_html = ""
  for(let project of Object.values(model.projects)){
    proj_html +=
      `<div class="cell">
          <img class="image" src="images/${project.id}.jpg"></img>
          <p class="title">${project.shortname}</p>
          <p class="subtitle">${project.typology}</p>
          <p class="description">${project.data}</p>
      </div>`
  }
  $('#col-projects').html(proj_html)

  //referemces
  let ref_html = ""
  let references = [].concat.apply([],Object.values(model.references))
  for(let reference of references){
    ref_html +=
      `<div class="cell">
          <img class="image" src="images/${reference.id}.jpg"></img>
          <p class="title">${reference.shortname}</p>
          <p class="subtitle">${reference.type}</p>
          <p class="description">${reference.data}</p>
      </div>`
  }
  $('#col-references').html(ref_html)
}

export {updateGUI}
