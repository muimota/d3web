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
          <div class="image"></div>
          ${project.shortname}
      </div>`
  }
  $('#col-projects').html(proj_html)

  //referemces
  let ref_html = ""
  let references = [].concat.apply([],Object.values(model.references))
  for(let reference of references){
    ref_html +=
      `<div class="cell">
          <div class="image"></div>
          ${reference.shortname}
      </div>`
  }
  $('#col-references').html(ref_html)
}

export {updateGUI}
