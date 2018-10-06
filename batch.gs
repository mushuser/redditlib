//
function batch_del_old_comments() {
  console.log("batch_del_old_comments() in")
  var api_path = api.comments_user_f(credential.username)
  var reads = rddt_http(api_path)

  for(var i in reads) {
    var data = reads[i].data
    var likes = data.likes // true, false, null
    var age = get_age(data.created_utc)
    var days_round = Math.round(age)
    var name = data.name
    var body = data.body.slice(0, 15)
    
    var msg = Utilities.formatString("%s, %s, %s, %s", name, days_round, likes, body)
    
    if((age >= MIN_AGE) && (age < MAX_AGE) && (likes == null)) {
      save_json_gd(name)
            
      var rr = del_thing(name)      
      if(rr) {
        console.info("deleted:%s",msg)            
      } else {
        console.info("not deleted:%s",msg)            
      }
      continue
      
    } else {
      console.info("age invalid:%s",msg)
    }
    
    // don't handle old comments
    if(age > MAX_AGE) {
      break
    }
  }
  console.log("batch_del_old_comments() out")
  return 
}

//
function batch_save_wikis_gd(wikis) {
  console.log("batch_save_wikis_gd() in")
  if(wikis == undefined) {
    var wikis = get_wikis(FLAIR_MAPPING)
  }

  for(var i in wikis) {
    var page = get_page(wikis[i])
    var ids = get_ids_fr_page(page)
    var ids_gd = get_ids_fr_gd(GD_FOLDER_ID)
    
    if(ids.length < 1) {
      continue  
    }

    console.info("%s:%s",wikis[i],ids)
    for(var i2 in ids) {
      if(ids_gd.indexOf(ids[i2]) > -1) {
        continue  
      }
      var name = get_name(ids[i2])
      var r = save_json_gd(name)
    }
  }
  console.log("batch_save_wikis_gd() out")
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
  console.log("batch_add_goodposts() in")
  
  var saveds = get_saved()

  for(var i in saveds) {
    var s = saveds[i]
    
    s.catalog = get_wikicatalog(s.flair)
    
    var c = check_values(s.catalog, s.title, s.flair, s.name)
    if(c == false) {
      continue  
    }      
    
    var msg = Utilities.formatString("%s, %s, %s, %s", s.title, s.name, s.flair, s.catalog)
    
    var r = add_goodpost(s)
    
    if(r == code.ADDPOST_ADDED) {
      console.info("added:%s",msg)
      up_vote(s)
      save_json_gd(s.name)
    } else if(r == code.ADDPOST_NOT) {
      console.info("not added:%s",msg)
      clean_vote(s)
    } else if(r == code.ADDPOST_ALREADY) {
      console.info("already added:%s",msg)
      up_vote(s)
    } else if(r == code.ADDPOST_EMPTY) {
      console.info("empty page") 
    }
  }
  console.log("batch_add_goodposts() out") 
}