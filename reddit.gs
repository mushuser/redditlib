var MAX_TITLE_LEN = 30
//
var api = {
  save: "https://oauth.reddit.com/api/save.json",
  unsave: "https://oauth.reddit.com/api/unsave.json",
  del: "https://oauth.reddit.com/api/del.json",
  compose: "https://oauth.reddit.com/api/compose.json",
  vote: "https://oauth.reddit.com/api/vote.json",
  editusertext: "https://oauth.reddit.com/api/editusertext.json",
  pages_f: function(sr){return "https://www.reddit.com/r/"+sr+"/wiki/pages.json"},
  saved_f: function(user){return "https://oauth.reddit.com/user/"+user+"/saved.json?limit=100"},
  upvoted_f: function(user){return "https://oauth.reddit.com/user/"+user+"/upvoted.json?limit=100"},
  wiki_edit_f: function(sr){return "https://oauth.reddit.com/r/"+sr+"/api/wiki/edit.json"},
  wiki_page_f: function(sr, wiki){return "https://www.reddit.com/r/"+sr+"/wiki"+wiki+".json"},
  comments_sr_f: function(sr, id){return "https://www.reddit.com/r/"+sr+"/comments/"+id+".json"},
  comments_link_f: function(link){return "https://www.reddit.com"+link+".json"},
  comments_user_f: function(user){return "https://www.reddit.com/user/"+user+"/comments/.json?limit=100"}
}

//
function get_wikicatalog(flair) {
  var f = flair.toLowerCase()
  var r = FLAIR_MAPPING[f]
  return r
}

//
function isOauth(url) {
  return /\/\/oauth\./.test(url)
}

//
function isListing(url) {
  return /\?limit=/.test(url)  
}


//
function get_ids_fr_page(page) {
  var ids = []
  var match = undefined;
  var re1 = /[0-9a-zA-Z]{6,}/g;
  var re2 = /(\/r\/.*)\)|\(.*\.it\/(.*)\)/
  
  var includes = ["redd.it", "r/"+SUBREDDIT+"/comments"]
  
  var objs = []
  
  var lines = page.split("\n")
  lines = lines.filter(function(e) {
    return (e.indexOf(includes[0]) > -1) || (e.indexOf(includes[1]) > -1)
  })
  
  for(var i in lines) {
    var obj = {
      id:"",
      link:""
    }
    var match1 = lines[i].match(re1)
    obj.id = match1[match1.length-1]
   
    var match2 = lines[i].match(re2)
    obj.link = (match2[1] || match2[2])
    
    objs.push(obj)
  }

  return objs
}

//
function get_page(wiki_path) {
  return get_page_obj(wiki_path, "/data/content_md") 
}

//
function get_page_obj(wiki_path, obj_path) {
  if(wiki_path[0] != "/") {
    wiki_path = "/" + wiki_path
  }
  var api_path = api.wiki_page_f(SUBREDDIT, wiki_path)

  var r = rddt_read(api_path, obj_path)
  return r
}

//
function get_comment(id, obj_path) {
  if(id.indexOf(SUBREDDIT) > -1) {
    var api_path = api.comments_link_f(id)
  } else {
    var api_path = api.comments_sr_f(SUBREDDIT, id)
  }
  
  var json = rddt_read(api_path, obj_path)

//  Logger.log(json)
  var kind = get_kind(api_path)
  var children = get_kind_children(json, kind)
//  Logger.log(children)
  return children
}

//
function get_upvoted_children() {
  var api_path = api.upvoted_f(credential.username)
  var reads = rddt_read(api_path)

  return reads
}

//
function get_saved_children() {
  var api_path = api.saved_f(credential.username)
  var reads = rddt_read(api_path)
//  Logger.log(reads)
  return reads
}


//
function get_updatedpage(current_page, title, permalink) {
  var new_page = Utilities.formatString("%s\n  * [%s](%s)", current_page, title, permalink)
  
  return new_page
}

