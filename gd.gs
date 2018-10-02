// return fileName or undefined
function save_json_gd(id) {
  var name = get_name(id)
  var data = get_parent(name)
  var text = JSON.stringify(data)
  var name = data.name
  var sr = data.subreddit
  
  if(sr != SUBREDDIT) {
    console.info("SR=%s", sr)
    return undefined  
  }
  
  var flair = data.link_flair_text
  var title = get_escaped_title(data.title)

  var fileName = Utilities.formatString("[%s]%s_%s.json", flair, title, name)
  var r = check_values(flair, title, name, fileName)
  
  if(r == false) {
    throw "check_values"
  }
    
  var file = DriveApp.createFile(fileName,text)
  if(file) {
    var folder = DriveApp.getFolderById(GD_FOLDER_ID)
    folder.addFile(file)
    clean_folders_gd(file)    
    console.info("saved:%s", fileName)
    return fileName
  } else {
    console.info("not saved:%s", name)
    return undefined
  }
}

//
function clean_double_folders() {
  var folder = DriveApp.getFolderById(GD_FOLDER_ID)
  var files = folder.getFiles()
  
  while (files.hasNext()) {
    var file = files.next();
    clean_folders_gd(file)
  }  
}

//
function clean_folders_gd(file) {
  var parents = file.getParents()
  
  while (parents.hasNext()) {
    var folder = parents.next();
    var folder_id = folder.getId()
    
    if(folder_id != GD_FOLDER_ID) {
      folder.removeFile(file)
    }
  }
}

//
function get_ids_fr_gd(folder_id) {
  var folder = DriveApp.getFolderById(folder_id)
  var files = folder.getFiles()
  var ids = []
  
  while (files.hasNext()) {
    var file = files.next();
    var filename = file.getName()
    var re = /.*_t\d_(\w*?)\.json/ig
    var match;
    while((match = re.exec(filename)) != null) {
      if( match[1] ) {
        ids.push(match[1])  
      }        
    }    
  }
  
  ids = ids.filter(function(item, pos) {
    return ids.indexOf(item) == pos;
  })
  
  return ids
}