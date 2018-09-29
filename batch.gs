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
function batch_save_comments_gd() {
  var api_path = api.pages_f(SUBREDDIT)
  var wikis = rddt_read(api_path, "/data")
  
  var ids_gd = get_ids_fr_gd(GD_FOLDER_ID)
  for(var i in wikis) {
    var page = get_page(wikis[i]) 
    var objs = get_ids_fr_page(page)
    
    for(var i2 in objs) {
      var obj = objs[i2]
      Logger.log(obj)
      if(ids_gd.indexOf(obj.id) < 0) {
        Logger.log("page:"+wikis[i])
        save_json_gd(obj.link)
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
    var msg = Utilities.formatString(":%s, %s, %s, %s", s.title, s.name, s.flair, s.catalog)
    
    if(s.catalog == undefined) {
      Logger.log("no flair"+msg)    
    }
    
    var r = add_goodpost(s)
    
    if(r) {
      Logger.log("added" + msg)
    } else {
      Logger.log("not added" + msg)
    }
  }
}
