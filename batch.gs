//
function batch_del_old_comments() {
  var api_path = api.comments_user_f(credential.username)
  var reads = rddt_read(api_path)

  for(var i in reads) {
    var data = reads[i].data
    var likes = data.likes // true, false, null
    var age = get_age(data.created_utc)
    var days_round = Math.round(age)
    var name = data.name
    var body = data.body.slice(0, 15)
    
    var msg = Utilities.formatString("%s, %s, %s, %s", name, days_round, likes, body)
    
    if((age >= MIN_AGE) && (age < MAX_AGE) && (likes == null)) {
      console.info("del:%s",msg)
      save_json_gd(data.id)
      del_thing(name)
      continue
    } else {
      console.info("not del:%s",msg)
    }
    
    // don't handle old comments
    if(age > MAX_AGE) {
      break
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
    console.info("%s:%s",wikis[i],ids)
    
    for(var i2 in ids) {
      if(ids_gd.indexOf(ids[i2]) < 0) {
        var r = save_json_gd(ids[i2])
        if(r) {
          console.info("saved:%s", r)  
        } else {
          console.info("not saved:%s", ids[i2]) 
        }
      }
    }
  }
}

//
function batch_clean_voted() {
  var objs = get_upvoted()
  for(var i in objs) {
    var obj = objs[i]
    console.info(obj)
    
    // six months
    if(obj.age > ARCHIVED_AGE) {
      break  
    }
    var name = obj.name
    clean_vote(name)
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
    
    var r = add_goodpost(s)
    
    if(r == code.ADDPOST_ADDED) {
      console.info("added:%s",msg)
      up_vote(s.name)
    } else if(r == code.ADDPOST_NOT) {
      console.info("not added:%s",msg)
      clean_vote(s.name)
    } else if(r == code.ADDPOST_ALREADY) {
      console.info("already added:%s",msg)
      up_vote(s.name)
    } else if(r == code.ADDPOST_EMPTY) {
      console.info("empty page") 
    }
  }
}
