var test_quotes = [
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


var reply_quotes = [
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


function post_to_secret_sr() {
  var username = get_random(voter_obj.voter)
  var quote = get_random_quote()
  var text = quote.quote 
  var author = quote.author
  var title = Utilities.formatString("\"%s\" - %s", text, author)
  
  var r = post_to_sr(SECRET_SR, title, "", username)
  
  console.log("%s:%s:%s:%s", title, text, username, r.json.data.url)
//  console.log(r)

  return r  
}


function post_to_test() {
  var username = get_random(voter_obj.voter)
  var title = get_random(test_quotes)
  var text = get_random(test_quotes)
  
  var sr = "test"
  var r = post_to_sr(sr, title, text, username)
  
  console.log("%s:%s:%s:%s", title, text, username, r.json.data.url)
//  console.log("%s", r)
  
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


function get_random_quote() {
  var url = "https://talaikis.com/api/quotes/random/"

  var response = JSON.parse(httpretry(url))

  return response  
}


function get_any_name(creds) {
  var sr = SECRET_SR
  var api_path = api.comments_sr_oauth_f(sr)
  var reads = rddt_http(api_path, undefined, 25, creds)
  
  var names = get_names_fr_obj(reads)
  var name = get_random(names)
  
  return name
  
}

function reply_any() {
  var username = get_random(voter_obj.voter) 
  var creds = get_voter_creds(username)
  var name = get_any_name(creds)
  var text = get_random(reply_quotes)
  
  var payload = {
    "thing_id":name,
    "text":text
  }
  
  var api_path = api.comment
  var reads = rddt_http(api_path, payload, undefined, creds)  
  
  Logger.log(reads)
}


function upvote_any() {  
  var username = get_random(voter_obj.voter) 
  var creds = get_voter_creds(username)
  
  var name = get_any_name()  
  var obj = get_info(name, creds).data
  
  var likes = obj.likes
  
  if(likes == true) {
    console.log("skipped vote:%s:%s:%s:%s", obj.title, obj.like, obj.name, username)    
    return  
  }
  
  var payload = {
    "id":name,
    "dir":"1"
  }
  
  console.log("vote up:%s:%s:%s:%s", obj.title, obj.likes, obj.name, username)    
  // push voter back to voter queue while http call fails?
  var api_path = api.vote 
  var reads = rddt_http(api_path, payload, undefined, creds)
}