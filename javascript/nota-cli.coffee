_       = require 'underscore'
fs      = require 'fs'
argv    = require('optimist').argv

template = argv.template
# A template name must have been provided, unless we're just gonna list them
unless template? or argv.list?
  console.log "No template selected. Use --template 'name' for this."
  return

templateDirs = fs.readdirSync('templates')
templateDirs = _.filter templateDirs, (dir)-> fs.statSync('templates/'+dir).isDirectory()

templates = {}
for dir in templateDirs
  if not fs.existsSync("templates/"+dir+"/template.html")
    console.log "Template directory has no mandatory 'template.html' file"
    continue 
  definitionFile = fs.existsSync("templates/"+dir+"/javascript/define-template.json")
  if not definitionFile
    console.log "Template without definition found: #{dir} (omitting)"
    continue
  t = JSON.parse fs.readFileSync 'templates/'+dir+'/javascript/define-template.json'
  t.dir = dir
  templates[t.name] = t

if argv.list?
  console.log tenplateName for tenplateName in _.keys templates
  return

unless templates[template]?
  console.error "Selected template doesn't exist"
  return

# Beyond this point we got our template
template = templates[template]

previewJSON = if template.previewJSON.slice(0,5) is "text!" then template.previewJSON.slice 5
JSONpath = argv.json || "templates/#{template.dir}/javascript/#{previewJSON}"
model = JSON.parse fs.readFileSync(JSONpath, encoding: 'utf8')

templateHTML = "templates/#{template.dir}/template.html"

argumentedFilename = argv.output
defaultFilename = 'invoice.pdf'