1).
https://www.sap.com/developer/tutorials/webide-github-merge-pull-request.html
create basic file structure

2).
npm install bcrypt --save
npm install body-parser --save
npm install express --save
npm install jws --save
npm install mongoose --save

3).
added front end
landing.html
stockTracker.html
landing.css
stockTracker.css
normalize.css

4).
https://www.npmjs.com/package/dotenv
installed dotenv.
when need hide variable that this web site need such as access token and should not upload to github,
we will use heroku enviornment variable tool to store our hiden variable.
we then add those hidden variables to gitignore file, so not to upload them.

5).
app.js boilerplate
server.js boilerplate (with landing page html endpoint)

6).
added layout style for stockTracker.html

extra
toggle button for buy/sell
http://jsfiddle.net/sumw4/13/

git tutorial
// as a team member work on 1 branch as a collaborater,
// initialy create a project repo on github, each member will clone to their own local branch,
// after is ready to upload, check if I am behind master, then I pull from master, else upload to own branch first, pull request master branch
1). create a github remote repo
2). on github create 2 branches
3). clone the master to local
4). create local branch to match the name of remote branch, and work on that branch
5). do something
6). from my local branch, add, commit, 
6.1). fetch origin master / go to github to see if behind, to check if master more up to date me me
6.2). pull origin master
6.3). push to origin my branch name
7). go to github, click to crate pull request, click merge 2 times
8). back to terminal, swithch to local mater branch
9). pull origin master
10). swithc to my local branch
11). fetch origin master
12). pull origin master
13). push origin YI
