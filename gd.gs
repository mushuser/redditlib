var WAIT_DAYS = 2

// return fileName or undefined
function save_json_gd(name) {
  var parent = get_parent_full(name)
  var data = get_parent_data(parent)
  var age = get_age(data.created_utc)
  var title = data.title
  
  if(age <= WAIT_DAYS) {
    console.info("not saved,age=%d:%s:%s", age, title, name)
    return undefined  
  }
  
  var text = JSON.stringify(parent)
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
    return undefined
  }
  
  var ids_gd = get_ids_fr_gd(GD_FOLDER_ID)
  var id = get_id(name)
  
  if(ids_gd.indexOf(id) > -1) {
    return undefined
  }
  
  var file = DriveApp.createFile(fileName,text)
  if(file) {
    var folder = DriveApp.getFolderById(GD_FOLDER_ID)
    folder.addFile(file)
    clean_folders_gd(file)    
    console.info("saved:%d:%s", age, fileName)
    return fileName
  } else {
    console.info("not saved:%d:%s", age, name)
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
  if(IDS_GD) {
    return IDS_GD  
  }
  
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
  
  ids = get_unique(ids)
  
  IDS_GD = ids
  return IDS_GD
}