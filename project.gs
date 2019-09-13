var credential = {
  username:undefined,
  client_id:undefined,
  secret:undefined,
  refresh_token:undefined  
}

var credential_wikibot = undefined


var credential_voters = undefined


var SUBREDDIT;
var SECRET_SR;
var GD_FOLDER_ID;
var ACCESS_TOKEN;
var FLAIR_MAPPING;


var voter_obj = {
  name:undefined,
  dir:undefined,
  age:undefined,
  title:undefined,
  voter:[],
  need_voter:[]
} 

//function init_project(sr, secret_sr, creds_main, creds_voters, need_voter, creds_wikibot, folder_id, flair_mapping) {
function init_project(params) {
  SUBREDDIT = params.subreddit
  SECRET_SR = params.secret_sr
  
  credential = params.creds_main

  
  credential_voters = params.creds_voters
  
  credential_wikibot = params.creds_wikibot
  
  for(var i in credential_voters) {
    voter_obj.voter.push(credential_voters[i].username)
  }

  for(var i in params.need_voter) {
    voter_obj.need_voter.push(params.need_voter[i].username)
  }
  
  GD_FOLDER_ID = params.folder_id
  FLAIR_MAPPING = params.flair_mapping
}


function check_init() {
  if(
    (SUBREDDIT == undefined) || 
    (SECRET_SR == undefined) || 
    (credential.username == undefined) ||
    (credential.client_id == undefined) ||
    (credential.secret == undefined) ||
    (credential.refresh_token == undefined) ||
    (credential_voters == undefined) ||  
    (FLAIR_MAPPING == undefined) ||
    (GD_FOLDER_ID == undefined)
    ){
    var msg = "redditlib.init_project() failed, call init_project()."
    throw msg  
  }  
}