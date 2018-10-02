var MAX_TITLE_LEN = 30
//
var api = {
  save: "https://oauth.reddit.com/api/save.json",
  unsave: "https://oauth.reddit.com/api/unsave.json",
  del: "https://oauth.reddit.com/api/del.json",
  compose: "https://oauth.reddit.com/api/compose.json",
  vote: "https://oauth.reddit.com/api/vote.json",
  editusertext: "https://oauth.reddit.com/api/editusertext.json",
  info_f: function(name){return "https://oauth.reddit.com/api/info.json?id="+name},
  pages_f: function(sr){return "https://www.reddit.com/r/"+sr+"/wiki/pages.json"},
  saved_f: function(user){return "https://oauth.reddit.com/user/"+user+"/saved.json?limit=100"},
  upvoted_f: function(user){return "https://oauth.reddit.com/user/"+user+"/upvoted.json?limit=100"},
  wiki_edit_f: function(sr){return "https://oauth.reddit.com/r/"+sr+"/api/wiki/edit.json"},
  wiki_page_f: function(sr, wiki){return "https://www.reddit.com/r/"+sr+"/wiki"+wiki+".json"},
  comments_sr_f: function(sr, id){return "https://www.reddit.com/r/"+sr+"/comments/"+id+".json"},
  comments_link_f: function(link){return "https://www.reddit.com"+link+".json"},
  comments_user_f: function(user){return "https://oauth.reddit.com/user/"+user+"/comments/.json?limit=100"}
}

//
function get_wikis(mapping) {
  var values = []
  for(var i in mapping) {
    values.push(mapping[i])  
  }
  values = get_unique(values)  
  
  return values
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
function get_id_fr_line(line) {
  var result;

  if(line.indexOf("redd.it") > -1) {
    var re = /redd\.it\/(\w*)/
    var match = line.match(re)
    result = match[1]
  } else if(line.indexOf(SUBREDDIT+"/comments") > -1){
    var re = /\/([a-zA-Z0-9]{6,7})(?:\/|\))/g
    var match;

    while((match = re.exec(line)) != null) {
      result = match[1]
    }      
  } else {
    result = undefined
  }
  
  return result
}

//
function get_ids_fr_page(page) {
  var ids = [] 
  var lines = page.split("\n")
  
  for(var i in lines) {
    var r = get_id_fr_line(lines[i])
    if(r) {
      ids.push(r)
    }
  }
  
  ids = get_unique(id)

  return ids
}

//
function get_page(wiki_path) {
  return get_page_obj(wiki_path).data.content_md
}

//
function get_page_obj(wiki_path, obj_path) {
  if(wiki_path[0] != "/") {
    wiki_path = "/" + wiki_path
  }
  var api_path = api.wiki_page_f(SUBREDDIT, wiki_path)

  var r = rddt_http(api_path, obj_path)
  return r
}

//
function get_upvoted_children() {
  var api_path = api.upvoted_f(credential.username)
  var reads = rddt_http(api_path)

  return reads
}

// utc
function get_age(created) {
    var created = created * 1000
    var age_days = (NOW - created) / 86400000
    
    return age_days
}

//
function get_saved_children() {
  var api_path = api.saved_f(credential.username)
  var reads = rddt_http(api_path)
//  Logger.log(reads)
  return reads
}


//
function get_updatedpage(current_page, title, permalink) {
  var new_page = Utilities.formatString("%s\n  1. [%s](%s)", current_page, title, permalink)
  
  return new_page
}

var code = {
  ADDPOST_ALREADY:1,
  ADDPOST_NOT:2,
  ADDPOST_ADDED:3,
  ADDPOST_EMPTY:4
}

//
function get_info(name) {
  var api_path = api.info_f(name)
  var read = rddt_http(api_path)

  return read.data.children[0] //safe
}


function get_parent_link(permalink) {
  var re = /\/([a-zA-Z0-9]*)/g
  
  var m = permalink.match(re)
  var link = m.slice(0,4).join("")
  
  return link
}

function get_parent_full(name) {
  var children = get_info(name)
  var data = children.data  
  var permalink = data.permalink
  
  var parent_link = get_parent_link(permalink)  
  var api_path = api.comments_link_f(parent_link)

  var read = rddt_http(api_path)  
  
  return read
}

function get_parent_data(parent) {
  return parent[0].data.children[0].data
}

//
function get_parent(name) {
  var read = get_parent_full(name)
  
  return get_parent_data(read)
}


