fs = require 'fs'
Nota = {}
Nota.phantom = require 'phantom'
Nota.state = 'loading:phantom'
Nota.init = -> 
  phantom.create (phantomInstance) ->
    Nota.phantomInstance = phantomInstance
    phantomInstance.createPage (page) ->
      Nota.phantomPage = page
      if error?
        console.error "Unable to start PhantomJS instance: #{error}"
        phantomInstance.exit()
      page.set 'paperSize',
        format: 'A4'
        orientation: 'portrait'
        border: '0cm'
      page.set 'onConsoleMessage', Nota.consoleLog
      page.set 'onError',          Nota.consoleError
      page.set 'onCallback', Nota.clientCallbackHandler
      Nota.state = "ready:empty"

Nota.consoleLog = (msg)-> console.log   msg
Nota.consoleError = (msg)-> console.error msg

Nota.clientCallbackHandler = (call)->
  switch call
    when 'nota:ready'
      console.log "Nota client finished booting"
      console.log "Calling client with new document model to render"
      page.evaluate ( (model)-> @Nota.update model ), (->), model
    when 'nota:updated'
      console.log "Nota client finished rendering new data to DOM"
      # Check if the client presents a preferred filename
      page.evaluate ( -> @Nota.view.filesystemName?() ), phantomRenderPDF

# A callback for when PhantomJS went through DOM init (hopefully post-DOM-ready event)
# This will start rendering
Nota.pageLoadedCallback = (status)->
  if status is 'success'
    console.log "Document template loaded, waiting for Nota client to finish booting"
    # We sit idle ... Nota will call back up to us when it is ready booting
    Nota.state = "ready:template:html"
  else
    console.error "Unable to load HMTL: #{status}"
    phantomInstance.exit()


# A callback that will do the actual export to .PDF if everything went OK
Nota.phantomRenderPDF = (proposedFilename)-> 
  usefulFilename = proposedFilename? and proposedFilename.length > 0
  
  # Now we can decide which filename we shall use
  outputFilename = defaultFilename # By defauly we go for this one
  if usefulFilename # But if the template proposed something useful use that
    outputFilename = proposedFilename
  if argv.output? # But always override it if a filename was specified in the arguments
    outputFilename = argumentedFilename

  console.log "Nota server started .PDF generation job"
  page.render outputFilename, ->
    console.log "Nota server finished rendering .PDF, exiting PhantomJS thread"
    phantomInstance.exit()
    if fs.existsSync(outputFilename)
      console.log "Nota server verified the writing of file:"
      console.log "\t#{outputFilename}"
      console.log "Nota server thread will now exit"
    else
      console.error "Nota expected the output file to be found now. Something went wrong!"

  # templateFile: path to the template .html file
  # templateObj: contents of the associated define-template.json file
  # Latter is optional but recommended
  Nota.render = (templateFile, templateDefinition)
    unless _.str.startsWith Nota.state, 'ready'
     throw new Exception "Nota PDF daemon is not ready (state: #{Nota.state})"

    Nota.state = "loading:template"
    Nota.currentTemplate = templateDefinition
    # The one call that sets everything in motion
    page.open templateHTML, Nota.pageLoadedCallback
Nota