// generate page, either as Text or Rectangle
function generatePageWithName(name, layerType, hexColor)
{
  var swatchPage = doc.addBlankPage();
  swatchPage.name = name;
  [doc setCurrentPage:doc.pages[0]];
  [doc setCurrentPage:swatchPage];

  var chipSize = 120;
  var padding = 20;

  var hasColor = hexColor.length > 0
  var isRectangle = layerType == 'rectangle'

  if (hasColor)
  {    
    var color = [[MSColor alloc] init];

    log(hexToRgb(hexColor).r + ' ' + hexColor)

    [color setRed:hexToRgb(hexColor).r];
    [color setGreen:hexToRgb(hexColor).g];
    [color setBlue:hexToRgb(hexColor).b];
    [color setAlpha:1];
  }

  for (var a = 0; a < 7; a++)
  {
    for (var b = 0; b < 7; b++)
    {

      var x = b * (chipSize + padding);
      var y = a * (chipSize * 0.5 + padding);
      
      var block = swatchPage.addLayerOfType(layerType)    

      if (isRectangle) 
      {
        block = block.embedInShapeGroup()          
      }          
      
      block.frame().x = x
      block.frame().y = y
      block.frame().width = chipSize
      block.frame().height = chipSize * 0.5
      block.setName("please rename")    
      if (hasColor)
      {
        var colorBlockFill = block.style().fills().addNewStylePart()
        colorBlockFill.color = color
      }                  
    }
  }
}


function getDocumentPath()
{

  var fileUrl = doc.fileURL();
  var filePath = fileUrl.path();

  var targetFolder = filePath.split(doc.displayName())[0];
  log ("Document Path = " + targetFolder);

  return targetFolder;

}

function saveFile(filename, content)
{
    var path = [@"" stringByAppendingString:filename];
    var str = [@"" stringByAppendingString:content];

    if (in_sandbox()) {
        sandboxAccess.accessFilePath_withBlock_persistPermission(getDocumentPath(), function(){
            [str writeToFile:path atomically:true encoding:NSUTF8StringEncoding error:null];
        }, true)
    } else {
        [str writeToFile:path atomically:true encoding:NSUTF8StringEncoding error:null];
    }
}

function makeNiceName(str)
{
    var result;

    // make title case
    result = str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1);});

    // strip spaces from layer names
    result = result.replace(/ /g,'');

    // get rid of special characters
    result = result.replace(/[^\w\s]/gi, '');

    return result;
}

function getSwatchLayers()
{
  var pages = [doc pages];

  var swatchPage;

  for (var i=0; i < [pages count]; i++)
  {
    if (pages[i].name() == "Color Swatch")
    {
      swatchPage = pages[i];
      break;
    }
  }

  return [swatchPage layers];
}

function getFontLayers()
{
  var pages = [doc pages];

  var swatchPage;

  for (var i=0; i < [pages count]; i++)
  {
    if (pages[i].name() == "Font Swatch")
    {
      swatchPage = pages[i];
      break;
    }
  }

  return [swatchPage layers];
}

/// colors
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255        
    } : null;
}

// drop down box with options

function createSelect(msg, items, selectedItemIndex)
{
  selectedItemIndex = selectedItemIndex || 0

  var accessory = [[NSComboBox alloc] initWithFrame:NSMakeRect(0,0,200,25)]
  [accessory addItemsWithObjectValues:items]
  [accessory selectItemAtIndex:selectedItemIndex]

  var alert = [[NSAlert alloc] init]
  [alert setMessageText:msg]
  [alert addButtonWithTitle:'OK']
  [alert addButtonWithTitle:'Cancel']
  [alert setAccessoryView:accessory]

  var responseCode = [alert runModal]
  var sel = [accessory indexOfSelectedItem]

  return [responseCode, sel]
}