//
function get_content_fr_info(info) {
  var children = info.data.children[0]
  var data = children.data
  var kind = children.kind
  var content;
  
  if(kind == "t1") {
    content = data.body
  } else if(kind == "t3") {
    content = data.selftext 
  }
  
  return content
}

//
function get_link(id) {
  var name = get_name(id)
  var json = get_info(name)
  var data = json.data
  var link = data.permalink
  
  return link
}

//
function get_id(name) {
  var id = name.match(/t\d_(\w*)/)[1]
  
  return id
}
  
//
function get_name(id) {
  if(id.length == 6) {
    var name = "t3_"+id
  } else if(id.length == 7) {
    var name = "t1_"+id    
  }

  return name  
}

// 
function get_kind(name) {
  var re = /(t\d)_\w*/
  var match = name.match(re)[1]  

  return match  
}

//
function add_goodpost(saved) {
  var current_page = get_page(saved.catalog)
  
  if(current_page.length < 2) {
    return code.ADDPOST_EMPTY
  }
  
  var isinpage = check_idinpage(current_page, saved.id)

  if(isinpage) {
    unsave_thing(saved.name)
    return code.ADDPOST_ALREADY
  }
 
  var body = get_escaped_body(current_page)
  var title = get_escaped_title(saved.title)
  var link = get_link(saved.id)
  var new_page = get_updatedpage(body, title, link)      
  
  update_wiki(saved.catalog, new_page)
  
  var updated_page = get_page(saved.catalog)
  var isinpage = check_idinpage(updated_page, saved.id)
  if(isinpage) {
    unsave_thing(saved.name)
    return code.ADDPOST_ADDED
  } else {
    return code.ADDPOST_NOT
  }
}

//
function get_saved() {
  var reads = get_saved_children()
  var objs = get_objects(reads)

  return objs  
}

//
function get_objects(reads) {
  var objs = []    
  
  for(var i in reads) {
    var data = reads[i].data
    var kind_read = reads[i].kind
    var age = get_age(data.created_utc)

    var kind = get_kind(data.name)
   
    if(kind == "t1") {
      var parent_name = data.parent_id // name
      var parent = get_parent(parent_name)
      var flair = parent.link_flair_text
      var title = get_escaped_title(data.link_title + "(回覆)")
    } else if(kind == "t3") {
      var flair = data.link_flair_text // t3 only
      var title = get_escaped_title(data.title)
    }
    
    var id = data.id    
    var name = data.name
    var subreddit = data.subreddit
    var permalink = data.permalink
    
    if(subreddit != SUBREDDIT) {
      continue  
    }
    
    var r = check_values(title, flair, age, id, name, permalink)
    if(r == false) {
      continue
    }
    
    var obj = {
      title:title,
      flair:flair,
      id:id,
      name:name,
      permalink:permalink,
      age:age
    }
    
    objs.push(obj)
  }
  
  return objs  
}

//
function update_wiki(page, content) {
  var api_path = api.wiki_edit_f(SUBREDDIT)
  var payload = {
    "page":page,
    "content":content
  }
  var reads = rddt_http(api_path, payload)  
}

//
function unsave_thing(name) {
  var api_path = api.unsave
  var payload = {
    "id":name
  }
  var reads = rddt_http(api_path, payload)    
}

//
function check_idinpage(page, id) {
  var ids = get_ids_fr_page(page)

  for(var i in ids) {
    if(ids[i] == id) {
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
function get_author(name) {
  var data = get_info(name).data
  var author = data.author
  
  return author  
}

//
function del_thing(name) {
  var author = get_author(name)
  if(author != credential.username) {
    return false  
  }
     
  var api_path = api.del
  var payload = {
    "id":name
  }
  var reads = rddt_http(api_path, payload)
  return true    
}

function editusertext(id, text) {
  var api_path = api.del
  var payload = {
    "text":text,
    "thing_id":id
  }
  var reads = rddt_http(api_path, payload)    
}

// only get t3 things
function get_upvoted() {
  var reads = get_upvoted_children()
  var objs = get_objects(reads)
  
  return objs
}

//
function up_vote(obj) {
  vote_thing(obj, "1")  
}

//
function down_vote(obj) {
  vote_thing(obj, "-1")  
}

//
function clean_vote(obj) {
  vote_thing(obj, "0")  
}

//
function vote_thing(obj, dir) {
  if(obj.age > ARCHIVED_AGE) {
    return false
  }
  
  var api_path = api.vote  
  var payload = {
    "id":obj.name,
    "dir":dir
  }
  var reads = rddt_http(api_path, payload)    
  return true //?
}