//
function add_goodpost(saved) {
  var current_page = get_page(saved.catalog)
  var isinpage = check_idinpage(current_page, saved.id)

  if(isinpage) {
    unsave_thing(saved.name)
    return true
  }
  
  var body = get_escaped_body(current_page)
  var title = get_escaped_title(saved.title)
  var new_page = get_updatedpage(body, title, saved.permalink)      
  
  update_wiki(saved.catalog, new_page)
  
  var updated_page = get_page(saved.catalog)
  var isinpage = check_idinpage(updated_page, saved.id)
  if(isinpage) {
    unsave_thing(saved.name)
    return true
  } else {
    return false
  }
}

//
function get_saved(kind) {
  var reads = get_saved_children()
  var objs = get_objects(reads,kind)

  return objs  
}

//
function get_parent(name) {
  var id = name.match(/t\d_(\w*)/)[1]
  var data = get_comment(id).data
  return data
}


//
function get_objects(reads, kind) {
  var objs = []    
  
  for(var i in reads) {
    var data = reads[i].data
    var kind_read = reads[i].kind    
    /*
    if((kind_read != kind) && (kind != undefined)) {
      continue
    }*/
    
    if(kind_read == "t1") {
      var parent_name = data.parent_id
      var parent = get_parent(parent_name)
      var flair = parent.link_flair_text
      var title = get_escaped_title(data.link_title + "(回覆)")
    } else if(kind_read == "t3") {
      var flair = data.link_flair_text // t3 only
      var title = get_escaped_title(data.title)
    }
    
    var id = data.id
    
    var name = data.name
    var subreddit = data.subreddit
    var permalink = data.permalink

    if( 
      (title==undefined) || 
      (flair==undefined) || 
      (id==undefined) || 
      (name==undefined) ||
      (permalink==undefined)
      ) {
        var msg = Utilities.formatString("id:%s,flair:%s,name:%s,permalink:%s,title:%s",id,flair,name,permalink,title)
        Logger.log(msg)
        continue
      }    
    
    if(subreddit != SUBREDDIT) {
      continue  
    }
    
    var obj = {
      title:title,
      flair:flair,
      id:id,
      name:name,
      permalink:permalink
    }
    
    objs.push(obj)
  }
  
  return objs  
}

//
function get_upvoted() {
  var reads = get_upvoted_children()
  var objs = get_objects(reads)
  
  return reads
}

//
function update_wiki(page, content) {
  var api_path = api.wiki_edit_f(SUBREDDIT)
  var payload = {
    "page":page,
    "content":content
  }
  var reads = rddt_read(api_path, undefined, payload)  
}

//
function unsave_thing(name) {
  var api_path = api.unsave
  var payload = {
    "id":name
  }
  var reads = rddt_read(api_path, undefined, payload)    
}

//
function check_idinpage(page, id) {
  var objs = get_ids_fr_page(page)

  for(var i in objs) {
    if(objs[i].id == id) {
      return true  
    }
  }
  
  return false
}

//
function get_escaped_title(title) {
  var r = title
  r = r.replace(/\(/, "\(")
  r = r.replace(/\)/, "\)")
  r = r.replace(/\[/, "\[")
  r = r.replace(/\]/, "\]")
  r = r.replace(/&amp;/, "\&")
  r = r.replace(/&amp/, "\&")  
  r = r.replace(/&/, "\&")  
  return r.slice(0, MAX_TITLE_LEN)
}

//
function get_escaped_body(body) {
  var r = body
  r = r.replace(/&amp;/, "\&")  
  return r
}


//
function del_thing(id) {
  var api_path = api.del
  var payload = {
    "id":id
  }
  var reads = rddt_read(api_path, undefined, payload)    
}

function editusertext(id, text) {
  var api_path = api.del
  var payload = {
    "text":text,
    "thing_id":id
  }
  var reads = rddt_read(api_path, undefined, payload)    
}