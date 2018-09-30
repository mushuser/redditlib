//
function batch_del_old_comments() {
  var api_path = api.comments_user_f(credential.username)
  var reads = rddt_read(api_path)
  var now = (new Date()).getTime()
  
  for(var i in reads) {
    var data = reads[i].data
    var created = data.created_utc * 1000
    var days = (now - created) / 86400000
    var days_round = Math.round(days)
    var saved = data.saved
    var name = data.name
    var body = data.body.slice(0, 15)
    
    var msg = Utilities.formatString(":%s, %s, %s, %s", name, days_round, saved, body)
    
    if((days >= MIN_AGE) && (days < MAX_AGE) && (saved == false)) {
      Logger.log("del"+msg)
      del_thing(name)
    } else {
      Logger.log("not del"+msg)
    }
    
    if((days > MAX_AGE) && (saved == true)) {
      unsave_thing(name)
    }
  }
  
  return 
}

//
function batch_save_comments_gd(wikis) {
  var api_path = api.pages_f(SUBREDDIT)
  if(wikis == undefined) {
    var wikis = rddt_read(api_path, "/data")
  }
  var ids_gd = get_ids_fr_gd(GD_FOLDER_ID)
  
  for(var i in wikis) {
    var page = get_page(wikis[i]) 
    var ids = get_ids_fr_page(page)
    Logger.log("wiki:"+wikis[i])
    Logger.log("ids:"+ids)
    for(var i2 in ids) {
      if(ids_gd.indexOf(ids[i2]) < 0) {
        save_json_gd(ids[i2])
      }
    }
  }
}

//
function batch_add_goodposts() {
  var saveds = get_saved()

  for(var i in saveds) {
    var s = saveds[i]
    
    s.catalog = get_wikicatalog(s.flair)
    if(
      (s.catalog == undefined) ||
      (s.title == undefined) ||
      (s.flair == undefined) ||
      (s.name == undefined) ) {
      throw "catalog or title or flair or name"          
    }
      
    var msg = Utilities.formatString("%s, %s, %s, %s", s.title, s.name, s.flair, s.catalog)
    Logger.log("add good post:" + msg)
    var r = add_goodpost(s)
    
    if(r == code.ADDPOST_ADDED) {
      Logger.log("added:" + s.name)
    } else if(r == code.ADDPOST_NOT) {
      Logger.log("not added:" + s.name)
    } else if(r == code.ADDPOST_ALREADY) {
      Logger.log("already added:" + s.name)
    } else if(r == code.ADDPOST_EMPTY) {
      Logger.log("empty page:") 
    }
  }
}
