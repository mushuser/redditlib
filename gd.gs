//
function save_json_gd(id) {
  var json = get_comment(id)
  var data = json.data
  var text = JSON.stringify(json)
  var name = data.name
  var kind_read = json.kind
  
  if(kind_read == "t1") {
    var parent_name = data.parent_id
    var parent = get_parent(parent_name)
    var flair = parent.link_flair_text  
    var title = get_escaped_title(parent.title + "(回覆)")
  } else if(kind_read == "t3") {
    var flair = data.link_flair_text // t3 only
    var title = get_escaped_title(data.title)
  }  

  Logger.log("name:"+name+",flair:"+flair+",title:"+title)
 
  var fileName = Utilities.formatString("[%s]%s_%s.json", flair, title, name)
//  Logger.log("fileName:"+fileName)
  
  var file = DriveApp.createFile(fileName,text)
  if(file) {
    var folder = DriveApp.getFolderById(GD_FOLDER_ID)
    folder.addFile(file)
    clean_folders_gd(file)
    
    Logger.log("saved:"+fileName)
  } else {
    Logger.log("not saved:"+name)  
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

// XXX
function save_comments_gd(wiki) {
  var page = get_page(wiki)
  var objs = get_ids_fr_page(page)
  var ids_gd = get_ids_fr_gd(GD_FOLDER_ID)

  for(var i in objs) {
    if(ids_gd.indexOf(ids_page[i]) < 0) { 
      save_json_gd(objs[i].link)
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
  
  return ids
}