var test_words = [
  "test now", 
  "test go go", 
  "how is your test?",
  "another test",
  "file a test",
  "test a test",
  "how's the test",
  "how's your test?",
  "good test!!!!????",
  "go go tester",
  "this is a test",
  "text test",
  "the other test",
  "good tester",
  "hi hi tester",
  "how are you???",
  "do you see the test?"]


var reply_words = [
  "bravo",
  "congratulations",
  "good for you",
  "good job",
  "good on you",
  "hooray hurrah",
  "way to go",
  "well done",
  "great job",
  "awesome",
  "awesome work",
  "fine job",
  "good work",
  "great work",
  "keep it up",
  "nice job",
  "nice work",
  "perfect",
  "right on",
  "indeed!",
  "attaboy"]


function post_to_quotes() {
  post_quotes("quotes")
}


function post_to_secret_sr() {
  post_quotes(SECRET_SR)
}


function post_quotes(sr) {
  var username = get_random(voter_obj.voter)
  var quote = get_random_quote()
  var text = quote.quote 
  var author = quote.author
  var title = Utilities.formatString("\"%s\" - %s", text, author)
  
  var r = post_to_sr(sr, title, "", username)
  
  console.log(r)
  console.log("post_quotes():%s:%s:%s:%s:%s", sr, title, text, username, r.json.data.url)

  return r  
}


function post_to_test() {
  var username = get_random(voter_obj.voter)
  var title = get_random(test_words)
  var text = get_random(test_words)
  
  var sr = "test"
  var r = post_to_sr(sr, title, text, username)
  
  console.log("%s", r)
  console.log("%s:%s:%s:%s", title, text, username, r.json.data.url)
  
  return url
}


function post_to_sr(sr, title, text, username) {
  var api_path = api.submit
  
  var payload = {
    "sr":sr,
    "title":title,
    "text":text,
    "api_type":"json",
    "kind":"self"
  }
  var creds = get_voter_creds(username)
  var reads = rddt_http(api_path, payload, undefined, creds)
 
  return reads
}


function get_quote_talaikis() {
  var url = "https://talaikis.com/api/quotes/random/"

  var response = JSON.parse(httpretry(url))

  return response  
}


function get_quote_andruxnet() {
  var url = "https://andruxnet-random-famous-quotes.p.mashape.com/?count=1"
  
  var key = "hOr6Cu18FwmshduhpHAIjxJRV5hxp13jxITjsn5OXVINNEpBAy"
  
  var headers = {
    "X-Mashape-Key":key,
    "Accept":"application/json"    
  }

  var options = {
    "headers":headers,
    "muteHttpExceptions":false
  }      
  
  var response = JSON.parse(httpretry(url, options))[0]

  return response
}


function get_random_quote() {
  var choice = NOW % 2
  
  if(choice == 0) {
    var result = get_quote_talaikis()
  } else {
    var result = get_quote_andruxnet()
  }
  
  return result
}


function reply_any() {
  var username = get_random(voter_obj.voter) 
  var creds = get_voter_creds(username)
  var name = get_any_thing(creds)
  var text = get_random(reply_words)
  
  var payload = {
    "api_type":"json",
    "thing_id":name,
    "text":text
  }
  
  var api_path = api.comment
  var reads = rddt_http(api_path, payload, undefined, creds)  
  var data = reads.json.data.things[0].data
  var permalink = data.permalink
  
  console.log("reply_any():%s:%s:%s", username, text, permalink)
}


function upvote_any() {  
  var username = get_random(voter_obj.voter) 
  var creds = get_voter_creds(username)
  var name = get_any_thing(creds)
  var obj = get_info(name, creds)
  var data = obj.data
  
  var likes = data.likes
  
  if(obj.kind == "t1") {
    var parent = get_parent_oauth(name, creds)
    var title = parent.title.slice(0,15)
  } else {
    var title = data.title.slice(0,15)
  }
  
  if(likes == true) {
    console.log("upvote_any() skipped:%s:%s:%s:%s", title, data.like, data.name, username)    
    return  
  }
  
  var payload = {
    "id":name,
    "dir":"1"
  }
  
  console.log("upvote_any():%s:%s:%s:%s", title, data.likes, data.name, username)    
  // push voter back to voter queue while http call fails?
  var api_path = api.vote 
  var reads = rddt_http(api_path, payload, undefined, creds)
}


function get_secret_comments(creds) {
  var sr = SECRET_SR
  var reads = get_comments_oauth(25, sr, creds)

  return reads  
}


function get_any_comment(creds) {
  var reads = get_secret_comments(creds)
  var names = get_names_fr_obj(reads)
  var name = get_random(names)
  
  return name
}


function get_any_thing(creds) {
  var names = get_secret_thing(creds)
  var name = get_random(names)
  
  return name
}


function get_secret_thing(creds) {
  var sr = SECRET_SR
  var reads = get_comments_oauth(25, sr, creds)
  var t3_names = get_names_fr_obj(reads)

  var names = []
  
  for(var i in t3_names) {
    var t3_name = t3_names[i]
    names.push(t3_name)
    
    var parent = get_parent_full_oauth(t3_name, creds)
    var childs = get_t1_children(parent)

    for(var i2 in childs) {
      var name = childs[i2].data.name
      names.push(name)
    }
  }
   
  return names
}


function get_current_karmas() {
  var users = voter_obj.voter
  var karmas = []

  for(var i in users) {
    var about = get_user_about(users[i])
    var karma = about.data.link_karma
    karmas.push(karma)
  }
  
  return karmas
}


function get_karmas_delta(current_karmas) {
  var saved_karmas = get_saved_karma()
  var deltas = []
  
  for(var i in current_karmas) {
      var delta = current_karmas[i] - saved_karmas[i]
      deltas.push(delta)
  }
  
  return deltas
}


function update_karmas() {
  var current_karmas = get_current_karmas()
  var deltas = get_karmas_delta(current_karmas)
  set_saved_karma(current_karmas)
  
  var msg = ""
  
  for(var i in voter_obj.voter) {
    var msg = msg + voter_obj.voter[i] + "(" + current_karmas[i] + ")" + ":" + deltas[i] + ","
  }                        
                         
  console.log("karma delta:%s", msg)
  
  return deltas
}